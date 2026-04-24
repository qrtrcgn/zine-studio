import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import PropertiesPanel from './components/PropertiesPanel'
import Header from './components/Header'
import ExportModal from './components/ExportModal'
import WelcomeScreen from './components/WelcomeScreen'

const PROJECT_SCHEMA_VERSION = 1
const AUTOSAVE_KEY = 'zine-studio:autosave:v1'

function slugifyName(value = '') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'zine'
}

const DEFAULT_PAGE = {
  id: uuidv4(),
  elements: [],
  settings: {
    width: 420,
    height: 594,
    background: '#ffffff',
    margin: 20
  }
}

const DEFAULT_TEMPLATE = {
  name: 'Unbenannt',
  pages: [DEFAULT_PAGE],
  settings: {
    columns: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    textColor: '#1a1a1a',
    accentColor: '#ff3366'
  }
}

function createNewPage() {
  return {
    ...DEFAULT_PAGE,
    id: uuidv4(),
    elements: []
  }
}

function sanitizeTemplate(rawTemplate) {
  if (!rawTemplate || typeof rawTemplate !== 'object') return null
  if (!Array.isArray(rawTemplate.pages) || rawTemplate.pages.length === 0) return null

  const name = typeof rawTemplate.name === 'string' && rawTemplate.name.trim()
    ? rawTemplate.name.trim()
    : 'Unbenannt'

  const pages = rawTemplate.pages.map((page) => ({
    id: page?.id || uuidv4(),
    elements: Array.isArray(page?.elements) ? page.elements : [],
    settings: { ...DEFAULT_PAGE.settings, ...(page?.settings || {}) }
  }))

  return {
    ...DEFAULT_TEMPLATE,
    ...rawTemplate,
    name,
    pages,
    settings: { ...DEFAULT_TEMPLATE.settings, ...(rawTemplate.settings || {}) },
    shareSlug: rawTemplate.shareSlug || slugifyName(name)
  }
}

