from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from functools import wraps
import jwt

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///jemillas_shop.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_EXPIRATION_DELTA'] = timedelta(days=30)

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# ============================================================================
# DATABASE MODELS
# ============================================================================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    orders = db.relationship('Order', backref='user', lazy=True, cascade='all, delete-orphan')
    cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade='all, delete-orphan')
    wishlist_items = db.relationship('WishlistItem', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'phone_number': self.phone_number,
            'email': self.email,
            'full_name': self.full_name,
            'created_at': self.created_at.isoformat()
        }


class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float, nullable=True)
    category = db.Column(db.String(100), nullable=False)
    image = db.Column(db.String(255), nullable=True)
    stock = db.Column(db.Integer, default=0)
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cart_items = db.relationship('CartItem', backref='product', lazy=True, cascade='all, delete-orphan')
    order_items = db.relationship('OrderItem', backref='product', lazy=True, cascade='all, delete-orphan')
    wishlist_items = db.relationship('WishlistItem', backref='product', lazy=True, cascade='all, delete-orphan')
    
    @property
    def discount_percentage(self):
        if self.original_price and self.price < self.original_price:
            return int((1 - self.price / self.original_price) * 100)
        return 0
    
    def to_dict(self, include_stock=True):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'original_price': self.original_price,
            'category': self.category,
            'image': self.image,
            'is_featured': self.is_featured,
            'discount_percentage': self.discount_percentage,
            'created_at': self.created_at.isoformat()
        }
        if include_stock:
            data['stock'] = self.stock
        return data


class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product': self.product.to_dict(include_stock=False),
            'quantity': self.quantity,
            'subtotal': self.product.price * self.quantity,
            'added_at': self.added_at.isoformat()
        }


class WishlistItem(db.Model):
    __tablename__ = 'wishlist_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product': self.product.to_dict(include_stock=False),
            'added_at': self.added_at.isoformat()
        }


class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    shipping = db.Column(db.Float, default=0)
    tax = db.Column(db.Float, default=0)
    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, shipped, delivered, cancelled
    payment_method = db.Column(db.String(50), nullable=False)  # mobile_money, pay_on_delivery
    payment_status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    
    # Delivery Information
    full_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    phone_number = db.Column(db.String(20), nullable=False)
    delivery_address = db.Column(db.Text, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'subtotal': self.subtotal,
            'shipping': self.shipping,
            'tax': self.tax,
            'total': self.total,
            'status': self.status,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'full_name': self.full_name,
            'phone_number': self.phone_number,
            'delivery_address': self.delivery_address,
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product_name = db.Column(db.String(255), nullable=False)
    product_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_price': self.product_price,
            'quantity': self.quantity,
            'subtotal': self.subtotal
        }


# ============================================================================
# AUTHENTICATION & DECORATORS
# ============================================================================

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except Exception as e:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated


# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    data = request.get_json()
    
    # Validation
    if not data or not data.get('phone_number') or not data.get('password'):
        return jsonify({'message': 'Missing required fields: phone_number, password'}), 400
    
    if len(data.get('password', '')) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400
    
    # Check if user already exists
    if User.query.filter_by(phone_number=data['phone_number']).first():
        return jsonify({'message': 'Phone number already registered'}), 409
    
    if data.get('email') and User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 409
    
    # Create new user
    user = User(
        phone_number=data['phone_number'],
        email=data.get('email'),
        full_name=data.get('full_name')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + app.config['JWT_EXPIRATION_DELTA']
    }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': user.to_dict()
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.get_json()
    
    if not data or not data.get('phone_number') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    user = User.query.filter_by(phone_number=data['phone_number']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid phone number or password'}), 401
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + app.config['JWT_EXPIRATION_DELTA']
    }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200


@app.route('/api/auth/user', methods=['GET'])
@token_required
def get_user(current_user):
    """Get current user profile"""
    return jsonify({
        'user': current_user.to_dict()
    }), 200


