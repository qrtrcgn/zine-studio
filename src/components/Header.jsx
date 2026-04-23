import React from 'react'

export default function Header({ template, onShowExport, onNew }) {
  return (
    <header className="header">
      <div className="header-left">
        <a href="#" className="logo">
          <span className="logo-icon">Z</span>
          <span>Zine Studio</span>
        </a>
        <span style={{ color: 'var(--text-muted)' }}>|</span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {template?.name || 'Unbenannt'}
        </span>
      </div>
      
      <div className="header-actions">
        <button className="btn btn-ghost" onClick={onNew}>
          + Neues Projekt
        </button>
        <button className="btn btn-secondary" onClick={onShowExport}>
          Exportieren
        </button>
        <button className="btn btn-primary">
          Speichern
        </button>
      </div>
    </header>
  )
}