import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Target,
  DollarSign,
  Users,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const steps = [
  { id: 1, title: "Objective", icon: Target },
  { id: 2, title: "Budget & Escrow", icon: DollarSign },
  { id: 3, title: "Creators", icon: Users },
  { id: 4, title: "Timeline", icon: Calendar },
  { id: 5, title: "Review", icon: ShieldCheck },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    objective: "conversions",
    budget: 50000,
    escrow: 20000,
    riskTolerance: "low",
    creators: [],
    startDate: "",
    endDate: "",
  });

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep((c) => c + 1);
    else navigate("/");
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((c) => c - 1);
    else navigate("/");
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Campaign
          </h1>
          <p className="text-sm text-slate-500">
            Configure your campaign parameters and capital
            allocation.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10 -translate-y-1/2" />
        <div className="flex justify-between">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900 px-2"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${
                      isActive
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                        : isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400"
                    }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step 1: Objective */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      What's your campaign objective?
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "Conversions",
                        "Brand Awareness",
                        "Traffic",
                        "UGC Creation",
                      ].map((obj) => (
                        <button
                          key={obj}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              objective: obj.toLowerCase(),
                            })
                          }
                          className={`flex flex-col items-start p-4 rounded-lg border-2 text-left transition-all
                            ${
                              formData.objective ===
                              obj.toLowerCase()
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                        >
                          <span
                            className={`font-semibold ${formData.objective === obj.toLowerCase() ? "text-indigo-900 dark:text-indigo-100" : "text-slate-900 dark:text-white"}`}
                          >
                            {obj}
                          </span>
                          <span className="text-sm text-slate-500 mt-1">
                            Optimize for {obj.toLowerCase()} and
                            capital efficiency.
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Campaign Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., Summer Collection Launch 2024"
                        className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Budget */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Budget & Escrow Allocation
                    </h2>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                          <span>Total Budget Limit</span>
                          <span className="text-slate-500 tabular-nums">
                            ${formData.budget.toLocaleString()}
                          </span>
                        </label>
                        <input
                          type="range"
                          min="5000"
                          max="500000"
                          step="1000"
                          value={formData.budget}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              budget: Number(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>$5k</span>
                          <span>$500k</span>
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-amber-900 dark:text-amber-400">
                            Escrow Requirement
                          </h4>
                          <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                            Based on your risk profile, we
                            recommend locking{" "}
                            <span className="font-bold">
                              40%
                            </span>{" "}
                            of your budget in escrow ($20,000)
                            to ensure creator payouts.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                          <span className="text-xs text-slate-500 uppercase tracking-wider">
                            Available Spend
                          </span>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                            $
                            {(
                              formData.budget * 0.6
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            Escrow Locked
                          </span>
                          <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mt-1 tabular-nums">
                            $
                            {(
                              formData.budget * 0.4
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Creators (Placeholder) */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Creator Targeting
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Select creator tiers to target for this
                      campaign.
                    </p>

                    <div className="space-y-3">
                      {[
                        "Tier 1: Mega (1M+)",
                        "Tier 2: Macro (100k-1M)",
                        "Tier 3: Micro (10k-100k)",
                        "Tier 4: Nano (<10k)",
                      ].map((tier, i) => (
                        <label
                          key={i}
                          className="flex items-center p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          />
                          <span className="ml-3 font-medium text-slate-900 dark:text-white">
                            {tier}
                          </span>
                          <span className="ml-auto text-sm text-slate-500">
                            Est. CPA: ${10 + i * 5}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Timeline */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Campaign Timeline
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Start Date
                        </label>
                        <input
                          type="date"
                          className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          End Date
                        </label>
                        <input
                          type="date"
                          className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 flex items-start gap-3">
                      <Info className="h-5 w-5 text-slate-400 mt-0.5" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Campaigns with a duration of 30+ days
                        typically see a 15% better ROAS due to
                        creator optimization time.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Review & Launch
                    </h2>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                      <div className="p-4 flex justify-between">
                        <span className="text-slate-500">
                          Objective
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white capitalize">
                          {formData.objective}
                        </span>
                      </div>
                      <div className="p-4 flex justify-between">
                        <span className="text-slate-500">
                          Total Budget
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                          ${formData.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-4 flex justify-between">
                        <span className="text-slate-500">
                          Escrow Lock
                        </span>
                        <span className="font-medium text-emerald-600 tabular-nums">
                          $
                          {(
                            formData.budget * 0.4
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-4 flex justify-between">
                        <span className="text-slate-500">
                          Risk Profile
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          Low
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span>
                        Capital is protected by ReachStakes
                        Smart Escrow™
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-none transition-colors flex items-center gap-2"
            >
              {currentStep === 5
                ? "Launch Campaign"
                : "Continue"}
              {currentStep !== 5 && (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Right Side Summary Panel */}
        <div className="hidden lg:block space-y-6">
          <div className="sticky top-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Draft Summary
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    Projected Reach
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                    1.2M - 1.5M
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    Est. ROAS
                  </div>
                  <div className="text-xl font-bold text-emerald-600 tabular-nums">
                    2.8x - 3.5x
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    Creator Capacity
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                    ~25 Creators
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 my-4 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Platform Fee
                    </span>
                    <span className="text-sm font-medium tabular-nums text-slate-900 dark:text-white">
                      $750
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Escrow Buffer
                    </span>
                    <span className="text-sm font-medium tabular-nums text-slate-900 dark:text-white">
                      $2,000
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
              <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                Expert Tip
              </h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                Allocating at least 40% to escrow improves
                creator trust and can increase application rates
                by 25%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}