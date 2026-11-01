/**
 * CineBook - Page 4: Booking & Seat Selection Script (with Theater Selection)
 * Responsible: Group Member 4
 * Syllabus Concepts: DOM Manipulation, Interactive Seat Grid, Dynamic Price Calculation,
 * Event Delegation, Server-side Revalidation, Session Verification
 *
 * Booking Workflow: Movie -> Theater -> Date -> Showtime -> Seats -> Confirmation
 */

document.addEventListener('DOMContentLoaded', async () => {
    // State variables
    let moviesList = [];
    let theatersList = [];
    let selectedMovie = null;
    let selectedTheater = null;
    let selectedDate = '';
    let selectedTime = '02:00 PM';
    let selectedSeats = [];
    let bookedSeats = new Set();
    let isLoggedIn = false;

    // DOM Elements
    const movieSelect = document.getElementById('movie-select');
    const theaterSelect = document.getElementById('theater-select');
    const theatersGridContainer = document.getElementById('theaters-grid-container');
    const theatersCountBadge = document.getElementById('theaters-count-badge');
    const theaterBadgeInfo = document.getElementById('theater-badge-info');
    const theaterInfoLocation = document.getElementById('theater-info-location');
    const theaterInfoScreen = document.getElementById('theater-info-screen');
    const dateInput = document.getElementById('show-date');
    const slotButtons = document.querySelectorAll('.slot-btn');
    const seatMapContainer = document.getElementById('seat-map');
    const confirmBtn = document.getElementById('btn-confirm-booking');
    const authBanner = document.getElementById('auth-status-banner');

    // Summary Card Elements
    const summaryPosterImg = document.getElementById('summary-poster-img');
    const summaryMovieTitle = document.getElementById('summary-movie-title');
    const summaryTheaterName = document.getElementById('summary-theater-name');
    const summaryTheater = document.getElementById('summary-theater');
    const summaryScreen = document.getElementById('summary-screen');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    const summarySeats = document.getElementById('summary-seats');
    const summaryCount = document.getElementById('summary-count');
    const summaryUnitPrice = document.getElementById('summary-unit-price');
    const summaryTotalPrice = document.getElementById('summary-total-price');

    /**
     * 1. Initialize Dates: Today to 7 days ahead
     */
    function setupDateSelector() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const nextYyyy = nextWeek.getFullYear();
        const nextMm = String(nextWeek.getMonth() + 1).padStart(2, '0');
        const nextDd = String(nextWeek.getDate()).padStart(2, '0');
        const maxStr = `${nextYyyy}-${nextMm}-${nextDd}`;

        dateInput.min = todayStr;
        dateInput.max = maxStr;
        dateInput.value = todayStr;
        selectedDate = todayStr;
        summaryDate.textContent = todayStr;
    }

    /**
     * 2. Verify Authentication State
     */
    async function checkUserAuth() {
        try {
            const res = await fetch('/api/me');
            const data = await res.json();
            isLoggedIn = data.loggedIn;

            if (!isLoggedIn) {
                const currentMovieId = movieSelect.value || '';
                const redirectTarget = encodeURIComponent(`/booking.html${currentMovieId ? '?movie_id=' + currentMovieId : ''}`);
                authBanner.innerHTML = `
                    <div class="alert alert-warning" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                        <div>
                            <strong>Notice:</strong> You must be logged in to confirm ticket reservations.
                        </div>
                        <a href="/login.html?redirect=${redirectTarget}" class="btn btn-primary btn-sm">Log In Now</a>
                    </div>
                `;
            } else {
                authBanner.innerHTML = '';
            }
        } catch (err) {
            console.error('[Auth Check Error]:', err);
        }
    }

    /**
     * 3. Fetch Movies and populate select dropdown
     */
    async function fetchMovies() {
        try {
            const response = await fetch('/api/movies');
            const data = await response.json();

            if (response.ok && data.success) {
                moviesList = data.movies;
                movieSelect.innerHTML = '<option value="">-- Choose a Movie --</option>';

                moviesList.forEach((movie) => {
                    const option = document.createElement('option');
                    option.value = movie.movie_id;
                    option.textContent = `${movie.title} (${CineBook.formatCurrency(movie.price)})`;
                    movieSelect.appendChild(option);
                });

                // Check if movie_id query parameter exists in URL
                const urlParams = new URLSearchParams(window.location.search);
                const queryMovieId = parseInt(urlParams.get('movie_id'));

                if (queryMovieId) {
                    movieSelect.value = queryMovieId;
                    onMovieChange(queryMovieId);
                }
            }
        } catch (err) {
            console.error('[Movies Init Error]:', err);
            CineBook.showAlert('booking-alert', 'Unable to load movie list.', 'danger');
        }
    }

    /**
     * 4. Fetch Theaters dynamically from GET /api/theaters
     * Handles loading, empty, and fallback states gracefully
     */
    async function fetchTheaters() {
        if (theatersGridContainer) {
            theatersGridContainer.innerHTML = `
                <div class="theater-loading">
                    <span>🏛️</span> Loading available cinema theaters...
                </div>
            `;
        }

        try {
            const response = await fetch('/api/theaters');
            const data = await response.json();

            if (response.ok && data.success && Array.isArray(data.theaters) && data.theaters.length > 0) {
                theatersList = data.theaters;
                populateTheatersUI();
            } else if (response.ok && data.success && Array.isArray(data.theaters) && data.theaters.length === 0) {
                theatersList = [];
                if (theatersGridContainer) {
                    theatersGridContainer.innerHTML = `
                        <div class="theater-empty">
                            ⚠️ No cinema theaters found. Theaters added in the Admin Panel will appear here automatically.
                        </div>
                    `;
                }
                theaterSelect.innerHTML = '<option value="">-- No Theaters Available --</option>';
            } else {
                console.warn('[CineBook Theaters]: API returned unexpected response, using default theaters list.');
                useFallbackTheaters();
            }
        } catch (err) {
            console.warn('[CineBook Theaters]: Network fetch error, using default theaters list:', err.message);
            useFallbackTheaters();
        }
    }

    /**
     * Fallback theaters list (used if network or outdated server is encountered)
     */
    function useFallbackTheaters() {
        theatersList = [
            { theater_id: 1, theater_name: 'CineBook IMAX Laser', location: 'Phoenix Palladium Mall, Downtown', screen_name: 'Audi 1 (IMAX Laser)' },
            { theater_id: 2, theater_name: 'CineBook PVR Premiere', location: 'Galaxy Galleria, West Avenue', screen_name: 'Audi 2 (Dolby Atmos)' },
            { theater_id: 3, theater_name: 'CineBook Cinepolis 4DX', location: 'Metroplex Plaza, City Center', screen_name: 'Audi 3 (4DX Dynamic)' },
            { theater_id: 4, theater_name: 'CineBook Royale Luxe', location: 'Grand Horizon Mall, North Hills', screen_name: 'Audi VIP (Gold Class)' }
        ];
        populateTheatersUI();
    }

    /**
     * Populate theater dropdown and visual theater cards
     */
    function populateTheatersUI() {
        if (theatersCountBadge) {
            theatersCountBadge.textContent = `${theatersList.length} Theaters Available`;
            theatersCountBadge.style.display = 'inline-block';
        }

        // Populate Dropdown
        theaterSelect.innerHTML = '<option value="">-- Select Cinema Theater --</option>';
        theatersList.forEach((t) => {
            const option = document.createElement('option');
            option.value = t.theater_id;
            option.textContent = `${t.theater_name} (${t.location})`;
            theaterSelect.appendChild(option);
        });

        // Render Visual Theater Cards
        renderTheaterCards();

        // Auto-select first theater by default if available
        if (theatersList.length > 0) {
            theaterSelect.value = theatersList[0].theater_id;
            onTheaterChange(theatersList[0].theater_id);
        }
    }

    /**
     * Render Interactive Theater Selection Cards
     */
    function renderTheaterCards() {
        if (!theatersGridContainer) return;
        theatersGridContainer.innerHTML = '';

        theatersList.forEach((t) => {
            const card = document.createElement('div');
            card.className = `theater-card ${selectedTheater && selectedTheater.theater_id === t.theater_id ? 'active' : ''}`;
            card.dataset.id = t.theater_id;

            card.innerHTML = `
                <div class="theater-card-header">
                    <span>🏛️</span>
                    <span class="theater-card-name">${CineBook.escapeHtml(t.theater_name)}</span>
                </div>
                <div class="theater-card-location">📍 ${CineBook.escapeHtml(t.location)}</div>
                <div class="theater-card-screen">${CineBook.escapeHtml(t.screen_name)}</div>
            `;

            card.addEventListener('click', () => {
                theaterSelect.value = t.theater_id;
                onTheaterChange(t.theater_id);
            });

            theatersGridContainer.appendChild(card);
        });
    }

    function showTheatersError(msg) {
        if (theatersGridContainer) {
            theatersGridContainer.innerHTML = `
                <div class="theater-empty" style="color: var(--error-red);">
                    ⚠️ ${CineBook.escapeHtml(msg)}
                </div>
            `;
        }
        theaterSelect.innerHTML = '<option value="">-- Failed to Load Theaters --</option>';
    }

    /**
     * 5. Handle Movie Selection
     */
    function onMovieChange(movieId) {
        selectedMovie = moviesList.find((m) => m.movie_id === parseInt(movieId)) || null;
        selectedSeats = []; // Reset selected seats

        if (selectedMovie) {
            summaryMovieTitle.textContent = selectedMovie.title;
            summaryPosterImg.src = selectedMovie.poster || '/images/inception.svg';
            summaryUnitPrice.textContent = CineBook.formatCurrency(selectedMovie.price);
            fetchBookedSeatsAndRender();
        } else {
            summaryMovieTitle.textContent = 'Select a Movie';
            summaryUnitPrice.textContent = '₹0.00';
            seatMapContainer.innerHTML = '<p style="color: #64748b; padding: 2rem;">Please choose a movie and theater above to view available seats.</p>';
        }

        updatePriceCalculation();
    }

    /**
     * 6. Handle Theater Selection
     */
    function onTheaterChange(theaterId) {
        selectedTheater = theatersList.find((t) => t.theater_id === parseInt(theaterId)) || null;
        selectedSeats = []; // Reset seat selection when changing theater

        // Synchronize active state across visual theater cards
        if (theatersGridContainer) {
            const cards = theatersGridContainer.querySelectorAll('.theater-card');
            cards.forEach((c) => {
                c.classList.toggle('active', parseInt(c.dataset.id) === parseInt(theaterId));
            });
        }

        if (selectedTheater) {
            theaterBadgeInfo.style.display = 'block';
            theaterInfoLocation.textContent = selectedTheater.location;
            theaterInfoScreen.textContent = selectedTheater.screen_name;

            summaryTheaterName.textContent = selectedTheater.theater_name;
            summaryTheater.textContent = selectedTheater.theater_name;
            summaryScreen.textContent = selectedTheater.screen_name;

            fetchBookedSeatsAndRender();
        } else {
            theaterBadgeInfo.style.display = 'none';
            summaryTheaterName.textContent = 'Select Theater';
            summaryTheater.textContent = '--';
            summaryScreen.textContent = '--';
            seatMapContainer.innerHTML = '<p style="color: #64748b; padding: 2rem;">Please choose a cinema theater above to view available seats.</p>';
        }

        updatePriceCalculation();
    }

    /**
     * 7. Query theater-specific booked seats from backend and render the seat grid
     */
    async function fetchBookedSeatsAndRender() {
        if (!selectedMovie || !selectedTheater || !selectedDate || !selectedTime) {
            if (!selectedMovie || !selectedTheater) {
                seatMapContainer.innerHTML = '<p style="color: #64748b; padding: 2rem;">Please choose both a movie and a theater above to view available seats.</p>';
            }
            return;
        }

        try {
            const url = `/api/movies/${selectedMovie.movie_id}/booked-seats?theaterId=${selectedTheater.theater_id}&date=${selectedDate}&time=${encodeURIComponent(selectedTime)}`;
            const res = await fetch(url);
            const data = await res.json();

            bookedSeats = new Set();
            if (res.ok && data.success && Array.isArray(data.bookedSeats)) {
                data.bookedSeats.forEach((s) => bookedSeats.add(s.trim()));
            }

            renderSeatGrid();
        } catch (err) {
            console.error('[Fetch Booked Seats Error]:', err);
            bookedSeats = new Set();
            renderSeatGrid();
        }
    }

    /**
     * 8. Render the 5x8 Seat Matrix (Rows A to E, Seats 1 to 8 = 40 seats)
     */
    function renderSeatGrid() {
        seatMapContainer.innerHTML = '';
        const rows = ['A', 'B', 'C', 'D', 'E'];
        const seatsPerRow = 8;

        rows.forEach((rowLetter) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row';

            // Row Label
            const label = document.createElement('span');
            label.className = 'row-label';
            label.textContent = rowLetter;
            rowDiv.appendChild(label);

            // Seats in Row
            for (let i = 1; i <= seatsPerRow; i++) {
                const seatCode = `${rowLetter}${i}`;
                const seatDiv = document.createElement('div');
                seatDiv.className = 'seat';
                seatDiv.textContent = i;
                seatDiv.dataset.seat = seatCode;

                if (bookedSeats.has(seatCode)) {
                    seatDiv.classList.add('booked');
                    seatDiv.title = `Seat ${seatCode} is already booked in ${selectedTheater ? selectedTheater.theater_name : 'this theater'}`;
                } else {
                    if (selectedSeats.includes(seatCode)) {
                        seatDiv.classList.add('selected');
                    }
                    // Seat click event listener
                    seatDiv.addEventListener('click', () => toggleSeatSelection(seatCode, seatDiv));
                }

                rowDiv.appendChild(seatDiv);
            }

            seatMapContainer.appendChild(rowDiv);
        });
    }

    /**
     * 9. Toggle Seat Selection
     */
    function toggleSeatSelection(seatCode, seatElement) {
        if (seatElement.classList.contains('booked')) return;

        const index = selectedSeats.indexOf(seatCode);
        if (index > -1) {
            // Unselect seat
            selectedSeats.splice(index, 1);
            seatElement.classList.remove('selected');
        } else {
            // Select seat
            selectedSeats.push(seatCode);
            seatElement.classList.add('selected');
        }

        updatePriceCalculation();
    }

    /**
     * 10. Dynamic Price Calculation
     */
    function updatePriceCalculation() {
        const count = selectedSeats.length;
        summarySeats.textContent = count > 0 ? selectedSeats.sort().join(', ') : 'None';
        summaryCount.textContent = count;

        let total = 0;
        if (selectedMovie && selectedTheater && count > 0) {
            total = count * parseFloat(selectedMovie.price);
            confirmBtn.disabled = false;
        } else {
            confirmBtn.disabled = true;
        }

        summaryTotalPrice.textContent = CineBook.formatCurrency(total);
    }

    /**
     * 11. Event Listeners for Controls
     */
    movieSelect.addEventListener('change', (e) => {
        onMovieChange(e.target.value);
    });

    theaterSelect.addEventListener('change', (e) => {
        onTheaterChange(e.target.value);
    });

    dateInput.addEventListener('change', (e) => {
        selectedDate = e.target.value;
        summaryDate.textContent = selectedDate || '--';
        fetchBookedSeatsAndRender();
    });

    slotButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            slotButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTime = btn.dataset.time;
            summaryTime.textContent = selectedTime;
            fetchBookedSeatsAndRender();
        });
    });

    /**
     * 12. Booking Submission to Backend API
     */
    confirmBtn.addEventListener('click', async () => {
        CineBook.clearAlert('booking-alert');

        // Check login requirement
        if (!isLoggedIn) {
            const currentMovieId = selectedMovie ? selectedMovie.movie_id : '';
            window.location.href = `/login.html?redirect=${encodeURIComponent('/booking.html?movie_id=' + currentMovieId)}`;
            return;
        }

        // Validate form inputs
        if (!selectedMovie) {
            CineBook.showAlert('booking-alert', 'Please select a movie.', 'danger');
            return;
        }
        if (!selectedTheater) {
            CineBook.showAlert('booking-alert', 'Please select a cinema theater.', 'danger');
            return;
        }
        if (!selectedDate) {
            CineBook.showAlert('booking-alert', 'Please select a show date.', 'danger');
            return;
        }
        if (selectedSeats.length === 0) {
            CineBook.showAlert('booking-alert', 'Please select at least one seat to book.', 'danger');
            return;
        }

        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Processing Booking...';

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    movieId: selectedMovie.movie_id,
                    theaterId: selectedTheater.theater_id,
                    showDate: selectedDate,
                    showTime: selectedTime,
                    seats: selectedSeats
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Success: Redirect to Page 5 (Confirmation and Ticket Print)
                window.location.href = `/confirmation.html?booking_id=${data.bookingId}`;
            } else {
                CineBook.showAlert('booking-alert', data.message || 'Booking failed. Please try again.', 'danger');
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Confirm & Reserve Seats';
                // Refresh booked seats in case of seat collision
                fetchBookedSeatsAndRender();
            }
        } catch (err) {
            console.error('[Booking Submit Error]:', err);
            CineBook.showAlert('booking-alert', 'Server error. Unable to complete your reservation.', 'danger');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm & Reserve Seats';
        }
    });

    // Boot sequence
    setupDateSelector();
    await checkUserAuth();
    await fetchTheaters();
    await fetchMovies();
});
