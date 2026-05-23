// Set current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// ========== PAGE NAVIGATION ==========
const navLinks = document.querySelectorAll('nav a[data-page]');
const pages = document.querySelectorAll('.page');

function navigateTo(pageName) {
    // Update nav active state
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    // Show/hide pages
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === 'page-' + pageName) {
            page.classList.add('active');
        }
    });
    // Scroll to top of main content
    document.querySelector('main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const pageName = this.getAttribute('data-page');
        navigateTo(pageName);
    });
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

function handleMenuDisplay() {
    if (window.innerWidth <= 768) {
        mainNav.style.display = 'none';
        mainNav.style.flexDirection = 'column';
        mainNav.style.width = '100%';
        mainNav.style.paddingTop = '6px';
    } else {
        mainNav.style.display = 'flex';
        mainNav.style.flexDirection = 'row';
        mainNav.style.width = '';
        mainNav.style.paddingTop = '';
    }
}

menuToggle.addEventListener('click', () => {
    if (mainNav.style.display === 'none' || mainNav.style.display === '') {
        mainNav.style.display = 'flex';
        mainNav.style.flexDirection = 'column';
        mainNav.style.width = '100%';
        mainNav.style.paddingTop = '6px';
    } else {
        mainNav.style.display = 'none';
    }
});

window.addEventListener('resize', handleMenuDisplay);
handleMenuDisplay(); // initial state

// ========== PRICE UPDATE ==========
function updatePrice(selectElement, priceDisplayId) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    const priceDisplay = document.getElementById(priceDisplayId);
    if (priceDisplay) {
        const isSubscription = ['netflixPrice', 'youtubePrice', 'dstvPrice'].includes(priceDisplayId);
        const suffix = isSubscription ? ' <small>/month</small>' : ' <small>KES</small>';
        priceDisplay.innerHTML = 'KSh ' + Number(price).toLocaleString() + suffix;
    }
}

// ========== ORDER FLOW ==========
let orderTimer = null;
let countdownValue = 7;
let currentOrderData = null;

function placeOrder(serviceName, selectId) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;

    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const packageDetails = selectedOption.value;
    const price = selectedOption.getAttribute('data-price');

    currentOrderData = {
        serviceName: serviceName,
        packageDetails: packageDetails,
        price: price,
    };

    document.getElementById('modalSummary').innerHTML =
        '<strong>' + serviceName + '</strong> — ' + packageDetails +
        '<br>Amount: <strong>KSh ' + Number(price).toLocaleString() + '</strong>';
    document.getElementById('modalTitle').textContent = 'Processing Your Order...';
    document.getElementById('modalCountdown').textContent = '7';
    document.getElementById('modalRedirectMsg').style.display = 'none';
    document.getElementById('modalSpinner').style.display = 'block';
    document.getElementById('cancelOrderBtn').style.display = 'inline-block';
    document.getElementById('modalCountdown').style.display = 'block';

    document.getElementById('orderModalOverlay').classList.add('show');

    countdownValue = 7;
    if (orderTimer) clearInterval(orderTimer);

    orderTimer = setInterval(() => {
        countdownValue--;
        document.getElementById('modalCountdown').textContent = countdownValue;

        if (countdownValue <= 0) {
            clearInterval(orderTimer);
            orderTimer = null;
            document.getElementById('modalSpinner').style.display = 'none';
            document.getElementById('modalCountdown').style.display = 'none';
            document.getElementById('modalTitle').textContent = 'Order Ready!';
            document.getElementById('modalRedirectMsg').style.display = 'block';
            document.getElementById('cancelOrderBtn').style.display = 'none';

            setTimeout(() => {
                redirectToWhatsApp(currentOrderData);
                closeModal();
            }, 600);
        }
    }, 1000);
}

function redirectToWhatsApp(orderData) {
    if (!orderData) return;
    const message = encodeURIComponent(
        'Hello PREMIUM SERVICES,\n\nI would like to order:\n📌 Service: ' + orderData.serviceName +
        '\n📦 Package: ' + orderData.packageDetails +
        '\n💰 Amount: KSh ' + Number(orderData.price).toLocaleString() +
        '\n\nPlease assist me to complete my order. Thank you!'
    );
    const whatsappURL = 'https://wa.me/25411490456?text=' + message;
    window.open(whatsappURL, '_blank');
}

function cancelOrder() {
    if (orderTimer) {
        clearInterval(orderTimer);
        orderTimer = null;
    }
    currentOrderData = null;
    closeModal();
}

function closeModal() {
    document.getElementById('orderModalOverlay').classList.remove('show');
    if (orderTimer) {
        clearInterval(orderTimer);
        orderTimer = null;
    }
    countdownValue = 7;
    document.getElementById('modalCountdown').textContent = '7';
    document.getElementById('modalSpinner').style.display = 'block';
    document.getElementById('modalCountdown').style.display = 'block';
    document.getElementById('modalRedirectMsg').style.display = 'none';
    document.getElementById('cancelOrderBtn').style.display = 'inline-block';
    document.getElementById('modalTitle').textContent = 'Processing Your Order...';
}

// Close modal on overlay click
document.getElementById('orderModalOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        cancelOrder();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('orderModalOverlay');
        if (overlay.classList.contains('show')) {
            cancelOrder();
        }
    }
});

// Initialize price displays on load
document.addEventListener('DOMContentLoaded', function() {
    const allSelects = document.querySelectorAll('select');
    allSelects.forEach(select => {
        const priceDisplayId = select.id.replace('Select', 'Price');
        updatePrice(select, priceDisplayId);
    });
});