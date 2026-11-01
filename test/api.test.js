/**
 * CineBook - Comprehensive Automated Test Suite
 * Validates all REST API endpoints, business logic, session handling,
 * price recalculation, theater selection, theater-specific seat conflicts,
 * ownership checks, and CRUD.
 */

const http = require('http');
const app = require('../server');

const TEST_PORT = 3099;
let server;
let baseUrl;

// Utility function to execute HTTP requests with cookie support
function request(method, path, body = null, cookie = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, baseUrl);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {}
        };

        let requestData = null;
        if (body) {
            requestData = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(requestData);
        }

        if (cookie) {
            options.headers['Cookie'] = cookie;
        }

        const req = http.request(options, (res) => {
            let resData = '';
            res.on('data', (chunk) => { resData += chunk; });
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(resData);
                } catch (e) {
                    parsed = resData;
                }

                // Extract session cookie if set
                let setCookie = null;
                const setCookieHeader = res.headers['set-cookie'];
                if (setCookieHeader && setCookieHeader.length > 0) {
                    setCookie = setCookieHeader[0].split(';')[0];
                }

                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: parsed,
                    cookie: setCookie
                });
            });
        });

        req.on('error', (err) => reject(err));
        if (requestData) req.write(requestData);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting CineBook Automated Test Suite...\n');
    let passed = 0;
    let failed = 0;

    function assert(condition, testName, details = '') {
        if (condition) {
            console.log(`  ✅ PASS: ${testName}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${testName} - ${details}`);
            failed++;
        }
    }

    try {
        // Start test server
        await new Promise((resolve) => {
            server = app.listen(TEST_PORT, () => {
                baseUrl = `http://localhost:${TEST_PORT}`;
                resolve();
            });
        });

        // -------------------------------------------------------------
        // TEST 1: User Registration (POST /api/signup)
        // -------------------------------------------------------------
        const testEmail = `test_${Date.now()}@example.com`;
        const signupRes = await request('POST', '/api/signup', {
            name: 'Test Student',
            email: testEmail,
            password: 'secretPassword123',
            confirmPassword: 'secretPassword123'
        });
        assert(signupRes.status === 201 && signupRes.body.success, 'User Registration (POST /api/signup)');

        // -------------------------------------------------------------
        // TEST 2: Duplicate Email Rejection
        // -------------------------------------------------------------
        const dupRes = await request('POST', '/api/signup', {
            name: 'Test Duplicate',
            email: testEmail,
            password: 'secretPassword123',
            confirmPassword: 'secretPassword123'
        });
        assert(dupRes.status === 409 && !dupRes.body.success, 'Duplicate Email Rejection (409 Conflict)');

        // -------------------------------------------------------------
        // TEST 3: Login with Invalid Credentials
        // -------------------------------------------------------------
        const badLoginRes = await request('POST', '/api/login', {
            email: testEmail,
            password: 'wrong_password'
        });
        assert(badLoginRes.status === 401, 'Login with Invalid Password (401 Unauthorized)');

        // -------------------------------------------------------------
        // TEST 4: Successful Login & Session Cookie
        // -------------------------------------------------------------
        const loginRes = await request('POST', '/api/login', {
            email: testEmail,
            password: 'secretPassword123'
        });
        const userCookie = loginRes.cookie;
        assert(loginRes.status === 200 && userCookie, 'Successful Login & Session Cookie (POST /api/login)');

        // -------------------------------------------------------------
        // TEST 5: Active Session Status (GET /api/me)
        // -------------------------------------------------------------
        const meRes = await request('GET', '/api/me', null, userCookie);
        assert(meRes.body.loggedIn && meRes.body.user.email === testEmail, 'Session Verification (GET /api/me)');

        // -------------------------------------------------------------
        // TEST 6: Movies Catalog (GET /api/movies)
        // -------------------------------------------------------------
        const moviesRes = await request('GET', '/api/movies');
        assert(moviesRes.status === 200 && Array.isArray(moviesRes.body.movies) && moviesRes.body.movies.length >= 4,
            `Movie Catalog Retrieval (Found ${moviesRes.body.movies?.length || 0} movies)`);

        const firstMovie = moviesRes.body.movies[0];

        // -------------------------------------------------------------
        // TEST 7: Single Movie Details (GET /api/movies/:id)
        // -------------------------------------------------------------
        const movieDetailRes = await request('GET', `/api/movies/${firstMovie.movie_id}`);
        assert(movieDetailRes.status === 200 && movieDetailRes.body.movie.title === firstMovie.title,
            'Single Movie Details Retrieval (GET /api/movies/:id)');

        // -------------------------------------------------------------
        // TEST 8: Theaters List (GET /api/theaters)
        // -------------------------------------------------------------
        const theatersRes = await request('GET', '/api/theaters');
        assert(theatersRes.status === 200 && Array.isArray(theatersRes.body.theaters) && theatersRes.body.theaters.length >= 3,
            `Theaters List Retrieval (Found ${theatersRes.body.theaters?.length || 0} theaters)`);

        const theater1 = theatersRes.body.theaters[0];
        const theater2 = theatersRes.body.theaters[1];

        // -------------------------------------------------------------
        // TEST 9: Single Theater Details (GET /api/theaters/:id)
        // -------------------------------------------------------------
        const theaterDetailRes = await request('GET', `/api/theaters/${theater1.theater_id}`);
        assert(theaterDetailRes.status === 200 && theaterDetailRes.body.theater.theater_name === theater1.theater_name,
            'Single Theater Details Retrieval (GET /api/theaters/:id)');

        // -------------------------------------------------------------
        // TEST 10: Protected Booking - Unauthenticated Access Denied
        // -------------------------------------------------------------
        const unauthBookRes = await request('POST', '/api/book', {
            movieId: firstMovie.movie_id,
            theaterId: theater1.theater_id,
            showDate: '2026-11-05',
            showTime: '06:15 PM',
            seats: ['C3', 'C4']
        });
        assert(unauthBookRes.status === 401, 'Unauthenticated Booking Denied (401 Unauthorized)');

        // -------------------------------------------------------------
        // TEST 11: Authenticated Booking with Theater Selection & Server Price Calc
        // -------------------------------------------------------------
        const bookRes = await request('POST', '/api/book', {
            movieId: firstMovie.movie_id,
            theaterId: theater1.theater_id,
            showDate: '2026-11-05',
            showTime: '06:15 PM',
            seats: ['C3', 'C4']
        }, userCookie);
        const bookingId = bookRes.body.bookingId;
        const expectedPrice = parseFloat(firstMovie.price) * 2;
        assert(bookRes.status === 201 && bookRes.body.totalPrice === expectedPrice,
            `Ticket Booking with Theater Selection (Expected: ₹${expectedPrice}, Got: ₹${bookRes.body.totalPrice})`);

        // -------------------------------------------------------------
        // TEST 12: Same Theater Duplicate Seat Conflict Detection
        // -------------------------------------------------------------
        const dupSeatRes = await request('POST', '/api/book', {
            movieId: firstMovie.movie_id,
            theaterId: theater1.theater_id,
            showDate: '2026-11-05',
            showTime: '06:15 PM',
            seats: ['C4', 'C5'] // C4 already booked in Theater 1!
        }, userCookie);
        assert(dupSeatRes.status === 409, 'Same Theater Duplicate Seat Conflict (409 Conflict on C4 in Theater 1)');

        // -------------------------------------------------------------
        // TEST 13: Theater-Specific Seat Isolation
        // Same seat (C4) on same date/time in Theater 2 must SUCCEED!
        // -------------------------------------------------------------
        const diffTheaterBookRes = await request('POST', '/api/book', {
            movieId: firstMovie.movie_id,
            theaterId: theater2.theater_id, // Different theater!
            showDate: '2026-11-05',
            showTime: '06:15 PM',
            seats: ['C4'] // Allowed because Theater 2 has its own distinct hall
        }, userCookie);
        assert(diffTheaterBookRes.status === 201, 'Theater-Specific Seat Isolation (Seat C4 successfully booked in Theater 2)');

        // -------------------------------------------------------------
        // TEST 14: Confirmation & Ticket Details with Theater Info (GET /api/booking/:id)
        // -------------------------------------------------------------
        const confirmRes = await request('GET', `/api/booking/${bookingId}`, null, userCookie);
        const confirmedBooking = confirmRes.body.booking;
        assert(
            confirmRes.status === 200 &&
            confirmedBooking.booking_id === bookingId &&
            confirmedBooking.theater_name === theater1.theater_name &&
            confirmedBooking.screen_name === theater1.screen_name,
            `Booking Confirmation Retrieval with Theater Info (${confirmedBooking?.theater_name || 'N/A'})`
        );

        // -------------------------------------------------------------
        // TEST 15: Booking Ownership Protection
        // -------------------------------------------------------------
        // Login as another user (Rahul Sharma: rahul@cinebook.com)
        const rahulLogin = await request('POST', '/api/login', {
            email: 'rahul@cinebook.com',
            password: 'user123'
        });
        const rahulCookie = rahulLogin.cookie;
        const crossUserRes = await request('GET', `/api/booking/${bookingId}`, null, rahulCookie);
        assert(crossUserRes.status === 403, 'Cross-User Booking Access Denied (403 Forbidden)');

        // -------------------------------------------------------------
        // TEST 16: Admin CRUD Operations
        // -------------------------------------------------------------
        // Login as Admin
        const adminLogin = await request('POST', '/api/login', {
            email: 'admin@cinebook.com',
            password: 'admin123'
        });
        const adminCookie = adminLogin.cookie;

        // Admin CREATE movie
        const addMovieRes = await request('POST', '/api/admin/movies', {
            title: 'The Matrix (Remastered)',
            description: 'A computer hacker learns about the true nature of reality.',
            genre: 'Sci-Fi / Action',
            duration: 136,
            price: 260.00,
            poster: '/images/inception.svg'
        }, adminCookie);
        const createdMovieId = addMovieRes.body.movieId;
        assert(addMovieRes.status === 201 && createdMovieId, 'Admin CRUD: CREATE Movie (POST /api/admin/movies)');

        // Admin UPDATE movie
        const updateMovieRes = await request('PUT', `/api/admin/movies/${createdMovieId}`, {
            title: 'The Matrix (Special Edition)',
            description: 'Updated synopsis for special edition.',
            genre: 'Sci-Fi / Action',
            duration: 140,
            price: 275.00,
            poster: '/images/inception.svg'
        }, adminCookie);
        assert(updateMovieRes.status === 200, 'Admin CRUD: UPDATE Movie (PUT /api/admin/movies/:id)');

        // Admin DELETE movie
        const deleteMovieRes = await request('DELETE', `/api/admin/movies/${createdMovieId}`, null, adminCookie);
        assert(deleteMovieRes.status === 200, 'Admin CRUD: DELETE Movie (DELETE /api/admin/movies/:id)');

        // -------------------------------------------------------------
        // TEST 17: User Logout (POST /api/logout)
        // -------------------------------------------------------------
        const logoutRes = await request('POST', '/api/logout', null, userCookie);
        const checkAfterLogout = await request('GET', '/api/me', null, userCookie);
        assert(logoutRes.status === 200 && !checkAfterLogout.body.loggedIn, 'User Session Termination (POST /api/logout)');

        console.log('\n====================================================');
        console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
        console.log('====================================================');

    } catch (err) {
        console.error('Fatal Test Execution Error:', err);
    } finally {
        if (server) server.close();
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();
