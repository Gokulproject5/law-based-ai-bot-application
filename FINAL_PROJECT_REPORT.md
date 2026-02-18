# ⚖️ Nyaya Lite: AI-Powered Legal Assistance Platform
## Final Year Project Documentation

---

## 📑 Table of Contents
1. [Abstract](#abstract)
2. [Introduction](#introduction)
3. [Problem Statement](#problem-statement)
4. [Proposed Solution](#proposed-solution)
5. [System Architecture](#system-architecture)
6. [Technology Stack](#technology-stack)
7. [Database Design](#database-design)
8. [Core Modules](#core-modules)
9. [Key Features & Innovations](#key-features--innovations)
10. [Implementation Details](#implementation-details)
11. [Testing & Results](#testing--results)
12. [Future Enhancements](#future-enhancements)
13. [Conclusion](#conclusion)

---

## 📝 Abstract
**Nyaya Lite** is a state-of-the-art legal assistance application designed to bridge the gap between complex legal systems and the common citizen. By leveraging **Generative AI (Google Gemini)** and **Retrieval-Augmented Generation (RAG)**, the platform provides instant, context-aware legal guidance, actionable steps, and emergency support. The project focuses on accessibility through voice input, multi-language support, and automated legal documentation.

---

## 🚀 Introduction
In a country like India, legal literacy is a significant challenge. Most citizens are unaware of their basic rights or the immediate steps to take during legal crises like accidents, theft, or harassment. **Nyaya Lite** aims to democratize legal knowledge by providing a "lawyer in your pocket" experience.

---

## 🔍 Problem Statement
1. **Legal Complexity**: Legal jargon is difficult for laypeople to understand.
2. **Accessibility Barriers**: Lack of immediate access to legal advice during emergencies.
3. **Information Overload**: Finding relevant sections (IPC/BNS) among thousands of laws is daunting.
4. **Documentation Hurdles**: Drafting formal complaints (FIRs) is complex for common citizens.

---

## 💡 Proposed Solution
A comprehensive MERN-stack application integrated with Google Gemini AI to:
- Translate user queries into simplified legal analysis.
- Provide step-by-step action plans.
- Offer instant emergency tools (one-tap calling, map navigation).
- Automate the generation of legal documents (PDFs).

---

## 🏗️ Optimized System Architecture
Nyaya Lite utilizes a sophisticated 6-layer architecture to ensure consistency, accuracy, and ease of use.

### 🔹 1. Presentation Layer
- **Tech**: React.js / Tailwind CSS / Lucide-UI.
- **Features**: Chat UI, multi-language voice input, and responsive data visualization.

### 🔹 2. Application Layer
- **Tech**: Node.js / Express API Gateway.
- **Logic**: Handles query preprocessing, session persistence, and request routing.

### 🔹 3. Intelligence Layer
- **AI Engine**: Google Gemini Pro (LLM).
- **Processing**: Intent detection, semantic analysis, and emotional tone adaptation.

### 🔹 4. Knowledge Layer
- **Storage**: MongoDB Atlas (Cloud) + Local Vector Store.
- **Knowledge Base**: Curated database of IPC, BNS, and specialized law acts.

### 🔹 5. Validation Layer
- **Checkers**: Rule-based legal sanity checks and strict output formatting validation.

### 🔹 6. Output Layer
- **Response Format**: Structured 4-part legal response (Law, Explanation, Steps, Disclaimer).
- **Modules**: Automated FIR/RTI template generator and emergency action buttons.

---

## 🔄 Data Flow Model
1. **User Query**: Text or voice input received.
2. **NLP Logic**: Cleaning, intent extraction, and emotional detection.
3. **Retrieval (RAG)**: Fetching relevant legal context from the Knowledge Layer.
4. **Augmentation**: Injecting context into the LLM prompt.
5. **Generation**: Gemini AI produces a high-fidelity legal analysis.
6. **Formatting**: Applying the 1️⃣2️⃣3️⃣4️⃣ structured template.
7. **Delivery**: Prompting user with actionable insights and emergency tools.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Tailwind CSS, Lucide Icons, React Leaflet (Maps), jsPDF.
- **Backend**: Node.js, Express.js, Joi (Validation), Axios.
- **AI/ML**: Google Generative AI (Gemini Pro), Text Embeddings.
- **Database**: MongoDB Atlas.
- **DevOps**: Git, Vercel/Render support.

---

## 🗄️ Database Design
### LawEntry Schema
| Field | Type | Description |
|-------|------|-------------|
| Title | String | Name of the legal scenario |
| Category | String | Legal domain (e.g., Cybercrime, Theft) |
| IPC/BNS Sections | Array | Relevant legislative sections |
| Description | String | Simplified explanation |
| Steps | Array | Chronological actions to take |
| Severity | String | Low, Medium, High, Emergency |
| Embedding | Array | Vector representation for RAG |

---

## ⚙️ Core Modules
### 1. Smart Analysis Engine
Processes user input through a RAG pipeline. It performs semantic search across the legal database and constructs a high-context prompt for Gemini AI.

### 2. Emergency Response System
Detects high-risk situations (e.g., "I just had an accident") and dynamically provides:
- **Direct Dial Buttons**: 108 (Ambulance), 112 (Police).
- **Location Finders**: Navigates to physical help centers via GPS.

### 3. Template Generator
A rule-based PDF engine that creates legally formatted drafts for FIRs, RTIs, and Consumer Complaints based on user input.

---

## ✨ Key Features & Innovations
- **AI-Driven Action Buttons**: The chatbot doesn't just talk; it provides functional buttons to call help or find lawyers.
- **Emotional Intelligence**: Detects distress or frustration in user input and adapts the AI's tone accordingly.
- **BNS Integration**: Prioritizes the new *Bharatiya Nyaya Sanhita* (BNS) while maintaining IPC references.
- **Zero-Storage Privacy**: No conversational data is stored on the server side, ensuring absolute user privacy.

---

## 📈 Implementation Details
### RAG Workflow
1. **User Query**: "Someone snatched my gold chain."
2. **Embedding**: Query is converted to a vector.
3. **Retrieval**: System finds "Snatching/Theft" entries in MongoDB.
4. **Augmentation**: Relevant laws are injected into the Gemini prompt.
5. **Generation**: AI returns structured JSON with laws, steps, and emergency buttons.

---

## 🧪 Testing & Results

### AI-Generated Output Sample
**User Query**: *"Someone hit my bike and ran away"*

**System Output**:
1️⃣ **Relevant Law**:
- **BNS Section 281**: Rash driving or riding on a public way.
- **BNS Section 125(a)**: Act endangering life or personal safety of others.
- **IPC equivalent**: Section 279 and 336.

2️⃣ **Explanation**:
The situation is a classified 'Hit and Run'. Since the offender fled, Section 134 of the Motor Vehicles Act also applies regarding the duty of the driver in case of an accident.

3️⃣ **Immediate Steps**:
1. Note the vehicle number, color, and model if possible.
2. Check for CCTV cameras in the vicinity.
3. Call **112** (Police) and **108** (Ambulance) if injured.
4. File an FIR at the nearest police station.

4️⃣ **Disclaimer**:
This information is for awareness only and not a substitute for professional legal advice.

### Test Cases
- **Scenario 1 (Road Accident)**: AI correctly identified sections, provided Emergency Buttons, and generated an Immediate Checklist.
- **Scenario 2 (Cyber Fraud)**: System suggested the **1930** helpline and explained evidence preservation.
- **Scenario 3 (Theft)**: Bot provided a direct link to "Download FIR Draft" via the Output Layer.

---

## 🔮 Future Enhancements
- **OCR Integration**: Scan legal notices to get instant simplified summaries.
- **Blockchain Verification**: Secure, immutable logs for evidence collection.
- **Live Lawyer Chat**: Integration with professional legal consultants for real-time advice.

---

## 🏁 Conclusion
**Nyaya Lite** successfully demonstrates how modern AI can be applied to social good. By simplifying the legal process and providing immediate support, it empowers citizens to handle legal challenges with confidence and clarity.

---
**Project Prepared By:** [User Name / Team Name]
**Academic Year:** 2025-2026
**Supervisor:** [Supervisor Name]
