# Montefiore Pizza Server

Backend server for Montefiore Pizza Business built with Express.js, TypeScript, and MongoDB.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Auth**: JWT & bcryptjs (Cookies)
- **File Storage**: Cloudinary
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account (for image storage)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - MongoDB Atlas connection string
   - JWT secret key
   - Cloudinary credentials

### Development

Run the development server:

```bash
npm run dev
```

The server will start on `http://localhost:8000` (or the PORT specified in `.env`).

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
src/
├── app.ts              # Express app entry point
├── routes/             # Route definitions
│   ├── auth/          # Authentication routes
│   ├── menu/          # Menu routes
│   ├── orders/        # Order routes
│   └── settings/      # Settings routes
├── controllers/        # Route controllers
├── models/            # Mongoose models
├── middleware/        # Express middleware
├── utils/             # Utility functions
└── types/             # TypeScript type definitions
```

## API Endpoints

### Health Check

- `GET /health` - Server health check

More endpoints will be added as the project progresses.
