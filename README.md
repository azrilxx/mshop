# Muvex mshop - Multi-Merchant SaaS B2B Marketplace

A comprehensive multi-merchant SaaS B2B marketplace platform built with Next.js 14, TypeScript, Replit Database, and Stripe billing integration.

## 🎯 Stage 6 Complete

✅ **Plan-based Email Gating** - Free, Standard, Premium tiers with appropriate restrictions  
✅ **Cart Reminder Safety** - 12-hour cooldown protection  
✅ **Stripe Billing Integration** - Full subscription management  
✅ **Deployment Packaging** - Ready for production deployment

## 🚀 Features

### SaaS Subscription Plans
| Plan | Products | Ad Slots | Cart Reminders | Marketing | Support |
|------|----------|----------|----------------|-----------|----------|
| **Free** | 20 | 0 | ❌ | ❌ | Basic |
| **Standard** | 60 | 12 | ✅ | Optional | Priority |
| **Premium** | Unlimited | Unlimited | ✅ | ✅ | Premium |

### Authentication & Authorization
- User registration with email verification
- Role-based access control (buyer, seller, admin)
- JWT-based sessions with secure cookies
- Two-factor authentication for admins

### User Roles & Capabilities

#### Buyers
- Browse verified seller products
- Advanced cart functionality
- Order tracking and history
- Automated email notifications

#### Sellers
- Subscription plan management
- Product catalog management (plan-limited)
- Advertisement slot booking
- Seller verification process
- Real-time order notifications

#### Admins
- User and seller management
- System analytics and insights
- Email campaign management
- Abandoned cart monitoring

### Core Marketplace Features
- Multi-vendor product catalog
- Smart shopping cart with reminders
- Order lifecycle management
- Product ratings and reviews
- Advertisement banner system
- Advanced search and filtering

## 🛠 Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with TypeScript
- **Database**: Replit Database (NoSQL key-value store)
- **Payments**: Stripe Checkout & Billing Portal
- **Email**: Mailchimp API with SMTP fallback
- **Authentication**: JWT with bcrypt password hashing
- **Deployment**: Replit hosting with GitHub integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Replit Database access
- Stripe account (for billing)
- Mailchimp account (optional)

### Installation

1. **Clone and Install**
```bash
git clone https://github.com/azril/mshop.git
cd mshop
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Required Environment Variables**
```env
# Database
REPLIT_DB_URL=your_replit_db_url

# Stripe (Test Mode)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STANDARD_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_secure_secret
```

4. **Development Server**
```bash
npm run dev
```

5. **Open Application**
Visit [http://localhost:3000](http://localhost:3000)

### First-Time Setup
1. Register as admin user
2. Configure Stripe price IDs in environment
3. Test email notifications
4. Create test sellers and products

## 📊 Database Schema

### Users
- **Key**: `user:{email}`
- **Schema**: `{ id, email, passwordHash, role, is_verified, createdAt, notifyOrder, notifyStatus, notifyMarketing, cartNotifiedAt }`

### Products
- **Key**: `product:{uuid}` 
- **Schema**: `{ id, name, price, description, category, merchantId, status, images, createdAt }`

### Orders
- **Key**: `order:{uuid}`
- **Schema**: `{ id, buyerId, productIds, totalPrice, status, shipmentStatus, createdAt }`

### Subscription Plans
- **Key**: `plan:{userId}`
- **Schema**: `{ userId, tier, maxProducts, maxAdSlots, customerSupport, quotaUsed, adSlotsUsed, stripeCustomerId }`

### Shopping Cart
- **Key**: `cart:{userId}`
- **Schema**: `{ items: [{ productId, quantity }], updatedAt, reminderSent }`

### Advertisements
- **Key**: `ad:{uuid}`
- **Schema**: `{ id, sellerId, productId, imageUrl, title, description, activeFrom, activeUntil, status }`

### Seller Verification
- **Key**: `verification:{userId}`
- **Schema**: `{ userId, registrationNumber, companyName, logoUrl, licenseUrl, status, submittedAt, reviewedAt }`

## 📁 Project Structure

```
mshop/
├── app/                     # Next.js 14 App Router
│   ├── admin/              # Admin dashboard
│   │   ├── insights/       # Analytics and reports  
│   │   ├── merchants/      # Seller management
│   │   └── users/          # User management
│   ├── api/                # Backend API routes
│   │   ├── billing/        # Stripe integration
│   │   ├── email/          # Email services
│   │   ├── abandoned-carts/ # Cart reminders
│   │   └── auth/           # Authentication
│   ├── seller/             # Seller dashboard
│   │   ├── plan/           # Subscription management
│   │   ├── products/       # Product management
│   │   ├── ads/            # Advertisement management
│   │   └── reports/        # Sales analytics
│   └── shop/               # Public marketplace
├── components/             # Reusable UI components
│   ├── Navbar.tsx         # Navigation component
│   ├── ProductCard.tsx    # Product display
│   ├── AdBanner.tsx       # Advertisement display
│   └── NotificationSettings.tsx
├── lib/                    # Core business logic
│   ├── db.ts              # Database operations
│   ├── auth.ts            # Authentication
│   ├── billing.ts         # Stripe integration
│   ├── mailchimp.ts       # Email services
│   └── notification-service.ts
├── scripts/                # Deployment utilities
│   └── export-for-deploy.ts
└── middleware.ts           # Route protection
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with verification
- `POST /api/auth/login` - User login with session creation
- `POST /api/auth/logout` - Session termination
- `POST /api/otp` - Generate/verify OTP codes

