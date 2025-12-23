# TransJakarta Routes Frontend

A modern web application built with TanStack React, Router, Query, and Form for viewing TransJakarta BRT routes and submitting reports about route changes.

## Features

- **Route Browsing**: View all TransJakarta routes with pagination and search
- **Route Details**: See detailed route information including all stops in sequence
- **User Authentication**: Email/password and Google OAuth authentication
- **Report System**: Submit reports about route changes, policy updates, or temporary events
- **Reports Dashboard**: View and track your submitted reports with status updates

## Technology Stack

- **React 19** with TypeScript
- **TanStack Router**: File-based routing
- **TanStack Query**: Data fetching and caching
- **TanStack Form**: Form state management with Zod validation
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client
- **Vite**: Build tool and dev server

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see [backend repository](https://github.com/iqbalShafiq/tj-routes))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tj-routes-fe
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx       # Root layout with providers
│   ├── index.tsx        # Routes listing page
│   ├── routes/
│   │   └── $routeId.tsx # Route detail page
│   ├── reports/
│   │   ├── index.tsx    # Reports dashboard
│   │   └── new.tsx      # New report form
│   └── auth/
│       ├── login.tsx    # Login page
│       └── register.tsx # Registration page
├── components/          # React components
│   ├── ui/              # Reusable UI components
│   ├── RouteCard.tsx
│   ├── RouteDetail.tsx
│   ├── ReportForm.tsx
│   └── Navbar.tsx
├── lib/
│   ├── api/             # API client and endpoints
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
└── main.tsx             # Application entry point
```

## API Integration

The frontend integrates with the backend API at the following endpoints:

- **Authentication**: `/api/v1/auth/*`
- **Routes**: `/api/v1/routes`
- **Stops**: `/api/v1/stops`
- **Reports**: `/api/v1/reports`

All authenticated endpoints require a JWT token in the `Authorization: Bearer <token>` header.

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL (default: `http://localhost:8080`)
- `VITE_GOOGLE_OAUTH_CLIENT_ID`: Google OAuth client ID (optional)

## Features in Detail

### Route Browsing
- Paginated list of all routes
- Search functionality
- Responsive card-based layout
- Click to view route details

### Route Details
- Full route information
- Sequential stop listing with details
- Stop facilities and location information
- Quick report button for authenticated users

### Authentication
- Email/password registration and login
- Google OAuth integration
- JWT token management
- Protected routes

### Report System
- Submit reports about route changes
- Select route and optional stop
- Report types: Policy Change, Temporary Event, Other
- Track report status (pending, reviewed, resolved)
- View admin notes on reports

## License

This project is licensed under the MIT License.
