Fullstack Transaction Management System
This is a comprehensive fullstack application designed for managing personal or business transactions. It features a secure backend API built with Node.js, Express, and MongoDB, and a modern, responsive frontend built with React, Vite, and shadcn/ui.

GitHub Repository: https://github.com/lalitakhatri/transaction-manager

✨ Features Implemented
Authentication: Secure user registration and login using JSON Web Tokens (JWT).

CRUD Operations: Full Create, Read, Update, Search and Delete functionality for transactions.

Advanced Filtering & Sorting:

Live search by description, payee, or category.

Sort transactions by date or amount (ascending/descending).

Filter transactions within a specific date range.

Pagination: Efficient backend-driven pagination for handling large datasets.

Modern UI: A clean and responsive user interface built with TailwindCSS and shadcn/ui.

Currency Formatting: Displays monetary values in Indian Rupees (₹).

Bonus Features
Role-Based Access Control: Differentiates between user and admin roles. Admins can view and manage all transactions on the platform.

Dark Mode: A theme toggle allows users to switch between light and dark modes.

Reusable Hooks: Custom React hooks (useAuth, useTransactions) for clean and maintainable state management.

🛠️ Tech Stack
Backend: Node.js, Express.js, MongoDB with Mongoose, JWT, bcrypt, dotenv.

Frontend: React, Vite, TypeScript, TailwindCSS, shadcn/ui, TanStack Table, React Hook Form, Zod.

🚀 Setup and Installation
1. Clone the Repository
git clone https://github.com/lalitakhatri/transaction-manager.git
cd transaction-manager

2. Backend Setup
Navigate to the backend directory and set up the environment variables.

cd backend

Create a .env file in the backend directory.

Example backend/.env file:

# Server Port
PORT=5000

# Your MongoDB connection string
# --- For local MongoDB ---
# MONGO_URI=mongodb://localhost:27017/transactiondb
# --- For MongoDB Atlas ---
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname

# A strong, secret key for signing JWTs
JWT_SECRET=a-very-strong-and-secret-key-for-jwt

Install backend dependencies:

npm install

3. Frontend Setup
In a new terminal, navigate to the frontend directory.

cd frontend

Create a .env file in the frontend directory.

Example frontend/.env file:

# The URL of your running backend server
VITE_API_BASE_URL=http://localhost:5000

Install frontend dependencies:

npm install

🏃 How to Run the Application
You must run both the backend and frontend servers simultaneously in two separate terminals.

Terminal 1: Start the Backend Server

# Navigate to the backend directory
cd backend

# Start the server in development mode (with auto-reload)
npm run dev

Your backend API will be running at http://localhost:5000.

Terminal 2: Start the Frontend Server

# Navigate to the frontend directory
cd frontend

# Start the Vite development server
npm run dev

Your frontend application will be available at http://localhost:5173. Open this URL in your browser.

👥 User Information
For testing purposes, two users have been created. First, register them using Postman, then you can log in via the UI.

Regular User:

Username: user1

Password: password@123

Admin User:

Username: user2

Password: password@456

How to Make user2 an Admin
After registering both user1 and user2 via Postman, you need to manually change the role of user2 in your MongoDB database.

Open your MongoDB database viewer (like MongoDB Compass or the Atlas UI).

Navigate to your database (e.g., transactiondb).

Open the users collection.

Find the document where the username is user2.

Edit this document and change the role field from "user" to "admin".

Save the change.

Now, when user2 logs in, they will have admin privileges and will be able to see all transactions from all users.