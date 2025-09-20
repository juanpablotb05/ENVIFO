import { useEffect } from "react";
import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { NavbarL } from "../../components/NavbarL";

export default function Dashboard() {
  const navigate = useNavigate();

  // ✅ Protección de ruta
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) navigate("/Login");
  }, [navigate]);

  return (
    <NavbarL>
      <Layout>
        <div className="dashboard">
          <header className="header">
            <h1>Dashboard</h1>
            <div className="header-buttons">
              <button className="btn-primary">
                <Link to="/Simulator">Simulador 3D</Link>
              </button>
            </div>
          </header>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Clientes</h3>
              <p className="stat-value">2,543</p>
              <span className="stat-change positive">+15%</span>
            </div>
            <div className="stat-card">
              <h3>Deals Ganados</h3>
              <p className="stat-value">$542K</p>
              <span className="stat-change positive">+23%</span>
            </div>
            <div className="stat-card">
              <h3>Nuevos Leads</h3>
              <p className="stat-value">456</p>
              <span className="stat-change positive">+12%</span>
            </div>
            <div className="stat-card">
              <h3>Tasa Conversión</h3>
              <p className="stat-value">28%</p>
              <span className="stat-change negative">-5%</span>
            </div>
          </div>

          {/* Contenido */}
          <div className="content-grid">
            <div className="upload-container large">
              <div className="upload-area">
                <div className="upload-icon">📊</div>
                <h3>Mis Proyectos</h3>
                <p>Aquí podrás ver gráficas de inventario</p>
              </div>
            </div>

            <div className="upload-container">
              <div className="upload-area">
                <div className="upload-icon">📋</div>
                <h3>Materiales Contenidos</h3>
                <p>Aquí podrás ver información de materiales</p>
              </div>
            </div>
          </div>

          {/* Proyectos */}
          <div className="projects-grid">
            <div className="upload-container">
              <div className="upload-area">
                <div className="upload-icon">🗂️</div>
                <h3>Proyectos Activos</h3>
                <p>Aquí podrás ver los proyectos en curso</p>
              </div>
            </div>

            <div className="upload-container">
              <div className="upload-area">
                <div className="upload-icon">🔧</div>
                <h3>Materiales Recientes</h3>
                <p>Aquí podrás ver los últimos materiales y simulaciones</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </NavbarL>
  );
}


