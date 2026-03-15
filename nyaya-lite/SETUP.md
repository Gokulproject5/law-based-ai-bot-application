# 🚀 Nyaya Lite - Quick Setup Guide

This guide will help you get Nyaya Lite up and running in minutes.

---

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - Local installation - [Download](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (free tier) - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- **Git** - [Download](https://git-scm.com/)
- **Modern browser** - Chrome, Edge, or Safari (for voice input)

---

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd nyaya-lite
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment
Create a `.env` file in the `backend` directory:

```env
# For Local MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/nyaya

# For MongoDB Atlas
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nyaya

PORT=5000

# AI Configuration (Optional but Recommended)
AI_PROVIDER=openrouter # options: 'openrouter' or 'gemini'
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=google/gemini-2.0-flash-001
GEMINI_API_KEY=your_gemini_api_key
ENABLE_AI=true
```

#### Seed the Database
This will populate MongoDB with 20+ legal scenarios:

```bash
node utils/seedLaws.js
```

You should see:
```
Mongo connected for seeding...
Cleared existing laws.
Successfully seeded 20 laws.
```

#### Start the Backend Server
```bash
npm start
```

For development (with auto-restart):
```bash
npm run dev
```

The server will run on `http://localhost:5000`

---

### 3. Frontend Setup

Open a **new terminal window** and:

```bash
cd frontend
npm install
```

#### Start the Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173` (or the port shown in terminal)

---

## ✅ Verify Installation

1. **Open your browser** to `http://localhost:5173`
2. **Accept the disclaimer** popup
3. **Try a query**: Type "my phone was stolen" and click Send
4. **Check results**: You should see legal advice with IPC sections
5. **Test voice input**: Click the mic icon (may need HTTPS for production)

---

## 🛠️ Common Issues & Solutions

### Issue: "Module not found: natural"
**Solution:**
```bash
cd backend
npm install natural
```

### Issue: "Cannot connect to MongoDB"
**Solutions:**
- **Local MongoDB:** Make sure MongoDB service is running
  - Windows: Check Services → MongoDB Server
  - Mac: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`
  
- **MongoDB Atlas:** Check your connection string in `.env`

### Issue: "Port 5000 already in use"
**Solution:** Change the port in backend `.env`:
```env
PORT=5001
```
And update the API URL in `frontend/src/App.jsx`:
```javascript
axios.post('http://localhost:5001/api/analyze', { text })
```

### Issue: Voice input not working
**Possible causes:**
- Browser not supported (use Chrome/Edge/Safari)
- Need HTTPS in production
- Microphone permissions not granted

**Solution for development:**
```bash
# Run frontend with HTTPS (if needed)
npm run dev -- --https
```

---

## 📦 Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

This creates a `dist` folder with optimized files. Serve with:
```bash
npm run preview
```

---

## 🌐 Deployment Options

### Backend → Render/Railway
1. Create account on [Render](https://render.com/) or [Railway](https://railway.app/)
2. Connect GitHub repo
3. Set environment variables (MONGO_URI)
4. Deploy!

### Frontend → Vercel/Netlify
1. Create account on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)
2. Connect GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable for backend API URL

---

## 📝 Next Steps

After setup, you can:
- **Add more laws**: Edit `backend/data/lawdb.json` and re-run seed script
- **Customize UI**: Modify components in `frontend/src/components/`
- **Add features**: Check `task.md` for enhancement ideas
- **Deploy**: Follow deployment guide above

---

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review the [Implementation Plan](implementation_plan.md)
- Open an issue on GitHub

---

**Happy Coding! ⚖️**
