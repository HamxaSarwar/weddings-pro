import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import WeddingPage from './pages/WeddingPage'
import PhotoGallery from './pages/PhotoGallery'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/" />
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={
          <>
            <Navbar />
            {user ? <Navigate to="/dashboard" /> : <Landing />}
          </>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route 
          path="/dashboard" 
          element={
            <>
              <Navbar />
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </>
          } 
        />
        <Route path="/wedding/:weddingId" element={<WeddingPage />} />
        <Route 
          path="/wedding/:weddingId/gallery" 
          element={
            <ProtectedRoute>
              <PhotoGallery />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
