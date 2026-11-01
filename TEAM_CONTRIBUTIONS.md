# CineBook – Team Work Division & Contribution Matrix

**Course:** B.Tech (2nd Year) – Internet Programming Laboratory  
**Project Title:** CineBook – Movie Ticket Booking Web Application  
**Technology Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), Node.js, Express.js, MySQL (mysql2)  

---

## 👥 Group Members & Assigned Roles

| Member No. | Student Name | Roll / Registration No. | Assigned Webpage & Focus Area |
| :--- | :--- | :--- | :--- |
| **Member 1** | `[Student 1 Name]` | `[Roll Number 1]` | **Page 1: Registration (`signup.html`, `signup.js`)** |
| **Member 2** | `[Student 2 Name]` | `[Roll Number 2]` | **Page 2: Authentication (`login.html`, `login.js`)** |
| **Member 3** | `[Student 3 Name]` | `[Roll Number 3]` | **Page 3: Movie Catalog (`movies.html`, `movies.js`)** |
| **Member 4** | `[Student 4 Name]` | `[Roll Number 4]` | **Page 4: Seat Booking (`booking.html`, `booking.js`)** |
| **Member 5** | `[Student 5 Name]` | `[Roll Number 5]` | **Page 5: Ticket Output (`confirmation.html`, `confirmation.js`)** |

---

## 📋 Detailed Individual Work Breakdown

### 👤 Member 1: Registration Page (`signup.html`, `public/js/signup.js`)
* **Core Responsibilities:**
  * Designed semantic HTML5 registration form with input fields for full name, email, password, and confirm password.
  * Implemented client-side JavaScript validation (empty input check, email regex format check, minimum 6-character length check, and password equality verification).
  * Integrated asynchronous Fetch API to send JSON payload via `POST /api/signup` to Express backend.
  * Handled server validation responses (displaying success alerts and friendly error alerts for duplicate email entries).
  * Implemented automatic redirect to the login page upon successful account creation.
* **Viva Explanations:**
  * How DOM event handling works on form submission (`e.preventDefault()`).
  * How passwords are submitted securely and hashed using bcrypt on the server before database insertion.

---

### 👤 Member 2: Login Page (`login.html`, `public/js/login.js`)
* **Core Responsibilities:**
  * Built the login interface with email and password inputs adhering to the dark cinema theme.
  * Added JavaScript client validation for non-empty fields and basic email validation.
  * Integrated Fetch API to submit login credentials via `POST /api/login`.
  * Connected with Express session management (`express-session`), storing user session state on the server.
  * Implemented redirect handling via URL query parameters (`redirect` parameter) so users return to their intended booking after logging in.
* **Viva Explanations:**
  * The difference between client authentication requests and HTTP session cookies (`connect.sid`).
  * How bcrypt compares cleartext login passwords with salted database hashes (`bcrypt.compare`).

---

### 👤 Member 3: Movie Browsing Page (`movies.html`, `public/js/movies.js`)
* **Core Responsibilities:**
  * Developed the dynamic cinema listings page (`movies.html`) featuring cinema hero banner and responsive grid layout.
  * Retrived movie catalog items dynamically from MySQL via `GET /api/movies`.
  * Generated movie cards dynamically using JavaScript DOM methods and template literals.
  * Each card displays the movie poster, title, genre, duration, price in Indian Rupees (`₹`), and an interactive "Book Now" button linking to `booking.html?movie_id=X`.
  * Implemented client-side search filtering and genre filter chips (Sci-Fi, Action, Adventure, Drama) using `Array.prototype.filter()`.
* **Viva Explanations:**
  * How dynamic DOM manipulation eliminates the need for hardcoded static cards.
  * How Array filtering and event listeners work without page reloads.

---

### 👤 Member 4: Booking & Seat Selection Page (`booking.html`, `public/js/booking.js`)
* **Core Responsibilities:**
  * Developed the interactive booking page with movie dropdown, date picker (min today, max 7 days ahead), and showtime selection slots.
  * Designed an interactive cinema seat map consisting of 5 rows (A–E) and 8 seats per row (40 total seats) with a screen projection visual.
  * Implemented seat selection toggle (Available, Selected, Booked).
  * Dynamically calculated total price on the client (`ticket_count * unit_price`) and updated the summary card.
  * Implemented login verification (`GET /api/me`) prompting unauthenticated visitors to log in before reserving seats.
  * Integrated `POST /api/book` with server-side price recalculation and seat conflict prevention.
* **Viva Explanations:**
  * Why calculating prices solely on the client is insecure and how server-side recalculation protects transactions.
  * How occupied seats are queried from the database and disabled in the UI.

---

### 👤 Member 5: Booking Confirmation & Ticket Print (`confirmation.html`, `public/js/confirmation.js`)
* **Core Responsibilities:**
  * Built the confirmation and ticket layout page (`confirmation.html`).
  * Retrieved verified booking details from the backend via `GET /api/booking/:id`.
  * Enforced booking ownership verification (users cannot view tickets belonging to other accounts).
  * Designed an authentic cinema ticket card featuring cinema header, customer name, date/time, allocated seat numbers, total price, and barcode.
  * Implemented the "Print Ticket" functionality using JavaScript `window.print()`.
  * Authored dedicated `@media print` CSS rules in `style.css` to hide headers, footers, and action buttons during printing.
* **Viva Explanations:**
  * How `@media print` directives customize the document layout for physical printers or PDF export.
  * How URL query parameters (`URLSearchParams`) pass identifiers between connected pages.

---

## 🤝 Shared Group Responsibilities
* **Database & Architecture:** Designing MySQL relational database schema (`cinebook`) with `users`, `movies`, and `bookings` tables, primary and foreign key constraints.
* **Backend Development:** Building modular Node.js/Express server (`server.js`, `routes/`, `middleware/`, `config/db.js`).
* **Design Consistency:** Crafting shared cinema stylesheet (`public/css/style.css`) and shared helper functions (`public/js/common.js`).
* **Optional Module IV CRUD:** Developing administrative dashboard (`admin.html`, `routes/admin.js`) for Create, Read, Update, and Delete operations.
* **Integration & Testing:** Executing automated API test suite (`npm test`) and cross-browser testing.
* **Documentation & Report:** Authoring `README.md`, `TEAM_CONTRIBUTIONS.md`, and the assignment report (`CineBook_Report.docx` and `CineBook_Report.pdf`).
