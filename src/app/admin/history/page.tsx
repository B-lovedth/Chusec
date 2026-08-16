"use client";

import { Search } from "lucide-react";

/**
 * Placeholder so the History tab is not a dead link. The full screen —
 * resolved-incident list, resolving-force call metadata, conversation log and
 * response timeline — is the next piece of work.
 */
export default function CommandHistoryPage() {
  return (
    <main className="page-card">
      <h1 className="command-title">History</h1>

      <div className="table-toolbar" style={{ padding: 0, marginBottom: 18 }}>
        <div className="control table-search">
          <span className="control__icon" aria-hidden="true">
            <Search size={16} strokeWidth={1.9} />
          </span>
          <input placeholder="Search...." aria-label="Search resolved incidents" disabled />
        </div>
      </div>

      <section className="command-panel">
        <div className="command-panel__head">
          <h2>Resolved incidents</h2>
        </div>
        <div className="table-shell" style={{ padding: 40, textAlign: "center", color: "#9aa0a6" }}>
          Not built yet — see the note in the handover.
        </div>
      </section>
    </main>
  );
}
