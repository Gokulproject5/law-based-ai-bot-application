import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';

const TIPS = [
    "You have the right to remain silent if arrested.",
    "Police cannot refuse to file an FIR for a cognizable offense.",
    "Women cannot be arrested after sunset and before sunrise (exceptions apply).",
    "You can file an RTI to get information from any government body.",
    "Domestic violence covers physical, emotional, and economic abuse.",
    "Tenants cannot be evicted without a court order.",
    "Cyberbullying is a punishable offense under the IT Act."
];

export default function DailyTip() {
    const [tip, setTip] = useState("");

    useEffect(() => {
        // Pick a random tip on mount
        const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
        setTip(randomTip);
    }, []);

    return (
        <div className="hidden sm:flex items-center gap-2 bg-blue-700 bg-opacity-30 px-3 py-1 rounded-full text-xs text-blue-50 max-w-xs truncate">
            <Lightbulb size={12} className="text-yellow-300 flex-shrink-0" />
            <span className="truncate">{tip}</span>
        </div>
    );
}
