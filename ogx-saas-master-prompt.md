# OGX SaaS MVP - Master Execution Prompt for Claude

## 🎯 PROJECT OVERVIEW

You are building **OGX**, a modular B2B marketplace platform similar to Shopee/Lazada but designed for business-to-business transactions. This is **Stage 1: MVP Development** targeting deployment on Replit with future migration to shop.muvonenergy.com.

## 🏗️ ARCHITECTURE REQUIREMENTS

### Tech Stack
- **Frontend**: Next.js 14+ (App Router) + Tailwind CSS
- **Backend**: Next.js API routes + Server Actions
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth (Email/Password + Google OAuth)
- **Storage**: Supabase Storage (product images)
- **Hosting**: Replit (development), custom domain later

### Core Principles
1. **Multi-tenant architecture** with merchant-scoped data
2. **Role-based access control** (buyer, seller, admin)
3. **Mobile-first responsive design**
4. **Modular codebase** for future expansion
5. **Security-first** with proper RLS policies

## 📋 MVP FEATURE REQUIREMENTS

### 1. Authentication System
- [ ] Unified login/register form for buyers and sellers
- [ ] Role selection during signup (buyer/seller)
- [ ] Email verification flow
- [ ] Google OAuth integration (optional)
- [ ] Protected routes based on user role
- [ ] Session management with Supabase

### 2. Seller Center
- [ ] Seller dashboard with key metrics
- [ ] Product creation form with image upload
- [ ] Product listing management (CRUD)
- [ ] Incoming orders view
- [ ] Seller profile management
- [ ] Verification status display

### 3. Buyer Experience
- [ ] Public product catalog with search/filter
- [ ] Product detail pages with image gallery
- [ ] Shopping cart functionality
- [ ] Checkout flow (without payment gateway)
- [ ] Order history and tracking
- [ ] Buyer profile management

### 4. Admin Panel
- [ ] Seller verification management
- [ ] User management interface
- [ ] Basic analytics dashboard
- [ ] Order oversight capabilities

## 🗄️ DATABASE SCHEMA

### Required Tables

```sql
-- Users table (managed by Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  merchant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  images TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart table
CREATE TABLE carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(buyer_id, product_id)
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (auth.uid() = merchant_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Cart policies
CREATE POLICY "Users can manage own cart" ON carts FOR ALL USING (auth.uid() = buyer_id);
```

## 🎨 UI/UX REQUIREMENTS

### Design System
- **Color Palette**: Professional B2B aesthetic (blues, grays, whites)
- **Typography**: Clean, readable fonts (Inter or similar)
- **Components**: Consistent button styles, form inputs, cards
- **Layout**: Responsive grid system with Tailwind CSS
- **Navigation**: Clear role-based navigation menus

### Key Pages Structure
```
/                    # Public product catalog
/auth/login          # Login/Register form
/auth/register       # Registration with role selection
/dashboard           # Role-based dashboard redirect
/seller/dashboard    # Seller metrics and overview
/seller/products     # Product management
/seller/orders       # Order management
/buyer/cart          # Shopping cart
/buyer/checkout      # Checkout flow
/buyer/orders        # Order history
/admin/users         # User management
/admin/sellers       # Seller verification
/product/[id]        # Product detail page
```

## 🔧 IMPLEMENTATION GUIDELINES

### 1. Project Structure
```
/app
  /(auth)
    /login
    /register
  /(dashboard)
    /seller
    /buyer
    /admin
  /api
  /components
    /ui
    /forms
    /layouts
  /lib
    /supabase
    /utils
  /types
/public
/styles
```

### 2. Environment Setup
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Key Components to Build
- [ ] AuthProvider with Supabase integration
- [ ] Role-based route protection
- [ ] Product form with image upload
- [ ] Cart management system
- [ ] Order creation flow
- [ ] Admin verification interface

### 4. Data Seeding
Create sample data for testing:
- 1 Admin user
- 2 Verified sellers
- 1 Buyer
- 10 Sample products across different categories
- 3 Sample orders

## 🚀 DEPLOYMENT CHECKLIST

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] RLS policies enabled
- [ ] Sample data seeded
- [ ] All core flows tested

### Replit Setup
- [ ] Next.js project initialized
- [ ] Supabase client configured
- [ ] Auth middleware implemented
- [ ] API routes secured
- [ ] Static assets optimized

## 📝 EXECUTION INSTRUCTIONS

1. **Initialize the project** with Next.js 14 and required dependencies
2. **Set up Supabase integration** with proper TypeScript types
3. **Implement authentication system** with role-based access
4. **Build core components** following the mobile-first approach
5. **Create API routes** for data operations
6. **Implement RLS policies** for data security
7. **Add sample data** for testing
8. **Test all user flows** thoroughly
9. **Optimize for production** deployment

## 🎯 SUCCESS CRITERIA

The MVP is complete when:
- [ ] A seller can register, create products, and receive orders
- [ ] A buyer can browse products, add to cart, and place orders
- [ ] An admin can verify sellers and manage users
- [ ] All data is properly secured with RLS
- [ ] The UI is responsive and professional
- [ ] The application is deployed and accessible

## 📋 NOTES FOR CLAUDE

- Use TypeScript throughout for type safety
- Implement proper error handling and loading states
- Follow Next.js 14 best practices (App Router, Server Components)
- Use Tailwind CSS utility classes for styling
- Implement proper form validation
- Add proper SEO meta tags
- Ensure accessibility standards are met

Begin implementation by first setting up the project structure and authentication system, then proceed with the core features in order of priority.