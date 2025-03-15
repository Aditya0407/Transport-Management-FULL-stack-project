# Load Posting System

A full-stack web application designed to streamline load posting and bidding between shippers and truckers, with dedicated administrative oversight.

## Project Overview

This system enables seamless load posting, bidding, and real-time location tracking, ensuring efficient logistics management. Key functionalities include user authentication, bid management, and an intuitive admin dashboard.

## Tech Stack

- **Frontend**: Next.js, React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Features

### Implemented Features

- Secure user authentication (login/register)
- Load posting and management
- Bidding system for competitive offers
- Admin dashboard for oversight
- Real-time location tracking
- Instant updates via WebSockets

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd load-posting-system
   ```

2. Configure and start the backend:

   ```bash
   cd server
   cp .env.example .env  # Set up environment variables
   npm install
   npm start
   ```

3. Configure and start the frontend:
   ```bash
   cd client
   cp .env.example .env  # Set up environment variables
   npm install
   npm run dev
   ```

### Environment Variables

#### Server (.env)

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `NODE_ENV`: Development or production mode

#### Client (.env)

- `NEXT_PUBLIC_API_URL`: Backend API URL

## System Architecture

### Frontend

- Next.js for server-side rendering and routing
- React Context API for state management
- WebSocket integration for real-time updates
- Responsive UI with modern components

### Backend

- RESTful API built with Express.js
- MongoDB powered by Mongoose ORM
- JWT-based authentication middleware
- WebSocket support for instant data synchronization

### Core Components

- **User Management**: Handles authentication and role-based access
- **Load Posting Module**: Enables shippers to create and manage loads
- **Bidding System**: Facilitates bidding between truckers and shippers
- **Location Tracking**: Provides real-time tracking of shipments
- **Admin Dashboard**: Allows oversight and control of system operations

## Database Schema

### Collections

- **Users** (Shippers, Truckers, Admins)
- **Loads**
- **Bids**
- **Transactions**
- **Benefits**

## API Documentation

Endpoints are categorized as follows:

- `/api/auth` - User authentication and authorization
- `/api/loads` - Load management operations
- `/api/bids` - Bidding system endpoints
- `/api/admin` - Administrative controls
- `/api/transactions` - Transaction handling

## Testing

Test scripts included for database connectivity and validation:

- `test-db.js`
- `test-db-alternative.js`
- `test-db-cert.js`
- `test-db-simple.js`

## Contributing

Contributors are encouraged to maintain existing code styles and include test cases for new features.

## License

This project is private and confidential. Unauthorized distribution is prohibited.
