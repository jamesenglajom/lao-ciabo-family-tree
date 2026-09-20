"use client";

import { useState } from "react";

/**
 * Explicit add/remove rows for spouses, mirroring SocialLinksEditor. Replaces
 * a native <select multiple>, which technically supports removing a spouse
 * via Ctrl/Cmd-click but hides that affordance well enough that it reads as
 * "no way to unset a spouse."
 */
export function SpouseEditor({ currentSpouseIds = [], members = [] }) {
  const [rows, setRows] = useState(() =>
    currentSpouseIds.map((memberId) => ({ id: crypto.randomUUID(), memberId }))
  );

  function addRow() {
    setRows((prev) => [...prev, { id: crypto.randomUUID(), memberId: "" }]);
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-ink">Spouse(s)</span>

      {rows.length === 0 ? <p className="text-xs text-ink-faint">No spouse set.</p> : null}

      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-2">
          <select
            name="spouse_ids"
            defaultValue={row.memberId}
            className="flex-1 rounded-2xl border border-line bg-panel px-4 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            <option value="">Select a person&hellip;</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => removeRow(row.id)}
            className="text-sm font-medium text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addRow} className="w-fit text-sm font-medium text-accent hover:underline">
        + Add spouse
      </button>
    </div>
  );
}
