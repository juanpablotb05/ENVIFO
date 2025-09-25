import React, { useState, useEffect } from "react";
import "./Home.css";
import StartingVideo from "../../assets/Starting.mp4";

const Home = ({ onIntroPlaying }) => {
  const [showVideo, setShowVideo] = useState(true);

  const services = [
    { title: "Architectural Design", description: "Innovative and functional designs tailored to your needs." },
    { title: "Interior Design", description: "Creating harmonious and aesthetically pleasing interiors." },
    { title: "Project Management", description: "Comprehensive management to ensure timely and on-budget completion." },
  ];

  const handleVideoEnd = () => {
    setShowVideo(false);
    if (onIntroPlaying) onIntroPlaying(false); // notifica a Layout que terminó el intro
  };

  // Forzar ocultar el intro después de 5 segundos
  useEffect(() => {
    if (onIntroPlaying) onIntroPlaying(true); // indica que el intro está activo
    const timer = setTimeout(() => {
      setShowVideo(false);
      if (onIntroPlaying) onIntroPlaying(false); // termina intro
    }, 5000);
    return () => clearTimeout(timer);
  }, [onIntroPlaying]);

  if (showVideo) {
    return (
      <div className="video-intro-container">
        <video
          className="video-intro"
          src={StartingVideo}
          autoPlay
          muted
          onEnded={handleVideoEnd}
        />
        <button className="skip-btn" onClick={handleVideoEnd}>
          Skip Intro
        </button>
      </div>
    );
  }

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-brand">
          <div className="logo-icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"/>
            </svg>
          </div>
          <h2>Architex</h2>
        </div>
      </header>

      <section className="hero-section">
        <h1>Crafting Spaces That Inspire</h1>
        <p>
          We are a team of architects dedicated to creating innovative and sustainable designs that meet your unique needs and aspirations.
        </p>
        <button className="btn-portfolio">View Our Portfolio</button>
      </section>

      <section id="projects" className="projects-section">
        <h2>Featured Projects</h2>
        <div className="project-card">
          <div className="project-image" />
          <div>
            <h3>Modern Residence</h3>
            <p>A contemporary home designed for a family of four.</p>
          </div>
        </div>
      </section>

      <section id="services" className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="about-section">
        <h2>About Us</h2>
        <p>
          Architex is a passionate team of architects and designers who are dedicated to transforming ideas into inspiring spaces. With a strong focus on innovation and sustainability, we ensure every project reflects our clients' vision while contributing positively to the environment and community.
        </p>
      </section>

      <section id="contact" className="contact-section">
        <h2>Contact Us</h2>
        <form className="contact-form">
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" type="text" />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" />
          </div>
          <div>
            <label htmlFor="message">Message</label>
            <textarea id="message" rows="4" />
          </div>
          <button type="submit">Send Message</button>
        </form>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Architex. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
