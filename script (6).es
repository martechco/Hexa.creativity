document.addEventListener('DOMContentLoaded', () => {
    // Loader
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.visibility = 'hidden';
            }, 500);
        }, 1000);
    });

    // Scroll Progress Bar
    window.onscroll = function() { updateProgressBar() };
    function updateProgressBar() {
        var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var scrolled = (winScroll / height) * 100;
        document.getElementById("myBar").style.width = scrolled + "%";
        
        // Navbar scroll effect
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button
        const backToTop = document.getElementById('backToTop');
        if (window.scrollY > 500) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    }

    // Back to Top
    document.getElementById('backToTop').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when link clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Fade In Animation on Scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // FAQ Accordion
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });

    // Review System
    let reviews = JSON.parse(localStorage.getItem('hexa_reviews')) || [];
    // User ID for ownership (simple implementation using localStorage)
    let currentUserId = localStorage.getItem('hexa_user_id');
    if (!currentUserId) {
        currentUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('hexa_user_id', currentUserId);
    }

    const reviewForm = document.getElementById('reviewForm');
    const starInput = document.getElementById('starInput');
    const revRating = document.getElementById('revRating');
    const reviewGrid = document.getElementById('reviewGrid');
    const avgRatingEl = document.getElementById('avgRating');
    const avgStarsEl = document.getElementById('avgStars');
    const totalReviewsEl = document.getElementById('totalReviews');
    const reviewSearch = document.getElementById('reviewSearch');
    const reviewSort = document.getElementById('reviewSort');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    let displayLimit = 3;

    // Star Input Logic
    starInput.querySelectorAll('i').forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = star.getAttribute('data-rating');
            highlightStars(rating);
        });

        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            revRating.value = rating;
            highlightStars(rating, true);
        });
    });

    starInput.addEventListener('mouseleave', () => {
        highlightStars(revRating.value, true);
    });

    function highlightStars(rating, permanent = false) {
        starInput.querySelectorAll('i').forEach(star => {
            if (star.getAttribute('data-rating') <= rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }

    // Profanity Filter (Basic)
    const badWords = ['badword1', 'badword2', 'spam']; // Add more as needed
    function filterText(text) {
        let filtered = text;
        badWords.forEach(word => {
            const reg = new RegExp(word, 'gi');
            filtered = filtered.replace(reg, '***');
        });
        return filtered;
    }

    // Submit Review
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const rating = parseInt(revRating.value);
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        const name = document.getElementById('revName').value;
        const title = document.getElementById('revTitle').value;
        const message = document.getElementById('revMessage').value;

        // Prevent duplicate reviews (simple check by name and title)
        const isDuplicate = reviews.some(r => r.name === name && r.title === title);
        if (isDuplicate) {
            alert('You have already submitted this review.');
            return;
        }

        const newReview = {
            id: Date.now(),
            userId: currentUserId,
            name: filterText(name),
            rating: rating,
            title: filterText(title),
            message: filterText(message),
            date: new Date().toLocaleDateString()
        };

        reviews.push(newReview);
        localStorage.setItem('hexa_reviews', JSON.stringify(reviews));
        
        reviewForm.reset();
        revRating.value = 0;
        highlightStars(0);
        
        renderReviews();
        updateStats();
    });

    function renderReviews() {
        let filteredReviews = [...reviews];

        // Search
        const searchTerm = reviewSearch.value.toLowerCase();
        if (searchTerm) {
            filteredReviews = filteredReviews.filter(r => 
                r.title.toLowerCase().includes(searchTerm) || 
                r.message.toLowerCase().includes(searchTerm) ||
                r.name.toLowerCase().includes(searchTerm)
            );
        }

        // Sort
        const sortBy = reviewSort.value;
        if (sortBy === 'newest') filteredReviews.sort((a, b) => b.id - a.id);
        else if (sortBy === 'oldest') filteredReviews.sort((a, b) => a.id - b.id);
        else if (sortBy === 'highest') filteredReviews.sort((a, b) => b.rating - a.rating);
        else if (sortBy === 'lowest') filteredReviews.sort((a, b) => a.rating - b.rating);

        reviewGrid.innerHTML = '';
        
        const toDisplay = filteredReviews.slice(0, displayLimit);
        
        toDisplay.forEach(rev => {
            const card = document.createElement('div');
            card.className = 'review-card';
            
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += `<i class="${i <= rev.rating ? 'fas' : 'far'} fa-star"></i>`;
            }

            // Only show delete/edit if current user owns it
            const isOwner = rev.userId === currentUserId;
            const actionsHtml = isOwner ? `
                <div class="review-actions">
                    <button class="btn btn-secondary rev-btn delete-btn" data-id="${rev.id}">Delete</button>
                </div>
            ` : '';

            card.innerHTML = `
                <div class="review-card-header">
                    <div class="rev-user-info">
                        <h4>${rev.name}</h4>
                        <div class="rev-stars">${starsHtml}</div>
                    </div>
                    <div class="rev-date">${rev.date}</div>
                </div>
                <h5>${rev.title}</h5>
                <p>${rev.message}</p>
                ${actionsHtml}
            `;
            reviewGrid.appendChild(card);
        });

        // Load More visibility
        if (filteredReviews.length > displayLimit) {
            loadMoreBtn.parentElement.style.display = 'block';
        } else {
            loadMoreBtn.parentElement.style.display = 'none';
        }

        // Attach delete events
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                deleteReview(id);
            });
        });
    }

    function deleteReview(id) {
        const reviewIndex = reviews.findIndex(r => r.id === id);
        if (reviewIndex > -1) {
            // Security check: ensure current user owns the review
            if (reviews[reviewIndex].userId === currentUserId) {
                if (confirm('Are you sure you want to delete your review?')) {
                    reviews.splice(reviewIndex, 1);
                    localStorage.setItem('hexa_reviews', JSON.stringify(reviews));
                    renderReviews();
                    updateStats();
                }
            } else {
                alert('You can only delete your own reviews.');
            }
        }
    }

    function updateStats() {
        const total = reviews.length;
        totalReviewsEl.textContent = total;

        if (total === 0) {
            avgRatingEl.textContent = '0.0';
            avgStarsEl.innerHTML = '';
            return;
        }

        const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
        const avg = (sum / total).toFixed(1);
        avgRatingEl.textContent = avg;

        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.round(avg)) starsHtml += '<i class="fas fa-star"></i>';
            else starsHtml += '<i class="far fa-star"></i>';
        }
        avgStarsEl.innerHTML = starsHtml;
    }

    // Controls Events
    reviewSearch.addEventListener('input', () => {
        displayLimit = 3;
        renderReviews();
    });
    reviewSort.addEventListener('change', () => {
        displayLimit = 3;
        renderReviews();
    });
    loadMoreBtn.addEventListener('click', () => {
        displayLimit += 3;
        renderReviews();
    });

    // Initial Load
    updateStats();
    renderReviews();
});
