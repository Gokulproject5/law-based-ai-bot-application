# 🚀 Quick Start Without MongoDB

## Problem
MongoDB is not installed or not running, causing the backend to fail.

## Solution: Run Without Database (Testing Mode)

### Step 1: Backup Original Files
The original files are preserved. We'll use test versions.

### Step 2: Use JSON File Instead

Run this command to start the backend **without MongoDB**:

```powershell
# Stop the current backend (Ctrl+C in the backend terminal)

# Then run:
cd d:\final-year-project\law-based-ai-bot-application\nyaya-lite\backend
node server-test.js
```

### Step 3: Test the Application

The frontend is already running at http://localhost:5173

Try these queries:
1. "My phone was stolen"
2. "What evidence do I need?"
3. "I'm scared and need help"

---

## Alternative: Install MongoDB (For Full Features)

If you want the full database features:

### Option A: MongoDB Community Server
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will start automatically
4. Restart the backend with `npm start`

### Option B: MongoDB Atlas (Cloud - Free)
1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Get connection string
4. Add to `.env`: `MONGO_URI=your_connection_string`
5. Restart backend

---

## Current Status

✅ Frontend: Running on http://localhost:5173
⚠️  Backend: Needs restart without MongoDB
📝 Using: In-memory JSON database (50+ laws)

---

**For now, let's create a simple test server...**