# ============================================================================
# PRODUCT ROUTES
# ============================================================================

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    category = request.args.get('category')
    search = request.args.get('search')
    featured_only = request.args.get('featured', False, type=bool)
    sort_by = request.args.get('sort', 'newest')  # newest, price_low, price_high
    
    query = Product.query
    
    # Apply filters
    if category:
        query = query.filter_by(category=category)
    
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%') | 
                           Product.description.ilike(f'%{search}%'))
    
    if featured_only:
        query = query.filter_by(is_featured=True)
    
    # Apply sorting
    if sort_by == 'price_low':
        query = query.order_by(Product.price.asc())
    elif sort_by == 'price_high':
        query = query.order_by(Product.price.desc())
    else:  # newest
        query = query.order_by(Product.created_at.desc())
    
    # Pagination
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'products': [product.to_dict() for product in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page,
        'per_page': per_page
    }), 200


@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    product = Product.query.get_or_404(product_id)
    return jsonify({'product': product.to_dict()}), 200


@app.route('/api/products/categories', methods=['GET'])
def get_categories():
    """Get all available product categories"""
    categories = db.session.query(Product.category).distinct().all()
    category_list = [cat[0] for cat in categories if cat[0]]
    return jsonify({'categories': category_list}), 200


# ============================================================================
# CART ROUTES
# ============================================================================

@app.route('/api/cart', methods=['GET'])
@token_required
def get_cart(current_user):
    """Get user's cart"""
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    
    total = sum(item.product.price * item.quantity for item in cart_items)
    
    return jsonify({
        'items': [item.to_dict() for item in cart_items],
        'total': total,
        'count': len(cart_items)
    }), 200


@app.route('/api/cart/add', methods=['POST'])
@token_required
def add_to_cart(current_user):
    """Add item to cart"""
    data = request.get_json()
    
    if not data or not data.get('product_id'):
        return jsonify({'message': 'Missing product_id'}), 400
    
    product = Product.query.get_or_404(data['product_id'])
    quantity = data.get('quantity', 1)
    
    if quantity < 1:
        return jsonify({'message': 'Quantity must be at least 1'}), 400
    
    # Check if product already in cart
    cart_item = CartItem.query.filter_by(
        user_id=current_user.id,
        product_id=product.id
    ).first()
    
    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=product.id,
            quantity=quantity
        )
        db.session.add(cart_item)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Item added to cart',
        'item': cart_item.to_dict()
    }), 200


@app.route('/api/cart/update/<int:item_id>', methods=['PUT'])
@token_required
def update_cart_item(current_user, item_id):
    """Update cart item quantity"""
    cart_item = CartItem.query.get_or_404(item_id)
    
    if cart_item.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    quantity = data.get('quantity')
    
    if not quantity or quantity < 1:
        return jsonify({'message': 'Invalid quantity'}), 400
    
    cart_item.quantity = quantity
    db.session.commit()
    
    return jsonify({
        'message': 'Cart item updated',
        'item': cart_item.to_dict()
    }), 200


@app.route('/api/cart/remove/<int:item_id>', methods=['DELETE'])
@token_required
def remove_from_cart(current_user, item_id):
    """Remove item from cart"""
    cart_item = CartItem.query.get_or_404(item_id)
    
    if cart_item.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({'message': 'Item removed from cart'}), 200


@app.route('/api/cart/clear', methods=['DELETE'])
@token_required
def clear_cart(current_user):
    """Clear entire cart"""
    CartItem.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    
    return jsonify({'message': 'Cart cleared'}), 200


# ============================================================================
# WISHLIST ROUTES
# ============================================================================

@app.route('/api/wishlist', methods=['GET'])
@token_required
def get_wishlist(current_user):
    """Get user's wishlist"""
    wishlist_items = WishlistItem.query.filter_by(user_id=current_user.id).all()
    
    return jsonify({
        'items': [item.to_dict() for item in wishlist_items],
        'count': len(wishlist_items)
    }), 200


