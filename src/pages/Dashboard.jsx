import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, Calendar, Users, Camera, Edit3, ExternalLink, Image, ClipboardList } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [weddings, setWeddings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingWedding, setEditingWedding] = useState(null)
  const [newWedding, setNewWedding] = useState({
    title: '',
    bride_name: '',
    groom_name: '',
    wedding_date: '',
    wedding_time: '',
    venue_name: '',
    venue_address: '',
    photo_password: '',
    rsvp_deadline: '',
    max_guests: 100
  })

  useEffect(() => {
    fetchWeddings()
  }, [user])

  const fetchWeddings = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('weddings')
        .select('*')
        .eq('user_id', user.id)
        .order('wedding_date', { ascending: true })

      if (error) throw error
      setWeddings(data || [])
    } catch (error) {
      console.error('Error fetching weddings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWedding = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('weddings')
        .insert([{
          ...newWedding,
          user_id: user.id
        }])
        .select()

      if (error) throw error
      
      setWeddings([...weddings, data[0]])
      setShowCreateForm(false)
      setNewWedding({
        title: '',
        bride_name: '',
        groom_name: '',
        wedding_date: '',
        wedding_time: '',
        venue_name: '',
        venue_address: '',
        photo_password: '',
        rsvp_deadline: '',
        max_guests: 100
      })
    } catch (error) {
      console.error('Error creating wedding:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditWedding = (wedding) => {
    setEditingWedding({ ...wedding })
    setShowEditForm(true)
  }

  const handleUpdateWedding = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('weddings')
        .update(editingWedding)
        .eq('id', editingWedding.id)
        .select()

      if (error) throw error
      
      // Update the weddings array with the updated wedding
      setWeddings(weddings.map(w => w.id === editingWedding.id ? data[0] : w))
      setShowEditForm(false)
      setEditingWedding(null)
    } catch (error) {
      console.error('Error updating wedding:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getWeddingStatus = (weddingDate) => {
    const today = new Date()
    const wedding = new Date(weddingDate)
    
    if (wedding < today) return 'past'
    if (wedding.toDateString() === today.toDateString()) return 'today'
    return 'upcoming'
  }

  if (loading && weddings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your weddings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Weddings</h1>
            <p className="text-gray-600 mt-1">Manage your wedding events and RSVPs</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-pink-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Wedding</span>
          </button>
        </div>

        {/* Wedding Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {weddings.map((wedding) => {
            const status = getWeddingStatus(wedding.wedding_date)
            return (
              <div key={wedding.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`h-2 ${
                  status === 'past' ? 'bg-gray-400' :
                  status === 'today' ? 'bg-green-500' : 'bg-pink-500'
                }`}></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{wedding.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      status === 'past' ? 'bg-gray-100 text-gray-600' :
                      status === 'today' ? 'bg-green-100 text-green-600' : 'bg-pink-100 text-pink-600'
                    }`}>
                      {status === 'past' ? 'Completed' :
                       status === 'today' ? 'Today!' : 'Upcoming'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(wedding.wedding_date)}</span>
                    </div>
                    {wedding.venue_name && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{wedding.venue_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <a
                        href={`/wedding/${wedding.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded text-center text-sm hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Page</span>
                      </a>
                      <button 
                        onClick={() => handleEditWedding(wedding)}
                        className="flex-1 bg-pink-500 text-white px-4 py-2 rounded text-sm hover:bg-pink-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`/wedding/${wedding.id}/gallery`}
                        className="flex-1 bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Image className="h-4 w-4" />
                        <span>View Photos</span>
                      </a>
                      <a
                        href={`/wedding/${wedding.id}/manage-rsvp`}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <ClipboardList className="h-4 w-4" />
                        <span>View RSVPs</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {weddings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No weddings yet</h3>
            <p className="text-gray-500 mb-6">Create your first wedding to get started!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Create Your First Wedding
            </button>
          </div>
        )}

        {/* Edit Wedding Modal */}
        {showEditForm && editingWedding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Wedding</h2>
                
                <form onSubmit={handleUpdateWedding} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wedding Title *
                      </label>
                      <input
                        type="text"
                        value={editingWedding.title}
                        onChange={(e) => setEditingWedding({...editingWedding, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Sarah & John's Wedding"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wedding Date *
                      </label>
                      <input
                        type="date"
                        value={editingWedding.wedding_date}
                        onChange={(e) => setEditingWedding({...editingWedding, wedding_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bride's Name
                      </label>
                      <input
                        type="text"
                        value={editingWedding.bride_name || ''}
                        onChange={(e) => setEditingWedding({...editingWedding, bride_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Groom's Name
                      </label>
                      <input
                        type="text"
                        value={editingWedding.groom_name || ''}
                        onChange={(e) => setEditingWedding({...editingWedding, groom_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wedding Time
                      </label>
                      <input
                        type="time"
                        value={editingWedding.wedding_time || ''}
                        onChange={(e) => setEditingWedding({...editingWedding, wedding_time: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Photo Upload Password *
                      </label>
                      <input
                        type="text"
                        value={editingWedding.photo_password || ''}
                        onChange={(e) => setEditingWedding({...editingWedding, photo_password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="For guest photo uploads"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      value={editingWedding.venue_name || ''}
                      onChange={(e) => setEditingWedding({...editingWedding, venue_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Address
                    </label>
                    <textarea
                      value={editingWedding.venue_address || ''}
                      onChange={(e) => setEditingWedding({...editingWedding, venue_address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RSVP Deadline
                      </label>
                      <input
                        type="date"
                        value={editingWedding.rsvp_deadline || ''}
                        onChange={(e) => setEditingWedding({...editingWedding, rsvp_deadline: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Guests
                      </label>
                      <input
                        type="number"
                        value={editingWedding.max_guests || 100}
                        onChange={(e) => setEditingWedding({...editingWedding, max_guests: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false)
                        setEditingWedding(null)
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Wedding'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Wedding Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Wedding</h2>
                
                <form onSubmit={handleCreateWedding} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wedding Title *
                      </label>
                      <input
                        type="text"
                        value={newWedding.title}
                        onChange={(e) => setNewWedding({...newWedding, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Sarah & John's Wedding"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wedding Date *
                      </label>
                      <input
                        type="date"
                        value={newWedding.wedding_date}
                        onChange={(e) => setNewWedding({...newWedding, wedding_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bride's Name
                      </label>
                      <input
                        type="text"
                        value={newWedding.bride_name}
                        onChange={(e) => setNewWedding({...newWedding, bride_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Groom's Name
                      </label>
                      <input
                        type="text"
                        value={newWedding.groom_name}
                        onChange={(e) => setNewWedding({...newWedding, groom_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wedding Time
                      </label>
                      <input
                        type="time"
                        value={newWedding.wedding_time}
                        onChange={(e) => setNewWedding({...newWedding, wedding_time: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Photo Upload Password *
                      </label>
                      <input
                        type="text"
                        value={newWedding.photo_password}
                        onChange={(e) => setNewWedding({...newWedding, photo_password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="For guest photo uploads"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      value={newWedding.venue_name}
                      onChange={(e) => setNewWedding({...newWedding, venue_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Address
                    </label>
                    <textarea
                      value={newWedding.venue_address}
                      onChange={(e) => setNewWedding({...newWedding, venue_address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RSVP Deadline
                      </label>
                      <input
                        type="date"
                        value={newWedding.rsvp_deadline}
                        onChange={(e) => setNewWedding({...newWedding, rsvp_deadline: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Guests
                      </label>
                      <input
                        type="number"
                        value={newWedding.max_guests}
                        onChange={(e) => setNewWedding({...newWedding, max_guests: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Wedding'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}