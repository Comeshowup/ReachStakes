import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Mail, Briefcase, CheckCircle, ChevronLeft, ChevronRight, Video } from 'lucide-react';

// --- Utils ---
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// --- Components ---

const CalendarView = ({ selectedDate, onSelectDate }) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const isDateDisabled = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        // Disable past dates and weekends
        return date < new Date(today.setHours(0, 0, 0, 0)) || dayOfWeek === 0 || dayOfWeek === 6;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {[...Array(firstDay)].map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const date = new Date(currentYear, currentMonth, day);
                    const disabled = isDateDisabled(day);
                    const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;

                    return (
                        <button
                            key={day}
                            disabled={disabled}
                            onClick={() => onSelectDate(date)}
                            className={`
                                aspect-square rounded-xl flex items-center justify-center text-sm transition-all relative
                                ${isSelected
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : disabled
                                        ? 'text-gray-300 dark:text-slate-700 cursor-not-allowed'
                                        : 'text-gray-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600'
                                }
                            `}
                        >
                            {day}
                            {isSelected && <motion.div layoutId="selectedDay" className="absolute inset-0 border-2 border-white/20 rounded-xl" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const TimeSlotPicker = ({ selectedDate, selectedSlot, onSelectSlot }) => {
    // Mock slots
    const slots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM",
        "01:00 PM", "02:30 PM", "03:00 PM", "04:00 PM"
    ];

    if (!selectedDate) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <Calendar className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a date to view available time slots</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Available Slots for {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {slots.map((slot) => (
                    <button
                        key={slot}
                        onClick={() => onSelectSlot(slot)}
                        className={`
                            py-3 px-4 rounded-xl text-sm font-medium border transition-all text-center
                            ${selectedSlot === slot
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                            }
                        `}
                    >
                        {slot}
                    </button>
                ))}
            </div>
        </div>
    );
};

const BookingForm = ({ onSubmit, onBack, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        email: '',
        role: 'brand', // default
        agenda: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                        Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {['brand', 'creator'].map(role => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setFormData({ ...formData, role })}
                                className={`
                                    py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium border capitalize
                                    ${formData.role === role
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400'
                                    }
                                `}
                            >
                                <Briefcase className="w-4 h-4" />
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Enter your name"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="you@company.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Meeting Agenda (Optional)</label>
                    <textarea
                        rows="3"
                        value={formData.agenda}
                        onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                        placeholder="What would you like to discuss?"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="flex-1 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
                >
                    Confirm Booking
                </button>
            </div>
        </motion.form>
    );
};

const SuccessView = ({ data, date, slot }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
    >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Meeting Scheduled!</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
            We've sent a calendar invitation to <strong className="text-gray-900 dark:text-white">{data.email}</strong>.
        </p>

        <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-6 max-w-sm mx-auto text-left border border-gray-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Meeting Details</h4>
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{slot}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Google Meet</span>
                </div>
            </div>
        </div>

        <button
            onClick={() => window.location.href = '/'}
            className="mt-8 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
            Return to Home
        </button>
    </motion.div>
);

// --- Main Page Component ---
const MeetingPage = () => {
    const [step, setStep] = useState(1); // 1: Select Date/Slot, 2: Details, 3: Success
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingData, setBookingData] = useState(null);

    // Check for logged in user (mock using localStorage or window global if available, else null)
    // For this demo we'll assume not logged in unless we had a context.
    // In a real app we'd pull from AuthContext.
    const initialUserData = null;

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null); // Reset slot on date change
    };

    const handleSlotConfirm = () => {
        if (selectedDate && selectedSlot) {
            setStep(2);
        }
    };

    const handleBookingSubmit = (data) => {
        // Here we would perform the API call
        console.log("Submitting booking:", { date: selectedDate, slot: selectedSlot, ...data });
        setBookingData(data);
        setTimeout(() => setStep(3), 1000); // Simulate API latency
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100 dark:border-slate-800">
                {/* Left Side - Info Panel */}
                <div className="md:w-1/3 bg-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl mb-6 flex items-center justify-center backdrop-blur-sm">
                            <Video className="w-6 h-6 text-indigo-300" />
                        </div>
                        <h1 className="text-3xl font-bold mb-3">Book a Call</h1>
                        <p className="text-slate-300 leading-relaxed">
                            Schedule a 30-minute consultation with our agent to discuss your campaign goals, creator partnerships, or platform features.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-start gap-3 text-sm text-slate-300">
                            <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                            <p>Strategic Campaign Planning</p>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-slate-300">
                            <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                            <p>Creator Matching Assistance</p>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-slate-300">
                            <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                            <p>Platform Usage Demo</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Interactive Area */}
                <div className="md:w-2/3 p-6 md:p-10 relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col"
                            >
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select a Date & Time</h2>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Choose a slot that works for you.</p>
                                </div>

                                <div className="flex flex-col lg:flex-row gap-8 flex-1">
                                    <div className="flex-1">
                                        <CalendarView selectedDate={selectedDate} onSelectDate={handleDateSelect} />
                                    </div>
                                    <div className="lg:w-64 flex flex-col">
                                        <div className="flex-1">
                                            <TimeSlotPicker
                                                selectedDate={selectedDate}
                                                selectedSlot={selectedSlot}
                                                onSelectSlot={setSelectedSlot}
                                            />
                                        </div>
                                        <button
                                            disabled={!selectedDate || !selectedSlot}
                                            onClick={handleSlotConfirm}
                                            className="w-full mt-4 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:shadow-none transition-all hover:bg-indigo-700 active:scale-95"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Details</h2>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">
                                        {selectedDate?.toLocaleDateString()} at {selectedSlot}
                                    </p>
                                </div>
                                <BookingForm
                                    initialData={initialUserData}
                                    onBack={() => setStep(1)}
                                    onSubmit={handleBookingSubmit}
                                />
                            </motion.div>
                        )}

                        {step === 3 && (
                            <SuccessView
                                key="success"
                                data={bookingData}
                                date={selectedDate}
                                slot={selectedSlot}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MeetingPage;
