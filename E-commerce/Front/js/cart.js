// ============================================
// SHOPELITE - CART MANAGEMENT
// Modern shopping cart with localStorage persistence
// ============================================

class CartManager {
    constructor() {
        this.items = [];
        this.loadCart();
        this.updateUI();
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const savedCart = localStorage.getItem('shopElite_cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
        }
    }

    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem('shopElite_cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // Add item to cart
    addToCart(productId, quantity = 1) {
        const product = productManager.getProductById(productId);
        if (!product) {
            this.showNotification('Produit introuvable', 'error');
            return;
        }

        if (!product.inStock) {
            this.showNotification('Produit en rupture de stock', 'error');
            return;
        }

        const existingItem = this.items.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
            this.showNotification(`${product.name} ajouté au panier (quantité: ${existingItem.quantity})`, 'success');
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                maxStock: 10 // Assuming max stock for demo
            });
            this.showNotification(`${product.name} ajouté au panier`, 'success');
        }

        this.saveCart();
        this.updateUI();
    }

    // Remove item from cart
    removeFromCart(productId) {
        const index = this.items.findIndex(item => item.id === productId);
        if (index > -1) {
            const removedItem = this.items.splice(index, 1)[0];
            this.showNotification(`${removedItem.name} retiré du panier`, 'info');
            this.saveCart();
            this.updateUI();
        }
    }

    // Update item quantity
    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
                return;
            }

            if (newQuantity > item.maxStock) {
                this.showNotification(`Stock limité à ${item.maxStock} unités`, 'warning');
                newQuantity = item.maxStock;
            }

            item.quantity = newQuantity;
            this.saveCart();
            this.updateUI();
        }
    }

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get item count
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateUI();
        this.showNotification('Panier vidé', 'info');
    }

    // Update UI elements
    updateUI() {
        this.updateCartCount();
        this.updateCartPage();
    }

    // Update cart count in header
    updateCartCount() {
        const cartCounts = document.querySelectorAll('#cart-count, #cart-count-mobile');
        const count = this.getItemCount();

        cartCounts.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Update cart page if it exists
    updateCartPage() {
        const cartContainer = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');

        if (!cartContainer) return;

        if (this.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Votre panier est vide</h3>
                    <p>Découvrez nos produits et commencez vos achats !</p>
                    <a href="index.html" class="btn btn-primary">Continuer mes achats</a>
                </div>
            `;

            if (cartSummary) {
                cartSummary.style.display = 'none';
            }
            return;
        }

        if (cartSummary) {
            cartSummary.style.display = 'block';
        }

        cartContainer.innerHTML = this.items.map(item => this.createCartItemHTML(item)).join('');

        if (cartSummary) {
            this.updateCartSummary();
        }
    }

    // Create cart item HTML
    createCartItemHTML(item) {
        const subtotal = item.price * item.quantity;

        return `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">${item.price.toLocaleString('fr-FR')} €</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" value="${item.quantity}"
                                   min="1" max="${item.maxStock}"
                                   onchange="cartManager.updateQuantity(${item.id}, parseInt(this.value))">
                            <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="remove-btn" onclick="cartManager.removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <div class="item-subtotal">${subtotal.toLocaleString('fr-FR')} €</div>
                </div>
            </div>
        `;
    }

    // Update cart summary
    updateCartSummary() {
        const summaryContainer = document.getElementById('cart-summary');
        if (!summaryContainer) return;

        const subtotal = this.getTotal();
        const shipping = subtotal > 50 ? 0 : 5.90; // Free shipping over 50€
        const total = subtotal + shipping;

        summaryContainer.innerHTML = `
            <h3>Résumé de la commande</h3>
            <div class="summary-row">
                <span>Sous-total</span>
                <span>${subtotal.toLocaleString('fr-FR')} €</span>
            </div>
            <div class="summary-row">
                <span>Livraison ${subtotal > 50 ? '(gratuite)' : ''}</span>
                <span>${shipping === 0 ? 'Gratuite' : shipping.toLocaleString('fr-FR') + ' €'}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>${total.toLocaleString('fr-FR')} €</span>
            </div>
            <button class="btn btn-primary checkout-btn" onclick="cartManager.checkout()">
                <i class="fas fa-credit-card"></i>
                Procéder au paiement
            </button>
            <div class="cart-actions">
                <button class="btn btn-secondary" onclick="cartManager.clearCart()">
                    <i class="fas fa-trash"></i>
                    Vider le panier
                </button>
            </div>
        `;
    }

    // Checkout process
    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Votre panier est vide', 'warning');
            return;
        }

        // In a real app, this would redirect to checkout page or open payment modal
        this.showNotification('Redirection vers le paiement...', 'info');

        // Simulate checkout process
        setTimeout(() => {
            alert(`Commande confirmée !\nTotal: ${this.getTotal().toLocaleString('fr-FR')} €\n\nMerci pour votre achat !`);
            this.clearCart();
        }, 1000);
    }

    // Show cart modal/sidebar (for mobile/desktop)
    showCart() {
        // Create modal if it doesn't exist
        let cartModal = document.getElementById('cart-modal');
        if (!cartModal) {
            cartModal = document.createElement('div');
            cartModal.id = 'cart-modal';
            cartModal.className = 'cart-modal';
            cartModal.innerHTML = `
                <div class="cart-modal-overlay" onclick="cartManager.hideCart()"></div>
                <div class="cart-modal-content">
                    <div class="cart-modal-header">
                        <h3>Votre Panier</h3>
                        <button class="close-btn" onclick="cartManager.hideCart()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="cart-modal-items" class="cart-modal-items">
                        <!-- Cart items will be loaded here -->
                    </div>
                    <div class="cart-modal-footer">
                        <div id="cart-modal-summary" class="cart-modal-summary">
                            <!-- Summary will be loaded here -->
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(cartModal);
        }

        // Update modal content
        this.updateCartModal();
        cartModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Hide cart modal
    hideCart() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Update cart modal content
    updateCartModal() {
        const itemsContainer = document.getElementById('cart-modal-items');
        const summaryContainer = document.getElementById('cart-modal-summary');

        if (!itemsContainer || !summaryContainer) return;

        if (this.items.length === 0) {
            itemsContainer.innerHTML = `
                <div class="empty-cart-modal">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Votre panier est vide</p>
                </div>
            `;
            summaryContainer.innerHTML = '';
            return;
        }

        itemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-modal-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-modal-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-modal-item-price">${item.price.toLocaleString('fr-FR')} €</div>
                    <div class="cart-modal-item-quantity">Qté: ${item.quantity}</div>
                </div>
                <button class="remove-btn" onclick="cartManager.removeFromCart(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        const total = this.getTotal();
        summaryContainer.innerHTML = `
            <div class="cart-modal-total">
                <span>Total: ${total.toLocaleString('fr-FR')} €</span>
            </div>
            <button class="btn btn-primary" onclick="cartManager.checkout()">
                Commander
            </button>
        `;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Get notification icon based on type
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Add notification styles to head
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 16px 20px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border-left: 4px solid var(--primary);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    }

    .notification-success { border-left-color: var(--success); }
    .notification-error { border-left-color: var(--danger); }
    .notification-warning { border-left-color: var(--warning); }
    .notification-info { border-left-color: var(--primary); }

    .notification-close {
        background: none;
        border: none;
        color: var(--gray-500);
        cursor: pointer;
        padding: 4px;
        margin-left: auto;
    }

    .cart-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: none;
        z-index: 10000;
    }

    .cart-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
    }

    .cart-modal-content {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 100%;
        max-width: 400px;
        background: white;
        display: flex;
        flex-direction: column;
        animation: slideInRight 0.3s ease-out;
    }

    @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }

    .cart-modal-header {
        padding: 20px;
        border-bottom: 1px solid var(--gray-200);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .cart-modal-items {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
    }

    .cart-modal-item {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid var(--gray-100);
    }

    .cart-modal-item img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
    }

    .cart-modal-footer {
        padding: 20px;
        border-top: 1px solid var(--gray-200);
    }

    @media (max-width: 480px) {
        .cart-modal-content {
            max-width: 100%;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}