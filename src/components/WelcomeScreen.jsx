import React, { useState } from 'react'

export default function WelcomeScreen({ onCreate }) {
  const [name, setName] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name.trim())
    }
  }
  
  return (
    <div className="welcome">
      <div className="welcome-icon">Z</div>
      <h1 className="welcome-title">Zine Studio</h1>
      <p className="welcome-subtitle">
        Erstelle wunderschöne digitale Zines mit unserem intuitiven Editor. 
        Design, teilen und exportieren - alles an einem Ort.
      </p>
      
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '300px' }}>
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Name deines Zines..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={!name.trim()}
        >
          Projekt erstellen
        </button>
      </form>
      
      <div style={{ marginTop: '40px', display: 'flex', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>T</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Text & Schriften</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>◻</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bilder</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>PDF</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Export</div>
        </div>
      </div>
    </div>
  )
}