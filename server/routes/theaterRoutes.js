import express from "express";
import { addTheater, deleteTheater, getTheaters } from "../controllers/theaterController.js";
import { protectAdmin } from "../middleware/auth.js";

const theaterRouter = express.Router();

theaterRouter.get('/all', getTheaters);
theaterRouter.post('/add', protectAdmin, addTheater);
theaterRouter.delete('/delete/:id', protectAdmin, deleteTheater);

export default theaterRouter;