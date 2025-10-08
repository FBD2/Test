// Global variables
let socket;
let localStream;
let peerConnections = new Map();
let currentUsername = '';
let currentRoomId = '';
let isMuted = false;

// ICE servers for NAT traversal
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
    ]
};

// Initialize socket connection
function initSocket() {
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to server');
        updateConnectionStatus(true);
        if (currentUsername) {
            socket.emit('register', currentUsername);
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        updateConnectionStatus(false);
    });

    // Room events
    socket.on('room-created', ({ roomId, userId }) => {
        console.log('Room created:', roomId);
        currentRoomId = roomId;
        showRoomInfo(roomId);
    });

    socket.on('room-joined', async ({ roomId, userId, users }) => {
        console.log('Joined room:', roomId);
        currentRoomId = roomId;
        await enterCallScreen(roomId);
        
        // Create peer connections for existing users
        for (const user of users) {
            await createPeerConnection(user.userId, user.username, true);
        }
    });

    socket.on('user-joined', async ({ userId, username }) => {
        console.log('User joined:', username);
        addParticipant(userId, username);
        // Existing users initiate connection to the new user
        await createPeerConnection(userId, username, true);
    });

    socket.on('user-left', ({ userId, username }) => {
        console.log('User left:', username);
        removeParticipant(userId);
        closePeerConnection(userId);
    });

    // WebRTC signaling
    socket.on('offer', async ({ offer, fromUserId, fromUsername }) => {
        console.log('Received offer from:', fromUsername);
        await handleOffer(offer, fromUserId, fromUsername);
    });

    socket.on('answer', async ({ answer, fromUserId }) => {
        console.log('Received answer from:', fromUserId);
        await handleAnswer(answer, fromUserId);
    });

    socket.on('ice-candidate', async ({ candidate, fromUserId }) => {
        await handleIceCandidate(candidate, fromUserId);
    });

    socket.on('user-audio-toggled', ({ userId, username, isMuted }) => {
        updateParticipantStatus(userId, isMuted);
    });
}

// Set username and proceed
async function setUsername() {
    const usernameInput = document.getElementById('username-input');
    const username = usernameInput.value.trim();
    
    if (!username) {
        alert('Please enter your name');
        return;
    }

    currentUsername = username;
    document.getElementById('display-username').textContent = username;
    
    initSocket();
    
    // Request microphone access
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
        console.log('Microphone access granted');
        console.log('Local audio tracks:', localStream.getAudioTracks());
        
        // Test local stream
        localStream.getAudioTracks().forEach(track => {
            console.log('Audio track enabled:', track.enabled);
            console.log('Audio track settings:', track.getSettings());
        });
        
        switchScreen('login-screen', 'main-screen');
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('❌ MICROPHONE ACCESS DENIED!\n\nPlease:\n1. Click the lock icon in the address bar\n2. Allow microphone access\n3. Refresh the page and try again');
    }
}

// Create a new room
function createRoom() {
    const roomIdInput = document.getElementById('room-id-input');
    let roomId = roomIdInput.value.trim();
    
    if (!roomId) {
        roomId = generateRoomId();
        roomIdInput.value = roomId;
    }
    
    socket.emit('create-room', roomId);
}

// Join an existing room
async function joinRoom() {
    const roomIdInput = document.getElementById('room-id-input');
    const roomId = roomIdInput.value.trim();
    
    if (!roomId) {
        alert('Please enter a room ID');
        return;
    }
    
    socket.emit('join-room', roomId);
}

// Enter call screen
async function enterCallScreen(roomId) {
    currentRoomId = roomId;
    document.getElementById('call-room-id').textContent = roomId;
    document.getElementById('call-status').textContent = 'Connected';
    
    // Add self to participants
    addParticipant('self', currentUsername, true);
    
    switchScreen('main-screen', 'call-screen');
}

// Show room info after creation
function showRoomInfo(roomId) {
    document.getElementById('current-room-id').textContent = roomId;
    document.getElementById('room-info').classList.remove('hidden');
}

