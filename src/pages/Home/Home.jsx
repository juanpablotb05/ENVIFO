import React from "react";
import { NavLink } from "react-router";
import "./Home.css";

const Home = () => {
  const servicios = [
    {
      titulo: "Diseño Arquitectónico",
      descripcion: "Diseños innovadores y funcionales adaptados a tus necesidades.",
    },
    {
      titulo: "Diseño de Interiores",
      descripcion: "Creación de interiores armónicos y estéticamente agradables.",
    },
    {
      titulo: "Gestión de Proyectos",
      descripcion: "Gestión integral para garantizar tiempos y presupuestos.",
    },
  ];

  return (
    <div className="landing-container">

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <section className="hero-section">
          <h1>Construimos Espacios que Inspiran</h1>
          <p>
            Somos un equipo de arquitectos dedicados a crear diseños innovadores y sostenibles que cumplen con tus necesidades y aspiraciones.
          </p>
          <button className="btn-portfolio">Ver Portafolio</button>
        </section>

        <section id="proyectos" className="projects-section">
          <h2>Proyectos Destacados</h2>
          <div className="project-card">
            <div className="project-image" />
            <div>
              <h3>Residencia Moderna</h3>
              <p>Una casa contemporánea diseñada para una familia de cuatro.</p>
            </div>
          </div>
        </section>

        <section id="servicios" className="services-section">
          <h2>Nuestros Servicios</h2>
          <div className="services-grid">
            {servicios.map((servicio, index) => (
              <div key={index} className="service-card">
                <h3>{servicio.titulo}</h3>
                <p>{servicio.descripcion}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="nosotros" className="about-section">
          <h2>Sobre Nosotros</h2>
          <p>
            ENVIFO es un equipo apasionado de arquitectos y diseñadores que transforman ideas en espacios inspiradores. Con un fuerte enfoque en innovación y sostenibilidad, cada proyecto refleja la visión del cliente mientras aporta positivamente a la comunidad y el entorno.
          </p>
        </section>

        <section id="contacto" className="contact-section">
          <h2>Contáctanos</h2>
          <form className="contact-form">
            <div>
              <label htmlFor="name">Nombre</label>
              <input id="name" type="text" />
            </div>
            <div>
              <label htmlFor="email">Correo</label>
              <input id="email" type="email" />
            </div>
            <div>
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" rows="4" />
            </div>
            <button type="submit">Enviar</button>
          </form>
        </section>
      </main>
       {/* PIE DE PÁGINA */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} ENVIFO · DERECHOS RESERVADOS</p>
      </footer>
    </div>
  );
};

export default Home;
