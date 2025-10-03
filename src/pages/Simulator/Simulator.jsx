import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextureLoader } from "three";
import "./Simulator.css";
import logo from "../../assets/ENVIFO.png";
import {
  FaPalette,
  FaCube,
  FaLightbulb,
  FaUserCircle,
  FaSave,
} from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import { GiStoneWall } from "react-icons/gi";

// Dimensiones de la habitación
const anchoPiso = 18;
const profundidadPiso = 9;
const alturaPared = 4;
const grosorPared = 0.2;
const mitadAnchoPiso = anchoPiso / 2;
const mitadProfundidadPiso = profundidadPiso / 2;

const materiales = [
  {
    nombre: "Madera",
    imagenMenu: "texturas/madera/roble.jpg",
    subtipos: [
      { nombre: "Roble", textura: "texturas/madera/roble.jpg" },
      { nombre: "Roble beige", textura: "texturas/madera/roblebeige.jpg" },
      { nombre: "Nogal", textura: "texturas/madera/nogal.jpg" },
      { nombre: "Pino", textura: "texturas/madera/pino.jpg" },
      {
        nombre: "Cedro de libano",
        textura: "texturas/madera/Cedrodelibano.jpg",
      },
      { nombre: "Teca", textura: "texturas/madera/teca.jpg" },
      { nombre: "Olmo", textura: "texturas/madera/olmo.jpg" },
      { nombre: "Sapan", textura: "texturas/madera/sapan.jpg" },
    ],
  },
  {
    nombre: "Cerámica",
    imagenMenu: "texturas/ceramica/ceramicabeige.jpg",
    subtipos: [
      {
        nombre: "Ceramica blanca",
        textura: "texturas/ceramica/ceramicablanca.jpg",
      },
      {
        nombre: "Ceramica Beige",
        textura: "texturas/ceramica/ceramicabeige.jpg",
      },
      {
        nombre: "Ceramica Marrón",
        textura: "texturas/ceramica/ceramicamarron.jpg",
      },
      { nombre: "Azulejo agua", textura: "texturas/ceramica/ceramicaazul.jpg" },
      {
        nombre: "Ceramica Negra",
        textura: "texturas/ceramica/cerarmicanegra.jpg",
      },
      {
        nombre: "Pizarra cuadrada negra",
        textura: "texturas/ceramica/pizarracuadrada negra.jpg",
      },
      {
        nombre: "Terrazo moteado blanco",
        textura: "texturas/ceramica/Terrazomoteado.png",
      },
      {
        nombre: "Azulejo cuadrado marfil",
        textura: "/texturas/ceramica/Azulejocuadradomarfil.jpg",
      },
    ],
  },
  {
    nombre: "Porcelanato",
    imagenMenu: "texturas/porcelanato/marmolblanco.jpg",
    subtipos: [
      {
        nombre: "Marmol Beige",
        textura: "texturas/porcelanato/porcelanatobeige.jpg",
      },
      {
        nombre: "Mármol blanco beteado",
        textura: "texturas/porcelanato/marmolblanco.jpg",
      },
      {
        nombre: "Mármol Negro",
        textura: "texturas/porcelanato/marmolnegro.jpg",
      },
      {
        nombre: "Marmol metal bronce",
        textura: "texturas/porcelanato/marmolmetalbronce.jpg",
      },
      {
        nombre: "Mármol Azul beteado",
        textura: "texturas/porcelanato/marmolazulbeteado.jpg",
      },
      {
        nombre: "Mármol crema de marfil",
        textura: "texturas/porcelanato/marmolcreamade marfil.jpg",
      },
      {
        nombre: "Mármol amarillo rey",
        textura: "texturas/porcelanato/marmolamarillorey.jpg",
      },
      {
        nombre: "Mármol crema huscar",
        textura: "texturas/porcelanato/marmolhuescar.jpg",
      },
    ],
  },
  {
    nombre: "Piedra",
    imagenMenu: "/texturas/piedra/paredderoca07.jpg",
    subtipos: [
      { nombre: "Pizarra", textura: "texturas/piedra/pizarra.jpg" },
      { nombre: "Granito", textura: "texturas/piedra/granito.jpg" },
      {
        nombre: "Piedra gris mixto",
        textura: "texturas/piedra/piedragrismixto.jpg",
      },
      {
        nombre: "Ladrillo Holandés",
        textura: "texturas/piedra/ladrilloholandes.jpg",
      },
      { nombre: "Piedra laja", textura: "texturas/piedra/piedralaja.jpg" },
      {
        nombre: "Muro de piedra japonés",
        textura: "texturas/piedra/Murodepiedrajapones.jpg",
      },
      { nombre: "Roca del rio", textura: "texturas/piedra/Rocadelrio.jpg" },
      {
        nombre: "Piedra volcánica",
        textura: "texturas/piedra/piedravolcanica.jpg",
      },
    ],
  },
];

const modelosTexturas = [
  {
    nombre: "Materiales Globales",
    imagenMenu: "texturas/texturas.jpg",
  },
  {
    nombre: "Materiales de empresa",
    imagenMenu: "texturas/texturas.jpg",
  },
];

const objetos = [
  {
    nombre: "Habitación",
    imagenMenu: "/Ambientes/habitacion.jpg",
    subtipos: [
      {
        nombre: "Cama",
        preview: "objetosJPG/cama.jpg",
        modelo: "objetos/habitacion/cama.glb",
      },
      {
        nombre: "Armario",
        preview: "objetosJPG/armario.jpg",
        modelo: "objetos/Habitacion/armario.glb",
      },
    ],
  },
  {
    nombre: "Sala",
    imagenMenu: "/Ambientes/sala.jpg",
    subtipos: [
      {
        nombre: "Sofa",
        preview: "objetosJPG/sofa.jpg",
        modelo: "objetos/sala/Sofa.glb",
      },
      {
        nombre: "Mesa",
        preview: "public/mesadecentro.jpg",
        modelo: "objetos/sala/mesacentro.glb",
      },
      {
        nombre: "Silla de descanso",
        preview: "objetosJPG/silladedescanso.webp",
        modelo: "objetos/habitacion/sillahabitacion.glb",
      },
    ],
  },
  {
    nombre: "Cocina",
    imagenMenu: "/Ambientes/cocina.jpg",
    subtipos: [
      {
        nombre: "Encimera",
        preview: "objetosJPG/Encimera.jpg",
        modelo: "objetos/cocina/encimera.glb",
      },
      {
        nombre: "Salpicadero",
        preview: "public/silla.jpg",
        modelo: "objetos/cocina/salpicadero.glb",
      },
      {
        nombre: "Cocina",
        preview: "public/silla.jpg",
        modelo: "objetos/cocina/cocina5.glb",
      },
    ],
  },
  {
    nombre: "Comedor",
    imagenMenu: "/Ambientes/comedor.jpg",
    subtipos: [
      { nombre: "Mesa", preview: "/Proyecto/public", modelo: "/" },
      { nombre: "Silla", preview: "public/silla.jpg", modelo: "/" },
    ],
  },
  {
    nombre: "Baño",
    imagenMenu: "/Ambientes/baño.jpg",
    subtipos: [
      {
        nombre: "Baño",
        preview: "objetosJPG/inodoro.jpg",
        modelo: "objetos/baños/inodoro.glb",
      },
      {
        nombre: "Lavamanos",
        preview: "objetosJPG/lavamanos.jpg",
        modelo: "objetos/baños/lavamanos.glb",
      },
    ],
  },
];

