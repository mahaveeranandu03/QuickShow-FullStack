// =====================================================
// SEED SCRIPT - Run once to populate your database
// Usage: node seedMovies.js
// Place images in: client/public/images/
// =====================================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`);
    console.log('Database connected');
};

const movieSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    title: String, overview: String,
    poster_path: String, backdrop_path: String,
    release_date: String, original_language: String,
    tagline: String, genres: Array, casts: Array,
    vote_average: Number, runtime: Number,
}, { timestamps: true });

const showSchema = new mongoose.Schema({
    movie: { type: String, required: true, ref: 'Movie' },
    showDateTime: { type: Date, required: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: { type: Object, default: {} }
}, { minimize: false });

const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
const Show = mongoose.models.Show || mongoose.model('Show', showSchema);

// Only 7 movies — avatar.jpg and omniscient.jpg removed
const movies = [
    {
        _id: 'zootopia-2-2025',
        title: 'Zootopia 2',
        overview: "After cracking the biggest case in Zootopia's history, rookie cops Judy Hopps and Nick Wilde find themselves on the twisting trail of a great mystery when Gary De'Snake arrives and turns the animal metropolis upside down.",
        poster_path: 'zootopia.jpg',
        backdrop_path: 'zootopia.jpg',
        release_date: '2025-11-26',
        original_language: 'en',
        tagline: 'The case just got bigger.',
        genres: [{ name: 'Animation' }, { name: 'Family' }, { name: 'Comedy' }, { name: 'Adventure' }, { name: 'Mystery' }],
        casts: [],
        vote_average: 7.5,
        runtime: 107,
    },
    {
        _id: 'sinners-2025',
        title: 'Sinners',
        overview: "Trying to leave their troubled lives behind, twin brothers return to their hometown to start again, only to discover that an even greater evil is waiting to welcome them back.",
        poster_path: 'sinners.jpg',
        backdrop_path: 'sinners.jpg',
        release_date: '2025-04-18',
        original_language: 'en',
        tagline: 'Evil comes home.',
        genres: [{ name: 'Horror' }, { name: 'Action' }],
        casts: [],
        vote_average: 7.5,
        runtime: 138,
    },
    {
        _id: 'spiderman-beyond-2025',
        title: 'Spider-Man: Beyond the Spider-Verse',
        overview: "Miles Morales continues his journey across the multiverse, where he encounters a new team of Spider-People and faces a villain more powerful than anything he has ever fought.",
        poster_path: 'spiderman.jpg',
        backdrop_path: 'spiderman.jpg',
        release_date: '2025-06-01',
        original_language: 'en',
        tagline: 'Every universe has a Spider-Man.',
        genres: [{ name: 'Animation' }, { name: 'Action' }, { name: 'Adventure' }],
        casts: [],
        vote_average: 8.5,
        runtime: 140,
    },
    {
        _id: 'deadpool-3-2025',
        title: 'Deadpool 3',
        overview: "Wade Wilson teams up with Wolverine and enters the Marvel Cinematic Universe, causing chaos across the multiverse in the only way Deadpool knows how.",
        poster_path: 'deadpool.jpg',
        backdrop_path: 'deadpool.jpg',
        release_date: '2025-07-26',
        original_language: 'en',
        tagline: "He's back… and not alone.",
        genres: [{ name: 'Action' }, { name: 'Comedy' }],
        casts: [],
        vote_average: 8.2,
        runtime: 125,
    },
    {
        _id: 'avengers-secret-wars-2025',
        title: 'Avengers: Secret Wars',
        overview: "The multiverse collapses as every hero and villain from every reality converges for the ultimate battle that will determine the fate of all existence.",
        poster_path: 'avengers.jpg',
        backdrop_path: 'avengers.jpg',
        release_date: '2025-12-18',
        original_language: 'en',
        tagline: 'Everything ends here.',
        genres: [{ name: 'Action' }, { name: 'Sci-Fi' }],
        casts: [],
        vote_average: 9.0,
        runtime: 180,
    },
    {
        _id: 'frozen-3-2025',
        title: 'Frozen 3',
        overview: "Elsa and Anna embark on a new adventure when they discover a mysterious frozen kingdom hidden beyond the enchanted forest, where secrets of their family's past are revealed.",
        poster_path: 'frozen3.jpg',
        backdrop_path: 'frozen3.jpg',
        release_date: '2025-11-21',
        original_language: 'en',
        tagline: 'A new winter begins.',
        genres: [{ name: 'Animation' }, { name: 'Family' }],
        casts: [],
        vote_average: 7.9,
        runtime: 110,
    },
    {
        _id: 'batman-part-2-2025',
        title: 'The Batman Part II',
        overview: "Batman delves deeper into Gotham's criminal underworld, uncovering dark secrets that challenge everything he believes about justice, identity, and the city he has sworn to protect.",
        poster_path: 'batman.jpg',
        backdrop_path: 'batman.jpg',
        release_date: '2025-10-03',
        original_language: 'en',
        tagline: 'Gotham falls deeper into darkness.',
        genres: [{ name: 'Action' }, { name: 'Crime' }, { name: 'Drama' }],
        casts: [],
        vote_average: 8.3,
        runtime: 155,
    }
];

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

const seed = async () => {
    try {
        await connectDB();

        const movieIds = movies.map(m => m._id);

        console.log('🧹 Removing old data...');
        await Show.deleteMany({});
        await Movie.deleteMany({});
        console.log('✅ Cleaned up.\n');

        for (const movie of movies) {
            await Movie.create(movie);
            console.log(`✅ Added: ${movie.title}`);
        }

        for (const movie of movies) {
            const shows = generateShows(movie._id, 200);
            await Show.insertMany(shows);
            console.log(`🎬 ${shows.length} shows added for: ${movie.title}`);
        }

        console.log('\n🎉 Done! Refresh your website to see all 7 movies.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seed();