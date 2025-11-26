import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { get, set, del } from 'idb-keyval' // IndexedDB wrapper

// Custom storage object for Zustand using IndexedDB
const storage = {
    getItem: async (name) => {
        return (await get(name)) || null
    },
    setItem: async (name, value) => {
        await set(name, value)
    },
    removeItem: async (name) => {
        await del(name)
    },
}

export const useStore = create(
    persist(
        (set, get) => ({
            slides: [
                { id: 'slide-0-0', x: 0, y: 0, elements: [] },
            ],
            currentSlideId: 'slide-0-0',
            camera: { x: 0, y: 0 },
            selectedElement: null, // { id, slideId }

            isPresenting: false,
            setIsPresenting: (isPresenting) => set({ isPresenting }),

            // Actions
            setSelectedElement: (element) => set({ selectedElement: element }),
            addSlide: (x, y) => set((state) => {
                const exists = state.slides.find(s => s.x === x && s.y === y)
                if (exists) return {}
                return {
                    slides: [...state.slides, { id: `slide-${x}-${y}`, x, y, elements: [] }]
                }
            }),

            removeSlide: (id) => set((state) => {
                if (state.slides.length <= 1) return {} // Prevent deleting last slide

                const slideToRemove = state.slides.find(s => s.id === id)
                if (!slideToRemove) return {}

                const { x: delX, y: delY } = slideToRemove

                // 1. Filter out the deleted slide
                let newSlides = state.slides.filter(s => s.id !== id)

                // 2. Determine Shift Strategy
                // Check if there are slides below
                const hasSlidesBelow = newSlides.some(s => s.x === delX && s.y > delY)

                if (hasSlidesBelow) {
                    // Shift UP: All slides with same X and Y > delY move to Y - 1
                    newSlides = newSlides.map(s => {
                        if (s.x === delX && s.y > delY) {
                            const newY = s.y - 1
                            return { ...s, y: newY, id: `slide-${s.x}-${newY}` } // Update ID to match new pos
                        }
                        return s
                    })
                } else {
                    // Check if there are slides to the right (only if no slides below)
                    const hasSlidesRight = newSlides.some(s => s.y === delY && s.x > delX)
                    if (hasSlidesRight) {
                        // Shift LEFT: All slides with same Y and X > delX move to X - 1
                        newSlides = newSlides.map(s => {
                            if (s.y === delY && s.x > delX) {
                                const newX = s.x - 1
                                return { ...s, x: newX, id: `slide-${newX}-${s.y}` } // Update ID to match new pos
                            }
                            return s
                        })
                    }
                }

                // 3. Handle Navigation
                // If we deleted the current slide, we need to find where to go.
                // Ideally, we go to the slide that took the deleted slide's coordinates (delX, delY).
                // If no slide took that spot, we go to the last available slide.

                let newCurrentSlideId = state.currentSlideId
                let newCamera = state.camera

                if (state.currentSlideId === id) {
                    // Try to find a slide at the old coordinates
                    const replacementSlide = newSlides.find(s => s.x === delX && s.y === delY)

                    if (replacementSlide) {
                        newCurrentSlideId = replacementSlide.id
                        newCamera = { x: replacementSlide.x * 100, y: replacementSlide.y * 100 }
                    } else {
                        // Fallback: Go to the last slide in the list (or any safe neighbor)
                        const lastSlide = newSlides[newSlides.length - 1]
                        newCurrentSlideId = lastSlide.id
                        newCamera = { x: lastSlide.x * 100, y: lastSlide.y * 100 }
                    }
                } else {
                    // If we didn't delete the current slide, we still need to check if the current slide MOVED.
                    // The currentSlideId might refer to an ID that no longer exists because we changed IDs during shift.
                    // But wait, we changed IDs of shifted slides.
                    // If the current slide was one of the shifted ones, its ID has changed.
                    // We need to find the slide object that corresponds to the old currentSlideId (which is now gone/changed).
                    // Actually, since we regenerate IDs based on X/Y, the old ID is invalid if the slide moved.

                    // Let's find the slide that WAS at the current camera position (roughly) or track it by reference?
                    // We can't track by reference easily in this immutable update.
                    // Better approach: Find the slide that is currently at the old current slide's X/Y (if it didn't move)
                    // OR find the slide that WAS at (oldX, oldY) but moved to (newX, newY).

                    // Simplification: We know which slides moved.
                    // If currentSlide was at (cX, cY):
                    // - If we shifted UP and cX == delX && cY > delY -> New pos is (cX, cY - 1) -> New ID
                    // - If we shifted LEFT and cY == delY && cX > delX -> New pos is (cX - 1, cY) -> New ID

                    const currentSlideObj = state.slides.find(s => s.id === state.currentSlideId)
                    if (currentSlideObj) {
                        const { x: cX, y: cY } = currentSlideObj
                        let newCX = cX
                        let newCY = cY

                        if (hasSlidesBelow && cX === delX && cY > delY) {
                            newCY = cY - 1
                        } else if (!hasSlidesBelow && cY === delY && cX > delX) { // Logic matches above
                            const hasSlidesRight = state.slides.some(s => s.id !== id && s.y === delY && s.x > delX) // Re-check original state condition roughly
                            if (hasSlidesRight) newCX = cX - 1
                        }

                        newCurrentSlideId = `slide-${newCX}-${newCY}`
                        // Update camera just in case, though it shouldn't strictly move if the slide moved "under" it? 
                        // Actually if the slide moves, the camera should probably move WITH it to keep the user looking at the same content.
                        newCamera = { x: newCX * 100, y: newCY * 100 }
                    }
                }

                return {
                    slides: newSlides,
                    currentSlideId: newCurrentSlideId,
                    camera: newCamera
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
                            width: type === 'text' ? 400 : 300,
                            height: type === 'text' ? 100 : 200,
                            rotation: 0,
                            fontSize: 24,
                            fontFamily: 'Inter, sans-serif',
                            color: '#ffffff',
                            textAlign: 'left',
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

            loadProject: (projectData) => set({
                slides: projectData.slides,
                currentSlideId: projectData.currentSlideId,
                camera: projectData.camera
            }),
        }),
        {
            name: 'prex-storage', // unique name
            storage: createJSONStorage(() => storage), // Use IndexedDB
            partialize: (state) => ({
                slides: state.slides,
                currentSlideId: state.currentSlideId,
                camera: state.camera
            }), // Only persist data, not UI state like selectedElement
        }
    )
)
