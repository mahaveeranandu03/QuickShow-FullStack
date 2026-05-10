import Theater from "../models/Theater.js";

// Get all active theaters
export const getTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find({ isActive: true }).sort({ city: 1 });
        res.json({ success: true, theaters });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add a theater (admin)
export const addTheater = async (req, res) => {
    try {
        const { name, address, city, totalSeats, screenType, amenities, image } = req.body;
        if (!name || !address || !city || !totalSeats) {
            return res.json({ success: false, message: 'Please fill all required fields' });
        }
        const theater = await Theater.create({ name, address, city, totalSeats, screenType, amenities, image });
        res.json({ success: true, message: 'Theater added successfully', theater });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete a theater (admin)
export const deleteTheater = async (req, res) => {
    try {
        const { id } = req.params;
        await Theater.findByIdAndUpdate(id, { isActive: false });
        res.json({ success: true, message: 'Theater removed' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};