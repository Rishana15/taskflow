import { useState, useEffect, useReducer, useCallback } from "react";

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["To Do", "In Progress", "Review", "Done"];
const CATEGORIES = ["Work", "Personal", "Study", "Health", "Finance", "Other"];

const PRIORITY_COLORS = {
  Low: { bg: "#EAF3DE", text: "#3B6D11", border: "#639922" },
  Medium: "#FAC775",
  High: { bg: "#FAECE7", text: "#993C1D", border: "#D85A30" },
  Critical: { bg: "#FCEBEB", text: "#A32D2D", border: "#E24B4A" },
};

const STATUS_COLORS = {
  "To Do": { bg: "#F1EFE8", text: "#444441", border: "#888780" },
  "In Progress": { bg: "#E6F1FB", text: "#185FA5", border: "#378ADD" },
  Review: { bg: "#FAEEDA", text: "#854F0B", border: "#EF9F27" },
  Done: { bg: "#EAF3DE", text: "#3B6D11", border: "#639922" },
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

const initialTasks = [
  { id: genId(), title: "Design system architecture", description: "Plan the component structure and data flow for the new feature.", priority: "High", status: "In Progress", category: "Work", dueDate: "2026-05-20", createdAt: new Date().toISOString(), tags: ["design", "planning"] },
  { id: genId(), title: "Write unit tests", description: "Cover all edge cases for the auth module.", priority: "Medium", status: "To Do", category: "Work", dueDate: "2026-05-22", createdAt: new Date().toISOString(), tags: ["testing"] },
  { id: genId(), title: "Morning workout routine", description: "30 min cardio + strength training.", priority: "Low", status: "Done", category: "Health", dueDate: "2026-05-15", createdAt: new Date().toISOString(), tags: ["fitness"] },
  { id: genId(), title: "Review Q2 budget", description: "Analyze spending and update projections.", priority: "Critical", status: "Review", category: "Finance", dueDate: "2026-05-16", createdAt: new Date().toISOString(), tags: ["finance", "urgent"] },
];

const DEMO_USER = { name: "Alex Kumar", email: "alex@example.com", avatar: "AK" };

function tasksReducer(state, action) {
  switch (action.type) {
    case "ADD": return [action.task, ...state];
    case "UPDATE": return state.map(t => t.id === action.task.id ? action.task : t);
    case "DELETE": return state.filter(t => t.id !== action.id);
    case "STATUS": return state.map(t => t.id === action.id ? { ...t, status: action.status } : t);
    default: return state;
  }
}

const s = {
  app: { fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "var(--color-background-tertiary)", color: "var(--color-text-primary)" },
  sidebar: { width: 240, minHeight: "100vh", background: "var(--color-background-primary)", borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", padding: "0 0 1rem 0", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 },
  main: { marginLeft: 240, padding: "2rem", minHeight: "100vh" },
  brand: { padding: "1.5rem 1.25rem 1rem", borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: "0.5rem" },
  brandName: { fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px", color: "var(--color-text-primary)" },
  brandSub: { fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 },
  navItem: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "8px 1.25rem", fontSize: 14, cursor: "pointer", borderRadius: 0, color: active ? "var(--color-text-info)" : "var(--color-text-secondary)", background: active ? "var(--color-background-info)" : "transparent", fontWeight: active ? 500 : 400, borderLeft: active ? "2px solid var(--color-border-info)" : "2px solid transparent", transition: "all 0.15s" }),
  userBox: { margin: "auto 0 0", padding: "1rem 1.25rem", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "#B5D4F4", color: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 },
  card: { background: "var(--color-background-primary)", borderRadius: 12, border: "0.5px solid var(--color-border-tertiary)", padding: "1rem 1.25rem" },
  badge: (colors) => ({ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: colors.bg, color: colors.text, border: `0.5px solid ${colors.border}` }),
  input: { width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 14, boxSizing: "border-box", outline: "none" },
  btn: (variant = "default") => {
    const variants = {
      default: { background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "0.5px solid var(--color-border-secondary)" },
      primary: { background: "#185FA5", color: "#fff", border: "none" },
      danger: { background: "var(--color-background-danger)", color: "var(--color-text-danger)", border: "0.5px solid var(--color-border-danger)" },
      ghost: { background: "transparent", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" },
    };
    return { ...variants[variant], padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
  },
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "var(--color-background-primary)", borderRadius: 16, border: "0.5px solid var(--color-border-tertiary)", width: 520, maxWidth: "95vw", padding: "1.5rem", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h2>
          <button style={s.btn("ghost")} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TaskForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { title: "", description: "", priority: "Medium", status: "To Do", category: "Work", dueDate: "", tags: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({ ...form, tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : form.tags });
  };
  const tagsStr = Array.isArray(form.tags) ? form.tags.join(", ") : form.tags;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4, display: "block" }}>Title *</label>
        <input style={s.input} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Task title..." />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4, display: "block" }}>Description</label>
        <textarea style={{ ...s.input, minHeight: 80, resize: "vertical", lineHeight: 1.5 }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="What needs to be done?" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4, display: "block" }}>Priority</label>
          <select style={s.input} value={form.priority} onChange={e => set("priority", e.target.value)}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4, display: "block" }}>Status</label>
          <select style={s.input} value={form.status} onChange={e => set("status", e.target.value)}>
            {STATUSES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4, display: "block" }}>Category</label>
          <select style={s.input} value={form.category} onChange={e => set("category", e.target.value)}>
            {CATEGORIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4, display: "block" }}>Due Date</label>
          <input type="date" style={s.input} value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4, display: "block" }}>Tags (comma-separated)</label>
        <input style={s.input} value={tagsStr} onChange={e => set("tags", e.target.value)} placeholder="design, urgent, bug..." />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <button style={s.btn("ghost")} onClick={onCancel}>Cancel</button>
        <button style={s.btn("primary")} onClick={handleSave}>Save Task</button>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const pColors = PRIORITY_COLORS[task.priority] || { bg: "#F1EFE8", text: "#444441", border: "#888780" };
  const sColors = STATUS_COLORS[task.status] || { bg: "#F1EFE8", text: "#444441", border: "#888780" };
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";
  return (
    <div style={{ ...s.card, marginBottom: 10, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 15, lineHeight: 1.4, textDecoration: task.status === "Done" ? "line-through" : "none", color: task.status === "Done" ? "var(--color-text-tertiary)" : "var(--color-text-primary)" }}>{task.title}</p>
          {task.description && <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{task.description}</p>}
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button style={{ ...s.btn("ghost"), padding: "4px 8px" }} onClick={() => onEdit(task)} title="Edit">✏️</button>
          <button style={{ ...s.btn("ghost"), padding: "4px 8px" }} onClick={() => onDelete(task.id)} title="Delete">🗑️</button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={s.badge(pColors)}>{task.priority}</span>
        <span style={s.badge(sColors)}>{task.status}</span>
        {task.category && <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", background: "var(--color-background-secondary)", padding: "2px 8px", borderRadius: 20 }}>{task.category}</span>}
        {task.dueDate && <span style={{ fontSize: 11, color: isOverdue ? "var(--color-text-danger)" : "var(--color-text-tertiary)" }}>📅 {task.dueDate}{isOverdue ? " · Overdue" : ""}</span>}
      </div>
      {task.tags?.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
          {task.tags.map(t => <span key={t} style={{ fontSize: 10, padding: "2px 6px", background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", borderRadius: 4 }}>#{t}</span>)}
        </div>
      )}
      <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
        {STATUSES.filter(st => st !== task.status).map(st => (
          <button key={st} style={{ ...s.btn("ghost"), padding: "3px 8px", fontSize: 11 }} onClick={() => onStatusChange(task.id, st)}>→ {st}</button>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ tasks }) {
  const counts = STATUSES.reduce((a, s) => ({ ...a, [s]: tasks.filter(t => t.status === s).length }), {});
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Done").length;
  const stats = [
    { label: "Total Tasks", value: tasks.length, icon: "📋" },
    { label: "In Progress", value: counts["In Progress"], icon: "⚡" },
    { label: "Completed", value: counts["Done"], icon: "✅" },
    { label: "Overdue", value: overdue, icon: "⚠️" },
  ];
  const byCategory = CATEGORIES.map(c => ({ cat: c, count: tasks.filter(t => t.category === c).length })).filter(x => x.count > 0);
  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: 24, letterSpacing: "-0.5px", marginBottom: "1.5rem" }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: "2rem" }}>
        {stats.map(st => (
          <div key={st.label} style={{ background: "var(--color-background-primary)", borderRadius: 12, border: "0.5px solid var(--color-border-tertiary)", padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{st.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-1px" }}>{st.value}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{st.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={s.card}>
          <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "var(--color-text-secondary)" }}>BY STATUS</h3>
          {STATUSES.map(st => {
            const c = counts[st] || 0;
            const pct = tasks.length ? Math.round((c / tasks.length) * 100) : 0;
            const col = STATUS_COLORS[st];
            return (
              <div key={st} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{st}</span><span style={{ color: "var(--color-text-secondary)" }}>{c}</span>
                </div>
                <div style={{ height: 6, background: "var(--color-background-secondary)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: col.border, borderRadius: 4, transition: "width 0.4s" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={s.card}>
          <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "var(--color-text-secondary)" }}>BY CATEGORY</h3>
          {byCategory.length === 0 && <p style={{ color: "var(--color-text-tertiary)", fontSize: 13 }}>No tasks yet.</p>}
          {byCategory.map(({ cat, count }) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 13 }}>
              <span>{cat}</span>
              <span style={{ fontWeight: 500, background: "var(--color-background-secondary)", padding: "2px 8px", borderRadius: 20, fontSize: 12 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...s.card, marginTop: 16 }}>
        <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "var(--color-text-secondary)" }}>PRIORITY BREAKDOWN</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {PRIORITIES.map(p => {
            const count = tasks.filter(t => t.priority === p).length;
            const col = PRIORITY_COLORS[p] || { bg: "#F1EFE8", text: "#444441" };
            return (
              <div key={p} style={{ flex: 1, textAlign: "center", padding: "12px 8px", background: col.bg, borderRadius: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: col.text }}>{count}</div>
                <div style={{ fontSize: 11, color: col.text, marginTop: 2 }}>{p}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TasksView({ tasks, dispatch, filter, setFilter }) {
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  const filtered = tasks
    .filter(t => {
      if (filter.status && t.status !== filter.status) return false;
      if (filter.priority && t.priority !== filter.priority) return false;
      if (filter.category && t.category !== filter.category) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "dueDate") return (a.dueDate || "z") < (b.dueDate || "z") ? -1 : 1;
      if (sortBy === "priority") return PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleSave = (form) => {
    if (editTask) {
      dispatch({ type: "UPDATE", task: { ...editTask, ...form } });
    } else {
      dispatch({ type: "ADD", task: { ...form, id: genId(), createdAt: new Date().toISOString() } });
    }
    setShowModal(false);
    setEditTask(null);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 style={{ fontWeight: 700, fontSize: 24, letterSpacing: "-0.5px" }}>Tasks</h1>
        <button style={s.btn("primary")} onClick={() => { setEditTask(null); setShowModal(true); }}>+ New Task</button>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input style={{ ...s.input, maxWidth: 220 }} placeholder="🔍 Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...s.input, width: "auto" }} value={filter.status || ""} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={{ ...s.input, width: "auto" }} value={filter.priority || ""} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <select style={{ ...s.input, width: "auto" }} value={filter.category || ""} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select style={{ ...s.input, width: "auto" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="createdAt">Sort: Newest</option>
          <option value="dueDate">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
        </select>
        {(filter.status || filter.priority || filter.category || search) && (
          <button style={s.btn("ghost")} onClick={() => { setFilter({}); setSearch(""); }}>✕ Clear</button>
        )}
      </div>

      <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 12 }}>{filtered.length} task{filtered.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 && (
        <div style={{ ...s.card, textAlign: "center", padding: "3rem", color: "var(--color-text-tertiary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p>No tasks found. Create one!</p>
        </div>
      )}

      {filtered.map(task => (
        <TaskCard key={task.id} task={task}
          onEdit={(t) => { setEditTask(t); setShowModal(true); }}
          onDelete={(id) => dispatch({ type: "DELETE", id })}
          onStatusChange={(id, status) => dispatch({ type: "STATUS", id, status })}
        />
      ))}

      {showModal && (
        <Modal title={editTask ? "Edit Task" : "New Task"} onClose={() => { setShowModal(false); setEditTask(null); }}>
          <TaskForm initial={editTask ? { ...editTask, tags: editTask.tags?.join(", ") || "" } : undefined}
            onSave={handleSave}
            onCancel={() => { setShowModal(false); setEditTask(null); }} />
        </Modal>
      )}
    </div>
  );
}

function KanbanView({ tasks, dispatch }) {
  const [dragging, setDragging] = useState(null);
  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: 24, letterSpacing: "-0.5px", marginBottom: "1.5rem" }}>Kanban Board</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, alignItems: "start" }}>
        {STATUSES.map(status => {
          const col = STATUS_COLORS[status];
          const columnTasks = tasks.filter(t => t.status === status);
          return (
            <div key={status}
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => { e.preventDefault(); if (dragging) dispatch({ type: "STATUS", id: dragging, status }); setDragging(null); }}
              style={{ background: "var(--color-background-secondary)", borderRadius: 12, padding: "0.75rem", minHeight: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={s.badge(col)}>{status}</span>
                <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginLeft: "auto" }}>{columnTasks.length}</span>
              </div>
              {columnTasks.map(task => (
                <div key={task.id} draggable
                  onDragStart={() => setDragging(task.id)}
                  onDragEnd={() => setDragging(null)}
                  style={{ ...s.card, marginBottom: 8, cursor: "grab", opacity: dragging === task.id ? 0.5 : 1 }}>
                  <p style={{ margin: "0 0 6px", fontWeight: 500, fontSize: 13, lineHeight: 1.4 }}>{task.title}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={s.badge(PRIORITY_COLORS[task.priority] || { bg: "#F1EFE8", text: "#444441", border: "#888780" })}>{task.priority}</span>
                    {task.dueDate && <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>📅 {task.dueDate}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "tasks", label: "Tasks", icon: "📋" },
  { id: "kanban", label: "Kanban", icon: "🗂️" },
];

export default function App() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  const [view, setView] = useState("dashboard");
  const [filter, setFilter] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css";
    document.head.appendChild(link);
    const glink = document.createElement("link");
    glink.rel = "stylesheet";
    glink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(glink);
  }, []);

  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...s.card, width: 380, padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            <h1 style={{ fontWeight: 700, fontSize: 22, margin: 0, letterSpacing: "-0.5px" }}>TaskFlow</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginTop: 4 }}>Sign in to manage your tasks</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Email</label>
              <input style={s.input} type="email" placeholder="alex@example.com" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Password</label>
              <input style={s.input} type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            {loginError && <p style={{ color: "var(--color-text-danger)", fontSize: 13, margin: 0 }}>{loginError}</p>}
            <button style={{ ...s.btn("primary"), width: "100%", justifyContent: "center", padding: "10px 14px", marginTop: 4 }}
              onClick={() => {
                if (loginForm.email === DEMO_USER.email && loginForm.password === "demo123") { setLoggedIn(true); setLoginError(""); }
                else setLoginError("Invalid credentials. Try alex@example.com / demo123");
              }}>Sign In</button>
          </div>
          <div style={{ marginTop: 16, padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
            Demo: <strong>alex@example.com</strong> / <strong>demo123</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <nav style={s.sidebar}>
        <div style={s.brand}>
          <div style={s.brandName}>✅ TaskFlow</div>
          <div style={s.brandSub}>Skill Development & Future Tech</div>
        </div>
        {NAV.map(n => (
          <div key={n.id} style={s.navItem(view === n.id)} onClick={() => setView(n.id)}>
            <span>{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
        <div style={s.userBox}>
          <div style={s.avatar}>{DEMO_USER.avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 13 }}>{DEMO_USER.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{DEMO_USER.email}</p>
          </div>
          <button style={{ ...s.btn("ghost"), padding: "4px 6px", fontSize: 12 }} onClick={() => setLoggedIn(false)} title="Logout">⬡</button>
        </div>
      </nav>
      <main style={s.main}>
        {view === "dashboard" && <Dashboard tasks={tasks} />}
        {view === "tasks" && <TasksView tasks={tasks} dispatch={dispatch} filter={filter} setFilter={setFilter} />}
        {view === "kanban" && <KanbanView tasks={tasks} dispatch={dispatch} />}
      </main>
    </div>
  );
}
