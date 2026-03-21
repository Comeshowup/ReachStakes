import React from "react";

const ServicesSection = ({ services }) => {
  // Hide if no services
  if (!services || services.length === 0) return null;

  // Only show enabled services
  const enabledServices = services.filter((s) => s.isEnabled !== false);
  if (enabledServices.length === 0) return null;

  const formatPrice = (price) => {
    if (!price || Number(price) === 0) return "Request Quote";
    const num = Number(price);
    return `₹${num.toLocaleString()}`;
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Services & Packages</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {enabledServices.slice(0, 6).map((service) => (
          <div
            key={service.id || service.title}
            className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {service.title}
              </h3>
              <span className="text-sm font-semibold text-emerald-400 whitespace-nowrap ml-3">
                {formatPrice(service.price)}
              </span>
            </div>

            {/* Description / Deliverables */}
            {service.description && (
              <p className="text-sm text-slate-400 mb-3 leading-relaxed">
                {service.description}
              </p>
            )}

            {/* Deliverables list (if provided as array in future) */}
            {service.deliverables && Array.isArray(service.deliverables) && (
              <ul className="space-y-1 mb-3">
                {service.deliverables.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-400 flex items-start gap-2"
                  >
                    <span className="text-indigo-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {/* Turnaround */}
            {service.turnaroundTime && (
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                {service.turnaroundTime} turnaround
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
