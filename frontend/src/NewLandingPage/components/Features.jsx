import React, { useEffect } from 'react';

const Features = () => {
    useEffect(() => {
        const cards = document.querySelectorAll('.spotlight-card');
        const handleMouseMove = (e) => {
            cards.forEach((card) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section className="flex flex-col overflow-hidden lg:px-12 z-10 bg-black/50 w-full border-white/5 border-t pt-32 pr-6 pb-32 pl-6 relative backdrop-blur-3xl items-center">
            {/* Clean Background Line (No Glows) */}
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            {/* Section Header */}
            <div className="flex flex-col items-center text-center max-w-3xl mb-24 relative z-10">
                {/* Hero-Inspired Vertical Beam Animation */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-48 w-6 overflow-hidden flex justify-center">
                    <svg className="h-full w-full" viewBox="0 0 6 192" fill="none">
                        <path
                            d="M3 0V192"
                            stroke="url(#header-beam)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            className="beam-line animate-beam opacity-70"
                        ></path>
                        <defs>
                            <linearGradient id="header-beam" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
                                <stop offset="50%" stopColor="rgba(56, 189, 248, 1)" />
                                <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <div className="flex items-center gap-3 mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-sky opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-sky"></span>
                    </span>
                    <span className="text-xs font-mono text-brand-sky uppercase tracking-[0.2em] font-medium">
                        Platform Capabilities
                    </span>
                </div>

                <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-white mb-8">
                    Collaboration intelligence
                    <span className="text-white/60"> made effortless.</span>
                </h2>

                <p className="text-xl text-white/60 leading-relaxed max-w-2xl font-light tracking-tight">
                    Streamline your campaign workflows with tools designed to simplify, automate, and enhance your partnerships.
                </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10 w-full max-w-7xl relative gap-x-6 gap-y-6">
                {/* Card 1: Automated Execution */}
                <div className="spotlight-card group relative flex flex-col p-10 rounded-[32px] border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-500">
                    {/* Spotlight Background */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                            background:
                                'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.06), transparent 40%)',
                        }}
                    ></div>
                    {/* Spotlight Border */}
                    <div
                        className="pointer-events-none absolute inset-0 rounded-[32px] border border-brand-sky/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                            maskImage: 'radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)',
                            WebkitMaskImage: 'radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)',
                        }}
                    ></div>

                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <h3 className="text-2xl font-semibold tracking-tight text-white mb-4 relative z-10">Command Center</h3>
                    <p className="text-base text-white/50 leading-relaxed mb-12 relative z-10 font-light">
                        Orchestrate global campaigns from a single interface. Real-time budget allocation, asset approval, and performance telemetry.
                    </p>

                    {/* Visual: Chat/Terminal UI */}
                    <div className="relative z-10 mt-auto w-full h-72 rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2 opacity-50">
                                <div className="w-2 h-2 rounded-full bg-white/40"></div>
                                <div className="w-2 h-2 rounded-full bg-white/40"></div>
                            </div>
                            <span className="text-xs text-white/30 font-mono">REACH_OS v1.0</span>
                        </div>
                        {/* Body */}
                        <div className="p-6 flex flex-col gap-5 relative h-full">
                            <div className="absolute top-0 right-0 bottom-0 left-0"></div>

                            {/* User Message */}
                            <div className="self-end max-w-[90%] bg-white/10 backdrop-blur-sm rounded-2xl rounded-tr-sm p-4 border border-white/5 animate-[fadeIn_1s_ease-out]">
                                <p className="text-xs text-white/90 font-light leading-relaxed">
                                    Launch Campaign: <span className="text-white font-medium">Summer Collection</span>. Budget:{' '}
                                    <span className="text-brand-sky">$50k</span>.
                                </p>
                            </div>

                            {/* System Message */}
                            <div className="self-start max-w-[90%] bg-white/[0.03] backdrop-blur-md rounded-2xl rounded-tl-sm p-5 border border-white/10 relative overflow-hidden group-hover:border-brand-sky/20 transition-colors duration-500">
                                <div className="flex items-center gap-2 mb-3 text-brand-sky font-mono text-[10px] uppercase tracking-wider">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-sparkles"
                                    >
                                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"></path>
                                    </svg>{' '}
                                    Reachstakes AI
                                </div>
                                <p className="mb-4 text-xs text-white/80 font-light">
                                    Matching with 15 creator profiles...
                                </p>

                                {/* Progress Bar */}
                                <div className="w-full bg-black/40 rounded-full h-1.5 mb-2 overflow-hidden">
                                    <div className="bg-brand-sky h-full w-[85%] animate-[pulse_2s_infinite]"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-brand-sky/60 font-mono">
                                    <span>EXECUTING</span>
                                    <span>$50,000.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Smart Liquidity (Clean & Hero Inspired) */}
                <div className="spotlight-card relative flex flex-col p-[1px] rounded-[32px] overflow-hidden lg:-mt-8 lg:mb-8 z-20 group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent rounded-[32px]"></div>
                    <div className="absolute inset-0 bg-[#050505] rounded-[31px] m-[1px] overflow-hidden">
                        {/* Inner Spotlight Background */}
                        <div
                            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                            style={{
                                background:
                                    'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.06), transparent 40%)',
                            }}
                        ></div>
                    </div>

                    {/* Spotlight Border Overlay */}
                    <div
                        className="pointer-events-none absolute inset-0 rounded-[32px] border border-brand-sky/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-50"
                        style={{
                            maskImage: 'radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)',
                            WebkitMaskImage: 'radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)',
                        }}
                    ></div>

                    <div className="relative z-10 flex flex-col h-full p-10 group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-brand-sky/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-zap text-brand-sky relative z-10"
                                >
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold tracking-tight text-white group-hover:text-white transition-colors">
                                Yield Generation
                            </h3>
                        </div>
                        <p className="text-base text-white/50 leading-relaxed mb-12 font-light group-hover:text-white/70 transition-colors">
                            Maximize your professional value. Access curated opportunities, manage submissions, and automate revenue streams.
                        </p>

                        {/* Visual: Hero-Inspired Orbit & Sonar */}
                        <div className="mt-auto relative w-full h-80 flex items-center justify-center perspective-1000">
                            {/* Animated Background Noodles & Beams */}
                            <svg
                                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
                                viewBox="0 0 400 320"
                                preserveAspectRatio="xMidYMid slice"
                            >
                                <defs>
                                    <linearGradient id="smart-beam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
                                        <stop offset="50%" stopColor="rgba(56, 189, 248, 1)" />
                                        <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                                    </linearGradient>
                                </defs>

                                {/* Path 1: Top Right into Center */}
                                <path
                                    d="M420,40 C320,40 280,160 200,160"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.03)"
                                    strokeWidth="1"
                                ></path>
                                <path
                                    d="M420,40 C320,40 280,160 200,160"
                                    fill="none"
                                    stroke="url(#smart-beam-grad)"
                                    strokeWidth="1.5"
                                    strokeDasharray="100 1000"
                                    strokeLinecap="round"
                                    className="animate-[beam_3s_linear_infinite]"
                                ></path>

                                {/* Path 2: Bottom Left into Center */}
                                <path
                                    d="M-20,280 C80,280 120,160 200,160"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.03)"
                                    strokeWidth="1"
                                ></path>
                                <path
                                    d="M-20,280 C80,280 120,160 200,160"
                                    fill="none"
                                    stroke="url(#smart-beam-grad)"
                                    strokeWidth="1.5"
                                    strokeDasharray="80 1000"
                                    strokeLinecap="round"
                                    className="animate-[beam_4s_linear_infinite]"
                                ></path>

                                {/* Path 3: Vertical Drop */}
                                <path
                                    d="M200,0 L200,160"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.03)"
                                    strokeWidth="1"
                                    strokeDasharray="2 4"
                                ></path>
                            </svg>

                            {/* Clean Sonar Rings */}
                            <div className="absolute w-96 h-96 border border-brand-sky/5 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] opacity-10"></div>
                            <div className="absolute w-80 h-80 border border-white/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20 delay-700"></div>

                            {/* Outer Rotating Ring with Detail */}
                            <div className="absolute w-64 h-64 border border-white/5 rounded-full animate-[spin_40s_linear_infinite]">
                                <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white/10 rounded-full"></div>
                                <div className="absolute top-1/2 -left-1 w-2 h-2 bg-white/10 rounded-full"></div>
                            </div>

                            {/* Middle Rotating Ring */}
                            <div className="absolute w-60 h-60 border border-white/10 rounded-full animate-[spin_30s_linear_infinite]"></div>

                            {/* Inner Dashed Ring */}
                            <div className="absolute w-44 h-44 border border-white/5 rounded-full animate-[spin_20s_linear_infinite_reverse] border-dashed"></div>

                            {/* Active Glow Ring */}
                            <div className="absolute w-36 h-36 border border-brand-sky/20 rounded-full animate-[spin_15s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-sky mt-[-3px] rounded-full shadow-[0_0_10px_rgba(56,189,248,1)]"></div>
                            </div>

                            {/* Orbiting Elements */}
                            <div className="absolute w-60 h-60 animate-[spin_30s_linear_infinite]">
                                {/* Gem Node */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050505] p-2.5 rounded-full border border-white/10 group-hover:border-brand-sky/30 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] transition-all duration-500">
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
                                        className="lucide lucide-gem text-white/40 group-hover:text-brand-sky transition-colors"
                                    >
                                        <path d="M6 3h12l4 6-10 13L2 9Z"></path>
                                        <path d="M11 3 8 9l4 13 4-13-3-6"></path>
                                        <path d="M2 9h20"></path>
                                    </svg>
                                </div>
                                {/* Card Node */}
                                <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 bg-[#050505] p-2.5 rounded-full border border-white/10 group-hover:border-brand-sky/30 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] transition-all duration-500">
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
                                        className="lucide lucide-credit-card text-white/40 group-hover:text-brand-sky transition-colors"
                                    >
                                        <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                                        <line x1="2" x2="22" y1="10" y2="10"></line>
                                    </svg>
                                </div>
                            </div>

                            {/* Central Hub */}
                            <div className="z-10 flex group-hover:border-brand-sky/40 transition-colors duration-500 bg-[#0F110E] w-24 h-24 border-white/10 border rounded-3xl relative items-center justify-center overflow-hidden shadow-2xl">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-layers text-white relative z-20 group-hover:text-brand-sky transition-colors duration-500"
                                >
                                    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path>
                                    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path>
                                    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>
                                </svg>
                                {/* Scanner Effect */}
                                <div className="animate-[pulse_2s_infinite] bg-gradient-to-tr from-transparent via-brand-sky/10 to-transparent absolute top-0 right-0 bottom-0 left-0 z-10"></div>
                                {/* Technical Grid BG */}
                                <div
                                    className="absolute inset-0 opacity-20 z-0"
                                    style={{
                                        backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)',
                                        backgroundSize: '18px 18px',
                                    }}
                                ></div>
                            </div>

                            <div className="absolute bottom-4 flex flex-col items-center">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 group-hover:border-brand-sky/20 transition-colors">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-sky opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-sky"></span>
                                    </span>
                                    <div className="text-[10px] text-white/40 font-mono tracking-widest uppercase group-hover:text-white/70 transition-colors">
                                        Creator Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Multi-Sig Governance */}
                <div className="spotlight-card group relative flex flex-col p-10 rounded-[32px] border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-500">
                    {/* Spotlight Background */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                            background:
                                'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.06), transparent 40%)',
                        }}
                    ></div>
                    {/* Spotlight Border */}
                    <div
                        className="pointer-events-none absolute inset-0 rounded-[32px] border border-brand-sky/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                            maskImage: 'radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)',
                            WebkitMaskImage: 'radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)',
                        }}
                    ></div>

                    <h3 className="text-2xl font-semibold tracking-tight text-white mb-4 relative z-10">The Settlement Layer</h3>
                    <p className="text-base text-white/50 leading-relaxed mb-12 relative z-10 font-light">
                        Frictionless communication and instant payouts. Trustless transparency for every deliverable.
                    </p>

                    {/* Visual: Dashboard UI */}
                    <div className="relative mt-auto w-full h-72 rounded-2xl border border-white/10 bg-[#0A0A0A] p-7 flex flex-col justify-center gap-6 shadow-2xl">
                        {/* Team Header */}
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-none"></span>
                                <span className="text-xs text-white/50 font-mono uppercase tracking-wider">Campaign_Chat</span>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="w-7 h-7 rounded-full border border-[#0A0A0A] bg-white/10 flex items-center justify-center text-white/80 text-[10px] font-medium">
                                    JD
                                </div>
                                <div className="w-7 h-7 rounded-full border border-[#0A0A0A] bg-brand-sky/20 flex items-center justify-center text-brand-sky text-[10px] font-medium">
                                    AS
                                </div>
                                <div className="w-7 h-7 rounded-full border border-[#0A0A0A] bg-white/5 flex items-center justify-center text-[9px] text-white/40">
                                    +3
                                </div>
                            </div>
                        </div>

                        {/* Approval Slider */}
                        <div className="relative py-1">
                            <div className="flex justify-between text-[10px] text-white/40 mb-2 font-mono uppercase">
                                <span className="">Video Approval</span>
                                <span className="text-brand-sky">Approved</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full relative flex items-center">
                                <div className="absolute left-0 h-full w-[75%] bg-white/80 rounded-full"></div>
                                {/* Slider Knob */}
                                <div className="absolute left-[75%] w-4 h-4 bg-white rounded-full z-10 transform -translate-x-1/2 border-2 border-[#0A0A0A] cursor-grab"></div>

                                {/* Tooltip */}
                                <div className="absolute left-[75%] -top-9 -translate-x-1/2 bg-[#151515] border border-white/10 text-white text-[10px] px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap animate-bounce">
                                    Signed by Alex
                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#151515] border-r border-b border-white/10 transform rotate-45"></div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-history text-white/40"
                                >
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"></path>
                                    <path d="M3 3v9h9"></path>
                                    <path d="M12 7v5l4 2"></path>
                                </svg>
                                <span className="text-xs text-white/60 font-medium">Audit Log</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-brand-sky/10 border border-brand-sky/20 cursor-pointer hover:bg-brand-sky/20 transition-colors">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-check-circle text-brand-sky"
                                >
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <path d="m9 11 3 3L22 4"></path>
                                </svg>
                                <span className="text-xs text-brand-sky font-medium">Approve Tx</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            <div className="mt-24 relative z-10">
                <button className="group relative px-9 py-4 rounded-full bg-white text-black font-semibold text-sm transition-all duration-300 hover:bg-[#e5e5e5] flex items-center gap-3 overflow-hidden tracking-tight">
                    <span className="relative z-10">Start Your Journey</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-arrow-right relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                    >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                    </svg>

                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-0"></div>
                </button>
            </div>
        </section>
    );
};

export default Features;
