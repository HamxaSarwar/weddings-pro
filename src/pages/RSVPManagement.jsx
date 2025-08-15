import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Users, UserCheck, UserX, Calendar, Phone, Mail, ChefHat, Music } from 'lucide-react'

export default function RSVPManagement() {
  const { weddingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [wedding, setWedding] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    attending: 0,
    notAttending: 0,
    pending: 0,
    totalGuests: 0
  })

  useEffect(() => {
    fetchWeddingAndRSVPs()
  }, [weddingId, user])

  const fetchWeddingAndRSVPs = async () => {
    if (!user || !weddingId) return
    
    try {
      // Fetch wedding details
      const { data: weddingData, error: weddingError } = await supabase
        .from('weddings')
        .select('*')
        .eq('id', weddingId)
        .eq('user_id', user.id)
        .single()

      if (weddingError) throw weddingError
      setWedding(weddingData)

      // Fetch RSVPs first
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false })

      if (rsvpError) throw rsvpError

      // Fetch additional guests separately for each RSVP
      const rsvpsWithGuests = []
      for (const rsvp of rsvpData || []) {
        const { data: guestsData, error: guestsError } = await supabase
          .from('additional_guests')
          .select('*')
          .eq('rsvp_id', rsvp.id)

        if (guestsError) {
          console.error('Error fetching additional guests:', guestsError)
        }

        rsvpsWithGuests.push({
          ...rsvp,
          additional_guests: guestsData || []
        })
      }

      setRsvps(rsvpsWithGuests)

      // Calculate statistics
      const attending = rsvpsWithGuests.filter(rsvp => rsvp.attending === true) || []
      const notAttending = rsvpsWithGuests.filter(rsvp => rsvp.attending === false) || []
      const pending = rsvpsWithGuests.filter(rsvp => rsvp.attending === null) || []
      
      const totalGuests = rsvpsWithGuests.reduce((total, rsvp) => {
        if (rsvp.attending === true) {
          return total + 1 + (rsvp.additional_guests?.length || 0)
        }
        return total
      }, 0)

      setStats({
        total: rsvpsWithGuests.length,
        attending: attending.length,
        notAttending: notAttending.length,
        pending: pending.length,
        totalGuests
      })

    } catch (error) {
      console.error('Error fetching data:', error)
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

  const getStatusBadge = (attending) => {
    if (attending === true) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Attending</span>
    } else if (attending === false) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">Not Attending</span>
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">Pending</span>
    }
  }

  const getStatusIcon = (attending) => {
    if (attending === true) {
      return <UserCheck className="h-5 w-5 text-green-500" />
    } else if (attending === false) {
      return <UserX className="h-5 w-5 text-red-500" />
    } else {
      return <Users className="h-5 w-5 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading RSVPs...</p>
        </div>
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wedding not found</h1>
          <p className="text-gray-600 mb-4">This wedding doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{wedding.title}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
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
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total RSVPs</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.attending}</div>
            <div className="text-sm text-gray-600">Attending</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.notAttending}</div>
            <div className="text-sm text-gray-600">Not Attending</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.totalGuests}</div>
            <div className="text-sm text-gray-600">Total Guests</div>
          </div>
        </div>

        {/* RSVP List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">RSVP Responses</h2>
            <p className="text-gray-600 mt-1">Manage and view all guest responses for your wedding</p>
          </div>

          {rsvps.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No RSVPs yet</h3>
              <p className="text-gray-500">Guests haven't started responding to your wedding invitation.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rsvps.map((rsvp) => (
                <div key={rsvp.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getStatusIcon(rsvp.attending)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{rsvp.guest_name}</h3>
                          {getStatusBadge(rsvp.attending)}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          {rsvp.guest_email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{rsvp.guest_email}</span>
                            </div>
                          )}
                          {rsvp.guest_phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{rsvp.guest_phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Additional Guests */}
                        {rsvp.additional_guests && rsvp.additional_guests.length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Guests ({rsvp.additional_guests.length})</h4>
                            <div className="space-y-1">
                              {rsvp.additional_guests.map((guest, index) => (
                                <div key={index} className="text-sm text-gray-600">
                                  {guest.name}
                                  {guest.dietary_restrictions && (
                                    <span className="ml-2 text-xs text-orange-600">
                                      • {guest.dietary_restrictions}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Special Requests */}
                        <div className="mt-3 grid md:grid-cols-2 gap-4">
                          {rsvp.dietary_restrictions && (
                            <div className="flex items-start space-x-2">
                              <ChefHat className="h-4 w-4 text-orange-500 mt-0.5" />
                              <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Dietary Restrictions</div>
                                <div className="text-sm text-gray-700">{rsvp.dietary_restrictions}</div>
                              </div>
                            </div>
                          )}
                          {rsvp.song_request && (
                            <div className="flex items-start space-x-2">
                              <Music className="h-4 w-4 text-purple-500 mt-0.5" />
                              <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Song Request</div>
                                <div className="text-sm text-gray-700">{rsvp.song_request}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {rsvp.message && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Message</div>
                            <div className="text-sm text-blue-800">{rsvp.message}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(rsvp.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}