@app.route('/api/wishlist/add', methods=['POST'])
@token_required
def add_to_wishlist(current_user):
    """Add item to wishlist"""
    data = request.get_json()
    
    if not data or not data.get('product_id'):
        return jsonify({'message': 'Missing product_id'}), 400
    
    product = Product.query.get_or_404(data['product_id'])
    
    # Check if already in wishlist
    existing = WishlistItem.query.filter_by(
        user_id=current_user.id,
        product_id=product.id
    ).first()
    
    if existing:
        return jsonify({'message': 'Item already in wishlist'}), 409
    
    wishlist_item = WishlistItem(
        user_id=current_user.id,
        product_id=product.id
    )
    
    db.session.add(wishlist_item)
    db.session.commit()
    
    return jsonify({
        'message': 'Item added to wishlist',
        'item': wishlist_item.to_dict()
    }), 200


@app.route('/api/wishlist/remove/<int:item_id>', methods=['DELETE'])
@token_required
def remove_from_wishlist(current_user, item_id):
    """Remove item from wishlist"""
    wishlist_item = WishlistItem.query.get_or_404(item_id)
    
    if wishlist_item.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(wishlist_item)
    db.session.commit()
    
    return jsonify({'message': 'Item removed from wishlist'}), 200


# ============================================================================
# ORDER ROUTES
# ============================================================================

@app.route('/api/orders/checkout', methods=['POST'])
@token_required
def checkout(current_user):
    """Create an order from cart"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['full_name', 'phone_number', 'delivery_address', 'payment_method']
    if not all(field in data for field in required_fields):
        return jsonify({'message': f'Missing required fields: {", ".join(required_fields)}'}), 400
    
    # Get cart items
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    
    if not cart_items:
        return jsonify({'message': 'Cart is empty'}), 400
    
    # Calculate totals
    subtotal = sum(item.product.price * item.quantity for item in cart_items)
    shipping = 0 if subtotal >= 50 else 5  # Free shipping over $50
    tax = subtotal * 0.1  # 10% tax
    total = subtotal + shipping + tax
    
    # Generate order number
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}-{current_user.id}"
    
    # Create order
    order = Order(
        user_id=current_user.id,
        order_number=order_number,
        subtotal=subtotal,
        shipping=shipping,
        tax=tax,
        total=total,
        payment_method=data['payment_method'],
        full_name=data['full_name'],
        email=current_user.email,
        phone_number=data['phone_number'],
        delivery_address=data['delivery_address']
    )
    
    db.session.add(order)
    db.session.flush()  # Get the order ID
    
    # Add order items
    for cart_item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product.id,
            product_name=cart_item.product.name,
            product_price=cart_item.product.price,
            quantity=cart_item.quantity,
            subtotal=cart_item.product.price * cart_item.quantity
        )
        db.session.add(order_item)
        
        # Update product stock
        cart_item.product.stock -= cart_item.quantity
    
    # Clear cart
    CartItem.query.filter_by(user_id=current_user.id).delete()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Order created successfully',
        'order': order.to_dict()
    }), 201


@app.route('/api/orders', methods=['GET'])
@token_required
def get_orders(current_user):
    """Get user's orders"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    paginated = Order.query.filter_by(user_id=current_user.id).order_by(
        Order.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'orders': [order.to_dict() for order in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page
    }), 200


@app.route('/api/orders/<int:order_id>', methods=['GET'])
@token_required
def get_order(current_user, order_id):
    """Get order details"""
    order = Order.query.get_or_404(order_id)
    
    if order.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    return jsonify({'order': order.to_dict()}), 200


# ============================================================================
# ADMIN ROUTES (for management)
# ============================================================================

