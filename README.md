# Jemilla's Skin Care - Complete Backend System

A full-featured e-commerce backend built with Flask, SQLAlchemy, and JWT authentication.

## 🚀 Features

### User Management
- **User Registration**: Sign up with phone number and password
- **User Login**: Secure JWT-based authentication
- **User Profile**: View and manage user account information
- **Password Hashing**: Secure password storage with Werkzeug

### Product Management
- **Product Listing**: Browse all products with pagination
- **Product Categories**: Filter products by category
- **Search Functionality**: Search products by name or description
- **Sorting**: Sort by newest, price (low to high), or price (high to low)
- **Featured Products**: Highlight special products
- **Stock Management**: Track product availability

### Shopping Cart
- **Add to Cart**: Add products with quantity
- **Update Cart**: Modify item quantities
- **Remove Items**: Remove products from cart
- **Clear Cart**: Empty the entire cart
- **Cart Summary**: View totals and item counts

### Wishlist
- **Add to Wishlist**: Save favorite products
- **View Wishlist**: See all saved items
- **Remove from Wishlist**: Delete unwanted items
- **Wishlist Counter**: Track number of wishlist items

### Orders & Checkout
- **Checkout Process**: Multi-step order creation
- **Order Management**: View order history
- **Order Details**: See complete order information
- **Payment Methods**: Mobile Money or Pay on Delivery
- **Order Status**: Track order progress (pending, confirmed, shipped, delivered, cancelled)
- **Order Totals**: Automatic calculation of subtotal, shipping, and tax

### Admin Features
- **Product Creation**: Add new products to catalog
- **Product Updates**: Modify existing product details
- **Order Management**: Update order status
- **Inventory Control**: Manage stock levels

## 📁 Project Structure

```
Jemilla-s-web/
├── app.py                 # Main Flask application & routes
├── requirements.txt       # Python dependencies
├── .env                   # Environment configuration
├── api-client.js         # Frontend JavaScript API client
├── index.html            # Main HTML page
├── style.css             # CSS styling
├── java2.js              # Original JavaScript functionality
├── py.py                 # Old Python file (can be removed)
└── README.md             # This file
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.7+
- pip (Python package manager)
- Git

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/aurong99/Jemilla-s-web.git
cd Jemilla-s-web
```

2. **Create virtual environment**
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
- Copy `.env.example` to `.env` (if it exists) or create `.env`:
```bash
cp .env .env.local  # Edit with your settings
```

5. **Initialize database**
```bash
python
>>> from app import app, init_db
>>> init_db()
>>> exit()
```

6. **Run the development server**
```bash
python app.py
```

The server will start at `http://localhost:5000`

## 📡 API Endpoints

### Authentication

**Register User**
```
POST /api/auth/register
{
  "phone_number": "0538672832",
  "password": "password123",
  "full_name": "John Doe",
  "email": "john@example.com"
}
Response: { token, user }
```

**Login User**
```
POST /api/auth/login
{
  "phone_number": "0538672832",
  "password": "password123"
}
Response: { token, user }
```

**Get Current User**
```
GET /api/auth/user
Headers: Authorization: Bearer {token}
Response: { user }
```

### Products

**Get All Products**
```
GET /api/products?page=1&per_page=12&category=Perfumes&search=olay&sort=newest
Response: { products[], total, pages, current_page }
```

**Get Single Product**
```
GET /api/products/{product_id}
Response: { product }
```

**Get Categories**
```
GET /api/products/categories
Response: { categories[] }
```

### Cart

**Get Cart**
```
GET /api/cart
Headers: Authorization: Bearer {token}
Response: { items[], total, count }
```

**Add to Cart**
```
POST /api/cart/add
Headers: Authorization: Bearer {token}
{
  "product_id": 1,
  "quantity": 2
}
Response: { message, item }
```

**Update Cart Item**
```
PUT /api/cart/update/{item_id}
Headers: Authorization: Bearer {token}
{
  "quantity": 3
}
Response: { message, item }
```

**Remove from Cart**
```
DELETE /api/cart/remove/{item_id}
Headers: Authorization: Bearer {token}
Response: { message }
```

**Clear Cart**
```
DELETE /api/cart/clear
Headers: Authorization: Bearer {token}
Response: { message }
```

### Wishlist

**Get Wishlist**
```
GET /api/wishlist
Headers: Authorization: Bearer {token}
Response: { items[], count }
```

**Add to Wishlist**
```
POST /api/wishlist/add
Headers: Authorization: Bearer {token}
{
  "product_id": 1
}
Response: { message, item }
```

