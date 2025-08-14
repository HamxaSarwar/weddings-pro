import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Heart, ArrowLeft, Mail } from 'lucide-react'

export default function SignUp() {
  const { sendOTP, verifyOTP, user } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  if (user) {
    return <Navigate to="/dashboard" />
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await sendOTP(email)
      
      if (error) {
        setError(error.message)
      } else {
        setOtpSent(true)
        setResendCooldown(60) // 60 second cooldown
        
        // Start countdown
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await verifyOTP(email, otp)
      
      if (error) {
        setError(error.message)
      }
      // If successful, user will be automatically updated in AuthContext
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    
    setLoading(true)
    setError('')

    try {
      const { error } = await sendOTP(email)
      
      if (error) {
        setError(error.message)
      } else {
        setResendCooldown(60)
        
        // Start countdown
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <a href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div className="flex-1 text-center">
            <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              {otpSent ? 'Verify Your Email' : 'Create Account'}
            </h2>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll send you a one-time password to verify your email
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
            >
              <Mail className="h-5 w-5" />
              <span>{loading ? 'Sending OTP...' : 'Send One-Time Password'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>OTP sent to {email}</span>
              </div>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  One-Time Password
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Check your email for the verification code
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </form>

            <div className="text-center space-y-2">
              <button
                onClick={() => setOtpSent(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Change email address
              </button>
              
              <div>
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend code in {resendCooldown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-pink-500 hover:text-pink-600 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}