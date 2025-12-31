import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Simple translation resources
const resources = {
    en: {
        translation: {
            "greeting": "How can we help?",
            "subtitle": "Speak or type your legal problem below.",
            "analyzing": "Analyzing your query...",
            "browse_laws": "Browse Laws",
            "templates": "Templates",
            "find_help": "Find Help",
            "ai_chat": "AI Chat",
            "language": "Language",
            "home": "Home",
            "input_placeholder": "Describe your situation...",
            "coming_soon": "Coming Soon"
        }
    },
    hi: {
        translation: {
            "greeting": "हम आपकी कैसे मदद कर सकते हैं?",
            "subtitle": "अपनी कानूनी समस्या बोलें या लिखें।",
            "analyzing": "आपकी समस्या का विश्लेषण कर रहा हूँ...",
            "browse_laws": "कानून देखें",
            "templates": "टेम्पलेट्स",
            "find_help": "मदद खोजें",
            "ai_chat": "एआई चैट",
            "language": "भाषा",
            "home": "होम",
            "input_placeholder": "अपनी स्थिति का वर्णन करें...",
            "coming_soon": "जल्द आ रहा है"
        }
    },
    ta: {
        translation: {
            "greeting": "நாங்கள் உங்களுக்கு எப்படி உதவ முடியும்?",
            "subtitle": "உங்கள் சட்ட சிக்கலைப் பற்றி பேசுங்கள் அல்லது தட்டச்சு செய்யுங்கள்.",
            "analyzing": "உங்கள் கேள்வியை ஆய்வு செய்கிறது...",
            "browse_laws": "சட்டங்களை உலாவுக",
            "templates": "வார்ப்புருக்கள்",
            "find_help": "உதவி தேடுங்கள்",
            "ai_chat": "AI அரட்டை",
            "language": "மொழி",
            "home": "முகப்பு",
            "input_placeholder": "உங்கள் நிலையை விவரிக்கவும்...",
            "coming_soon": "விரைவில் வரும்"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
