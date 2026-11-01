/**
 * CineBook - Page 5: Booking Output & Ticket Printing Script
 * Responsible: Group Member 5
 * Syllabus Concepts: Fetch API, URLSearchParams, DOM Updates, window.print(), Print Styles
 */

document.addEventListener('DOMContentLoaded', async () => {
    const loadingElem = document.getElementById('ticket-loading');
    const ticketCard = document.getElementById('ticket-card');
    const actionsGroup = document.getElementById('ticket-actions-group');
    const printBtn = document.getElementById('btn-print-ticket');

    // DOM fields on ticket
    const refIdElem = document.getElementById('ticket-ref-id');
    const posterElem = document.getElementById('ticket-poster');
    const titleElem = document.getElementById('ticket-movie-title');
    const genreElem = document.getElementById('ticket-movie-genre');
    const theaterNameElem = document.getElementById('ticket-theater-name');
    const theaterLocElem = document.getElementById('ticket-theater-location');
    const screenElem = document.getElementById('ticket-screen-name');
    const nameElem = document.getElementById('ticket-customer-name');
    const dateElem = document.getElementById('ticket-date');
    const timeElem = document.getElementById('ticket-time');
    const seatsElem = document.getElementById('ticket-seats');
    const countElem = document.getElementById('ticket-count');
    const priceElem = document.getElementById('ticket-total-price');
    const barcodeElem = document.getElementById('ticket-barcode-num');

    // Extract booking_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    let bookingId = urlParams.get('booking_id');

    /**
     * Fetch confirmed booking from the backend database
     */
    async function fetchBookingDetails() {
        try {
            // If booking ID wasn't in URL, fetch user's most recent booking
            if (!bookingId) {
                const myBookingsRes = await fetch('/api/my-bookings');
                const myBookingsData = await myBookingsRes.json();

                if (myBookingsData.success && myBookingsData.bookings.length > 0) {
                    bookingId = myBookingsData.bookings[0].booking_id;
                } else {
                    showError('No booking ID was provided, and no recent bookings were found.');
                    return;
                }
            }

            // Fetch specific booking by ID
            const response = await fetch(`/api/booking/${bookingId}`);
            const data = await response.json();

            if (response.ok && data.success && data.booking) {
                renderTicket(data.booking);
            } else {
                showError(data.message || 'Unable to retrieve booking details.');
            }
        } catch (err) {
            console.error('[Confirmation Fetch Error]:', err);
            showError('Server error while retrieving your confirmed ticket.');
        }
    }

    /**
     * Render data into ticket layout
     */
    function renderTicket(booking) {
        loadingElem.style.display = 'none';

        // Format booking reference number (e.g. CB-000042)
        const paddedId = String(booking.booking_id).padStart(6, '0');
        refIdElem.textContent = `REF: #CB-${paddedId}`;

        // Populate fields
        posterElem.src = booking.poster || '/images/inception.svg';
        posterElem.alt = booking.title;
        titleElem.textContent = booking.title;
        genreElem.textContent = booking.genre || 'Cinema Feature';
        if (theaterNameElem) theaterNameElem.textContent = booking.theater_name || 'CineBook Cinema';
        if (theaterLocElem) theaterLocElem.textContent = booking.theater_location || booking.location || 'Main Complex';
        if (screenElem) screenElem.textContent = booking.screen_name || 'AUDI 01';
        nameElem.textContent = booking.user_name || 'Valued Customer';
        dateElem.textContent = String(booking.show_date).slice(0, 10);
        timeElem.textContent = booking.show_time;
        seatsElem.textContent = booking.seats;
        countElem.textContent = `${booking.ticket_count} ${booking.ticket_count > 1 ? 'Tickets' : 'Ticket'}`;
        priceElem.textContent = CineBook.formatCurrency(booking.total_price);

        // Generate stylized alphanumeric barcode string
        barcodeElem.textContent = `CB-${paddedId}-${new Date(booking.created_at || Date.now()).getFullYear()}`;

        // Display ticket and print buttons
        ticketCard.style.display = 'block';
        actionsGroup.style.display = 'flex';
    }

    /**
     * Display error state
     */
    function showError(msg) {
        loadingElem.style.display = 'none';
        CineBook.showAlert('confirmation-alert', msg, 'danger');
        const header = document.getElementById('success-header-block');
        if (header) header.style.display = 'none';
    }

    /**
     * Print Ticket Event Listener
     * Triggers native browser print dialog, with print-specific CSS rules applied
     */
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Load ticket
    fetchBookingDetails();
});
