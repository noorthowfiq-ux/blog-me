import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./home.css";

const API_URL = "https://noor-blog-backend.onrender.com/api/blogs";

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load posts");
        return response.json();
      })
      .then((data) => setBlogs(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Blog loading error:", error))
      .finally(() => setLoading(false));
  }, []);

  const featuredBlogs = blogs.slice(0, 3);

  const getExcerpt = (content = "") => {
    const plainText = content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > 130
      ? `${plainText.slice(0, 130)}...`
      : plainText || "Open this article to explore the full story.";
  };

  const formatDate = (date) => {
    if (!date) return "Journal entry";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              A PERSONAL JOURNAL
            </div>

            <h1>
              Ideas worth
              <br />
              <span>exploring.</span>
            </h1>

            <p className="hero-description">
              Thoughts, experiences, and lessons from the journey of
              learning, building, and discovering something new.
            </p>

            <div className="hero-actions">
              <Link to="/blogs" className="home-button">
                Explore the journal <span aria-hidden="true">↗</span>
              </Link>

              <Link to="/about" className="home-text-link">
                A little about me <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="hero-note">
              <span className="hero-note-dot" />
              Written with curiosity. Shared with purpose.
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />

            <div className="art-paper paper-back">
              <span>FIELD NOTES</span>
              <div className="paper-lines" />
            </div>

            <div className="art-paper paper-front">
              <span className="paper-index">NO. 001</span>
              <div className="paper-heading">
                The art of
                <br />
                beginning.
              </div>
              <div className="paper-divider" />
              <p>
                Every great idea starts with a question worth asking.
              </p>
              <span className="paper-signature">A NOTE TO SELF</span>
            </div>

            <div className="art-stamp">THINK<br />CREATE<br />REFLECT</div>
          </div>
        </div>
      </section>

      <section className="home-intro">
        <div className="section-label">THE JOURNAL</div>
        <div className="intro-content">
          <h2>
            A place for ideas,
            <br />
            <span>not just updates.</span>
          </h2>

          <p>
            Some things are worth slowing down for. This is a space to
            document the process, share useful discoveries, and make sense
            of what happens along the way.
          </p>
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-heading">
          <div>
            <div className="section-label">FRESH FROM THE JOURNAL</div>
            <h2>Recent writing</h2>
          </div>

          <Link to="/blogs" className="view-all-link">
            View all articles <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {loading ? (
          <div className="home-state">Loading articles...</div>
        ) : featuredBlogs.length > 0 ? (
          <div className="featured-grid">
            {featuredBlogs.map((blog, index) => (
              <article className="featured-card" key={blog._id || index}>
                <div className={`article-art article-art-${index + 1}`}>
                  <span className="article-art-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="article-art-symbol">
                    {index === 0 ? "✳" : index === 1 ? "◒" : "✳"}
                  </span>
                  <span className="article-art-caption">
                    NOTES &amp; REFLECTIONS
                  </span>
                </div>

                <div className="article-meta">
                  <span>{formatDate(blog.date)}</span>
                  <span>{blog.likes || 0} likes</span>
                </div>

                <h3>{blog.newTitle || "Untitled article"}</h3>
                <p className="article-excerpt">
                  {getExcerpt(blog.newContent)}
                </p>

                <Link to="/blogs" className="article-read-link">
                  Read article <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="home-empty">
            <div className="empty-icon">✳</div>
            <h3>The first story is yet to be written.</h3>
            <p>
              New writing will appear here when an article is published.
            </p>
            <Link to="/blogs" className="home-text-link">
              Visit the journal <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </section>

      <section className="home-about">
        <div className="about-decoration" aria-hidden="true">N.</div>
        <div className="about-copy">
          <div className="section-label">BEHIND THE WORDS</div>
          <h2>
            Always learning.
            <br />
            Always <span>building.</span>
          </h2>
          <p>
            This journal is a record of the ideas, projects, and experiences
            that shape the journey. The goal is simple: keep learning and
            share something useful along the way.
          </p>
          <Link to="/about" className="home-button">
            More about me <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="home-cta">
        <div className="section-label">STAY CURIOUS</div>
        <h2>There's always more to discover.</h2>
        <p>Take a moment, explore an idea, and see where it leads.</p>
        <Link to="/blogs" className="home-button home-button-light">
          Browse all writing <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  );
}

export default Home;
