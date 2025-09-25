import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { NavbarL } from "./components/NavbarL.jsx";// Importar NavbarL correctamente
import QuickNotes from "./components/QuickNotes.jsx";

import Inicio from "./pages/Home/Home";
import Contact from "./pages/Contact/Contact";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import PasswordRecovery from "./pages/PasswordRecovery/PasswordRecovery";
import AccountSettings from "./pages/AccountSettings/AccountSettings";
import AccountSettingsUsers from "./pages/AccountSettings/AccountSettingsUsers"; // Asegúrate de que la ruta sea correcta
import RestablecerPassword from "./pages/RestablecerPassword/RestablecerPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import Simulator from "./pages/Simulator/Simulator";
import Users from "./pages/Users/Users";
import Inventory from "./pages/Materiales/Inventory.jsx";
import Materiales from "./pages/Materiales/Materiales.jsx";
import Empresas from "./pages/Empresas/Empresas";
import Categorias from "./pages/Categorias/Categorias";
import Notes from "./pages/Notes/Notes";
import Texturas from "./pages/Texturas/Texturas";

function Layout() {
  const location = useLocation();
  const [introPlaying, setIntroPlaying] = useState(false); // estado para el video

  // 🔹 Estado global de perfil para NavbarL
  const [profilePhoto, setProfilePhoto] = useState(sessionStorage.getItem("imagen") || "");
  const [profileName, setProfileName] = useState(sessionStorage.getItem("nombre") || "A");

  const noNavbarRoutes = [
    "/Login",
    "/password-recovery",
    "/forgot-password",
  ];

  const showNavbar = !noNavbarRoutes.includes(location.pathname) && !introPlaying;

  return (
    <div className="app-container"> 
    {showNavbar && <Navbar />}
      <QuickNotes />
      <main>
        <Routes>
          <Route path="/" element={<Inicio onIntroPlaying={setIntroPlaying} />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
          <Route
            path="/AccountSettings"
            element={
              <AccountSettings
                setProfilePhoto={setProfilePhoto}
                setProfileName={setProfileName}
              />
            }
          />
          <Route
            path="/AccountSettingsUsers"
            element={
              <AccountSettingsUsers
                setProfilePhoto={setProfilePhoto}
                setProfileName={setProfileName}
              />
            }
          />
          <Route path="/RestablecerPassword" element={<RestablecerPassword />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Simulator" element={<Simulator />} />
          <Route path="/Users" element={<Users />} />
          <Route path="/Inventory" element={<Inventory />} />
          <Route path="/Materiales" element={<Materiales />} />
          <Route path="/Empresas" element={<Empresas />} />
          <Route path="/Categories" element={<Categorias />} />
          <Route path="/Notes" element={<Notes />} />
          <Route path="/Texturas" element={<Texturas />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
