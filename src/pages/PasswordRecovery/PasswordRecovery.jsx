import React, { useState, useEffect } from 'react';
import './PasswordRecovery.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/ENVIFO.png';

const PasswordRecovery = () => {
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [botonDeshabilitado, setBotonDeshabilitado] = useState(true);
  const [contador, setContador] = useState(60); // segundos

  const navigate = useNavigate();

  useEffect(() => {
    const intervalo = setInterval(() => {
      setContador((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          setBotonDeshabilitado(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalo);
  }, []);

  const manejarCambioCodigoVerificacion = (evento) => {
    setCodigoVerificacion(evento.target.value);
  };

  const manejarVerificar = () => {
    const token = codigoVerificacion.trim();

    fetch(`https://envifo-java-backend-api-rest.onrender.com/api/recuperacion/validar?token=${encodeURIComponent(token)}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token inválido o expirado.");
        return res.text();
      })
      .then((data) => {
        sessionStorage.token = token;
        navigate('/RestablecerPassword');
      })
      .catch((err) => {
        console.error(err);
        setMensaje("Token inválido o expirado.");
      });
  };

  const manejarReenviarCodigo = () => {
    console.log('Reenviando código...');
    setBotonDeshabilitado(true);
    setContador(60);

    const intervalo = setInterval(() => {
      setContador((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          setBotonDeshabilitado(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const emailForgot = localStorage.getItem('emailRecuperacion');

  fetch(`http://localhost:8080/api/recuperacion/solicitar?email=${encodeURIComponent(emailForgot)}`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  }) 
      .then((res) => {
        if (!res.ok) throw new Error("Correo inválido.");
        return res.text();
      })
    .catch((err) => {
      console.error(err);
      setMensaje(`Correo inválido.`);
    });
  };

  return (
    <div className="contenedor-recuperacion-contrasena">
      <div className="cabecera">
        <div className="contenedor-logo">
          <div className="logo-section">
            <img src={logo} alt="Envifo Logo" className="logo" onClick={() => navigate('/')}/>
          </div>
        </div>
        <button className="boton-atras" onClick={() => window.history.back()}>
          <span className="flecha">←</span> atrás
        </button>
      </div>

      <div className="contenido">
        <h1>Recuperar contraseña</h1>
        <p>Ingresa el código de verificación enviado a su correo electrónico</p>

        <div className="grupo-entrada">
          <input
            type="text"
            placeholder="Código de verificación"
            value={codigoVerificacion}
            onChange={manejarCambioCodigoVerificacion}
            className="entrada-verificacion"
            required
          />
        </div>

        <button className="boton-verificar" onClick={manejarVerificar}>
          Verificar
        </button>

        <button
          className="boton-reenviar-codigo"
          onClick={manejarReenviarCodigo}
          disabled={botonDeshabilitado}
        >
          {botonDeshabilitado
            ? `Reenviar código (${contador}s)`
            : 'Reenviar código'}
        </button>

        {mensaje && <p className="mensaje-error">{mensaje}</p>}
      </div>
    </div>
  );
};

export default PasswordRecovery;
