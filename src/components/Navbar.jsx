import { useAuth } from '../contexts/AuthContext'
import { Heart, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                WeddingsPro
              </span>
            </a>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-5 w-5" />
                <span className="text-sm">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Login
              </a>
              <a
                href="/signup"
                className="bg-pink-500 text-white hover:bg-pink-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Up
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}