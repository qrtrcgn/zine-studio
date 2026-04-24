import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Canvas = forwardRef(function Canvas({ 
  page, 
  flipDirection = 1,
  transitionType = 'roll',
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
      const item = page?.elements.find((el) => el.id === elementId)
      if (item?.locked) return
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

  const variants = {
    roll: {
      initial: {
        rotateY: flipDirection > 0 ? -170 : 170,
        rotateX: flipDirection > 0 ? 20 : -20,
        skewY: flipDirection > 0 ? -25 : 25,
        opacity: 0,
        x: flipDirection > 0 ? 200 : -200,
        z: -800,
        scale: 0.7
      },
      animate: {
        rotateY: 0, rotateX: 0, rotateZ: 0, skewY: 0, opacity: 1, x: 0, z: 0, scale: 1, zIndex: 10,
        transition: { duration: 2.5, ease: [0.16, 1, 0.3, 1] }
      },
      exit: {
        rotateY: flipDirection > 0 ? 170 : -170,
        rotateX: flipDirection > 0 ? -20 : 20,
        skewY: flipDirection > 0 ? 25 : -25,
        opacity: 0,
        x: flipDirection > 0 ? -200 : 200,
        z: -800,
        scale: 0.7,
        zIndex: 1,
        transition: { duration: 2.0, ease: [0.16, 1, 0.3, 1] }
      }
    },
    flip: {
      initial: { rotateY: flipDirection > 0 ? -120 : 120, opacity: 0, x: flipDirection > 0 ? 40 : -40, z: -200 },
      animate: { rotateY: 0, opacity: 1, x: 0, z: 0, zIndex: 10, transition: { duration: 0.8, ease: "easeOut" } },
      exit: { rotateY: flipDirection > 0 ? 120 : -120, opacity: 0, x: flipDirection > 0 ? -40 : 40, z: -200, zIndex: 1, transition: { duration: 0.8, ease: "easeIn" } }
    },
    slide: {
      initial: { x: flipDirection > 0 ? '100%' : '-100%', opacity: 0 },
      animate: { x: 0, opacity: 1, zIndex: 10, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
      exit: { x: flipDirection > 0 ? '-100%' : '100%', opacity: 0, zIndex: 1, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } }
    },
    fade: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1, zIndex: 10, transition: { duration: 0.5 } },
      exit: { opacity: 0, scale: 1.02, zIndex: 1, transition: { duration: 0.5 } }
    },
    zoom: {
      initial: { opacity: 0, scale: 1.5, rotate: 5 },
      animate: { opacity: 1, scale: 1, rotate: 0, zIndex: 10, transition: { duration: 0.8, ease: "easeOut" } },
      exit: { opacity: 0, scale: 0.5, rotate: -5, zIndex: 1, transition: { duration: 0.8, ease: "easeIn" } }
    }
  }

  const currentVariant = variants[transitionType] || variants.roll

  return (
    <div className={`canvas-container ${activeTool === 'view' ? 'viewer-mode' : ''}`}>
      {activeTool !== 'view' && (
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
      )}
      
      <div 
        className="canvas-viewport"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        style={{ perspective: 3000 }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={page.id}
            className="page-flip-wrapper"
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            style={{ 
              transformOrigin: flipDirection > 0 ? 'left center' : 'right center',
              position: 'absolute'
            }}
          >
            {transitionType === 'roll' && (
              <>
                <motion.div 
                  className="page-roll-highlight"
                  initial={{ x: flipDirection > 0 ? '-100%' : '100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '40%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    zIndex: 6,
                    pointerEvents: 'none'
                  }}
                />
                <motion.div 
                  className="page-roll-shadow"
                  initial={{ x: flipDirection > 0 ? '-80%' : '80%' }}
                  animate={{ x: '180%' }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '30%',
                    background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.2), transparent)',
                    zIndex: 4,
                    pointerEvents: 'none'
                  }}
                />
              </>
            )}
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
              data-locked={element.locked ? 'true' : 'false'}
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
                  height: Math.max(1, element.height || 2),
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