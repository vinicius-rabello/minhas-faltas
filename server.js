require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const homeRoutes = require('./routes/homeRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const eventRoutes = require('./routes/eventRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/home', homeRoutes);
app.use('/subjects', subjectRoutes);
app.use('/events', eventRoutes);
app.use('/calendar', calendarRoutes);
app.use('/summary', summaryRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index/index.html'));
});

app.listen(3000, () => console.log('Server running on port 3000'));