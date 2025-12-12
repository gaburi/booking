# 🗓️ Session Booking Platform

A modern, full-stack session booking platform built with Next.js 14, featuring multi-language support, payment integration, and comprehensive admin management.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

## ✨ Features

### 🎯 Core Functionality
- **Multi-step Booking Flow**: Intuitive 6-step booking process
- **Session Formats**: Support for both individual and group sessions
- **Session Types**: In-person (presencial) and online sessions
- **Dynamic Pricing**: Flexible pricing with location-based and custom slot pricing
- **Capacity Management**: Track and manage slot capacity and bookings

### 🌍 Internationalization
- **4 Languages**: English, Portuguese, French, and German
- **Dynamic Locale**: Date and currency formatting based on user language
- **Complete Translation**: All UI elements fully translated

### 💳 Payment Integration
- **Stripe Integration**: Secure payment processing
- **Mock Payment Mode**: Development-friendly testing mode
- **Coupon System**: Discount codes with percentage and fixed amounts
- **Multi-currency**: Support for EUR and other currencies

### 📅 Admin Dashboard
- **Availability Manager**: Visual calendar for slot management
- **Bulk Slot Creation**: Create multiple slots with recurring patterns
- **Booking Management**: View and manage all bookings
- **Location Management**: Manage physical locations
- **Coupon Management**: Create and manage discount codes
- **Analytics**: Track booking metrics and revenue

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful cosmic-themed interface
- **Dark Mode**: Full dark mode support
- **Responsive**: Mobile-first design
- **Smooth Animations**: Micro-interactions and transitions
- **Calendar Integration**: Interactive calendar with react-big-calendar

### 🔐 Security & Authentication
- **JWT Authentication**: Secure admin access
- **Protected Routes**: API and admin route protection
- **Email Notifications**: Booking confirmations and reminders

### 🎥 Google Meet Integration
- **Automatic Meeting Creation**: Generate Google Meet links for online sessions
- **Calendar Events**: Sync with Google Calendar
- **Meeting Management**: Automatic cleanup and updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- SQLite (default) or PostgreSQL

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/gaburi/booking.git
cd booking
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Stripe (optional - uses mock mode if not configured)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Google OAuth (optional - for Google Meet integration)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Initialize the database**
```bash
npx prisma migrate dev
npx prisma db seed
```

5. **Start the development server**
```bash
npm run dev
```

6. **Access the application**
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Default Admin Credentials**:
  - Email: `admin@brilliance.com`
  - Password: `admin123`

## 📁 Project Structure

```
session-booking-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # API routes
│   │   ├── booking/           # Booking flow pages
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── Navbar.tsx        # Navigation component
│   │   └── ...
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts           # JWT authentication
│   │   ├── prisma.ts         # Prisma client
│   │   └── stripe.ts         # Stripe integration
│   └── styles/               # Global styles
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts              # Database seeding
│   └── migrations/          # Database migrations
├── public/
│   └── locales/             # i18n translation files
│       ├── en/
│       ├── pt/
│       ├── fr/
│       └── de/
└── package.json
```

## 🗄️ Database Schema

### Key Models
- **User**: Admin users with JWT authentication
- **Location**: Physical locations for in-person sessions
- **AvailabilitySlot**: Time slots with pricing and capacity
- **Booking**: Customer bookings with payment info
- **Payment**: Stripe payment records
- **Coupon**: Discount codes
- **GoogleMeetEvent**: Google Meet integration data

## 🎨 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Shadcn UI**: Beautiful component library
- **React Big Calendar**: Interactive calendar
- **i18next**: Internationalization
- **Lucide Icons**: Modern icon set

### Backend
- **Next.js API Routes**: Serverless API
- **Prisma ORM**: Type-safe database access
- **SQLite**: Default database (easily switchable to PostgreSQL)
- **JWT**: Authentication tokens
- **Stripe**: Payment processing

### Development
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static typing

## 🔧 Configuration

### Switching to PostgreSQL

1. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/booking"
```

2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:
```bash
npx prisma migrate dev
```

### Google Meet Setup

See [GOOGLE_MEET_QUICK_SETUP.md](./GOOGLE_MEET_QUICK_SETUP.md) for detailed instructions.

## 📚 API Documentation

### Public Endpoints
- `GET /api/locations` - List active locations
- `GET /api/availability` - Get available slots
- `POST /api/bookings` - Create a booking
- `POST /api/create-payment-intent` - Initialize payment
- `POST /api/coupons/validate` - Validate coupon code

### Admin Endpoints (Requires JWT)
- `POST /api/admin/availability/bulk` - Create multiple slots
- `GET /api/admin/availability/list` - List all slots
- `PATCH /api/admin/availability/list` - Update slot
- `DELETE /api/admin/availability/list` - Delete slot
- `GET /api/admin/bookings` - List all bookings
- `POST /api/admin/coupons` - Create coupon

## 🌐 Internationalization

The platform supports 4 languages out of the box:
- 🇬🇧 English (en)
- 🇵🇹 Portuguese (pt)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)

### Adding a New Language

1. Create translation files in `public/locales/{lang}/`:
   - `common.json`
   - `home.json`
   - `booking.json`
   - `admin.json`

2. Update `src/app/i18n.ts` to include the new language

## 🎯 Booking Flow

1. **Session Format**: Choose between individual or group session
2. **Session Type**: Select in-person or online
3. **Location**: Pick a location (for in-person sessions)
4. **Date & Time**: Choose from available slots
5. **Personal Info**: Enter contact details
6. **Payment**: Complete payment via Stripe

## 👨‍💼 Admin Features

### Availability Management
- Visual calendar view (Month/Week/Day)
- Bulk slot creation with recurring patterns
- Individual slot editing (price, capacity, format)
- Color-coded slots (Group/Individual, Online/In-person)

### Booking Management
- View all bookings with filters
- Export booking data
- Send confirmation emails
- Track payment status

### Analytics
- Revenue tracking
- Booking statistics
- Popular time slots
- Location performance

## 🧪 Testing

### Mock Payment Mode
When Stripe keys are not configured, the platform automatically uses mock payment mode:
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t booking-platform .
docker run -p 3000:3000 booking-platform
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Stripe](https://stripe.com/)
- [React Big Calendar](https://github.com/jquense/react-big-calendar)

## 📧 Support

For support, email support@brilliance.com or open an issue on GitHub.

---

**Made with ❤️ by Brilance Team**
