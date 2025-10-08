const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.static('public'));

// Store active rooms and users
const rooms = new Map();
const users = new Map();

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // Handle user joining with username
    socket.on('register', (username) => {
        users.set(socket.id, {
            id: socket.id,
            username: username
        });
        console.log(`User registered: ${username} (${socket.id})`);
    });

    // Handle creating a new room
    socket.on('create-room', (roomId) => {
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(socket.id);
        socket.join(roomId);
        
        const user = users.get(socket.id);
        console.log(`Room created: ${roomId} by ${user?.username || socket.id}`);
        
        socket.emit('room-created', { roomId, userId: socket.id });
    });

    // Handle joining an existing room
    socket.on('join-room', (roomId) => {
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }

        const room = rooms.get(roomId);
        const user = users.get(socket.id);
        
        // Notify existing users in the room
        socket.to(roomId).emit('user-joined', {
            userId: socket.id,
            username: user?.username || 'Anonymous'
        });

        // Add user to room
        room.add(socket.id);
        socket.join(roomId);

        // Send list of existing users to the new joiner
        const roomUsers = Array.from(room)
            .filter(id => id !== socket.id)
            .map(id => ({
                userId: id,
                username: users.get(id)?.username || 'Anonymous'
            }));

        console.log(`User ${user?.username || socket.id} joined room: ${roomId}`);
        
        socket.emit('room-joined', {
            roomId,
            userId: socket.id,
            users: roomUsers
        });
    });

    // Handle WebRTC signaling - offer
    socket.on('offer', ({ offer, targetUserId, roomId }) => {
        const user = users.get(socket.id);
        console.log(`Offer from ${user?.username || socket.id} to ${targetUserId}`);
        
        io.to(targetUserId).emit('offer', {
            offer,
            fromUserId: socket.id,
            fromUsername: user?.username || 'Anonymous'
        });
    });

    // Handle WebRTC signaling - answer
    socket.on('answer', ({ answer, targetUserId }) => {
        const user = users.get(socket.id);
        console.log(`Answer from ${user?.username || socket.id} to ${targetUserId}`);
        
        io.to(targetUserId).emit('answer', {
            answer,
            fromUserId: socket.id
        });
    });

    // Handle WebRTC signaling - ICE candidate
    socket.on('ice-candidate', ({ candidate, targetUserId }) => {
        io.to(targetUserId).emit('ice-candidate', {
            candidate,
            fromUserId: socket.id
        });
    });

    // Handle mute/unmute status
    socket.on('toggle-audio', ({ roomId, isMuted }) => {
        const user = users.get(socket.id);
        socket.to(roomId).emit('user-audio-toggled', {
            userId: socket.id,
            username: user?.username || 'Anonymous',
            isMuted
        });
    });

    // Handle leaving room
    socket.on('leave-room', (roomId) => {
        handleLeaveRoom(socket, roomId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        // Remove user from all rooms
        rooms.forEach((room, roomId) => {
            if (room.has(socket.id)) {
                handleLeaveRoom(socket, roomId);
            }
        });

        users.delete(socket.id);
    });
});

// Helper function to handle leaving a room
function handleLeaveRoom(socket, roomId) {
    const room = rooms.get(roomId);
    if (room) {
        room.delete(socket.id);
        
        if (room.size === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted (empty)`);
        } else {
            const user = users.get(socket.id);
            socket.to(roomId).emit('user-left', {
                userId: socket.id,
                username: user?.username || 'Anonymous'
            });
        }
    }
    
    socket.leave(roomId);
}

// Get server info
app.get('/api/server-info', (req, res) => {
    res.json({
        activeRooms: rooms.size,
        activeUsers: users.size,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`\n🎙️  Voice Call Server Running`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://[your-ip]:${PORT}`);
    console.log(`\nTo connect from other devices, use your computer's IP address\n`);
});
