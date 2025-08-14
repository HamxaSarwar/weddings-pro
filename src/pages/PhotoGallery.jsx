import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Download, Trash2, Image as ImageIcon, Calendar, Users } from 'lucide-react'

export default function PhotoGallery() {
  const { weddingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [wedding, setWedding] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [downloadingAll, setDownloadingAll] = useState(false)

  useEffect(() => {
    fetchWeddingAndPhotos()
  }, [weddingId, user])

  const fetchWeddingAndPhotos = async () => {
    if (!user) {
      navigate('/')
      return
    }

    try {
      // Fetch wedding details
      const { data: weddingData, error: weddingError } = await supabase
        .from('weddings')
        .select('*')
        .eq('id', weddingId)
        .eq('user_id', user.id)
        .single()

      if (weddingError) throw weddingError
      if (!weddingData) {
        alert('Wedding not found or you do not have permission to view it.')
        navigate('/dashboard')
        return
      }

      setWedding(weddingData)

      // Fetch wedding photos
      const { data: photosData, error: photosError } = await supabase
        .from('wedding_photos')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('uploaded_at', { ascending: false })

      if (photosError) throw photosError

      // Generate signed URLs for each photo
      const photosWithUrls = await Promise.all(
        photosData.map(async (photo) => {
          const { data: urlData } = await supabase.storage
            .from('wedding-photos')
            .createSignedUrl(photo.file_path, 3600) // 1 hour expiry

          return {
            ...photo,
            url: urlData?.signedUrl || null
          }
        })
      )

      setPhotos(photosWithUrls.filter(photo => photo.url))
    } catch (error) {
      console.error('Error fetching wedding photos:', error)
      alert('Error loading photos. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadPhoto = async (photo) => {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = photo.file_name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading photo:', error)
      alert('Error downloading photo. Please try again.')
    }
  }

  const downloadAllPhotos = async () => {
    if (photos.length === 0) return

    setDownloadingAll(true)
    try {
      for (const photo of photos) {
        await downloadPhoto(photo)
        // Small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      alert(`Downloaded all ${photos.length} photos!`)
    } catch (error) {
      console.error('Error downloading all photos:', error)
      alert('Error downloading photos. Some may have been downloaded successfully.')
    } finally {
      setDownloadingAll(false)
    }
  }

  const deletePhoto = async (photo) => {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('wedding-photos')
        .remove([photo.file_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('wedding_photos')
        .delete()
        .eq('id', photo.id)

      if (dbError) throw dbError

      // Update local state
      setPhotos(photos.filter(p => p.id !== photo.id))
      setSelectedPhoto(null)
      alert('Photo deleted successfully.')
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Error deleting photo. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading photos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{wedding?.title} - Photo Gallery</h1>
              <p className="text-gray-600 mt-1">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
              </p>
            </div>
          </div>
          
          {photos.length > 0 && (
            <button
              onClick={downloadAllPhotos}
              disabled={downloadingAll}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>{downloadingAll ? 'Downloading...' : 'Download All'}</span>
            </button>
          )}
        </div>

        {/* Wedding Info */}
        {wedding && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center space-x-6 text-gray-700">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-pink-500" />
                <span>{formatDate(wedding.wedding_date)}</span>
              </div>
              {wedding.venue_name && (
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-pink-500" />
                  <span>{wedding.venue_name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No photos yet</h3>
            <p className="text-gray-500 mb-6">
              Photos uploaded by your guests will appear here after the wedding.
            </p>
            <a
              href={`/wedding/${weddingId}`}
              className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              View Wedding Page
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                <div className="aspect-square relative">
                  <img
                    src={photo.url}
                    alt={photo.file_name}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedPhoto(photo)}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadPhoto(photo)
                        }}
                        className="bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePhoto(photo)
                        }}
                        className="bg-red-500 bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900 truncate">{photo.file_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(photo.file_size)} • {new Date(photo.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              >
                <div className="bg-black bg-opacity-50 rounded-full p-2">
                  <ArrowLeft className="h-6 w-6" />
                </div>
              </button>
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.file_name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
                <p className="font-medium">{selectedPhoto.file_name}</p>
                <p className="text-sm text-gray-300 mt-1">
                  {formatFileSize(selectedPhoto.file_size)} • Uploaded {new Date(selectedPhoto.uploaded_at).toLocaleString()}
                </p>
                <div className="flex space-x-4 mt-3">
                  <button
                    onClick={() => downloadPhoto(selectedPhoto)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => deletePhoto(selectedPhoto)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}