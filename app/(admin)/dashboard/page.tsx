"use client";
import { type FC } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export interface DashboardStats {
  enrolledStudents: number;
  activePrograms: number;
  pendingRequests: number;
  tutors?: number;
}

export interface EnrollmentByProgram {
  programId: string;
  name: string;
  value: number;
  pct: number;
}

export type EnrollmentStatus = "PENDING" | "COMPLETED" | "IN PROGRESS";

export interface RecentEnrollment {
  id: string;
  child: string;
  program: string;
  tutor: string;
  status: EnrollmentStatus;
}

export interface DashboardStatsResponse {
  stats: DashboardStats;
  enrollmentByProgram: EnrollmentByProgram[];
  enrollmentTotal: number;
  recentEnrollments: RecentEnrollment[];
}

// ---- Types ----------------------------------------------------------------

interface StatCard {
  label: string;
  value: number;
  dot: string;
}

interface EnrollmentSlice {
  name: string;
  value: number;
  pct: number;
  color: string;
}

interface StatusStyle {
  bg: string;
  fg: string;
}

// Minimal recharts tooltip props (avoids pulling in recharts' generic types)
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number | string;
    name?: string;
    payload?: EnrollmentSlice;
  }>;
}

// ---- Static config ---------------------------------------------------------

const SLICE_COLORS = [
  "#E8B34A",
  "#38BDF8",
  "#34D399",
  "#A78BFA",
  "#FB7185",
  "#FB923C",
];

const STATUS_STYLE: Record<EnrollmentStatus, StatusStyle> = {
  PENDING: { bg: "rgba(232,179,74,0.14)", fg: "#E8B34A" },
  COMPLETED: { bg: "rgba(52,211,153,0.14)", fg: "#34D399" },
  "IN PROGRESS": { bg: "rgba(139,147,167,0.16)", fg: "#C3C9D9" },
};

// ---- Custom tooltip for pie chart -----------------------------------------

const PieTooltip: FC<ChartTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  if (!d) return null;
  return (
    <div
      style={{
        background: "#0F1729",
        border: "1px solid #212C45",
        borderRadius: 8,
        padding: "8px 12px",
      }}
    >
      <div style={{ color: "#F5F7FA", fontSize: 12, fontWeight: 600 }}>
        {d.name}
      </div>
      <div style={{ color: "#8B93A7", fontSize: 11.5 }}>
        {d.value} students &middot; {d.pct}%
      </div>
    </div>
  );
};

// ---- Component --------------------------------------------------------------

