// script.js
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    // Very basic validation
    if (!data.name || !data.email || !data.message) {
      alert('Please fill all fields.');
      return;
    }

    // Simulate send
    alert('Thanks! We will reach out soon.');
    form.reset();
  });

  // Optional: smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// Cart functionality
let cart = [];
// Replace this with your WhatsApp number, including country code and no + or spaces.
const shopWhatsAppNumber = '919916851560';
const cartCount = document.getElementById('cart-count');
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const closeCart = document.querySelector('.close-cart');
const checkoutBtn = document.getElementById('checkout');
const paymentInputs = document.querySelectorAll('input[name="payment"]');
const upiAppLabel = document.getElementById('upi-app-label');
const upiAppSelect = document.getElementById('upi-app');
const accountButton = document.getElementById('account-button');
const accountModal = document.getElementById('account-modal');
const closeAccount = document.getElementById('close-account');
const accountForm = document.getElementById('account-form');
const accountTitle = document.getElementById('account-title');
const accountStatus = document.getElementById('account-status');
const accountSubmit = document.getElementById('account-submit');
const accountSwitch = document.getElementById('account-switch');
const accountNameField = document.getElementById('account-name-field');
const accountPhoneField = document.getElementById('account-phone-field');
const accountName = document.getElementById('account-name');
const accountEmail = document.getElementById('account-email');
const accountPassword = document.getElementById('account-password');
const accountPhone = document.getElementById('account-phone');
const accountHistory = document.getElementById('account-history');
let accountMode = 'signin';
let signedInAccount = JSON.parse(sessionStorage.getItem('supriyaSignedInAccount') || 'null');

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

function getAccounts() {
  return JSON.parse(localStorage.getItem('supriyaAccounts') || '{}');
}

function saveAccounts(accounts) {
  localStorage.setItem('supriyaAccounts', JSON.stringify(accounts));
}

function updateAccountButton() {
  accountButton.textContent = signedInAccount ? `Hi, ${signedInAccount.name.split(' ')[0]}` : 'Sign in';
}

function showAccountModal(mode = accountMode) {
  accountMode = mode;
  const isSignedIn = Boolean(signedInAccount);
  const isSignup = mode === 'signup';
  accountModal.style.display = 'block';
  accountTitle.textContent = isSignedIn ? 'My account' : (isSignup ? 'Create your account' : 'Sign in');
  accountStatus.textContent = isSignedIn ? `Signed in as ${signedInAccount.email}` : 'Your account details and orders are private to your sign-in.';
  accountForm.hidden = isSignedIn;
  accountSwitch.hidden = isSignedIn;
  accountNameField.hidden = !isSignup;
  accountPhoneField.hidden = !isSignup;
  accountSubmit.textContent = isSignup ? 'Create account' : 'Sign in';
  accountSwitch.textContent = isSignup ? 'Already have an account? Sign in' : 'Create a new account';
  accountHistory.hidden = !isSignedIn;
  if (isSignedIn) {
    const orders = JSON.parse(localStorage.getItem(`supriyaOrders:${signedInAccount.email}`) || '[]');
    accountHistory.innerHTML = `<h3>My orders</h3>${orders.length ? orders.map(order => `<p>${order.date} - ${order.total}</p>`).join('') : '<p>No orders yet.</p>'}<button class="btn" id="sign-out" type="button">Sign out</button>`;
    document.getElementById('sign-out').addEventListener('click', signOut);
  }
}

function signOut() {
  signedInAccount = null;
  sessionStorage.removeItem('supriyaSignedInAccount');
  updateAccountButton();
  accountModal.style.display = 'none';
}

accountButton.addEventListener('click', () => showAccountModal());
closeAccount.addEventListener('click', () => { accountModal.style.display = 'none'; });
accountSwitch.addEventListener('click', () => showAccountModal(accountMode === 'signup' ? 'signin' : 'signup'));
accountForm.addEventListener('submit', async event => {
  event.preventDefault();
  const email = accountEmail.value.trim().toLowerCase();
  const accounts = getAccounts();
  const passwordHash = await hashPassword(accountPassword.value);
  if (accountMode === 'signup') {
    if (!accountName.value.trim() || !accountPhone.value.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }
    if (accounts[email]) {
      alert('An account with this email already exists.');
      return;
    }
    accounts[email] = { name: accountName.value.trim(), phone: accountPhone.value.trim(), passwordHash };
    saveAccounts(accounts);
    signedInAccount = { email, name: accounts[email].name, phone: accounts[email].phone };
  } else {
    if (!accounts[email] || accounts[email].passwordHash !== passwordHash) {
      alert('Email or password is incorrect.');
      return;
    }
    signedInAccount = { email, name: accounts[email].name, phone: accounts[email].phone };
  }
  sessionStorage.setItem('supriyaSignedInAccount', JSON.stringify(signedInAccount));
  updateAccountButton();
  showAccountModal();
});
updateAccountButton();

