const express = require('express');
require('dotenv').config()


const connectDB = require('./src/config/db');
connectDB();

const app = express();

//Middleware
app.use(express.json());

const userRouter = require('./src/routes/userRoutes')
const financeRoutes = require('./src/routes/financeRoutes');

app.use('/api', userRouter)
app.use('/api/finances', financeRoutes);

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
