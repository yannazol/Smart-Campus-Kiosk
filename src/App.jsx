import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import WelcomePage from './components/pages/WelcomePage'
import Home from './components/pages/Home'
import MapPage from './components/pages/MapPage'
import MobilePage from './components/pages/MobilePage'
import DirectoryPage from './components/pages/DirectoryPage'
import AdminPage from './components/pages/AdminPage'
import ChatBot from './components/pages/ChatBot'

import IdleTimeout from './components/pages/IdleTimeout'


function AppContent() {
  const location = useLocation()
  const showChatBot = location.pathname === '/home'

  return (
    <>
      <Routes>
        <Route path="/"            element={<WelcomePage />} />
        <Route path="/home"        element={<Home />} />
        <Route path="/map"         element={<MapPage />} />
        <Route path="/directions"  element={<MobilePage />} />
        <Route path="/directory"   element={<DirectoryPage />} />
        <Route path="/admin"       element={<AdminPage />} />
      </Routes>
      {showChatBot && <ChatBot />}
      <IdleTimeout />
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
