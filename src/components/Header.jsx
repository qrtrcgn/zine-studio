import React from 'react'

export default function Header({
  template,
  shareUrl,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onImportProject,
  onSaveProject,
  onCopyShareUrl,
  onShowExport,
  onNew
}) {
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
        {shareUrl && (
          <span className="share-url-chip" title={shareUrl}>
            {shareUrl}
          </span>
        )}
      </div>
      
      <div className="header-actions">
        <label className="btn btn-secondary">
          Projekt laden
          <input type="file" accept=".json,.zine.json" style={{ display: 'none' }} onChange={onImportProject} />
        </label>
        <button className="btn btn-primary" onClick={onSaveProject}>
          Projekt speichern
        </button>
        <button className="btn btn-ghost" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button className="btn btn-ghost" onClick={onRedo} disabled={!canRedo}>
          Redo
        </button>
        {shareUrl && (
          <button className="btn btn-secondary" onClick={onCopyShareUrl}>
            Share-Link kopieren
          </button>
        )}
        <button className="btn btn-ghost" onClick={onNew}>
          + Neues Projekt
        </button>
        <button className="btn btn-secondary" onClick={onShowExport}>
          Exportieren
        </button>
      </div>
    </header>
  )
}