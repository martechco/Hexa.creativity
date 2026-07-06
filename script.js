/**
 * Hexa.Creativity - Professional Discord Server Development
 * Frontend JavaScript - Clean, modular architecture
 */

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Preloader.init();
    Navigation.init();
    ScrollIndicator.init();
    ScrollAnimations.init();
    Accordion.init();
    ReviewSystem.init();
    BackToTop.init();
});

// ============================================
// PRELOADER MODULE
// ============================================

const Preloader = {
    init() {
        window.addEventListener('load', () => {
            this.hide();
        });
    },

    hide() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 800);
    }
};

// ============================================
// NAVIGATION MODULE
// ============================================

const Navigation = {
    navbar: null,
    toggle: null,
    menu: null,
    links: null,
    scrollThreshold: 50,

    init() {
        this.navbar = document.getElementById('navbar');
        this.toggle = document.getElementById('navToggle');
        this.menu = document.getElementById('navMenu');
        this.links = document.querySelectorAll('.navbar__link');

        if (!this.navbar || !this.toggle || !this.menu) return;

        this.attachEventListeners();
    },

    attachEventListeners() {
        // Mobile menu toggle
        this.toggle.addEventListener('click', () => this.toggleMenu());

        // Close menu on link click
        this.links.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Scroll effects
        window.addEventListener('scroll', () => this.onScroll());
    },

    toggleMenu() {
        const isActive = this.menu.classList.contains('active');
        if (isActive) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    },

    openMenu() {
        this.menu.classList.add('active');
        this.toggle.classList.add('active');
        this.toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    },

    closeMenu() {
        this.menu.classList.remove('active');
        this.toggle.classList.remove('active');
        this.toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = 'auto';
    },

    onScroll() {
        // Add scrolled class to navbar
        if (window.scrollY > this.scrollThreshold) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // Update active link
        this.updateActiveLink();
    },

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        this.links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    }
};

// ============================================
// SCROLL INDICATOR MODULE
// ============================================

const ScrollIndicator = {
    indicator: null,

    init() {
        this.indicator = document.getElementById('scrollIndicator');
        if (!this.indicator) return;

        window.addEventListener('scroll', () => this.updateProgress());
    },

    updateProgress() {
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / docHeight) * 100;
        this.indicator.style.width = `${scrolled}%`;
    }
};

// ============================================
// SCROLL ANIMATIONS MODULE
// ============================================

const ScrollAnimations = {
    elements: null,
    observerOptions: {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    },

    init() {
        this.elements = document.querySelectorAll('.fade-in');
        if (this.elements.length === 0) return;

        this.setupIntersectionObserver();
    },

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.elements.forEach(el => observer.observe(el));
    }
};

// ============================================
// ACCORDION MODULE
// ============================================

const Accordion = {
    items: null,

    init() {
        this.items = document.querySelectorAll('.accordion-item');
        if (this.items.length === 0) return;

        this.attachEventListeners();
    },

    attachEventListeners() {
        this.items.forEach(item => {
            const header = item.querySelector('.accordion-header');
            if (header) {
                header.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggle(item);
                });
            }
        });
    },

    toggle(item) {
        const isOpen = item.hasAttribute('open');

        // Close all items
        this.items.forEach(i => i.removeAttribute('open'));

        // Open clicked item if it wasn't open
        if (!isOpen) {
            item.setAttribute('open', '');
        }
    }
};

// ============================================
// REVIEW SYSTEM MODULE
// ============================================

