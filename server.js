require('dotenv').config();
const express = require('express');
const app = express();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes)

app.listen(3000, () => console.log('Server running on port 3000'));