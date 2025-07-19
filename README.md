# OGX SaaS MVP - B2B Marketplace Platform

A modular B2B marketplace platform built with Next.js 14, TypeScript, and Replit Database.

## Features

### Authentication System
- User registration and login
- Role-based access control (buyer, seller, admin)
- Session management with secure cookies

### User Roles

#### Buyers
- Browse products from verified sellers
- Add products to cart
- Place orders
- View order history

#### Sellers
- Create and manage products
- View product listings
- Track verification status
- Access to seller dashboard

#### Admins
- Manage all users
- Verify/unverify seller accounts
- View system statistics
- Full admin panel access

### Core Functionality
- Product catalog with categories
- Shopping cart system
- Order management
- User verification system
- Responsive design with Tailwind CSS

## Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Replit Database (key-value store)
- **Authentication**: Cookie-based sessions with bcrypt
- **Deployment**: Replit hosting

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses Replit's key-value database with the following structure:

### Users
- Key: `user:{email}`
- Value: `{ id, email, passwordHash, role, is_verified, createdAt }`

### Products
- Key: `product:{uuid}`
- Value: `{ id, name, price, description, category, merchantId, status, images, createdAt }`

### Orders
- Key: `order:{uuid}`
- Value: `{ id, buyerId, productIds, totalPrice, status, createdAt }`

### Cart
- Key: `cart:{userId}`
- Value: `{ items: [{ productId, quantity }], updatedAt }`

## File Structure

```
/
├── app/
│   ├── admin/           # Admin panel pages
│   ├── api/             # API routes
│   ├── dashboard/       # User dashboard
│   ├── login/           # Authentication pages
│   ├── orders/          # Order management
│   ├── products/        # Product listings
│   ├── register/        # User registration
│   └── seller/          # Seller dashboard
├── components/          # Reusable UI components
├── lib/                 # Utility functions and database
│   ├── auth.ts          # Authentication helpers
│   └── db.ts            # Database operations
└── middleware.ts        # Route protection
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products or by merchant
- `POST /api/products` - Create new product (sellers only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart?productId=...` - Remove item from cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order from cart

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users` - Update user verification status

## Demo Flow

1. **Registration**: Create accounts with different roles
2. **Seller Flow**: Add products, wait for verification
3. **Admin Flow**: Verify sellers, manage users
4. **Buyer Flow**: Browse products, add to cart, place orders
5. **Order Management**: Track order status

## Security Features

- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Session management
- CSRF protection via middleware

## Development Notes

- Built for Replit deployment
- Uses Next.js 14 App Router
- Fully typed with TypeScript
- Responsive design with Tailwind CSS
- Modular architecture for easy extension

## Next Steps for Production

1. Add image upload functionality
2. Implement payment processing
3. Add email notifications
4. Enhance search and filtering
5. Add analytics and reporting
6. Implement multi-tenant features