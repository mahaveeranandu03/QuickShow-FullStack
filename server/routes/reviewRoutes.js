import express from "express";
import { addReview, deleteReview, getMovieReviews } from "../controllers/reviewController.js";
import { clerkMiddleware } from "@clerk/express";

const reviewRouter = express.Router();

reviewRouter.get('/:movieId', getMovieReviews);
reviewRouter.post('/add', addReview);
reviewRouter.delete('/delete/:reviewId', deleteReview);

export default reviewRouter;