// productPage.js
import { products } from './products.js';
import { CartManager } from './cart.js';

const cartManager = new CartManager();

const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));
const product = products.find(p => p.id === productId);

if (!product) {
    window.location.href = 'index.html';
}

const mainImage = document.getElementById('mainImage');
const thumbnailGrid = document.getElementById('thumbnailGrid');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productDesc = document.getElementById('productDesc');
const productIngredients = document.getElementById('productIngredients');
const productRating = document.getElementById('productRating');
const addToCartBtn = document.getElementById('addToCartBtn');

mainImage.src = product.image;
mainImage.alt = product.name;
productName.textContent = product.name;
productPrice.textContent = product.price;
productDesc.textContent = product.description;
productIngredients.innerHTML = `<h3>المكونات</h3><p>${product.ingredients}</p>`;

const fullStars = Math.floor(product.rating);
const halfStar = product.rating % 1 >= 0.5;
let starsHtml = '';
for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
        starsHtml += '<i class="fas fa-star"></i>';
    } else if (halfStar && i === fullStars) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    } else {
        starsHtml += '<i class="far fa-star"></i>';
    }
}
starsHtml += ` <span>(${product.rating}) · ${product.reviews} تقييم</span>`;
productRating.innerHTML = starsHtml;

if (product.gallery && product.gallery.length) {
    product.gallery.forEach((src, index) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.alt = 'منتج';
        thumb.classList.add('thumbnail');
        if (index === 0) thumb.classList.add('active');
        thumb.addEventListener('click', () => {
            mainImage.src = src;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
        thumbnailGrid.appendChild(thumb);
    });
}

addToCartBtn.addEventListener('click', () => {
    cartManager.addToCart(product);
    cartManager.showToast('تمت الإضافة إلى السلة');
});

const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const checkoutBtn = document.getElementById('checkoutBtn');

cartToggle.addEventListener('click', () => {
    cartSidebar.classList.add('open');
    overlay.classList.add('active');
    cartManager.renderCartItems();
});

closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    overlay.classList.remove('active');
});

overlay.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    overlay.classList.remove('active');
});

checkoutBtn.addEventListener('click', () => {
    if (cartManager.getCartCount() === 0) {
        alert('سلتك فارغة');
        return;
    }
    window.location.href = 'checkout.html';
});

cartManager.updateCartCount();

gsap.fromTo('.product-detail-page', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });