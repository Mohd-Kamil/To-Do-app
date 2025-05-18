import React, { useEffect, useRef, useState } from "react";

// To-Do item type
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  due?: string | null;
}

const STORAGE_KEY = "immersive-todo-list";

function getInitialTodos(): Todo[] {
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if (fromStorage) return JSON.parse(fromStorage) as Todo[];
  return [];
}

type Filter = "all" | "active" | "completed" | "soon";

function getDueStatus(dateString: string | null | undefined) {
  if (!dateString) return null;
  const now = new Date();
  const dueDate = new Date(dateString);
  if (now > dueDate) return "overdue";
  if (dueDate.getTime() - now.getTime() < 36 * 60 * 60 * 1000) return "soon"; // less than 36h
  return null;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(getInitialTodos);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingDue, setEditingDue] = useState<string>("");
  const [due, setDue] = useState<string>("");
  const [filter, setFilter] = useState<Filter>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        text: input.trim(),
        completed: false,
        due: due ? due : null,
      },
    ]);
    setInput("");
    setDue("");
  }

  function handleDelete(id: string) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }
  function handleToggle(id: string) {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }
  // When user wants to edit
  function handleEdit(id: string, text: string, dueDate: string | null | undefined) {
    setEditingId(id);
    setEditingText(text);
    setEditingDue(dueDate || "");
    setTimeout(() => inputRef.current?.focus(), 0);
  }
  // Save edited text + due date
  function handleEditSave(id: string) {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: editingText, due: editingDue ? editingDue : null } : todo
      )
    );
    setEditingId(null);
    setEditingText("");
    setEditingDue("");
  }
  function handleKeyDown(e: React.KeyboardEvent, id: string) {
    if (e.key === "Enter") handleEditSave(id);
    if (e.key === "Escape") {
      setEditingId(null);
      setEditingText("");
      setEditingDue("");
    }
  }
  // Filtering
  function filteredTodos() {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      case "soon":
        return todos.filter((t) =>
          !t.completed && getDueStatus(t.due) === "soon"
        );
      default:
        return todos;
    }
  }
  // UI Filter Button
  function FilterButton({ name, value, count }: { name: string; value: Filter; count: number }) {
    return (
      <button
        className={`imm-todo-filter-btn${filter === value ? " active" : ""}`}
        onClick={() => setFilter(value)}
      >
        {name}
        <span className="imm-todo-filter-badge">{count}</span>
      </button>
    );
  }

  // Count
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;
  const soonCount = todos.filter((t) => !t.completed && getDueStatus(t.due) === "soon").length;

  return (
    <div className="imm-todo-bg">
      <style>{`
        .imm-todo-filters {
          display: flex;
          gap: 0.6em;
          margin-bottom: 0.7em;
          justify-content: center;
        }
        .imm-todo-filter-btn {
          border: none;
          background: #f6f4f9;
          color: #77628d;
          border-radius: 15px;
          cursor: pointer;
          padding: 0.32em 0.8em;
          font-weight: 500;
          font-size: 1.01em;
          box-shadow: 0 1px 2.5px #e0c3fc40;
          transition: background 0.15s, color 0.14s, box-shadow 0.18s, scale 0.07s;
        }
        .imm-todo-filter-btn:hover {
          background: #ece7fc;
          color: #7c49b7;
          scale: 1.06;
        }
        .imm-todo-filter-btn.active {
          background: linear-gradient(99deg, #cfd9ff 0%, #eae0ff 100%);
          color: #563183;
          box-shadow: 0 2px 8px #e0c3fc60;
        }
        .imm-todo-filter-badge {
          margin-left: 0.32em;
          display: inline-block;
          background: #f8edf7;
          color: #bd77d2;
          font-size: 0.96em;
          font-weight: 700;
          padding: 0.05em 0.48em;
          border-radius: 9px;
        }
        .imm-todo-bg {
          min-height: 100vh;
          background: radial-gradient(circle at 70% 0%, #e0c3fc 0%, #8ec5fc 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          background-attachment: fixed;
        }
        .imm-todo-container {
          background: rgba(255,255,255,0.97);
          box-shadow: 0 8px 24px 0 rgba(31,38,135,0.15);
          border-radius: 32px;
          padding: 32px 18px 22px 18px;
          width: 400px;
          max-width: 96vw;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          position: relative;
          animation: popin 0.85s cubic-bezier(.17,.67,.83,.67);
        }
        @keyframes popin {
          0% { transform: scale(0.9) translateY(40px); opacity: 0.4; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .imm-todo-top {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .75rem;
          margin-bottom: 1rem;
        }
        .imm-todo-icon-animated {
          font-size: 2.1rem;
          animation: spincolor 13s linear infinite;
          filter: hue-rotate(300deg);
          transition: filter 0.5s;
        }
        @keyframes spincolor {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .imm-todo-welcome {
          font-size: 1.4rem;
          font-weight: 500;
          color: #38235b;
          letter-spacing: .01em;
          background: linear-gradient(90deg, #8ec5fc 0%,#e0c3fc 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadein 1.4s cubic-bezier(.23,1.2,.32,1) .05s both;
        }
        @keyframes fadeout { 0% { opacity: 1; } 100%{ opacity: 0; } }
        @keyframes fadein { 0% { opacity: 0; } 100% { opacity: 1; } }
        .imm-todo-form {
          display: flex;
          gap: 0.333rem;
          margin-bottom: 1.1rem;
        }
        .imm-todo-input, .imm-todo-date {
          font-size: 1.03rem;
          background: #f6f8f7;
          border: 1.3px solid #d0ccff32;
          border-radius: 17px;
          padding: 0.7rem 1em;
          outline: none;
          box-shadow: 0 2px 8px #e0c3fc18;
          transition: box-shadow 0.22s, border-color 0.22s;
        }
        .imm-todo-input:focus, .imm-todo-date:focus {
          border-color: #b180cf;
          box-shadow: 0 4px 16px #c2e9fb40;
        }
        .imm-todo-date {
          width: 52%;
          min-width: 0;
        }
        .imm-todo-add {
          background: linear-gradient(88deg, #e7baff 12%, #8ec5fc 100%);
          color: #fff;
          text-shadow: 0 1px 6px #a6aeda22;
          border: none;
          border-radius: 18px;
          padding: 0 1.2rem;
          font-size: 1.1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.21s, scale 0.1s;
          box-shadow: 0 2px 8px #e0c3fc22;
          will-change: transform;
        }
        .imm-todo-add:active {
          scale: 1.06;
          background: linear-gradient(80deg, #b963f9 10%, #89e7fd 100%);
        }
        .imm-todo-add:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          color: #e4def7;
        }
        .imm-todo-list {
          list-style: none;
          margin: 0;
          padding: 0;
          min-height: 2.5rem;
        }
        .imm-todo-item {
          display: flex;
          align-items: center;
          gap: 0.71rem;
          padding: 0.7rem 0.4rem 0.7rem 0.25rem;
          border-radius: 16px;
          margin-bottom: 0.17rem;
          background: #f9f7fd;
          box-shadow: 0 1px 14px #ead1f344;
          transition: background 0.19s, box-shadow 0.19s, scale 0.17s;
          scale: 1;
          will-change: transform;
        }
        .imm-todo-item:hover {
          background: #fdecff;
          scale: 1.02;
          box-shadow: 0 6px 18px #e6cfeb66;
        }
        .imm-todo-item.completed {
          background: #e5ffe8;
          opacity: 0.75;
          text-decoration: line-through;
        }
        .imm-todo-toggle {
          cursor: pointer;
          width: 1.7em;
          height: 1.7em;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 2.3px solid #8ec5fc;
          background: #fff;
          margin-right: 0.2em;
          font-size: 1.14em;
          transition: border 0.17s, background 0.21s;
        }
        .imm-todo-item.completed .imm-todo-toggle {
          border: 2.3px solid #8ad69b;
          background: #e5ffe8;
        }
        .imm-todo-checkbox {
          font-size: 1.14em;
          color: #a98dcb;
        }
        .imm-todo-item.completed .imm-todo-checkbox {
          color: #18bf6d;
        }
        .imm-todo-text {
          flex: 1;
          font-size: 1.09rem;
          color: #2f2950;
          cursor: pointer;
          user-select: text;
          padding: 0.08em 0.2em;
          border-radius: 7px;
          transition: background 0.17s;
          letter-spacing: 0.01em;
        }
        .imm-todo-text:hover {
          background: #ece8fa;
        }
        .imm-todo-edit-input {
          flex: 1;
          font-size: 1.09rem;
          padding: 0.24em 0.5em;
          border-radius: 7px;
          border: 1.3px solid #b180cf;
          outline: none;
          background: #f3f8fd;
        }
        .imm-todo-edit-date {
          font-size: 1.01rem;
          border-radius: 7px;
          border: 1.2px solid #b8afe6;
          background: #f3f8fd;
          margin-left: 0.3em;
          padding: 0.18em 0.35em;
        }
        .imm-todo-delete {
          background: none;
          border: none;
          color: #f1366c;
          font-size: 1.21em;
          cursor: pointer;
          border-radius: 50%;
          padding: 0.12em 0.41em;
          transition: background 0.18s;
        }
        .imm-todo-delete:hover {
          background: #ffd6eb;
        }
        .imm-todo-empty {
          text-align: center;
          color: #b0a7c2;
          font-size: 1.06rem;
          padding: 1.2em 0;
        }
        .imm-todo-footer {
          margin-top: 1.2rem;
          text-align: right;
          color: #b4aacb;
          font-size: 1rem;
        }
        .imm-todo-due {
          font-size: 0.98em;
          letter-spacing: 0.01em;
          margin-top: 2px;
          margin-left: 1.3em;
          color: #a381a5;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.2em;
        }
        .imm-todo-due.overdue {
          color: #d22358;
          font-weight: 600;
          background: #ffdce7af;
        }
        .imm-todo-due.soon {
          color: #db6a11;
          background: #fff4e7aa;
        }
        @media (max-width: 540px) {
          .imm-todo-container {
            min-width: 0;
            width: 98vw;
            border-radius: 20px;
            padding: 1rem 3vw 1.03rem 3vw;
          }
        }
        /* NEW CONTRAST FIXES BELOW */
        .imm-todo-input, .imm-todo-date {
          color: #3c2967 !important;
        }
        .imm-todo-input::placeholder {
          color: #8677a3 !important;
          opacity: 1;
        }
        .imm-todo-edit-input, .imm-todo-edit-date {
          color: #3c2967 !important;
        }
        .imm-todo-edit-input::placeholder {
          color: #8677a3 !important;
        }
        .imm-todo-add {
          color: #fff;
          text-shadow: 0 1px 6px #a6aeda22;
        }
        .imm-todo-add:disabled {
          color: #e4def7;
        }
      `}</style>
      <div className="imm-todo-container">
        <div className="imm-todo-top">
          <span className="imm-todo-icon-animated">🪐</span>
          <span className="imm-todo-welcome">Your To-Do Universe</span>
        </div>
        <form onSubmit={handleAddTodo} className="imm-todo-form">
          <input
            className="imm-todo-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task..."
            maxLength={120}
            aria-label="Task title"
            autoFocus
          />
          <input
            className="imm-todo-date"
            type="datetime-local"
            value={due}
            onChange={e => setDue(e.target.value)}
            aria-label="Due date and time"
          />
          <button className="imm-todo-add" type="submit" disabled={!input.trim()}>
            +
          </button>
        </form>
        <div className="imm-todo-filters">
          <FilterButton name="All" value="all" count={todos.length} />
          <FilterButton name="Active" value="active" count={activeCount} />
          <FilterButton name="Done" value="completed" count={completedCount} />
          <FilterButton name="Due Soon" value="soon" count={soonCount} />
        </div>
        <ul className="imm-todo-list">
          {filteredTodos().length === 0 && <li className="imm-todo-empty">No tasks here for this filter 🪐</li>}
          {filteredTodos().map((todo) => {
            const status = getDueStatus(todo.due);
            return (
              <li
                className={`imm-todo-item${todo.completed ? " completed" : ""}`}
                key={todo.id}
                tabIndex={0}
              >
                <span
                  className="imm-todo-toggle"
                  onClick={() => handleToggle(todo.id)}
                  title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  <span className="imm-todo-checkbox">
                    {todo.completed ? "✔️" : ""}
                  </span>
                </span>
                {editingId === todo.id ? (
                  <>
                    <input
                      ref={inputRef}
                      className="imm-todo-edit-input"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      maxLength={120}
                      style={{marginRight: 4}}
                      onBlur={() => handleEditSave(todo.id)}
                      onKeyDown={(e) => handleKeyDown(e, todo.id)}
                    />
                    <input
                      ref={dateRef}
                      className="imm-todo-edit-date"
                      type="datetime-local"
                      value={editingDue}
                      style={{maxWidth: "67%"}}
                      onChange={e => setEditingDue(e.target.value)}
                      onBlur={() => handleEditSave(todo.id)}
                      onKeyDown={(e) => handleKeyDown(e, todo.id)}
                    />
                  </>
                ) : (
                  <span
                    className="imm-todo-text"
                    onDoubleClick={() => handleEdit(todo.id, todo.text, todo.due)}
                    title="Double-click to edit"
                  >
                    {todo.text}
                  </span>
                )}
                <button
                  className="imm-todo-delete"
                  onClick={() => handleDelete(todo.id)}
                  title="Delete"
                >
                  ✕
                </button>
                {todo.due && (
                  <span className={`imm-todo-due${status ? " " + status : ""}`}>
                    <span role="img" aria-label="due">⏰</span>
                    {new Date(todo.due).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: "2-digit", minute: "2-digit" })}
                    {status === "overdue" && <span className="imm-todo-due-label" aria-label="overdue">Overdue</span>}
                    {status === "soon" && <span className="imm-todo-due-label" aria-label="soon">Soon</span>}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <footer className="imm-todo-footer">
          <span>{todos.filter((t) => !t.completed).length} tasks left</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