@app.route('/api/admin/products', methods=['POST'])
def admin_create_product():
    """Create a new product (Admin only - in production, add proper auth)"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ['name', 'price', 'category']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    product = Product(
        name=data['name'],
        description=data.get('description'),
        price=data['price'],
        original_price=data.get('original_price'),
        category=data['category'],
        image=data.get('image'),
        stock=data.get('stock', 0),
        is_featured=data.get('is_featured', False)
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({
        'message': 'Product created successfully',
        'product': product.to_dict()
    }), 201


@app.route('/api/admin/products/<int:product_id>', methods=['PUT'])
def admin_update_product(product_id):
    """Update a product (Admin only)"""
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    if 'name' in data:
        product.name = data['name']
    if 'price' in data:
        product.price = data['price']
    if 'description' in data:
        product.description = data['description']
    if 'category' in data:
        product.category = data['category']
    if 'image' in data:
        product.image = data['image']
    if 'stock' in data:
        product.stock = data['stock']
    if 'is_featured' in data:
        product.is_featured = data['is_featured']
    if 'original_price' in data:
        product.original_price = data['original_price']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Product updated successfully',
        'product': product.to_dict()
    }), 200


@app.route('/api/admin/orders/<int:order_id>/status', methods=['PUT'])
def admin_update_order_status(order_id):
    """Update order status (Admin only)"""
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    
    valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    status = data.get('status')
    
    if status not in valid_statuses:
        return jsonify({'message': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    order.status = status
    db.session.commit()
    
    return jsonify({
        'message': 'Order status updated',
        'order': order.to_dict()
    }), 200


# ============================================================================
# UTILITY ROUTES
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()}), 200


@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'message': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'message': 'Internal server error'}), 500


# ============================================================================
# INITIALIZATION
# ============================================================================

def init_db():
    """Initialize database with sample products"""
    with app.app_context():
        db.create_all()
        
        # Check if products already exist
        if Product.query.first() is None:
            sample_products = [
                Product(
                    name='OLAY',
                    price=50.00,
                    category='Perfumes',
                    image='image 2.jpg',
                    stock=20,
                    is_featured=True
                ),
                Product(
                    name='VC',
                    price=75.00,
                    category='Perfumes',
                    image='image 3.jpg',
                    stock=15,
                    is_featured=False
                ),
                Product(
                    name='Skin Aqua',
                    price=35.00,
                    category='Body Sprays',
                    image='image 4.jpg',
                    stock=25,
                    is_featured=False
                ),
                Product(
                    name='Ceramide',
                    price=35.00,
                    category='Oils',
                    image='image 5.jpg',
                    stock=18,
                    is_featured=False
                ),
                Product(
                    name='Vaseline',
                    price=35.00,
                    category='Oils',
                    image='vaseline 2.jpg',
                    stock=30,
                    is_featured=True
                ),
                Product(
                    name='Aloe Vera',
                    price=35.00,
                    category='New Arrivals',
                    image='image 7.jpg',
                    stock=22,
                    is_featured=False
                ),
                Product(
                    name='Anua 10+',
                    price=60.00,
                    original_price=75.00,
                    category='Perfumes',
                    image='image 6.jpg',
                    stock=12,
                    is_featured=True
                ),
                Product(
                    name='Luxury Scent',
                    price=84.00,
                    original_price=120.00,
                    category='Perfumes',
                    image='image 4.jpg',
                    stock=10,
                    is_featured=True
                ),
                Product(
                    name='Travel Pack',
                    price=25.00,
                    category='New Arrivals',
                    image='image 5.jpg',
                    stock=40,
                    is_featured=True
                ),
                Product(
                    name='Premium Body Spray',
                    price=63.75,
                    original_price=75.00,
                    category='Body Sprays',
                    image='image 6.jpg',
                    stock=16,
                    is_featured=True
                ),
            ]
            
            for product in sample_products:
                db.session.add(product)
            
            db.session.commit()
            print("Database initialized with sample products")


if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
