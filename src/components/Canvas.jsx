import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Canvas = forwardRef(function Canvas({ 
  page, 
  flipDirection = 1,
  selectedElement, 
  activeTool,
  onSelectElement,
  onUpdateElement,
  onDeleteElement
}, ref) {
  const containerRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [resizing, setResizing] = useState(null)
  
  useImperativeHandle(ref, () => ({
    getPage: () => containerRef.current,
    exportToImage: async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 420 * 2
      canvas.height = 594 * 2
      const ctx = canvas.getContext('2d')
      ctx.scale(2, 2)
      
      ctx.fillStyle = page?.settings?.background || '#ffffff'
      ctx.fillRect(0, 0, 420, 594)
      
      return canvas.toDataURL('image/png')
    }
  }))
  
  const handleMouseDown = (e, elementId) => {
    e.stopPropagation()
    if (activeTool === 'select') {
      onSelectElement(elementId)
      setDragging({ id: elementId, startX: e.clientX, startY: e.clientY })
    }
  }

  const handleMouseMove = (e) => {
    if (!dragging) return
    
    const dx = e.clientX - dragging.startX
    const dy = e.clientY - dragging.startY
    
    const element = page?.elements.find(el => el.id === dragging.id)
    if (element) {
      onUpdateElement(dragging.id, {
        x: element.x + dx * 0.5,
        y: element.y + dy * 0.5
      })
      setDragging({ ...dragging, startX: e.clientX, startY: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setDragging(null)
    setResizing(null)
  }

  const handleCanvasClick = () => {
    if (activeTool === 'select') {
      onSelectElement(null)
    }
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        onDeleteElement(selectedElement)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElement, onDeleteElement])

  if (!page) return null

  return (
    <div className="canvas-container">
      <div className="canvas-toolbar">
        <div className="toolbar-group">
          <button className={`toolbar-btn ${activeTool === 'select' ? 'active' : ''}`}>
            ⬚
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group">
          <button className="toolbar-btn">A-</button>
          <button className="toolbar-btn">A+</button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group">
          <button className="toolbar-btn">≡</button>
          <button className="toolbar-btn">☰</button>
          <button className="toolbar-btn">::</button>
        </div>
      </div>
      
      <div 
        className="canvas-viewport"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        style={{ perspective: 2000 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={page.id}
            className="page-flip-wrapper"
            initial={{
              rotateY: flipDirection > 0 ? -140 : 140,
              rotateX: 8,
              opacity: 0,
              x: flipDirection > 0 ? 36 : -36,
              z: -80
            }}
            animate={{ rotateY: 0, rotateX: 0, opacity: 1, x: 0, z: 0 }}
            exit={{
              rotateY: flipDirection > 0 ? 125 : -125,
              rotateX: -6,
              opacity: 0,
              x: flipDirection > 0 ? -24 : 24,
              z: -40
            }}
            transition={{ duration: 0.65, ease: [0.2, 0.65, 0.25, 1] }}
            style={{ transformOrigin: flipDirection > 0 ? 'left center' : 'right center' }}
          >
            <div className="page-fold-shadow" />
            <div 
              ref={containerRef}
              className="canvas-page"
              style={{ 
            background: page.settings?.background || '#ffffff',
            width: page.settings?.width || 420,
            height: page.settings?.height || 594
          }}
        >
          {page.elements.map(element => (
            <div
              key={element.id}
              className={`page-element ${selectedElement === element.id ? 'selected' : ''}`}
              style={{
                position: 'absolute',
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                transform: `rotate(${element.rotation || 0}deg)`,
                opacity: element.opacity || 1
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
            >
              {element.type === 'text' && (
                <div 
                  className="element-text"
                  style={{
                    fontSize: element.styles?.fontSize || 16,
                    fontFamily: element.styles?.fontFamily || 'Inter',
                    color: element.styles?.color || '#1a1a1a',
                    backgroundColor: element.styles?.backgroundColor || 'transparent',
                    textAlign: element.styles?.textAlign || 'left',
                    borderWidth: element.styles?.borderWidth,
                    borderColor: element.styles?.borderColor,
                    borderRadius: element.styles?.borderRadius,
                    borderStyle: element.styles?.borderWidth > 0 ? 'solid' : 'none'
                  }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateElement(element.id, { content: e.target.innerText })}
                >
                  {element.content}
                </div>
              )}
              
              {element.type === 'image' && (
                <div className="element-image">
                  {element.content ? (
                    <img src={element.content} alt="" />
                  ) : (
                    <span style={{ color: '#999', fontSize: '0.8rem' }}>Bild einfügen</span>
                  )}
                </div>
              )}
              
              {element.type === 'shape' && (
                <div 
                  className="element-shape"
                  style={{
                    width: '100%',
                    height: '100%',
                    background: element.styles?.backgroundColor || '#ff3366',
                    borderRadius: element.styles?.borderRadius || 0
                  }}
                />
              )}
              
              {element.type === 'line' && (
                <div style={{
                  width: '100%',
                  height: 2,
                  background: element.styles?.color || '#1a1a1a'
                }} />
              )}
            </div>
          ))}
        </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
})

export default Canvas