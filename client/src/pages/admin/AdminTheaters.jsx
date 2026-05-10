import React, { useEffect, useState } from 'react'
import Title from '../../components/admin/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { Trash2Icon, PlusIcon, MonitorIcon } from 'lucide-react'

const SCREEN_TYPES = ['Standard', 'IMAX', '4DX', 'Dolby']
const AMENITY_OPTIONS = ['Parking', 'Food Court', 'Wheelchair Access', 'Online Booking', 'Dolby Audio', 'Recliner Seats']

const emptyForm = {
  name: '', address: '', city: '',
  totalSeats: '', screenType: 'Standard',
  amenities: [], image: ''
}

const AdminTheaters = () => {
  const { axios, getToken } = useAppContext()
  const [theaters, setTheaters] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchTheaters = async () => {
    try {
      const { data } = await axios.get('/api/theater/all')
      if (data.success) setTheaters(data.theaters)
    } catch (error) { console.error(error) }
  }

  useEffect(() => { fetchTheaters() }, [])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const toggleAmenity = (a) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a]
    }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.city || !form.totalSeats) {
      return toast.error('Please fill all required fields')
    }
    try {
      setAdding(true)
      const { data } = await axios.post('/api/theater/add', form, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success(data.message)
        setForm(emptyForm)
        setShowForm(false)
        fetchTheaters()
      } else toast.error(data.message)
    } catch (error) { toast.error('Error adding theater') }
    setAdding(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this theater?')) return
    try {
      const { data } = await axios.delete(`/api/theater/delete/${id}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) { toast.success(data.message); fetchTheaters() }
    } catch (error) { toast.error('Error removing theater') }
  }

  return (
    <>
      <div className='flex items-center justify-between'>
        <Title text1="Manage" text2="Theaters" />
        <button
          onClick={() => setShowForm(v => !v)}
          className='flex items-center gap-2 bg-primary hover:bg-primary-dull text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer'>
          <PlusIcon className='w-4 h-4' />
          {showForm ? 'Cancel' : 'Add Theater'}
        </button>
      </div>

      {/* Add Theater Form */}
      {showForm && (
        <div className='mt-6 bg-gray-800/60 border border-gray-700 rounded-2xl p-6 max-w-2xl'>
          <p className='font-medium mb-4'>New Theater</p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='text-xs text-gray-400 mb-1 block'>Theater Name *</label>
              <input name='name' value={form.name} onChange={handleChange}
                placeholder='e.g. PVR Cinemas'
                className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none' />
            </div>
            <div>
              <label className='text-xs text-gray-400 mb-1 block'>City *</label>
              <input name='city' value={form.city} onChange={handleChange}
                placeholder='e.g. Bangalore'
                className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none' />
            </div>
            <div className='sm:col-span-2'>
              <label className='text-xs text-gray-400 mb-1 block'>Address *</label>
              <input name='address' value={form.address} onChange={handleChange}
                placeholder='e.g. 123 MG Road, Koramangala'
                className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none' />
            </div>
            <div>
              <label className='text-xs text-gray-400 mb-1 block'>Total Seats *</label>
              <input name='totalSeats' type='number' min={1} value={form.totalSeats} onChange={handleChange}
                placeholder='e.g. 200'
                className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none' />
            </div>
            <div>
              <label className='text-xs text-gray-400 mb-1 block'>Screen Type</label>
              <select name='screenType' value={form.screenType} onChange={handleChange}
                className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none'>
                {SCREEN_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className='sm:col-span-2'>
              <label className='text-xs text-gray-400 mb-1 block'>Image URL (optional)</label>
              <input name='image' value={form.image} onChange={handleChange}
                placeholder='https://...'
                className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none' />
            </div>
          </div>

          <div className='mt-4'>
            <label className='text-xs text-gray-400 mb-2 block'>Amenities</label>
            <div className='flex flex-wrap gap-2'>
              {AMENITY_OPTIONS.map(a => (
                <button key={a} type='button' onClick={() => toggleAmenity(a)}
                  className={`text-xs px-3 py-1 rounded-full border transition cursor-pointer
                    ${form.amenities.includes(a)
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={adding}
            className='mt-5 bg-primary hover:bg-primary-dull text-white px-6 py-2 rounded-lg text-sm transition cursor-pointer disabled:opacity-60'>
            {adding ? 'Adding...' : 'Add Theater'}
          </button>
        </div>
      )}

      {/* Theaters List */}
      <div className='mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
        {theaters.length === 0 ? (
          <div className='col-span-3 text-center py-20 text-gray-500'>
            <MonitorIcon className='w-10 h-10 mx-auto mb-3 opacity-30' />
            <p>No theaters added yet. Click "Add Theater" to get started.</p>
          </div>
        ) : theaters.map(theater => (
          <div key={theater._id} className='bg-gray-800/60 border border-gray-700 rounded-2xl p-4'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='font-semibold'>{theater.name}</p>
                <p className='text-sm text-gray-400 mt-0.5'>{theater.address}, {theater.city}</p>
              </div>
              <button onClick={() => handleDelete(theater._id)}
                className='text-gray-500 hover:text-red-400 transition cursor-pointer ml-2 shrink-0'>
                <Trash2Icon className='w-4 h-4' />
              </button>
            </div>
            <div className='flex gap-3 mt-3 text-xs text-gray-400'>
              <span className='bg-gray-700 px-2 py-0.5 rounded-full'>{theater.screenType}</span>
              <span className='bg-gray-700 px-2 py-0.5 rounded-full'>{theater.totalSeats} seats</span>
            </div>
            {theater.amenities?.length > 0 && (
              <div className='flex flex-wrap gap-1 mt-2'>
                {theater.amenities.map((a, i) => (
                  <span key={i} className='text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded-full'>{a}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default AdminTheaters