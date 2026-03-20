import { useState } from "react";

/**
 * usePayoutMethods — MVP hook for payout method management.
 * Uses local state with mock data since backend isn't implemented yet.
 */
const usePayoutMethods = () => {
  const [methods, setMethods] = useState([
    // Pre-populate with a sample method for UI demonstration
    // Remove this when backend is available
  ]);
  const [loading, setLoading] = useState(false);

  const addMethod = (method) => {
    const newMethod = {
      id: Date.now().toString(),
      ...method,
    };
    setMethods((prev) => [...prev, newMethod]);
    return newMethod;
  };

  const removeMethod = (id) => {
    if (!confirm("Are you sure you want to remove this payout method?")) return;
    setMethods((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMethod = (id, updates) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  return { methods, loading, addMethod, removeMethod, updateMethod };
};

export default usePayoutMethods;
