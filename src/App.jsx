import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WelcomePage from './components/pages/WelcomePage'
import Home from './components/pages/Home'
import MapPage from './components/pages/MapPage'
import DirectoryPage from './components/pages/DirectoryPage'

function ChatbotPage() {
  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h1>💬 Chatbot — Coming Soon</h1>
    </div>
  )
}

function AdminPage() {
  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h1>🔒 Admin Panel — Coming Soon</h1>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<WelcomePage />} />
        <Route path="/home"      element={<Home />} />
        <Route path="/map"       element={<MapPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/chatbot"   element={<ChatbotPage />} />
        <Route path="/admin"     element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App