// Create peer connection
async function createPeerConnection(userId, username, initiator = false) {
    if (peerConnections.has(userId)) {
        console.log('Peer connection already exists for:', userId);
        return;
    }

    const peerConnection = new RTCPeerConnection(iceServers);
    peerConnections.set(userId, peerConnection);

    // Add local stream
    if (localStream) {
        localStream.getTracks().forEach(track => {
            console.log(`Adding ${track.kind} track to peer ${userId}:`, track.enabled);
            peerConnection.addTrack(track, localStream);
        });
    } else {
        console.error('❌ No local stream available! Microphone not enabled.');
    }

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
        console.log('✅ Received remote track from:', userId);
        console.log('Track kind:', event.track.kind);
        console.log('Track enabled:', event.track.enabled);
        const remoteStream = event.streams[0];
        console.log('Remote stream tracks:', remoteStream.getTracks());
        playRemoteStream(userId, remoteStream);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                candidate: event.candidate,
                targetUserId: userId
            });
        }
    };

    // Handle connection state
    peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state with ${userId}:`, peerConnection.connectionState);
        if (peerConnection.connectionState === 'disconnected' || 
            peerConnection.connectionState === 'failed') {
            closePeerConnection(userId);
        }
    };

    // If initiator, create and send offer
    if (initiator) {
        try {
            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false
            });
            await peerConnection.setLocalDescription(offer);
            
            console.log('📤 Sending offer to:', userId);
            socket.emit('offer', {
                offer: offer,
                targetUserId: userId,
                roomId: currentRoomId
            });
        } catch (error) {
            console.error('❌ Error creating offer:', error);
        }
    }
}

// Handle received offer
async function handleOffer(offer, fromUserId, fromUsername) {
    console.log('📥 Received offer from:', fromUsername);
    await createPeerConnection(fromUserId, fromUsername, false);
    
    const peerConnection = peerConnections.get(fromUserId);
    
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: false
        });
        await peerConnection.setLocalDescription(answer);
        
        console.log('📤 Sending answer to:', fromUsername);
        socket.emit('answer', {
            answer: answer,
            targetUserId: fromUserId
        });
        
        addParticipant(fromUserId, fromUsername);
    } catch (error) {
        console.error('❌ Error handling offer:', error);
    }
}

// Handle received answer
async function handleAnswer(answer, fromUserId) {
    console.log('📥 Received answer from:', fromUserId);
    const peerConnection = peerConnections.get(fromUserId);
    
    if (peerConnection) {
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('✅ Answer processed successfully');
        } catch (error) {
            console.error('❌ Error handling answer:', error);
        }
    } else {
        console.error('❌ No peer connection found for:', fromUserId);
    }
}

// Handle ICE candidate
async function handleIceCandidate(candidate, fromUserId) {
    const peerConnection = peerConnections.get(fromUserId);
    
    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }
}

// Play remote stream
function playRemoteStream(userId, stream) {
    const audioContainer = document.getElementById('audio-container');
    let audioElement = document.getElementById(`audio-${userId}`);
    
    if (!audioElement) {
        audioElement = document.createElement('audio');
        audioElement.id = `audio-${userId}`;
        audioElement.autoplay = true;
        audioContainer.appendChild(audioElement);
    }
    
    audioElement.srcObject = stream;
    
    // Add visual feedback for speaking
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);
    
    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    
    function detectSpeaking() {
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        const participantCard = document.getElementById(`participant-${userId}`);
        if (participantCard) {
            if (average > 30) {
                participantCard.classList.add('speaking');
            } else {
                participantCard.classList.remove('speaking');
            }
        }
        
        requestAnimationFrame(detectSpeaking);
    }
    
    detectSpeaking();
}

// Close peer connection
function closePeerConnection(userId) {
    const peerConnection = peerConnections.get(userId);
    
    if (peerConnection) {
        peerConnection.close();
        peerConnections.delete(userId);
    }
    
    // Remove audio element
    const audioElement = document.getElementById(`audio-${userId}`);
    if (audioElement) {
        audioElement.remove();
    }
}

// Toggle mute
function toggleMute() {
    isMuted = !isMuted;
    
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
    });
    
    const muteBtn = document.getElementById('mute-btn');
    if (isMuted) {
        muteBtn.classList.add('muted');
        muteBtn.querySelector('.icon').textContent = '🔇';
        muteBtn.querySelector('.label').textContent = 'Unmute';
    } else {
        muteBtn.classList.remove('muted');
        muteBtn.querySelector('.icon').textContent = '🎤';
        muteBtn.querySelector('.label').textContent = 'Mute';
    }
    
    // Notify others
    socket.emit('toggle-audio', {
        roomId: currentRoomId,
        isMuted: isMuted
    });
    
    // Update self participant card
    updateParticipantStatus('self', isMuted);
}

// Leave call
function leaveCall() {
    if (confirm('Are you sure you want to leave the call?')) {
        // Close all peer connections
        peerConnections.forEach((pc, userId) => {
            closePeerConnection(userId);
        });
        
        // Notify server
        socket.emit('leave-room', currentRoomId);
        
        // Reset state
        currentRoomId = '';
        document.getElementById('participants-grid').innerHTML = '';
        document.getElementById('room-info').classList.add('hidden');
        
        switchScreen('call-screen', 'main-screen');
    }
}

// UI Helper Functions
function addParticipant(userId, username, isSelf = false) {
    const participantsGrid = document.getElementById('participants-grid');
    
    if (document.getElementById(`participant-${userId}`)) {
        return; // Already added
    }
    
    const participantCard = document.createElement('div');
    participantCard.id = `participant-${userId}`;
    participantCard.className = 'participant-card';
    participantCard.innerHTML = `
        <div class="participant-avatar">
            ${username.charAt(0).toUpperCase()}
        </div>
        <div class="participant-name">${username}${isSelf ? ' (You)' : ''}</div>
        <div class="participant-status" id="status-${userId}">Active</div>
        <div class="audio-indicator" id="audio-${userId}">🎤</div>
    `;
    
    participantsGrid.appendChild(participantCard);
}

function removeParticipant(userId) {
    const participantCard = document.getElementById(`participant-${userId}`);
    if (participantCard) {
        participantCard.remove();
    }
}

function updateParticipantStatus(userId, isMuted) {
    const statusElement = document.getElementById(`status-${userId}`);
    const audioIndicator = document.getElementById(`audio-${userId}`);
    const participantCard = document.getElementById(`participant-${userId}`);
    
    if (statusElement && audioIndicator && participantCard) {
        if (isMuted) {
            statusElement.textContent = 'Muted';
            statusElement.classList.add('muted');
            audioIndicator.textContent = '🔇';
            participantCard.classList.add('muted');
        } else {
            statusElement.textContent = 'Active';
            statusElement.classList.remove('muted');
            audioIndicator.textContent = '🎤';
            participantCard.classList.remove('muted');
        }
    }
}

function switchScreen(fromScreen, toScreen) {
    document.getElementById(fromScreen).classList.remove('active');
    document.getElementById(toScreen).classList.add('active');
}

function updateConnectionStatus(connected) {
    const statusIndicator = document.getElementById('connection-status');
    const statusText = statusIndicator.querySelector('.status-text');
    
    if (connected) {
        statusIndicator.classList.remove('disconnected');
        statusText.textContent = 'Connected';
    } else {
        statusIndicator.classList.add('disconnected');
        statusText.textContent = 'Disconnected';
    }
}

function generateRoomId() {
    return 'room-' + Math.random().toString(36).substr(2, 9);
}

function copyRoomId() {
    const roomId = document.getElementById('current-room-id').textContent;
    navigator.clipboard.writeText(roomId).then(() => {
        alert('Room ID copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Handle Enter key for inputs
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') setUsername();
    });
    
    document.getElementById('room-id-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinRoom();
    });
});
