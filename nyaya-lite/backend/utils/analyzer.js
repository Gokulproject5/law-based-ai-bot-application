const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Context Detection: Relationship and role keywords
const CONTEXT_MAP = {
    workplace: ['boss', 'manager', 'employer', 'colleague', 'office', 'workplace', 'company'],
    family: ['husband', 'wife', 'spouse', 'father', 'mother', 'in-laws', 'son', 'daughter', 'child'],
    neighbor: ['neighbor', 'neighbour', 'next door', 'building', 'flat'],
    public: ['stranger', 'road', 'street', 'public', 'unknown'],
    student: ['college', 'university', 'school', 'student', 'senior', 'ragging']
};

// Entity patterns
const ENTITY_PATTERNS = {
    money: /(\d+)\s*(rupees?|rs\.?|inr|₹|thousand|lakh|crore)/i,
    danger: ['weapon', 'knife', 'gun', 'pistol', 'acid', 'threat', 'kill', 'murder', 'hurt', 'beat'],
    child: ['child', 'kid', 'minor', 'baby', 'infant', 'teenager', 'son', 'daughter'],
    time_urgent: ['immediately', 'urgent', 'emergency', 'fast', 'quick', 'now', 'asap']
};

// Common multi-word phrases (higher priority than tokenization)
const COMMON_PHRASES = [
    'phone stolen', 'mobile stolen', 'hit and run', 'chain snatching',
    'domestic violence', 'sexual harassment', 'fake job', 'otp fraud',
    'account hacked', 'identity theft', 'child missing', 'cyber bullying',
    'salary not paid', 'wrongful termination', 'builder fraud'
];

// Simple Levenshtein distance for fuzzy matching
function getEditDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// Extract entities from text
function extractEntities(text) {
    const entities = {
        money_amount: null,
        has_danger: false,
        involves_child: false,
        time_urgent: false
    };

    const lowerText = text.toLowerCase();

    // Extract money
    const moneyMatch = text.match(ENTITY_PATTERNS.money);
    if (moneyMatch) {
        entities.money_amount = moneyMatch[1];
    }

    // Check for danger keywords
    entities.has_danger = ENTITY_PATTERNS.danger.some(word => lowerText.includes(word));

    // Check for child involvement
    entities.involves_child = ENTITY_PATTERNS.child.some(word => lowerText.includes(word));

    // Check for time urgency
    entities.time_urgent = ENTITY_PATTERNS.time_urgent.some(word => lowerText.includes(word));

    return entities;
}

// Detect context from text
function detectContext(text) {
    const lowerText = text.toLowerCase();
    const contexts = [];

    for (const [context, keywords] of Object.entries(CONTEXT_MAP)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            contexts.push(context);
        }
    }

    return contexts;
}

// Check for phrase matches
function checkPhraseMatches(text) {
    const lowerText = text.toLowerCase();
    return COMMON_PHRASES.filter(phrase => lowerText.includes(phrase));
}

// Adjust severity based on entities
function calculateDynamicSeverity(baseSeverity, entities) {
    let severity = baseSeverity;

    // Upgrade severity if danger present
    if (entities.has_danger && severity === 'Low') {
        severity = 'Medium';
    }
    if (entities.has_danger && severity === 'Medium') {
        severity = 'High';
    }

    // Upgrade if child involved
    if (entities.involves_child && severity === 'Low') {
        severity = 'Medium';
    }
    if (entities.involves_child && severity === 'Medium') {
        severity = 'High';
    }

    // Mark as emergency if time urgent and already high
    if (entities.time_urgent && severity === 'High') {
        severity = 'Emergency';
    }

    return severity;
}

