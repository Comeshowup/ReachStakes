import React, { useState } from "react";
import { Plus, Wallet, Building2 } from "lucide-react";
import SettingsCard from "../components/SettingsCard";
import PayoutMethodCard from "../components/PayoutMethodCard";
import FormField, { Input, Select } from "../components/FormField";
import usePayoutMethods from "../hooks/usePayoutMethods";

/**
 * PayoutsPage — Manage payout methods (Stripe-style UI).
 */
const PayoutsPage = () => {
  const { methods, loading, addMethod, removeMethod } = usePayoutMethods();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({
    bankName: "",
    accountEnding: "",
    country: "",
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newMethod.bankName || !newMethod.accountEnding) return;
    addMethod(newMethod);
    setNewMethod({ bankName: "", accountEnding: "", country: "" });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Existing methods */}
      {methods.length > 0 && (
        <div className="space-y-3">
          {methods.map((method, index) => (
            <PayoutMethodCard
              key={method.id}
              method={method}
              isDefault={index === 0}
              onEdit={() => {}}
              onRemove={removeMethod}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {methods.length === 0 && !showAddForm && (
        <div
          className="text-center py-14 px-6 rounded-2xl"
          style={{
            background: "var(--bd-surface)",
            border: "1px dashed var(--bd-border-default)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "var(--bd-surface-input)",
              border: "1px solid var(--bd-border-muted)",
            }}
          >
            <Wallet
              className="w-7 h-7"
              style={{ color: "var(--bd-text-muted)" }}
            />
          </div>
          <h4
            className="text-base font-medium mb-1"
            style={{ color: "var(--bd-text-primary)" }}
          >
            No payout method configured
          </h4>
          <p
            className="text-sm max-w-sm mx-auto mb-5"
            style={{ color: "var(--bd-text-secondary)" }}
          >
            Add a payout method to receive your campaign earnings. We support
            bank transfers and more.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "var(--bd-primary)",
              color: "var(--bd-primary-fg)",
              boxShadow: "var(--bd-shadow-primary-btn)",
            }}
          >
            <Plus className="w-4 h-4" />
            Add payout method
          </button>
        </div>
      )}

      {/* Add payout method form */}
      {showAddForm && (
        <SettingsCard
          title="Add payout method"
          description="Enter your bank details to receive payouts."
        >
          <form onSubmit={handleAdd} className="space-y-4">
            <FormField label="Bank name">
              <Input
                value={newMethod.bankName}
                onChange={(e) =>
                  setNewMethod((p) => ({ ...p, bankName: e.target.value }))
                }
                placeholder="e.g. Chase, Bank of America"
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Account number (last 4 digits)">
                <Input
                  value={newMethod.accountEnding}
                  onChange={(e) =>
                    setNewMethod((p) => ({
                      ...p,
                      accountEnding: e.target.value.slice(0, 4),
                    }))
                  }
                  placeholder="1234"
                  maxLength={4}
                  required
                />
              </FormField>

              <FormField label="Country">
                <Select
                  value={newMethod.country}
                  onChange={(e) =>
                    setNewMethod((p) => ({ ...p, country: e.target.value }))
                  }
                >
                  <option value="">Select country...</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </Select>
              </FormField>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "var(--bd-primary)",
                  color: "var(--bd-primary-fg)",
                  boxShadow: "var(--bd-shadow-primary-btn)",
                }}
              >
                Add method
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ color: "var(--bd-text-secondary)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </SettingsCard>
      )}

      {/* Add more button — shown only when methods already exist */}
      {methods.length > 0 && !showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all"
          style={{
            border: "1px dashed var(--bd-border-default)",
            color: "var(--bd-text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--bd-accent)";
            e.currentTarget.style.color = "var(--bd-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--bd-border-default)";
            e.currentTarget.style.color = "var(--bd-text-secondary)";
          }}
        >
          <Plus className="w-4 h-4" />
          Add another payout method
        </button>
      )}

      {/* Info card */}
      <div
        className="p-5 rounded-2xl"
        style={{
          background: "var(--bd-info-muted)",
          border: "1px solid var(--bd-info-border)",
        }}
      >
        <h4
          className="text-sm font-medium mb-1"
          style={{ color: "var(--bd-text-primary)" }}
        >
          Payout schedule
        </h4>
        <p className="text-sm" style={{ color: "var(--bd-text-secondary)" }}>
          Payouts are processed within 7 business days after a campaign is
          marked complete. Minimum payout threshold is $25.
        </p>
      </div>
    </div>
  );
};

export default PayoutsPage;
