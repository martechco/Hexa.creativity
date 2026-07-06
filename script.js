document.addEventListener('DOMContentLoaded', () => {
    // 1. Loader
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            document.body.style.overflow = 'auto';
            reveal(); // Initial reveal
        }, 1000);
    });

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // 4. Scroll Progress Bar
    const scrollProgress = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / height) * 100;
        scrollProgress.style.width = `${scrolled}%`;
    });

    // 5. Back to Top Button
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 6. Reveal Animations on Scroll
    const reveal = () => {
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const revealTop = el.getBoundingClientRect().top;
            const revealPoint = 150;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', reveal);

    // 7. Navbar Active Link on Scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // 8. FAQ Accordion
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // 9. Review System
    const reviewForm = document.getElementById('reviewForm');
    const starInput = document.getElementById('starInput');
    const ratingValue = document.getElementById('ratingValue');
    const reviewsGrid = document.getElementById('reviewsGrid');
    const avgRatingEl = document.getElementById('avgRating');
    const avgStarsEl = document.getElementById('avgStars');
    const totalReviewsEl = document.getElementById('totalReviewsCount');
    const reviewSearch = document.getElementById('reviewSearch');
    const reviewSort = document.getElementById('reviewSort');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    let reviews = JSON.parse(localStorage.getItem('hexa_reviews')) || [];
    let displayedCount = 3;

    // Star Rating Interaction
    const stars = starInput.querySelectorAll('i');
    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = star.dataset.rating;
            highlightStars(rating);
        });

        star.addEventListener('mouseout', () => {
            highlightStars(ratingValue.value);
        });

        star.addEventListener('click', () => {
            ratingValue.value = star.dataset.rating;
            highlightStars(ratingValue.value);
        });
    });

    function highlightStars(rating) {
        stars.forEach(s => {
            if (s.dataset.rating <= rating) {
                s.classList.replace('far', 'fas');
            } else {
                s.classList.replace('fas', 'far');
            }
        });
    }

    // Profanity Filter (Basic)
    const profanity = ['badword1', 'badword2']; // Example
    function filterText(text) {
        let filtered = text;
        profanity.forEach(word => {
            const regex = new RegExp(word, 'gi');
            filtered = filtered.replace(regex, '***');
        });
        return filtered;
    }

    // Submit Review
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (ratingValue.value === '0') {
            alert('Please select a star rating.');
            return;
        }

        const name = document.getElementById('reviewerName').value;
        
        // Prevent duplicates
        if (reviews.some(r => r.name.toLowerCase() === name.toLowerCase())) {
            alert('You have already submitted a review.');
            return;
        }

        const newReview = {
            id: Date.now(),
            name: name,
            rating: parseInt(ratingValue.value),
            title: filterText(document.getElementById('reviewTitle').value),
            message: filterText(document.getElementById('reviewMessage').value),
            date: new Date().toLocaleDateString()
        };

        reviews.unshift(newReview);
        localStorage.setItem('hexa_reviews', JSON.stringify(reviews));
        
        reviewForm.reset();
        ratingValue.value = '0';
        highlightStars(0);
        
        updateReviewUI();
        alert('Review submitted successfully!');
    });

    // Update UI
    function updateReviewUI() {
        const searchTerm = reviewSearch.value.toLowerCase();
        const sortMethod = reviewSort.value;

        let filteredReviews = reviews.filter(r => 
            r.name.toLowerCase().includes(searchTerm) || 
            r.title.toLowerCase().includes(searchTerm) || 
            r.message.toLowerCase().includes(searchTerm)
        );

        if (sortMethod === 'highest') {
            filteredReviews.sort((a, b) => b.rating - a.rating);
        } else if (sortMethod === 'lowest') {
            filteredReviews.sort((a, b) => a.rating - b.rating);
        } else {
            filteredReviews.sort((a, b) => b.id - a.id);
        }

        // Stats
        const total = reviews.length;
        const avg = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : '5.0';
        
        totalReviewsEl.textContent = total;
        avgRatingEl.textContent = avg;
        
        let starHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.round(avg)) starHTML += '<i class="fas fa-star"></i>';
            else starHTML += '<i class="far fa-star"></i>';
        }
        avgStarsEl.innerHTML = starHTML;

        // Render
        reviewsGrid.innerHTML = '';
        const toDisplay = filteredReviews.slice(0, displayedCount);
        
        if (toDisplay.length === 0) {
            reviewsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No reviews found.</p>';
        }

        toDisplay.forEach(r => {
            const card = document.createElement('div');
            card.className = 'review-card';
            
            let cardStars = '';
            for (let i = 1; i <= 5; i++) {
                cardStars += i <= r.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
            }

            card.innerHTML = `
                <div class="review-card-header">
                    <div class="reviewer-info">
                        <h4>${r.name}</h4>
                        <div class="stars">${cardStars}</div>
                    </div>
                    <span class="review-date">${r.date}</span>
                </div>
                <h5>${r.title}</h5>
                <p>${r.message}</p>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="deleteReview(${r.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.8rem;">Delete</button>
                </div>
            `;
            reviewsGrid.appendChild(card);
        });

        loadMoreBtn.style.display = filteredReviews.length > displayedCount ? 'inline-block' : 'none';
    }

    window.deleteReview = (id) => {
        if (confirm('Are you sure you want to delete this review?')) {
            reviews = reviews.filter(r => r.id !== id);
            localStorage.setItem('hexa_reviews', JSON.stringify(reviews));
            updateReviewUI();
        }
    };

    reviewSearch.addEventListener('input', updateReviewUI);
    reviewSort.addEventListener('change', updateReviewUI);
    loadMoreBtn.addEventListener('click', () => {
        displayedCount += 3;
        updateReviewUI();
    });

    // Initial Reviews if empty
    if (reviews.length === 0) {
        reviews = [
            { id: 1, name: 'Alex Rivera', rating: 5, title: 'Incredible Work!', message: 'Hexa transformed my community completely. The organization and security are top-notch.', date: '12/05/2026' },
            { id: 2, name: 'Sarah Chen', rating: 5, title: 'Highly Recommended', message: 'Fast delivery and very professional. The ticket system works perfectly.', date: '15/05/2026' },
            { id: 3, name: 'Marcus J.', rating: 4, title: 'Great Service', message: 'Very happy with the result. The automation saves me hours every day.', date: '20/05/2026' }
        ];
        localStorage.setItem('hexa_reviews', JSON.stringify(reviews));
    }

    updateReviewUI();
});
