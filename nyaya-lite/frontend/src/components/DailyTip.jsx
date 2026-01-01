import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DailyTip() {
    const { t } = useTranslation();
    const [tip, setTip] = useState("");

    const TIPS = [
        t('tip1'),
        t('tip2'),
        t('tip3'),
        t('tip4'),
        t('tip5'),
        t('tip6'),
        t('tip7')
    ];

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