function analyzeText(text, lawData) {
    if (!text) return { matches: [], analysis: {} };

    // Extract entities and context
    const entities = extractEntities(text);
    const contexts = detectContext(text);
    const phraseMatches = checkPhraseMatches(text);

    const lowerText = text.toLowerCase();
    const tokens = tokenizer.tokenize(lowerText);
    const stemmedTokens = tokens.map(t => stemmer.stem(t));

    const results = lawData.map(law => {
        let score = 0;

        // 1. Phrase Match (Highest priority)
        phraseMatches.forEach(phrase => {
            if (law.keywords && law.keywords.some(k => phrase.includes(k.toLowerCase()))) {
                score += 20;
            }
            if (law.title.toLowerCase().includes(phrase)) {
                score += 25;
            }
        });

        // 2. Keyword Match (High weight)
        if (law.keywords) {
            law.keywords.forEach(k => {
                const stemmedKey = stemmer.stem(k.toLowerCase());
                if (stemmedTokens.includes(stemmedKey)) {
                    score += 10;
                } else {
                    // Fuzzy match for keywords
                    tokens.forEach(t => {
                        if (getEditDistance(t, k.toLowerCase()) <= 1) { // Allow 1 typo
                            score += 8;
                        }
                    });
                }
            });
        }

        // 3. Title Match
        const titleTokens = tokenizer.tokenize(law.title.toLowerCase());
        titleTokens.forEach(t => {
            if (stemmedTokens.includes(stemmer.stem(t))) score += 5;
        });

        // 4. Category Context Match
        contexts.forEach(context => {
            if (context === 'workplace' && law.category.includes('Employment')) score += 15;
            if (context === 'workplace' && law.category.includes('Harassment')) score += 10;
            if (context === 'family' && law.category.includes('Family')) score += 15;
            if (context === 'family' && law.category.includes('Harassment')) score += 10;
            if (context === 'student' && law.title.toLowerCase().includes('ragging')) score += 20;
        });

        // 5. Description Match (Low weight)
        if (law.description) {
            const descTokens = tokenizer.tokenize(law.description.toLowerCase());
            descTokens.forEach(t => {
                if (stemmedTokens.includes(stemmer.stem(t))) score += 1;
            });
        }

        // 6. Severity boost for child-related laws if child detected
        if (entities.involves_child && law.category.includes('Child')) {
            score += 15;
        }

        // Adjust severity dynamically
        const adjustedSeverity = calculateDynamicSeverity(law.severity, entities);

        return {
            law: { ...law, severity: adjustedSeverity },
            score,
            relevance_reason: score > 20 ? 'Strong match' : score > 10 ? 'Good match' : 'Partial match'
        };
    });

    // Filter and sort
    const topMatches = results
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Return top 5 matches

    // Identify related categories
    const categories = [...new Set(topMatches.map(r => r.law.category))];
    const primary_issue = categories[0] || 'General';
    const related_issues = categories.slice(1, 3);

    // Determine urgency
    let urgency_level = 'Normal';
    const severities = topMatches.map(r => r.law.severity);
    if (severities.includes('Emergency')) urgency_level = 'Emergency';
    else if (severities.includes('High')) urgency_level = 'High';
    else if (severities.includes('Medium')) urgency_level = 'Medium';

    // Generate basic next steps for local fallback
    const steps = [];
    if (urgency_level === 'Emergency' || urgency_level === 'High') {
        steps.push({ title: 'Contact Emergency Services', description: 'Dial 100 or use the Emergency button in the app immediately.' });
    }
    steps.push({ title: 'Document Evidence', description: 'Collect photos, videos, and witness details as mentioned in our Evidence Helper.' });
    steps.push({ title: 'Consult a Professional', description: `We recommend speaking with a ${primary_issue} specialist lawyer to understand your full legal standing.` });

    // Generate emergency buttons for local fallback
    const emergency_buttons = [];
    if (urgency_level === 'Emergency' || urgency_level === 'High') {
        if (primary_issue.includes('Accident') || primary_issue.includes('Injury')) {
            emergency_buttons.push({ label: 'Call Ambulance (108)', type: 'call', value: '108', icon: 'activity' });
        }
        emergency_buttons.push({ label: 'Call Police (112)', type: 'call', value: '112', icon: 'shield' });
        emergency_buttons.push({ label: 'Find Nearest Police Station', type: 'action', value: 'location_police', icon: 'map-pin' });
    }

    if (primary_issue.includes('Women') || primary_issue.includes('Abuse')) {
        emergency_buttons.push({ label: 'Call Women Helpline (181)', type: 'call', value: '181', icon: 'phone' });
    }

    if (primary_issue.includes('Cyber')) {
        emergency_buttons.push({ label: 'Call Cyber Helpline (1930)', type: 'call', value: '1930', icon: 'phone' });
    }

    // Add common action buttons
    if (topMatches.length > 0) {
        emergency_buttons.push({ label: 'Find a Lawyer', type: 'action', value: 'location_lawyer', icon: 'users' });
    }

    // Build Section 1 law list text
    const lawListText = topMatches.length > 0
        ? topMatches.map(m => {
            const ipcPart = m.law.ipc_sections && m.law.ipc_sections.length > 0
                ? ` (${m.law.ipc_sections.join(', ')})`
                : '';
            const title = m.law.title || m.law.name || 'Legal Provision';
            return `- **${title}**${ipcPart}  \n  ${m.law.description || ''}`;
        }).join('\n')
        : '- No specific IPC section matched. Please describe your situation in more detail.';

    return {
        summary: `Local Analysis: Potential ${primary_issue} incident detected.`,
        logic_path: `local_matching → category:${primary_issue}`,
        detailed_analysis: `### 1️⃣ **Relevant Law**\n${lawListText}\n\n### 2️⃣ **Explanation**\nDetected keywords related to ${primary_issue}. This typically involves legal provisions regarding rights and duties in such situations.\n\n### 3️⃣ **Immediate Steps**\n1. ${steps[0].description}\n2. ${steps[1] ? steps[1].description : 'Document evidence.'}\n3. ${steps[2] ? steps[2].description : 'Consult an expert.'}\n\n### 4️⃣ **Disclaimer**\n**This is educational awareness information only and does not constitute personal legal advice.**`,
        relevant_laws: topMatches.map(r => ({
            name: r.law.title || r.law.name || 'Legal Provision',
            description: r.law.description
        })),
        matches: topMatches.map(r => r.law),
        steps,
        emergency_buttons,
        confidence_score: topMatches.length > 0 ? 0.7 : 0,
        risk_level: urgency_level,
        emotional_support: entities.has_danger ? "Stay safe. Contact authorities immediately if you are in danger." : null,
        analysis: {
            primary_issue,
            related_issues,
            urgency_level,
            entities_detected: entities,
            contexts: contexts,
            phrases_matched: phraseMatches
        }
    };
}

module.exports = { analyzeText };

