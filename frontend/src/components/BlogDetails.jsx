
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Footer from "./common/Footer";

const API_URL = "http://localhost:5000/api/blogs";

export default function BlogDetails() {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function fetchBlog() {
      try {
        setError("");

        const response = await axios.get(API_URL);
        const foundBlog = response.data.find(
          (item) => item._id === id
        );

        if (!foundBlog) {
          setError("This article could not be found.");
        } else {
          setBlog(foundBlog);
        }
      } catch {
        setError(
          "Unable to load this article. Please check your backend."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [id]);

  async function handleLike() {
    if (liking || !blog) return;

    try {
      setLiking(true);

      const response = await axios.patch(
        `${API_URL}/like/${blog._id}`
      );

      setBlog(response.data);
    } catch {
      setError("Unable to like this article. Please try again.");
    } finally {
      setLiking(false);
    }
  }

  const formatDate = (value) => {
    if (!value) return "Recently published";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  };

  return (
    <>
      <main className="article-page">
        <Link to="/blogs" className="article-back-link">
          <span aria-hidden="true">←</span> Back to all articles
        </Link>

        {loading ? (
          <div className="article-status">
            Loading article...
          </div>
        ) : error && !blog ? (
          <div className="article-status" role="alert">
            <h2>Article unavailable</h2>
            <p>{error}</p>
            <Link to="/blogs">Return to articles</Link>
          </div>
        ) : blog ? (
          <article className="article-reader">
            <header className="article-header">
              <p className="eyebrow">THE JOURNAL</p>

              <p className="article-date">
                {formatDate(blog.date)}
              </p>

              <h1 className="article-title">
                {blog.newTitle}
              </h1>

              <div className="article-meta">
                <span>Personal blog</span>
                <span aria-hidden="true">·</span>
                <span>{blog.likes || 0} likes</span>
              </div>
            </header>

            <div className="article-body">
              {(blog.newContent || "")
                .split(/\r?\n/)
                .map((paragraph, index) =>
                  paragraph.trim() ? (
                    <p key={index}>{paragraph}</p>
                  ) : null
                )}
            </div>

            {error && (
              <p className="blogs-message" role="alert">
                {error}
              </p>
            )}

            <footer className="article-footer">
              <div>
                <p className="article-footer-label">
                  ENJOYED THIS ARTICLE?
                </p>

                <p className="article-footer-text">
                  Show your appreciation for this post.
                </p>
              </div>

              <button
                type="button"
                className="like-button article-like-button"
                onClick={handleLike}
                disabled={liking}
              >
                {liking ? "Liking..." : "♡ Like article"}
              </button>
            </footer>

            <div className="article-bottom-link">
              <Link to="/blogs">
                ← Explore more articles
              </Link>
            </div>
          </article>
        ) : null}
      </main>

      <Footer />
    </>
  );
}
