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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleChange('isBackground', !element.isBackground)}
                        className={`p-1 rounded ${element.isBackground ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                        title="Make Background"
                    >
                        <Layers size={16} />
                    </button>
                    <button
                        onClick={() => removeElement(slideId, elementId)}
                        className="text-red-400 hover:text-red-300"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
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

                {/* Text Specific */}
                {element.type === 'text' && (
                    <div className="border-t border-white/10 pt-4 mt-4 space-y-4">
                        <h4 className="text-xs font-semibold text-blue-400">Text Style</h4>

                        {/* Font Family */}
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Font Family</label>
                            <select
                                value={element.fontFamily ?? 'Inter, sans-serif'}
                                onChange={(e) => handleChange('fontFamily', e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-blue-500"
                            >
                                <option value="Inter, sans-serif">Inter</option>
                                <option value="Arial, sans-serif">Arial</option>
                                <option value="'Times New Roman', serif">Times New Roman</option>
                                <option value="'Courier New', monospace">Courier New</option>
                                <option value="Georgia, serif">Georgia</option>
                                <option value="Verdana, sans-serif">Verdana</option>
                                <option value="Impact, sans-serif">Impact</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Custom Font Name..."
                                className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 mt-1"
                                onBlur={(e) => e.target.value && handleChange('fontFamily', e.target.value)}
                            />
                        </div>

                        {/* Size & Color */}
                        <div className="flex gap-2">
                            <div className="w-1/2 space-y-1">
                                <label className="text-xs text-gray-400">Size</label>
                                <input
                                    type="number"
                                    value={element.fontSize ?? 24}
                                    onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm"
                                />
                            </div>
                            <div className="w-1/2 space-y-1">
                                <label className="text-xs text-gray-400">Color</label>
                                <input
                                    type="color"
                                    value={element.color ?? '#ffffff'}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    className="w-full h-7 bg-transparent cursor-pointer rounded"
                                />
                            </div>
                        </div>

                        {/* Formatting (B, I, U, S) */}
                        <div className="flex justify-between bg-black/30 rounded p-1">
                            <button
                                onClick={() => handleChange('fontWeight', element.fontWeight === 'bold' ? 'normal' : 'bold')}
                                className={`p-1 rounded hover:bg-white/10 ${element.fontWeight === 'bold' ? 'text-blue-400' : 'text-gray-400'}`}
                            >
                                <span className="font-bold">B</span>
                            </button>
                            <button
                                onClick={() => handleChange('fontStyle', element.fontStyle === 'italic' ? 'normal' : 'italic')}
                                className={`p-1 rounded hover:bg-white/10 ${element.fontStyle === 'italic' ? 'text-blue-400' : 'text-gray-400'}`}
                            >
                                <span className="italic">I</span>
                            </button>
                            <button
                                onClick={() => handleChange('textDecoration', element.textDecoration?.includes('underline') ? element.textDecoration.replace('underline', '').trim() : (element.textDecoration ? element.textDecoration + ' underline' : 'underline'))}
                                className={`p-1 rounded hover:bg-white/10 ${element.textDecoration?.includes('underline') ? 'text-blue-400' : 'text-gray-400'}`}
                            >
                                <span className="underline">U</span>
                            </button>
                            <button
                                onClick={() => handleChange('textDecoration', element.textDecoration?.includes('line-through') ? element.textDecoration.replace('line-through', '').trim() : (element.textDecoration ? element.textDecoration + ' line-through' : 'line-through'))}
                                className={`p-1 rounded hover:bg-white/10 ${element.textDecoration?.includes('line-through') ? 'text-blue-400' : 'text-gray-400'}`}
                            >
                                <span className="line-through">S</span>
                            </button>
                        </div>

                        {/* Alignment */}
                        <div className="flex justify-between bg-black/30 rounded p-1">
                            {['left', 'center', 'right', 'justify'].map(align => (
                                <button
                                    key={align}
                                    onClick={() => handleChange('textAlign', align)}
                                    className={`p-1 rounded hover:bg-white/10 capitalize text-xs ${element.textAlign === align ? 'text-blue-400' : 'text-gray-400'}`}
                                >
                                    {align}
                                </button>
                            ))}
                        </div>

                        {/* Spacing */}
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 flex justify-between">
                                    <span>Letter Spacing</span>
                                    <span>{element.letterSpacing ?? 0}px</span>
                                </label>
                                <input
                                    type="range" min="-2" max="10" step="0.5"
                                    value={element.letterSpacing ?? 0}
                                    onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
                                    className="w-full accent-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 flex justify-between">
                                    <span>Line Height</span>
                                    <span>{element.lineHeight ?? 1.5}</span>
                                </label>
                                <input
                                    type="range" min="0.8" max="3" step="0.1"
                                    value={element.lineHeight ?? 1.5}
                                    onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                                    className="w-full accent-blue-500"
                                />
                            </div>
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
