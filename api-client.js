// ============================================================================
// FRONTEND API CLIENT & STATE MANAGEMENT
// ============================================================================

const API_BASE_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('auth_token');
let currentUser = null;

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

async function registerUser(phoneNumber, password, fullName = '', email = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone_number: phoneNumber,
                password: password,
                full_name: fullName,
                email: email
            })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

async function loginUser(phoneNumber, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone_number: phoneNumber,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

function logoutUser() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
}

async function getCurrentUser() {
    if (!authToken) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            return currentUser;
        } else {
            logoutUser();
            return null;
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}

// ============================================================================
// PRODUCT FUNCTIONS
// ============================================================================

async function getProducts(page = 1, category = null, search = null, sort = 'newest') {
    try {
        let url = `${API_BASE_URL}/products?page=${page}&per_page=12&sort=${sort}`;
        if (category) url += `&category=${category}`;
        if (search) url += `&search=${search}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        return { success: false, error: error.message };
    }
}

async function getProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const data = await response.json();

        if (response.ok) {
            return { success: true, data: data.product };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        return { success: false, error: error.message };
    }
}

async function getCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/categories`);
        const data = await response.json();

        if (response.ok) {
            return { success: true, data: data.categories };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// CART FUNCTIONS
// ============================================================================

async function getCart() {
    if (!authToken) {
        console.log('Not authenticated, using local cart');
        return { success: true, data: JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0, count: 0 } };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
        return { success: false, error: error.message };
    }
}

async function addToCart(productId, quantity = 1) {
    if (!authToken) {
        console.log('Not authenticated, adding to local cart');
        let cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0, count: 0 };
        
        // For now, just show a message
        alert('Please sign in to add items to cart');
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });

        const data = await response.json();

        if (response.ok) {
            updateCartUI();
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, error: error.message };
    }
}

async function updateCartItem(itemId, quantity) {
    if (!authToken) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: quantity })
        });

        const data = await response.json();

        if (response.ok) {
            updateCartUI();
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        return { success: false, error: error.message };
    }
}

async function removeFromCart(itemId) {
    if (!authToken) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            updateCartUI();
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        return { success: false, error: error.message };
    }
}

async function clearCart() {
    if (!authToken) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/clear`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            updateCartUI();
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// WISHLIST FUNCTIONS
// ============================================================================

async function getWishlist() {
    if (!authToken) {
        return { success: true, data: { items: [], count: 0 } };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return { success: false, error: error.message };
    }
}

async function addToWishlist(productId) {
    if (!authToken) {
        alert('Please sign in to add items to wishlist');
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: productId })
        });

        const data = await response.json();

        if (response.ok) {
            updateWishlistUI();
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return { success: false, error: error.message };
    }
}

async function removeFromWishlist(itemId) {
    if (!authToken) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/wishlist/remove/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            updateWishlistUI();
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// ORDER FUNCTIONS
// ============================================================================

async function createOrder(fullName, phoneNumber, deliveryAddress, paymentMethod) {
    if (!authToken) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: fullName,
                phone_number: phoneNumber,
                delivery_address: deliveryAddress,
                payment_method: paymentMethod
            })
        });

        const data = await response.json();

        if (response.ok) {
            clearCart();
            return { success: true, data: data.order };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: error.message };
    }
}

async function getOrders(page = 1) {
    if (!authToken) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders?page=${page}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { success: false, error: error.message };
    }
}

async function getOrder(orderId) {
    if (!authToken) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data: data.order };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error fetching order:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// UI UPDATE FUNCTIONS
// ============================================================================

async function updateCartUI() {
    const cartResult = await getCart();
    if (cartResult.success) {
        const cartCount = cartResult.data.count || 0;
        const cartTotal = cartResult.data.total || 0;
        
        document.getElementById('cart-count').textContent = cartCount;
    }
}

async function updateWishlistUI() {
    const wishlistResult = await getWishlist();
    if (wishlistResult.success) {
        const wishlistCount = wishlistResult.data.count || 0;
        document.getElementById('wishlist-count').textContent = wishlistCount;
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already logged in
    if (authToken) {
        const user = await getCurrentUser();
        if (user) {
            console.log('User logged in:', user);
            updateCartUI();
            updateWishlistUI();
        } else {
            logoutUser();
        }
    }

    // Load initial UI
    await loadProducts();
    await loadCategories();
});

// ============================================================================
// PAGE LOAD FUNCTIONS
// ============================================================================

async function loadProducts(page = 1, category = null, search = null, sort = 'newest') {
    const result = await getProducts(page, category, search, sort);
    if (result.success) {
        displayProducts(result.data.products);
    }
}

function displayProducts(products) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h4 class="product-title">${product.name}</h4>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="product-buttons">
                <button class="add-to-cart" onclick="addToCartHandler(${product.id})">Add to Cart</button>
                <button class="add-to-wishlist" onclick="addToWishlistHandler(${product.id})">❤️ Wishlist</button>
            </div>
        </div>
    `).join('');
}

