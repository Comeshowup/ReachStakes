/**
 * Lift Testing Page - Brand Analytics
 * A dedicated page for managing incremental lift tests
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LiftTestDashboard,
    LiftTestCreator,
    LiftTestResults
} from '../components/attribution';

const LiftTestingPage = () => {
    const [showCreator, setShowCreator] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState(null);

    // If viewing a specific test's results
    if (selectedTestId) {
        return (
            <div className="p-6 min-h-screen">
                <LiftTestResults
                    testId={selectedTestId}
                    onBack={() => setSelectedTestId(null)}
                />
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen space-y-6">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Lift Testing
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Measure the incremental impact of your creator campaigns with A/B testing.
                </p>
            </div>

            {/* Dashboard Grid */}
            <LiftTestDashboard
                onCreateTest={() => setShowCreator(true)}
                onViewTest={(testId) => setSelectedTestId(testId)}
            />

            {/* Creator Modal */}
            <AnimatePresence>
                {showCreator && (
                    <LiftTestCreator
                        onClose={() => setShowCreator(false)}
                        onSuccess={() => {
                            setShowCreator(false);
                            // Dashboard will auto-refresh via its own useEffect
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default LiftTestingPage;
