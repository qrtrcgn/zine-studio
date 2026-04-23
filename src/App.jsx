import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import PropertiesPanel from './components/PropertiesPanel'
import Header from './components/Header'
import ExportModal from './components/ExportModal'
import WelcomeScreen from './components/WelcomeScreen'

const SHARE_BASE_DOMAIN = import.meta.env.VITE_SHARE_BASE_DOMAIN || 'zines.local'

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

export default function App() {
  const [template, setTemplate] = useState(null)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [pageFlipDirection, setPageFlipDirection] = useState(1)
  const [selectedElement, setSelectedElement] = useState(null)
  const [activeTool, setActiveTool] = useState('select')
  const [showExport, setShowExport] = useState(false)
  const canvasRef = useRef(null)

  const currentPage = template?.pages[currentPageIndex]
  const shareUrl = template?.shareSlug ? `https://${template.shareSlug}.${SHARE_BASE_DOMAIN}` : ''

  const handleCreate = (name) => {
    const newTemplate = {
      ...DEFAULT_TEMPLATE,
      name,
      pages: [createNewPage()],
      shareSlug: slugifyName(name)
    }
    setTemplate(newTemplate)
    setCurrentPageIndex(0)
  }

  const handleAddPage = () => {
    if (!template) return
    setTemplate({
      ...template,
      pages: [...template.pages, createNewPage()]
    })
    setPageFlipDirection(1)
    setCurrentPageIndex(template.pages.length)
  }

  const handleDeletePage = (index) => {
    if (!template || template.pages.length <= 1) return
    const newPages = template.pages.filter((_, i) => i !== index)
    setTemplate({ ...template, pages: newPages })
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
    
    setTemplate({ ...template, pages: updatedPages })
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
    setTemplate({ ...template, pages: updatedPages })
  }

  const handleDeleteElement = (id) => {
    if (!currentPage) return
    
    const updatedPages = [...template.pages]
    const elements = currentPage.elements.filter(el => el.id !== id)
    updatedPages[currentPageIndex] = { ...currentPage, elements }
    setTemplate({ ...template, pages: updatedPages })
    setSelectedElement(null)
  }

  const handleUpdateSettings = (updates) => {
    setTemplate({
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
    setTemplate({ ...template, pages: updatedPages })
  }

  if (!template) {
    return <WelcomeScreen onCreate={handleCreate} />
  }

  return (
    <div className="app">
      <Header 
        template={template}
        shareUrl={shareUrl}
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