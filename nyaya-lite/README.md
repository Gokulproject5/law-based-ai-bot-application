# ⚖️ Nyaya Lite - Instant Law Guidance App

**A complete MERN stack legal assistance application for common citizens**

![Status](https://img.shields.io/badge/status-production%20ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 Overview

Nyaya Lite is a comprehensive legal assistance platform that helps ordinary citizens understand their legal rights and take appropriate action. Using advanced NLP and a rich database of Indian laws, the app provides instant legal guidance in simple language.

### ✨ Key Features

#### 🎯 Core System
- **Text & Voice Input**: Support for typing or speaking in multiple Indian languages (English, Hindi, Tamil, Telugu, Malayalam, Kannada)
- **Smart Legal Match Engine**: Advanced NLP with keyword stemming and fuzzy matching
- **Evidence Management**: Built-in checklist and upload tools for collecting proof
- **Instant Analysis**: Get relevant IPC sections, actionable steps, and penalties

#### 🛡️ Safety & Compliance
- **Mandatory Legal Disclaimer**: Ensures users understand this is informational only
- **Emergency Access**: One-tap access to 112, 181 (Women), 1930 (Cyber)
- **Privacy First**: No personal data stored on backend, local-only history

#### 📚 Rich Content
- **50+ Legal Scenarios**: Covering Accidents, Cybercrime, Harassment, Property, Employment, etc.
- **Category Browsing**: Organized by legal domain
- **Severity Indicators**: Low/Medium/High/Emergency ratings
- **PDF Templates**: Auto-generate FIR, RTI, Consumer complaints

#### 🌍 Location Services
- **Find Help Nearby**: Integration with Google Maps to locate police stations, courts
- **Interactive Map**: View help centers on a map

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Modern browser (Chrome/Edge/Safari for voice input)

### 1️⃣ Clone & Setup

```bash
git clone <your-repo-url>
cd nyaya-lite
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```env
MONGO_URI=mongodb://127.0.0.1:27017/nyaya
PORT=5000
```

Seed the database:
```bash
node utils/seedLaws.js
```

Start the server:
```bash
npm start
# or for development:
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

### 4️⃣ Access App
Open your browser to `http://localhost:5173`

---

## 📂 Project Structure

```
nyaya-lite/
├── backend/
│   ├── models/
│   │   ├── LawEntry.js          # Mongoose schema for laws
│   │   └── Lawyer.js             # Lawyer directory (optional)
│   ├── routes/
│   │   ├── api.js                # Main API routes
│   │   └── laws.js               # Law-specific routes
│   ├── utils/
│   │   ├── analyzer.js           # NLP intelligence engine
│   │   ├── seedLaws.js           # DB seeding script
│   │   └── seedLawyers.js        # Lawyer seeding (optional)
│   ├── data/
│   │   └── lawdb.json            # 50+ law entries
│   ├── server.js                 # Express server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── VoiceInput.jsx           # Voice + text input
    │   │   ├── ResultCard.jsx           # Law result display
    │   │   ├── CategoryView.jsx         # Browse by category
    │   │   ├── TemplateGenerator.jsx    # PDF templates
    │   │   ├── MapView.jsx              # Find help nearby
    │   │   ├── DisclaimerPopup.jsx      # Legal disclaimer
    │   │   ├── EmergencyButton.jsx      # Emergency helpline
    │   │   ├── EvidenceHelper.jsx       # Evidence checklist
    │   │   ├── DailyTip.jsx             # Legal tips
    │   │   └── AdminView.jsx            # Admin dashboard
    │   ├── App.jsx                      # Main app component
    │   ├── main.jsx                     # React entry
    │   └── index.css                    # Tailwind styles
    ├── package.json
    └── vite.config.js
```

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express**: RESTful API
- **MongoDB** + **Mongoose**: Database
- **Natural**: NLP for text analysis
- **dotenv**: Environment config
- **cors**: Cross-origin support

### Frontend
- **React** (Vite): UI framework
- **TailwindCSS**: Styling
- **Axios**: HTTP client
- **jsPDF**: PDF generation
- **React Router**: Navigation
- **Lucide Icons**: UI icons
- **React Leaflet**: Map integration

---

## 📋 API Endpoints

### POST `/api/analyze`
Analyze user text/voice input and return matching laws.

**Request:**
```json
{
  "text": "My phone was stolen"
}
```

**Response:**
```json
{
  "matches": [
    {
      "title": "Theft of Mobile Phone",
      "category": "Theft / Property",
      "ipc_sections": ["379"],
      "severity": "Medium",
      "steps": [...],
      "evidence_required": [...]
    }
  ]
}
```

### GET `/api/categories`
Get all legal categories.

### GET `/api/laws?category=Cybercrime`
Get laws filtered by category.

---

## 🎨 Features in Detail

### 1. Voice Input
- **Multi-language**: English, Hindi, Tamil, Telugu, Malayalam, Kannada
- **Browser Speech API**: Works in Chrome, Edge, Safari
- **Auto-transcription**: Speech converted to text automatically

### 2. Legal Intelligence
- **Keyword Matching**: Stemmed tokens (e.g., "steal" matches "stolen")
- **Fuzzy Matching**: Handles typos (1-character edit distance)
- **Context Detection**: Infers legal category from input
- **Scoring Algorithm**: Ranks results by relevance

### 3. Evidence Helper
- **Camera Access**: (On HTTPS/mobile) Take photos on the spot
- **File Upload**: Upload photos, PDFs, screenshots
- **Dynamic Checklist**: Shows evidence needed based on the scenario

### 4. PDF Templates
- **FIR Format**: Police complaint draft
- **RTI Application**: Right to Information request
- **Consumer Complaint**: Product/service grievance
- **Auto-fill**: Uses user input to populate templates

### 5. Emergency Features
- **Floating Button**: Always accessible on screen
- **Quick Dial**: 112 (All), 181 (Women), 1930 (Cyber)
- **No delays**: Direct tel: links for instant calling

---

## 🔐 Security & Privacy

- **No Personal Data Storage**: All user inputs are processed in-memory only
- **LocalStorage Only**: History (if any) is kept in browser, not server
- **Legal Disclaimer**: Mandatory acceptance on first use
- **Admin Protection**: Admin routes are UI-only (full auth pending)

---

## 🌐 Deployment

### Backend (Render/Railway)
1. Create a new Web Service
2. Connect your GitHub repo
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variable: `MONGO_URI=<your-mongodb-atlas-uri>`

### Frontend (Vercel/Netlify)
1. Connect repo to Vercel/Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Update API URL in `App.jsx` to your backend URL

---

## 📱 Mobile Support

- **Responsive Design**: Works on all screen sizes
- **Voice Input**: Native support on mobile browsers
- **Touch-optimized**: Large tap targets, swipe-friendly

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Voice input in different languages
- [ ] Text analysis for various scenarios (theft, accident, cybercrime)
- [ ] Category browsing
- [ ] PDF template generation
- [ ] Emergency button functionality
- [ ] Map view and Google Maps links

### Automated Tests (Future)
- Unit tests for `analyzer.js`
- Integration tests for API endpoints
- E2E tests with Playwright/Cypress

---

## 📈 Future Enhancements

### Planned Features
- [ ] Multi-language content translation (UI + Law data)
- [ ] Chatbot integration for Q&A
- [ ] User authentication for saving history
- [ ] Real-time lawyer consultation
- [ ] Push notifications for case status
- [ ] State-specific legal variations
- [ ] AI-powered legal document review

### Admin Panel
- [ ] Secure authentication
- [ ] CRUD operations for laws
- [ ] Analytics dashboard
- [ ] User query logs (anonymized)

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## ⚠️ Disclaimer

**This application is for informational and educational purposes only. It does not constitute legal advice and should not be relied upon as such. Always consult with a qualified legal professional for advice specific to your situation.**

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@nyayalite.com (if available)

---

## 🙏 Acknowledgments

- Indian Penal Code (IPC) references
- Natural NLP library
- React & Vite communities
- OpenStreetMap contributors

---

**Made with ⚖️ for the people of India**
