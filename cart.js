// cart.js
export class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.shippingCost = 500;
    }

    addToCart(product, quantity = 1) {
        const existing = this.cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.cart.push({...product, quantity });
        }
        this.saveCart();
        this.updateCartCount();
        this.showToast('تمت الإضافة إلى السلة');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        this.showToast('تم حذف المنتج');
    }

    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartCount();
                this.renderCartItems();
            }
        }
    }

    getSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getTotalWithShipping() {
        return this.getSubtotal() + this.shippingCost;
    }

    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const elements = document.querySelectorAll('#cartCount');
        const count = this.getCartCount();
        elements.forEach(el => {
            if (el) el.textContent = count;
        });
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
    }

    renderCartItems(containerId = 'cartItems', totalId = 'cartTotal') {
        const container = document.getElementById(containerId);
        const totalEl = document.getElementById(totalId);
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = '<p class="empty-cart">سلتك فارغة</p>';
            totalEl.textContent = '0 DA';
            return;
        }

        let html = '';
        this.cart.forEach(item => {
            html += `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image" loading="lazy">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${item.price} DA</div>
            <div class="cart-item-actions">
              <button class="quantity-btn" data-id="${item.id}" data-change="-1"><i class="fas fa-minus"></i></button>
              <span>${item.quantity}</span>
              <button class="quantity-btn" data-id="${item.id}" data-change="1"><i class="fas fa-plus"></i></button>
              <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>
        </div>
      `;
        });

        container.innerHTML = html;
        totalEl.textContent = `${this.getTotalWithShipping()} DA`;

        container.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const change = parseInt(btn.dataset.change);
                const item = this.cart.find(i => i.id === id);
                if (item) {
                    this.updateQuantity(id, item.quantity + change);
                }
            });
        });

        container.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.removeFromCart(id);
            });
        });
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }
    }
}