# 🚀 How to Start Your Voice Call System

## Every Time You Want to Use It:

You need to run **2 commands** in **2 separate terminals**:

### Terminal 1: Start the Server
```bash
npm start
```
This starts your voice call server on localhost:3000

### Terminal 2: Start the Tunnel
```bash
cloudflared tunnel --url http://localhost:3000
```
This creates a public URL that anyone can access

---

## 📋 Step-by-Step Instructions

### Starting Fresh (After Restart):

1. **Open Terminal 1** (PowerShell):
   ```bash
   cd "C:\Users\FBDGA\OneDrive\Documents\GitHub\Test"
   npm start
   ```
   ✅ Leave this terminal running

2. **Open Terminal 2** (PowerShell - New Terminal):
   ```bash
   cd "C:\Users\FBDGA\OneDrive\Documents\GitHub\Test"
   cloudflared tunnel --url http://localhost:3000
   ```
   ✅ Leave this terminal running
   ✅ Copy the URL it shows (like: https://xxx-yyy-zzz.trycloudflare.com)

3. **Share the URL** with friends and start calling!

---

## ⚡ Quick Start Script (Easiest Way)

I can create a script that starts both automatically!

### Option 1: PowerShell Script
Create a file `start-voice-call.ps1`:
```powershell
# Start server in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"

# Wait for server to start
Start-Sleep -Seconds 3

# Start cloudflare tunnel
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; cloudflared tunnel --url http://localhost:3000"

Write-Host "Voice Call System Starting..."
Write-Host "Check the Cloudflare tunnel window for your public URL!"
```

Run it with:
```bash
.\start-voice-call.ps1
```

### Option 2: Batch File (.bat)
Create `start-voice-call.bat`:
```batch
@echo off
start "Voice Call Server" cmd /k "npm start"
timeout /t 3
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:3000"
echo.
echo Voice Call System Starting!
echo Check the Cloudflare tunnel window for your public URL
```

Double-click the file to start!

---

## 🛑 Stopping the System

To stop everything:
1. Close both terminal windows
2. Or press `Ctrl+C` in each terminal

---

## 💡 Important Notes

### The URL Changes Each Time!
⚠️ Every time you restart cloudflared, you get a **new URL**
- Example: https://abc-123.trycloudflare.com (first time)
- Example: https://xyz-789.trycloudflare.com (next time)

You need to **share the new URL** with friends each time.

### Want a Permanent URL?
To get a URL that never changes, you need to:
- Deploy to a hosting service (Heroku, Railway, Render)
- Or use ngrok with authentication
- Or setup Cloudflare Tunnel with account

---

## 🎯 Summary

**Every time you want to use the voice call system:**

1. Terminal 1: `npm start` ← Keep running
2. Terminal 2: `cloudflared tunnel --url http://localhost:3000` ← Keep running
3. Copy the URL from Terminal 2
4. Share with friends
5. Both join same room ID
6. Talk! 🎙️

**That's it!**

---

## 🔄 Auto-Start on Windows Boot (Advanced)

If you want it to start automatically when Windows starts:

1. Create the batch file above
2. Press `Win+R`, type `shell:startup`
3. Create a shortcut to your batch file there

⚠️ Not recommended as it will run in background always.

---

## ✅ Best Practice

**Just remember these 2 commands:**
```bash
npm start                                        # Terminal 1
cloudflared tunnel --url http://localhost:3000   # Terminal 2
```

Keep both terminals open while using the app!
