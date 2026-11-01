/**
 * CineBook - Page 3: Movie Browsing Script
 * Responsible: Group Member 3
 * Syllabus Concepts: Fetch API, Arrays & Objects, DOM Manipulation, Event Listeners, Dynamic Card Generation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Array to store all movies fetched from the database
    let allMovies = [];
    let selectedGenre = 'all';

    const moviesContainer = document.getElementById('movies-grid-container');
    const statusContainer = document.getElementById('movies-status');
    const searchInput = document.getElementById('movie-search');
    const genreButtons = document.querySelectorAll('#genre-filter-container .chip');

    /**
     * 1. Fetch movie list from the Express REST API
     */
    async function loadMovies() {
        try {
            moviesContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94a3b8;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎬</div>
                    Loading cinema listings from database...
                </div>
            `;

            const response = await fetch('/api/movies');
            const data = await response.json();

            if (response.ok && data.success) {
                allMovies = data.movies;
                renderMovies(allMovies);
            } else {
                CineBook.showAlert('movies-status', data.message || 'Failed to load movie catalog.', 'danger');
            }
        } catch (err) {
            console.error('[Movies Load Error]:', err);
            CineBook.showAlert('movies-status', 'Error connecting to database. Please ensure backend server is active.', 'danger');
        }
    }

    /**
     * 2. Render movie cards dynamically into the DOM
     * Demonstrates: Array forEach loop, Object property access, DOM manipulation
     */
    function renderMovies(moviesList) {
        moviesContainer.innerHTML = '';

        if (!moviesList || moviesList.length === 0) {
            moviesContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94a3b8;">
                    <h3>No movies found</h3>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">Try searching for a different title or genre.</p>
                </div>
            `;
            return;
        }

        moviesList.forEach((movie) => {
            // Create movie card container
            const card = document.createElement('article');
            card.className = 'movie-card';

            // Format price and poster path
            const formattedPrice = CineBook.formatCurrency(movie.price);
            const posterSrc = movie.poster || '/images/inception.svg';

            card.innerHTML = `
                <div class="poster-wrapper">
                    <img src="${posterSrc}" alt="${CineBook.escapeHtml(movie.title)}" loading="lazy">
                    <div class="movie-price-tag">${formattedPrice}</div>
                </div>
                <div class="movie-details">
                    <h3 class="movie-title">${CineBook.escapeHtml(movie.title)}</h3>
                    <div class="movie-meta">
                        <span>🏷️ ${CineBook.escapeHtml(movie.genre)}</span>
                        <span>⏱️ ${movie.duration} min</span>
                    </div>
                    <p class="movie-desc">${CineBook.escapeHtml(movie.description)}</p>
                    <a href="/booking.html?movie_id=${movie.movie_id}" class="btn btn-primary btn-block">
                        🎟️ Book Now
                    </a>
                </div>
            `;

            moviesContainer.appendChild(card);
        });
    }

    /**
     * 3. Filter movies based on search text and selected genre chip
     * Demonstrates: Array.prototype.filter(), String methods, DOM events
     */
    function applyFilters() {
        const query = searchInput.value.toLowerCase().trim();

        const filtered = allMovies.filter((movie) => {
            const matchesSearch =
                movie.title.toLowerCase().includes(query) ||
                movie.genre.toLowerCase().includes(query) ||
                (movie.description && movie.description.toLowerCase().includes(query));

            const matchesGenre =
                selectedGenre === 'all' ||
                movie.genre.toLowerCase().includes(selectedGenre.toLowerCase());

            return matchesSearch && matchesGenre;
        });

        renderMovies(filtered);
    }

    // Attach search input listener
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    // Attach genre filter chips click listeners
    genreButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            genreButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGenre = btn.getAttribute('data-genre');
            applyFilters();
        });
    });

    // Initial load
    loadMovies();
});