function toggleUpiApps() {
  const isUpi = document.querySelector('input[name="payment"]:checked').value === 'upi';
  upiAppLabel.hidden = !isUpi;
  upiAppSelect.hidden = !isUpi;
}

paymentInputs.forEach(input => input.addEventListener('change', toggleUpiApps));

// Search and filter
const searchInput = document.getElementById('search');
const categoryLinks = document.querySelectorAll('.categories [data-category]');
const cards = document.querySelectorAll('.card');

function filterProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  const activeCategory = document.querySelector('.categories [data-category].active');

  cards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const category = card.dataset.category;
    const subcategory = card.dataset.subcategory;
    const matchesSearch = title.includes(searchTerm);
    const matchesCategory = activeCategory.dataset.category === 'all'
      || (category === activeCategory.dataset.category && (!activeCategory.dataset.subcategory || subcategory.split(' ').includes(activeCategory.dataset.subcategory)));

    if (matchesSearch && matchesCategory) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

searchInput.addEventListener('input', filterProducts);

categoryLinks.forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.categories [data-category].active')?.classList.remove('active');
    link.classList.add('active');
    filterProducts();
    if (['menswear', 'kidswear'].includes(link.dataset.category)) {
      document.getElementById(link.dataset.category).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Back to top button
const backToTopBtn = document.getElementById('back-to-top');
const productsModal = document.getElementById('products-modal');
const closeProducts = document.querySelector('.close-products');

window.addEventListener('scroll', () => {
  if (window.scrollY > 200) {
    backToTopBtn.style.display = 'block';
  } else {
    backToTopBtn.style.display = 'none';
  }
});

backToTopBtn.addEventListener('click', () => {
  productsModal.style.display = 'block';
});

closeProducts.addEventListener('click', () => {
  productsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === productsModal) {
    productsModal.style.display = 'none';
  }
});

function updateCartCount() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartDisplay() {
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <div>
        <h4>${item.title}</h4>
        <p>₹${item.price} x ${item.quantity}</p>
      </div>
      <button class="remove-btn" data-index="${index}">Remove</button>
    `;
    cartItems.appendChild(itemDiv);
    total += item.price * item.quantity;
  });
  cartTotal.textContent = `Total: ₹${total}`;
}

document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    const img = card.querySelector('img').src;
    const title = card.querySelector('h3').textContent;
    const desc = card.querySelector('p').textContent;
    const quantity = parseInt(card.querySelector('.quantity-input').value) || 1;
    // Extract price from desc, assume "Price-320+5%Gst."
    const priceMatch = desc.match(/Price-(\d+)/);
    const price = priceMatch ? parseInt(priceMatch[1]) : 320;
    let existing = cart.find(item => item.title === title);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ img, title, desc, price, quantity });
    }
    updateCartCount();
    alert(`Added ${quantity} to cart!`);
  });
});

cartIcon.addEventListener('click', () => {
  updateCartDisplay();
  cartModal.style.display = 'block';
});

closeCart.addEventListener('click', () => {
  cartModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === cartModal) {
    cartModal.style.display = 'none';
  }
});

cartItems.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const index = e.target.dataset.index;
    cart[index].quantity--;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    updateCartCount();
    updateCartDisplay();
  }
});

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  if (!signedInAccount) {
    alert('Please sign in or create an account before placing your order.');
    showAccountModal();
    return;
  }

  const customerName = signedInAccount.name;
  const customerPhone = signedInAccount.phone;
  if (!customerName || !customerPhone) {
    alert('Please update your account with your name and phone number.');
    return;
  }

  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  const paymentDetails = paymentMethod === 'upi'
    ? `UPI - ${upiAppSelect.value}`
    : paymentMethod;
  const orderLines = cart.map(item => `${item.title} x ${item.quantity} = ₹${item.price * item.quantity}`);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = [
    'New order from Supriya Fashion',
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Payment: ${paymentDetails}`,
    '',
    ...orderLines,
    `Total: ₹${total}`
  ].join('\n');

  const orderKey = `supriyaOrders:${signedInAccount.email}`;
  const orders = JSON.parse(localStorage.getItem(orderKey) || '[]');
  orders.unshift({ date: new Date().toLocaleDateString(), total: `₹${total}`, items: orderLines });
  localStorage.setItem(orderKey, JSON.stringify(orders));

  window.open(`https://wa.me/${shopWhatsAppNumber}?text=${encodeURIComponent(message)}`, '_blank');
  cart = [];
  updateCartCount();
  cartModal.style.display = 'none';
});
