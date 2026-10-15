import React from "react";
import { Link } from "react-router-dom";
import "./about.css";

function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <span className="about-eyebrow">A LITTLE ABOUT ME</span>

        <h1>
          I am Noor Thowfiq<span>.</span>
        </h1>

        <p className="about-role">Full Stack Web Developer</p>

        <p className="about-intro">
          I'm a developer who enjoys turning ideas into real digital
          experiences. I build websites and web applications, explore
          emerging technologies, and continuously learn new ways to solve
          problems through code.
        </p>

        <div className="about-actions">
          <Link to="/blogs" className="about-primary-button">
            Explore my writing <span aria-hidden="true">↗</span>
          </Link>

          <Link to="/home" className="about-secondary-link">
            Back to home →
          </Link>
        </div>
      </section>

      <section className="about-details">
        <article className="about-detail-card">
          <span className="about-card-number">01</span>
          <h2>What I do</h2>
          <p>
            I develop web experiences across the frontend and backend,
            focusing on clear design, useful features, and reliable
            functionality.
          </p>
        </article>

        <article className="about-detail-card">
          <span className="about-card-number">02</span>
          <h2>What I explore</h2>
          <p>
            I'm interested in full-stack development, artificial
            intelligence, and the tools that help turn creative ideas into
            practical projects.
          </p>
        </article>

        <article className="about-detail-card">
          <span className="about-card-number">03</span>
          <h2>My approach</h2>
          <p>
            Keep learning, build consistently, solve problems thoughtfully,
            and improve with every project.
          </p>
        </article>
      </section>

      <section className="about-ending">
        <p>Every project is an opportunity to learn something new.</p>
        <span>NOOR THOWFIQ · DEVELOPER</span>
      </section>
    </main>
  );
}

export default About;