**Remove from Wishlist**
```
DELETE /api/wishlist/remove/{item_id}
Headers: Authorization: Bearer {token}
Response: { message }
```

### Orders

**Create Order (Checkout)**
```
POST /api/orders/checkout
Headers: Authorization: Bearer {token}
{
  "full_name": "John Doe",
  "phone_number": "0538672832",
  "delivery_address": "123 Main St",
  "payment_method": "mobile_money"  // or "pay_on_delivery"
}
Response: { message, order }
```

**Get User Orders**
```
GET /api/orders?page=1&per_page=10
Headers: Authorization: Bearer {token}
Response: { orders[], total, pages }
```

**Get Order Details**
```
GET /api/orders/{order_id}
Headers: Authorization: Bearer {token}
Response: { order }
```

### Admin

**Create Product**
```
POST /api/admin/products
{
  "name": "New Product",
  "price": 50.00,
  "original_price": 75.00,
  "category": "Perfumes",
  "image": "image.jpg",
  "stock": 20,
  "is_featured": true,
  "description": "Product description"
}
Response: { message, product }
```

**Update Product**
```
PUT /api/admin/products/{product_id}
{
  "name": "Updated Name",
  "price": 45.00,
  "stock": 15
}
Response: { message, product }
```

**Update Order Status**
```
PUT /api/admin/orders/{order_id}/status
{
  "status": "shipped"  // pending, confirmed, shipped, delivered, cancelled
}
Response: { message, order }
```

## 🗄️ Database Schema

### Users Table
- `id` (Primary Key)
- `phone_number` (Unique)
- `email` (Unique, Optional)
- `password` (Hashed)
- `full_name`
- `created_at`
- `updated_at`

### Products Table
- `id` (Primary Key)
- `name`
- `description`
- `price`
- `original_price`
- `category`
- `image`
- `stock`
- `is_featured`
- `created_at`
- `updated_at`

### Cart Items Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `product_id` (Foreign Key)
- `quantity`
- `added_at`

### Wishlist Items Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `product_id` (Foreign Key)
- `added_at`

### Orders Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `order_number` (Unique)
- `subtotal`
- `shipping`
- `tax`
- `total`
- `status`
- `payment_method`
- `payment_status`
- `full_name`
- `email`
- `phone_number`
- `delivery_address`
- `created_at`
- `updated_at`

### Order Items Table
- `id` (Primary Key)
- `order_id` (Foreign Key)
- `product_id` (Foreign Key)
- `product_name`
- `product_price`
- `quantity`
- `subtotal`

## 🔐 Security Features

- **Password Hashing**: Werkzeug security for password storage
- **JWT Authentication**: Secure token-based user authentication
- **CORS Protection**: Cross-Origin Resource Sharing configuration
- **Input Validation**: Data validation on all endpoints
- **User Authorization**: Endpoints verify user ownership of resources

## 📝 Usage Examples

### Frontend JavaScript Integration

The `api-client.js` file provides ready-to-use functions:

```javascript
// Register
await registerUser('0538672832', 'password123', 'John Doe', 'john@example.com');

// Login
await loginUser('0538672832', 'password123');

// Get products
const result = await getProducts(1, 'Perfumes', null, 'price_low');

// Add to cart
await addToCart(1, 2);  // product_id=1, quantity=2

// Create order
await createOrder('John Doe', '0538672832', '123 Main St', 'mobile_money');
```

### HTML Integration

Add to your HTML:
```html
<script src="api-client.js"></script>
<script src="java2.js"></script>
```

## 🚀 Deployment

### Using Gunicorn (Production)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## 📚 Technologies Used

- **Backend**: Flask, Flask-SQLAlchemy, Flask-CORS
- **Database**: SQLite (development), PostgreSQL (production recommended)
- **Authentication**: JWT (PyJWT)
- **Security**: Werkzeug
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in .env or run:
python app.py --port 5001
```

### Database Errors
```bash
# Reset database:
rm jemillas_shop.db
python -c "from app import init_db; init_db()"
```

### CORS Issues
- Ensure frontend and backend have matching origins in `.env`
- Check browser console for specific CORS error messages

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Jemilla's Skin Care**
- Email: aaronamoah91@gmail.com
- Phone: 0538672832, 0551606432
- Location: Ghana

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ✅ Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] SMS notifications (for Mobile Money confirmation)
- [ ] Product reviews and ratings
- [ ] Inventory management dashboard
- [ ] Analytics and reporting
- [ ] Multiple language support
- [ ] Mobile app integration
- [ ] Real-time order tracking
- [ ] Coupon/discount system
