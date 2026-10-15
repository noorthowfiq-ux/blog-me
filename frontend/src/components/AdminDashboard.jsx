
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api/blogs";
const ADMIN_UID = process.env.REACT_APP_ADMIN_UID;

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const { user, authLoading } = useAuth();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function getHeaders() {
    if (!user) throw new Error("Please sign in again.");

    const token = await user.getIdToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async function loadBlogs() {
    try {
      setError("");

      const response = await axios.get(API_URL);
      setBlogs(response.data);
    } catch {
      setError("Unable to load posts. Check that your backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && user.uid === ADMIN_UID) {
      loadBlogs();
    }
  }, [user]);

  const totalLikes = useMemo(
    () => blogs.reduce((total, blog) => total + (Number(blog.likes) || 0), 0),
    [blogs]
  );

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return blogs.filter(
      (blog) =>
        (blog.newTitle || "").toLowerCase().includes(query) ||
        (blog.newContent || "").toLowerCase().includes(query)
    );
  }, [blogs, search]);

  const recentBlogs = useMemo(
    () =>
      [...blogs]
        .sort(
          (a, b) =>
            new Date(b.date || 0).getTime() -
            new Date(a.date || 0).getTime()
        )
        .slice(0, 3),
    [blogs]
  );

  if (authLoading) {
    return <div className="admin-loading">Checking your account...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!ADMIN_UID || user.uid !== ADMIN_UID) {
    return (
      <main className="admin-page">
        <section className="admin-panel admin-denied">
          <h1>Admin access required</h1>
          <p>This account is not authorized to manage blog posts.</p>
          <p>Sign in with your configured administrator account.</p>
        </section>
      </main>
    );
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setEditingId(null);
    setError("");
    setNotice("");
  }

  function startEditing(blog) {
    setEditingId(blog._id);
    setTitle(blog.newTitle || "");
    setContent(blog.newContent || "");
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!title.trim() || !content.trim()) {
      setError("Enter both a title and article content.");
      return;
    }

    setSaving(true);

    try {
      const headers = await getHeaders();
      const payload = {
        newTitle: title.trim(),
        newContent: content.trim(),
      };

      if (editingId) {
        const response = await axios.put(
          `${API_URL}/${editingId}`,
          payload,
          { headers }
        );

        setBlogs((previous) =>
          previous.map((blog) =>
            blog._id === editingId ? response.data : blog
          )
        );

        setNotice("Article updated successfully.");
      } else {
        const response = await axios.post(API_URL, payload, { headers });

        setBlogs((previous) => [response.data, ...previous]);
        setNotice("Article published successfully.");
      }

      setTitle("");
      setContent("");
      setEditingId(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the article. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(blog) {
    const confirmed = window.confirm(
      `Delete "${blog.newTitle}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingId(blog._id);

    try {
      const headers = await getHeaders();

      await axios.delete(`${API_URL}/${blog._id}`, { headers });

      setBlogs((previous) =>
        previous.filter((item) => item._id !== blog._id)
      );

      if (editingId === blog._id) {
        setTitle("");
        setContent("");
        setEditingId(null);
      }

      setNotice("Article deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this article."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">YOUR WORKSPACE</p>
            <h1>Dashboard</h1>
            <p className="admin-subtitle">
              Manage your writing and keep your publication up to date.
            </p>
          </div>

          <div className="admin-account">
            <span className="admin-status-dot" />
            <span>Administrator</span>
          </div>
        </header>

        <section className="admin-stats">
          <article className="admin-stat-card">
            <span className="admin-stat-label">Total articles</span>
            <strong>{blogs.length}</strong>
            <span className="admin-stat-note">Published posts</span>
          </article>

          <article className="admin-stat-card">
            <span className="admin-stat-label">Total likes</span>
            <strong>{totalLikes}</strong>
            <span className="admin-stat-note">Across all articles</span>
          </article>

          <article className="admin-stat-card">
            <span className="admin-stat-label">Filtered results</span>
            <strong>{filteredBlogs.length}</strong>
            <span className="admin-stat-note">Matching your search</span>
          </article>
        </section>

        {error && (
          <p className="admin-alert admin-alert-error" role="alert">
            {error}
          </p>
        )}

        {notice && (
          <p className="admin-alert admin-alert-success" role="status">
            {notice}
          </p>
        )}

        <section className="admin-panel">
          <div className="admin-section-heading">
            <div>
              <p className="admin-eyebrow">
                {editingId ? "EDIT CONTENT" : "NEW CONTENT"}
              </p>
              <h2>{editingId ? "Edit article" : "Write an article"}</h2>
              <p className="admin-subtitle">
                {editingId
                  ? "Make your changes and save when you're ready."
                  : "Share your thoughts, knowledge, and experiences."}
              </p>
            </div>
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <label htmlFor="article-title">Article title</label>
            <input
              id="article-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter a descriptive title"
              maxLength={200}
              required
            />

            <label htmlFor="article-content">Article content</label>
            <textarea
              id="article-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Start writing your article..."
              rows={12}
              required
            />

            <div className="admin-editor-meta">
              <span>{title.length}/200 characters in title</span>
              <span>{content.length} characters in content</span>
            </div>

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Publish article"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel editing
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-panel admin-posts-panel">
          <div className="admin-section-heading">
            <div>
              <p className="admin-eyebrow">LIBRARY</p>
              <h2>Your articles</h2>
              <p className="admin-subtitle">
                Search and manage everything you've published.
              </p>
            </div>

            <span className="admin-count">
              {blogs.length} {blogs.length === 1 ? "article" : "articles"}
            </span>
          </div>

          <div className="admin-search">
            <label htmlFor="admin-search-input">Search articles</label>
            <input
              id="admin-search-input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or content..."
            />
          </div>

          {loading ? (
            <p className="admin-muted">Loading articles...</p>
          ) : filteredBlogs.length === 0 ? (
            <div className="admin-empty">
              <h3>{search ? "No matching articles" : "No articles yet"}</h3>
              <p>
                {search
                  ? "Try another search term."
                  : "Create your first article using the form above."}
              </p>
            </div>
          ) : (
            <div className="admin-post-list">
              {filteredBlogs.map((blog) => (
                <article className="admin-post-row" key={blog._id}>
                  <div className="admin-post-info">
                    <h3>{blog.newTitle}</h3>

                    <p>
                      {(blog.newContent || "").slice(0, 180)}
                      {(blog.newContent || "").length > 180 ? "..." : ""}
                    </p>

                    <div className="admin-post-meta">
                      <span>{formatDate(blog.date)}</span>
                      <span>{Number(blog.likes) || 0} likes</span>
                    </div>
                  </div>

                  <div className="admin-post-actions">
                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={() => startEditing(blog)}
                      disabled={Boolean(deletingId)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-delete-button"
                      onClick={() => handleDelete(blog)}
                      disabled={Boolean(deletingId)}
                    >
                      {deletingId === blog._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-panel admin-recent-panel">
          <div className="admin-section-heading">
            <div>
              <p className="admin-eyebrow">ACTIVITY</p>
              <h2>Recent articles</h2>
            </div>
          </div>

          {recentBlogs.length === 0 ? (
            <p className="admin-muted">Your recent articles will appear here.</p>
          ) : (
            <div className="admin-recent-list">
              {recentBlogs.map((blog) => (
                <div className="admin-recent-row" key={blog._id}>
                  <div>
                    <strong>{blog.newTitle}</strong>
                    <span>{formatDate(blog.date)}</span>
                  </div>
                  <span className="admin-recent-likes">
                    {Number(blog.likes) || 0} likes
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
