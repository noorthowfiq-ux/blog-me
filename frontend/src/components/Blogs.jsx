
import React, { useEffect, useState } from "react";
import axios from "axios";
import Footer from "./common/Footer";

const API_URL = "https://noor-blog-backend.onrender.com/api/blogs";

function getExcerpt(content, limit = 200) {
  const text = (content || "").replace(/\s+/g, " ").trim();

  if (text.length <= limit) {
    return text;
  }

  return text.slice(0, limit).trimEnd() + "...";
}

function formatDate(value) {
  if (!value) return "Recently published";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liking, setLiking] = useState("");

  async function fetchBlogs() {
    try {
      setError("");

      const response = await axios.get(API_URL);
      setBlogs(response.data);
    } catch {
      setError(
        "Unable to load blogs. Please check that the backend and MongoDB are running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogs();
  }, []);

  async function handleLike(id) {
    if (liking) return;

    try {
      setLiking(id);

      const response = await axios.patch(
        `${API_URL}/like/${id}`
      );

      setBlogs((previous) =>
        previous.map((blog) =>
          blog._id === id ? response.data : blog
        )
      );
    } catch {
      setError("Unable to like this post. Please try again.");
    } finally {
      setLiking("");
    }
  }

  const filteredBlogs = blogs.filter((blog) => {
    const query = search.toLowerCase();

    return (
      (blog.newTitle || "").toLowerCase().includes(query) ||
      (blog.newContent || "").toLowerCase().includes(query)
    );
  });

  return (
    <>
      <main className="page-container">
        <section className="blogs-hero">
          <p className="eyebrow">THE JOURNAL</p>

          <h1 className="blogs-title">
            Thoughts, ideas
            <br />
            <span>and everything in between.</span>
          </h1>

          <p className="muted blogs-intro">
            Articles, experiences, and things worth sharing.
            Explore the latest posts below.
          </p>

          <div className="blog-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              aria-label="Search blogs"
              placeholder="Search articles..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </section>

        <section className="section blogs-list-section">
          <div className="blogs-list-heading">
            <div>
              <p className="eyebrow">EXPLORE</p>
              <h2 className="section-heading">Latest articles</h2>
            </div>

            <span className="muted">
              {filteredBlogs.length}{" "}
              {filteredBlogs.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {error && (
            <p className="blogs-message" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <p className="muted blogs-empty">Loading articles...</p>
          ) : filteredBlogs.length === 0 ? (
            <div className="blogs-empty">
              <h3>
                {search
                  ? "No matching articles"
                  : "Nothing published yet"}
              </h3>

              <p className="muted">
                {search
                  ? "Try another search term."
                  : "New articles will appear here when published."}
              </p>
            </div>
          ) : (
            <div className="blog-grid">
              {filteredBlogs.map((blog, index) => (
                <article className="blog-card" key={blog._id}>
                  <div className="blog-card-top">
                    <span className="blog-number">
                      ARTICLE {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="blog-date">
                      {formatDate(blog.date)}
                    </span>
                  </div>

                  <h3 className="blog-card-title">
                    {blog.newTitle}
                  </h3>

                  <p className="blog-card-content">
                    {getExcerpt(blog.newContent)}
                  </p>

                  <div className="blog-card-bottom">
                    <div className="blog-like-group">
                      <button
                        type="button"
                        className="like-button"
                        disabled={liking === blog._id}
                        onClick={() => handleLike(blog._id)}
                        aria-label={`Like ${blog.newTitle}`}
                      >
                        {liking === blog._id
                          ? "Liking..."
                          : "♡ Like"}
                      </button>

                      <span className="blog-likes-count">
                        {blog.likes || 0} likes
                      </span>
                    </div>

                    <a
                      className="read-article-button"
                      href={`/blogs/${blog._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read article
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
