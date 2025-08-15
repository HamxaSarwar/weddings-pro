import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Heart, Calendar, MapPin, Users, Plus, Minus, Camera, Upload, X, Image, Smartphone } from 'lucide-react'

export default function WeddingPage() {
  const { weddingId } = useParams()
  const [wedding, setWedding] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('rsvp') // 'rsvp' or 'photos'
  const [rsvpForm, setRsvpForm] = useState({
    primary_guest_name: '',
    primary_guest_email: '',
    primary_guest_phone: '',
    attending: true,
    dietary_restrictions: '',
    song_request: '',
    message: '',
    additional_guests: []
  })
  const [photoPassword, setPhotoPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const [capturedPhoto, setCapturedPhoto] = useState(null)

  useEffect(() => {
    fetchWedding()
  }, [weddingId])

  useEffect(() => {
    // Determine mode based on wedding date
    if (wedding) {
      const today = new Date()
      const weddingDate = new Date(wedding.wedding_date)
      const isWeddingDay = weddingDate.toDateString() === today.toDateString()
      const isAfterWedding = weddingDate < today

      if (isWeddingDay || isAfterWedding) {
        setMode('photos')
      } else {
        setMode('rsvp')
      }
    }
  }, [wedding])

  const fetchWedding = async () => {
    try {
      const { data, error } = await supabase
        .from('weddings')
        .select('*')
        .eq('id', weddingId)
        .single()

      if (error) throw error
      setWedding(data)
    } catch (error) {
      console.error('Error fetching wedding:', error)
    } finally {
      setLoading(false)
    }
  }

  const addGuest = () => {
    setRsvpForm({
      ...rsvpForm,
      additional_guests: [
        ...rsvpForm.additional_guests,
        { first_name: '', last_name: '', dietary_restrictions: '', song_request: '' }
      ]
    })
  }

  const removeGuest = (index) => {
    const newGuests = rsvpForm.additional_guests.filter((_, i) => i !== index)
    setRsvpForm({ ...rsvpForm, additional_guests: newGuests })
  }

  const updateGuest = (index, field, value) => {
    const newGuests = [...rsvpForm.additional_guests]
    newGuests[index] = { ...newGuests[index], [field]: value }
    setRsvpForm({ ...rsvpForm, additional_guests: newGuests })
  }

  const submitRSVP = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Basic validation
      if (!rsvpForm.primary_guest_name || !rsvpForm.primary_guest_name.trim()) {
        alert('Please enter your name.')
        return
      }
      // Insert RSVP (only fields that belong in rsvps table)
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .insert([{
          wedding_id: weddingId,
          primary_guest_name: rsvpForm.primary_guest_name,
          primary_guest_email: rsvpForm.primary_guest_email,
          primary_guest_phone: rsvpForm.primary_guest_phone,
          attending: rsvpForm.attending,
          dietary_restrictions: rsvpForm.dietary_restrictions,
          song_request: rsvpForm.song_request,
          message: rsvpForm.message,
          total_guests: 1 + rsvpForm.additional_guests.length
        }])
        .select()

      if (rsvpError) throw rsvpError

      // Insert additional guests (only those with names provided)
      if (rsvpForm.additional_guests.length > 0) {
        const validGuests = rsvpForm.additional_guests.filter(guest => 
          guest.first_name && guest.first_name.trim() && 
          guest.last_name && guest.last_name.trim()
        )

        if (validGuests.length > 0) {
          const guestsToInsert = validGuests.map(guest => ({
            rsvp_id: rsvpData[0].id,
            first_name: guest.first_name.trim(),
            last_name: guest.last_name.trim(),
            dietary_restrictions: guest.dietary_restrictions || null,
            song_request: guest.song_request || null
          }))

          const { error: guestsError } = await supabase
            .from('additional_guests')
            .insert(guestsToInsert)

          if (guestsError) {
            console.error('Error inserting additional guests:', guestsError)
            throw guestsError
          }
        }
      }

      alert('RSVP submitted successfully!')
      // Reset form
      setRsvpForm({
        primary_guest_name: '',
        primary_guest_email: '',
        primary_guest_phone: '',
        attending: true,
        dietary_restrictions: '',
        song_request: '',
        message: '',
        additional_guests: []
      })
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Error submitting RSVP. Please try again.'
      
      if (error.message) {
        if (error.message.includes('primary_guest_name')) {
          errorMessage = 'Please enter your name.'
        } else if (error.message.includes('wedding_id')) {
          errorMessage = 'Invalid wedding ID. Please refresh the page and try again.'
        } else if (error.message.includes('duplicate')) {
          errorMessage = 'You have already submitted an RSVP for this wedding.'
        } else if (error.message.includes('schema cache') || error.message.includes('additional_guests')) {
          errorMessage = 'Database schema error. Please refresh the page and try again.'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const verifyPhotoPassword = () => {
    if (photoPassword === wedding.photo_password) {
      setShowPasswordForm(false)
      setShowPhotoUpload(true)
    } else {
      alert('Incorrect password. Please try again.')
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isValidType && isValidSize
    })
    
    if (validFiles.length !== files.length) {
      alert('Some files were not selected because they are not images or exceed 10MB limit.')
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadPhotos = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      console.log(`Starting upload of ${selectedFiles.length} files...`)
      
      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index]
        console.log(`Uploading file ${index + 1}:`, file.name, file.size, file.type)
        
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${weddingId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        console.log(`Uploading to path: ${fileName}`)
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('wedding-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          throw new Error(`Storage upload failed: ${uploadError.message}`)
        }

        console.log('Upload successful:', uploadData)

        // Save photo record to database
        const { error: dbError } = await supabase
          .from('wedding_photos')
          .insert([{
            wedding_id: weddingId,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            content_type: file.type,
            uploaded_by_ip: null
          }])

        if (dbError) {
          console.error('Database insert error:', dbError)
          throw new Error(`Database insert failed: ${dbError.message}`)
        }

        console.log(`File ${index + 1} uploaded successfully`)

        // Update progress
        const progress = ((index + 1) / selectedFiles.length) * 100
        setUploadProgress(progress)
      }
      
      alert(`Successfully uploaded ${selectedFiles.length} photo(s)! Thank you for sharing your memories.`)
      setSelectedFiles([])
      setShowPhotoUpload(false)
      setShowPasswordForm(false)
      setPhotoPassword('')
    } catch (error) {
      console.error('Detailed upload error:', error)
      alert(`Error uploading photos: ${error.message}. Please check console for details.`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false
      })
      setStream(mediaStream)
      setShowCamera(true)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions or use "Select Photos" instead.')
    }
  }

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
    setCapturedPhoto(null)
  }

  const capturePhoto = () => {
    const video = document.getElementById('camera-video')
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
      setSelectedFiles(prev => [...prev, file])
      closeCamera()
    }, 'image/jpeg', 0.8)
  }

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wedding details...</p>
        </div>
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Wedding Not Found</h1>
          <p className="text-gray-500">The wedding you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Wedding Header */}
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-pink-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{wedding.title}</h1>
          {(wedding.bride_name || wedding.groom_name) && (
            <p className="text-xl text-gray-600 mb-4">
              {wedding.bride_name} & {wedding.groom_name}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-700">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-pink-500" />
              <span>{formatDate(wedding.wedding_date)}</span>
              {wedding.wedding_time && <span>at {formatTime(wedding.wedding_time)}</span>}
            </div>
            {wedding.venue_name && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-pink-500" />
                <span>{wedding.venue_name}</span>
              </div>
            )}
          </div>

          {wedding.venue_address && (
            <p className="text-gray-600 mt-2">{wedding.venue_address}</p>
          )}
        </div>

        {mode === 'rsvp' ? (
          /* RSVP Form */
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">RSVP</h2>
            
            <form onSubmit={submitRSVP} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={rsvpForm.primary_guest_name}
                    onChange={(e) => setRsvpForm({...rsvpForm, primary_guest_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={rsvpForm.primary_guest_email}
                    onChange={(e) => setRsvpForm({...rsvpForm, primary_guest_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={rsvpForm.primary_guest_phone}
                  onChange={(e) => setRsvpForm({...rsvpForm, primary_guest_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Will you be attending? *
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setRsvpForm({...rsvpForm, attending: true})}
                    className={`px-4 py-2 rounded-md ${
                      rsvpForm.attending 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes, I'll be there!
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpForm({...rsvpForm, attending: false})}
                    className={`px-4 py-2 rounded-md ${
                      !rsvpForm.attending 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sorry, can't make it
                  </button>
                </div>
              </div>

              {rsvpForm.attending && (
                <>
                  {/* Additional Guests */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Guests
                      </label>
                      <button
                        type="button"
                        onClick={addGuest}
                        className="flex items-center space-x-1 text-pink-500 hover:text-pink-600"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm">Add Guest</span>
                      </button>
                    </div>

                    {rsvpForm.additional_guests.map((guest, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-medium text-gray-700">Guest {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeGuest(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            placeholder="First Name"
                            value={guest.first_name}
                            onChange={(e) => updateGuest(index, 'first_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={guest.last_name}
                            onChange={(e) => updateGuest(index, 'last_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Dietary restrictions"
                            value={guest.dietary_restrictions}
                            onChange={(e) => updateGuest(index, 'dietary_restrictions', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <input
                            type="text"
                            placeholder="Song request"
                            value={guest.song_request}
                            onChange={(e) => updateGuest(index, 'song_request', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dietary Restrictions
                      </label>
                      <input
                        type="text"
                        value={rsvpForm.dietary_restrictions}
                        onChange={(e) => setRsvpForm({...rsvpForm, dietary_restrictions: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Any food allergies or dietary needs?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Song Request
                      </label>
                      <input
                        type="text"
                        value={rsvpForm.song_request}
                        onChange={(e) => setRsvpForm({...rsvpForm, song_request: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Request a song for the reception"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message for the Couple
                    </label>
                    <textarea
                      value={rsvpForm.message}
                      onChange={(e) => setRsvpForm({...rsvpForm, message: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      rows={3}
                      placeholder="Share your excitement or well wishes!"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit RSVP'}
              </button>
            </form>
          </div>
        ) : (
          /* Photo Upload Section */
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Share Your Photos
            </h2>
            
            {!showPasswordForm && !showPhotoUpload ? (
              <div className="text-center">
                <Camera className="h-16 w-16 text-pink-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">
                  Help capture the magic of this special day by sharing your photos!
                </p>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="bg-pink-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-600 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Photos</span>
                </button>
              </div>
            ) : showPasswordForm ? (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Enter Photo Upload Password
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Please enter the password provided by the couple to upload photos.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="password"
                    value={photoPassword}
                    onChange={(e) => setPhotoPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter password"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={verifyPhotoPassword}
                      className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            ) : showCamera ? (
              /* Camera Interface */
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Take a Photo
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Position yourself and click "Capture" to take a photo
                  </p>
                </div>

                <div className="relative bg-black rounded-lg overflow-hidden mb-6">
                  <video
                    id="camera-video"
                    ref={(video) => {
                      if (video && stream) {
                        video.srcObject = stream
                        video.play()
                      }
                    }}
                    className="w-full h-auto max-h-96 object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={closeCamera}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-pink-500 text-white px-4 py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Capture Photo</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Photo Upload Interface */
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Wedding Photos
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Share your beautiful moments from the wedding. You can upload multiple photos at once.
                  </p>
                </div>

                {/* Upload Options */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <input
                      type="file"
                      id="file-input"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => document.getElementById('file-input').click()}
                      className="w-full bg-pink-500 text-white p-4 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Image className="h-6 w-6" />
                      <span>Select Photos</span>
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={openCamera}
                      className="w-full bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Camera className="h-6 w-6" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Selected Photos ({selectedFiles.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading photos...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowPhotoUpload(false)
                      setSelectedFiles([])
                      setPhotoPassword('')
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={uploadPhotos}
                    disabled={selectedFiles.length === 0 || uploading}
                    className="flex-1 bg-pink-500 text-white px-4 py-3 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Upload className="h-5 w-5" />
                    <span>
                      {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}