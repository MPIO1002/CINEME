# 🎬 Cinema Management System

A modern, full-featured cinema management system built with React and TypeScript, providing both client-facing movie browsing and comprehensive admin management capabilities.

<!-- Add screenshot of home page here -->
![Home Page](./docs/screenshots/home.png)

## 🚀 Tech Stack

### Frontend
- **React 19** - Latest version with modern hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **React Router v7** - Client-side routing with nested routes
- **TailwindCSS v4** - Utility-first CSS framework with custom design system
- **Framer Motion** - Smooth animations and transitions
- **GSAP** - Advanced animations for enhanced UX

### UI Components & Styling
- **Radix UI** - Accessible, unstyled component primitives
- **Material-UI (MUI)** - Comprehensive component library
- **Lucide React** - Beautiful, consistent icon set
- **FontAwesome** - Additional icon library
- **Embla Carousel** - Smooth, responsive carousels

### State Management & Data
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time WebSocket communication
- **JWT Decode** - Token authentication handling
- **js-cookie** - Cookie management

### Utilities
- **jsPDF** - PDF generation for reports
- **html2canvas** - Screenshot and export capabilities
- **Sonner** - Toast notifications
- **clsx & tailwind-merge** - Conditional className utilities

## 📁 Project Structure

```
cinema-management/
├── src/
│   ├── components/          # Shared components
│   │   ├── api-config/      # API configuration
│   │   ├── protect-route/   # Route protection
│   │   └── ui/              # Reusable UI components
│   │
│   ├── modules/
│   │   ├── admin/           # Admin module
│   │   │   ├── components/  # Admin-specific components
│   │   │   ├── layouts/     # Admin layouts
│   │   │   ├── pages/       # Admin pages
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Movie/
│   │   │   │   ├── ShowTime/
│   │   │   │   ├── Theater/
│   │   │   │   ├── Booking/
│   │   │   │   └── ...      # Other management pages
│   │   │   └── utils/       # Admin utilities
│   │   │
│   │   └── client/          # Client module
│   │       ├── components/  # Client components
│   │       ├── layout/      # Client layouts
│   │       ├── pages/       # Client pages
│   │       │   ├── home/
│   │       │   ├── movies/  # Movie listing with filters
│   │       │   ├── film-detail/
│   │       │   ├── booking/
│   │       │   ├── showtimes/
│   │       │   ├── profile/
│   │       │   └── theater/
│   │       └── routers/     # Route configuration
│   │
│   ├── services/            # API service layer
│   │   ├── movieApi.ts
│   │   ├── showtimeApi.ts
│   │   ├── bookingApi.ts
│   │   └── ...
│   │
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Library configurations
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── App.tsx              # Root component
│
├── public/                  # Static assets
├── docs/                    # Documentation
│   └── screenshots/         # Application screenshots
└── package.json
```

## ✨ Key Features

### 🎥 Client Features

#### 1. **Movie Browsing & Discovery**
<!-- Add screenshot of movie listing page -->
![Movie Listing](./docs/screenshots/movies-page.png)

- **Smart Movie Display**: Home page shows first 12 available movies with "See More" button
- **Category Filtering**: Dedicated movies page with tabs for:
  - Currently Showing Movies (`/movies/available`)
  - Coming Soon Movies (`/movies/coming-soon`)
- **Pagination**: Efficient navigation through large movie collections (10 movies per page)
- **Interactive Movie Cards**: 
  - Hover previews with 2-second delay
  - Smooth popup animations
  - Movie ratings with star icons
  - High-quality poster images

#### 2. **Movie Details & Trailers**
<!-- Add screenshot of movie popup/detail -->
![Movie Detail](./docs/screenshots/movie-detail.png)

- Rich movie information display
- Embedded YouTube trailer player
- Full-screen trailer modal
- Genre, cast, and crew information
- Release dates and runtime

#### 3. **Booking System**
<!-- Add screenshot of booking page -->
![Booking System](./docs/screenshots/booking.png)

- Interactive seat selection
- Real-time seat availability
- Multiple showtimes
- Combo/concession selection
- Secure payment integration
- OAuth2 authentication (Google)

#### 4. **User Profile & Management**
- Personal booking history
- Profile customization
- Payment history
- Rank/loyalty system

#### 5. **Theater Locations**
- Interactive theater map (Leaflet integration)
- Multiple location support
- Showtime filtering by location

### 🛠️ Admin Features

#### 1. **Dashboard & Analytics**
<!-- Add screenshot of admin dashboard -->
![Admin Dashboard](./docs/screenshots/admin-dashboard.png)

- Real-time booking statistics
- Revenue tracking
- Popular movies analytics
- User engagement metrics

#### 2. **Content Management**
- **Movies**: Full CRUD operations for movie catalog
- **Actors**: Manage cast and crew database
- **Genres**: Category management
- **Formats**: 2D, 3D, IMAX configurations
- **Languages**: Multi-language support

