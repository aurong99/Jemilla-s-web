# app.py
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# --- Product Data (Simulating a database) ---
PRODUCTS = [
    {'id': 1, 'name': 'Product Name 1', 'price': 50.00, 'category': 'Perfumes', 'image': 'product-placeholder.jpg'},
    {'id': 2, 'name': 'Product Name 2', 'price': 75.00, 'category': 'Body Sprays', 'image': 'product-placeholder.jpg'},
    {'id': 3, 'name': 'Product Name 3', 'price': 35.00, 'category': 'Oils', 'image': 'product-placeholder.jpg'},
    {'id': 4, 'name': 'Luxury Scent', 'price': 120.00, 'category': 'Perfumes', 'image': 'product-placeholder.jpg'},
    {'id': 5, 'name': 'Travel Pack', 'price': 25.00, 'category': 'New Arrivals', 'image': 'product-placeholder.jpg'},
    # Add more data here
]

# --- Route to serve the main shop page ---
@app.route('/')
@app.route('/shop')
def shop_page():
    # In a real Flask app, you would pass the PRODUCTS data to the template
    # and use Jinja2 templating to generate the product-card divs dynamically.
    # Since we are using your existing static HTML, we just serve the file.
    # NOTE: You must move your index.html into a 'templates' folder
    # for render_template to find it.
    
    # For now, let's keep it simple by telling the user where the data is.
    return "<h1>Welcome to the Shop Backend</h1><p>Visit /api/products to see the product data.</p><p>To run the shop page dynamically, you would need to use Jinja templating in your HTML.</p>"

# --- API Endpoint to get all products (Feature) ---
@app.route('/api/products', methods=['GET'])
def get_products():
    """Returns the list of all products as a JSON API response."""
    # This allows your front-end JS (via fetch) to load data dynamically
    return jsonify({'products': PRODUCTS, 'total_count': len(PRODUCTS)})

# --- API Endpoint for simulated checkout (Feature) ---
@app.route('/api/checkout', methods=['POST'])
def checkout():
    """Simulates a secure checkout process."""
    # In a real app, you would get cart data from the request,
    # validate it, process payment, and update inventory.
    
    # Placeholder for feature
    return jsonify({
        'status': 'success',
        'message': 'Checkout simulated successfully!',
        'order_id': 'ORD-12345'
    })

if __name__ == '__main__':
    # Set debug=True for development (auto-reloads on code changes)
    app.run(debug=True)

    