
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-card">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/home" className="footer-logo">
              Personal<span>Journal</span>
            </Link>
            <p className="footer-description">
              A place for ideas, experiences, and lessons worth sharing.
            </p>
          </div>

          <nav className="footer-navigation" aria-label="Footer navigation">
            <h3>Explore</h3>
            <Link to="/home">Home</Link>
            <Link to="/blogs">Articles</Link>
            <a
              href="#top"
              onClick={(event) => {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Back to top ↑
            </a>
          </nav>

          <div className="footer-note">
            <h3>A note to readers</h3>
            <p>
              Thanks for being here. I hope you find an idea worth remembering
              and something new to think about.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Personal Journal</p>
          <p>Ideas shared with purpose.</p>
        </div>
      </div>
    </footer>
  );
}
