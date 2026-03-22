// checkout.js
import { CartManager } from './cart.js';

const cartManager = new CartManager();

// التحقق من وجود منتجات في السلة
if (cartManager.getCartCount() === 0) {
    window.location.href = 'index.html';
}

// عنوان الـ API (معدل لاستخدام الرابط السحابي على Render)
const API_BASE_URL = 'https://verde-skin-backend.onrender.com/api';

// عناصر DOM
const orderItemsDiv = document.getElementById('orderItems');
const orderSubtotalSpan = document.getElementById('orderSubtotal');
const orderShippingSpan = document.getElementById('orderShipping');
const orderTotalSpan = document.getElementById('orderTotal');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const wilayaSelect = document.getElementById('wilaya');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const address = document.getElementById('address');
const phone = document.getElementById('phone');
const paymentMethods = document.querySelectorAll('input[name="payment"]');

// عناصر المودال
const orderModal = document.getElementById('orderModal');
const modalBody = document.getElementById('modalBody');

// تكلفة التوصيل حسب الولاية (يمكن توسيعها)
const shippingCosts = {
    '16': 300,
    '31': 500,
    '25': 500,
    '23': 500,
    '30': 800,
};

function calculateShipping(wilaya) {
    if (!wilaya) return 500;
    return shippingCosts[wilaya] || 500;
}

function renderOrderSummary() {
    const cart = cartManager.cart;
    let itemsHtml = '';
    cart.forEach(item => {
        itemsHtml += `
      <div class="order-item">
        <span class="order-item-name">${item.name} x${item.quantity}</span>
        <span class="order-item-price">${item.price * item.quantity} DA</span>
      </div>
    `;
    });
    orderItemsDiv.innerHTML = itemsHtml;

    const subtotal = cartManager.getSubtotal();
    const shipping = calculateShipping(wilayaSelect.value);
    const total = subtotal + shipping;

    orderSubtotalSpan.textContent = `${subtotal} DA`;
    orderShippingSpan.textContent = `${shipping} DA`;
    orderTotalSpan.textContent = `${total} DA`;

    cartManager.shippingCost = shipping;
}

wilayaSelect.addEventListener('change', renderOrderSummary);

// إرسال الطلب إلى الخادم
async function saveOrderToServer(orderData) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        const data = await response.json();
        if (response.ok) {
            console.log('✅ Order saved:', data);
            return { success: true, data };
        } else {
            console.error('❌ Error saving order:', data.message);
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('❌ Network error:', error);
        return { success: false, error: error.message };
    }
}

function showOrderModal() {
    const payment = document.querySelector('input[name="payment"]:checked').value;
    const paymentMethod = payment === 'cod' ? 'الدفع عند الاستلام' : 'بطاقة ائتمان';

    // تجهيز بيانات الطلب
    const orderData = {
        firstName: firstName.value,
        lastName: lastName.value,
        address: address.value,
        wilaya: wilayaSelect.options[wilayaSelect.selectedIndex].text,
        phone: phone.value,
        paymentMethod: payment,
        items: cartManager.cart.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        })),
        subtotal: cartManager.getSubtotal(),
        shippingCost: cartManager.shippingCost,
        total: cartManager.getTotalWithShipping(),
    };

    // حفظ الطلب في الخادم أولاً
    saveOrderToServer(orderData).then(result => {
        if (result.success) {
            // بناء HTML للمودال
            const html = `
        <div class="modal-logo">VERDESKIN</div>
        <div class="modal-checkmark">✔️</div>
        <div class="modal-title">تم تأكيد طلبك</div>
        <div class="modal-details">
          <div class="detail-item"><span class="detail-label">الاسم :</span> <span class="detail-value">${firstName.value} ${lastName.value}</span></div>
          <div class="detail-item"><span class="detail-label">رقم الهاتف :</span> <span class="detail-value">${phone.value}</span></div>
          <div class="detail-item"><span class="detail-label">العنوان الكامل :</span> <span class="detail-value">${address.value}</span></div>
          <div class="detail-item"><span class="detail-label">طريقة الدفع :</span> <span class="detail-value">${paymentMethod}</span></div>
        </div>
        <div class="modal-total">${orderTotalSpan.textContent}</div>
        <div class="modal-message">سوف نتواصل معك لتأكيد الطلب</div>
        <div class="modal-footer-buttons">
          <button class="modal-btn modal-btn-cancel" id="modalCancel">إلغاء</button>
          <button class="modal-btn modal-btn-ok" id="modalOk">موافق</button>
        </div>
      `;

            modalBody.innerHTML = html;
            orderModal.classList.add('show');

            document.getElementById('modalCancel').addEventListener('click', () => {
                orderModal.classList.remove('show');
            });

            document.getElementById('modalOk').addEventListener('click', () => {
                cartManager.clearCart();
                window.location.href = 'index.html';
            });
        } else {
            alert(`حدث خطأ أثناء حفظ الطلب: ${result.error}. يرجى المحاولة مرة أخرى.`);
        }
    });
}

placeOrderBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (!firstName.value || !lastName.value || !address.value || !wilayaSelect.value || !phone.value) {
        alert('يرجى ملء جميع الحقول');
        return;
    }

    showOrderModal();
});

// إغلاق المودال عند النقر خارج المحتوى
window.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        orderModal.classList.remove('show');
    }
});

// وظائف السلة الجانبية
const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const checkoutBtn = document.getElementById('checkoutBtn');

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

// تهيئة الصفحة
renderOrderSummary();
cartManager.updateCartCount();