import React, { useState, useRef } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import logo from "../../assets/ENVIFO.png";
import { HiOutlineLogin } from "react-icons/hi";

const Login = () => {
  const [isRightPanelActive, setRightPanelActive] = useState(false);
  const [intentos, setIntentos] = useState(3);
  const [mensaje, setMensaje] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("Usuario");
  const navigate = useNavigate();

  // Refs Usuario
  const nameUserRef = useRef(null);
  const lastNameUserRef = useRef(null);
  const emailUserRef = useRef(null);
  const passUserRef = useRef(null);

  // Refs Empresa
  const nameCompanyRef = useRef(null);
  const addressCompanyRef = useRef(null);
  const phoneCompanyRef = useRef(null);
  const emailCompanyRef = useRef(null);
  const passCompanyRef = useRef(null);

  // Refs Login
  const userLogRef = useRef(null);
  const passLogRef = useRef(null);
  const botonRef = useRef(null);

  // Cambiar panel
  const handleSignUp = () => setRightPanelActive(true);
  const handleSignIn = () => setRightPanelActive(false);

  //  Registrar Usuario
  const registrarUsuario = () => {
    const name = nameUserRef.current.value.trim();
    const surName = lastNameUserRef.current.value.trim();
    const emailReg = emailUserRef.current.value.trim();
    const passwordReg = passUserRef.current.value.trim();

    if (!name || !surName || !emailReg || !passwordReg) {
      alert("Por favor completa todos los campos");
      return;
    }

    const registerData = {
      firstName: name,
      firstSurname: surName,
      email: emailReg,
      password: passwordReg,
    };

    fetch("https://envifo-java-backend-api-rest.onrender.com/api/registerUser", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 409) {
            throw new Error("Conflict"); // ⚡ caso especial
          }
          throw new Error("Error al registrar usuario");
        }
        return res.text();
      })
      .then((msg) => {
        console.log("Mensaje recibido:", msg);
        alert("Usuario registrado con éxito ✅");
        setRightPanelActive(false);

        // Limpiar campos
        nameUserRef.current.value = "";
        lastNameUserRef.current.value = "";
        emailUserRef.current.value = "";
        passUserRef.current.value = "";
      })
      .catch((err) => {
        if (err.message === "Conflict") {
          alert("El usuario ya existe, intenta con otro correo.");
        } else {
          alert("Hubo un problema al registrar el usuario.");
          console.error(err);
        }
      });
  }; // 👈 cierre correcto

  //  Registrar Empresa
  const registrarEmpresa = () => {
    const name = nameCompanyRef.current.value.trim();
    const address = addressCompanyRef.current.value.trim();
    const phone = phoneCompanyRef.current.value.trim();
    const email = emailCompanyRef.current.value.trim();
    const password = passCompanyRef.current.value.trim();

    if (!name || !address || !phone || !email || !password) {
      alert("Por favor completa todos los campos");
      return;
    }

    const empresaData = {
      name,
      address,
      phone,
      email,
      password,
    };

    fetch("https://envifo-java-backend-api-rest.onrender.com/api/registerCustomer", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`, // ahora consistente
      },
      body: JSON.stringify(empresaData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al registrar empresa");
        return res.text();
      })
      .then((msg) => {
        console.log("Respuesta servidor:", msg);
        alert("Empresa registrada con éxito ✅");
        setRightPanelActive(false);

        // Limpiar campos
        nameCompanyRef.current.value = "";
        addressCompanyRef.current.value = "";
        phoneCompanyRef.current.value = "";
        emailCompanyRef.current.value = "";
        passCompanyRef.current.value = "";
      })
      .catch((err) => {
        console.error(err);
        alert("Hubo un problema al registrar la empresa.");
      });
  };

  //  Login
  const loginAction = (e) => {
    e.preventDefault();
    if (intentos <= 0) return;

    const usuarioLog = userLogRef.current.value.trim();
    const passwordLog = passLogRef.current.value.trim();

    const loginData = {
      email: usuarioLog,
      password: passwordLog,
    };

    fetch("https://envifo-java-backend-api-rest.onrender.com/api/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error de autenticación");
        return res.json();
      })
      .then((data) => {
        const token = data.accessToken;
        const tokenData = jwtDecode(token);

        // 🔐 Siempre guardar el token
        sessionStorage.setItem("token", token);

        // 📌 Datos básicos
        sessionStorage.setItem("email", tokenData.email || "");
        sessionStorage.setItem("nombre", tokenData.nombre || tokenData.userName || "Sin Nombre");
        sessionStorage.setItem("usuario", tokenData.idUsuario || tokenData.idCliente || "");
        sessionStorage.setItem("idRol", tokenData.idRol || "");
        sessionStorage.setItem("rol", tokenData.rol || "");
        sessionStorage.setItem("tipo", tokenData.tipo || "");
        sessionStorage.setItem("direccion", tokenData.direccion || "");
        sessionStorage.setItem("telefono", tokenData.telefono || "");
        sessionStorage.setItem("url", tokenData.url || "");

        // 🖼 Imagen
        if (tokenData.imagen) {
          sessionStorage.setItem("idImagen", tokenData.imagen.idFile || "");
          sessionStorage.setItem("imagen", tokenData.imagen.keyR2 || "");
        }

        // ✅ Permisos
        if (tokenData.Permisos) {
          Object.entries(tokenData.Permisos).forEach(([key, value]) => {
            sessionStorage.setItem(key, value);
          });
        }

        // 🔄 Opcionales
        if (tokenData.primerNombre) sessionStorage.setItem("primerNombre", tokenData.primerNombre);
        if (tokenData.segundoNombre) sessionStorage.setItem("segundoNombre", tokenData.segundoNombre);
        if (tokenData.primerApellido) sessionStorage.setItem("primerApellido", tokenData.primerApellido);
        if (tokenData.segundoApellido) sessionStorage.setItem("segundoApellido", tokenData.segundoApellido);
        if (tokenData.edad) sessionStorage.setItem("edad", tokenData.edad);

        // Resetear intentos y navegar
        setIntentos(3);
        setMensaje("");
        navigate("/Dashboard");
      })
      .catch((err) => {
        console.error(err);
        const nuevosIntentos = intentos - 1;
        setIntentos(nuevosIntentos);

        if (nuevosIntentos > 0) {
          setMensaje(`Credenciales inválidas. Te quedan: ${nuevosIntentos} intentos.`);
        } else {
          alert("Número máximo de intentos alcanzado.");
          botonRef.current.style.display = "none";
          userLogRef.current.disabled = true;
          passLogRef.current.disabled = true;
        }
      });

    // 🔄 Limpiar inputs siempre
    userLogRef.current.value = "";
    passLogRef.current.value = "";
  };

  return (
    <div className={`container ${isRightPanelActive ? "right-panel-active" : ""}`}>
      {/* REGISTRO */}
      <div className="form-container sign-up-container">
        <form>
          <h1>Crear cuenta</h1>
          <div className="tipo-usuario-btn-group">
            <button
              type="button"
              className={`tipo-usuario-btn ${tipoUsuario === "Usuario" ? "active" : ""}`}
              onClick={() => setTipoUsuario("Usuario")}
            >
              Usuario
            </button>
            <button
              type="button"
              className={`tipo-usuario-btn ${tipoUsuario === "Empresa" ? "active" : ""}`}
              onClick={() => setTipoUsuario("Empresa")}
            >
              Empresa
            </button>
          </div>

          {/* Usuario */}
          {tipoUsuario === "Usuario" && (
            <>
              <input type="text" ref={nameUserRef} placeholder="Nombre" />
              <input type="text" ref={lastNameUserRef} placeholder="Apellido" />
              <input type="email" ref={emailUserRef} placeholder="Correo electrónico" />
              <input type="password" ref={passUserRef} placeholder="Contraseña" />
              <button type="button" className="button" onClick={registrarUsuario}>
                Registrar Usuario
              </button>
            </>
          )}

          {/* Empresa */}
          {tipoUsuario === "Empresa" && (
            <>
              <input type="text" ref={nameCompanyRef} placeholder="Nombre empresa" />
              <input type="text" ref={addressCompanyRef} placeholder="Dirección" />
              <input type="text" ref={phoneCompanyRef} placeholder="Teléfono empresa" />
              <input type="email" ref={emailCompanyRef} placeholder="Correo electrónico empresa" />
              <input type="password" ref={passCompanyRef} placeholder="Contraseña" />
              <button type="button" className="button" onClick={registrarEmpresa}>
                Registrar Empresa
              </button>
            </>
          )}
        </form>
      </div>

      {/* LOGIN */}
      <div className="form-container sign-in-container">
        <div style={{ position: "absolute", top: "10px", left: "10px" }}>
          <Link to="/" className="Login-btn">
            <HiOutlineLogin size={28} color="black" />
          </Link>
        </div>
        <form onSubmit={loginAction}>
          <h1>Iniciar sesión</h1>
          <input type="email" ref={userLogRef} placeholder="Email" />
          <input type="password" ref={passLogRef} placeholder="Password" />
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          <button type="submit" className="button" ref={botonRef}>
            Login
          </button>
          <p className="mensaje-error">{mensaje}</p>
        </form>
      </div>

      {/* OVERLAY */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <div className="logo-section">
              <img src={logo} alt="Envifo Logo" className="logo" onClick={() => navigate("/")} />
            </div>
            <p>Para ingresar, inicie sesión con su información.</p>
            <button className="ghost" onClick={handleSignIn}>
              Login
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <div className="logo-section">
              <img src={logo} alt="Envifo Logo" className="logo" onClick={() => navigate("/")} />
            </div>
            <h1>¡Bienvenido!</h1>
            <p>Registre su información para ingresar al aplicativo.</p>
            <button className="ghost" onClick={handleSignUp}>
              Registrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
