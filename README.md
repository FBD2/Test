# 🎙️ Real-Time Voice Call System

A fully functional voice call application similar to Discord/Zoom, built with WebRTC, Node.js, and Socket.IO. Supports real-time voice communication across different devices and networks.

## ✨ Features

- **Real-time Voice Calls**: High-quality audio communication using WebRTC
- **Multi-User Support**: Multiple participants can join the same room
- **Cross-Device Compatible**: Works on desktop, mobile, and tablets
- **NAT Traversal**: Uses STUN servers for connecting across different networks
- **Modern UI**: Clean, responsive interface with visual indicators
- **Room System**: Create or join rooms with unique IDs
- **Audio Controls**: Mute/unmute functionality
- **Speaking Indicators**: Visual feedback when someone is speaking
- **Connection Status**: Real-time connection monitoring

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Microphone access

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Cloudflare Tunnel (for global access):
```bash
npm install -g cloudflared
```

### Starting the Application

#### Option 1: Using the Launcher (Easiest)
Just double-click: **`start-voice-call.bat`**

This will:
- Start the server
- Start the Cloudflare tunnel
- Show you the public URL to share

#### Option 2: Manual Start

**Terminal 1 - Start Server:**
```bash
npm start
```

**Terminal 2 - Start Global Tunnel:**
```bash
cloudflared tunnel --url http://localhost:3000
```

Copy the URL from Terminal 2 (e.g., `https://xxx-yyy.trycloudflare.com`) and share it!

### For Development (with auto-restart)

```bash
npm run dev
```

## 📱 Connecting from Other Devices

To connect from other devices on the same network:

1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in PowerShell, look for IPv4 Address
   - **Mac/Linux**: Run `ifconfig` or `ip addr`

2. On other devices, navigate to:
```
http://[YOUR-IP]:3000
```
Example: `http://192.168.1.100:3000`

## 🎯 How to Use

1. **Enter Your Name**: Start by entering your name on the login screen

2. **Allow Microphone Access**: Grant microphone permissions when prompted

3. **Create or Join a Room**:
   - **Create Room**: Enter a room name or leave blank for auto-generation
   - **Join Room**: Enter an existing room ID and click "Join Room"

4. **Share Room ID**: Copy and share the room ID with others to invite them

5. **Voice Call Controls**:
   - 🎤 **Mute/Unmute**: Toggle your microphone
   - 📞 **Leave Call**: Exit the current call

## 🏗️ Architecture

### Backend (Node.js)
- **Express**: Web server
- **Socket.IO**: Real-time signaling
- **Room Management**: Handles user sessions and rooms

### Frontend
- **WebRTC**: Peer-to-peer audio streaming
- **Socket.IO Client**: Signaling and communication
- **Vanilla JavaScript**: No framework dependencies
- **Responsive CSS**: Works on all screen sizes

### Technology Stack

```
┌─────────────────────────────────────┐
│         User Browser                │
│  ┌──────────────────────────────┐  │
│  │  WebRTC (Audio Stream)       │  │
│  │  Socket.IO (Signaling)       │  │
│  │  HTML/CSS/JavaScript         │  │
│  └──────────────────────────────┘  │
└─────────────────┬───────────────────┘
                  │
                  │ WebSocket + STUN
                  │
┌─────────────────▼───────────────────┐
│      Node.js Server (port 3000)     │
│  ┌──────────────────────────────┐  │
│  │  Express (HTTP Server)       │  │
│  │  Socket.IO (Signaling)       │  │
│  │  Room Management             │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🔧 Configuration

### Port Configuration
Edit `server.js` to change the port:
```javascript
const PORT = process.env.PORT || 3000;
```

### STUN Servers
STUN servers are configured in `public/app.js`. The app uses Google's public STUN servers by default.

## 🌐 Network Requirements

- **Local Network**: Works out of the box on the same WiFi/network
- **Different Networks**: STUN servers handle NAT traversal for most cases
- **Corporate Networks**: May require TURN server for strict firewalls

## 📝 API Endpoints

### HTTP Endpoints
- `GET /` - Serves the main application
- `GET /api/server-info` - Returns server statistics

### Socket.IO Events

#### Client → Server
- `register` - Register username
- `create-room` - Create a new room
- `join-room` - Join existing room
- `offer` - Send WebRTC offer
- `answer` - Send WebRTC answer
- `ice-candidate` - Send ICE candidate
- `toggle-audio` - Update audio status
- `leave-room` - Leave current room

#### Server → Client
- `room-created` - Room creation confirmation
- `room-joined` - Room join confirmation
- `user-joined` - New user joined
- `user-left` - User left the room
- `offer` - Receive WebRTC offer
- `answer` - Receive WebRTC answer
- `ice-candidate` - Receive ICE candidate
- `user-audio-toggled` - User muted/unmuted

## 🔒 Security Considerations

- The current implementation is for development/demo purposes
- For production use, consider adding:
  - User authentication
  - Room passwords
  - TURN server for better connectivity
  - SSL/TLS encryption (HTTPS)
  - Rate limiting
  - Input validation

## 🐛 Troubleshooting

### No Audio
- Check microphone permissions in browser
- Ensure microphone is not muted in system settings
- Try refreshing the page

### Cannot Connect
- Check if server is running
- Verify firewall settings
- Ensure correct IP address and port

### Poor Audio Quality
- Check network connection
- Close other bandwidth-intensive applications
- Try using a wired connection

## 🚀 Deployment

### For Production Deployment:

1. Set environment variables:
```bash
export PORT=3000
export NODE_ENV=production
```

2. Use a process manager (PM2):
```bash
npm install -g pm2
pm2 start server.js --name voice-call-app
```

3. Use a reverse proxy (Nginx) for SSL/TLS
4. Consider using a TURN server for better connectivity

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📞 Support

For issues or questions, please open an issue on the GitHub repository.

---

**Made with ❤️ using WebRTC and Node.js**