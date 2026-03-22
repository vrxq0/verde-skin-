// main.js
import { products } from './products.js';
import { CartManager } from './cart.js';

const cartManager = new CartManager();

const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const checkoutBtn = document.getElementById('checkoutBtn');
const header = document.querySelector('.luxury-header');

function renderProducts(filteredProducts = products) {
    if (!productsGrid) return;

    productsGrid.innerHTML = '';
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <div class="product-price">${product.price} DA</div>
        <button class="add-to-cart-btn" data-id="${product.id}">
          <i class="fas fa-shopping-bag"></i>
          أضف للسلة
        </button>
      </div>
    `;
        productsGrid.appendChild(card);
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(btn.dataset.id);
            const product = products.find(p => p.id === productId);
            if (product) {
                cartManager.addToCart(product);
                cartManager.renderCartItems();
            }
        });
    });

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart-btn') && !e.target.closest('.add-to-cart-btn')) {
                const productId = card.dataset.id;
                window.location.href = `product.html?id=${productId}`;
            }
        });
    });

    gsap.fromTo('.product-card', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
}

let searchTimeout;
if (searchInput) {
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = searchInput.value.trim().toLowerCase();
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(query)
            );
            renderProducts(filtered);
        }, 300);
    });
}

if (cartToggle) {
    cartToggle.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        overlay.classList.add('active');
        cartManager.renderCartItems();
    });
}

if (closeCart) {
    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
}

if (overlay) {
    overlay.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
}

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cartManager.getCartCount() === 0) {
            alert('سلتك فارغة');
            return;
        }
        window.location.href = 'checkout.html';
    });
}

const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('شكراً لاشتراكك! ستتوصلين بأحدث العروض.');
        newsletterForm.reset();
    });
}

gsap.registerPlugin(ScrollTrigger);

gsap.fromTo('.hero-content', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' });

gsap.fromTo('.story-grid', { opacity: 0 }, {
    opacity: 1,
    duration: 1,
    scrollTrigger: {
        trigger: '.story-section',
        start: 'top 80%',
    }
});

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        let current = 0;
        const increment = target / 50;
        const update = () => {
            if (current < target) {
                current += increment;
                stat.textContent = Math.ceil(current);
                requestAnimationFrame(update);
            } else {
                stat.textContent = target;
            }
        };
        update();
    });
}

ScrollTrigger.create({
    trigger: '.story-stats',
    start: 'top 80%',
    onEnter: animateStats
});

gsap.fromTo('.newsletter-card', { scale: 0.9, opacity: 0 }, {
    scale: 1,
    opacity: 1,
    duration: 1,
    scrollTrigger: {
        trigger: '.newsletter-section',
        start: 'top 80%',
    }
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(250, 246, 240, 0.9)';
        header.style.boxShadow = 'var(--shadow-md)';
    } else {
        header.style.background = 'rgba(250, 246, 240, 0.7)';
        header.style.boxShadow = 'none';
    }
});

renderProducts();
cartManager.updateCartCount();