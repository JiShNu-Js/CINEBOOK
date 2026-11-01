# 🎬 CineBook – Movie Ticket Booking Web Application

**CineBook** is a modern, responsive, full-stack movie ticket booking web application developed for the **2nd Year B.Tech Internet Programming Laboratory Coursework**.

The project is structured specifically for a 5-member student group where each member takes ownership of one connected webpage while demonstrating key syllabus concepts: **HTML5, CSS3, Vanilla JavaScript, DOM manipulation, Node.js, Express.js, REST APIs, MySQL connectivity, and CRUD operations.**

---

## 📑 Table of Contents
1. [Project Overview & Objectives](#-project-overview--objectives)
2. [Technologies Used](#-technologies-used)
3. [The Five Connected Webpages](#-the-five-connected-webpages)
4. [Project Directory Structure](#-project-directory-structure)
5. [Prerequisites & Installation](#-prerequisites--installation)
6. [Database Setup (MySQL)](#-database-setup-mysql)
7. [Environment Configuration (.env)](#-environment-configuration-env)
8. [Running the Application](#-running-the-application)
9. [Automated Testing](#-automated-testing)
10. [REST API Documentation](#-rest-api-documentation)
11. [Module IV CRUD & Admin Panel](#-module-iv-crud--admin-panel)
12. [Group Member Work Division](#-group-member-work-division)
13. [Security & Viva Points](#-security--viva-points)

---

## 🎯 Project Overview & Objectives
* Provide an interactive movie ticket reservation experience with real-time seat selection and pricing.
* Implement user authentication with password hashing using **bcrypt** and session persistence using **express-session**.
* Connect frontend forms and dynamic grids with a **MySQL** relational database via parameterized queries to prevent SQL Injection.
* Demonstrate dynamic DOM manipulation without frontend heavyweight frameworks.
* Offer physical cinema ticket printing with customized CSS `@media print` rules.

---

## 🛠 Technologies Used

### Frontend
* **HTML5:** Semantic markup (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<form>`, `<footer>`).
* **CSS3:** Custom cinema styling, CSS Grid, Flexbox, CSS Variables, smooth transitions, and `@media print` rules.
* **Vanilla JavaScript (ES6+):** Event listeners, Fetch API, DOM manipulation, URL query parsing, dynamic arrays, objects.
* **Font & Assets:** Google Fonts (*Poppins*), standalone vector SVG posters and icons.

### Backend
* **Node.js:** JavaScript runtime environment.
* **Express.js:** Server framework for routing, static file serving, and REST APIs.
* **mysql2:** Promise-based driver executing parameterized MySQL queries.
* **bcryptjs:** Industry-standard password hashing algorithm (10 salt rounds).
* **express-session:** Server-side session management using HTTP-only cookies.
* **dotenv:** Secure environment variable management.

---

## 🌐 The Five Connected Webpages

| Webpage | Filename | Responsible Member | Description |
| :--- | :--- | :--- | :--- |
| **Page 1: Registration** | [`public/signup.html`](public/signup.html) | Member 1 | Registration form validating name, email, password strength, and confirmation. Sends payload to backend, checks for duplicate accounts, and hashes password before database insertion. |
| **Page 2: Login** | [`public/login.html`](public/login.html) | Member 2 | Authenticates credentials against MySQL using bcrypt. Sets server session cookie and supports destination redirecting via URL query parameters. |
| **Page 3: Movie Catalog** | [`public/movies.html`](public/movies.html) | Member 3 | Dynamically queries all movies from MySQL via `GET /api/movies`, rendering responsive cards with poster, title, genre, duration, price, and "Book Now" buttons. Features search and genre filtering. |
| **Page 4: Seat Booking** | [`public/booking.html`](public/booking.html) | Member 4 | Interactive booking interface featuring show date picker, showtime slots, and an interactive 5x8 cinema seat grid. Checks seat occupancy, requires user login, and recalculates total price. |
| **Page 5: Ticket Output** | [`public/confirmation.html`](public/confirmation.html) | Member 5 | Displays confirmed reservation details fetched from backend (`GET /api/booking/:id`). Protects ownership and renders a printable cinema ticket layout with `window.print()`. |

> **Bonus / Module IV CRUD Page:** [`public/admin.html`](public/admin.html) allows administrators to Create, Read, Update, and Delete movies and monitor bookings.

---

## 📂 Project Directory Structure

```text
cinebook/
├── config/
│   └── db.js                 # MySQL connection pool & seamless dev fallback
├── middleware/
│   └── auth.js               # isAuthenticated and isAdmin role middleware
├── routes/
│   ├── auth.js               # /api/signup, /api/login, /api/logout, /api/me
│   ├── movies.js             # /api/movies, /api/movies/:id, booked seats
│   ├── bookings.js           # /api/book, /api/my-bookings, /api/booking/:id
│   └── admin.js              # /api/admin/movies (CRUD), /api/admin/bookings
├── public/
│   ├── index.html            # Gateway redirect to /movies.html
│   ├── signup.html           # Page 1: User Registration
│   ├── login.html            # Page 2: User Login
│   ├── movies.html           # Page 3: Dynamic Movie Catalog
│   ├── booking.html          # Page 4: Interactive Seat Selection
│   ├── confirmation.html     # Page 5: Ticket Output & Printing
│   ├── admin.html            # Module IV: CRUD Admin Panel
│   ├── css/
│   │   └── style.css         # Unified cinema stylesheet & print styles
│   ├── js/
│   │   ├── common.js         # Shared navbar auth state, helpers, logout
│   │   ├── signup.js         # Page 1 validation and registration logic
│   │   ├── login.js          # Page 2 authentication and session logic
│   │   ├── movies.js         # Page 3 dynamic card rendering & filters
│   │   ├── booking.js        # Page 4 seat matrix & price calculations
│   │   ├── confirmation.js   # Page 5 ticket loading & window.print()
│   │   └── admin.js          # CRUD operations & modal forms
│   └── images/
│       ├── logo.svg          # Vector brand logo
│       ├── inception.svg     # Movie poster artwork
│       ├── interstellar.svg  # Movie poster artwork
│       ├── dark-knight.svg   # Movie poster artwork
│       ├── avengers.svg      # Movie poster artwork
│       ├── oppenheimer.svg   # Movie poster artwork
│       └── dune2.svg         # Movie poster artwork
├── test/
│   └── api.test.js           # Automated end-to-end API test suite
├── database.sql              # MySQL DDL & seed data script
├── .env.example              # Environment variable template
├── .gitignore                # Node modules and secrets exclusion
├── package.json              # Project dependencies and npm scripts
├── README.md                 # Project documentation and guide
├── TEAM_CONTRIBUTIONS.md     # 5-member work division document
├── CineBook_Report.docx      # 2-Page Assignment Report (Word Document)
└── CineBook_Report.pdf       # 2-Page Assignment Report (PDF Document)
```

---

## 💻 Prerequisites & Installation

1. **Install Node.js:** Download and install Node.js (version 18 or newer) from [nodejs.org](https://nodejs.org/).
2. **Install MySQL:** Ensure MySQL Community Server or MariaDB is installed (XAMPP / WAMP / Standalone MySQL).
3. **Clone or Extract the Project:**
   ```bash
   cd /path/to/CineBook
   ```
4. **Install Dependencies:**
   ```bash
   npm install
   ```

---

## 🗄 Database Setup (MySQL)

1. Open your terminal, MySQL Command Line Client, or phpMyAdmin.
2. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```
3. Import the `database.sql` script:
   ```sql
   source /path/to/CineBook/database.sql;
   ```
   *Alternatively, in bash:*
   ```bash
   mysql -u root -p < database.sql
   ```

### Pre-seeded Demo Accounts
| Role | Email | Password |
| :--- | :--- | :--- |
| **Regular User** | `rahul@cinebook.com` | `user123` |
| **Administrator** | `admin@cinebook.com` | `admin123` |

> **Note on Offline Development:** `config/db.js` includes an intelligent auto-fallback layer. If MySQL is not running on localhost, the server will display an informative banner in the console and run using in-memory pre-seeded records so that you can develop, test, and present the project even on computers without an active MySQL service.

---

## ⚙️ Environment Configuration (.env)

Duplicate `.env.example` to create `.env`:
```bash
cp .env.example .env
```

Review or modify your database credentials in `.env`:
```env
PORT=3000
SESSION_SECRET=cinebook_secret_session_key_2026

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cinebook
DB_PORT=3306
```

---

## 🚀 Running the Application

Start the web server:
```bash
npm start
```
*Or for automatic restart during code changes:*
```bash
npm run dev
```

Open your web browser and visit:
* **Movie Catalog:** [http://localhost:3000/movies.html](http://localhost:3000/movies.html)
* **Log In:** [http://localhost:3000/login.html](http://localhost:3000/login.html)
* **Sign Up:** [http://localhost:3000/signup.html](http://localhost:3000/signup.html)
* **Book Ticket:** [http://localhost:3000/booking.html](http://localhost:3000/booking.html)
* **Admin Dashboard:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 🧪 Automated Testing

To run the built-in automated test suite verifying all 16 backend endpoints, session controls, and security policies:
```bash
npm test
```

Expected result:
```text
  ✅ PASS: User Registration (POST /api/signup)
  ✅ PASS: Duplicate Email Rejection (409 Conflict)
  ✅ PASS: Login with Invalid Password (401 Unauthorized)
  ✅ PASS: Successful Login & Session Cookie (POST /api/login)
  ✅ PASS: Session Verification (GET /api/me)
  ✅ PASS: Movie Catalog Retrieval (Found 6 movies)
  ✅ PASS: Single Movie Details Retrieval (GET /api/movies/:id)
  ✅ PASS: Unauthenticated Booking Denied (401 Unauthorized)
  ✅ PASS: Ticket Booking with Server Price Calculation
  ✅ PASS: Duplicate Seat Conflict Detection (409 Conflict)
  ✅ PASS: Booking Confirmation Retrieval (GET /api/booking/:id)
  ✅ PASS: Cross-User Booking Access Denied (403 Forbidden)
  ✅ PASS: Admin CRUD: CREATE Movie (POST /api/admin/movies)
  ✅ PASS: Admin CRUD: UPDATE Movie (PUT /api/admin/movies/:id)
  ✅ PASS: Admin CRUD: DELETE Movie (DELETE /api/admin/movies/:id)
  ✅ PASS: User Session Termination (POST /api/logout)

📊 Test Results: 16 Passed, 0 Failed
```

---

## 📡 REST API Documentation

### Authentication Routes
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/signup` | Register new user account with hashed password | Public |
| `POST` | `/api/login` | Authenticate credentials and create session | Public |
| `POST` | `/api/logout` | Terminate session and clear cookie | Public |
| `GET` | `/api/me` | Check active session and current user data | Public |

### Movie Catalog Routes
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies` | Fetch all movies in the catalog | Public |
| `GET` | `/api/movies/:id` | Fetch specific movie details | Public |
| `GET` | `/api/movies/:id/booked-seats` | Get occupied seats for a movie, date, & time | Public |

### Booking Routes
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/book` | Reserve tickets with server-side price check | Logged-in |
| `GET` | `/api/my-bookings` | List all bookings of current user | Logged-in |
| `GET` | `/api/booking/:id` | View confirmed booking (ownership verified) | Logged-in (Owner) |

### Administrative CRUD Routes (Module IV)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/movies` | Read all movies | Admin Only |
| `POST` | `/api/admin/movies` | Create new movie in database | Admin Only |
| `PUT` | `/api/admin/movies/:id` | Update movie details | Admin Only |
| `DELETE` | `/api/admin/movies/:id` | Delete movie and related records | Admin Only |
| `GET` | `/api/admin/bookings` | View all customer bookings | Admin Only |

---

## 🔒 Security & Viva Points

1. **SQL Injection Defense:** All queries use parameterized statements (`pool.query(sql, [params])`), ensuring inputs are treated strictly as literals.
2. **Server-Side Price Validation:** The client-side total is never trusted. In `routes/bookings.js`, the server re-queries the movie's price from MySQL and calculates `movie.price * seatCount`.
3. **Double-Booking Prevention:** Before inserting a reservation, the server checks whether any of the requested seats are already registered for the same movie, date, and showtime.
4. **Password Hashing:** Cleartext passwords are never saved. Salted bcrypt hashes with 10 rounds are computed upon registration.
5. **Session Cookies:** Handled via `express-session` with `httpOnly: true`, preventing client scripts from accessing raw session tokens.
6. **Authorization Guard:** Bookings can only be inspected by the user who created them or by an administrator.

---

## 👥 Group Member Responsibilities

See [`TEAM_CONTRIBUTIONS.md`](TEAM_CONTRIBUTIONS.md) for detailed descriptions, viva questions, and grading rubrics for all 5 team members.
