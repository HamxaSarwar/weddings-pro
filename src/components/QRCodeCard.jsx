import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import { Download, X, QrCode, Camera, Smartphone, Upload } from 'lucide-react'

export default function QRCodeCard({ wedding, isOpen, onClose }) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const cardRef = useRef(null)

  const weddingURL = `${window.location.origin}/wedding/${wedding.id}`

  useEffect(() => {
    if (isOpen && wedding) {
      generateQRCode()
    }
  }, [isOpen, wedding])

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      const qrDataURL = await QRCode.toDataURL(weddingURL, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1f2937', // Dark gray
          light: '#ffffff'
        }
      })
      setQrCodeDataURL(qrDataURL)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCard = async () => {
    if (!cardRef.current) return
    
    setIsDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        width: 800,
        height: 1000,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      })
      
      const link = document.createElement('a')
      link.download = `${wedding.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_photo_sharing_card.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Error downloading card:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Photo Sharing QR Code</h2>
              <p className="text-gray-600">Generate a printable card for your wedding tables</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Preview Panel */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Preview</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="mx-auto" style={{ width: '320px', height: '400px', overflow: 'hidden' }}>
                  <div
                    ref={cardRef}
                    className="bg-white shadow-lg"
                    style={{ 
                      width: '800px', 
                      height: '1000px',
                      transform: 'scale(0.4)',
                      transformOrigin: 'top left',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {/* Card Content */}
                    <div className="h-full flex flex-col">
                      {/* Pink Header */}
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-12 text-center">
                        <div className="flex items-center justify-center mb-6">
                          <Camera className="h-16 w-16 mr-4" />
                          <h1 className="text-6xl font-bold">Share Your Photos!</h1>
                        </div>
                        <div className="text-3xl font-medium opacity-90">
                          Help us capture every magical moment
                        </div>
                      </div>

                      {/* Wedding Details */}
                      <div className="px-12 py-8 text-center bg-gray-50">
                        <h2 className="text-5xl font-bold text-gray-800 mb-4">{wedding.title}</h2>
                        {(wedding.bride_name && wedding.groom_name) && (
                          <p className="text-3xl text-gray-600 mb-2">
                            {wedding.bride_name} & {wedding.groom_name}
                          </p>
                        )}
                        <p className="text-2xl text-gray-600">
                          {formatDate(wedding.wedding_date)}
                        </p>
                      </div>

                      {/* QR Code Section */}
                      <div className="flex-1 flex flex-col items-center justify-center px-12 py-8">
                        <div className="text-center mb-8">
                          <QrCode className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                          <h3 className="text-4xl font-bold text-gray-800 mb-4">Scan to Upload Photos</h3>
                          <p className="text-2xl text-gray-600">
                            Use your phone camera to scan the QR code below
                          </p>
                        </div>

                        {/* QR Code */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border-4 border-pink-500 mb-8">
                          {isGenerating ? (
                            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                            </div>
                          ) : qrCodeDataURL ? (
                            <img
                              src={qrCodeDataURL}
                              alt="QR Code"
                              className="w-48 h-48"
                            />
                          ) : (
                            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                              <QrCode className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 rounded-xl p-8 mb-8 border-2 border-blue-200">
                          <h4 className="text-3xl font-bold text-blue-800 mb-6">How to Share Photos:</h4>
                          <div className="space-y-4 text-2xl text-blue-700">
                            <div className="flex items-center">
                              <Smartphone className="h-8 w-8 mr-4 text-blue-500" />
                              <span>1. Open your phone's camera app</span>
                            </div>
                            <div className="flex items-center">
                              <QrCode className="h-8 w-8 mr-4 text-blue-500" />
                              <span>2. Point at the QR code above</span>
                            </div>
                            <div className="flex items-center">
                              <Upload className="h-8 w-8 mr-4 text-blue-500" />
                              <span>3. Tap the link that appears</span>
                            </div>
                            <div className="flex items-center">
                              <Camera className="h-8 w-8 mr-4 text-blue-500" />
                              <span>4. Enter password and upload photos!</span>
                            </div>
                          </div>
                        </div>

                        {/* Password Box */}
                        <div className="bg-yellow-100 border-4 border-yellow-400 rounded-xl p-8 text-center">
                          <h4 className="text-3xl font-bold text-yellow-800 mb-4">Photo Upload Password:</h4>
                          <div className="bg-yellow-200 border-2 border-yellow-500 rounded-lg px-8 py-6">
                            <span className="text-5xl font-bold text-yellow-900 font-mono">
                              {wedding.photo_password}
                            </span>
                          </div>
                          <p className="text-xl text-yellow-700 mt-4">
                            Enter this password when prompted to upload photos
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="bg-gray-800 text-white px-12 py-8 text-center">
                        <p className="text-2xl">
                          Thank you for helping us capture our special day! 💕
                        </p>
                        <p className="text-xl text-gray-300 mt-2">
                          {weddingURL}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Options</h3>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <QrCode className="h-6 w-6 text-blue-500 mr-3" />
                    <h4 className="font-semibold text-blue-900">QR Code Details</h4>
                  </div>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div><strong>Links to:</strong> {weddingURL}</div>
                    <div><strong>Password:</strong> {wedding.photo_password}</div>
                    <div><strong>Card Size:</strong> 800x1000px (5:4 ratio)</div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Download className="h-6 w-6 text-green-500 mr-3" />
                    <h4 className="font-semibold text-green-900">Printing Tips</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• Perfect for 8x10 inch printing</li>
                    <li>• High resolution (1600x2000px output)</li>
                    <li>• Place on wedding tables or reception area</li>
                    <li>• Works with any smartphone camera</li>
                    <li>• Password prominently displayed</li>
                  </ul>
                </div>

                <button
                  onClick={downloadCard}
                  disabled={isDownloading || !qrCodeDataURL}
                  className="w-full bg-pink-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      <span>Download Printable Card (PNG)</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}