const API_BASE = "https://envifo-java-backend-api-rest.onrender.com/api";

export default function Simulator() {
  const contenedorRef = useRef(null);
  const escenaRef = useRef(null);
  const camaraRef = useRef(null);
  const renderizadorRef = useRef(null);
  const controlesRef = useRef(null);
  const lanzadorRayos = useRef(new THREE.Raycaster());
  const raton = useRef(new THREE.Vector2());
  const objetoSeleccionadoRef = useRef(null);
  const objetoArrastrableRef = useRef(null);
  const planoPiso = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const offset = useRef(new THREE.Vector3());
  const navigate = useNavigate();
  const idMaterialPiso = useRef(null); // ID para piso (backend GLB)
  // Refs para texturas de paredes/techo (locales, rutas)
  const texturaParedFrontal = useRef(null);
  const texturaParedTrasera = useRef(null);
  const texturaParedIzquierdaInferior = useRef(null);
  const texturaParedIzquierdaMedia = useRef(null);
  const texturaParedIzquierdaSuperior = useRef(null);
  const texturaParedDerecha = useRef(null);
  const texturaTecho = useRef(null);

  // Rotación con el mouse
  const isRotating = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Estado de menú
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [categoriaMaterialesAbierta, setCategoriaMaterialesAbierta] =
    useState(null);
  const [categoriaObjetosAbierta, setCategoriaObjetosAbierta] = useState(null);
  const [categoriaTexturasAbierta, setCategoriaTexturasAbierta] =
    useState(null);
  const [subtipos, setSubtipos] = useState([]);
  const [materialesEmpresa, setMaterialesEmpresa] = useState([]);
  const [cargandoMateriales, setCargandoMateriales] = useState(false);
  const [selectedSubtipo, setSelectedSubtipo] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);
  const [mostrarSeleccionEmpresa, setMostrarSeleccionEmpresa] = useState(false);
  const [mostrarGuardarPanel, setMostrarGuardarPanel] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [cargandoProyectos, setCargandoProyectos] = useState(false);
  const [mostrarProyectos, setMostrarProyectos] = useState(false);

  const [intensidadAmbiental, setIntensidadAmbiental] = useState(0.8);
  const [intensidadDireccional, setIntensidadDireccional] = useState(1.5);
  const [colorDireccional, setColorDireccional] = useState("#ffffff");

  const verificarAutenticacion = () => {
    const token = sessionStorage.getItem("token");
    return token !== null;
  };

  const solicitarAutenticacion = (mensaje) => {
    const resultado = window.confirm(
      `${mensaje}\n\n¿Deseas iniciar sesión ahora?\n\n` +
        `Presiona "Aceptar" para ir al login o "Cancelar" para continuar sin iniciar sesión.`
    );

    if (resultado) {
      navigate("/login");
    }
  };

  const obtenerDatosUsuario = () => {
    const rol = sessionStorage.getItem("rol");
    const email = sessionStorage.getItem("email");

    if (rol === "GLOBAL") {
      return {
        esEmpresa: true,
        nombreCompleto:
          sessionStorage.getItem("nombre") || "Empresa sin nombre",
        email: email || "Sin email",
        rutaPerfil: "/AccountSettings",
      };
    } else {
      const primerNombre = sessionStorage.getItem("primerNombre") || "";
      const primerApellido = sessionStorage.getItem("primerApellido") || "";
      return {
        esEmpresa: false,
        nombreCompleto:
          `${primerNombre} ${primerApellido}`.trim() || "Usuario sin nombre",
        email: email || "Sin email",
        rutaPerfil: "/AccountSettingsUsers",
      };
    }
  };

  const fetchEmpresas = async () => {
    setCargandoEmpresas(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE}/customer/all`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener empresas");

      const data = await response.json();
      setEmpresas(data);
    } catch (error) {
      console.error("Error al cargar empresas:", error);
      alert("No se pudieron cargar las empresas. Por favor intenta de nuevo.");
    } finally {
      setCargandoEmpresas(false);
    }
  };

  const seleccionarEmpresa = (idCliente) => {
    localStorage.setItem("selectedCompany", idCliente);
    setMostrarSeleccionEmpresa(false);
    setCategoriaTexturasAbierta("Materiales de empresa");
    fetchCategoriasEmpresa(idCliente);
  };

  const volverASeleccionarEmpresa = () => {
    localStorage.removeItem("selectedCompany");
    setMostrarSeleccionEmpresa(true);
    setSubtipos([]);
    setMaterialesEmpresa([]);
    setSelectedSubtipo(null);
    fetchEmpresas();
  };

  const fetchCategoriasEmpresa = async (idCustomer) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error(
          "No hay token de autenticación. Por favor inicia sesión."
        );
        return;
      }

      const url = `${API_BASE}/categories/customer/${idCustomer}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok)
        throw new Error("Error al obtener categorías de la empresa");

      const data = await response.json();
      const arr = Array.isArray(data) ? data : data?.items || data?.data || [];
      const subtiposTransformados = arr.map((cat) => ({
        nombre: cat.nombre || cat.name || "Sin nombre",
      }));
      setSubtipos(subtiposTransformados);
    } catch (error) {
      console.error("Error al cargar categorías de empresa:", error);
      alert(
        "No se pudieron cargar las categorías de la empresa. Por favor intenta de nuevo."
      );
      setSubtipos([]);
    }
  };

  const fetchMaterialesPorCategoria = async (nameCategory, idCustomer) => {
    setCargandoMateriales(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/materials/category/${nameCategory}/client/${idCustomer}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al obtener materiales");

      const data = await response.json();
      const arr = Array.isArray(data) ? data : data?.items || data?.data || [];
      const materialesTransformados = arr.map((mat) => ({
        idMaterial: mat.idMaterial,
        nombre: mat.nameMaterial || "Sin nombre",
        textura: mat.material?.keyR2 || "/texturas/texturas.jpg",
      }));
      setMaterialesEmpresa(materialesTransformados);
    } catch (error) {
      console.error("Error al cargar materiales:", error);
      alert(
        "No se pudieron cargar los materiales. Por favor intenta de nuevo."
      );
      setMaterialesEmpresa([]);
    } finally {
      setCargandoMateriales(false);
    }
  };

  const fetchMaterialesGlobales = async () => {
    setCargandoMateriales(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE}/materials/global`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener materiales globales");

      const data = await response.json();
      const arr = Array.isArray(data) ? data : data?.items || data?.data || [];
      const materialesTransformados = arr.map((mat) => ({
        idMaterial: mat.idMaterial,
        nombre: mat.nameMaterial || "Sin nombre",
        textura: mat.material?.keyR2 || "/texturas/texturas.jpg",
      }));
      setMaterialesEmpresa(materialesTransformados);
    } catch (error) {
      console.error("Error al cargar materiales globales:", error);
      alert(
        "No se pudieron cargar los materiales globales. Por favor intenta de nuevo."
      );
      setMaterialesEmpresa([]);
    } finally {
      setCargandoMateriales(false);
    }
  };

  const fetchModeloMaterial = async (idMaterial) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/materials/model/${idMaterial}`,
        {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok)
        throw new Error("Error al obtener el modelo del material");

      const data = await response.json();
      if (data.material?.keyR2) {
        idMaterialPiso.current = idMaterial; // Store the material ID for the floor
        cargarModelo(data.material.keyR2, true);
      } else {
        throw new Error("No se encontró el modelo GLB para este material");
      }
    } catch (error) {
      console.error("Error al cargar el modelo del material:", error);
      alert(
        "No se pudo cargar el modelo del material. Por favor intenta de nuevo."
      );
    }
  };

  const fetchProyectosUsuario = async () => {
    setCargandoProyectos(true);
    try {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("usuario");
      if (!token || !userId) {
        throw new Error(
          "No hay token o ID de usuario. Por favor inicia sesión."
        );
      }

      const response = await fetch(`${API_BASE}/projects/user/${userId}`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok)
        throw new Error("Error al obtener los proyectos del usuario");

      const data = await response.json();
      setProyectos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      alert("No se pudieron cargar los proyectos. Por favor intenta de nuevo.");
      setProyectos([]);
    } finally {
      setCargandoProyectos(false);
    }
  };

  const cargarProyecto = async (idProject) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE}/projects/${idProject}`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok)
        throw new Error("Error al obtener los detalles del proyecto");

      const data = await response.json();
      // Limpiar objetos existentes
      limpiarObjetos("modelo_objeto_");
      limpiarObjetos("modelo_tile_");

      // Restaurar configuración de luces
      const configuracion = JSON.parse(data.design.configuracion);
      setIntensidadAmbiental(configuracion.luces.ambiental);
      setIntensidadDireccional(configuracion.luces.direccional.intensidad);
      setColorDireccional(configuracion.luces.direccional.color);

      // Restaurar material del piso (GLB desde backend)
      const materiales = JSON.parse(data.design.materiales);
      if (materiales && materiales.length > 0) {
        const idMaterial = materiales[0];
        await fetchModeloMaterial(idMaterial);
      }

      // Restaurar texturas de paredes/techo (locales)
      const superficies = configuracion.superficies || {}; // Si no existe, objeto vacío
      if (superficies.pared_frontal) {
        const paredFrontal = escenaRef.current.getObjectByName("pared_frontal");
        if (paredFrontal) {
          objetoSeleccionadoRef.current = paredFrontal;
          aplicarTextura(superficies.pared_frontal);
        }
      }
      if (superficies.pared_trasera) {
        const paredTrasera = escenaRef.current.getObjectByName("pared_trasera");
        if (paredTrasera) {
          objetoSeleccionadoRef.current = paredTrasera;
          aplicarTextura(superficies.pared_trasera);
        }
      }
      if (superficies.pared_izquierda_inferior) {
        const paredIzquierdaInferior = escenaRef.current.getObjectByName(
          "pared_izquierda_inferior"
        );
        if (paredIzquierdaInferior) {
          objetoSeleccionadoRef.current = paredIzquierdaInferior;
          aplicarTextura(superficies.pared_izquierda_inferior);
        }
      }
      if (superficies.pared_izquierda_media) {
        const paredIzquierdaMedia = escenaRef.current.getObjectByName(
          "pared_izquierda_media"
        );
        if (paredIzquierdaMedia) {
          objetoSeleccionadoRef.current = paredIzquierdaMedia;
          aplicarTextura(superficies.pared_izquierda_media);
        }
      }
      if (superficies.pared_izquierda_superior) {
        const paredIzquierdaSuperior = escenaRef.current.getObjectByName(
          "pared_izquierda_superior"
        );
        if (paredIzquierdaSuperior) {
          objetoSeleccionadoRef.current = paredIzquierdaSuperior;
          aplicarTextura(superficies.pared_izquierda_superior);
        }
      }
      if (superficies.pared_derecha) {
        const paredDerecha = escenaRef.current.getObjectByName("pared_derecha");
        if (paredDerecha) {
          objetoSeleccionadoRef.current = paredDerecha;
          aplicarTextura(superficies.pared_derecha);
        }
      }
      if (superficies.techo) {
        const techo = escenaRef.current.getObjectByName("techo");
        if (techo) {
          objetoSeleccionadoRef.current = techo;
          aplicarTextura(superficies.techo);
        }
      }

      // Restaurar objetos con posición y tamaño (mejorado para mapeo de nombres)
      if (configuracion.objetos && configuracion.objetos.length > 0) {
        for (const obj of configuracion.objetos) {
          // Extraer nombre base sin timestamp (e.g., "modelo_objeto_1759468225004" -> "modelo_objeto")
          const nombreBase = obj.name
            .split("_")
            .slice(0, -1)
            .join("_")
            .toLowerCase();
          const subTipo = objetos
            .flatMap((cat) => cat.subtipos)
            .find((sub) => sub.nombre.toLowerCase() === nombreBase);
          const modelUrl = subTipo?.modelo;
          if (modelUrl && modelUrl !== "/") {
            const cargador = new GLTFLoader();
            cargador.load(
              modelUrl,
              (gltf) => {
                const modelo = gltf.scene;
                modelo.name = obj.name; // Mantener nombre original
                modelo.position.set(...obj.position);
                modelo.rotation.set(...obj.rotation);
                modelo.scale.set(...obj.scale);
                modelo.traverse((child) => {
                  if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                  }
                });
                escenaRef.current.add(modelo);
              },
              undefined,
              (error) => {
                console.error(`Error al cargar el modelo ${obj.name}:`, error);
                alert(`No se pudo cargar el modelo ${obj.name}.`);
              }
            );
          } else {
            console.warn(
              `No se encontró URL de modelo para objeto: ${obj.name}`
            );
          }
        }
      }

      setMenuAbierto(null);
      setMostrarProyectos(false);
    } catch (error) {
      console.error("Error al cargar el proyecto:", error);
      alert("No se pudo cargar el proyecto. Por favor intenta de nuevo.");
    }
  };

  const escalarObjeto = (factor) => {
    if (!objetoSeleccionadoRef.current) return;
    objetoSeleccionadoRef.current.scale.multiplyScalar(factor);
  };

  const duplicarObjeto = () => {
    if (!objetoSeleccionadoRef.current) return;
    const clon = objetoSeleccionadoRef.current.clone(true);
    clon.position.x += 1;
    clon.name = `modelo_objeto_${Date.now()}`;
    escenaRef.current.add(clon);
  };

  const eliminarObjeto = () => {
    if (!objetoSeleccionadoRef.current) return;
    escenaRef.current.remove(objetoSeleccionadoRef.current);
    objetoSeleccionadoRef.current = null;
  };

  const crearPared = (ancho, alto, grosor, color = 0xf5f5f5) => {
    const geometria = new THREE.BoxGeometry(ancho, alto, grosor);
    return new THREE.Mesh(geometria, new THREE.MeshStandardMaterial({ color }));
  };

  const crearParedSegmentadaIzquierda = (alto, grosor) => {
    const segmentos = [];
    const alturaInferior = alto * 0.4;
    const alturaMedia = alto * 0.1;
    const alturaSuperior = alto * 0.5;
    const profundidadPared = profundidadPiso;

    const colorBasePared = 0xffffff;

    const paredInferior = new THREE.Mesh(
      new THREE.BoxGeometry(grosor, alturaInferior, profundidadPared),
      new THREE.MeshStandardMaterial({ color: colorBasePared })
    );
    paredInferior.position.set(-mitadAnchoPiso, alturaInferior / 2, 0);
    paredInferior.name = "pared_izquierda_inferior";
    segmentos.push(paredInferior);

    const paredMedia = new THREE.Mesh(
      new THREE.BoxGeometry(grosor, alturaMedia, profundidadPared),
      new THREE.MeshStandardMaterial({ color: colorBasePared })
    );
    paredMedia.position.set(
      -mitadAnchoPiso,
      alturaInferior + alturaMedia / 2,
      0
    );
    paredMedia.name = "pared_izquierda_media";
    segmentos.push(paredMedia);

    const paredSuperior = new THREE.Mesh(
      new THREE.BoxGeometry(grosor, alturaSuperior, profundidadPared),
      new THREE.MeshStandardMaterial({ color: colorBasePared })
    );
    paredSuperior.position.set(
      -mitadAnchoPiso,
      alturaInferior + alturaMedia + alturaSuperior / 2,
      0
    );
    paredSuperior.name = "pared_izquierda_superior";
    segmentos.push(paredSuperior);

    const grupoPared = new THREE.Group();
    segmentos.forEach((seg) => grupoPared.add(seg));
    grupoPared.name = "pared_izquierda";
    return grupoPared;
  };

  const iniciar = () => {
    const escena = new THREE.Scene();
    escena.background = new THREE.Color(0xf0f0f0);
    escenaRef.current = escena;

    const camara = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    camara.position.set(0, 2, 10);
    camaraRef.current = camara;

    const renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    renderizador.shadowMap.enabled = true;
    renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
    contenedorRef.current.appendChild(renderizador.domElement);
    renderizadorRef.current = renderizador;

    const controles = new OrbitControls(camara, renderizador.domElement);
    controles.enablePan = false;
    controles.minPolarAngle = Math.PI / 4;
    controles.maxPolarAngle = Math.PI / 2;
    controles.minDistance = 2;
    controles.maxDistance = 3;
    controles.target.set(1, 1, 1);
    controlesRef.current = controles;

    const luzAmbiental = new THREE.AmbientLight(0xffffff, intensidadAmbiental);
    luzAmbiental.name = "luzAmbiental";
    escena.add(luzAmbiental);

    const luzDireccional = new THREE.DirectionalLight(
      0xffffff,
      intensidadDireccional
    );
    luzDireccional.position.set(10, 10, 10);
    luzDireccional.castShadow = true;
    luzDireccional.name = "luzDireccional";
    escena.add(luzDireccional);

    const piso = new THREE.Mesh(
      new THREE.PlaneGeometry(anchoPiso, profundidadPiso),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5 })
    );
    piso.rotation.x = -Math.PI / 2;
    piso.receiveShadow = true;
    piso.name = "piso";
    escena.add(piso);

    const paredFrontal = crearPared(
      anchoPiso,
      alturaPared,
      grosorPared,
      0xf5f5f5
    );
    paredFrontal.position.set(0, alturaPared / 2, mitadProfundidadPiso);
    paredFrontal.name = "pared_frontal";
    escena.add(paredFrontal);

    const paredTrasera = crearPared(
      anchoPiso,
      alturaPared,
      grosorPared,
      0xf5f5f5
    );
    paredTrasera.position.set(0, alturaPared / 2, -mitadProfundidadPiso);
    paredTrasera.name = "pared_trasera";
    escena.add(paredTrasera);

    const paredIzquierda = crearParedSegmentadaIzquierda(
      alturaPared,
      grosorPared
    );
    escena.add(paredIzquierda);

    const paredDerecha = crearPared(
      profundidadPiso,
      alturaPared,
      grosorPared,
      0xf5f5f5
    );
    paredDerecha.rotation.y = -Math.PI / 2;
    paredDerecha.position.set(mitadAnchoPiso, alturaPared / 2, 0);
    paredDerecha.name = "pared_derecha";
    escena.add(paredDerecha);

    const techo = new THREE.Mesh(
      new THREE.PlaneGeometry(anchoPiso + 2, profundidadPiso + 2),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    techo.rotation.x = Math.PI / 2;
    techo.position.y = alturaPared;
    techo.name = "techo";
    escena.add(techo);

    const intensidadFalsa = 0.6;
    const distanciaFalsa = 4;
    const decaimientoFalso = 2;
    const colorFalso = 0xffffff;

    const posiciones = [
      [anchoPiso / 3, alturaPared - 0.1, profundidadPiso / 3],
      [-anchoPiso / 3, alturaPared - 0.1, profundidadPiso / 3],
      [anchoPiso / 3, alturaPared - 0.1, -profundidadPiso / 3],
      [-anchoPiso / 3, alturaPared - 0.1, -profundidadPiso / 3],
    ];

    posiciones.forEach((pos) => {
      const luzPuntual = new THREE.PointLight(
        colorFalso,
        intensidadFalsa,
        distanciaFalsa,
        decaimientoFalso
      );
      luzPuntual.position.set(pos[0], pos[1], pos[2]);
      escena.add(luzPuntual);
    });
  };

  const limpiarObjetos = (nombrePrefijo) => {
    const objetosParaEliminar = escenaRef.current.children.filter((obj) =>
      obj.name.startsWith(nombrePrefijo)
    );
    objetosParaEliminar.forEach((obj) => {
      escenaRef.current.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  };

  const cargarModelo = (ruta, multiplicar = false, subNombre = "") => {
    const cargador = new GLTFLoader();
    cargador.load(
      ruta,
      (gltf) => {
        const modeloBase = gltf.scene;
        modeloBase.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        if (multiplicar) {
          limpiarObjetos("modelo_tile_");

          const caja = new THREE.Box3().setFromObject(modeloBase);
          const tamaño = new THREE.Vector3();
          caja.getSize(tamaño);

          const anchoDeseado = 0.6;
          const profundidadDeseada = 0.6;
          const escalaX = anchoDeseado / tamaño.x;
          const escalaZ = profundidadDeseada / tamaño.z;
          const escala = Math.min(escalaX, escalaZ);
          modeloBase.scale.set(escala, escala, escala);

          const cajaEscalada = new THREE.Box3().setFromObject(modeloBase);
          const tamañoEscalado = new THREE.Vector3();
          cajaEscalada.getSize(tamañoEscalado);

          const numModelosX = Math.floor(anchoPiso / tamañoEscalado.x);
          const numModelosZ = Math.floor(profundidadPiso / tamañoEscalado.z);
          const offsetX = (anchoPiso - numModelosX * tamañoEscalado.x) / 2;
          const offsetZ =
            (profundidadPiso - numModelosZ * tamañoEscalado.z) / 2;

          for (let i = 0; i < numModelosX; i++) {
            for (let j = 0; j < numModelosZ; j++) {
              const modeloInstancia = modeloBase.clone();
              const x =
                -mitadAnchoPiso +
                offsetX +
                i * tamañoEscalado.x +
                tamañoEscalado.x / 2;
              const z =
                -mitadProfundidadPiso +
                offsetZ +
                j * tamañoEscalado.z +
                tamañoEscalado.z / 2;
              modeloInstancia.position.set(x, tamañoEscalado.y / 2, z);
              modeloInstancia.name = `modelo_tile_${i}_${j}_${Date.now()}`;
              escenaRef.current.add(modeloInstancia);
            }
          }
        } else {
          modeloBase.name = `modelo_${subNombre}_${Date.now()}`;
          modeloBase.position.y = 0;
          escenaRef.current.add(modeloBase);
        }
      },
      undefined,
      (error) => {
        console.error("Error al cargar el modelo GLB:", error);
        alert(
          "No se pudo cargar el modelo. Verifica la URL o la configuración del servidor."
        );
      }
    );
  };

  const alPointerDown = (evento) => {
    raton.current.x = (evento.clientX / window.innerWidth) * 2 - 1;
    raton.current.y = -(evento.clientY / window.innerHeight) * 2 + 1;

    lanzadorRayos.current.setFromCamera(raton.current, camaraRef.current);

    const intersecciones = lanzadorRayos.current.intersectObjects(
      escenaRef.current.children,
      true
    );

    if (objetoSeleccionadoRef.current) {
      objetoSeleccionadoRef.current.traverse((child) => {
        if (child.isMesh && child.colorOriginal) {
          child.material.color.set(child.colorOriginal);
        }
      });
      objetoSeleccionadoRef.current = null;
    }

    if (intersecciones.length > 0) {
      const obj = intersecciones[0].object;

      let parent = obj;
      while (parent && !parent.name.startsWith("modelo_") && parent.parent) {
        parent = parent.parent;
      }

      if (parent && parent.name.startsWith("modelo_")) {
        objetoSeleccionadoRef.current = parent;
        objetoArrastrableRef.current = parent;

        const interseccion = lanzadorRayos.current.ray.intersectPlane(
          planoPiso.current,
          new THREE.Vector3()
        );
        if (interseccion) {
          offset.current
            .copy(interseccion)
            .sub(objetoArrastrableRef.current.position);
        }

        controlesRef.current.enabled = false;

        objetoArrastrableRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.colorOriginal = child.material.color.getHex();
            child.material.color.set(0xffcc80);
          }
        });
      } else {
        let parent = obj;
        while (
          parent &&
          ![
            "pared_trasera",
            "pared_frontal",
            "pared_izquierda_inferior",
            "pared_izquierda_media",
            "pared_izquierda_superior",
            "pared_derecha",
            "piso",
            "techo",
          ].includes(parent.name) &&
          parent.parent
        ) {
          parent = parent.parent;
        }
        if (parent) {
          objetoSeleccionadoRef.current = parent;
          if (parent.material) {
            parent.colorOriginal = parent.material.color.getHex();
            parent.material.color.set(0xffcc80);
          }
        }
      }
    }
  };

  const alPointerMove = (evento) => {
    if (!objetoArrastrableRef.current) return;

    raton.current.x = (evento.clientX / window.innerWidth) * 2 - 1;
    raton.current.y = -(evento.clientY / window.innerHeight) * 2 + 1;

    lanzadorRayos.current.setFromCamera(raton.current, camaraRef.current);
    const interseccion = lanzadorRayos.current.ray.intersectPlane(
      planoPiso.current,
      new THREE.Vector3()
    );

    if (interseccion) {
      objetoArrastrableRef.current.position.x =
        interseccion.x - offset.current.x;
      objetoArrastrableRef.current.position.z =
        interseccion.z - offset.current.z;
    }
  };

  const alPointerUp = () => {
    controlesRef.current.enabled = true;
    objetoArrastrableRef.current = null;
  };

  const aplicarTextura = (rutaTextura) => {
    const obj = objetoSeleccionadoRef.current;
    if (!obj) return;

    const cargador = new TextureLoader();
    cargador.load(rutaTextura, (textura) => {
      textura.wrapS = THREE.RepeatWrapping;
      textura.wrapT = THREE.RepeatWrapping;
      textura.repeat.set(2, 2);

      obj.traverse((child) => {
        if (child.isMesh && child.material) {
          const newMaterial = child.material.clone();
          newMaterial.map = textura;
          newMaterial.bumpMap = textura;
          newMaterial.bumpScale = 0.02;
          newMaterial.needsUpdate = true;
          child.material = newMaterial;
        }
      });

      // Rastrear ruta de textura para superficies específicas
      if (obj.name === "pared_frontal")
        texturaParedFrontal.current = rutaTextura;
      else if (obj.name === "pared_trasera")
        texturaParedTrasera.current = rutaTextura;
      else if (obj.name === "pared_izquierda_inferior")
        texturaParedIzquierdaInferior.current = rutaTextura;
      else if (obj.name === "pared_izquierda_media")
        texturaParedIzquierdaMedia.current = rutaTextura;
      else if (obj.name === "pared_izquierda_superior")
        texturaParedIzquierdaSuperior.current = rutaTextura;
      else if (obj.name === "pared_derecha")
        texturaParedDerecha.current = rutaTextura;
      else if (obj.name === "techo") texturaTecho.current = rutaTextura;
    });
  };

  const guardarProyecto = async () => {
    if (!projectName.trim()) {
      alert("El nombre del proyecto es obligatorio.");
      return;
    }

    // Capture simulator state
    const objetosEnEscena = escenaRef.current.children
      .filter((obj) => obj.name.startsWith("modelo_"))
      .map((obj) => ({
        name: obj.name,
        position: obj.position.toArray(),
        rotation: obj.rotation.toArray(),
        scale: obj.scale.toArray(),
      }));

    const estadoSimulador = {
      luces: {
        ambiental: intensidadAmbiental,
        direccional: {
          intensidad: intensidadDireccional,
          color: colorDireccional,
        },
      },
      objetos: objetosEnEscena,
      superficies: {
        // Guardar rutas de texturas locales para paredes/techo
        pared_frontal: texturaParedFrontal.current,
        pared_trasera: texturaParedTrasera.current,
        pared_izquierda_inferior: texturaParedIzquierdaInferior.current,
        pared_izquierda_media: texturaParedIzquierdaMedia.current,
        pared_izquierda_superior: texturaParedIzquierdaSuperior.current,
        pared_derecha: texturaParedDerecha.current,
        techo: texturaTecho.current,
      },
    };

    // Create Designs3dDto
    const designs3dDto = {
      configuracion: JSON.stringify(estadoSimulador),
      materiales: idMaterialPiso.current
        ? JSON.stringify([idMaterialPiso.current])
        : "[]", // Solo piso
      objetos: "[]", // Vacío
    };

    // Create ProjectDto
    const projectDto = {
      projectName: projectName,
      description: description,
      status: true,
      userId: parseInt(sessionStorage.getItem("usuario"), 10),
      clientId: selectedClientId ? parseInt(selectedClientId, 10) : null,
      design3d: designs3dDto,
    };

    // Capture screenshot
    renderizadorRef.current.render(escenaRef.current, camaraRef.current); // Ensure fresh render
    const base64Image =
      renderizadorRef.current.domElement.toDataURL("image/png");
    const byteString = atob(base64Image.split(",")[1]);
    const mimeString = base64Image.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const screenshotBlob = new Blob([ab], { type: mimeString });

    // Create FormData
    const formData = new FormData();
    formData.append("project", JSON.stringify(projectDto));
    formData.append("image", screenshotBlob, "screenshot.png");

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE}/projects/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error al guardar el proyecto: ${response.statusText}`);
      }

      alert("Proyecto guardado correctamente");
      setMostrarGuardarPanel(false);
      setProjectName("");
      setDescription("");
      setSelectedClientId("");
    } catch (error) {
      console.error("Error al guardar el proyecto:", error);
      alert(
        "No se pudo guardar el proyecto. Verifica tu conexión o inicia sesión nuevamente."
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!objetoSeleccionadoRef.current) return;
      switch (e.key) {
        case "+":
          escalarObjeto(1.1);
          break;
        case "-":
          escalarObjeto(0.9);
          break;
        case "d":
          duplicarObjeto();
          break;
        case "Delete":
          eliminarObjeto();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.button === 2 && objetoSeleccionadoRef.current) {
        isRotating.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e) => {
      if (!isRotating.current || !objetoSeleccionadoRef.current) return;

      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;

      const rotationSpeed = 0.01;
      objetoSeleccionadoRef.current.rotation.y += deltaX * rotationSpeed;
      objetoSeleccionadoRef.current.rotation.x += deltaY * rotationSpeed;

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isRotating.current = false;
    };

    const disableContextMenu = (e) => e.preventDefault();

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("contextmenu", disableContextMenu);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);

  const animar = () => {
    requestAnimationFrame(animar);
    controlesRef.current?.update();
    renderizadorRef.current?.render(escenaRef.current, camaraRef.current);
  };

  const alRedimensionar = () => {
    if (camaraRef.current && renderizadorRef.current) {
      camaraRef.current.aspect = window.innerWidth / window.innerHeight;
      camaraRef.current.updateProjectionMatrix();
      renderizadorRef.current.setSize(window.innerWidth, window.innerHeight);
    }
  };

  useEffect(() => {
    iniciar();
    animar();
    const domElement = renderizadorRef.current.domElement;
    domElement.addEventListener("pointerdown", alPointerDown);
    domElement.addEventListener("pointermove", alPointerMove);
    domElement.addEventListener("pointerup", alPointerUp);
    window.addEventListener("resize", alRedimensionar);

    return () => {
      window.removeEventListener("resize", alRedimensionar);
      if (renderizadorRef.current) {
        domElement.removeEventListener("pointerdown", alPointerDown);
        domElement.removeEventListener("pointermove", alPointerMove);
        domElement.removeEventListener("pointerup", alPointerUp);
        domElement.remove();
        renderizadorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const escena = escenaRef.current;
    if (escena) {
      const ambiental = escena.getObjectByName("luzAmbiental");
      if (ambiental) ambiental.intensity = intensidadAmbiental;
      const direccional = escena.getObjectByName("luzDireccional");
      if (direccional) {
        direccional.intensity = intensidadDireccional;
        direccional.color.set(colorDireccional);
      }
    }
  }, [intensidadAmbiental, intensidadDireccional, colorDireccional]);

  // Fetch empresas when save panel is opened
  useEffect(() => {
    if (mostrarGuardarPanel && empresas.length === 0) {
      fetchEmpresas();
    }
  }, [mostrarGuardarPanel]);

  // Fetch proyectos when proyectos panel is opened
  useEffect(() => {
    if (mostrarProyectos && proyectos.length === 0) {
      fetchProyectosUsuario();
    }
  }, [mostrarProyectos]);

  return (
    <div className="simulator-container">
      <div ref={contenedorRef}></div>
      <div className="sidebar-container">
        <div className="sidebar-icon-bar">
          <button
            onClick={() => navigate("/Dashboard")}
            className="bg-transparent border-none p-0 cursor-pointer"
          >
            <img src={logo} alt="Logo" className="logo-img" />
          </button>
          <button
            title="Perfil"
            className={`icon-item ${menuAbierto === "perfil" ? "active" : ""}`}
            onClick={() => {
              if (!verificarAutenticacion()) {
                solicitarAutenticacion(
                  "Para acceder a tu perfil necesitas iniciar sesión."
                );
                return;
              }
              setMenuAbierto(menuAbierto === "perfil" ? null : "perfil");
              setCategoriaMaterialesAbierta(null);
              setCategoriaObjetosAbierta(null);
              setCategoriaTexturasAbierta(null);
              setSelectedSubtipo(null);
              setMostrarGuardarPanel(false);
              setMostrarProyectos(false);
            }}
          >
            <FaUserCircle />
          </button>
          <button
            title="Personalizar"
            className={`icon-item ${
              menuAbierto === "materiales" ? "active" : ""
            }`}
            onClick={() => {
              setMenuAbierto(
                menuAbierto === "materiales" ? null : "materiales"
              );
              setCategoriaObjetosAbierta(null);
              setCategoriaTexturasAbierta(null);
              setSelectedSubtipo(null);
              setMostrarGuardarPanel(false);
              setMostrarProyectos(false);
            }}
          >
            <FaPalette />
          </button>
          <button
            title="Objetos"
            className={`icon-item ${menuAbierto === "objetos" ? "active" : ""}`}
            onClick={() => {
              setMenuAbierto(menuAbierto === "objetos" ? null : "objetos");
              setCategoriaMaterialesAbierta(null);
              setCategoriaTexturasAbierta(null);
              setSelectedSubtipo(null);
              setMostrarGuardarPanel(false);
              setMostrarProyectos(false);
            }}
          >
            <FaCube />
          </button>
          <button
            title="Materiales"
            className={`icon-item ${
              menuAbierto === "texturas" ? "active" : ""
            }`}
            onClick={() => {
              setMenuAbierto(menuAbierto === "texturas" ? null : "texturas");
              setCategoriaMaterialesAbierta(null);
              setCategoriaObjetosAbierta(null);
              setSelectedSubtipo(null);
              setMostrarGuardarPanel(false);
              setMostrarProyectos(false);
            }}
          >
            <GiStoneWall />
          </button>
          <button
            title="Iluminación"
            className={`icon-item ${
              menuAbierto === "iluminacion" ? "active" : ""
            }`}
            onClick={() => {
              setMenuAbierto(
                menuAbierto === "iluminacion" ? null : "iluminacion"
              );
              setCategoriaMaterialesAbierta(null);
              setCategoriaObjetosAbierta(null);
              setCategoriaTexturasAbierta(null);
              setSelectedSubtipo(null);
              setMostrarGuardarPanel(false);
              setMostrarProyectos(false);
            }}
          >
            <FaLightbulb />
          </button>
          <button
            className={`icon-item ${mostrarGuardarPanel ? "active" : ""}`}
            title="Guardar"
            onClick={() => {
              if (!verificarAutenticacion()) {
                solicitarAutenticacion(
                  "Para guardar proyectos necesitas iniciar sesión."
                );
                return;
              }
              setMenuAbierto(null);
              setCategoriaMaterialesAbierta(null);
              setCategoriaObjetosAbierta(null);
              setCategoriaTexturasAbierta(null);
              setSelectedSubtipo(null);
              setMostrarGuardarPanel(!mostrarGuardarPanel);
              setMostrarProyectos(false);
            }}
          >
            <FaSave />
          </button>
          <button className="icon-item">
            <MdAddCircle />
          </button>
        </div>

        <div
          className={`sidebar-content-panel ${
            menuAbierto || mostrarGuardarPanel || mostrarProyectos ? "open" : ""
          }`}
        >
          {menuAbierto === "perfil" && (
            <div className="menu-section">
              <h3>Mi perfil</h3>
              {(() => {
                const datosUsuario = obtenerDatosUsuario();
                return (
                  <>
                    <div className="profile-header">
                      <div className="profile-info">
                        {datosUsuario.esEmpresa ? (
                          <>
                            <p className="profile-name">
                              {datosUsuario.nombreCompleto}
                            </p>
                            <p className="profile-type">Empresa</p>
                          </>
                        ) : (
                          <>
                            <p className="profile-name">
                              {datosUsuario.nombreCompleto}
                            </p>
                          </>
                        )}
                        <p className="profile-email">{datosUsuario.email}</p>
                      </div>
                    </div>
                    <button
                      className="category-card profile-action-card"
                      onClick={() => navigate(datosUsuario.rutaPerfil)}
                    >
                      <span>Ver perfil completo</span>
                    </button>
                    <button
                      className="category-card profile-action-card"
                      onClick={() => {
                        setMostrarProyectos(true);
                        setMenuAbierto(null);
                      }}
                    >
                      <span>Mis proyectos</span>
                    </button>
                    <button
                      className="category-card profile-action-card"
                      onClick={() => {
                        sessionStorage.clear();
                        localStorage.clear();
                        console.clear();
                        navigate("/");
                      }}
                    >
                      <span>Cerrar sesión</span>
                    </button>
                  </>
                );
              })()}
            </div>
          )}

          {mostrarProyectos && (
            <div className="menu-section">
              <h3>Mis Proyectos</h3>
              <button
                className="back-button"
                onClick={() => {
                  setMostrarProyectos(false);
                  setMenuAbierto("perfil");
                }}
              >
                &larr; Volver a Perfil
              </button>
              {cargandoProyectos ? (
                <div className="loading-container">
                  <p>Cargando proyectos...</p>
                </div>
              ) : proyectos.length > 0 ? (
                <div className="item-grid">
                  {proyectos.map((proyecto) => (
                    <div
                      key={proyecto.idProject}
                      className="item-card project-card"
                      onClick={() => cargarProyecto(proyecto.idProject)}
                    >
                      <div
                        className="item-preview"
                        style={{
                          backgroundImage: `url(${proyecto.proyect.keyR2})`,
                        }}
                      />
                      <span>{proyecto.projectName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No hay proyectos disponibles.</p>
              )}
            </div>
          )}

          {menuAbierto === "materiales" && (
            <div className="menu-section">
              <h3>Personalización</h3>
              {categoriaMaterialesAbierta ? (
                <div className="submenu-details">
                  <button
                    className="back-button"
                    onClick={() => setCategoriaMaterialesAbierta(null)}
                  >
                    &larr; Volver a Texturas
                  </button>
                  <h4>{categoriaMaterialesAbierta}</h4>
                  <div className="item-grid">
                    {materiales
                      .find((mat) => mat.nombre === categoriaMaterialesAbierta)
                      ?.subtipos.map((sub) => (
                        <div
                          key={sub.nombre}
                          className="item-card material-subtype"
                          onClick={() => aplicarTextura(sub.textura)}
                        >
                          <div
                            className="item-preview"
                            style={{ backgroundImage: `url(${sub.textura})` }}
                          />
                          <span>{sub.nombre}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="category-grid">
                  {materiales.map((mat) => (
                    <button
                      key={mat.nombre}
                      className="category-card material"
                      onClick={() => setCategoriaMaterialesAbierta(mat.nombre)}
                    >
                      <div
                        className="category-image"
                        style={{ backgroundImage: `url(${mat.imagenMenu})` }}
                      />
                      <span>{mat.nombre}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {menuAbierto === "objetos" && (
            <div className="menu-section">
              <h3>Objetos</h3>
              {categoriaObjetosAbierta ? (
                <div className="submenu-details">
                  <button
                    className="back-button"
                    onClick={() => setCategoriaObjetosAbierta(null)}
                  >
                    &larr; Volver a Objetos
                  </button>
                  <h4>{categoriaObjetosAbierta}</h4>
                  <div className="item-grid">
                    {objetos
                      .find((obj) => obj.nombre === categoriaObjetosAbierta)
                      ?.subtipos.map((sub) => (
                        <div
                          key={sub.nombre}
                          className="item-card"
                          onClick={() =>
                            cargarModelo(sub.modelo, false, sub.nombre)
                          }
                        >
                          <div
                            className="item-preview"
                            style={{ backgroundImage: `url(${sub.preview})` }}
                          />
                          <span>{sub.nombre}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="category-grid">
                  {objetos.map((obj) => (
                    <button
                      key={obj.nombre}
                      className="category-card"
                      onClick={() => setCategoriaObjetosAbierta(obj.nombre)}
                    >
                      <div
                        className="category-image"
                        style={{ backgroundImage: `url(${obj.imagenMenu})` }}
                      />
                      <span>{obj.nombre}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {menuAbierto === "texturas" && (
            <div className="menu-section">
              <h3>Materiales</h3>
              {mostrarSeleccionEmpresa ? (
                <div className="submenu-details">
                  <button
                    className="back-button"
                    onClick={() => setMostrarSeleccionEmpresa(false)}
                  >
                    &larr; Volver a Materiales
                  </button>
                  <h4>Selecciona una empresa</h4>
                  <p className="info-text">
                    Selecciona la empresa de la cual deseas ver los materiales
                  </p>
                  {cargandoEmpresas ? (
                    <div className="loading-container">
                      <p>Cargando empresas...</p>
                    </div>
                  ) : empresas.length > 0 ? (
                    <div className="empresas-list">
                      {empresas.map((empresa) => (
                        <div
                          key={empresa.customerId}
                          className="empresa-card"
                          onClick={() => seleccionarEmpresa(empresa.customerId)}
                        >
                          <img
                            src={
                              empresa.images
                                ? empresa.images.keyR2
                                : "/texturas/texturas.jpg"
                            }
                            alt={empresa.name}
                            className="empresa-logo"
                          />
                          <div className="empresa-info">
                            <h5>{empresa.name}</h5>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-empresas">
                      <p>No hay empresas disponibles</p>
                    </div>
                  )}
                </div>
              ) : categoriaTexturasAbierta ? (
                <div className="submenu-details">
                  <button
                    className="back-button"
                    onClick={() => {
                      setCategoriaTexturasAbierta(null);
                      setSelectedSubtipo(null);
                      setMaterialesEmpresa([]);
                    }}
                  >
                    &larr; Volver a Materiales
                  </button>
                  {categoriaTexturasAbierta === "Materiales de empresa" && (
                    <button
                      className="back-button"
                      onClick={volverASeleccionarEmpresa}
                    >
                      &larr; Cambiar empresa
                    </button>
                  )}
                  <h4>{categoriaTexturasAbierta}</h4>
                  {categoriaTexturasAbierta === "Materiales de empresa" &&
                  selectedSubtipo ? (
                    <div>
                      <button
                        className="back-button"
                        onClick={() => {
                          setSelectedSubtipo(null);
                          setMaterialesEmpresa([]);
                        }}
                      >
                        &larr; Volver a Categorías
                      </button>
                      <h4>{selectedSubtipo}</h4>
                      {cargandoMateriales ? (
                        <div className="loading-container">
                          <p>Cargando materiales...</p>
                        </div>
                      ) : materialesEmpresa.length > 0 ? (
                        <div className="item-grid">
                          {materialesEmpresa.map((mat) => (
                            <div
                              key={mat.idMaterial}
                              className="item-card material-subtype"
                              onClick={() =>
                                fetchModeloMaterial(mat.idMaterial)
                              }
                            >
                              <div
                                className="item-preview"
                                style={{
                                  backgroundImage: `url(${mat.textura})`,
                                }}
                              />
                              <span>{mat.nombre}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>
                          No hay materiales disponibles para esta categoría.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="item-grid">
                      {categoriaTexturasAbierta === "Materiales Globales" ? (
                        cargandoMateriales ? (
                          <div className="loading-container">
                            <p>Cargando materiales...</p>
                          </div>
                        ) : materialesEmpresa.length > 0 ? (
                          materialesEmpresa.map((mat) => (
                            <div
                              key={mat.idMaterial}
                              className="item-card material-subtype"
                              onClick={() =>
                                fetchModeloMaterial(mat.idMaterial)
                              }
                            >
                              <div
                                className="item-preview"
                                style={{
                                  backgroundImage: `url(${mat.textura})`,
                                }}
                              />
                              <span>{mat.nombre}</span>
                            </div>
                          ))
                        ) : (
                          <p>No hay materiales globales disponibles.</p>
                        )
                      ) : (
                        subtipos.map((sub) => (
                          <div
                            key={sub.nombre}
                            className="item-card"
                            onClick={() => {
                              if (
                                categoriaTexturasAbierta ===
                                "Materiales de empresa"
                              ) {
                                setSelectedSubtipo(sub.nombre);
                                const idCustomer =
                                  localStorage.getItem("selectedCompany") ||
                                  sessionStorage.getItem("usuario");
                                fetchMaterialesPorCategoria(
                                  sub.nombre,
                                  idCustomer
                                );
                              }
                            }}
                          >
                            <div
                              className="item-preview"
                              style={{
                                backgroundImage: `url(/texturas/texturas.jpg)`,
                              }}
                            />
                            <span>{sub.nombre}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="category-grid">
                  {modelosTexturas.map((mod) => (
                    <button
                      key={mod.nombre}
                      className="category-card"
                      onClick={async () => {
                        if (mod.nombre === "Materiales de empresa") {
                          if (!verificarAutenticacion()) {
                            solicitarAutenticacion(
                              "Para acceder a los materiales de empresa necesitas iniciar sesión."
                            );
                            return;
                          }

                          const rol = sessionStorage.getItem("rol");

                          if (rol === "GLOBAL") {
                            const idCustomer =
                              sessionStorage.getItem("usuario");
                            setCategoriaTexturasAbierta(mod.nombre);
                            await fetchCategoriasEmpresa(idCustomer);
                          } else {
                            const empresaSeleccionada =
                              localStorage.getItem("selectedCompany");

                            if (!empresaSeleccionada) {
                              setMostrarSeleccionEmpresa(true);
                              await fetchEmpresas();
                            } else {
                              setCategoriaTexturasAbierta(mod.nombre);
                              await fetchCategoriasEmpresa(empresaSeleccionada);
                            }
                          }
                        } else {
                          setCategoriaTexturasAbierta(mod.nombre);
                          setSubtipos([]);
                          await fetchMaterialesGlobales();
                        }
                      }}
                    >
                      <div
                        className="category-image"
                        style={{ backgroundImage: `url(${mod.imagenMenu})` }}
                      />
                      <span>{mod.nombre}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {menuAbierto === "iluminacion" && (
            <div className="menu-section">
              <h3>Iluminación</h3>
              <label>
                Luz ambiental: {intensidadAmbiental.toFixed(2)}
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={intensidadAmbiental}
                  onChange={(e) =>
                    setIntensidadAmbiental(parseFloat(e.target.value))
                  }
                />
              </label>
              <label>
                Luz direccional: {intensidadDireccional.toFixed(2)}
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.01"
                  value={intensidadDireccional}
                  onChange={(e) =>
                    setIntensidadDireccional(parseFloat(e.target.value))
                  }
                />
              </label>
              <label>
                Color luz:
                <input
                  type="color"
                  value={colorDireccional}
                  onChange={(e) => setColorDireccional(e.target.value)}
                />
              </label>
            </div>
          )}

          {mostrarGuardarPanel && (
            <div className="menu-section">
              <h3>Guardar Proyecto</h3>
              <div className="save-form">
                <label>
                  Nombre del Proyecto *
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ingresa el nombre del proyecto"
                    required
                  />
                </label>
                <label>
                  Descripción
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ingresa una descripción (opcional)"
                  />
                </label>
                <label>
                  Cliente (Opcional)
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="">Selecciona un cliente</option>
                    {empresas.map((empresa) => (
                      <option
                        key={empresa.customerId}
                        value={empresa.customerId}
                      >
                        {empresa.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="save-form-buttons">
                  <button
                    className="save-button"
                    onClick={guardarProyecto}
                    disabled={!projectName.trim()}
                  >
                    Guardar
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => {
                      setMostrarGuardarPanel(false);
                      setProjectName("");
                      setDescription("");
                      setSelectedClientId("");
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

