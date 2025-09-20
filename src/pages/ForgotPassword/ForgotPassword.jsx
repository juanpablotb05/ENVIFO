import React, { useState } from 'react';
import './ForgotPassword.css'; 
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/ENVIFO.png';
import Layout from "../../components/Layout";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    setIsValidEmail(validateEmail(value));
  };

  const handleContinue = () => {
    console.log('Correo electrónico ingresado:', email);
    localStorage.setItem('emailRecuperacion', email);
    navigate('/password-recovery');
  };

const forgotAction = () => {
  const emailForgot = email.trim();

  fetch(`https://envifo-java-backend-api-rest.onrender.com/api/recuperacion/solicitar?email=${encodeURIComponent(emailForgot)}`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  }).then((data) => {
      handleContinue();
    })
    .catch((err) => {
      console.error(err);
      setMensaje(`Correo inválido.`);
    });
};

  return (
    <Layout>
    <div className="forgot-password-container">
      <div className="logo-section">
        <img src={logo} alt="Envifo Logo" className="logo" onClick={() => navigate('/')}/>
      </div>

      <div className="content-section">
        <h1>Recuperar contraseña</h1>
        <p className="instruction-text">
          Ingresa tu correo electrónico para enviarte un código de verificación.
        </p>
        <div className="input-group">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={handleEmailChange}
            className="email-input"
            required
          />
        </div>
        <button
          className="continue-button"
          disabled={!isValidEmail}
          onClick={forgotAction}
          style={{
            backgroundColor: isValidEmail ? '#ff6600' : '#ccc',
            cursor: isValidEmail ? 'pointer' : 'not-allowed'
          }}
        >
          Continuar
        </button>
      </div>
    </div>
    </Layout>
  );
};

export default ForgotPassword;