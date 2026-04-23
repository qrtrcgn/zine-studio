import React from 'react'

const COLORS = [
  '#000000', '#ffffff', '#ff3366', '#00d4aa', '#ffcc00',
  '#0066ff', '#6600ff', '#ff6600', '#1a1a1a', '#666666',
  '#e0e0e0', '#ff6699', '#33ff99', '#ffff66', '#6699ff'
]

const FONTS = [
  'Inter', 'Space Grotesk', 'Georgia', 'Courier New', 'Arial'
]

export default function PropertiesPanel({ 
  element, 
  onUpdateElement,
  pageSettings,
  onUpdatePageSettings,
  templateSettings,
  onUpdateSettings
}) {
  if (!element) {
    return (
      <aside className="properties-panel">
        <div className="panel-section">
          <h3 className="panel-title">Seite</h3>
          
          <div className="input-group">
            <label className="input-label">Hintergrund</label>
            <div className="color-picker">
              {COLORS.slice(0, 8).map(color => (
                <div
                  key={color}
                  className={`color-swatch ${pageSettings?.background === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => onUpdatePageSettings({ background: color })}
                />
              ))}
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Seitengröße</label>
            <select 
              className="input"
              value={`${pageSettings?.width}x${pageSettings?.height}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number)
                onUpdatePageSettings({ width: w, height: h })
              }}
            >
              <option value="420x594">A5 (420 x 594 px)</option>
              <option value="595x842">A4 (595 x 842 px)</option>
              <option value="840x595">A4 Querformat</option>
              <option value="1080x1080">Instagram (1080 x 1080)</option>
              <option value="1080x1350">Instagram Portrait</option>
            </select>
          </div>
        </div>
        
        <div className="panel-section">
          <h3 className="panel-title">Design</h3>
          
          <div className="input-group">
            <label className="input-label">Schriftart</label>
            <select 
              className="input"
              value={templateSettings?.fontFamily || 'Inter'}
              onChange={(e) => onUpdateSettings({ fontFamily: e.target.value })}
            >
              {FONTS.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          
          <div className="input-group">
            <label className="input-label">Schriftgröße</label>
            <div className="slider-container">
              <input 
                type="range" 
                className="slider"
                min="10"
                max="48"
                value={templateSettings?.fontSize || 16}
                onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
              />
              <span className="slider-value">{templateSettings?.fontSize || 16}px</span>
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Textfarbe</label>
            <div className="color-picker">
              {COLORS.slice(0, 8).map(color => (
                <div
                  key={color}
                  className={`color-swatch ${templateSettings?.textColor === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => onUpdateSettings({ textColor: color })}
                />
              ))}
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Akzentfarbe</label>
            <div className="color-picker">
              {COLORS.slice(2, 10).map(color => (
                <div
                  key={color}
                  className={`color-swatch ${templateSettings?.accentColor === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => onUpdateSettings({ accentColor: color })}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="properties-panel">
      <div className="panel-section">
        <h3 className="panel-title">Position & Größe</h3>
        
        <div className="input-row">
          <div className="input-group">
            <label className="input-label">X</label>
            <input 
              type="number" 
              className="input"
              value={Math.round(element.x)}
              onChange={(e) => onUpdateElement(element.id, { x: Number(e.target.value) })}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Y</label>
            <input 
              type="number" 
              className="input"
              value={Math.round(element.y)}
              onChange={(e) => onUpdateElement(element.id, { y: Number(e.target.value) })}
            />
          </div>
        </div>
        
        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Breite</label>
            <input 
              type="number" 
              className="input"
              value={Math.round(element.width)}
              onChange={(e) => onUpdateElement(element.id, { width: Number(e.target.value) })}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Höhe</label>
            <input 
              type="number" 
              className="input"
              value={Math.round(element.height)}
              onChange={(e) => onUpdateElement(element.id, { height: Number(e.target.value) })}
            />
          </div>
        </div>
        
        <div className="input-group">
          <label className="input-label">Rotation</label>
          <div className="slider-container">
            <input 
              type="range" 
              className="slider"
              min="0"
              max="360"
              value={element.rotation || 0}
              onChange={(e) => onUpdateElement(element.id, { rotation: Number(e.target.value) })}
            />
            <span className="slider-value">{element.rotation || 0}°</span>
          </div>
        </div>
        
        <div className="input-group">
          <label className="input-label">Deckkraft</label>
          <div className="slider-container">
            <input 
              type="range" 
              className="slider"
              min="0.1"
              max="1"
              step="0.1"
              value={element.opacity || 1}
              onChange={(e) => onUpdateElement(element.id, { opacity: Number(e.target.value) })}
            />
            <span className="slider-value">{Math.round((element.opacity || 1) * 100)}%</span>
          </div>
        </div>
      </div>
      
      {element.type === 'text' && (
        <div className="panel-section">
          <h3 className="panel-title">Text</h3>
          
          <div className="input-group">
            <label className="input-label">Schriftart</label>
            <select 
              className="input"
              value={element.styles?.fontFamily || 'Inter'}
              onChange={(e) => onUpdateElement(element.id, { 
                styles: { ...element.styles, fontFamily: e.target.value } 
              })}
            >
              {FONTS.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          
          <div className="input-group">
            <label className="input-label">Schriftgröße</label>
            <div className="slider-container">
              <input 
                type="range" 
                className="slider"
                min="10"
                max="72"
                value={element.styles?.fontSize || 16}
                onChange={(e) => onUpdateElement(element.id, { 
                  styles: { ...element.styles, fontSize: Number(e.target.value) } 
                })}
              />
              <span className="slider-value">{element.styles?.fontSize || 16}px</span>
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Farbe</label>
            <div className="color-picker">
              {COLORS.slice(0, 8).map(color => (
                <div
                  key={color}
                  className={`color-swatch ${element.styles?.color === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => onUpdateElement(element.id, { 
                    styles: { ...element.styles, color } 
                  })}
                />
              ))}
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Ausrichtung</label>
            <div className="toolbar-group" style={{ width: '100%' }}>
              <button 
                className={`toolbar-btn ${element.styles?.textAlign === 'left' ? 'active' : ''}`}
                onClick={() => onUpdateElement(element.id, { 
                  styles: { ...element.styles, textAlign: 'left' } 
                })}
              >
                =
              </button>
              <button 
                className={`toolbar-btn ${element.styles?.textAlign === 'center' ? 'active' : ''}`}
                onClick={() => onUpdateElement(element.id, { 
                  styles: { ...element.styles, textAlign: 'center' } 
                })}
              >
                II
              </button>
              <button 
                className={`toolbar-btn ${element.styles?.textAlign === 'right' ? 'active' : ''}`}
                onClick={() => onUpdateElement(element.id, { 
                  styles: { ...element.styles, textAlign: 'right' } 
                })}
              >
                =
              </button>
            </div>
          </div>
        </div>
      )}
      
      {element.type === 'shape' && (
        <div className="panel-section">
          <h3 className="panel-title">Füllung</h3>
          
          <div className="input-group">
            <label className="input-label">Farbe</label>
            <div className="color-picker">
              {COLORS.slice(2, 10).map(color => (
                <div
                  key={color}
                  className={`color-swatch ${element.styles?.backgroundColor === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => onUpdateElement(element.id, { 
                    styles: { ...element.styles, backgroundColor: color } 
                  })}
                />
              ))}
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Rahmen</label>
            <div className="input-row">
              <div className="input-group">
                <input 
                  type="number" 
                  className="input"
                  min="0"
                  max="20"
                  value={element.styles?.borderWidth || 0}
                  onChange={(e) => onUpdateElement(element.id, { 
                    styles: { ...element.styles, borderWidth: Number(e.target.value) } 
                  })}
                />
              </div>
              <div className="input-group">
                <input 
                  type="number" 
                  className="input"
                  value={0}
                  onChange={() => {}}
                />
              </div>
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Eckenradius</label>
            <div className="slider-container">
              <input 
                type="range" 
                className="slider"
                min="0"
                max="50"
                value={element.styles?.borderRadius || 0}
                onChange={(e) => onUpdateElement(element.id, { 
                  styles: { ...element.styles, borderRadius: Number(e.target.value) } 
                })}
              />
              <span className="slider-value">{element.styles?.borderRadius || 0}px</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}