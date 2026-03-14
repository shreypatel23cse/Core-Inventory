import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Roots
app.get('/', (req, res) => {
  res.send('🚀 CoreInventory API is running. Access the dashboard at http://localhost:3000');
});

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 CoreInventory Server running on http://localhost:${PORT}`);
});