const ExcelEdDashboard: FC = () => {
  const {
    stats,
    enrollmentByProgram,
    enrollmentTotal,
    recentEnrollments,
    isLoading,
    isError,
  } = useDashboardStats();

  const statCards: StatCard[] = [
    {
      label: "Enrolled Students",
      value: stats?.enrolledStudents ?? 0,
      dot: "#E8B34A",
    },
    {
      label: "Active Programs",
      value: stats?.activePrograms ?? 0,
      dot: "#38BDF8",
    },
    { label: "Tutors", value: stats?.tutors ?? 0, dot: "#34D399" },
    {
      label: "Pending Requests",
      value: stats?.pendingRequests ?? 0,
      dot: "#FB7185",
    },
  ];

  const enrollmentSlices: EnrollmentSlice[] = enrollmentByProgram.map(
    (p, i) => ({
      name: p.name,
      value: p.value,
      pct: p.pct,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
    }),
  );

  return (
    <div className="ee-root">
      <style>{`
        .ee-root {
          --bg: #090E1A;
          --panel: #111A2E;
          --panel-border: #1F2A42;
          --gold: #E8B34A;
          --text: #F5F7FA;
          --text-mid: #C3C9D9;
          --text-dim: #7C8598;

          font-family: 'Segoe UI', Roboto, -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text);
          width: 100%;
        }
        .ee-root * { box-sizing: border-box; }

        .ee-content {
          padding: 4px 4px 40px;
        }
        .ee-page-title {
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 4px;
        }
        .ee-page-sub {
          font-size: 13px;
          color: var(--text-dim);
          margin: 0 0 22px;
        }
        .ee-state-note {
          font-size: 13px;
          color: var(--text-dim);
          padding: 16px 0;
        }
        .ee-state-note.error {
          color: #FB7185;
        }

        /* Stat cards */
        .ee-stat-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }
        .ee-stat-card {
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 16px 18px;
        }
        .ee-stat-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 10px;
        }
        .ee-stat-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .ee-stat-value {
          font-size: 26px;
          font-weight: 700;
        }

        /* Enrollment panel */
        .ee-enrollment-row {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 14px;
          margin-bottom: 22px;
        }
        .ee-panel {
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 20px 20px 8px;
        }
        .ee-panel-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .ee-panel-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
        }
        .ee-panel-note {
          font-size: 11.5px;
          color: var(--text-dim);
        }

        /* Program breakdown list */
        .ee-breakdown-list {
          display: flex;
          flex-direction: column;
          padding-bottom: 12px;
        }
        .ee-breakdown-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid var(--panel-border);
        }
        .ee-breakdown-row:last-child { border-bottom: none; }
        .ee-breakdown-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .ee-breakdown-name {
          font-size: 13px;
          color: var(--text-mid);
          flex: 1;
        }
        .ee-breakdown-track {
          flex-basis: 96px;
          flex-shrink: 0;
          height: 5px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .ee-breakdown-fill {
          height: 100%;
          border-radius: 999px;
        }
        .ee-breakdown-pct {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          width: 46px;
          text-align: right;
          flex-shrink: 0;
        }
        .ee-breakdown-count {
          font-size: 11.5px;
          color: var(--text-dim);
          width: 62px;
          text-align: right;
          flex-shrink: 0;
        }

        /* Table */
        .ee-table-panel {
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          overflow: hidden;
        }
        .ee-table {
          width: 100%;
          border-collapse: collapse;
        }
        .ee-table th {
          text-align: left;
          font-size: 11px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-dim);
          font-weight: 600;
          padding: 14px 20px;
          border-bottom: 1px solid var(--panel-border);
        }
        .ee-table td {
          padding: 14px 20px;
          font-size: 13px;
          border-bottom: 1px solid var(--panel-border);
          color: var(--text-mid);
        }
        .ee-table tr:last-child td { border-bottom: none; }
        .ee-table td.name { color: var(--text); font-weight: 600; }
        .ee-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.03em;
        }

        @media (max-width: 900px) {
          .ee-stat-row { grid-template-columns: repeat(2, 1fr); }
          .ee-enrollment-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ee-content">
        <h1 className="ee-page-title">Dashboard</h1>
        <p className="ee-page-sub">
          Enrolled students, active programs and tutors at a glance.
        </p>

        {isError && (
          <p className="ee-state-note error">
            Couldn&apos;t load dashboard data. Try refreshing the page.
          </p>
        )}

        {/* Stats */}
        <div className="ee-stat-row">
          {statCards.map((s) => (
            <div className="ee-stat-card" key={s.label}>
              <div className="ee-stat-label">
                <span className="ee-stat-dot" style={{ background: s.dot }} />
                {s.label}
              </div>
              <div className="ee-stat-value">{isLoading ? "—" : s.value}</div>
            </div>
          ))}
        </div>

        {/* Enrollment by program */}

        <div className="ee-enrollment-row">
          <div className="ee-panel">
            <div className="ee-panel-header">
              <h2 className="ee-panel-title">Enrollment by Program</h2>
              <span className="ee-panel-note">{enrollmentTotal} total</span>
            </div>
            {isLoading ? (
              <p className="ee-state-note">Loading chart…</p>
            ) : enrollmentSlices.length === 0 ? (
              <p className="ee-state-note">No completed enrollments yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={enrollmentSlices}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {enrollmentSlices.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        stroke="var(--panel)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="ee-panel">
            <div className="ee-panel-header">
              <h2 className="ee-panel-title">Program Breakdown</h2>
              <span className="ee-panel-note">Share of enrollment</span>
            </div>
            {isLoading ? (
              <p className="ee-state-note">Loading breakdown…</p>
            ) : enrollmentSlices.length === 0 ? (
              <p className="ee-state-note">No completed enrollments yet.</p>
            ) : (
              <div className="ee-breakdown-list">
                {enrollmentSlices.map((p) => (
                  <div className="ee-breakdown-row" key={p.name}>
                    <span
                      className="ee-breakdown-dot"
                      style={{ background: p.color }}
                    />
                    <span className="ee-breakdown-name">{p.name}</span>
                    <span className="ee-breakdown-track">
                      <span
                        className="ee-breakdown-fill"
                        style={{ width: `${p.pct}%`, background: p.color }}
                      />
                    </span>
                    <span className="ee-breakdown-pct">{p.pct}%</span>
                    <span className="ee-breakdown-count">
                      {p.value} students
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enrollment by program */}

        {/* Table */}
        <div className="ee-table-panel">
          <table className="ee-table">
            <thead>
              <tr>
                <th>Child</th>
                <th>Program</th>
                <th>Tutor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="ee-state-note">
                    Loading recent enrollments…
                  </td>
                </tr>
              ) : recentEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="ee-state-note">
                    No enrollments yet.
                  </td>
                </tr>
              ) : (
                recentEnrollments.map((r) => {
                  const s = STATUS_STYLE[r.status];
                  return (
                    <tr key={r.id}>
                      <td className="name">{r.child}</td>
                      <td>{r.program}</td>
                      <td>{r.tutor}</td>
                      <td>
                        <span
                          className="ee-badge"
                          style={{ background: s.bg, color: s.fg }}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExcelEdDashboard;
