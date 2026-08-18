"use client";

import { Fragment, useMemo, useState } from "react";
import { Car, ChevronDown, ChevronRight, MapPin, Plus, Search, Target, Users } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";
import { AgencyBadge } from "@/components/admin/IncidentDetailPanel";
import { useApiList } from "@/hooks/useApiList";
import { loadSecurityUnits } from "@/data/loaders";
import { AddUnitModal } from "@/components/admin/AddUnitModal";
import type { Agency } from "@/data/admin";

/** The units endpoint returns everything, so paging happens here. */
const PAGE_SIZE = 10;

const agencies: (Agency | "All")[] = [
  "All",
  "Nigeria Police Force",
  "NSCDC",
  "Immigration",
  "Nigeria Custom",
  "Correctional Service",
  "NDLEA",
  "FRSC",
];

export default function UnitPage() {
  const [query, setQuery] = useState("");
  const [agency, setAgency] = useState<Agency | "All">("All");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string[]>([]);
  const { status, items: securityUnits, error, reload } = useApiList(loadSecurityUnits);
  const [isAdding, setIsAdding] = useState(false);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    return securityUnits.filter((unit) => {
      const matchesQuery =
        !term || unit.name.toLowerCase().includes(term) || unit.teamLead.toLowerCase().includes(term);
      const matchesAgency = agency === "All" || unit.agency === agency;
      return matchesQuery && matchesAgency;
    });
  }, [query, agency, securityUnits]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  // Clamped rather than reset in an effect, so filtering down never strands
  // the user on a page that no longer exists.
  const safePage = Math.min(page, totalPages);
  const pageItems = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggle = (id: string) => {
    setExpanded((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  return (
    <main className="page-card">
      <h1 className="command-title">Delta State Security Units</h1>

      <section className="command-panel">
        <div className="command-panel__head">
          <h2>Unit</h2>
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
                aria-label="Search units"
              />
            </div>

            <label className="table-filter">
              <span className="table-filter__label">Agency</span>
              <select
                value={agency}
                onChange={(event) => setAgency(event.target.value as Agency | "All")}
                aria-label="Filter by agency"
              >
                {agencies.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <button type="button" className="table-add" onClick={() => setIsAdding(true)}>
              <Plus size={16} strokeWidth={2.2} />
              Add Unit
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: 44 }}>
                    <span className="sr-only">Expand</span>
                  </th>
                  <th scope="col">Unit / Station Name</th>
                  <th scope="col">Agency</th>
                  <th scope="col">State</th>
                  <th scope="col">LGA / Address</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Responding Unit</th>
                  <th scope="col">Team Lead</th>
                </tr>
              </thead>

              <tbody>
                {pageItems.map((unit) => {
                  const isOpen = expanded.includes(unit.id);

                  return (
                    <Fragment key={unit.id}>
                      <tr>
                        <td>
                          <button
                            type="button"
                            className="row-toggle"
                            onClick={() => toggle(unit.id)}
                            aria-expanded={isOpen}
                            aria-label={`${isOpen ? "Collapse" : "Expand"} ${unit.name}`}
                          >
                            {isOpen ? (
                              <ChevronDown size={17} strokeWidth={2} />
                            ) : (
                              <ChevronRight size={17} strokeWidth={2} />
                            )}
                          </button>
                        </td>
                        <td>{unit.name}</td>
                        <td>
                          <AgencyBadge agency={unit.agency} />
                        </td>
                        <td>{unit.state}</td>
                        <td>
                          <span className="data-table__name">
                            <MapPin size={15} strokeWidth={1.9} color="#0080ff" />
                            <span>
                              {unit.address}
                              <span className="data-table__sub">{unit.lga}</span>
                            </span>
                          </span>
                        </td>
                        <td>{unit.phone}</td>
                        <td>{unit.respondingUnit}</td>
                        <td>{unit.teamLead}</td>
                      </tr>

                      {isOpen && (
                        <tr className="expanded-row">
                          <td colSpan={8}>
                            <div className="expanded-grid">
                              <div>
                                <p className="expanded-grid__title">
                                  <Target size={16} strokeWidth={1.9} />
                                  Responding Unit
                                </p>
                                <p className="expanded-grid__value">{unit.respondingUnit}</p>
                              </div>

                              <div>
                                <p className="expanded-grid__title">
                                  <Users size={16} strokeWidth={1.9} />
                                  Team Lead &amp; Responders
                                </p>
                                <p className="responder-row">
                                  <span className="lead-tag">Lead</span>
                                  <span style={{ color: "#1a1a1a" }}>{unit.teamLead}</span>
                                </p>
                                {unit.responders.map((responder) => (
                                  <p className="responder-row" key={responder}>
                                    <Users size={14} strokeWidth={1.7} />
                                    {responder}
                                  </p>
                                ))}
                              </div>

                              <div>
                                <p className="expanded-grid__title">
                                  <Car size={16} strokeWidth={1.9} />
                                  Responding Unit
                                </p>
                                <div>
                                  {unit.vehicles.map((vehicle) => (
                                    <span className="vehicle-tag" key={vehicle}>
                                      {vehicle}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}

                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#9aa0a6" }}>
                      {status === "loading"
                        ? "Loading units..."
                        : status === "error"
                          ? error
                          : "No units match that search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      </section>

      {isAdding && <AddUnitModal onClose={() => setIsAdding(false)} onCreated={reload} />}
    </main>
  );
}
