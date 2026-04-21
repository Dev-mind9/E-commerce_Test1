// ============================================
// SHOPELITE - PRODUCTS PAGE MANAGEMENT
// Advanced filtering, sorting, and pagination
// ============================================

class ProductsPageManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentView = 'grid'; // 'grid' or 'list'
        this.filters = {
            category: 'all',
            priceRange: 'all',
            availability: 'all'
        };
        this.sortBy = 'name';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProducts();
        this.updateResultsCount();
    }

    setupEventListeners() {
        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
            });
        }

        // Price filter
        const priceFilter = document.getElementById('price-filter');
        if (priceFilter) {
            priceFilter.addEventListener('change', (e) => {
                this.filters.priceRange = e.target.value;
                this.applyFilters();
            });
        }

        // Availability filter
        const availabilityFilter = document.getElementById('availability-filter');
        if (availabilityFilter) {
            availabilityFilter.addEventListener('change', (e) => {
                this.filters.availability = e.target.value;
                this.applyFilters();
            });
        }

        // Sort select
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applySorting();
            });
        }

        // View controls
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.changeView(view);
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProducts();
            });
        }

        // Search functionality (inherited from productManager)
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (typeof productManager !== 'undefined') {
                    productManager.searchQuery = e.target.value.toLowerCase();
                    this.applyFilters();
                }
            });
        }
    }

    loadProducts() {
        if (typeof productManager !== 'undefined') {
            this.renderProducts();
        }
    }

    applyFilters() {
        if (typeof productManager === 'undefined') return;

        let filteredProducts = [...productManager.products];

        // Apply category filter
        if (this.filters.category !== 'all') {
            filteredProducts = filteredProducts.filter(product =>
                product.category === this.filters.category
            );
        }

        // Apply price filter
        if (this.filters.priceRange !== 'all') {
            filteredProducts = filteredProducts.filter(product => {
                const price = product.price;
                switch (this.filters.priceRange) {
                    case '0-50': return price >= 0 && price <= 50;
                    case '50-100': return price > 50 && price <= 100;
                    case '100-200': return price > 100 && price <= 200;
                    case '200+': return price > 200;
                    default: return true;
                }
            });
        }

        // Apply availability filter
        if (this.filters.availability !== 'all') {
            filteredProducts = filteredProducts.filter(product => {
                if (this.filters.availability === 'in-stock') {
                    return product.inStock;
                } else if (this.filters.availability === 'out-of-stock') {
                    return !product.inStock;
                }
                return true;
            });
        }

        // Apply search filter
        if (productManager.searchQuery) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(productManager.searchQuery) ||
                product.description.toLowerCase().includes(productManager.searchQuery) ||
                product.tags.some(tag => tag.toLowerCase().includes(productManager.searchQuery))
            );
        }

        // Apply sorting
        this.applySortingToProducts(filteredProducts);

        // Update filtered products
        productManager.filteredProducts = filteredProducts;

        // Reset pagination
        this.currentPage = 1;

        // Render products
        this.renderProducts();

        // Update UI
        this.updateResultsCount();
        this.updateActiveFilters();
        this.updateLoadMoreButton();
    }

    applySorting() {
        this.applySortingToProducts(productManager.filteredProducts);
        this.renderProducts();
    }

    applySortingToProducts(products) {
        products.sort((a, b) => {
            switch (this.sortBy) {
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

    renderProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const productsToShow = productManager.filteredProducts.slice(startIndex, endIndex);

        if (productsToShow.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>Aucun produit trouvé</h3>
                    <p>Essayez de modifier vos critères de recherche ou filtres.</p>
                    <button class="btn btn-primary" onclick="productsPageManager.clearFilters()">
                        Effacer les filtres
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = productsToShow.map(product =>
            this.createProductCard(product)
        ).join('');

        // Add view class
        container.className = `products-grid ${this.currentView}-view`;
    }

    createProductCard(product) {
        const discount = product.oldPrice ?
            Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;

        const cardClass = this.currentView === 'list' ? 'product-card-list' : 'product-card';

        return `
            <div class="${cardClass} fade-in-up" data-product-id="${product.id}">
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
                    <div class="product-meta">
                        <span class="category">${this.getCategoryName(product.category)}</span>
                        ${product.inStock ? '<span class="stock-status in-stock">En stock</span>' : '<span class="stock-status out-of-stock">Rupture</span>'}
                    </div>
                    <div class="product-actions">
                        <button class="btn-cart" onclick="cartManager.addToCart(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            ${product.inStock ? 'Ajouter' : 'Indisponible'}
                        </button>
                        <button class="btn-view" onclick="showProductDetails(${product.id})">
                            <i class="fas fa-eye"></i>
                            Voir détails
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

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

    getCategoryName(category) {
        const categories = {
            smartphones: 'Smartphones',
            computers: 'Ordinateurs',
            audio: 'Audio',
            watches: 'Montres',
            clothing: 'Vêtements',
            shoes: 'Chaussures'
        };
        return categories[category] || category;
    }

    changeView(view) {
        this.currentView = view;
        this.renderProducts();
    }

    loadMoreProducts() {
        this.currentPage++;
        this.renderProducts();
        this.updateLoadMoreButton();
    }

    updateResultsCount() {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            countElement.textContent = productManager.filteredProducts.length;
        }
    }

    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('active-filters');
        if (!activeFiltersContainer) return;

        const activeFilters = [];

        if (this.filters.category !== 'all') {
            activeFilters.push({
                type: 'category',
                label: `Catégorie: ${this.getCategoryName(this.filters.category)}`,
                value: this.filters.category
            });
        }

        if (this.filters.priceRange !== 'all') {
            activeFilters.push({
                type: 'priceRange',
                label: `Prix: ${this.filters.priceRange.replace('-', ' - ').replace('+', '+ €')}`,
                value: this.filters.priceRange
            });
        }

        if (this.filters.availability !== 'all') {
            const availabilityLabel = this.filters.availability === 'in-stock' ? 'En stock' : 'Rupture de stock';
            activeFilters.push({
                type: 'availability',
                label: `Disponibilité: ${availabilityLabel}`,
                value: this.filters.availability
            });
        }

        if (productManager.searchQuery) {
            activeFilters.push({
                type: 'search',
                label: `Recherche: "${productManager.searchQuery}"`,
                value: productManager.searchQuery
            });
        }

        if (activeFilters.length === 0) {
            activeFiltersContainer.innerHTML = '';
            return;
        }

        activeFiltersContainer.innerHTML = `
            <div class="active-filters-list">
                ${activeFilters.map(filter => `
                    <span class="filter-tag" data-type="${filter.type}" data-value="${filter.value}">
                        ${filter.label}
                        <button onclick="productsPageManager.removeFilter('${filter.type}', '${filter.value}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </span>
                `).join('')}
                <button class="clear-filters-btn" onclick="productsPageManager.clearFilters()">
                    Effacer tout
                </button>
            </div>
        `;
    }

    removeFilter(type, value) {
        if (type === 'category') {
            this.filters.category = 'all';
            document.getElementById('category-filter').value = 'all';
        } else if (type === 'priceRange') {
            this.filters.priceRange = 'all';
            document.getElementById('price-filter').value = 'all';
        } else if (type === 'availability') {
            this.filters.availability = 'all';
            document.getElementById('availability-filter').value = 'all';
        } else if (type === 'search') {
            productManager.searchQuery = '';
            document.getElementById('search-input').value = '';
        }

        this.applyFilters();
    }

    clearFilters() {
        this.filters = {
            category: 'all',
            priceRange: 'all',
            availability: 'all'
        };
        productManager.searchQuery = '';

        // Reset form elements
        document.getElementById('category-filter').value = 'all';
        document.getElementById('price-filter').value = 'all';
        document.getElementById('availability-filter').value = 'all';
        document.getElementById('search-input').value = '';

        this.applyFilters();
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (!loadMoreBtn) return;

        const totalProducts = productManager.filteredProducts.length;
        const shownProducts = this.currentPage * this.itemsPerPage;

        if (shownProducts >= totalProducts) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
            loadMoreBtn.innerHTML = `
                <i class="fas fa-plus"></i>
                Charger plus (${Math.min(this.itemsPerPage, totalProducts - shownProducts)} restants)
            `;
        }
    }
}

// Initialize products page manager
const productsPageManager = new ProductsPageManager();

// Add additional CSS for products page
const productsPageStyles = document.createElement('style');
productsPageStyles.textContent = `
    .page-header {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        color: var(--white);
        padding: var(--spacing-3xl) 0;
        text-align: center;
    }

    .page-title {
        font-size: var(--font-size-4xl);
        font-weight: 800;
        margin-bottom: var(--spacing-md);
    }

    .page-subtitle {
        font-size: var(--font-size-lg);
        opacity: 0.9;
        max-width: 600px;
        margin: 0 auto;
    }

    .products-controls {
        background-color: var(--gray-50);
        padding: var(--spacing-xl) 0;
        border-bottom: 1px solid var(--gray-200);
    }

    .controls-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing-lg);
    }

    .filters {
        display: flex;
        gap: var(--spacing-lg);
        flex-wrap: wrap;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .filter-group label {
        font-weight: 600;
        color: var(--gray-700);
        font-size: var(--font-size-sm);
    }

    .filter-group select {
        padding: var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--gray-300);
        border-radius: var(--radius-md);
        background-color: var(--white);
        font-size: var(--font-size-sm);
        min-width: 150px;
    }

    .sort-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
    }

    .sort-group {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .sort-group label {
        font-weight: 600;
        color: var(--gray-700);
        font-size: var(--font-size-sm);
    }

    .sort-group select {
        padding: var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--gray-300);
        border-radius: var(--radius-md);
        background-color: var(--white);
        font-size: var(--font-size-sm);
    }

    .view-controls {
        display: flex;
        gap: var(--spacing-xs);
    }

    .view-btn {
        padding: var(--spacing-sm);
        border: 1px solid var(--gray-300);
        background-color: var(--white);
        border-radius: var(--radius-md);
        color: var(--gray-600);
        transition: var(--transition-fast);
    }

    .view-btn:hover,
    .view-btn.active {
        background-color: var(--primary);
        color: var(--white);
        border-color: var(--primary);
    }

    .products-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xl);
        flex-wrap: wrap;
        gap: var(--spacing-md);
    }

    .results-info {
        font-weight: 600;
        color: var(--gray-700);
    }

    .active-filters-list {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
        align-items: center;
    }

    .filter-tag {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        background-color: var(--primary-light);
        color: var(--primary);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-sm);
        font-weight: 500;
    }

    .filter-tag button {
        background: none;
        border: none;
        color: var(--primary);
        cursor: pointer;
        padding: 0;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: var(--transition-fast);
    }

    .filter-tag button:hover {
        background-color: var(--primary);
        color: var(--white);
    }

    .clear-filters-btn {
        background: none;
        border: 1px solid var(--gray-300);
        color: var(--gray-600);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        cursor: pointer;
        transition: var(--transition-fast);
    }

    .clear-filters-btn:hover {
        background-color: var(--danger);
        border-color: var(--danger);
        color: var(--white);
    }

    .products-grid.grid-view {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }

    .products-grid.list-view {
        grid-template-columns: 1fr;
    }

    .product-card-list {
        display: flex;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg);
        background-color: var(--white);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--gray-200);
        transition: var(--transition-normal);
    }

    .product-card-list:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }

    .product-card-list .product-image {
        flex-shrink: 0;
        width: 200px;
        height: 200px;
    }

    .product-card-list .product-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .product-meta {
        display: flex;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
        flex-wrap: wrap;
    }

    .category {
        background-color: var(--gray-100);
        color: var(--gray-700);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: 500;
    }

    .stock-status {
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: 500;
    }

    .stock-status.in-stock {
        background-color: var(--success);
        color: var(--white);
    }

    .stock-status.out-of-stock {
        background-color: var(--gray-400);
        color: var(--white);
    }

    .load-more {
        text-align: center;
        margin-top: var(--spacing-3xl);
    }

    @media (max-width: 768px) {
        .controls-content {
            flex-direction: column;
            align-items: stretch;
        }

        .filters {
            justify-content: center;
        }

        .sort-controls {
            justify-content: center;
        }

        .products-header {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
        }

        .active-filters-list {
            justify-content: center;
        }

        .product-card-list {
            flex-direction: column;
            text-align: center;
        }

        .product-card-list .product-image {
            width: 100%;
            height: 250px;
        }
    }
`;
document.head.appendChild(productsPageStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsPageManager;
}