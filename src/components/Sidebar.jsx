import React from 'react'

const TOOLS = [
  { id: 'select', icon: '⬚', label: 'Auswählen' },
  { id: 'text', icon: 'T', label: 'Text' },
  { id: 'image', icon: '◻', label: 'Bild' },
  { id: 'shape', icon: '⬭', label: 'Form' },
  { id: 'line', icon: '╱', label: 'Linie' }
]

export default function Sidebar({ 
  activeTool, 
  onToolChange, 
  onAddElement,
  onAddPage,
  pages,
  currentPageIndex,
  onPageSelect,
  onDeletePage
}) {
  const handleToolClick = (toolId) => {
    if (toolId === 'select') {
      onToolChange('select')
    } else {
      onToolChange(toolId)
      if (['text', 'image', 'shape', 'line'].includes(toolId)) {
        onAddElement(toolId)
      }
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Werkzeuge</h3>
        <div className="sidebar-grid">
          {TOOLS.map(tool => (
            <div
              key={tool.id}
              className={`tool-item ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => handleToolClick(tool.id)}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="sidebar-section">
        <h3 className="sidebar-title">Layout</h3>
        <div className="sidebar-grid">
          <div className="tool-item" onClick={() => onToolChange('text')}>
            <span className="tool-icon">1</span>
            <span className="tool-label">1 Spalte</span>
          </div>
          <div className="tool-item" onClick={() => onToolChange('text')}>
            <span className="tool-icon">2</span>
            <span className="tool-label">2 Spalten</span>
          </div>
          <div className="tool-item" onClick={() => onToolChange('text')}>
            <span className="tool-icon">3</span>
            <span className="tool-label">3 Spalten</span>
          </div>
          <div className="tool-item" onClick={() => onToolChange('text')}>
            <span className="tool-icon">#</span>
            <span className="tool-label">Flexibel</span>
          </div>
        </div>
      </div>
      
      <div className="pages-panel">
        <h3 className="sidebar-title">Seiten</h3>
        {pages.map((page, index) => (
          <div
            key={page.id}
            className={`page-thumbnail ${currentPageIndex === index ? 'active' : ''}`}
            onClick={() => onPageSelect(index)}
          >
            Seite {index + 1}
          </div>
        ))}
        <button className="add-page-btn" onClick={onAddPage}>
          + Seite hinzufügen
        </button>
      </div>
    </aside>
  )
}