### Billing & Subscriptions
- `POST /api/billing/create-checkout-session` - Create Stripe checkout
- `POST /api/billing/webhook` - Handle Stripe webhooks
- `POST /api/billing/customer-portal` - Access billing portal
- `GET /api/plan` - Get user's subscription plan
- `POST /api/plan` - Update subscription plan

### Products & Catalog
- `GET /api/products` - Get products (with filtering)
- `POST /api/products` - Create product (plan-limited)
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Shopping & Orders
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Manage cart items
- `GET /api/orders` - Get order history
- `POST /api/orders` - Create order from cart
- `PUT /api/orders/{id}` - Update order status

### Email & Notifications
- `POST /api/email/test` - Test email configuration
- `POST /api/email/marketing` - Send marketing campaign
- `PATCH /api/abandoned-carts` - Process cart reminders

### Admin Management
- `GET /api/admin/users` - Manage all users
- `GET /api/admin/merchants` - Manage seller verification
- `POST /api/user/preferences` - Update notification settings

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

## 🚀 Deployment

### Using the Export Script

1. **Create Deployment Package**
```bash
npm run export-deploy
# OR
ts-node scripts/export-for-deploy.ts
```

2. **Deploy to Production**
- Upload `mshop-deploy.zip` to your hosting platform
- Configure environment variables from `.env.example`
- Set up Stripe webhooks pointing to `/api/billing/webhook`
- Configure cron job for abandoned cart processing

### Stripe Setup

1. **Create Products in Stripe Dashboard**
   - Standard Plan: $29/month
   - Premium Plan: $99/month

2. **Configure Webhooks**
   - Endpoint: `https://yourdomain.com/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

3. **Test Webhooks**
```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

### Cron Jobs Setup

**Abandoned Cart Processing** (Run every 6 hours)
```bash
curl -X PATCH https://yourdomain.com/api/abandoned-carts
```

**Email Health Check** (Run daily)
```bash
curl -X POST https://yourdomain.com/api/email/test
```

## 🎯 Production Checklist

- [ ] Configure production Stripe keys
- [ ] Set up email service (Mailchimp/SMTP)
- [ ] Configure domain and SSL
- [ ] Set up monitoring and logging
- [ ] Test payment flows end-to-end
- [ ] Configure backup strategy for Replit DB
- [ ] Set up cron jobs for automation
- [ ] Test webhook endpoints
- [ ] Configure error tracking (Sentry/LogRocket)

## 📞 Support

- **Repository**: [https://github.com/azril/mshop](https://github.com/azril/mshop)
- **Issues**: Create GitHub issues for bugs and feature requests
- **Documentation**: Check README and inline code comments