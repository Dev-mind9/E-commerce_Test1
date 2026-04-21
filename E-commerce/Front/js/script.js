// ============================================
// SHOPELITE - MAIN APPLICATION SCRIPT
// Modern JavaScript application initialization
// ============================================

class ShopEliteApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.handlePageLoad();
    }

    // Setup global event listeners
    setupEventListeners() {
        // Newsletter form submission
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmission(e.target);
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const mobileMenu = document.getElementById('mobile-menu');
            const menuToggle = document.getElementById('menu-toggle');

            if (mobileMenu && mobileMenu.classList.contains('active') &&
                !mobileMenu.contains(e.target) && e.target !== menuToggle) {
                mobileMenu.classList.remove('active');
            }
        });

        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // Initialize components
    initializeComponents() {
        // Add loading states
        this.addLoadingStates();

        // Initialize animations
        this.initializeAnimations();

        // Setup form validations
        this.setupFormValidations();
    }

    // Handle page load animations and setup
    handlePageLoad() {
        // Add fade-in animation to elements
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.product-card, .feature-card, .section-title').forEach(el => {
            observer.observe(el);
        });

        // Show page content after loading
        document.body.classList.add('loaded');
    }

    // Handle newsletter submission
    async handleNewsletterSubmission(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!emailInput || !submitBtn) return;

        const email = emailInput.value.trim();

        // Basic email validation
        if (!this.isValidEmail(email)) {
            this.showFormError(emailInput, 'Veuillez entrer une adresse email valide');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscription...';

        try {
            // Simulate API call
            await this.delay(1500);

            // Success
            this.showNotification('Merci pour votre inscription ! Vous recevrez nos offres bientôt.', 'success');
            form.reset();

        } catch (error) {
            this.showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'S\'inscrire';
        }
    }

    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show form error
    showFormError(input, message) {
        // Remove existing error
        this.clearFormError(input);

        // Add error class
        input.classList.add('error');

        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;

        input.parentNode.insertBefore(errorElement, input.nextSibling);

        // Focus input
        input.focus();
    }

    // Clear form error
    clearFormError(input) {
        input.classList.remove('error');
        const errorElement = input.parentNode.querySelector('.form-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Setup form validations
    setupFormValidations() {
        // Real-time validation for email inputs
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value && !this.isValidEmail(input.value)) {
                    this.showFormError(input, 'Adresse email invalide');
                } else {
                    this.clearFormError(input);
                }
            });

            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.clearFormError(input);
                }
            });
        });
    }

    // Add loading states to buttons
    addLoadingStates() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('loading')) return;

                const originalText = this.innerHTML;
                this.classList.add('loading');
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                // Remove loading state after animation
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.innerHTML = originalText;
                }, 1000);
            });
        });
    }

    // Initialize scroll animations
    initializeAnimations() {
        // Add scroll-based animations
        const scrollHandler = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            // Parallax effect for hero image
            const heroImage = document.querySelector('.hero-image img');
            if (heroImage) {
                heroImage.style.transform = `translateY(${rate}px)`;
            }
        };

        window.addEventListener('scroll', scrollHandler);
    }

    // Handle window resize
    handleResize() {
        // Close mobile menu on desktop
        if (window.innerWidth > 768) {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
            }
        }
    }

    // Show notification (reuse cart notification system)
    showNotification(message, type = 'info') {
        if (typeof cartManager !== 'undefined' && cartManager.showNotification) {
            cartManager.showNotification(message, type);
        } else {
            // Fallback notification
            alert(message);
        }
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get current page
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('products.html')) return 'products';
        if (path.includes('cart.html')) return 'cart';
        return 'home';
    }

    // Page-specific initializations
    initializePageSpecificFeatures() {
        const currentPage = this.getCurrentPage();

        switch (currentPage) {
            case 'products':
                this.initializeProductsPage();
                break;
            case 'cart':
                this.initializeCartPage();
                break;
            default:
                this.initializeHomePage();
        }
    }

    // Home page specific features
    initializeHomePage() {
        // Auto-render products when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                if (typeof productManager !== 'undefined') {
                    productManager.renderProducts();
                }
            });
        } else {
            if (typeof productManager !== 'undefined') {
                productManager.renderProducts();
            }
        }
    }

    // Products page features
    initializeProductsPage() {
        // Initialize filters, sorting, etc.
        console.log('Products page initialized');
    }

    // Cart page features
    initializeCartPage() {
        // Initialize cart display
        if (typeof cartManager !== 'undefined') {
            cartManager.updateCartPage();
        }
    }
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // In production, send to error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // In production, send to error tracking service
});

// Performance monitoring
if ('performance' in window && 'timing' in performance) {
    window.addEventListener('load', () => {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page load time: ${pageLoadTime}ms`);
    });
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.shopEliteApp = new ShopEliteApp();
    });
} else {
    window.shopEliteApp = new ShopEliteApp();
}

// Global utility functions
function showCart() {
    if (typeof cartManager !== 'undefined') {
        cartManager.showCart();
    }
}

function showProductDetails(productId) {
    if (typeof productManager !== 'undefined') {
        productManager.showProductDetails(productId);
    }
}

// Add additional CSS for form errors and loading states
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .form-error {
        color: var(--danger);
        font-size: var(--font-size-sm);
        margin-top: var(--spacing-xs);
        display: block;
    }

    input.error {
        border-color: var(--danger);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .btn.loading {
        pointer-events: none;
        position: relative;
    }

    .btn.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 16px;
        margin: -8px 0 0 -8px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .empty-cart, .empty-cart-modal {
        text-align: center;
        padding: var(--spacing-3xl);
        color: var(--gray-500);
    }

    .empty-cart i, .empty-cart-modal i {
        font-size: var(--font-size-4xl);
        margin-bottom: var(--spacing-lg);
        color: var(--gray-400);
    }

    .no-products {
        text-align: center;
        padding: var(--spacing-3xl);
        color: var(--gray-500);
    }

    .no-products i {
        font-size: var(--font-size-4xl);
        margin-bottom: var(--spacing-lg);
        color: var(--gray-400);
    }

    .product-rating {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
    }

    .stars {
        color: var(--warning);
        font-size: var(--font-size-sm);
    }

    .reviews {
        color: var(--gray-600);
        font-size: var(--font-size-sm);
    }

    .product-badge.out-of-stock {
        background-color: var(--gray-500);
    }
`;
document.head.appendChild(additionalStyles);

// Export for development
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShopEliteApp;
}