// ============================================
// SHOPELITE - CART PAGE MANAGEMENT
// Advanced cart page functionality
// ============================================

class CartPageManager {
    constructor() {
        this.promoCode = '';
        this.discount = 0;
        this.shippingMethod = 'standard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRecommendedProducts();
        this.updateCartDisplay();
    }

    setupEventListeners() {
        // Shipping method change
        const shippingOptions = document.querySelectorAll('input[name="shipping"]');
        shippingOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                this.shippingMethod = e.target.value;
                this.updateCartSummary();
            });
        });

        // Quantity changes are handled by cartManager
        // But we need to update our display when cart changes
        if (typeof cartManager !== 'undefined') {
            // Override cartManager's updateUI to also update our page
            const originalUpdateUI = cartManager.updateUI;
            cartManager.updateUI = () => {
                originalUpdateUI.call(cartManager);
                this.updateCartDisplay();
            };
        }
    }

    updateCartDisplay() {
        if (typeof cartManager !== 'undefined') {
            cartManager.updateCartPage();
            this.updateItemsCount();
        }
    }

    updateItemsCount() {
        const countElement = document.getElementById('cart-items-count');
        if (countElement && typeof cartManager !== 'undefined') {
            const count = cartManager.getItemCount();
            countElement.textContent = `${count} article${count > 1 ? 's' : ''}`;
        }
    }

    loadRecommendedProducts() {
        // Load recommended products based on cart items
        if (typeof productManager !== 'undefined') {
            const recommendedContainer = document.getElementById('recommended-products');
            if (recommendedContainer) {
                // For now, show featured products. In a real app, this would be based on cart contents
                const recommendedProducts = productManager.getFeaturedProducts().slice(0, 4);
                recommendedContainer.innerHTML = recommendedProducts.map(product =>
                    this.createRecommendedProductCard(product)
                ).join('');
            }
        }
    }

    createRecommendedProductCard(product) {
        return `
            <div class="product-card fade-in-up" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="../${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-body">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">
                        <span class="current">${product.price.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-cart" onclick="cartManager.addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i>
                            Ajouter
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
}

function applyPromoCode() {
    const promoInput = document.getElementById('promo-code');
    const promoCode = promoInput?.value.trim().toUpperCase();

    if (!promoCode) {
        cartManager.showNotification('Veuillez entrer un code promo', 'warning');
        return;
    }

    // Simulate promo code validation
    const validCodes = {
        'WELCOME10': 10, // 10% discount
        'SAVE20': 20,    // 20% discount
        'FLASH50': 50    // 50% discount
    };

    if (validCodes[promoCode]) {
        cartPageManager.promoCode = promoCode;
        cartPageManager.discount = validCodes[promoCode];
        cartPageManager.updateCartSummary();
        cartManager.showNotification(`Code promo appliqué ! -${cartPageManager.discount}% de réduction`, 'success');
        promoInput.value = '';
    } else {
        cartManager.showNotification('Code promo invalide', 'error');
    }
}

// Initialize cart page manager
const cartPageManager = new CartPageManager();

// Enhanced cart summary with promo codes and shipping
const originalUpdateCartSummary = CartManager.prototype.updateCartSummary;
CartManager.prototype.updateCartSummary = function() {
    const summaryContainer = document.getElementById('cart-summary');
    if (!summaryContainer) return;

    if (this.items.length === 0) {
        summaryContainer.innerHTML = `
            <div class="empty-cart-summary">
                <p>Votre panier est vide</p>
                <a href="products.html" class="btn btn-primary">Voir les produits</a>
            </div>
        `;
        return;
    }

    const subtotal = this.getTotal();
    let shipping = 0;

    if (typeof cartPageManager !== 'undefined') {
        // Calculate shipping based on method
        if (cartPageManager.shippingMethod === 'express') {
            shipping = 9.90;
        } else if (subtotal < 50) {
            shipping = 5.90; // Standard shipping under 50€
        }
    }

    let discount = 0;
    if (typeof cartPageManager !== 'undefined' && cartPageManager.discount > 0) {
        discount = (subtotal * cartPageManager.discount) / 100;
    }

    const total = subtotal + shipping - discount;

    summaryContainer.innerHTML = `
        <h3>Résumé de la commande</h3>
        <div class="summary-row">
            <span>Sous-total (${this.items.length} article${this.items.length > 1 ? 's' : ''})</span>
            <span>${subtotal.toLocaleString('fr-FR')} €</span>
        </div>
        ${shipping > 0 ? `
        <div class="summary-row">
            <span>Livraison</span>
            <span>${shipping.toLocaleString('fr-FR')} €</span>
        </div>
        ` : `
        <div class="summary-row free-shipping">
            <span>Livraison</span>
            <span class="free">Gratuite</span>
        </div>
        `}
        ${discount > 0 ? `
        <div class="summary-row discount">
            <span>Réduction (${cartPageManager.promoCode})</span>
            <span>-${discount.toLocaleString('fr-FR')} €</span>
        </div>
        ` : ''}
        <div class="summary-row total">
            <span>Total</span>
            <span>${total.toLocaleString('fr-FR')} €</span>
        </div>
        <div class="checkout-section">
            <button class="btn btn-primary checkout-btn" onclick="cartManager.checkout()">
                <i class="fas fa-credit-card"></i>
                Procéder au paiement
            </button>
            <div class="checkout-info">
                <i class="fas fa-shield-alt"></i>
                <span>Paiement 100% sécurisé</span>
            </div>
        </div>
    `;
};

// Add additional CSS for cart page
const cartPageStyles = document.createElement('style');
cartPageStyles.textContent = `
    .cart-section {
        padding: var(--spacing-3xl) 0;
        background-color: var(--gray-50);
    }

    .cart-layout {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: var(--spacing-3xl);
        align-items: start;
    }

    .cart-items-section {
        background-color: var(--white);
        border-radius: var(--radius-xl);
        padding: var(--spacing-2xl);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--gray-200);
    }

    .cart-items-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xl);
        padding-bottom: var(--spacing-lg);
        border-bottom: 1px solid var(--gray-200);
    }

    .cart-items-header h2 {
        font-size: var(--font-size-2xl);
        font-weight: 700;
        color: var(--gray-900);
        margin: 0;
    }

    .items-count {
        color: var(--gray-600);
        font-weight: 500;
    }

    .cart-items {
        margin-bottom: var(--spacing-2xl);
    }

    .cart-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg) 0;
        border-bottom: 1px solid var(--gray-100);
    }

    .cart-item:last-child {
        border-bottom: none;
    }

    .cart-item-image {
        flex-shrink: 0;
    }

    .cart-item-image img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: var(--radius-md);
        border: 1px solid var(--gray-200);
    }

    .cart-item-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .cart-item-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--gray-900);
        margin: 0;
    }

    .cart-item-price {
        font-size: var(--font-size-base);
        color: var(--primary);
        font-weight: 600;
    }

    .cart-item-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .quantity-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        background-color: var(--gray-100);
        border-radius: var(--radius-md);
        padding: var(--spacing-xs);
    }

    .quantity-btn {
        width: 30px;
        height: 30px;
        border: none;
        background-color: var(--white);
        border-radius: var(--radius-sm);
        color: var(--gray-600);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-fast);
    }

    .quantity-btn:hover {
        background-color: var(--primary);
        color: var(--white);
    }

    .quantity-input {
        width: 50px;
        text-align: center;
        border: none;
        background: transparent;
        font-weight: 600;
        color: var(--gray-900);
    }

    .cart-item-total {
        font-size: var(--font-size-lg);
        font-weight: 700;
        color: var(--gray-900);
        min-width: 80px;
        text-align: right;
    }

    .cart-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: var(--spacing-lg);
        border-top: 1px solid var(--gray-200);
    }

    .btn-outline-danger {
        background-color: var(--white);
        color: var(--danger);
        border: 1px solid var(--danger);
    }

    .btn-outline-danger:hover {
        background-color: var(--danger);
        color: var(--white);
    }

    .cart-summary-section {
        position: sticky;
        top: 100px;
    }

    .cart-summary {
        background-color: var(--white);
        border-radius: var(--radius-xl);
        padding: var(--spacing-2xl);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--gray-200);
        margin-bottom: var(--spacing-xl);
    }

    .cart-summary h3 {
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--gray-900);
        margin-bottom: var(--spacing-lg);
    }

    .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-md);
        color: var(--gray-700);
    }

    .summary-row.total {
        border-top: 2px solid var(--gray-200);
        padding-top: var(--spacing-md);
        margin-top: var(--spacing-md);
        font-size: var(--font-size-lg);
        font-weight: 700;
        color: var(--gray-900);
    }

    .summary-row.free-shipping .free {
        color: var(--success);
        font-weight: 600;
    }

    .summary-row.discount {
        color: var(--success);
    }

    .checkout-section {
        margin-top: var(--spacing-xl);
    }

    .checkout-btn {
        width: 100%;
        padding: var(--spacing-lg);
        font-size: var(--font-size-lg);
        font-weight: 600;
        margin-bottom: var(--spacing-md);
    }

    .checkout-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        color: var(--gray-600);
        font-size: var(--font-size-sm);
    }

    .shipping-info {
        background-color: var(--white);
        border-radius: var(--radius-xl);
        padding: var(--spacing-2xl);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--gray-200);
        margin-bottom: var(--spacing-xl);
    }

    .shipping-info h3 {
        font-size: var(--font-size-lg);
        font-weight: 700;
        color: var(--gray-900);
        margin-bottom: var(--spacing-lg);
    }

    .shipping-options {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }

    .shipping-option {
        position: relative;
    }

    .shipping-option input[type="radio"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
    }

    .shipping-option label {
        display: flex;
        align-items: center;
        padding: var(--spacing-md);
        border: 2px solid var(--gray-200);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: var(--transition-fast);
    }

    .shipping-option input[type="radio"]:checked + label {
        border-color: var(--primary);
        background-color: var(--primary-light);
    }

    .shipping-details {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .shipping-name {
        font-weight: 600;
        color: var(--gray-900);
    }

    .shipping-time {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
    }

    .shipping-price {
        font-weight: 600;
        color: var(--primary);
    }

    .promo-code {
        background-color: var(--white);
        border-radius: var(--radius-xl);
        padding: var(--spacing-2xl);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--gray-200);
    }

    .promo-code h3 {
        font-size: var(--font-size-lg);
        font-weight: 700;
        color: var(--gray-900);
        margin-bottom: var(--spacing-lg);
    }

    .promo-input {
        display: flex;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
    }

    .promo-input input {
        flex: 1;
        padding: var(--spacing-md);
        border: 1px solid var(--gray-300);
        border-radius: var(--radius-md);
        font-size: var(--font-size-base);
    }

    .promo-help {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
    }

    .recently-viewed {
        padding: var(--spacing-3xl) 0;
        background-color: var(--white);
    }

    .empty-cart-summary {
        text-align: center;
        padding: var(--spacing-2xl);
    }

    .empty-cart-summary p {
        color: var(--gray-600);
        margin-bottom: var(--spacing-lg);
    }

    @media (max-width: 1024px) {
        .cart-layout {
            grid-template-columns: 1fr;
        }

        .cart-summary-section {
            position: static;
        }
    }

    @media (max-width: 768px) {
        .cart-items-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-sm);
        }

        .cart-item {
            flex-direction: column;
            text-align: center;
            gap: var(--spacing-md);
        }

        .cart-item-controls {
            justify-content: center;
        }

        .cart-item-total {
            text-align: center;
        }

        .cart-actions {
            flex-direction: column;
            gap: var(--spacing-md);
        }

        .shipping-option label {
            flex-direction: column;
            text-align: center;
        }

        .promo-input {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(cartPageStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartPageManager;
}