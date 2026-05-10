import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    screenType: { type: String, enum: ['Standard', 'IMAX', '4DX', 'Dolby'], default: 'Standard' },
    amenities: { type: Array, default: [] },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Theater = mongoose.model("Theater", theaterSchema);
export default Theater;