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
        <div className="hidden md:flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-[10px] md:text-xs text-blue-600 dark:text-blue-400 max-w-[200px] lg:max-w-sm overflow-hidden transition-all duration-300 hover:bg-blue-600/20">
            <Lightbulb size={14} className="text-yellow-500 flex-shrink-0" />
            <span className="truncate font-medium">{tip}</span>
        </div>
    );
}
