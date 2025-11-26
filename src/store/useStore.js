import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export const useStore = create((set, get) => ({
    slides: [
        { id: 'slide-0-0', x: 0, y: 0, elements: [] },
        { id: 'slide-1-0', x: 1, y: 0, elements: [] },
        { id: 'slide-2-0', x: 2, y: 0, elements: [] },
    ],
    currentSlideId: 'slide-0-0',
    camera: { x: 0, y: 0 },
    selectedElement: null, // { id, slideId }

    // Actions
    setSelectedElement: (element) => set({ selectedElement: element }),
    addSlide: (x, y) => set((state) => {
        const exists = state.slides.find(s => s.x === x && s.y === y)
        if (exists) return {}
        return {
            slides: [...state.slides, { id: `slide-${x}-${y}`, x, y, elements: [] }]
        }
    }),

    setCurrentSlide: (id) => set((state) => {
        const slide = state.slides.find(s => s.id === id)
        if (!slide) return {}
        return {
            currentSlideId: id,
            camera: { x: slide.x * 100, y: slide.y * 100 } // Assuming 100vw/100vh units
        }
    }),

    moveCamera: (x, y) => set({ camera: { x, y } }),

    addElement: (slideId, type, content, styles = {}) => set((state) => ({
        slides: state.slides.map(slide => {
            if (slide.id !== slideId) return slide
            return {
                ...slide,
                elements: [...slide.elements, {
                    id: uuidv4(),
                    type,
                    content,
                    x: 100, // Default position relative to slide
                    y: 100,
                    width: 300,
                    height: 200,
                    rotation: 0,
                    ...styles
                }]
            }
        })
    })),

    updateElement: (slideId, elementId, updates) => set((state) => ({
        slides: state.slides.map(slide => {
            if (slide.id !== slideId) return slide
            return {
                ...slide,
                elements: slide.elements.map(el => {
                    if (el.id !== elementId) return el
                    return { ...el, ...updates }
                })
            }
        })
    })),

    removeElement: (slideId, elementId) => set((state) => ({
        slides: state.slides.map(slide => {
            if (slide.id !== slideId) return slide
            return {
                ...slide,
                elements: slide.elements.filter(el => el.id !== elementId)
            }
        })
    })),
}))
