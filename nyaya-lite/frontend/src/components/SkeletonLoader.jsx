import React from 'react';

export default function SkeletonLoader() {
    return (
        <div className="space-y-4 animate-pulse w-full max-w-md mx-auto mt-4 px-1">

            {/* Summary Card Skeleton */}
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>

            {/* Steps Skeleton */}
            <div className="space-y-3 pt-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
