/**
 * CineBook - Database Connection Configuration
 * Course: Internet Programming (B.Tech 2nd Year)
 * Technology: MySQL with mysql2 (Promise-based API)
 *
 * This module creates a MySQL connection pool using credentials from .env.
 * It also includes a transparent in-memory fallback layer so that if MySQL
 * is not running locally during development or viva demos, all routes and
 * database queries continue to function seamlessly with pre-seeded data.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool = null;
let isConnectedToMySQL = false;

// Attempt to create MySQL pool
try {
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cinebook',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
} catch (err) {
    console.warn('[CineBook DB] Warning: MySQL pool initialization error:', err.message);
}

// -------------------------------------------------------------
// In-Memory Database Fallback Store (Used when MySQL is offline)
// -------------------------------------------------------------
const memoryStore = {
    users: [
        {
            user_id: 1,
            name: 'System Administrator',
            email: 'admin@cinebook.com',
            password: '$2b$10$i76FWNQbRsl4JSEiZ5xDC.115uJWZu4FJLy6yicmoa5o2PmAXLSZ.', // admin123
            role: 'admin',
            created_at: new Date()
        },
        {
            user_id: 2,
            name: 'Rahul Sharma',
            email: 'rahul@cinebook.com',
            password: '$2b$10$5dw0EGa2i7MAEvg2GJoSFO/M9Ql/azE3A9FFArhGE0VKeEyU5eW.q', // user123
            role: 'user',
            created_at: new Date()
        }
    ],
    movies: [
        {
            movie_id: 1,
            title: 'Inception',
            description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
            genre: 'Sci-Fi / Thriller',
            duration: 148,
            price: 250.00,
            poster: '/images/inception.svg',
            created_at: new Date()
        },
        {
            movie_id: 2,
            title: 'Interstellar',
            description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
            genre: 'Sci-Fi / Adventure',
            duration: 169,
            price: 280.00,
            poster: '/images/interstellar.svg',
            created_at: new Date()
        },
        {
            movie_id: 3,
            title: 'The Dark Knight',
            description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
            genre: 'Action / Crime',
            duration: 152,
            price: 260.00,
            poster: '/images/dark-knight.svg',
            created_at: new Date()
        },
        {
            movie_id: 4,
            title: 'Avengers: Endgame',
            description: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions.',
            genre: 'Action / Sci-Fi',
            duration: 181,
            price: 300.00,
            poster: '/images/avengers.svg',
            created_at: new Date()
        },
        {
            movie_id: 5,
            title: 'Oppenheimer',
            description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.',
            genre: 'Biography / Drama',
            duration: 180,
            price: 270.00,
            poster: '/images/oppenheimer.svg',
            created_at: new Date()
        },
        {
            movie_id: 6,
            title: 'Dune: Part Two',
            description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
            genre: 'Sci-Fi / Adventure',
            duration: 166,
            price: 290.00,
            poster: '/images/dune2.svg',
            created_at: new Date()
        }
    ],
    theaters: [
        {
            theater_id: 1,
            theater_name: 'CineBook IMAX Laser',
            location: 'Phoenix Palladium Mall, Downtown',
            screen_name: 'Audi 1 (IMAX Laser)',
            created_at: new Date()
        },
        {
            theater_id: 2,
            theater_name: 'CineBook PVR Premiere',
            location: 'Galaxy Galleria, West Avenue',
            screen_name: 'Audi 2 (Dolby Atmos)',
            created_at: new Date()
        },
        {
            theater_id: 3,
            theater_name: 'CineBook Cinepolis 4DX',
            location: 'Metroplex Plaza, City Center',
            screen_name: 'Audi 3 (4DX Dynamic)',
            created_at: new Date()
        },
        {
            theater_id: 4,
            theater_name: 'CineBook Royale Luxe',
            location: 'Grand Horizon Mall, North Hills',
            screen_name: 'Audi VIP (Gold Class)',
            created_at: new Date()
        }
    ],
    bookings: [
        {
            booking_id: 1,
            user_id: 2,
            movie_id: 1,
            theater_id: 1,
            show_date: new Date().toISOString().split('T')[0],
            show_time: '06:15 PM',
            seats: 'B4, B5',
            ticket_count: 2,
            total_price: 500.00,
            created_at: new Date()
        }
    ],
    nextUserId: 3,
    nextMovieId: 7,
    nextTheaterId: 5,
    nextBookingId: 2
};

// Check actual MySQL connection at startup
async function testConnection() {
    if (!pool) return false;
    try {
        const conn = await pool.getConnection();
        conn.release();
        isConnectedToMySQL = true;
        console.log(' [CineBook DB] Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'cinebook'));
        return true;
    } catch (err) {
        isConnectedToMySQL = false;
        console.warn('⚠️  [CineBook DB] MySQL not reachable on ' + (process.env.DB_HOST || 'localhost') + ':' + (process.env.DB_PORT || 3306) + ' (' + err.code + ').');
        console.warn('ℹ️  [CineBook DB] Falling back to in-memory database with full seed data. All 5 pages, forms, and APIs will function normally.');
        console.warn('ℹ️  [CineBook DB] To connect to actual MySQL, start MySQL service and run "mysql -u root -p < database.sql".');
        return false;
    }
}

// -------------------------------------------------------------
// Unified Query Interface
// Executes on MySQL if connected, otherwise processes in memory
// -------------------------------------------------------------
async function query(sql, params = []) {
    // If connected to MySQL, run real parameterized query
    if (isConnectedToMySQL && pool) {
        try {
            return await pool.query(sql, params);
        } catch (err) {
            console.error('[CineBook DB] MySQL Query Error:', err.message);
            throw err;
        }
    }

    // Otherwise, simulate query against in-memory store
    const normalized = sql.trim().replace(/\s+/g, ' ');

    // 1. SELECT ... FROM users WHERE email = ?
    if (/SELECT\s+(.*?)\s+FROM\s+users\s+WHERE\s+email\s*=\s*\?/i.test(normalized)) {
        const email = params[0];
        const rows = memoryStore.users.filter(u => u.email.toLowerCase() === email.toLowerCase());
        return [rows];
    }

    // 2. SELECT ... FROM users WHERE user_id = ?
    if (/SELECT\s+(.*?)\s+FROM\s+users\s+WHERE\s+user_id\s*=\s*\?/i.test(normalized)) {
        const id = parseInt(params[0]);
        const rows = memoryStore.users.filter(u => u.user_id === id);
        return [rows];
    }

    // 3. INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
    if (/INSERT\s+INTO\s+users/i.test(normalized)) {
        const [name, email, password, role] = params;
        // Check uniqueness
        if (memoryStore.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            const err = new Error("Duplicate entry '" + email + "' for key 'users.email'");
            err.code = 'ER_DUP_ENTRY';
            throw err;
        }
        const newUser = {
            user_id: memoryStore.nextUserId++,
            name,
            email,
            password,
            role: role || 'user',
            created_at: new Date()
        };
        memoryStore.users.push(newUser);
        return [{ insertId: newUser.user_id, affectedRows: 1 }];
    }

    // 4. SELECT ... FROM movies WHERE movie_id = ?
    if (/SELECT\s+(.*?)\s+FROM\s+movies\s+WHERE\s+movie_id\s*=\s*\?/i.test(normalized)) {
        const id = parseInt(params[0]);
        const rows = memoryStore.movies.filter(m => m.movie_id === id);
        return [rows];
    }

    // 5. SELECT ... FROM movies (catalog list without WHERE)
    if (/SELECT\s+(.*?)\s+FROM\s+movies/i.test(normalized) && !/WHERE/i.test(normalized)) {
        return [[...memoryStore.movies]];
    }

    // 6. Admin: INSERT INTO movies
    if (/INSERT INTO movies/i.test(normalized)) {
        const [title, description, genre, duration, price, poster] = params;
        const newMovie = {
            movie_id: memoryStore.nextMovieId++,
            title,
            description,
            genre,
            duration: parseInt(duration),
            price: parseFloat(price),
            poster,
            created_at: new Date()
        };
        memoryStore.movies.push(newMovie);
        return [{ insertId: newMovie.movie_id, affectedRows: 1 }];
    }

    // 7. Admin: UPDATE movies SET ... WHERE movie_id = ?
    if (/UPDATE movies SET/i.test(normalized)) {
        // params: [title, description, genre, duration, price, poster, movie_id]
        const id = parseInt(params[params.length - 1]);
        const movie = memoryStore.movies.find(m => m.movie_id === id);
        if (movie) {
            movie.title = params[0];
            movie.description = params[1];
            movie.genre = params[2];
            movie.duration = parseInt(params[3]);
            movie.price = parseFloat(params[4]);
            movie.poster = params[5];
            return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
    }

    // 8. Admin: DELETE FROM movies WHERE movie_id = ?
    if (/DELETE FROM movies WHERE movie_id = \?/i.test(normalized)) {
        const id = parseInt(params[0]);
        const index = memoryStore.movies.findIndex(m => m.movie_id === id);
        if (index !== -1) {
            memoryStore.movies.splice(index, 1);
            return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
    }

    // 8a. SELECT ... FROM theaters WHERE theater_id = ?
    if (/SELECT\s+(.*?)\s+FROM\s+theaters\s+WHERE\s+theater_id\s*=\s*\?/i.test(normalized)) {
        const id = parseInt(params[0]);
        const rows = memoryStore.theaters.filter(t => t.theater_id === id);
        return [rows];
    }

    // 8b. SELECT ... FROM theaters (all theaters)
    if (/SELECT\s+(.*?)\s+FROM\s+theaters/i.test(normalized) && !/WHERE/i.test(normalized)) {
        return [[...memoryStore.theaters]];
    }

    // 9. Check booked seats for movie, theater, date, time
    // SELECT seats FROM bookings WHERE movie_id = ? AND theater_id = ? AND show_date = ? AND show_time = ?
    if (/SELECT seats FROM bookings WHERE movie_id = \? AND theater_id = \? AND show_date = \? AND show_time = \?/i.test(normalized)) {
        const [movieId, theaterId, date, time] = params;
        const rows = memoryStore.bookings
            .filter(b => b.movie_id === parseInt(movieId) &&
                         b.theater_id === parseInt(theaterId) &&
                         String(b.show_date).slice(0, 10) === String(date).slice(0, 10) &&
                         b.show_time === time)
            .map(b => ({ seats: b.seats }));
        return [rows];
    }

    // 9b. Fallback seat check (without theater_id)
    if (/SELECT seats FROM bookings WHERE movie_id = \? AND show_date = \? AND show_time = \?/i.test(normalized)) {
        const [movieId, date, time] = params;
        const rows = memoryStore.bookings
            .filter(b => b.movie_id === parseInt(movieId) &&
                         String(b.show_date).slice(0, 10) === String(date).slice(0, 10) &&
                         b.show_time === time)
            .map(b => ({ seats: b.seats }));
        return [rows];
    }

    // 10. INSERT INTO bookings (with or without theater_id)
    if (/INSERT INTO bookings/i.test(normalized)) {
        let user_id, movie_id, theater_id, show_date, show_time, seats, ticket_count, total_price;
        if (params.length === 8) {
            [user_id, movie_id, theater_id, show_date, show_time, seats, ticket_count, total_price] = params;
        } else {
            [user_id, movie_id, show_date, show_time, seats, ticket_count, total_price] = params;
            theater_id = 1;
        }

        const newBooking = {
            booking_id: memoryStore.nextBookingId++,
            user_id: parseInt(user_id),
            movie_id: parseInt(movie_id),
            theater_id: parseInt(theater_id || 1),
            show_date,
            show_time,
            seats,
            ticket_count: parseInt(ticket_count),
            total_price: parseFloat(total_price),
            created_at: new Date()
        };
        memoryStore.bookings.push(newBooking);
        return [{ insertId: newBooking.booking_id, affectedRows: 1 }];
    }

    // 11. SELECT b.*, m.title, ..., t.theater_name, ... FROM bookings b JOIN movies m ... JOIN theaters t ... WHERE b.booking_id = ? AND b.user_id = ?
    if (/FROM bookings b/i.test(normalized) && /b\.booking_id = \?/i.test(normalized)) {
        const [bookingId, userId] = params.map(p => parseInt(p));
        const booking = memoryStore.bookings.find(b => b.booking_id === bookingId && (isNaN(userId) || b.user_id === userId));
        if (!booking) return [[]];
        const movie = memoryStore.movies.find(m => m.movie_id === booking.movie_id) || {};
        const user = memoryStore.users.find(u => u.user_id === booking.user_id) || {};
        const theater = memoryStore.theaters.find(t => t.theater_id === booking.theater_id) || memoryStore.theaters[0];
        return [[{
            ...booking,
            title: movie.title,
            poster: movie.poster,
            genre: movie.genre,
            price: movie.price,
            duration: movie.duration,
            theater_name: theater.theater_name,
            theater_location: theater.location,
            location: theater.location,
            screen_name: theater.screen_name,
            user_name: user.name,
            user_email: user.email
        }]];
    }

    // 12. SELECT b.*, m.title, ..., t.theater_name ... FROM bookings b ... WHERE b.user_id = ?
    if (/FROM bookings b/i.test(normalized) && /b\.user_id = \?/i.test(normalized)) {
        const userId = parseInt(params[0]);
        const list = memoryStore.bookings
            .filter(b => b.user_id === userId)
            .map(b => {
                const movie = memoryStore.movies.find(m => m.movie_id === b.movie_id) || {};
                const theater = memoryStore.theaters.find(t => t.theater_id === b.theater_id) || memoryStore.theaters[0];
                return {
                    ...b,
                    title: movie.title,
                    poster: movie.poster,
                    genre: movie.genre,
                    price: movie.price,
                    theater_name: theater.theater_name,
                    theater_location: theater.location,
                    screen_name: theater.screen_name
                };
            })
            .sort((a, b) => b.booking_id - a.booking_id);
        return [list];
    }

    // 13. Admin: SELECT b.*, u.name, u.email, m.title, t.theater_name FROM bookings b ...
    if (/FROM bookings b/i.test(normalized)) {
        const list = memoryStore.bookings.map(b => {
            const movie = memoryStore.movies.find(m => m.movie_id === b.movie_id) || {};
            const user = memoryStore.users.find(u => u.user_id === b.user_id) || {};
            const theater = memoryStore.theaters.find(t => t.theater_id === b.theater_id) || memoryStore.theaters[0];
            return {
                ...b,
                title: movie.title,
                user_name: user.name,
                user_email: user.email,
                theater_name: theater.theater_name,
                screen_name: theater.screen_name
            };
        }).sort((a, b) => b.booking_id - a.booking_id);
        return [list];
    }

    console.warn('[CineBook MemoryDB] Unhandled query pattern:', sql);
    return [[]];
}

module.exports = {
    pool,
    query,
    testConnection,
    isMySQLConnected: () => isConnectedToMySQL
};
