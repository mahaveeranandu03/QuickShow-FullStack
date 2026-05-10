import React, { useEffect, useState } from 'react'
import { StarIcon, Trash2Icon } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const StarRating = ({ value, onChange }) => (
  <div className='flex gap-1'>
    {[1, 2, 3, 4, 5].map(star => (
      <button key={star} type='button' onClick={() => onChange && onChange(star)} className='cursor-pointer'>
        <StarIcon className={`w-5 h-5 transition ${star <= value ? 'text-primary fill-primary' : 'text-gray-600'}`} />
      </button>
    ))}
  </div>
)

const MovieReviews = ({ movieId }) => {
  const { axios, getToken, user } = useAppContext()
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/review/${movieId}`)
      if (data.success) {
        setReviews(data.reviews)
        setAvgRating(data.avgRating)
        setTotalReviews(data.totalReviews)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => { fetchReviews() }, [movieId])

  const handleSubmit = async () => {
    if (!user) return toast.error('Please login to submit a review')
    if (!rating) return toast.error('Please select a rating')
    if (!comment.trim()) return toast.error('Please write a comment')

    try {
      setSubmitting(true)
      const { data } = await axios.post('/api/review/add', {
        movieId,
        rating,
        comment,
        userName: user.fullName || user.firstName || 'User',
        userImage: user.imageUrl || '',
      }, { headers: { Authorization: `Bearer ${await getToken()}` } })

      if (data.success) {
        toast.success(data.message)
        setRating(0)
        setComment('')
        fetchReviews()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to submit review')
    }
    setSubmitting(false)
  }

  const handleDelete = async (reviewId) => {
    try {
      const { data } = await axios.delete(`/api/review/delete/${reviewId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success('Review deleted')
        fetchReviews()
      }
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className='mt-16'>
      <div className='flex items-center gap-4 mb-6'>
        <h2 className='text-xl font-semibold'>User Reviews</h2>
        {totalReviews > 0 && (
          <div className='flex items-center gap-1.5 text-gray-400 text-sm'>
            <StarIcon className='w-4 h-4 text-primary fill-primary' />
            <span className='text-white font-medium'>{avgRating}</span>
            <span>({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
          </div>
        )}
      </div>

      {/* Write a review */}
      <div className='bg-gray-800/60 border border-gray-700 rounded-2xl p-5 mb-8'>
        <p className='font-medium mb-3'>Write a Review</p>
        <StarRating value={rating} onChange={setRating} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder='Share your thoughts about this movie...'
          rows={3}
          className='w-full mt-3 bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none resize-none placeholder:text-gray-500'
        />
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className='mt-3 px-6 py-2 bg-primary hover:bg-primary-dull text-white text-sm rounded-lg transition cursor-pointer disabled:opacity-60'
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className='text-gray-500 text-sm'>No reviews yet. Be the first to review!</p>
      ) : (
        <div className='space-y-4'>
          {reviews.map((review) => (
            <div key={review._id} className='bg-gray-800/40 border border-gray-700/50 rounded-xl p-4'>
              <div className='flex items-start justify-between gap-2'>
                <div className='flex items-center gap-3'>
                  {review.userImage ? (
                    <img src={review.userImage} alt={review.userName}
                      className='w-9 h-9 rounded-full object-cover'
                      onError={(e) => { e.target.style.display = 'none' }} />
                  ) : (
                    <div className='w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-sm font-medium text-primary'>
                      {review.userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className='font-medium text-sm'>{review.userName}</p>
                    <p className='text-xs text-gray-500'>{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <StarRating value={review.rating} />
                  {user && review.user === user.id && (
                    <button onClick={() => handleDelete(review._id)}
                      className='text-gray-500 hover:text-red-400 transition cursor-pointer'>
                      <Trash2Icon className='w-4 h-4' />
                    </button>
                  )}
                </div>
              </div>
              <p className='text-gray-300 text-sm mt-3 leading-relaxed'>{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MovieReviews