function parseRoute(pathname) {
  if (!pathname || pathname === '/') {
    return { mode: 'root' }
  }

  if (pathname === '/app') {
    return { mode: 'editor' }
  }

  if (pathname.startsWith('/view/')) {
    const slug = pathname.replace('/view/', '').trim()
    return { mode: 'viewer', slug }
  }

  return { mode: 'unknown' }
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname))
  const [template, setTemplate] = useState(null)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [pageFlipDirection, setPageFlipDirection] = useState(1)
  const [selectedElement, setSelectedElement] = useState(null)
  const [activeTool, setActiveTool] = useState('select')
  const [showExport, setShowExport] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const canvasRef = useRef(null)
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)
  const autosaveTimerRef = useRef(null)

  const currentPage = template?.pages[currentPageIndex]
  const shareUrl = template?.shareSlug ? `${window.location.origin}/view/${template.shareSlug}` : ''

  const syncHistoryFlags = () => {
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
  }

  const commitTemplate = (nextTemplate, options = {}) => {
    const { skipHistory = false, resetHistory = false } = options
    setTemplate(nextTemplate)

    if (skipHistory) return

    if (resetHistory) {
      historyRef.current = [nextTemplate]
      historyIndexRef.current = 0
      syncHistoryFlags()
      return
    }

    const historyPrefix = historyRef.current.slice(0, historyIndexRef.current + 1)
    const nextHistory = [...historyPrefix, nextTemplate].slice(-100)
    historyRef.current = nextHistory
    historyIndexRef.current = nextHistory.length - 1
    syncHistoryFlags()
  }

  const handleCreate = (name) => {
    const newTemplate = {
      ...DEFAULT_TEMPLATE,
      name,
      pages: [createNewPage()],
      shareSlug: slugifyName(name)
    }
    commitTemplate(newTemplate, { resetHistory: true })
    setCurrentPageIndex(0)
  }

  const handleAddPage = () => {
    if (!template) return
    commitTemplate({
      ...template,
      pages: [...template.pages, createNewPage()]
    })
    setPageFlipDirection(1)
    setCurrentPageIndex(template.pages.length)
  }

  const handleDeletePage = (index) => {
    if (!template || template.pages.length <= 1) return
    const newPages = template.pages.filter((_, i) => i !== index)
    commitTemplate({ ...template, pages: newPages })
    setCurrentPageIndex(Math.max(0, currentPageIndex - 1))
  }

  const handlePageSelect = (index) => {
    setPageFlipDirection(index > currentPageIndex ? 1 : -1)
    setCurrentPageIndex(index)
  }

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      window.alert('Share-Link kopiert.')
    } catch (error) {
      console.error('Kopieren fehlgeschlagen:', error)
      window.alert(`Bitte manuell kopieren: ${shareUrl}`)
    }
  }

  const handleAddElement = (type, data = {}) => {
    if (!currentPage) return
    
    const id = uuidv4()
    const newElement = {
      id,
      type,
      x: 50,
      y: 50,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 40 : 150,
      rotation: 0,
      opacity: 1,
      ...data,
      content: data.content || (type === 'text' ? 'Text bearbeiten...' : ''),
      styles: {
        fontSize: 16,
        fontFamily: 'Inter',
        color: '#1a1a1a',
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: '#000000',
        borderRadius: 0,
        textAlign: 'left'
      }
    }
    
    const updatedPages = [...template.pages]
    updatedPages[currentPageIndex] = {
      ...currentPage,
      elements: [...currentPage.elements, newElement]
    }
    
    commitTemplate({ ...template, pages: updatedPages })
    setSelectedElement(id)
    setActiveTool('select')
  }

  const handleUpdateElement = (id, updates) => {
    if (!currentPage) return
    
    const updatedPages = [...template.pages]
    const elements = currentPage.elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    )
    updatedPages[currentPageIndex] = { ...currentPage, elements }
    commitTemplate({ ...template, pages: updatedPages })
  }

  const handleDeleteElement = (id) => {
    if (!currentPage) return
    
    const updatedPages = [...template.pages]
    const elements = currentPage.elements.filter(el => el.id !== id)
    updatedPages[currentPageIndex] = { ...currentPage, elements }
    commitTemplate({ ...template, pages: updatedPages })
    setSelectedElement(null)
  }

  const handleUpdateSettings = (updates) => {
    commitTemplate({
      ...template,
      settings: { ...template.settings, ...updates }
    })
  }

  const handleUpdatePageSettings = (updates) => {
    if (!currentPage) return
    const updatedPages = [...template.pages]
    updatedPages[currentPageIndex] = {
      ...currentPage,
      settings: { ...currentPage.settings, ...updates }
    }
    commitTemplate({ ...template, pages: updatedPages })
  }

  const handleSaveProject = () => {
    if (!template) return
    const payload = {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      template
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${template.shareSlug || slugifyName(template.name)}.zine.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportProject = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const content = await file.text()
      const parsed = JSON.parse(content)
      const importedTemplate = sanitizeTemplate(parsed?.template || parsed)
      if (!importedTemplate) {
        window.alert('Import fehlgeschlagen: Ungueltiges Projektformat.')
        return
      }
      commitTemplate(importedTemplate, { resetHistory: true })
      setCurrentPageIndex(0)
      setSelectedElement(null)
      window.alert('Projekt erfolgreich importiert.')
    } catch (error) {
      console.error('Import fehlgeschlagen:', error)
      window.alert('Import fehlgeschlagen: Datei konnte nicht gelesen werden.')
    }
  }

  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current -= 1
    setTemplate(historyRef.current[historyIndexRef.current])
    setSelectedElement(null)
    syncHistoryFlags()
  }

  const handleRedo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current += 1
    setTemplate(historyRef.current[historyIndexRef.current])
    setSelectedElement(null)
    syncHistoryFlags()
  }

  useEffect(() => {
    if (route.mode === 'root') {
      window.history.replaceState({}, '', '/app')
      setRoute({ mode: 'editor' })
      return
    }

    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [route.mode])

  useEffect(() => {
    const savedDraft = localStorage.getItem(AUTOSAVE_KEY)
    if (!savedDraft) return

    try {
      const parsed = JSON.parse(savedDraft)
      const restoredTemplate = sanitizeTemplate(parsed?.template || parsed)
      if (!restoredTemplate) return
      setTemplate(restoredTemplate)
      historyRef.current = [restoredTemplate]
      historyIndexRef.current = 0
      syncHistoryFlags()
    } catch (error) {
      console.error('Auto-Save konnte nicht wiederhergestellt werden:', error)
    }
  }, [])

  useEffect(() => {
    if (!template) return
    window.clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = window.setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
        schemaVersion: PROJECT_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        template
      }))
    }, 500)

    return () => window.clearTimeout(autosaveTimerRef.current)
  }, [template])

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      if (!isModifierPressed) return

      if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault()
        handleUndo()
      }

      if (event.key.toLowerCase() === 'z' && event.shiftKey) {
        event.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (route.mode === 'unknown') {
    return (
      <div className="viewer-shell">
        <div className="viewer-empty">
          <h2>Seite nicht gefunden</h2>
          <p>Nutze `/app` fuer den Editor oder `/view/&lt;slug&gt;` fuer die Vorschau.</p>
        </div>
      </div>
    )
  }

  if (route.mode === 'viewer') {
    const hasTemplate = template?.shareSlug === route.slug
    const viewerPage = hasTemplate ? template.pages[currentPageIndex] : null

    return (
      <div className="viewer-shell">
        {hasTemplate ? (
          <>
            <div className="viewer-header">
              <h1>{template.name}</h1>
              <span>{currentPageIndex + 1} / {template.pages.length}</span>
            </div>
            <div className="viewer-book">
              <Canvas
                page={viewerPage}
                flipDirection={pageFlipDirection}
                selectedElement={null}
                activeTool="view"
                onSelectElement={() => {}}
                onUpdateElement={() => {}}
                onDeleteElement={() => {}}
              />
            </div>
            <div className="viewer-nav">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const nextIndex = Math.max(0, currentPageIndex - 1)
                  setPageFlipDirection(-1)
                  setCurrentPageIndex(nextIndex)
                }}
                disabled={currentPageIndex === 0}
              >
                Zurueck
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const nextIndex = Math.min(template.pages.length - 1, currentPageIndex + 1)
                  setPageFlipDirection(1)
                  setCurrentPageIndex(nextIndex)
                }}
                disabled={currentPageIndex >= template.pages.length - 1}
              >
                Weiter
              </button>
            </div>
          </>
        ) : (
          <div className="viewer-empty">
            <h2>Zine nicht verfuegbar</h2>
            <p>Fuer diese Demo wird das Zine lokal aus dem Auto-Save geladen.</p>
          </div>
        )}
      </div>
    )
  }

  if (!template) {
    return <WelcomeScreen onCreate={handleCreate} />
  }

  return (
    <div className="app">
      <Header 
        template={template}
        shareUrl={shareUrl}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onImportProject={handleImportProject}
        onSaveProject={handleSaveProject}
        onCopyShareUrl={handleCopyShareUrl}
        onShowExport={() => setShowExport(true)}
        onNew={() => setTemplate(null)}
      />
      
      <div className="main">
        <Sidebar 
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onAddElement={handleAddElement}
          onAddPage={handleAddPage}
          pages={template.pages}
          currentPageIndex={currentPageIndex}
          onPageSelect={handlePageSelect}
          onDeletePage={handleDeletePage}
        />
        
        <Canvas
          ref={canvasRef}
          page={currentPage}
          flipDirection={pageFlipDirection}
          selectedElement={selectedElement}
          activeTool={activeTool}
          onSelectElement={setSelectedElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
        />
        
        <PropertiesPanel
          element={currentPage?.elements.find(el => el.id === selectedElement)}
          onUpdateElement={handleUpdateElement}
          pageSettings={currentPage?.settings}
          onUpdatePageSettings={handleUpdatePageSettings}
          templateSettings={template.settings}
          onUpdateSettings={handleUpdateSettings}
        />
      </div>
      
      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          template={template}
          canvasRef={canvasRef}
        />
      )}
    </div>
  )
}