#### 3. **Operational Management**
- **Theaters**: Multi-location management
- **Rooms**: Screen/hall configuration
- **Showtimes**: Schedule management with conflict detection
- **Pricing**: Dynamic pricing rules
- **Combos**: Concession packages

#### 4. **User & Employee Management**
- User account administration
- Employee role management
- Rank/loyalty tier configuration
- Security permissions

#### 5. **Booking Management**
<!-- Add screenshot of booking management -->
![Booking Management](./docs/screenshots/admin-bookings.png)

- View all bookings
- Booking status tracking
- Payment verification
- Refund processing

## 🎨 Design System

### Custom Color Palette
```css
--color-text: #fefdfc       /* Primary text */
--color-background: #24221e  /* Main background */
--color-primary: #f0e3ca     /* Primary accent */
--color-secondary: #ff7218   /* Secondary accent (CTA) */
--color-accent: #ffa43c      /* Tertiary accent */
```

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Wide**: > 1400px

### Custom Animations
- Smooth scroll animations
- Fade-in transitions
- Hover effects with GSAP
- Loading states
- Modal transitions

## 🔐 Security Features

- JWT-based authentication
- Protected admin routes
- OAuth2 integration (Google)
- Secure cookie handling
- Role-based access control

## 🌐 API Integration

### Base Configuration
```typescript
API_BASE_URL: http://localhost:8080/api/v1
WEBSOCKET_URL: ws://localhost:8085
```

### Environment Variables
```env
VITE_API_BASE_URL=your_api_url
VITE_WEBSOCKET_URL=your_websocket_url
VITE_OAUTH_GOOGLE_URL=your_oauth_url
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 8080

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd cinema-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_WEBSOCKET_URL=ws://localhost:8085
VITE_OAUTH_GOOGLE_URL=http://localhost:8080/oauth2/authorize/google
```

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 📱 Key User Flows

### Client Flow
1. **Browse Movies** → Home page displays current movies
2. **Explore More** → Click "See More" to view paginated movie list
3. **Filter by Status** → Switch between "Now Showing" and "Coming Soon"
4. **View Details** → Hover/click on movie for detailed information
5. **Watch Trailer** → Play embedded YouTube trailers
6. **Book Tickets** → Select showtime → Choose seats → Add combos → Pay
7. **Manage Profile** → View bookings, update preferences

### Admin Flow
1. **Login** → Secure admin authentication
2. **Dashboard** → Overview of key metrics
3. **Manage Content** → CRUD operations on movies, actors, etc.
4. **Schedule Showtimes** → Create and manage screening schedules
5. **Process Bookings** → Handle reservations and payments
6. **Analytics** → Track performance and revenue

## 🎯 Advantages & Highlights

### 1. **Modern Architecture**
- Component-based structure with clear separation of concerns
- Modular design for easy scalability
- Type-safe development with TypeScript
- Clean code with ESLint configuration

### 2. **Performance Optimized**
- Vite for blazing-fast development and builds
- Code splitting and lazy loading
- Optimized images and assets
- Efficient state management

### 3. **Rich User Experience**
<!-- Add GIF of interactive features -->
![Interactive Features](./docs/screenshots/interactive-demo.gif)

- Smooth animations and transitions
- Hover previews reduce unnecessary page loads
- Real-time seat selection feedback
- Instant search and filtering
- Responsive design for all devices

### 4. **Developer Experience**
- Hot Module Replacement (HMR)
- TypeScript intellisense
- Centralized API configuration
- Reusable component library
- Comprehensive type definitions

### 5. **Scalability**
- Modular architecture supports feature additions
- Service layer abstraction
- WebSocket support for real-time features
- Environment-based configuration
- Easy to extend with new modules

### 6. **Accessibility**
- Radix UI primitives ensure WCAG compliance
- Keyboard navigation support
- Screen reader friendly
- Semantic HTML structure

## 📊 API Response Structure

### Movies List Response
```typescript
{
  listContent: Movie[],
  pageableData: {
    pageNumber: number,
    pageSize: number,
    totalPage: number,
    totalRecords: number
  }
}
```

### Movie Object
```typescript
{
  id: string,
  nameVn: string,
  nameEn: string,
  director: string,
  releaseDate: string,
  ratings: number,
  image: string,
  trailer: string,
  listGenre: Genre[],
  listActor: Actor[]
}
```

## 🎨 Screenshot Guidelines

To complete the documentation, add screenshots to the following locations:

1. **`docs/screenshots/home.png`** - Homepage showcasing featured movies
2. **`docs/screenshots/movies-page.png`** - Movies listing page with filters
3. **`docs/screenshots/movie-detail.png`** - Movie detail popup/modal
4. **`docs/screenshots/booking.png`** - Seat selection interface
5. **`docs/screenshots/admin-dashboard.png`** - Admin dashboard overview
6. **`docs/screenshots/admin-bookings.png`** - Booking management interface
7. **`docs/screenshots/interactive-demo.gif`** - GIF showing hover effects and animations

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React Team for the amazing framework
- TailwindCSS for the utility-first approach
- All open-source contributors whose libraries made this project possible

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
```

