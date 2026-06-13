import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import WelcomePage from './components/pages/WelcomePage'
import Home from './components/pages/Home'
import MapPage from './components/pages/MapPage'
import MobilePage from './components/pages/MobilePage'
import DirectoryPage from './components/pages/DirectoryPage'
import ChatBot from './components/pages/ChatBot'

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

// Show chatbot on all pages EXCEPT splash and mobile
function AppContent() {
  const location = useLocation()
  // Show chatbot on home page only
  const showChatBot = location.pathname === '/home'

  return (
    <>
      <Routes>
        <Route path="/"            element={<WelcomePage />} />
        <Route path="/home"        element={<Home />} />
        <Route path="/map"         element={<MapPage />} />
        <Route path="/directions"  element={<MobilePage />} />
        <Route path="/directory"   element={<DirectoryPage />} />
        <Route path="/chatbot"     element={<ChatbotPage />} />
        <Route path="/admin"       element={<AdminPage />} />
      </Routes>
      {showChatBot && <ChatBot />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
