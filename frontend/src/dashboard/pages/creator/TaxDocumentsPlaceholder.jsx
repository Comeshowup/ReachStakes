import React from "react";
import { FileText } from "lucide-react";

const TaxDocumentsPlaceholder = () => (
  <div
    className="flex flex-col items-center justify-center py-20 rounded-2xl"
    style={{
      background: "var(--bd-surface-overlay)",
      border: "1px solid var(--bd-border-subtle)",
    }}
  >
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: "var(--bd-surface-input)" }}
    >
      <FileText className="w-7 h-7" style={{ color: "var(--bd-text-secondary)" }} />
    </div>
    <h3
      className="text-lg font-semibold mb-2"
      style={{ color: "var(--bd-text-primary)" }}
    >
      Tax Documents
    </h3>
    <p
      className="text-sm text-center max-w-sm"
      style={{ color: "var(--bd-text-secondary)" }}
    >
      Tax document management is coming soon. You'll be able to view and download
      your W-9, 1099, and other tax forms here.
    </p>
  </div>
);

export default TaxDocumentsPlaceholder;
