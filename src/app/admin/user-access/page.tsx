"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SquarePen, Trash2 } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";
import { members, type MemberStatus } from "@/data/admin";

const TOTAL_PAGES = 16;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function UserAccessPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MemberStatus | "All">("All");
  const [page, setPage] = useState(4);
  const [selected, setSelected] = useState<string[]>([]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    return members.filter((member) => {
      const matchesQuery =
        !term ||
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term);
      const matchesStatus = status === "All" || member.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const allChecked = visible.length > 0 && visible.every((member) => selected.includes(member.id));

  const toggleAll = () => {
    setSelected(allChecked ? [] : visible.map((member) => member.id));
  };

  const toggleOne = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  return (
    <main className="page-card">
      <h1 className="command-title">User Access</h1>

      <section className="command-panel">
        <div className="command-panel__head">
          <h2>Members</h2>
        </div>

        <div className="table-shell">
          <div className="table-toolbar">
            <div className="control table-search">
              <span className="control__icon" aria-hidden="true">
                <Search size={16} strokeWidth={1.9} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or email..."
                aria-label="Search members"
              />
            </div>

            <label className="table-filter">
              <span className="table-filter__label">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as MemberStatus | "All")}
                aria-label="Filter by status"
              >
                <option>All</option>
                <option>Active</option>
                <option>Pending</option>
              </select>
            </label>

            <button type="button" className="table-add">
              <Plus size={16} strokeWidth={2.2} />
              Add New Members
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: 48 }}>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      aria-label="Select all members"
                    />
                  </th>
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Email</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>

              <tbody>
                {visible.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(member.id)}
                        onChange={() => toggleOne(member.id)}
                        aria-label={`Select ${member.name}`}
                      />
                    </td>
                    <td>
                      <span className="data-table__name">
                        <span className="avatar-chip" aria-hidden="true">
                          {initials(member.name)}
                        </span>
                        {member.name}
                      </span>
                    </td>
                    <td>{member.role}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`status-pill status-pill--${member.status.toLowerCase()}`}>
                        {member.status}
                      </span>
                    </td>
                    <td>
                      <span className="data-table__actions">
                        <button type="button" className="row-action">
                          <SquarePen size={14} strokeWidth={1.9} />
                          Edit
                        </button>
                        <button type="button" className="row-action row-action--danger">
                          <Trash2 size={14} strokeWidth={1.9} />
                          Delete
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}

                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9aa0a6" }}>
                      No members match that search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination page={page} totalPages={TOTAL_PAGES} onPageChange={setPage} />
      </section>
    </main>
  );
}
