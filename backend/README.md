# Ahauros AI Backend API

Node.js + Express backend with JWT authentication and email confirmation.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ahauros-ai?retryWrites=true&w=majority

# JWT Secret (generate a strong secret key)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Email Configuration (Gmail)
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_app_password_here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

### 2. MongoDB Setup

1. Create a MongoDB Atlas account at https://cloud.mongodb.com/
2. Create a new cluster
3. Create a database user
4. Get your connection string and update `MONGO_URI`

### 3. Gmail Setup (for email verification)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /auth/signup` - Create new user account
- `GET /auth/verify?token=...` - Verify email address
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (requires JWT token)

### Request/Response Examples

#### Signup
```bash
POST /auth/signup
Content-Type: application/json

{
  "company": "My Company",
  "regNumber": "12345678",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Verify Email
```bash
GET /auth/verify?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Frontend Integration

Update your frontend `authService.js` to use the backend API:

```javascript
const API_URL = "http://localhost:5000"; // Backend URL
```

## Security Features

- Password hashing with bcrypt
- JWT tokens with expiration
- Email verification required before login
- CORS enabled for frontend integration
- Input validation and error handling

## Development

The server runs on port 5000 by default. Make sure your frontend is configured to connect to `http://localhost:5000`.

