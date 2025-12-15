document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // A. SELECTORS AND INITIAL STATE
    // -----------------------------------------------------------------
    
    // Header/Product Selectors
    const cartCountSpan = document.getElementById('cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const addToWishlistButtons = document.querySelectorAll('.add-to-wishlist');
    const searchInput = document.getElementById('product-search');
    const searchButton = document.getElementById('search-button');
    const signInButton = document.getElementById('signin-button');
    const wishlistIcon = document.querySelector('.wishlist-icon');
    const wishlistCountSpan = document.getElementById('wishlist-count');
    
    // Promotions Selectors
    const featuredButtons = document.querySelectorAll('.featured-btn');
    
    // Contact Form Selector
    const contactForm = document.getElementById('contact-form');
    
    // Navigation Selectors
    const homeLink = document.querySelector('.nav-links li:first-child a');
    const shopLink = document.querySelector('a[href="#product-listing"]');
    const aboutLink = document.getElementById('about-link');
    const aboutSection = document.getElementById('about-section');
    const contactLink = document.getElementById('contact-link');
    const contactSection = document.getElementById('contact-section');
    const shopContainer = document.querySelector('.shop-container');
    const checkoutSteps = document.getElementById('checkout-steps');
    
    console.log('Navigation selectors:', { homeLink, shopLink, aboutLink, contactLink });
    
    // -----------------------------------------------------------------
    // HELPER FUNCTIONS
    // -----------------------------------------------------------------
    
    /**
     * Sets the active navigation link
     * @param {Element} activeLink - The link to set as active
     */
    function setActiveNav(activeLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        // Add active to the specified link
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // Welcome Modal Selectors
    const welcomeModal = document.getElementById('welcome-modal');
    const enterSiteBtn = document.getElementById('enter-site');
    
    // Modal Selectors
    const signinModal = document.getElementById('signin-modal');
    const closeModal = document.querySelector('.close');
    const signinTab = document.getElementById('signin-tab');
    const registerTab = document.getElementById('register-tab');
    const signinContent = document.getElementById('signin-content');
    const registerContent = document.getElementById('register-content');
    const signinForm = document.getElementById('signin-form');
    const registerForm = document.getElementById('register-form');
    const googleBtn = document.querySelector('.google-btn');
    
    // Checkout Selectors
    const checkoutContainer = document.getElementById('checkout-steps');
    const goToCheckoutButton = document.getElementById('go-to-checkout');
    const cartSummaryPage = document.getElementById('cart-summary-page');
    const cartItemsDisplay = document.getElementById('cart-items-display');
    const subtotalDisplay = document.getElementById('subtotal-display');
    const taxDisplay = document.getElementById('tax-display');
    const cartTotalDisplay = document.getElementById('cart-total-display');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');
    
    // Step Elements
    const stepShipping = document.getElementById('step-shipping');
    const stepReview = document.getElementById('step-review');
    const stepPayment = document.getElementById('step-payment');
    
    // Navigation Buttons
    const nextToReviewButton = document.getElementById('next-to-review');
    const nextToPaymentButton = document.getElementById('next-to-payment');
    const proceedToFinalPaymentButton = document.getElementById('proceed-to-final-payment');
    
    const orderSummaryDisplay = document.getElementById('order-summary-display');
    const finalTotalDisplay = document.getElementById('final-total');

    // -----------------------------------------------------------------
    // WELCOME MODAL LOGIC
    // -----------------------------------------------------------------
    
    // Always show welcome modal on page load/refresh
    if (welcomeModal) {
        welcomeModal.style.display = 'flex';
        welcomeModal.style.opacity = '1';
        
        // Auto-hide welcome modal after 4 seconds
        setTimeout(() => {
            welcomeModal.style.opacity = '0';
            setTimeout(() => {
                welcomeModal.style.display = 'none';
            }, 500); // Fade out animation duration
        }, 4000); // 4 seconds
    }

    // Enter site button (fallback in case user clicks before auto-hide)
    if (enterSiteBtn) {
        enterSiteBtn.addEventListener('click', () => {
            if (welcomeModal) {
                welcomeModal.style.opacity = '0';
                setTimeout(() => {
                    welcomeModal.style.display = 'none';
                }, 500);
            }
        });
    }

    // State Variables
    let cartCount = 0;
    let cartItems = []; // To store items added to cart
    let wishlistCount = 0;
    let wishlistItems = []; // To store items added to wishlist
    
    // Mapping steps for easier management
    const steps = {
        'shipping': stepShipping,
        'review': stepReview,
        'payment': stepPayment
    };
    
    // Sample product data structure (used for cart and search simulation)
    const productsData = [
        { name: 'OLAY', price: 50.00, category: 'Perfumes' },
        { name: 'VC', price: 75.00, category: 'Perfumes' },
        { name: 'Skin Aqua', price: 35.00, category: 'Body Sprays' },
        { name: 'Ceramide', price: 35.00, category: 'Oils' },
        { name: 'Vaseline', price: 35.00, category: 'Oils' },
        { name: 'Aloe Vera', price: 35.00, category: 'New Arrivals' },
        { name: 'Anua 10+', price: 60.00, category: 'Perfumes' },
        { name: 'Facial Tonic', price: 45.00, category: 'Body Sprays' },
        { name: 'Skin Success', price: 80.00, category: 'Oils' },
        { name: 'Nivea Lotion', price: 55.00, category: 'New Arrivals' },
        { name: 'Nivea Extra White', price: 40.00, category: 'Perfumes' },
        { name: 'Olay', price: 70.00, category: 'Body Sprays' },
        { name: "Palmer's Shear", price: 65.00, category: 'New Arrivals' },
        { name: 'Jergens', price: 30.00, category: 'Oils' },
        { name: 'Wonder cream', price: 90.00, category: 'Perfumes' },
        { name: 'Rose Water Spray', price: 28.00, category: 'Body Sprays' },
        { name: 'Lavender Essence', price: 48.00, category: 'Perfumes' },
        { name: 'Coconut Oil', price: 32.00, category: 'Oils' },
        { name: 'Argan Oil Treatment', price: 58.00, category: 'New Arrivals' },
        { name: 'Floral Mist', price: 42.00, category: 'Perfumes' },
        { name: 'Citrus Splash', price: 35.00, category: 'Body Sprays' },
        { name: 'Jojoba Oil Serum', price: 52.00, category: 'Oils' },
        { name: 'Vitamin E Cream', price: 46.00, category: 'New Arrivals' },
        { name: 'Vanilla Scent', price: 55.00, category: 'Perfumes' },
        { name: 'Ocean Breeze Spray', price: 38.00, category: 'Body Sprays' },
        { name: 'Tea Tree Oil', price: 36.00, category: 'Oils' },
        { name: 'Honey Mask', price: 44.00, category: 'New Arrivals' },
        { name: 'Sandalwood Perfume', price: 72.00, category: 'Perfumes' },
        { name: 'Cherry Blossom', price: 39.00, category: 'Body Sprays' },
        { name: 'Rosehip Oil', price: 54.00, category: 'Oils' },
    ];
    
    // -----------------------------------------------------------------
    // B. HELPER FUNCTIONS
    // -----------------------------------------------------------------
    
    /**
     * Updates the cart count display in the header.
     */
    function updateCartDisplay() {
        cartCountSpan.textContent = cartCount;
    }

    /**
     * Updates the wishlist count display in the header.
     */
    function updateWishlistDisplay() {
        wishlistCountSpan.textContent = wishlistCount;
    }

    /**
     * Switches the visibility of checkout steps.
     * @param {string} nextStepKey - The key of the step to show ('shipping', 'review', 'payment').
     */
    function showStep(nextStepKey) {
        // Hide all steps
        Object.values(steps).forEach(step => step.classList.remove('active-step'));
        
        // Show the target step
        const nextStepElement = steps[nextStepKey];
        if (nextStepElement) {
            nextStepElement.classList.add('active-step');
        }

        // Scroll the user down to the start of the checkout area
        checkoutContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Dynamically generates the order summary for the review step.
     */
    function renderOrderSummary() {
        if (cartItems.length === 0) {
            orderSummaryDisplay.innerHTML = '<p>Your cart is empty. Please add items to proceed.</p>';
            finalTotalDisplay.textContent = '$0.00';
            return;
        }

        let summaryHTML = '<ul>';
        let total = 0;

        cartItems.forEach(item => {
            summaryHTML += `<li>${item.name} (${item.quantity}x) - $${(item.price * item.quantity).toFixed(2)}</li>`;
            total += item.price * item.quantity;
        });

        summaryHTML += '</ul>';
        orderSummaryDisplay.innerHTML = summaryHTML;
        finalTotalDisplay.textContent = `$${total.toFixed(2)}`;
    }

    // -----------------------------------------------------------------
    // C. EVENT LISTENERS - INTERACTIVITY
    // -----------------------------------------------------------------

    // --- 1. Add to Cart Logic ---
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); 
            
            const card = event.target.closest('.product-card');
            const productName = card.querySelector('.product-title').textContent;
            
            // Find the product details (price)
            const productDetail = productsData.find(p => p.name === productName);
            const price = productDetail ? productDetail.price : 0;
            
            // Update cart state
            const existingItem = cartItems.find(item => item.name === productName);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cartItems.push({ name: productName, price: price, quantity: 1 });
            }
            
            cartCount++;
            updateCartDisplay();
            
            console.log(`${productName} added. Cart total items: ${cartCount}`);
            alert(`${productName} added to cart!`);
        });
    });

    // --- 1b. Add to Wishlist Logic ---
    addToWishlistButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); 
            
            const card = event.target.closest('.product-card');
            const productName = card.querySelector('.product-title').textContent;
            
            // Find the product details (price)
            const productDetail = productsData.find(p => p.name === productName);
            const price = productDetail ? productDetail.price : 0;
            
            // Check if already in wishlist
            const existingItem = wishlistItems.find(item => item.name === productName);
            if (!existingItem) {
                wishlistItems.push({ name: productName, price: price });
                wishlistCount++;
                updateWishlistDisplay();
                
                console.log(`${productName} added to wishlist!`);
                alert(`${productName} added to wishlist for later purchase!`);
            } else {
                alert(`${productName} is already in your wishlist!`);
            }
        });
    });

    // --- 1c. Featured Products Logic ---
    featuredButtons.forEach((button, index) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            
            // Featured products data
            const featuredProducts = [
                { name: 'Luxury Scent', price: 84.00 },
                { name: 'Travel Pack', price: 25.00 },
                { name: 'Premium Body Spray', price: 63.75 }
            ];
            
            const product = featuredProducts[index];
            
            // Update cart state
            const existingItem = cartItems.find(item => item.name === product.name);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cartItems.push({ name: product.name, price: product.price, quantity: 1 });
            }
            
            cartCount++;
            updateCartDisplay();
            
            console.log(`${product.name} added. Cart total items: ${cartCount}`);
            alert(`${product.name} added to cart!`);
        });
    });

    // --- 1c. Wishlist Icon Click ---
    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', () => {
            if (wishlistItems.length === 0) {
                alert("Your wishlist is empty. Add some products to see them here!");
                return;
            }
            
            let wishlistMessage = "Your Wishlist:\n\n";
            wishlistItems.forEach((item, index) => {
                wishlistMessage += `${index + 1}. ${item.name} - $${item.price.toFixed(2)}\n`;
            });
            wishlistMessage += "\nClick on a product to add it to cart or continue shopping!";
            
            alert(wishlistMessage);
        });
    }

    // --- 2. Search Logic ---
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            alert("Please enter a product name to search.");
            return;
        }

        // Filter product cards based on search query
        const allCards = document.querySelectorAll('.product-card');
        let matchCount = 0;
        
        allCards.forEach(card => {
            const title = card.querySelector('.product-title').textContent.toLowerCase();
            if (title.includes(query)) {
                card.style.display = 'block';
                matchCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (matchCount > 0) {
            // Reset to first page
            currentPage = 1;
            filteredCategory = null;
            
            // Show matching products
            const visibleCards = Array.from(allCards).filter(card => card.style.display !== 'none');
            totalProducts = visibleCards.length;
            totalPages = Math.ceil(totalProducts / productsPerPage);
            
            // Show first page of results
            const startIndex = 0;
            const endIndex = Math.min(productsPerPage, totalProducts);
            for (let i = 0; i < allCards.length; i++) {
                if (allCards[i].style.display !== 'none') {
                    if (i < endIndex) {
                        allCards[i].style.display = 'block';
                    } else {
                        allCards[i].style.display = 'none';
                    }
                }
            }
            
            // Update product count display
            const endDisplay = Math.min(productsPerPage, totalProducts);
            productCountSpan.textContent = `Showing 1–${endDisplay} of ${totalProducts} results (Search: "${query}")`;
            
            // Reset pagination
            paginationLinks.forEach(link => {
                link.classList.remove('current');
                if (link.dataset.page === '1') {
                    link.classList.add('current');
                }
            });
            
            // Scroll to products
            document.getElementById('product-listing').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            alert(`No products found matching "${query}".`);
            productCountSpan.textContent = `Showing 0 results (Search: "${query}")`;
        }
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    // --- 3. Sign In Modal ---
    signInButton.addEventListener('click', () => {
        signinModal.style.display = 'block';
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        signinModal.style.display = 'none';
    });

    // Click outside to close
    window.addEventListener('click', (event) => {
        if (event.target === signinModal) {
            signinModal.style.display = 'none';
        }
    });

    // Tab switching
    signinTab.addEventListener('click', () => {
        signinTab.classList.add('active');
        registerTab.classList.remove('active');
        signinContent.style.display = 'block';
        registerContent.style.display = 'none';
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        signinTab.classList.remove('active');
        registerContent.style.display = 'block';
        signinContent.style.display = 'none';
    });

    // Form submissions
    signinForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const inputs = signinForm.querySelectorAll('input');
        const emailPhone = inputs[0].value;
        const password = inputs[1].value;
        
        if (emailPhone && password) {
            console.log(`Sign in: ${emailPhone}`);
            alert(`Signed in successfully! Welcome back.`);
            signinModal.style.display = 'none';
            signInButton.textContent = "Welcome, Shopper!";
        }
    });

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const inputs = registerForm.querySelectorAll('input');
        const phone = inputs[0].value;
        const password = inputs[1].value;
        const confirmPassword = inputs[2].value;
        
        if (phone && password && password === confirmPassword) {
            console.log(`Register: ${phone}`);
            alert(`Registered successfully! You can now sign in.`);
            signinModal.style.display = 'none';
        } else if (password !== confirmPassword) {
            alert("Passwords do not match!");
        }
    });

    // Google sign in
    googleBtn.addEventListener('click', () => {
        alert("Redirecting to Google sign in... (Simulation)");
        signinModal.style.display = 'none';
        signInButton.textContent = "Welcome, Shopper!";
    });

    // --- 4. Contact Information ---
    if (contactLink) {
        contactLink.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Contact link clicked');
            
            // Hide other sections
            shopContainer.style.display = 'none';
            aboutSection.classList.add('hidden-section');
            aboutSection.classList.remove('active');
            checkoutSteps.classList.add('hidden-section');
            checkoutSteps.classList.remove('active');
            
            // Show contact section
            contactSection.classList.remove('hidden-section');
            contactSection.classList.add('active');
            
            // Scroll to contact
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Set active nav
            setActiveNav(contactLink);
        });
    }

    // --- 5. About Section ---
    if (aboutLink) {
        aboutLink.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('About link clicked');
            
            // Hide other sections
            shopContainer.style.display = 'none';
            checkoutSteps.classList.add('hidden-section');
            checkoutSteps.classList.remove('active');
            
            // Show about section
            aboutSection.classList.remove('hidden-section');
            aboutSection.classList.add('active');
            
            // Scroll to about
            aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Set active nav
            setActiveNav(aboutLink);
        });
    }

    // --- 5b. Contact Form ---
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const inputs = contactForm.querySelectorAll('input, textarea');
            const name = inputs[0].value;
            const email = inputs[1].value;
            const message = inputs[2].value;
            
            if (name && email && message) {
                alert(`Thank you ${name}! Your message has been sent. We'll get back to you soon.`);
                contactForm.reset();
            }
        });
    }

    // --- 6. Shop Link ---
    if (shopLink) {
        shopLink.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Shop link clicked');
            
            // Hide about and checkout
            aboutSection.classList.add('hidden-section');
            aboutSection.classList.remove('active');
            checkoutSteps.classList.add('hidden-section');
            checkoutSteps.classList.remove('active');
            
            // Show shop
            shopContainer.style.display = 'flex';
            
            // Scroll to shop
            document.getElementById('product-listing').scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Set active nav
            setActiveNav(shopLink);
        });
    }

    // --- 7. Home Link ---
    if (homeLink) {
        homeLink.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Home link clicked');
            
            // Hide about and checkout
            aboutSection.classList.add('hidden-section');
            aboutSection.classList.remove('active');
            checkoutSteps.classList.add('hidden-section');
            checkoutSteps.classList.remove('active');
            
            // Show shop
            shopContainer.style.display = 'flex';
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Set active nav (Shop since Home shows shop)
            setActiveNav(shopLink);
        });
    }

    // -----------------------------------------------------------------
    // D. CART SUMMARY & CHECKOUT LOGIC
    // -----------------------------------------------------------------

    /**
     * Displays the cart summary page with all items
     */
    function displayCartSummary() {
        if (cartItems.length === 0) {
            cartItemsDisplay.innerHTML = '<div class="empty-cart-message">Your cart is empty. Add items to continue shopping!</div>';
            subtotalDisplay.textContent = '$0.00';
            taxDisplay.textContent = '$0.00';
            cartTotalDisplay.textContent = '$0.00';
            return;
        }

        // Build cart items HTML
        let cartHTML = '';
        let subtotal = 0;

        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            cartHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-qty">Quantity: ${item.quantity}</div>
                    </div>
                    <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                </div>
            `;
        });

        cartItemsDisplay.innerHTML = cartHTML;

        // Calculate totals
        const tax = subtotal * 0.10; // 10% tax
        const total = subtotal + tax; // Free shipping

        subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
        taxDisplay.textContent = `$${tax.toFixed(2)}`;
        cartTotalDisplay.textContent = `$${total.toFixed(2)}`;
    }

    // --- Step 0: Show Cart Summary ---
    if (goToCheckoutButton) {
        goToCheckoutButton.addEventListener('click', () => {
            if (cartCount === 0) {
                alert("Your cart is empty. Please add items before proceeding to checkout!");
                return;
            }
            
            // Show cart summary page
            cartSummaryPage.classList.remove('hidden-section');
            cartSummaryPage.classList.add('active');
            
            // Display cart items
            displayCartSummary();
            
            // Scroll to cart
            cartSummaryPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // --- Continue Shopping ---
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            cartSummaryPage.classList.add('hidden-section');
            cartSummaryPage.classList.remove('active');
            document.getElementById('product-listing').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // --- Proceed to Checkout from Cart ---
    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', () => {
            cartSummaryPage.classList.add('hidden-section');
            cartSummaryPage.classList.remove('active');
            
            // Reveal the checkout steps
            checkoutContainer.classList.remove('hidden-section'); 
            checkoutContainer.classList.add('active');
            
            // Start at the first step
            showStep('shipping');
        });
    }

    // --- Step 1: Checkout Steps ---

    // --- Step 1: Shipping to Review ---
    if (nextToReviewButton) {
        nextToReviewButton.addEventListener('click', () => {
            // Basic Form Validation (Simulation)
            const inputs = stepShipping.querySelectorAll('input, textarea');
            const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');

            if (!allFilled) {
                alert("Please fill in all delivery information before continuing.");
                return;
            }
            
            renderOrderSummary(); // Prepare the summary data
            showStep('review');
        });
    }

    // --- Step 2: Review to Payment ---
    if (nextToPaymentButton) {
        nextToPaymentButton.addEventListener('click', () => {
            // This is the action that reveals the payment options last
            showStep('payment'); 
        });
    }
    
    // --- Step 3: Final Payment Confirmation ---
    if (proceedToFinalPaymentButton) {
        proceedToFinalPaymentButton.addEventListener('click', () => {
            const selectedMethod = document.querySelector('input[name="payment_method"]:checked');
            
            if (!selectedMethod) {
                alert("Please select a payment method to finalize your order.");
                return;
            }

            const method = selectedMethod.value;
            let message = `Order Confirmed! Your payment method is ${method.replace('_', ' ').toUpperCase()}.`;
            
            if (method === 'mobile_money') {
                message += "\n\n(Simulated) Redirecting you to the Mobile Money link/page to complete your transaction.";
            } else if (method === 'pay_on_delivery') {
                message += "\n\n(Simulated) Your order is placed! You will pay upon delivery. Please check your phone/email for confirmation.";
            }

            alert(message);
            // Final action: Clear cart, send final data to the server (Python backend)
            cartCount = 0;
            cartItems = [];
            updateCartDisplay();
        });
    }
            
    // -----------------------------------------------------------------
    // PAGINATION LOGIC
    // -----------------------------------------------------------------
    
    // Pagination Selectors
    const paginationLinks = document.querySelectorAll('.page-link');
    const productGrid = document.querySelector('.product-grid');
    const productCountSpan = document.querySelector('.product-count');
    const productCards = document.querySelectorAll('.product-card');
    
    // Pagination State
    let currentPage = 1;
    const productsPerPage = 8;
    let totalProducts = productCards.length;
    let totalPages = Math.ceil(totalProducts / productsPerPage);
    let filteredCategory = null;
    
    /**
     * Shows products for the specified page
     * @param {number} page - The page number to show
     */
    function showPage(page) {
        // Hide all products
        productCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Calculate start and end indices for this page
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = Math.min(startIndex + productsPerPage, totalProducts);
        
        // Show products for this page
        for (let i = startIndex; i < endIndex; i++) {
            productCards[i].style.display = 'block';
        }
        
        // Update current page
        currentPage = page;
        
        // Update pagination active state
        paginationLinks.forEach(link => {
            link.classList.remove('current');
            if (link.dataset.page && parseInt(link.dataset.page) === page) {
                link.classList.add('current');
            }
        });
        
        // Update prev/next button states
        const prevButton = document.querySelector('.prev-page');
        const nextButton = document.querySelector('.next-page');
        
        if (prevButton) {
            prevButton.classList.toggle('disabled', currentPage === 1);
        }
        if (nextButton) {
            nextButton.classList.toggle('disabled', currentPage === totalPages);
        }
        
        // Update product count display
        const startProduct = startIndex + 1;
        const endProduct = endIndex;
        const categoryText = filteredCategory ? ` (${filteredCategory})` : '';
        productCountSpan.textContent = `Showing ${startProduct}–${endProduct} of ${totalProducts} results${categoryText}`;
        
        // Scroll to top of product listing
        document.getElementById('product-listing').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Initialize pagination - show first page
    showPage(1);
    
    // Category Filtering
    const categoryLinks = document.querySelectorAll('.sidebar a');
    if (categoryLinks.length > 0) {
        categoryLinks.forEach((link, index) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                
                const categories = ['Perfumes', 'Body Sprays', 'Oils', 'New Arrivals'];
                const selectedCategory = categories[index];
                
                // Filter products by category (data-category attribute)
                filteredCategory = selectedCategory;
                currentPage = 1;
                
                let visibleCards = [];
                productCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (category === selectedCategory) {
                        card.style.display = 'none'; // Start hidden
                        visibleCards.push(card);
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Update totals for filtered view
                totalProducts = visibleCards.length;
                totalPages = Math.ceil(totalProducts / productsPerPage);
                
                // Show first page of filtered results
                if (totalProducts > 0) {
                    const startIndex = 0;
                    const endIndex = Math.min(productsPerPage, totalProducts);
                    for (let i = startIndex; i < endIndex; i++) {
                        visibleCards[i].style.display = 'block';
                    }
                }
                
                // Reset pagination display
                paginationLinks.forEach(plink => {
                    plink.classList.remove('current');
                    if (plink.dataset.page === '1') {
                        plink.classList.add('current');
                    }
                });
                
                // Update product count
                const categoryText = ` (${selectedCategory})`;
                const endDisplay = Math.min(productsPerPage, totalProducts);
                productCountSpan.textContent = `Showing 1–${endDisplay} of ${totalProducts} results${categoryText}`;
                
                // Scroll to products
                document.getElementById('product-listing').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }
    
    // Pagination Event Listeners
    paginationLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            
            // Don't do anything if button is disabled
            if (link.classList.contains('disabled')) {
                return;
            }
            
            if (link.classList.contains('next-page')) {
                // Next page logic
                if (currentPage < totalPages) {
                    showPage(currentPage + 1);
                }
            } else if (link.classList.contains('prev-page')) {
                // Previous page logic
                if (currentPage > 1) {
                    showPage(currentPage - 1);
                }
            } else if (link.dataset.page) {
                const pageNum = parseInt(link.dataset.page);
                if (pageNum >= 1 && pageNum <= totalPages) {
                    showPage(pageNum);
                }
            }
        });
    });

    // -----------------------------------------------------------------
    // SOCIAL MEDIA LINK HANDLERS
    // -----------------------------------------------------------------

    // Social media link handlers
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = link.dataset.platform;

            // Define social media URLs (replace with actual URLs)
            const socialUrls = {
                facebook: 'https://www.facebook.com/jemillas.skincare.gh',
                tiktok: 'https://www.tiktok.com/https://www.tiktok.com/@aurong99',
                whatsapp: 'https://wa.me/233XXXXXXXXX', // Replace with actual WhatsApp number
                snapchat: 'https://www.snapchat.com/add/jemillas.skincare.gh'
            };

            const url = socialUrls[platform];
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
                console.log(`Opening ${platform} link: ${url}`);
            } else {
                console.warn(`No URL defined for platform: ${platform}`);
                // Fallback: show alert for platforms without URLs
                alert(`Coming soon! Follow us on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
            }
        });
    });
});






