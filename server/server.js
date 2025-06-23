import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectdb from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectdb();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS Setup
const allowedOrigins = [
  "http://localhost:5173",                  // for development
  process.env.CLIENT_URL                    // for production (from .env)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true // allow cookies to be sent
}));

// Test route
app.get('/', (req, res) => {
  res.send('Hello from server');
});

// Route handlers
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
