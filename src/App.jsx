import React, { useEffect, useCallback, useState } from 'react'
import { useStore } from './store/useStore' // This path is for App component
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import Element from './components/Element'
import PropertiesPanel from './components/PropertiesPanel'

const Slide = ({ slide }) => {
  const addElement = useStore(state => state.addElement)
  const selectedElement = useStore(state => state.selectedElement)
  const setSelectedElement = useStore(state => state.setSelectedElement)

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const type = file.type.startsWith('video') ? 'video' : 'image'
        addElement(slide.id, type, reader.result)
      }
      reader.readAsDataURL(file)
    })
  }, [slide.id, addElement])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true
  })

  return (
    <div
      {...getRootProps()}
      className="absolute bg-white shadow-lg overflow-hidden border border-gray-200"
      style={{
        width: '100vw',
        height: '100vh',
        left: `${slide.x * 100}vw`,
        top: `${slide.y * 100}vh`,
      }}
      onClick={(e) => {
        e.stopPropagation()
        // Don't deselect here, handled by parent or specific element clicks
      }}
    >
      <input {...getInputProps()} />

      <div className="absolute top-4 left-4 text-gray-400 font-mono z-50 pointer-events-none">
        {slide.x}, {slide.y}
      </div>

      {isDragActive && (
        <div className="absolute inset-0 bg-blue-500/20 z-50 flex items-center justify-center border-4 border-blue-500 border-dashed m-4 rounded-xl">
          <div className="text-blue-600 font-bold text-2xl">Drop media here</div>
        </div>
      )}

      {slide.elements.map(el => (
        <React.Fragment key={el.id}>
          <Element
            element={el}
            slideId={slide.id}
            isSelected={selectedElement?.id === el.id}
            onSelect={(id) => setSelectedElement({ id, slideId: slide.id })}
          />
        </React.Fragment>
      ))}

      {slide.elements.length === 0 && !isDragActive && (
        <div className="flex items-center justify-center h-full text-4xl font-bold text-gray-200 select-none pointer-events-none">
          Slide {slide.x}, {slide.y}
        </div>
      )}
    </div>
  )
}

function App() {
  const {
    slides,
    camera,
    moveCamera,
    currentSlideId,
    setCurrentSlide,
    addSlide,
    addElement, // Added
    selectedElement,
    setSelectedElement
  } = useStore()

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const currentSlide = slides.find(s => s.id === currentSlideId)
      if (!currentSlide) return

      let nextX = currentSlide.x
      let nextY = currentSlide.y

      switch (e.key) {
        case 'ArrowRight': nextX++; break;
        case 'ArrowLeft': nextX--; break;
        case 'ArrowDown': nextY++; break;
        case 'ArrowUp': nextY--; break;
        default: return;
      }

      const nextSlide = slides.find(s => s.x === nextX && s.y === nextY)
      if (nextSlide) {
        setCurrentSlide(nextSlide.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slides, currentSlideId, setCurrentSlide])

  const handleAddSlide = (direction) => {
    const currentSlide = slides.find(s => s.id === currentSlideId)
    if (!currentSlide) return

    let nextX = currentSlide.x
    let nextY = currentSlide.y

    if (direction === 'horizontal') {
      nextX++
      while (slides.find(s => s.x === nextX && s.y === nextY)) {
        nextX++
      }
    } else {
      nextY++
      while (slides.find(s => s.x === nextX && s.y === nextY)) {
        nextY++
      }
    }

    addSlide(nextX, nextY)

    const newSlideId = `slide-${nextX}-${nextY}`
    setTimeout(() => {
      setCurrentSlide(newSlideId)
    }, 0)
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-900 text-white relative">
      {/* Viewport / Camera */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        animate={{
          x: `-${camera.x}vw`,
          y: `-${camera.y}vh`
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={() => setSelectedElement(null)} // Deselect on background click
      >
        {slides.map(slide => (
          <Slide key={slide.id} slide={slide} />
        ))}
      </motion.div>

      {/* Global Properties Panel */}
      {selectedElement && (
        <PropertiesPanel
          elementId={selectedElement.id}
          slideId={selectedElement.slideId}
          onClose={() => setSelectedElement(null)}
        />
      )}

      {/* UI Overlay */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex gap-4 items-center z-[9999]">
        <button
          onClick={() => handleAddSlide('horizontal')}
          className="hover:text-primary transition-colors font-semibold flex items-center gap-2"
        >
          Add Slide <span className="text-xs bg-white/10 px-1 rounded">→</span>
        </button>
        <div className="w-px h-4 bg-white/20"></div>
        <button
          onClick={() => handleAddSlide('vertical')}
          className="hover:text-primary transition-colors font-semibold flex items-center gap-2"
        >
          Add Slide <span className="text-xs bg-white/10 px-1 rounded">↓</span>
        </button>
        <div className="w-px h-4 bg-white/20"></div>
        <button
          onClick={() => addElement(currentSlideId, 'text', 'Double click to edit')}
          className="hover:text-primary transition-colors font-semibold flex items-center gap-2"
        >
          Add Text <span className="text-xs bg-white/10 px-1 rounded">T</span>
        </button>
        <div className="w-px h-4 bg-white/20"></div>
        <div className="text-sm opacity-70">Use Arrow Keys to Navigate</div>
      </div>
    </div>
  )
}

export default App
