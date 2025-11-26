import React from 'react'
import { useStore } from '../store/useStore'
import { X, Layers, Trash2, Repeat, Volume2, VolumeX } from 'lucide-react'

const PropertiesPanel = ({ elementId, slideId, onClose }) => {
    const updateElement = useStore(state => state.updateElement)
    const removeElement = useStore(state => state.removeElement)
    const slides = useStore(state => state.slides)

    // Find the element safely
    const slide = slides.find(s => s.id === slideId)
    const element = slide?.elements.find(e => e.id === elementId)

    if (!element) return null

    const handleChange = (key, value) => {
        updateElement(slideId, elementId, { [key]: value })
    }

    return (
        <div className="fixed top-4 right-4 w-64 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white shadow-2xl z-[9999]">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Properties</h3>
                </div>
                <button
                    onClick={() => removeElement(slideId, elementId)}
                    className="text-red-400 hover:text-red-300"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Common Properties */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Opacity</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={element.opacity ?? 1}
                        onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Layer (Z-Index)</label>
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-gray-400" />
                        <input
                            type="number"
                            value={element.zIndex ?? 1}
                            onChange={(e) => handleChange('zIndex', parseInt(e.target.value))}
                            className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm"
                        />
                    </div>
                </div>

                {/* Image Specific: Cropping */}
                {element.type === 'image' && (
                    <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
                        <h4 className="text-xs font-semibold text-blue-400">Crop & Zoom</h4>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Zoom</label>
                            <input
                                type="range" min="1" max="5" step="0.1"
                                value={element.zoom ?? 1}
                                onChange={(e) => handleChange('zoom', parseFloat(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Position X</label>
                            <input
                                type="range" min="0" max="100"
                                value={element.cropX ?? 50}
                                onChange={(e) => handleChange('cropX', parseFloat(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Position Y</label>
                            <input
                                type="range" min="0" max="100"
                                value={element.cropY ?? 50}
                                onChange={(e) => handleChange('cropY', parseFloat(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* Video Specific */}
                {element.type === 'video' && (
                    <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
                        <h4 className="text-xs font-semibold text-blue-400">Video Controls</h4>

                        <div className="space-y-2">
                            <label className="text-xs text-gray-400">Trim (Start - End)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number" placeholder="Start"
                                    value={element.startTime ?? 0}
                                    onChange={(e) => handleChange('startTime', parseFloat(e.target.value))}
                                    className="w-1/2 bg-black/30 border border-white/10 rounded px-2 py-1 text-sm"
                                />
                                <input
                                    type="number" placeholder="End"
                                    value={element.endTime ?? ''}
                                    onChange={(e) => handleChange('endTime', parseFloat(e.target.value))}
                                    className="w-1/2 bg-black/30 border border-white/10 rounded px-2 py-1 text-sm"
                                />
                            </div>
                            <p className="text-[10px] text-gray-500">Set start/end time in seconds</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm">Loop</span>
                            <button
                                onClick={() => handleChange('loop', !element.loop)}
                                className={`p-1 rounded ${element.loop ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500'}`}
                            >
                                <Repeat size={16} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm">Muted</span>
                            <button
                                onClick={() => handleChange('muted', !element.muted)}
                                className={`p-1 rounded ${element.muted ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500'}`}
                            >
                                {element.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PropertiesPanel
