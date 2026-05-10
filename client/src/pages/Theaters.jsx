import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import { MapPinIcon, MonitorIcon, UsersIcon } from 'lucide-react'

const screenColors = {
  IMAX: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  '4DX': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Dolby: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Standard: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const Theaters = () => {
  const { axios } = useAppContext()
  const [theaters, setTheaters] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('All')

  const fetchTheaters = async () => {
    try {
      const { data } = await axios.get('/api/theater/all')
      if (data.success) setTheaters(data.theaters)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  useEffect(() => { fetchTheaters() }, [])

  const cities = ['All', ...new Set(theaters.map(t => t.city))]
  const filtered = selectedCity === 'All' ? theaters : theaters.filter(t => t.city === selectedCity)

  if (loading) return <Loading />

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-screen'>
      <div className='relative'>
        <BlurCircle top="0px" left="-100px" />
        <h1 className='text-3xl font-semibold mb-2'>Our Theaters</h1>
        <p className='text-gray-400 mb-8'>Find a theater near you and enjoy the best cinematic experience</p>
      </div>

      {/* City filter */}
      {cities.length > 1 && (
        <div className='flex flex-wrap gap-2 mb-8'>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-1.5 rounded-full text-sm border transition cursor-pointer
                ${selectedCity === city
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-600 text-gray-400 hover:border-primary hover:text-white'}`}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className='text-center py-24 text-gray-400'>
          <MonitorIcon className='w-12 h-12 mx-auto mb-4 opacity-30' />
          <p className='text-lg'>No theaters available yet.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20'>
          {filtered.map(theater => (
            <div key={theater._id} className='bg-gray-800/60 border border-gray-700 rounded-2xl p-5 hover:-translate-y-1 transition duration-300'>
              {theater.image ? (
                <img src={theater.image} alt={theater.name}
                  className='w-full h-36 object-cover rounded-xl mb-4'
                  onError={(e) => { e.target.style.display = 'none' }} />
              ) : (
                <div className='w-full h-36 bg-gray-700 rounded-xl mb-4 flex items-center justify-center'>
                  <MonitorIcon className='w-10 h-10 text-gray-500' />
                </div>
              )}

              <div className='flex items-start justify-between gap-2'>
                <h2 className='font-semibold text-lg leading-tight'>{theater.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${screenColors[theater.screenType] || screenColors.Standard}`}>
                  {theater.screenType}
                </span>
              </div>

              <div className='flex items-center gap-1.5 text-gray-400 text-sm mt-2'>
                <MapPinIcon className='w-4 h-4 text-primary shrink-0' />
                <span>{theater.address}, {theater.city}</span>
              </div>

              <div className='flex items-center gap-1.5 text-gray-400 text-sm mt-1.5'>
                <UsersIcon className='w-4 h-4 text-primary shrink-0' />
                <span>{theater.totalSeats} seats</span>
              </div>

              {theater.amenities?.length > 0 && (
                <div className='flex flex-wrap gap-1.5 mt-3'>
                  {theater.amenities.map((a, i) => (
                    <span key={i} className='text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full'>{a}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Theaters