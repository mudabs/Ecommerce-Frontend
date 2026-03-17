# SmartCart - E-Commerce Frontend

A modern, responsive e-commerce frontend application built with React, Vite, and TailwindCSS.

## Project Overview

SmartCart is an e-commerce platform frontend that provides users with a seamless shopping experience. The application features product browsing, filtering, and viewing capabilities with a clean, modern UI built using Material-UI and TailwindCSS.

## Branches

This project maintains two branches:

- **`master`** - Main branch containing stable releases
- **`feature/products`** - Current development branch for Sprint 1 product features *(currently active)*

## Tech Stack

### Core Technologies
- **React** (v19.2.0) - UI library
- **Vite** (v7.3.1) - Build tool and dev server
- **TailwindCSS** (v4.2.0) - Utility-first CSS framework
- **Material-UI** (v7.3.8) - Component library

### State Management & Data Fetching
- **Redux Toolkit** (v2.11.2) - State management
- **React Redux** (v9.2.0) - React bindings for Redux
- **Axios** (v1.13.5) - HTTP client

### Routing & UI Enhancement
- **React Router DOM** (v7.13.1) - Client-side routing
- **React Hot Toast** (v2.6.0) - Toast notifications
- **React Icons** (v5.5.0) - Icon library
- **Headless UI** (v2.2.9) - Unstyled accessible UI components

## Features Implemented (Sprint 1)

### Product Management
-  **Product Display** - Grid-based product listing with responsive design
-  **Product Card Component** - Reusable card component for individual products
-  **Product View Modal** - Detailed product view in modal
-  **Product Filtering** - Custom hook for filtering products by various criteria
-  **Pagination** - Navigate through product pages efficiently

### State Management
-  **Redux Store** - Centralized state management with actions and reducers
-  **Product Actions** - Actions for product-related operations
-  **Filter Actions** - Actions for filtering functionality
-  **Error Handling** - Dedicated error reducer for consistent error management

### Authentication
-  **Auth Context** - Context API for authentication state
-  **Auth Service** - Service layer for authentication operations
-  **useAuth Hook** - Custom hook for accessing auth functionality

### API Integration
-  **API Client** - Configured Axios instance for API calls
-  **Service Layer** - Abstracted API calls into service modules

### UI Components
-  **Filter Component** - Advanced filtering interface
-  **Status Component** - Display loading and error states
-  **Responsive Design** - Mobile-first responsive layouts

## Design System

The project uses a custom theme configuration with:
- **Font**: Montserrat
- **Custom Colors**: Custom blue, banner colors (yellow, red, green, purple)
- **Gradients**: Custom button and background gradients
- **Shadows**: Custom shadow utilities for depth

##  Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Ecommerce Frontend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory and add necessary API endpoints and configuration.

   You can copy the template and fill your own values:
   ```bash
   cp .env.example .env
   ```

   Required checkout/API values:
   - `VITE_FRONTEND_URL` (example: `http://localhost:5174`)
   - `VITE_API_BASE_URL` (example: `/api` with Vite proxy, or direct backend like `http://localhost:5000/api`)
   - `VITE_ORDER_CREATE_PATH` (example: `/orders`)
   - `VITE_ORDER_CURRENCY` (example: `USD`)

   Optional payment value:
   - `VITE_STRIPE_PUBLISHABLE_KEY` (only needed if Stripe components are enabled)

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### Build

Create a production build:
```bash
npm run build
```

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

### Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## Project Structure

```
ecom-frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API configuration
│   ├── assets/         # Images, icons, etc.
│   ├── components/     # React components
│   │   ├── Filter.jsx
│   │   ├── Pagination.jsx
│   │   ├── ProductCard.jsx
│   │   ├── Products.jsx
│   │   ├── ProductViewModal.jsx
│   │   ├── Status.jsx
│   │   └── useProductFilter.jsx
│   ├── context/        # React context providers
│   │   └── AuthContext.jsx
│   ├── hooks/          # Custom React hooks
│   │   └── useAuth.js
│   ├── services/       # API service layer
│   │   ├── apiClient.js
│   │   └── authService.js
│   ├── store/          # Redux store
│   │   ├── actions/    # Redux actions
│   │   │   ├── filterActions.js
│   │   │   ├── index.js
│   │   │   └── productActions.js
│   │   └── reducers/   # Redux reducers
│   │       ├── errorReducer.js
│   │       ├── ProductReducer.js
│   │       └── store.js
│   ├── App.jsx         # Main App component
│   ├── App.css         # App styles
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .eslintrc.js        # ESLint configuration
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## Sprint 1 Goals

The current `feature/products` branch focuses on delivering core product browsing functionality:

1. **Product Listing** - Display products in a responsive grid layout
2. **Filtering System** - Allow users to filter products by categories, price, etc.
3. **Product Details** - View detailed information about products
4. **State Management** - Implement Redux for efficient state handling
5. **Error Handling** - Graceful error states and loading indicators

##  Upcoming Features

Future sprints will include:
- Shopping cart functionality
- User authentication and registration
- Checkout process
- Order history
- Product search
- Wishlist functionality
- User reviews and ratings

##  Development Team

This project is being developed with a sprint-based agile methodology. Contributors are Mathew Shereni and Munashe Mudabura

## License

This project is private and proprietary.

---

**Current Sprint**: Sprint 1 - Product Display & Filtering
**Current Branch**: `feature/products-next`
**Last Updated**: February 2026
