# 🚀 Quick Setup Guide - Enhanced Chatbot

## Prerequisites
- Node.js (v16+)
- MongoDB (running locally or Atlas)
- Gemini API Key (recommended for best experience)

## Step 1: Get Gemini API Key (Free)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

## Step 2: Configure Backend

1. Navigate to backend folder:
```bash
cd d:\final-year-project\law-based-ai-bot-application\nyaya-lite\backend
```

2. Create `.env` file:
```bash
echo GEMINI_API_KEY=your_api_key_here > .env
echo MONGO_URI=mongodb://127.0.0.1:27017/nyaya >> .env
echo PORT=5000 >> .env
```

3. Install dependencies:
```bash
npm install
```

4. Seed the database:
```bash
node utils/seedLaws.js
```

5. Start the backend:
```bash
npm start
```

## Step 3: Start Frontend

1. Open a new terminal
2. Navigate to frontend folder:
```bash
cd d:\final-year-project\law-based-ai-bot-application\nyaya-lite\frontend
```

3. Install dependencies (if not already done):
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

## Step 4: Test the Enhanced Features

1. Open browser to: http://localhost:5173

2. Try these test queries:

### Test 1: Initial Query
```
"My phone was stolen yesterday from a cafe"
```
**Expected**: Detailed analysis with confidence score, steps, and follow-up suggestions

### Test 2: Follow-up Question
Click one of the suggested questions or type:
```
"What evidence do I need to collect?"
```
**Expected**: Response references the theft context from previous message

### Test 3: Emotional Detection
```
"I'm really scared and don't know what to do, please help urgently"
```
**Expected**: Empathetic tone, emotional support message, urgent priority steps

### Test 4: Conversational
```
"Hello, how can you help me?"
```
**Expected**: Friendly greeting explaining the service

## Step 5: Verify Features

Check that you see:
- ✅ Confidence score bar (e.g., "Confidence: 85%")
- ✅ Emotional support message (purple card with 💜)
- ✅ Quick reply suggestions (clickable buttons)
- ✅ "Gemini AI" badge on responses
- ✅ Toast notifications ("AI analysis complete!")
- ✅ Step-by-step action plan with priorities

## Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
# Windows:
net start MongoDB

# Check if port 5000 is available
netstat -ano | findstr :5000
```

### Frontend won't connect
```bash
# Verify backend is running on http://localhost:5000
# Check browser console for errors
```

### No AI responses
```bash
# Verify GEMINI_API_KEY in backend/.env
# Check backend terminal for "✅ Gemini AI Response Received"
# If you see "❌ FAILED/NULL", check API key validity
```

### Session not working
```bash
# Clear browser cache and sessionStorage
# Open DevTools → Application → Session Storage → Clear
```

## Quick Commands

### Start Everything (PowerShell)
```powershell
# Terminal 1 - Backend
cd d:\final-year-project\law-based-ai-bot-application\nyaya-lite\backend
npm start

# Terminal 2 - Frontend
cd d:\final-year-project\law-based-ai-bot-application\nyaya-lite\frontend
npm run dev
```

## What's Different?

### Before Enhancement:
- ❌ No conversation memory
- ❌ No emotional awareness
- ❌ No confidence scores
- ❌ No follow-up suggestions
- ❌ Basic responses

### After Enhancement:
- ✅ Remembers conversation context
- ✅ Detects emotional state
- ✅ Shows confidence scores
- ✅ Suggests follow-up questions
- ✅ Rich, ChatGPT-like responses
- ✅ Adaptive tone based on user state

## Next Steps

1. **Test thoroughly** with different scenarios
2. **Read CHATBOT_ENHANCEMENTS.md** for detailed documentation
3. **Customize prompts** in `backend/utils/geminiService.js`
4. **Add more laws** to `backend/data/lawdb.json`
5. **Deploy** to production (see README.md)

## Support

If you encounter issues:
1. Check backend terminal for error messages
2. Check browser console for frontend errors
3. Verify all dependencies are installed
4. Ensure MongoDB is running
5. Confirm Gemini API key is valid

---

**Enjoy your enhanced ChatGPT-like legal assistant!** 🚀⚖️
