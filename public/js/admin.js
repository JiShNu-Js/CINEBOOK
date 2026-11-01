/**
 * CineBook - Admin Dashboard Script (Module IV CRUD Demonstration)
 * Syllabus Concepts: Full CRUD Operations with RESTful Express APIs & MySQL,
 * Modals, Event Listeners, Dynamic Table Rendering, Protected Access
 */

document.addEventListener('DOMContentLoaded', async () => {
    const mainSection = document.getElementById('admin-main-section');
    const accessWarning = document.getElementById('admin-access-warning');
    const moviesTableBody = document.getElementById('movies-table-body');
    const bookingsTableBody = document.getElementById('bookings-table-body');
    const openAddModalBtn = document.getElementById('btn-open-add-modal');
    const modalOverlay = document.getElementById('movie-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');
    const cancelModalBtn = document.getElementById('btn-cancel-modal');
    const crudForm = document.getElementById('movie-crud-form');
    const modalTitle = document.getElementById('modal-title');

    // Form inputs
    const movieIdInput = document.getElementById('crud-movie-id');
    const titleInput = document.getElementById('crud-title');
    const genreInput = document.getElementById('crud-genre');
    const durationInput = document.getElementById('crud-duration');
    const priceInput = document.getElementById('crud-price');
    const posterInput = document.getElementById('crud-poster');
    const descriptionInput = document.getElementById('crud-description');

    let allMovies = [];

    /**
     * 1. Check Administrator Access
     */
    async function checkAdminAuth() {
        try {
            const res = await fetch('/api/me');
            const data = await res.json();

            if (!data.loggedIn || !data.user || data.user.role !== 'admin') {
                mainSection.style.display = 'none';
                accessWarning.style.display = 'block';
                return false;
            }

            mainSection.style.display = 'block';
            accessWarning.style.display = 'none';
            return true;
        } catch (err) {
            console.error('[Admin Auth Check Error]:', err);
            mainSection.style.display = 'none';
            accessWarning.style.display = 'block';
            return false;
        }
    }

    /**
     * 2. READ: Fetch and Render All Movies
     */
    async function loadAdminMovies() {
        try {
            const res = await fetch('/api/admin/movies');
            const data = await res.json();

            if (res.ok && data.success) {
                allMovies = data.movies;
                renderMoviesTable(allMovies);
            } else {
                CineBook.showAlert('admin-alert', data.message || 'Failed to load movies.', 'danger');
            }
        } catch (err) {
            console.error('[Admin Load Movies Error]:', err);
        }
    }

    function renderMoviesTable(movies) {
        moviesTableBody.innerHTML = '';

        if (!movies || movies.length === 0) {
            moviesTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 2rem;">No movies in the catalog yet.</td></tr>';
            return;
        }

        movies.forEach((m) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="${m.poster || '/images/inception.svg'}" class="table-thumb" alt="${CineBook.escapeHtml(m.title)}">
                </td>
                <td><strong>${CineBook.escapeHtml(m.title)}</strong></td>
                <td>${CineBook.escapeHtml(m.genre)}</td>
                <td>${m.duration} min</td>
                <td style="color: var(--accent-gold); font-weight: 600;">${CineBook.formatCurrency(m.price)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm btn-edit" data-id="${m.movie_id}">✏️ Edit</button>
                    <button class="btn btn-outline btn-sm btn-delete" data-id="${m.movie_id}" style="color: var(--error-red); border-color: rgba(239,68,68,0.4);">🗑️ Delete</button>
                </td>
            `;
            moviesTableBody.appendChild(tr);
        });

        // Bind Edit buttons
        document.querySelectorAll('.btn-edit').forEach((btn) => {
            btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
        });

        // Bind Delete buttons
        document.querySelectorAll('.btn-delete').forEach((btn) => {
            btn.addEventListener('click', () => deleteMovie(parseInt(btn.dataset.id)));
        });
    }

    /**
     * 3. READ: Fetch and Render All Bookings
     */
    async function loadAdminBookings() {
        try {
            const res = await fetch('/api/admin/bookings');
            const data = await res.json();

            if (res.ok && data.success) {
                renderBookingsTable(data.bookings);
            }
        } catch (err) {
            console.error('[Admin Load Bookings Error]:', err);
        }
    }

    function renderBookingsTable(bookings) {
        bookingsTableBody.innerHTML = '';

        if (!bookings || bookings.length === 0) {
            bookingsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 2rem;">No bookings found.</td></tr>';
            return;
        }

        bookings.forEach((b) => {
            const tr = document.createElement('tr');
            const refCode = `CB-${String(b.booking_id).padStart(5, '0')}`;
            const dateStr = String(b.show_date).slice(0, 10);
            tr.innerHTML = `
                <td><code>#${refCode}</code></td>
                <td>
                    <strong>${CineBook.escapeHtml(b.user_name || 'Customer')}</strong><br>
                    <small style="color: var(--text-dim);">${CineBook.escapeHtml(b.user_email || '')}</small>
                </td>
                <td>
                    <strong>${CineBook.escapeHtml(b.title || 'Movie')}</strong><br>
                    <small style="color: var(--accent-gold);">🎬 ${CineBook.escapeHtml(b.theater_name || 'Theater')} (${CineBook.escapeHtml(b.screen_name || 'Screen')})</small>
                </td>
                <td>${dateStr} @ ${b.show_time}</td>
                <td><span style="color: var(--primary-red); font-weight: 600;">${b.seats}</span> (${b.ticket_count})</td>
                <td style="color: var(--accent-gold); font-weight: 700;">${CineBook.formatCurrency(b.total_price)}</td>
            `;
            bookingsTableBody.appendChild(tr);
        });
    }

    /**
     * 4. Modal Handlers
     */
    function openModal() {
        modalOverlay.classList.add('open');
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        crudForm.reset();
        movieIdInput.value = '';
    }

    function openAddModal() {
        modalTitle.textContent = 'Add New Movie';
        movieIdInput.value = '';
        crudForm.reset();
        posterInput.value = '/images/inception.svg';
        openModal();
    }

    function openEditModal(id) {
        const movie = allMovies.find((m) => m.movie_id === id);
        if (!movie) return;

        modalTitle.textContent = `Edit Movie: ${movie.title}`;
        movieIdInput.value = movie.movie_id;
        titleInput.value = movie.title;
        genreInput.value = movie.genre;
        durationInput.value = movie.duration;
        priceInput.value = movie.price;
        posterInput.value = movie.poster;
        descriptionInput.value = movie.description || '';
        openModal();
    }

    openAddModalBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    /**
     * 5. CREATE & UPDATE: Form Submission
     */
    crudForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        CineBook.clearAlert('admin-alert');

        const movieId = movieIdInput.value;
        const payload = {
            title: titleInput.value.trim(),
            genre: genreInput.value.trim(),
            duration: parseInt(durationInput.value),
            price: parseFloat(priceInput.value),
            poster: posterInput.value.trim() || '/images/inception.svg',
            description: descriptionInput.value.trim()
        };

        const isEditing = Boolean(movieId);
        const endpoint = isEditing ? `/api/admin/movies/${movieId}` : '/api/admin/movies';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                closeModal();
                CineBook.showAlert('admin-alert', data.message || 'Operation successful!', 'success');
                loadAdminMovies();
            } else {
                alert(data.message || 'Error saving movie.');
            }
        } catch (err) {
            console.error('[Admin Save Error]:', err);
            alert('Failed to connect to the server.');
        }
    });

    /**
     * 6. DELETE: Remove Movie
     */
    async function deleteMovie(id) {
        const movie = allMovies.find((m) => m.movie_id === id);
        const title = movie ? movie.title : `Movie #${id}`;

        if (!confirm(`Are you sure you want to delete "${title}" from the catalog? This will also remove associated bookings.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/movies/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (res.ok && data.success) {
                CineBook.showAlert('admin-alert', data.message || 'Movie deleted successfully.', 'success');
                loadAdminMovies();
                loadAdminBookings();
            } else {
                CineBook.showAlert('admin-alert', data.message || 'Failed to delete movie.', 'danger');
            }
        } catch (err) {
            console.error('[Admin Delete Error]:', err);
            CineBook.showAlert('admin-alert', 'Server error while deleting movie.', 'danger');
        }
    }

    // Initialize admin page if authorized
    const hasAdminAccess = await checkAdminAuth();
    if (hasAdminAccess) {
        await loadAdminMovies();
        await loadAdminBookings();
    }
});
