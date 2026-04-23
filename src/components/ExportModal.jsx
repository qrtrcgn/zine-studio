import React, { useState, useRef } from 'react'
import { jsPDF } from 'jspdf'

const EXPORT_OPTIONS = [
  {
    id: 'pdf',
    icon: 'PDF',
    name: 'PDF Dokument',
    desc: 'Standard PDF-Export für Druck und Web. Seiten sind nicht auswählbar.'
  },
  {
    id: 'pdf-vector',
    icon: 'VV',
    name: 'PDF (Vektor)',
    desc: 'Vektorbasierte PDF mit auswählbarem Text. Für professionellen Druck.'
  },
  {
    id: 'png',
    icon: 'PNG',
    name: 'Bilder (PNG)',
    desc: 'Hochauflösende Bilder für jeden Export. Eine Datei pro Seite.'
  },
  {
    id: 'html',
    icon: 'HT',
    name: 'HTML',
    desc: 'HTML-Export für Web-Veröffentlichung.'
  }
]

export default function ExportModal({ onClose, template, canvasRef }) {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportedUrl, setExportedUrl] = useState(null)
  
  const handleExport = async (format) => {
    setExporting(true)
    setProgress(10)
    
    try {
      if (format === 'pdf') {
        await exportToPDF()
      } else if (format === 'png') {
        await exportToImages()
      } else if (format === 'html') {
        await exportToHTML()
      }
      
      setProgress(100)
    } catch (error) {
      console.error('Export fehlgeschlagen:', error)
    }
    
    setExporting(false)
  }
  
  const exportToPDF = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    })
    
    const pages = template.pages
    const total = pages.length
    
    for (let i = 0; i < pages.length; i++) {
      setProgress(Math.round((i / total) * 80))
      
      const page = pages[i]
      const pageEl = document.querySelector('.canvas-page')
      
      if (pageEl && window.html2canvas) {
        const canvas = await window.html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: page.settings?.background || '#ffffff'
        })
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        
        if (i > 0) {
          pdf.addPage()
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, 148, 210)
      }
    }
    
    setProgress(90)
    pdf.save(`${template.name || 'zine'}.pdf`)
    setExportedUrl(URL.createObjectURL(pdf.output('blob')))
  }
  
  const exportToImages = async () => {
    const zip = []
    const pages = template.pages
    const total = pages.length
    
    for (let i = 0; i < pages.length; i++) {
      setProgress(Math.round((i / total) * 80))
      
      const page = pages[i]
      const pageEl = document.querySelector('.canvas-page')
      
      if (pageEl && window.html2canvas) {
        const canvas = await window.html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: page.settings?.background || '#ffffff'
        })
        
        const imgData = canvas.toDataURL('image/png')
        zip.push(imgData)
      }
    }
    
    setProgress(90)
    
    for (let i = 0; i < zip.length; i++) {
      const link = document.createElement('a')
      link.download = `${template.name || 'zine'}-seite-${i + 1}.png`
      link.href = zip[i]
      link.click()
    }
  }
  
  const exportToHTML = async () => {
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Inter, sans-serif; 
      background: #f5f5f5;
      padding: 40px;
    }
    .zine {
      max-width: 420px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .page {
      width: 420px;
      height: 594px;
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }
    .element {
      position: absolute;
    }
  </style>
</head>
<body>
  <div class="zine">
`
    
    template.pages.forEach((page, i) => {
      html += `    <div class="page" style="background: ${page.settings?.background || '#fff'}">\n`
      
      page.elements.forEach(el => {
        const styles = el.styles || {}
        let style = `left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px;`
        
        if (el.type === 'text') {
          style += `font-size: ${styles.fontSize || 16}px; font-family: ${styles.fontFamily || 'Inter'}; color: ${styles.color || '#1a1a1a'};`
          if (styles.textAlign) style += `text-align: ${styles.textAlign};`
          html += `      <div class="element" style="${style}">${el.content}</div>\n`
        } else if (el.type === 'shape') {
          style += `background: ${styles.backgroundColor || '#ff3366'}; border-radius: ${styles.borderRadius || 0}px;`
          html += `      <div class="element" style="${style}"></div>\n`
        }
      })
      
      html += `    </div>\n`
    })
    
    html += `  </div>
</body>
</html>`
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setExportedUrl(url)
    
    const link = document.createElement('a')
    link.download = `${template.name || 'zine'}.html`
    link.href = url
    link.click()
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Exportieren</h2>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>
        
        <div className="modal-body">
          {exporting ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: 'var(--bg-tertiary)', 
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'var(--accent-primary)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>
                {progress < 100 ? 'Exportiere...' : 'Fertig!'}
              </p>
            </div>
          ) : exportedUrl ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</div>
              <p style={{ marginBottom: '24px' }}>Export abgeschlossen!</p>
              <button className="btn btn-primary" onClick={() => setExportedUrl(null)}>
                Nochmal exportieren
              </button>
            </div>
          ) : (
            <>
              <p style={{ 
                marginBottom: '20px', 
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                Wähle ein Format für den Export:
              </p>
              
              {EXPORT_OPTIONS.map(option => (
                <div
                  key={option.id}
                  className="export-option"
                  onClick={() => handleExport(option.id)}
                >
                  <div className="export-icon">{option.icon}</div>
                  <div className="export-info">
                    <div className="export-name">{option.name}</div>
                    <div className="export-desc">{option.desc}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}