async function loadCategories() {
    const result = await getCategories();
    if (result.success) {
        displayCategories(result.data);
    }
}

function displayCategories(categories) {
    const sidebar = document.querySelector('.sidebar ul');
    if (!sidebar) return;

    sidebar.innerHTML = categories.map(category => `
        <li><a href="#" onclick="filterByCategory('${category}')">${category}</a></li>
    `).join('');
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

async function addToCartHandler(productId) {
    const result = await addToCart(productId, 1);
    if (result.success) {
        alert('Product added to cart!');
    } else {
        alert(`Error: ${result.error}`);
    }
}

async function addToWishlistHandler(productId) {
    const result = await addToWishlist(productId);
    if (result.success) {
        alert('Product added to wishlist!');
    } else {
        alert(`Error: ${result.error}`);
    }
}

function filterByCategory(category) {
    loadProducts(1, category);
}

async function handleSearch() {
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        const searchTerm = searchInput.value;
        loadProducts(1, null, searchTerm);
    }
}

async function handleSignIn() {
    const phone = prompt('Enter your phone number:');
    if (!phone) return;

    const password = prompt('Enter your password:');
    if (!password) return;

    const result = await loginUser(phone, password);
    if (result.success) {
        alert('Logged in successfully!');
        location.reload();
    } else {
        alert(`Login failed: ${result.error}`);
    }
}

async function handleRegister() {
    const phone = prompt('Enter your phone number:');
    if (!phone) return;

    const password = prompt('Enter a password (min 6 characters):');
    if (!password || password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    const fullName = prompt('Enter your full name (optional):');
    const email = prompt('Enter your email (optional):');

    const result = await registerUser(phone, password, fullName, email);
    if (result.success) {
        alert('Registration successful! Logged in automatically.');
        location.reload();
    } else {
        alert(`Registration failed: ${result.error}`);
    }
}

async function handleCheckout() {
    if (!authToken) {
        alert('Please sign in first');
        return;
    }

    const fullName = prompt('Enter your full name:');
    if (!fullName) return;

    const phoneNumber = prompt('Enter your phone number:');
    if (!phoneNumber) return;

    const address = prompt('Enter delivery address:');
    if (!address) return;

    const paymentMethod = confirm('Choose payment method:\nOK = Mobile Money\nCANCEL = Pay on Delivery') ? 'mobile_money' : 'pay_on_delivery';

    const result = await createOrder(fullName, phoneNumber, address, paymentMethod);
    if (result.success) {
        alert(`Order created successfully!\nOrder #: ${result.data.order_number}`);
        location.reload();
    } else {
        alert(`Checkout failed: ${result.error}`);
    }
}

// Event listeners for UI elements
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-button');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    const signInBtn = document.getElementById('signin-button');
    if (signInBtn) {
        signInBtn.addEventListener('click', handleSignIn);
    }

    const checkoutBtn = document.getElementById('go-to-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});
