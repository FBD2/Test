# ⚡ QUICK START - Voice Call System

## 🎯 Every Time You Want to Use It:

### Method 1: Double-Click (EASIEST!)
```
📁 Find file: start-voice-call.bat
👆 Double-click it
✅ Done!
```

Two windows will open:
1. **Server Window** - Shows "Voice Call Server Running"
2. **Tunnel Window** - Shows your public URL

**Copy the URL from the Tunnel window and share it!**

---

### Method 2: Manual Commands

Open **TWO** terminals:

**Terminal 1:**
```bash
npm start
```
✅ Keep open

**Terminal 2:**
```bash
cloudflared tunnel --url http://localhost:3000
```
✅ Keep open
✅ Copy the URL it shows

---

## 🌍 What You'll See:

### Terminal 1 (Server):
```
🎙️  Voice Call Server Running
📡 Server: http://localhost:3000
🌐 Network: http://[your-ip]:3000
```

### Terminal 2 (Tunnel):
```
+-----------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                |
|  https://your-random-url.trycloudflare.com                                       |
+-----------------------------------------------------------------------------------+
```

**👉 Share this URL with everyone!**

---

## ✅ Summary

**TO START:**
1. Run `npm start` (or double-click `start-voice-call.bat`)
2. Run `cloudflared tunnel --url http://localhost:3000`
3. Copy the Cloudflare URL
4. Share with friends

**TO USE:**
1. Everyone opens the Cloudflare URL
2. Everyone joins the same room ID (e.g., "11")
3. Talk! 🎙️

**TO STOP:**
- Close both terminal windows (or press Ctrl+C)

---

## 💡 Important

⚠️ **The URL changes every time** you restart Cloudflare tunnel
⚠️ **Both terminals must stay open** while using the app
⚠️ **If you restart your computer**, you need to run the commands again

✅ **The app works globally** - anyone anywhere can join
✅ **No password, no signup needed**
✅ **Free to use**

---

## 🎉 That's It!

Just remember:
- **Start:** Double-click `start-voice-call.bat`
- **Share:** The Cloudflare URL
- **Stop:** Close the windows

Easy! 🚀
