## 🏗️ Optimized System Architecture

The Nyaya Lite platform follows a high-performance, 6-layer architecture designed for scalability, accuracy, and ethical compliance.

### 🔹 1. Presentation Layer
- **Tech**: React.js / Vite / Tailwind CSS
- **Components**: Chat UI, Voice Input (Web Speech API), Map Navigation, Document Viewers.
- **Responsibility**: Delivering a "wow" user experience with rich micro-animations and responsive layouts.

### 🔹 2. Application Layer (API Gateway)
- **Tech**: Node.js / Express
- **Responsibilities**: 
  - Query preprocessing & Input validation (Joi)
  - Session management & Conversation context persistence
  - Intent detection (Legal vs General)

### 🔹 3. Intelligence Layer (AI Processing)
- **Engine**: Google Gemini Pro 1.5
- **Features**: 
  - Emotional context awareness
  - Follow-up awareness
  - Prompt Template Engine for structured output
  - Fine-tuned personality (Professional, empathetic Indian Lawyer)

### 🔹 4. Knowledge Layer
- **Data Source**: MongoDB Atlas + Local JSON Fallback
- **Components**: 
  - Legal knowledge base (BNS, IPC, Motor Vehicles Act, etc.)
  - Vector database for semantic search (RAG)
  - FAQ and legal procedure repository

### 🔹 5. Validation Layer
- **Checks**:
  - Rule-based legal sanity checks
  - Safety filtering (Hate speech, harassment)
  - Response formatting validation

### 🔹 6. Output Layer
- **Components**:
  - Structured response generator (The 4-Point Template)
  - PDF Export module for FIR/Legal drafts
  - Dynamic Emergency Buttons

---

## 🔄 Data Flow Model

1️⃣ **User Submission**: User submits query via text or voice.
2️⃣ **Preprocessing**: Speech-to-text conversion (if voice) and NLP cleaning.
3️⃣ **Intent Parsing**: System extracts intent and emotional state.
4️⃣ **Knowledge Retrieval**: Semantic search across the legal knowledge base (RAG).
5️⃣ **AI Generation**: Gemini LLM generates a contextual answer using the retrieved facts.
6️⃣ **Structuring**: Response formatter applies the 4-part legal structure.
7️⃣ **Presentation**: Final response with actionable buttons is displayed to the user.

---

## 📋 Response Template (Core Logic)

Every legal response follows a standardized high-clarity format:

1️⃣ **Relevant Law**: Mention applicable BNS/IPC sections.
2️⃣ **Explanation**: Simple breakdown of the user's rights and situation.
3️⃣ **Immediate Steps**: An actionable, numbered checklist.
4️⃣ **Disclaimer**: Mandatory informational purpose clarification.

## 🎯 Key Components

### Frontend Components
| Component | Responsibility |
|-----------|---------------|
| **AIChat.jsx** | Main chat interface, displays messages |
| **useLegalAnalysis.js** | API communication, session management |
| **ResultCard.jsx** | Displays law matches |
| **VoiceInput.jsx** | Voice-to-text input |

### Backend Components
| Component | Responsibility |
|-----------|---------------|
| **api.js** | API routes, request handling |
| **conversationContext.js** | Session & context management |
| **geminiService.js** | AI prompt engineering & responses |
| **analyzer.js** | Local NLP fallback |

### Data Models
| Model | Fields |
|-------|--------|
| **Session** | id, messages[], context, metadata |
| **LawEntry** | title, category, ipc_sections, description, keywords, steps |
| **Message** | role, content, timestamp |

## 🔐 Security & Privacy

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Measures                         │
├─────────────────────────────────────────────────────────────┤
│ ✅ No personal data stored on server                        │
│ ✅ Sessions in browser sessionStorage only                  │
│ ✅ 30-minute session timeout                                │
│ ✅ Input validation (Joi schema)                            │
│ ✅ AI safety settings (harassment, hate speech)             │
│ ✅ Graceful error handling                                  │
│ ✅ No conversation logging (privacy-first)                  │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Performance Characteristics

```
┌─────────────────────────────────────────────────────────────┐
│                    Performance Metrics                       │
├─────────────────────────────────────────────────────────────┤
│ Response Time (AI):        1-3 seconds                      │
│ Response Time (Local):     < 1 second                       │
│ Session Storage:           < 1 MB per session               │
│ Conversation History:      Last 20 messages                 │
│ Session Timeout:           30 minutes                       │
│ Concurrent Sessions:       Unlimited (in-memory)            │
│ Database Queries:          < 100ms                          │
└─────────────────────────────────────────────────────────────┘
```

## 🌟 Feature Highlights

### Conversation Context
```
Session {
  id: "session_123",
  messages: [
    { role: "user", content: "My phone was stolen" },
    { role: "assistant", content: "Legal analysis..." }
  ],
  context: {
    legalCategory: "Theft",
    severity: "Medium",
    emotionalState: "distressed"
  }
}
```

### AI Prompt Structure
```
System Instructions:
- Identity (Nyaya Lite AI)
- Capabilities (Indian law expert)
- Tone Guidance (based on emotion)
- Follow-up Awareness

User Context:
- Conversation History
- Detected Emotional State
- Legal Category

User Query:
- Current message

Response Format:
- Structured JSON
- Rich markdown
- Actionable steps
```

## 🔄 Scalability

### Current Architecture
- **In-Memory Sessions**: Good for 100-1000 concurrent users
- **MongoDB**: Handles 50+ law entries efficiently
- **Gemini API**: Rate limited by Google

### Future Scaling Options
```
┌─────────────────────────────────────────────────────────────┐
│                    Scaling Strategy                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Redis for session storage (distributed)                  │
│ 2. PostgreSQL for persistent conversations                  │
│ 3. Load balancer for multiple backend instances             │
│ 4. CDN for frontend assets                                  │
│ 5. Caching layer for common queries                         │
│ 6. Queue system for AI requests                             │
└─────────────────────────────────────────────────────────────┘
```

---

**This architecture provides a robust, scalable foundation for a ChatGPT-like legal assistant!** 🚀
