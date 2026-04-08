import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from '../config/db.js';
import authRoutes from '../routes/auth.routes.js'
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import userRoutes from '../routes/user.routes.js';
import serviceRoutes from '../routes/service.routes.js';
import bookingRoutes from '../routes/booking.routes.js';
import reviewRoutes from '../routes/review.routes.js';
import providerRoutes from '../routes/provider.routes.js';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware.js';


const app = express();
app.set('trust proxy', 1);

const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX || (isProduction ? '20' : '1000'), 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.parseInt(process.env.API_RATE_LIMIT_MAX || (isProduction ? '300' : '5000'), 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(helmet());
app.use('/api/auth', authRateLimit);
app.use('/api', apiRateLimit);

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
connectDB();

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/providers', providerRoutes);
// Example route
app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
