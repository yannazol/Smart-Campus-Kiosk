import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import WelcomePage from './components/pages/WelcomePage'
import Home from './components/pages/Home'
import MapPage from './components/pages/MapPage'
import MobilePage from './components/pages/MobilePage'
import DirectoryPage from './components/pages/DirectoryPage'
import AdminPage from './components/pages/AdminPage'
import ChatBot from './components/pages/ChatBot'
import IdleTimeout from './components/pages/IdleTimeout'

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{ position: 'fixed', inset: 0, background: '#040e1f', overflow: 'auto' }}
    >
      {children}
    </motion.div>
  )
}

function AppContent() {
  const location = useLocation()
  const showChatBot = location.pathname === '/home'

  return (
    <>
      <AnimatePresence mode="sync">
        <Routes location={location} key={location.pathname}>
          <Route path="/"           element={<AnimatedPage><WelcomePage /></AnimatedPage>} />
          <Route path="/home"       element={<AnimatedPage><Home /></AnimatedPage>} />
          <Route path="/map"        element={<AnimatedPage><MapPage /></AnimatedPage>} />
          <Route path="/directions" element={<AnimatedPage><MobilePage /></AnimatedPage>} />
          <Route path="/directory"  element={<AnimatedPage><DirectoryPage /></AnimatedPage>} />
          <Route path="/admin"      element={<AnimatedPage><AdminPage /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>
      {showChatBot && <ChatBot />}
      <IdleTimeout />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ position: 'fixed', inset: 0, background: '#040e1f', zIndex: -1 }} />
      <AppContent />
    </BrowserRouter>
  )
}

export default App
