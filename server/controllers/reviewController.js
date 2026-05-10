import Review from "../models/Review.js";

// Get all reviews for a movie
export const getMovieReviews = async (req, res) => {
    try {
        const { movieId } = req.params;
        const reviews = await Review.find({ movie: movieId }).sort({ createdAt: -1 });
        const avgRating = reviews.length
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;
        res.json({ success: true, reviews, avgRating, totalReviews: reviews.length });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add or update a review
export const addReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { movieId, rating, comment, userName, userImage } = req.body;

        if (!movieId || !rating || !comment) {
            return res.json({ success: false, message: 'Movie, rating and comment are required' });
        }

        // Upsert — update if already reviewed, else create
        const review = await Review.findOneAndUpdate(
            { user: userId, movie: movieId },
            { user: userId, movie: movieId, rating, comment, userName, userImage },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: 'Review submitted!', review });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review) return res.json({ success: false, message: 'Review not found' });
        if (review.user !== userId) return res.json({ success: false, message: 'Not authorized' });
        await Review.findByIdAndDelete(reviewId);
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};