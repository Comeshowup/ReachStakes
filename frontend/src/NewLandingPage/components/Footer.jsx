import React from 'react';

const Footer = () => {
    return (
        <footer className="lg:px-12 flex flex-col z-10 overflow-hidden bg-[#030303] w-full border-white/5 border-t pt-12 pr-6 pb-12 pl-6 relative items-center">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_200px] [mask-image:linear-gradient(to_bottom,transparent,black_20%)] pointer-events-none"></div>

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 relative z-10">
                {/* Brand Column */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center w-10 h-10 bg-white/5 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                style={{ width: '24px', height: '24px', color: 'rgb(56, 189, 248)' }}
                                className="iconify iconify--solar w-[24px] h-[24px]"
                                aria-hidden="true"
                                role="img"
                            >
                                <path
                                    fill="#38bdf8"
                                    d="M4.929 4.929c-3.905 3.905-3.905 10.237 0 14.142s10.237 3.905 14.142 0s3.905-10.237 0-14.142s-10.237-3.905-14.142 0"
                                    opacity=".5"
                                ></path>
                                <path
                                    fill="#38bdf8"
                                    d="M18.521 4.418L4.418 18.521a10 10 0 0 0 1.06 1.061L19.583 5.479a10 10 0 0 0-1.06-1.06"
                                ></path>
                            </svg>
                        </div>
                        <span className="font-serif font-medium text-2xl tracking-tight text-white">Reachstakes</span>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed max-w-[280px] font-light">
                        We empower Brands to find their perfect voice and Creators to maximize their professional potential.
                    </p>
                    {/* Monotone Socials */}
                    <div className="flex gap-5 mt-4">
                        <a href="#" className="text-white/30 hover:text-white transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="img"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="m17.687 3.063l-4.996 5.711l-4.32-5.711H2.112l7.477 9.776l-7.086 8.099h3.034l5.469-6.25l4.78 6.25h6.102l-7.794-10.304l6.625-7.571zm-1.064 16.06L5.654 4.782h1.803l10.846 14.34z"
                                ></path>
                            </svg>
                        </a>
                        <a href="#" className="text-white/30 hover:text-white transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="img"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M12.001 2c-5.525 0-10 4.475-10 10a9.99 9.99 0 0 0 6.837 9.488c.5.087.688-.213.688-.476c0-.237-.013-1.024-.013-1.862c-2.512.463-3.162-.612-3.362-1.175c-.113-.288-.6-1.175-1.025-1.413c-.35-.187-.85-.65-.013-.662c.788-.013 1.35.725 1.538 1.025c.9 1.512 2.337 1.087 2.912.825c.088-.65.35-1.087.638-1.337c-2.225-.25-4.55-1.113-4.55-4.938c0-1.088.387-1.987 1.025-2.687c-.1-.25-.45-1.275.1-2.65c0 0 .837-.263 2.75 1.024a9.3 9.3 0 0 1 2.5-.337c.85 0 1.7.112 2.5.337c1.913-1.3 2.75-1.024 2.75-1.024c.55 1.375.2 2.4.1 2.65c.637.7 1.025 1.587 1.025 2.687c0 3.838-2.337 4.688-4.562 4.938c.362.312.675.912.675 1.85c0 1.337-.013 2.412-.013 2.75c0 .262.188.574.688.474A10.02 10.02 0 0 0 22 12c0-5.525-4.475-10-10-10"
                                ></path>
                            </svg>
                        </a>
                        <a href="#" className="text-white/30 hover:text-white transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="img"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M6.94 5a2 2 0 1 1-4-.002a2 2 0 0 1 4 .002M7 8.48H3V21h4zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91z"
                                ></path>
                            </svg>
                        </a>
                        <a href="#" className="text-white/30 hover:text-white transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="img"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M19.303 5.337A17.3 17.3 0 0 0 14.963 4c-.191.329-.403.775-.552 1.125a16.6 16.6 0 0 0-4.808 0C9.454 4.775 9.23 4.329 9.05 4a17 17 0 0 0-4.342 1.337C1.961 9.391 1.218 13.35 1.59 17.255a17.7 17.7 0 0 0 5.318 2.664a13 13 0 0 0 1.136-1.836c-.627-.234-1.22-.52-1.794-.86c.149-.106.297-.223.435-.34c3.46 1.582 7.207 1.582 10.624 0c.149.117.287.234.435.34c-.573.34-1.167.626-1.793.86a13 13 0 0 0 1.135 1.836a17.6 17.6 0 0 0 5.318-2.664c.457-4.52-.722-8.448-3.1-11.918M8.52 14.846c-1.04 0-1.889-.945-1.889-2.101s.828-2.102 1.89-2.102c1.05 0 1.91.945 1.888 2.102c0 1.156-.838 2.1-1.889 2.1m6.974 0c-1.04 0-1.89-.945-1.89-2.101s.828-2.102 1.89-2.102c1.05 0 1.91.945 1.889 2.102c0 1.156-.828 2.1-1.89 2.1"
                                ></path>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="lg:col-span-2 flex flex-col gap-6 pt-2">
                    <h4 className="text-white font-medium text-sm tracking-wide">Platform</h4>
                    <ul className="flex flex-col gap-3.5">
                        <li className="">
                            <a href="#" className="text-white/40 hover:text-brand-sky text-sm transition-colors font-light">
                                For Brands
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-white/40 hover:text-brand-sky text-sm transition-colors font-light">
                                For Creators
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-white/40 hover:text-brand-sky text-sm transition-colors font-light">
                                Case Studies
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="flex items-center gap-2 text-white/40 hover:text-brand-sky text-sm transition-colors font-light"
                            >
                                System Status
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6 pt-2">
                    <h4 className="text-white font-medium text-sm tracking-wide">Company</h4>
                    <ul className="flex flex-col gap-3.5">
                        <li className="">
                            <a href="#" className="text-white/40 hover:text-brand-sky text-sm transition-colors font-light">
                                Philosophy
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-white/40 hover:text-brand-sky text-sm transition-colors font-light">
                                Careers
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-white/40 hover:text-brand-sky text-sm transition-colors font-light">
                                Press Kit
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-white/40 hover:text-brand-sky text-sm transition-colors font-light">
                                Legal
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Large Action Buttons */}
                <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-row gap-4 lg:gap-4 mt-8 lg:mt-0">
                    {/* Contact Sales */}
                    <a
                        href="#"
                        className="flex-1 group relative p-7 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-36 lg:h-40 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <span className="text-white font-medium text-sm tracking-wide">Initialize Partnership</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="img"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                className="iconify text-white/20 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="M17.47 15.53a.75.75 0 0 0 1.28-.53V6a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0-.53 1.28z"
                                    clipRule="evenodd"
                                ></path>
                                <path
                                    fill="currentColor"
                                    d="M5.47 17.47a.75.75 0 1 0 1.06 1.06l6.97-6.97l-1.06-1.06z"
                                    opacity=".5"
                                ></path>
                            </svg>
                        </div>
                        <div className="relative z-10 flex items-end justify-between">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="img"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                className="iconify text-brand-sky/60 w-8 h-8 group-hover:scale-110 transition-transform duration-300"
                            >
                                <path
                                    fill="currentColor"
                                    d="M4.892 9.614c0-.402.323-.728.722-.728H9.47c.4 0 .723.326.723.728a.726.726 0 0 1-.723.729H5.614a.726.726 0 0 1-.722-.729"
                                ></path>
                                <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="M21.188 10.004q-.094-.005-.2-.004h-2.773C15.944 10 14 11.736 14 14s1.944 4 4.215 4h2.773q.106.001.2-.004c.923-.056 1.739-.757 1.808-1.737c.004-.064.004-.133.004-.197v-4.124c0-.064 0-.133-.004-.197c-.069-.98-.885-1.68-1.808-1.737m-3.217 5.063c.584 0 1.058-.478 1.058-1.067c0-.59-.474-1.067-1.058-1.067s-1.06.478-1.06 1.067c0 .59.475 1.067 1.06 1.067"
                                    clipRule="evenodd"
                                ></path>
                                <path
                                    fill="currentColor"
                                    d="M21.14 10.002c0-1.181-.044-2.448-.798-3.355a4 4 0 0 0-.233-.256c-.749-.748-1.698-1.08-2.87-1.238C16.099 5 14.644 5 12.806 5h-2.112C8.856 5 7.4 5 6.26 5.153c-1.172.158-2.121.49-2.87 1.238c-.748.749-1.08 1.698-1.238 2.87C2 10.401 2 11.856 2 13.694v.112c0 1.838 0 3.294.153 4.433c.158 1.172.49 2.121 1.238 2.87c.749.748 1.698 1.08 2.87 1.238c1.14.153 2.595.153 4.433.153h2.112c1.838 0 3.294 0 4.433-.153c1.172-.158 2.121-.49 2.87-1.238q.305-.308.526-.66c.45-.72.504-1.602.504-2.45l-.15.001h-2.774C15.944 18 14 16.264 14 14s1.944-4 4.215-4h2.773q.079 0 .151.002"
                                    opacity=".5"
                                ></path>
                                <path
                                    fill="currentColor"
                                    d="M10.101 2.572L8 3.992l-1.733 1.16C7.405 5 8.859 5 10.694 5h2.112c1.838 0 3.294 0 4.433.153q.344.045.662.114L16 4l-2.113-1.428a3.42 3.42 0 0 0-3.786 0"
                                ></path>
                            </svg>
                        </div>
                    </a>

                    {/* Help Center */}
                    <a
                        href="#"
                        className="flex-1 group relative p-7 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-36 lg:h-40 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <span className="text-white font-medium text-sm tracking-wide">Creator Support</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="img"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                className="iconify text-white/20 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="M17.47 15.53a.75.75 0 0 0 1.28-.53V6a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0-.53 1.28z"
                                    clipRule="evenodd"
                                ></path>
                                <path
                                    fill="currentColor"
                                    d="M5.47 17.47a.75.75 0 1 0 1.06 1.06l6.97-6.97l-1.06-1.06z"
                                    opacity=".5"
                                ></path>
                            </svg>
                        </div>
                        <div className="relative z-10 flex items-end justify-between">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="img"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                className="iconify text-brand-sky/60 w-8 h-8 group-hover:scale-110 transition-transform duration-300"
                            >
                                <path
                                    fill="currentColor"
                                    d="M2 12.124C2 6.533 6.477 2 12 2s10 4.533 10 10.124v5.243c0 .817 0 1.378-.143 1.87a3.52 3.52 0 0 1-1.847 2.188c-.458.22-1.004.307-1.801.434l-.13.02a13 13 0 0 1-.727.105c-.209.02-.422.027-.64-.016a2.1 2.1 0 0 1-1.561-1.35a2.2 2.2 0 0 1-.116-.639c-.012-.204-.012-.452-.012-.742v-4.173c0-.425 0-.791.097-1.105a2.1 2.1 0 0 1 1.528-1.43c.316-.073.677-.044 1.096-.01l.093.007l.11.01c.783.062 1.32.104 1.775.275q.481.181.883.487v-1.174c0-4.811-3.853-8.711-8.605-8.711s-8.605 3.9-8.605 8.711v1.174c.267-.203.563-.368.883-.487c.455-.17.992-.213 1.775-.276l.11-.009l.093-.007c.42-.034.78-.063 1.096.01a2.1 2.1 0 0 1 1.528 1.43c.098.314.097.68.097 1.105v4.172c0 .291 0 .54-.012.743c-.012.213-.04.427-.116.638a2.1 2.1 0 0 1-1.56 1.35a2.2 2.2 0 0 1-.641.017c-.201-.02-.444-.059-.727-.104l-.13-.02c-.797-.128-1.344-.215-1.801-.436a3.52 3.52 0 0 1-1.847-2.188c-.118-.405-.139-.857-.142-1.461L2 17.58z"
                                ></path>
                                <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="M12 5.75a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75m3 1.5a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0V8a.75.75 0 0 1 .75-.75m-6 0a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0V8A.75.75 0 0 1 9 7.25"
                                    clipRule="evenodd"
                                    opacity=".5"
                                ></path>
                            </svg>
                        </div>
                    </a>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="w-full max-w-7xl mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                <span className="text-white/20 text-xs font-mono tracking-wide">
                    © 2024 Reachstakes. All rights reserved.
                </span>
                <div className="flex items-center gap-8">
                    <span className="text-white/20 text-xs font-mono border-l border-white/10 pl-8">SOC2 Type II Compliant</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
