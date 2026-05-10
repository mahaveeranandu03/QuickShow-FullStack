// =====================================================
// SEED SCRIPT (TMDB VERSION)
// Fetches real movie data from TMDB and seeds your DB
//
// STEP 1: Make sure your server/.env has TMDB_API_KEY
// STEP 2: Run:  node seedMoviesTMDB.js
// =====================================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const TMDB_KEY = process.env.TMDB_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

if (!TMDB_KEY || TMDB_KEY.includes('Enter')) {
    console.error('❌ TMDB_API_KEY is missing in your .env file!');
    console.log('👉 Get a free key at: https://www.themoviedb.org/settings/api');
    process.exit(1);
}

// ---------- Schemas ----------
const movieSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    title: String, overview: String,
    poster_path: String, backdrop_path: String,
    release_date: String, original_language: String,
    tagline: String, genres: Array, casts: Array,
    vote_average: Number, runtime: Number,
}, { timestamps: true });

const showSchema = new mongoose.Schema({
    movie: { type: String, ref: 'Movie' },
    showDateTime: Date,
    showPrice: Number,
    occupiedSeats: { type: Object, default: {} }
}, { minimize: false });

const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
const Show = mongoose.models.Show || mongoose.model('Show', showSchema);

// ---------- Fetch from TMDB ----------
const tmdbFetch = async (url) => {
    const res = await fetch(`https://api.themoviedb.org/3${url}`, {
        headers: { Authorization: `Bearer ${TMDB_KEY}` }
    });
    if (!res.ok) throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
    return res.json();
};

const fetchMovieDetails = async (movieId) => {
    const [details, credits] = await Promise.all([
        tmdbFetch(`/movie/${movieId}`),
        tmdbFetch(`/movie/${movieId}/credits`)
    ]);
    return { details, credits };
};

// ---------- Generate show times ----------
const generateShows = (movieId, price = 200) => {
    const shows = [];
    const times = ['10:00', '13:30', '17:00', '20:30'];
    for (let day = 1; day <= 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);
        const dateStr = date.toISOString().split('T')[0];
        times.forEach(time => {
            shows.push({
                movie: movieId,
                showDateTime: new Date(`${dateStr}T${time}`),
                showPrice: price,
                occupiedSeats: {}
            });
        });
    }
    return shows;
};

// ---------- Movie IDs to seed ----------
// These are TMDB movie IDs for the movies from your screenshots
// You can add more IDs from https://www.themoviedb.org
const MOVIE_IDS = [
    1241982,  // Zootopia 2
    1233331,  // Sinners
    83533,    // Avatar: Fire and Ash
    1233532,  // Omniscient Reader
];

// ---------- Run ----------
const seed = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(`${MONGODB_URI}/quickshow`);
        console.log('✅ Connected!\n');

        for (const tmdbId of MOVIE_IDS) {
            try {
                console.log(`📡 Fetching TMDB movie ID: ${tmdbId}...`);
                const { details, credits } = await fetchMovieDetails(tmdbId);

                const movieId = String(tmdbId);
                const exists = await Movie.findById(movieId);

                if (!exists) {
                    await Movie.create({
                        _id: movieId,
                        title: details.title,
                        overview: details.overview,
                        poster_path: details.poster_path,
                        backdrop_path: details.backdrop_path,
                        release_date: details.release_date,
                        original_language: details.original_language,
                        tagline: details.tagline || '',
                        genres: details.genres,
                        casts: credits.cast.slice(0, 15),
                        vote_average: details.vote_average,
                        runtime: details.runtime,
                    });
                    console.log(`✅ Added: ${details.title}`);
                } else {
                    console.log(`⏭️  Already exists: ${details.title}`);
                }

                // Add shows if none exist
                const existingShows = await Show.findOne({ movie: movieId });
                if (!existingShows) {
                    const shows = generateShows(movieId, 200);
                    await Show.insertMany(shows);
                    console.log(`🎬 Added ${shows.length} shows for: ${details.title}`);
                } else {
                    console.log(`⏭️  Shows already exist for: ${details.title}`);
                }

                console.log('');
            } catch (err) {
                console.error(`❌ Failed for ID ${tmdbId}:`, err.message);
            }
        }

        console.log('🎉 Seeding complete! Refresh your website to see movies.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
};

seed();