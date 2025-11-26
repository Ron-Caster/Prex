import React, { useRef, useState } from 'react'
import Moveable from 'react-moveable'
import { useStore } from '../store/useStore'

const Element = ({ element, slideId, isSelected, onSelect }) => {
    const targetRef = useRef(null)
    const updateElement = useStore(state => state.updateElement)

    const handleDrag = ({ target, transform }) => {
        target.style.transform = transform
    }

    const handleDragEnd = ({ target }) => {
        // Parse transform to update store (simplified for now, ideally parse matrix)
        // For this prototype, we rely on visual update via style, but we should sync back to store
        // syncing back x/y/rotation is complex with matrix, so we might just store the transform string
        // or use a helper to extract values.
        // For now, let's just keep it visual for performance and sync on specific actions if needed.
    }

    const handleResize = ({ target, width, height, drag }) => {
        target.style.width = `${width}px`
        target.style.height = `${height}px`
        target.style.transform = drag.transform
    }

    return (
        <>
            <div
                ref={targetRef}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelect(element.id)
                }}
                className="absolute cursor-pointer overflow-hidden" // Added overflow-hidden for cropping
                style={{
                    left: 0,
                    top: 0,
                    width: element.isBackground ? '100%' : element.width,
                    height: element.isBackground ? '100%' : element.height,
                    transform: element.isBackground ? 'none' : `translate(${element.x}px, ${element.y}px) rotate(${element.rotation}deg)`,
                    zIndex: element.isBackground ? 0 : (isSelected ? 100 : (element.zIndex ?? 1)),
                    opacity: element.opacity ?? 1,
                    border: isSelected ? '1px solid #3b82f6' : 'none' // Visual indicator
                }}
            >
                {element.type === 'text' && (
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => updateElement(slideId, element.id, { content: e.target.innerText })}
                        className="w-full h-full outline-none"
                        style={{
                            fontSize: `${element.fontSize ?? 24}px`,
                            fontFamily: element.fontFamily ?? 'Inter, sans-serif',
                            fontWeight: element.fontWeight ?? 'normal',
                            fontStyle: element.fontStyle ?? 'normal',
                            textDecoration: element.textDecoration ?? 'none',
                            textAlign: element.textAlign ?? 'left',
                            color: element.color ?? '#ffffff',
                            letterSpacing: `${element.letterSpacing ?? 0}px`,
                            lineHeight: element.lineHeight ?? 1.5,
                            cursor: 'text'
                        }}
                    >
                        {element.content}
                    </div>
                )}
                {element.type === 'image' && (
                    <img
                        src={element.content}
                        alt="slide-element"
                        className="w-full h-full object-cover pointer-events-none"
                        style={{
                            // Apply crop to both object-position (for base fit) and transform-origin (for zoom pan)
                            objectPosition: `${element.cropX ?? 50}% ${element.cropY ?? 50}%`,
                            transformOrigin: `${element.cropX ?? 50}% ${element.cropY ?? 50}%`,
                            transform: `scale(${element.zoom ?? 1})`
                        }}
                    />
                )}
                {element.type === 'video' && (
                    <video
                        src={element.content}
                        className="w-full h-full object-cover pointer-events-none"
                        controls={false}
                        autoPlay
                        loop={element.loop ?? true}
                        muted={element.muted ?? true}
                        onTimeUpdate={(e) => {
                            const video = e.target
                            const start = element.startTime ?? 0
                            const end = element.endTime ?? video.duration

                            if (video.currentTime < start) {
                                video.currentTime = start
                            }

                            if (video.currentTime > end) {
                                video.currentTime = start
                            }
                        }}
                        onLoadedMetadata={(e) => {
                            // Optionally save duration to store if needed, 
                            // but for now we just use it for the max range in UI
                        }}
                    />
                )}
            </div>

            {isSelected && !element.isBackground && (
                <Moveable
                    target={targetRef.current}
                    draggable={true}
                    resizable={true}
                    rotatable={true}
                    keepRatio={true}
                    throttleDrag={0}
                    onDrag={handleDrag}
                    onResize={handleResize}
                    onRotate={({ target, transform }) => {
                        target.style.transform = transform
                    }}
                    // Sync back to store on end
                    onDragEnd={({ lastEvent }) => {
                        if (lastEvent) {
                            const [x, y] = lastEvent.translate
                            updateElement(slideId, element.id, { x, y })
                        }
                    }}
                    onResizeEnd={({ lastEvent }) => {
                        if (lastEvent) {
                            const { width, height, drag } = lastEvent
                            const [x, y] = drag.translate
                            updateElement(slideId, element.id, { width, height, x, y })
                        }
                    }}
                    onRotateEnd={({ lastEvent }) => {
                        if (lastEvent) {
                            const { rotate } = lastEvent
                            updateElement(slideId, element.id, { rotation: rotate })
                        }
                    }}
                />
            )}
        </>
    )
}

export default Element
