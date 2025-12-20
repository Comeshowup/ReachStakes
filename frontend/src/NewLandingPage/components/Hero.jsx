import React from 'react';

const Hero = () => {
    return (
        <main className="container lg:px-12 lg:pt-0 min-h-[1100px] flex flex-col lg:flex-row z-10 mr-auto ml-auto pt-0 pr-6 pl-6 relative items-center">
            {/* Left Column: Copy */}
            <div className="lg:w-1/2 flex flex-col lg:py-0 lg:mt-0 w-full mt-16 pt-12 pb-20 justify-center">
                <h4 className="text-xs font-mono tracking-[0.2em] text-white/40 uppercase mb-8 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-sky opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-sky"></span>
                    </span>
                    Collaboration Engine
                </h4>

                <h1 className="lg:text-7xl leading-[1.1] text-brand-sky text-glow text-5xl italic tracking-tight font-serif mb-6">
                    The Infrastructure <br />
                    <span className="text-white opacity-90">of Influence.</span>
                </h1>

                <p className="font-sans text-xl lg:text-2xl font-light text-white/70 leading-relaxed tracking-tight max-w-xl mb-12">
                    A unified operating system for high-impact brand collaborations. Scale campaigns, automate payouts, and track ROI with institutional precision.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 gap-x-6 gap-y-6 items-start sm:items-center">
                    {/* Animated Shiny CTA Button */}
                    <button className="shiny-cta focus:outline-none">
                        <span>Start Campaign</span>
                    </button>

                    {/* Gradient Pill Button with Icon (Dark Gray) */}
                    <button
                        className="hover:bg-white/10 hover:text-white transition-all flex text-sm font-medium text-slate-300 bg-white/5 rounded-full pt-3 pr-6 pb-3 pl-6 gap-x-2 gap-y-2 items-center group"
                        style={{
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                            position: 'relative',
                            '--border-gradient':
                                'linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.15))',
                            '--border-radius-before': '9999px',
                        }}
                    >
                        <span className="text-sm font-medium tracking-tight">Join as Creator</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                        >
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Right Column: Abstract UI Visualization with Sonar */}
            <div className="lg:w-1/2 lg:h-[800px] flex w-full h-[500px] relative perspective-1000 items-center justify-center">
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
                    viewBox="0 0 600 600"
                >
                    <defs>
                        <radialGradient id="center-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.3)" />
                            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                        </radialGradient>
                    </defs>

                    {/* Connecting Beams */}
                    {/* Group 1 */}
                    <g>
                        <path
                            d="M -50 150 C 100 150, 100 300, 300 300"
                            fill="none"
                            stroke="white"
                            strokeWidth="1"
                            className="opacity-[0.08]"
                        ></path>
                        <path
                            d="M -50 150 C 100 150, 100 300, 300 300"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1.5"
                            className="beam-line animate-beam opacity-60"
                        ></path>
                    </g>
                    {/* Group 2 */}
                    <g>
                        <path
                            d="M -50 450 C 100 450, 100 300, 300 300"
                            fill="none"
                            stroke="white"
                            strokeWidth="1"
                            className="opacity-[0.08]"
                        ></path>
                        <path
                            d="M -50 450 C 100 450, 100 300, 300 300"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1.5"
                            className="beam-line animate-beam opacity-60"
                            style={{ animationDelay: '-1s' }}
                        ></path>
                    </g>
                    {/* Group 3 */}
                    <g>
                        <path
                            d="M 650 100 C 500 100, 500 300, 300 300"
                            fill="none"
                            stroke="white"
                            strokeWidth="1"
                            className="opacity-[0.08]"
                        ></path>
                        <path
                            d="M 650 100 C 500 100, 500 300, 300 300"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1.5"
                            className="beam-line animate-beam opacity-60"
                            style={{ animationDelay: '-2s' }}
                        ></path>
                    </g>
                    {/* Group 4 */}
                    <g>
                        <path
                            d="M 650 500 C 500 500, 500 300, 300 300"
                            fill="none"
                            stroke="white"
                            strokeWidth="1"
                            className="opacity-[0.08]"
                        ></path>
                        <path
                            d="M 650 500 C 500 500, 500 300, 300 300"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1.5"
                            className="beam-line animate-beam opacity-60"
                            style={{ animationDelay: '-1.5s' }}
                        ></path>
                    </g>

                    {/* CENTRAL NODE DETAIL */}
                    <g transform="translate(300, 300)">
                        {/* Ambient Glow */}
                        <circle r="120" fill="url(#center-glow)" className="animate-pulse"></circle>

                        {/* Sonar Waves */}
                        <circle
                            r="20"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1"
                            opacity="0.5"
                            className="animate-sonar"
                        ></circle>
                        <circle
                            r="20"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1"
                            opacity="0.5"
                            className="animate-sonar delay-1000"
                        ></circle>
                        <circle
                            r="20"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1"
                            opacity="0.5"
                            className="animate-sonar delay-2000"
                        ></circle>

                        {/* Technical Rings */}
                        {/* Outer Dashed Ring Slow */}
                        <circle
                            r="65"
                            fill="none"
                            stroke="white"
                            strokeOpacity="0.1"
                            strokeWidth="1"
                            strokeDasharray="10 20"
                            className="animate-spin-slow"
                        ></circle>

                        {/* Inner Dashed Ring Reverse */}
                        <circle
                            r="45"
                            fill="none"
                            stroke="#38BDF8"
                            strokeOpacity="0.2"
                            strokeWidth="1"
                            strokeDasharray="4 6"
                            className="animate-spin-slow-reverse"
                        ></circle>

                        {/* Crosshair Markers */}
                        <g className="animate-spin-slow" style={{ animationDuration: '20s' }}>
                            <path d="M -80 0 L -70 0" stroke="white" strokeOpacity="0.2"></path>
                            <path d="M 80 0 L 70 0" stroke="white" strokeOpacity="0.2"></path>
                            <path d="M 0 -80 L 0 -70" stroke="white" strokeOpacity="0.2"></path>
                            <path d="M 0 80 L 0 70" stroke="white" strokeOpacity="0.2"></path>
                        </g>

                        {/* Core */}
                        <circle r="8" fill="#0A0A0A" stroke="#38BDF8" strokeWidth="2"></circle>
                        <circle r="4" fill="#38BDF8" className="animate-pulse-fast"></circle>
                    </g>
                </svg>

                {/* Floating Labels */}
                <div className="absolute top-[20%] lg:top-[25%] left-[10%] lg:left-[15%] flex flex-col items-end">
                    <span className="text-xs font-mono text-brand-sky tracking-widest mb-1 opacity-80">TOTAL CONTROL</span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-brand-sky to-transparent"></div>
                </div>

                <div className="absolute bottom-[20%] lg:bottom-[25%] right-[10%] lg:right-[15%] flex flex-col items-start">
                    <span className="text-xs font-mono text-brand-sky tracking-widest mb-1 opacity-80">CREATOR FIRST</span>
                    <div className="h-[1px] w-12 bg-gradient-to-r from-brand-sky to-transparent"></div>
                </div>

                {/* Extra Data Decoration (New) */}
                <div className="absolute top-[50%] right-[15%] hidden lg:flex flex-col gap-1">
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-white/20"></div>
                        <div className="w-1 h-1 bg-white/20"></div>
                        <div className="w-1 h-1 bg-brand-sky animate-pulse"></div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Hero;