const ReviewSystem = {
    form: null,
    reviewsGrid: null,
    starInput: null,
    ratingValue: null,
    reviewSearch: null,
    reviewSort: null,
    loadMoreBtn: null,
    avgRating: null,
    avgStars: null,
    totalReviewsCount: null,
    reviews: [],
    displayedCount: 3,
    storageKey: 'hexa_reviews',
    profanityList: ['badword1', 'badword2'],

    init() {
        this.form = document.getElementById('reviewForm');
        this.reviewsGrid = document.getElementById('reviewsGrid');
        this.starInput = document.getElementById('starInput');
        this.ratingValue = document.getElementById('ratingValue');
        this.reviewSearch = document.getElementById('reviewSearch');
        this.reviewSort = document.getElementById('reviewSort');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.avgRating = document.getElementById('avgRating');
        this.avgStars = document.getElementById('avgStars');
        this.totalReviewsCount = document.getElementById('totalReviewsCount');

        if (!this.form || !this.reviewsGrid) return;

        this.loadReviews();
        this.attachEventListeners();
        this.renderReviews();
    },

    attachEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Star rating
        const stars = this.starInput.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('click', () => this.selectRating(star.dataset.rating));
            star.addEventListener('mouseover', () => this.highlightStars(star.dataset.rating));
            star.addEventListener('mouseout', () => this.highlightStars(this.ratingValue.value));
        });

        // Search and sort
        this.reviewSearch.addEventListener('input', () => this.renderReviews());
        this.reviewSort.addEventListener('change', () => this.renderReviews());
        this.loadMoreBtn.addEventListener('click', () => this.loadMore());
    },

    loadReviews() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.reviews = JSON.parse(stored);
        } else {
            this.reviews = this.getDefaultReviews();
            this.saveReviews();
        }
    },

    getDefaultReviews() {
        return [
            {
                id: 1,
                name: 'Alex Rivera',
                rating: 5,
                title: 'Incredible Work!',
                message: 'Hexa transformed my community completely. The organization and security are top-notch. Highly recommended!',
                date: '12/05/2026'
            },
            {
                id: 2,
                name: 'Sarah Chen',
                rating: 5,
                title: 'Highly Recommended',
                message: 'Fast delivery and very professional. The ticket system works perfectly and our support team loves it.',
                date: '15/05/2026'
            },
            {
                id: 3,
                name: 'Marcus J.',
                rating: 4,
                title: 'Great Service',
                message: 'Very happy with the result. The automation saves me hours every day managing the community.',
                date: '20/05/2026'
            }
        ];
    },

    saveReviews() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.reviews));
    },

    selectRating(rating) {
        this.ratingValue.value = rating;
        this.highlightStars(rating);
    },

    highlightStars(rating) {
        const stars = this.starInput.querySelectorAll('i');
        stars.forEach(star => {
            if (star.dataset.rating <= rating) {
                star.classList.replace('far', 'fas');
            } else {
                star.classList.replace('fas', 'far');
            }
        });
    },

    filterText(text) {
        let filtered = text;
        this.profanityList.forEach(word => {
            const regex = new RegExp(word, 'gi');
            filtered = filtered.replace(regex, '***');
        });
        return filtered;
    },

    handleSubmit(e) {
        e.preventDefault();

        const rating = parseInt(this.ratingValue.value);
        if (rating === 0) {
            alert('Please select a star rating.');
            return;
        }

        const name = document.getElementById('reviewerName').value;
        if (this.reviews.some(r => r.name.toLowerCase() === name.toLowerCase())) {
            alert('You have already submitted a review.');
            return;
        }

        const newReview = {
            id: Date.now(),
            name: name,
            rating: rating,
            title: this.filterText(document.getElementById('reviewTitle').value),
            message: this.filterText(document.getElementById('reviewMessage').value),
            date: new Date().toLocaleDateString('en-GB')
        };

        this.reviews.unshift(newReview);
        this.saveReviews();
        this.form.reset();
        this.ratingValue.value = '0';
        this.highlightStars(0);
        this.displayedCount = 3;
        this.renderReviews();

        alert('Thank you for your review!');
    },

    renderReviews() {
        const searchTerm = this.reviewSearch.value.toLowerCase();
        const sortMethod = this.reviewSort.value;

        let filtered = this.reviews.filter(r =>
            r.name.toLowerCase().includes(searchTerm) ||
            r.title.toLowerCase().includes(searchTerm) ||
            r.message.toLowerCase().includes(searchTerm)
        );

        // Sort
        if (sortMethod === 'highest') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (sortMethod === 'lowest') {
            filtered.sort((a, b) => a.rating - b.rating);
        } else {
            filtered.sort((a, b) => b.id - a.id);
        }

        // Update stats
        this.updateStats();

        // Render cards
        this.reviewsGrid.innerHTML = '';
        const toDisplay = filtered.slice(0, this.displayedCount);

        if (toDisplay.length === 0) {
            this.reviewsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No reviews found.</p>';
        } else {
            toDisplay.forEach(review => {
                const card = this.createReviewCard(review);
                this.reviewsGrid.appendChild(card);
            });
        }

        // Show/hide load more button
        this.loadMoreBtn.style.display = filtered.length > this.displayedCount ? 'inline-block' : 'none';
    },

    createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'review-card fade-in';

        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += i <= review.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        }

        card.innerHTML = `
            <div class="review-card-header">
                <div class="reviewer-info">
                    <h4>${this.escapeHTML(review.name)}</h4>
                    <div class="stars">${starsHTML}</div>
                </div>
                <span class="review-date">${review.date}</span>
            </div>
            <h5>${this.escapeHTML(review.title)}</h5>
            <p>${this.escapeHTML(review.message)}</p>
        `;

        return card;
    },

    updateStats() {
        const total = this.reviews.length;
        const avg = total > 0 ? (this.reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : '5.0';

        this.totalReviewsCount.textContent = total;
        this.avgRating.textContent = avg;

        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += i <= Math.round(avg) ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        }
        this.avgStars.innerHTML = starsHTML;
    },

    loadMore() {
        this.displayedCount += 3;
        this.renderReviews();
    },

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// BACK TO TOP MODULE
// ============================================

const BackToTop = {
    button: null,
    scrollThreshold: 500,

    init() {
        this.button = document.getElementById('backToTop');
        if (!this.button) return;

        window.addEventListener('scroll', () => this.onScroll());
        this.button.addEventListener('click', () => this.scrollToTop());
    },

    onScroll() {
        if (window.scrollY > this.scrollThreshold) {
            this.button.removeAttribute('hidden');
        } else {
            this.button.setAttribute('hidden', '');
        }
    },

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};
