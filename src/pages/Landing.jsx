import { useAuth } from '../contexts/AuthContext'
import { Heart, Users, Camera, Calendar } from 'lucide-react'

export default function Landing() {
  const { user } = useAuth()

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <Heart className="h-16 w-16 text-pink-500 mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to WeddingsPro
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your all-in-one wedding planning and photo sharing platform
            </p>
            <a
              href="/dashboard"
              className="inline-block bg-pink-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Heart className="h-20 w-20 text-pink-500 mx-auto mb-8" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Plan Your Perfect Wedding
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create beautiful RSVP pages, collect guest responses, and capture precious moments 
            with our comprehensive wedding planning platform.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Calendar className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy RSVP Management</h3>
            <p className="text-gray-600">
              Create custom RSVP pages and track guest responses effortlessly
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Users className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Guest Management</h3>
            <p className="text-gray-600">
              Handle plus-ones, dietary restrictions, and song requests seamlessly
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Camera className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Photo Collection</h3>
            <p className="text-gray-600">
              Collect wedding photos from guests with secure, password-protected uploads
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to plan your perfect wedding?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of couples who trust WeddingsPro for their special day
          </p>
          <div className="space-x-4">
            <a
              href="/signup"
              className="inline-block bg-pink-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Get Started Free
            </a>
            <a
              href="/login"
              className="inline-block bg-white text-pink-500 border-2 border-pink-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-50 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}