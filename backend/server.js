const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
module.exports.io = io; // Export the socket.io instance

app.use(express.json());
app.use(cors());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('joinEvent', (eventId) => {
        socket.join(eventId);
        console.log(`User joined event ${eventId}`);
    });

    socket.on('attendEvent', (event) => {
        io.to(event._id).emit('eventUpdated', event);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
