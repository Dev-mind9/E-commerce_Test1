// ============================================
// SHOPELITE - PRODUCTS MANAGEMENT
// Modern JavaScript with ES6+ features
// ============================================

class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentCategory = 'all';
        this.currentSort = 'name';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
    }

    // Load products data
    loadProducts() {
        this.products = [
            {
                id: 1,
                name: 'iPhone 14 Pro Max',
                description: 'Le dernier smartphone Apple avec caméra professionnelle et performance exceptionnelle.',
                price: 1199,
                oldPrice: 1299,
                category: 'smartphones',
                image: 'images/IPHONE.png',
                rating: 4.8,
                reviews: 245,
                inStock: true,
                featured: true,
                tags: ['apple', 'smartphone', 'premium']
            },
            {
                id: 2,
                name: 'Montre Versace',
                description: 'Montre élégante Versace avec bracelet en acier inoxydable et mouvement automatique.',
                price: 450,
                oldPrice: null,
                category: 'watches',
                image: 'images/MOTRE.png',
                rating: 4.6,
                reviews: 89,
                inStock: true,
                featured: true,
                tags: ['versace', 'watch', 'luxury']
            },
            {
                id: 3,
                name: 'Polo Lacoste',
                description: 'Polo classique Lacoste en coton premium, parfait pour un look casual élégant.',
                price: 85,
                oldPrice: 95,
                category: 'clothing',
                image: 'images/POLO.png',
                rating: 4.4,
                reviews: 156,
                inStock: true,
                featured: false,
                tags: ['lacoste', 'polo', 'casual']
            },
            {
                id: 4,
                name: 'AirPods Pro',
                description: 'Écouteurs sans fil avec réduction de bruit active et qualité audio supérieure.',
                price: 279,
                oldPrice: 299,
                category: 'audio',
                image: 'images/airpods.jpg',
                rating: 4.7,
                reviews: 312,
                inStock: true,
                featured: true,
                tags: ['apple', 'airpods', 'wireless']
            },
            {
                id: 5,
                name: 'MacBook Air M2',
                description: 'Ordinateur portable ultraléger avec puce M2 pour des performances exceptionnelles.',
                price: 1299,
                oldPrice: 1399,
                category: 'computers',
                image: 'images/macbook.jpg',
                rating: 4.9,
                reviews: 178,
                inStock: false,
                featured: true,
                tags: ['apple', 'macbook', 'laptop']
            },
            {
                id: 6,
                name: 'Nike Air Max',
                description: 'Chaussures de sport iconiques avec amorti Air Max pour le confort ultime.',
                price: 150,
                oldPrice: 180,
                category: 'shoes',
                image: 'images/nike.jpg',
                rating: 4.5,
                reviews: 203,
                inStock: true,
                featured: false,
                tags: ['nike', 'sneakers', 'sport']
            }
        ];

        this.filteredProducts = [...this.products];
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.filterProducts();
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchQuery = searchInput?.value.toLowerCase() || '';
                this.filterProducts();
            });
        }

        // Mobile menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
            });
        }
    }

    // Filter products based on search and category
    filterProducts() {
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = this.searchQuery === '' ||
                product.name.toLowerCase().includes(this.searchQuery) ||
                product.description.toLowerCase().includes(this.searchQuery) ||
                product.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));

            const matchesCategory = this.currentCategory === 'all' || product.category === this.currentCategory;

            return matchesSearch && matchesCategory;
        });

        this.sortProducts();
        this.renderProducts();
    }

    // Sort products
    sortProducts() {
        this.filteredProducts.sort((a, b) => {
            switch (this.currentSort) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    }

    // Render products to DOM
    renderProducts(containerId = 'popular-products') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.filteredProducts.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>Aucun produit trouvé</h3>
                    <p>Essayez de modifier vos critères de recherche.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredProducts
            .slice(0, 6) // Show only first 6 for homepage
            .map(product => this.createProductCard(product))
            .join('');
    }

    // Create product card HTML
    createProductCard(product) {
        const discount = product.oldPrice ?
            Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;

        return `
            <div class="product-card fade-in-up" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${discount ? `<span class="product-badge">-${discount}%</span>` : ''}
                    ${!product.inStock ? `<span class="product-badge out-of-stock">Rupture</span>` : ''}
                </div>
                <div class="product-body">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">
                        <span class="current">${product.price.toLocaleString('fr-FR')} €</span>
                        ${product.oldPrice ? `<span class="old">${product.oldPrice.toLocaleString('fr-FR')} €</span>` : ''}
                    </div>
                    <div class="product-rating">
                        ${this.createStarRating(product.rating)}
                        <span class="reviews">(${product.reviews})</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-cart" onclick="cartManager.addToCart(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            ${product.inStock ? 'Ajouter' : 'Indisponible'}
                        </button>
                        <button class="btn-view" onclick="showProductDetails(${product.id})">
                            <i class="fas fa-eye"></i>
                            Voir
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Create star rating HTML
    createStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return `
            <div class="stars">
                ${'★'.repeat(fullStars)}
                ${hasHalfStar ? '☆' : ''}
                ${'☆'.repeat(emptyStars)}
            </div>
        `;
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    // Get featured products
    getFeaturedProducts() {
        return this.products.filter(product => product.featured);
    }

    // Get products by category
    getProductsByCategory(category) {
        return this.products.filter(product => product.category === category);
    }

    // Search products
    searchProducts(query) {
        this.searchQuery = query.toLowerCase();
        this.filterProducts();
    }

    // Set category filter
    setCategory(category) {
        this.currentCategory = category;
        this.filterProducts();
    }

    // Set sort order
    setSort(sort) {
        this.currentSort = sort;
        this.sortProducts();
        this.renderProducts();
    }
}

// Initialize product manager
const productManager = new ProductManager();

// Global functions for HTML onclick handlers
function showProductDetails(productId) {
    const product = productManager.getProductById(productId);
    if (product) {
        // For now, just show an alert. In a real app, this would open a modal or navigate to product page
        alert(`Détails du produit: ${product.name}\nPrix: ${product.price} €\n${product.description}`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductManager;
}