import React from 'react';
import BrandsSection from './BrandsSection';
import CreatorsSection from '../Homepage/CreatorsSection';
import HowItWorks from './HowItWorks';
import CallToAction from './CallToAction';
import Footer from './Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            
            <BrandsSection />
        
            <HowItWorks />
            <CallToAction />
            <Footer />
        </div>
    );
};

export default LandingPage;
