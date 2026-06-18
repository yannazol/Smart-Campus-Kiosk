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

const pageTransition = {
  initial:    { opacity: 0, y: 10 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      style={{ width: '100%', height: '100%', background: '#0a1628' }}
      {...pageTransition}
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
      <AnimatePresence mode="wait">
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
      <AppContent />
    </BrowserRouter>
  )
}

export default App
