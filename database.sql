-- ========================================================
-- CineBook Movie Ticket Booking Website
-- Database Setup and Seed Data Script
-- Course: Internet Programming (B.Tech 2nd Year)
-- Database: MySQL
-- ========================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS cinebook;
USE cinebook;

-- 2. Drop existing tables if needed (in proper foreign key dependency order)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS theaters;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS users;

-- ========================================================
-- TABLE 1: users
-- Stores registered user accounts and administrator credentials
-- ========================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- TABLE 2: movies
-- Stores movie catalog information
-- ========================================================
CREATE TABLE movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    genre VARCHAR(50) NOT NULL,
    duration INT NOT NULL, -- Duration in minutes
    price DECIMAL(8, 2) NOT NULL, -- Ticket price per seat
    poster VARCHAR(255) NOT NULL, -- Image path or filename
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- TABLE 3: theaters
-- Stores cinema theater complexes and screen specifications
-- ========================================================
CREATE TABLE theaters (
    theater_id INT AUTO_INCREMENT PRIMARY KEY,
    theater_name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    screen_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- TABLE 4: bookings
-- Stores ticket reservations made by authenticated users
-- ========================================================
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    theater_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time VARCHAR(20) NOT NULL,
    seats VARCHAR(255) NOT NULL, -- Comma-separated seat codes, e.g. 'A1, A2'
    ticket_count INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_movie FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_theater FOREIGN KEY (theater_id) REFERENCES theaters(theater_id) ON DELETE CASCADE
);

-- ========================================================
-- SEED DATA
-- Default sample accounts, movie listings, and theaters
-- ========================================================

-- Seed Users:
-- Admin: email = admin@cinebook.com, password = admin123
-- Student User: email = rahul@cinebook.com, password = user123
INSERT INTO users (name, email, password, role) VALUES
('System Administrator', 'admin@cinebook.com', '$2b$10$i76FWNQbRsl4JSEiZ5xDC.115uJWZu4FJLy6yicmoa5o2PmAXLSZ.', 'admin'),
('Rahul Sharma', 'rahul@cinebook.com', '$2b$10$5dw0EGa2i7MAEvg2GJoSFO/M9Ql/azE3A9FFArhGE0VKeEyU5eW.q', 'user');

-- Seed Theaters:
INSERT INTO theaters (theater_name, location, screen_name) VALUES
('CineBook IMAX Laser', 'Phoenix Palladium Mall, Downtown', 'Audi 1 (IMAX Laser)'),
('CineBook PVR Premiere', 'Galaxy Galleria, West Avenue', 'Audi 2 (Dolby Atmos)'),
('CineBook Cinepolis 4DX', 'Metroplex Plaza, City Center', 'Audi 3 (4DX Dynamic)'),
('CineBook Royale Luxe', 'Grand Horizon Mall, North Hills', 'Audi VIP (Gold Class)');

-- Seed Movies:
INSERT INTO movies (title, description, genre, duration, price, poster) VALUES
(
    'Inception',
    'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    'Sci-Fi / Thriller',
    148,
    250.00,
    '/images/inception.svg'
),
(
    'Interstellar',
    'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
    'Sci-Fi / Adventure',
    169,
    280.00,
    '/images/interstellar.svg'
),
(
    'The Dark Knight',
    'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    'Action / Crime',
    152,
    260.00,
    '/images/dark-knight.svg'
),
(
    'Avengers: Endgame',
    'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions.',
    'Action / Sci-Fi',
    181,
    300.00,
    '/images/avengers.svg'
),
(
    'Oppenheimer',
    'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.',
    'Biography / Drama',
    180,
    270.00,
    '/images/oppenheimer.svg'
),
(
    'Dune: Part Two',
    'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
    'Sci-Fi / Adventure',
    166,
    290.00,
    '/images/dune2.svg'
);

-- Seed Bookings:
-- 1 sample booking for Rahul Sharma (user_id = 2) for Inception (movie_id = 1) at CineBook IMAX Laser (theater_id = 1)
INSERT INTO bookings (user_id, movie_id, theater_id, show_date, show_time, seats, ticket_count, total_price) VALUES
(2, 1, 1, CURDATE(), '06:15 PM', 'B4, B5', 2, 500.00);
