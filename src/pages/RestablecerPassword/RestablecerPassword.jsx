import React, { useState } from 'react';
import './RestablecerPassword.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/ENVIFO.png';

const PasswordRecovery = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMensaje('Las contraseñas no coinciden');
      return;
    }

    const newPassword = password.trim();
    const token = sessionStorage.token;

    fetch(`https://envifo-java-backend-api-rest.onrender.com/api/recuperacion/cambiar?token=${encodeURIComponent(token)}&nuevaPassword=${encodeURIComponent(newPassword)}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((data) => {
        navigate('/Login');
      })
      .catch((err) => {
        console.error(err);
        setMensaje('Error al cambiar la contraseña.');
      });
  };

  return (
    <div className="Recuperar-password-container">
      <div className="contenedor-recuperacion">
        <div className="logo-cabecera">
          <img src={logo} alt="Envifo Logo" className="logo" onClick={() => navigate('/')} />
          <h1>Restablecer contraseña</h1>
          <p>Introduce tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="formulario-contrasena">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {mensaje && <p className="mensaje-error">{mensaje}</p>}
          <button type="submit">Cambiar contraseña</button>
        </form>
      </div>
    </div>
  );
};

export default PasswordRecovery;
