
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three';
import './Simulator.css';
import logo from "../../assets/ENVIFO.png";
import { FaPalette, FaCube, FaLightbulb, FaUserCircle, FaSave } from 'react-icons/fa';
import { MdAddCircle } from "react-icons/md";
import { GiStoneWall } from "react-icons/gi";

// Dimensiones de la habitacion
const anchoPiso = 18;
const profundidadPiso = 9;
const alturaPared = 4;
const grosorPared = 0.2;
const mitadAnchoPiso = anchoPiso / 2;
const mitadProfundidadPiso = profundidadPiso / 2;

const materiales = [
    {
        nombre: 'Madera',
        imagenMenu: 'texturas/madera/roble.jpg',
        subtipos: [
            { nombre: 'Roble', textura: 'texturas/madera/roble.jpg' },
            { nombre: 'Roble beige', textura: 'texturas/madera/roblebeige.jpg' },
            { nombre: 'Nogal', textura: 'texturas/madera/nogal.jpg' },
            { nombre: 'Pino', textura: 'texturas/madera/pino.jpg' },
            { nombre: 'Cedro de libano', textura: 'texturas/madera/Cedrodelibano.jpg' },
            { nombre: 'Teca', textura: 'texturas/madera/teca.jpg' },
            { nombre: 'Olmo', textura: 'texturas/madera/olmo.jpg' },
            { nombre: 'Sapan', textura: 'texturas/madera/sapan.jpg' },
        ],
    },
    {
        nombre: 'Cerámica',
        imagenMenu: 'texturas/ceramica/ceramicabeige.jpg',
        subtipos: [
            { nombre: 'Ceramica blanca', textura: 'texturas/ceramica/ceramicablanca.jpg' },
            { nombre: 'Ceramica Beige', textura: 'texturas/ceramica/ceramicabeige.jpg' },
            { nombre: 'Ceramica Marrón', textura: 'texturas/ceramica/ceramicamarron.jpg' },
            { nombre: 'Azulejo agua', textura: 'texturas/ceramica/ceramicaazul.jpg'},
            { nombre: 'Ceramica Negra', textura: 'texturas/ceramica/cerarmicanegra.jpg'},
            { nombre: 'Pizarra cuadrada negra', textura: 'texturas/ceramica/pizarracuadrada negra.jpg'},
            { nombre: 'Terrazo moteado blanco', textura: 'texturas/ceramica/Terrazomoteado.png'},
            { nombre: 'Azulejo cuadrado marfil', textura: '/texturas/ceramica/Azulejocuadradomarfil.jpg'},
        ],
    },
    {
        nombre: 'Porcelanato',
        imagenMenu: 'texturas/porcelanato/marmolblanco.jpg',
        subtipos: [
            { nombre: 'Marmol Beige', textura: 'texturas/porcelanato/porcelanatobeige.jpg' },
            { nombre: 'Mármol blanco beteado', textura: 'texturas/porcelanato/marmolblanco.jpg' },
            { nombre: 'Mármol Negro', textura: 'texturas/porcelanato/marmolnegro.jpg' },
            { nombre: 'Marmol metal bronce', textura: 'texturas/porcelanato/marmolmetalbronce.jpg' },
            { nombre: 'Mármol Azul beteado', textura: 'texturas/porcelanato/marmolazulbeteado.jpg' },
            { nombre: 'Mármol crema de marfil', textura: 'texturas/porcelanato/marmolcreamade marfil.jpg' },
            { nombre: 'Mármol amarillo rey', textura: 'texturas/porcelanato/marmolamarillorey.jpg' },
            { nombre: 'Mármol crema huscar', textura: 'texturas/porcelanato/marmolhuescar.jpg' },
        ],
    },
    {
        nombre: 'Piedra',
        imagenMenu: '/texturas/piedra/paredderoca07.jpg',
        subtipos: [
            { nombre: 'Pizarra', textura: 'texturas/piedra/pizarra.jpg' },
            { nombre: 'Granito', textura: 'texturas/piedra/granito.jpg' },
            { nombre: 'Piedra gris mixto', textura: 'texturas/piedra/piedragrismixto.jpg'},
            { nombre: 'Ladrillo Holandés', textura: 'texturas/piedra/ladrilloholandes.jpg'},
            { nombre: 'Piedra laja', textura: 'texturas/piedra/piedralaja.jpg'},
            { nombre: 'Muro de piedra japonés', textura: 'texturas/piedra/Murodepiedrajapones.jpg'},
            { nombre: 'Roca del rio', textura: 'texturas/piedra/Rocadelrio.jpg'},
            { nombre: 'Piedra volcánica', textura: 'texturas/piedra/piedravolcanica.jpg'},
        ],
    },
    
    
    
];

const modelosTexturas = [

    {
        nombre: 'Materiales Globales',
        imagenMenu: 'texturas/texturas.jpg'

    },
    {
        nombre: 'Materiales de empresa',
        imagenMenu: 'texturas/texturas.jpg'
    },
];


const objetos = [
    {
        nombre: "Habitación",
        imagenMenu: '/Ambientes/habitacion.jpg',
        subtipos: [
            { nombre: "Cama", preview: "objetosJPG/cama.jpg", modelo: "objetos/habitacion/cama.glb"},
            { nombre: "Armario", preview: "objetosJPG/armario.jpg", modelo: "objetos/Habitacion/armario.glb" },
            
        ],
    },
    {
        nombre: "Sala",
        imagenMenu: 'Ambientes/sala.jpg',
        subtipos: [
            { nombre: "Sofa", preview: "objetosJPG/sofa.jpg", modelo: "objetos/sala/Sofa.glb" },
            { nombre: "Mesa", preview: "public/mesadecentro.jpg", modelo: "objetos/sala/mesacentro.glb" },
            { nombre: "Silla de descanso", preview: "objetosJPG/silladedescanso.webp", modelo: "objetos/habitacion/sillahabitacion.glb" },
        ],
    },
    {
        nombre: "Cocina",
        imagenMenu: 'Ambientes/cocina.jpg',
        subtipos: [
            { nombre: "Encimera", preview: "objetosJPG/Encimera.jpg", modelo: "objetos/cocina/encimera.glb" },
            { nombre: "Salpicadero", preview: "public/silla.jpg", modelo: "objetos/cocina/salpicadero.glb" },
            { nombre: "Cocina", preview: "public/silla.jpg", modelo: "objetos/cocina/cocina5.glb" },
        ],
        
    },
    {
        nombre: "Comedor",
        imagenMenu: 'Ambientes/comedor.jpg',
        subtipos: [
            { nombre: "Mesa", preview: "/Proyecto/public", modelo: "/" },
            { nombre: "Silla", preview: "public/silla.jpg", modelo: "/" },
        ],
    },
    {
        nombre: "Baño",
        imagenMenu: 'Ambientes/baño.jpg',
        subtipos: [
            { nombre: "Baño", preview: "objetosJPG/inodoro.jpg", modelo: "objetos/baños/inodoro.glb" },
            { nombre: "Lavamanos", preview: "objetosJPG/lavamanos.jpg", modelo: "objetos/baños/lavamanos.glb" },
        ],
    },
    
];

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

    // Rotación con el mouse
    const isRotating = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // Estado de menú
    const [menuAbierto, setMenuAbierto] = useState(null);
    const [categoriaMaterialesAbierta, setCategoriaMaterialesAbierta] = useState(null);
    const [categoriaObjetosAbierta, setCategoriaObjetosAbierta] = useState(null);
    const [categoriaTexturasAbierta, setCategoriaTexturasAbierta] = useState(null);
    const [subtipos, setSubtipos] = useState([]);

   // 🔹 Funciones de objetos
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

    //  Permite realizar funciones con Atajos de teclado 
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

    // Fetch de categorias
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
            const response = await fetch("https://envifo-java-backend-api-rest.onrender.com/api/categories/globals");
            const data = await response.json();

            const subtiposTransformados = data.map(cat => ({
                nombre: cat.nombre
            }));

            setSubtipos(subtiposTransformados);
            } catch (error) {
            console.error("Error al obtener categorías:", error);
            }
        };

        fetchCategorias();
    }, []);




    // Estados de iluminación
    const [intensidadAmbiental, setIntensidadAmbiental] = useState(0.8);
    const [intensidadDireccional, setIntensidadDireccional] = useState(1.5);
    const [colorDireccional, setColorDireccional] = useState('#ffffff');



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

        const paredInferior = new THREE.Mesh(new THREE.BoxGeometry(grosor, alturaInferior, profundidadPared), new THREE.MeshStandardMaterial({ color: colorBasePared }));
        paredInferior.position.set(-mitadAnchoPiso, alturaInferior / 2, 0);
        paredInferior.name = 'pared_izquierda_inferior';
        segmentos.push(paredInferior);

        const paredMedia = new THREE.Mesh(new THREE.BoxGeometry(grosor, alturaMedia, profundidadPared), new THREE.MeshStandardMaterial({ color: colorBasePared }));
        paredMedia.position.set(-mitadAnchoPiso, alturaInferior + alturaMedia / 2, 0);
        paredMedia.name = 'pared_izquierda_media';
        segmentos.push(paredMedia);

        const paredSuperior = new THREE.Mesh(new THREE.BoxGeometry(grosor, alturaSuperior, profundidadPared), new THREE.MeshStandardMaterial({ color: colorBasePared }));
        paredSuperior.position.set(-mitadAnchoPiso, alturaInferior + alturaMedia + alturaSuperior / 2, 0);
        paredSuperior.name = 'pared_izquierda_superior';
        segmentos.push(paredSuperior);

        const grupoPared = new THREE.Group();
        segmentos.forEach(seg => grupoPared.add(seg));
        grupoPared.name = 'pared_izquierda';
        return grupoPared;
    };

    const iniciar = () => {
        const escena = new THREE.Scene();
        escena.background = new THREE.Color(0xf0f0f0);
        escenaRef.current = escena;

        const camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
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
        luzAmbiental.name = 'luzAmbiental';
        escena.add(luzAmbiental);

        const luzDireccional = new THREE.DirectionalLight(0xffffff, intensidadDireccional);
        luzDireccional.position.set(10, 10, 10);
        luzDireccional.castShadow = true;
        luzDireccional.name = 'luzDireccional';
        escena.add(luzDireccional);

        const piso = new THREE.Mesh(
            new THREE.PlaneGeometry(anchoPiso, profundidadPiso),
            new THREE.MeshStandardMaterial({ color: 0xf5f5f5 })
        );
        piso.rotation.x = -Math.PI / 2;
        piso.receiveShadow = true;
        piso.name = 'piso';
        escena.add(piso);

        // Paredes
        const paredFrontal = crearPared(anchoPiso, alturaPared, grosorPared, 0xf5f5f5);
        paredFrontal.position.set(0, alturaPared / 2, mitadProfundidadPiso);
        paredFrontal.name = 'pared_frontal';
        escena.add(paredFrontal);

        const paredTrasera = crearPared(anchoPiso, alturaPared, grosorPared, 0xf5f5f5);
        paredTrasera.position.set(0, alturaPared / 2, -mitadProfundidadPiso);
        paredTrasera.name = 'pared_trasera';
        escena.add(paredTrasera);

        const paredIzquierda = crearParedSegmentadaIzquierda(alturaPared, grosorPared);
        escena.add(paredIzquierda);

        const paredDerecha = crearPared(profundidadPiso, alturaPared, grosorPared, 0xf5f5f5);
        paredDerecha.rotation.y = -Math.PI / 2;
        paredDerecha.position.set(mitadAnchoPiso, alturaPared / 2, 0);
        paredDerecha.name = 'pared_derecha';
        escena.add(paredDerecha);

        const techo = new THREE.Mesh(
            new THREE.PlaneGeometry(anchoPiso + 2, profundidadPiso + 2),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        techo.rotation.x = Math.PI / 2;
        techo.position.y = alturaPared;
        techo.name = 'techo';
        escena.add(techo);

        // Luces pequeñas en techo
        const intensidadFalsa = 0.6;
        const distanciaFalsa = 4;
        const decaimientoFalso = 2;
        const colorFalso = 0xffffff;

        const posiciones = [
            [ anchoPiso / 3, alturaPared - 0.1, profundidadPiso / 3],
            [-anchoPiso / 3, alturaPared - 0.1, profundidadPiso / 3],
            [ anchoPiso / 3, alturaPared - 0.1, -profundidadPiso / 3],
            [-anchoPiso / 3, alturaPared - 0.1, -profundidadPiso / 3],
        ];

        posiciones.forEach(pos => {
            const luzPuntual = new THREE.PointLight(colorFalso, intensidadFalsa, distanciaFalsa, decaimientoFalso);
            luzPuntual.position.set(pos[0], pos[1], pos[2]);
            escena.add(luzPuntual);
        });
    };

    const limpiarObjetos = (nombrePrefijo) => {
        const objetosParaEliminar = escenaRef.current.children.filter(obj => obj.name.startsWith(nombrePrefijo));
        objetosParaEliminar.forEach(obj => {
            escenaRef.current.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    };

    const cargarModelo = (ruta, multiplicar = false) => {
        const cargador = new GLTFLoader();
        cargador.load(ruta, (gltf) => {
            const modeloBase = gltf.scene;
            modeloBase.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

             if (multiplicar) {
            // 🔹 Para las baldosas, SÍ limpiamos las anteriores
            limpiarObjetos('modelo_tile_');

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
            const offsetZ = (profundidadPiso - numModelosZ * tamañoEscalado.z) / 2;

            for (let i = 0; i < numModelosX; i++) {
                for (let j = 0; j < numModelosZ; j++) {
                    const modeloInstancia = modeloBase.clone();
                    const x = -mitadAnchoPiso + offsetX + (i * tamañoEscalado.x) + (tamañoEscalado.x / 2);
                    const z = -mitadProfundidadPiso + offsetZ + (j * tamañoEscalado.z) + (tamañoEscalado.z / 2);
                    modeloInstancia.position.set(x, tamañoEscalado.y / 2, z);
                    modeloInstancia.name = `modelo_tile_${i}_${j}_${Date.now()}`;
                    escenaRef.current.add(modeloInstancia);
                }
            }
        } else {
            // 🔹 Para los objetos de menú, NO limpiamos los anteriores
            modeloBase.name = `modelo_objeto_${Date.now()}`;
            modeloBase.position.y = 0; // Que se apoyen en el piso
            escenaRef.current.add(modeloBase);
        }
        });
    };

    const alPointerDown = (evento) => {
        raton.current.x = (evento.clientX / window.innerWidth) * 2 - 1;
        raton.current.y = -(evento.clientY / window.innerHeight) * 2 + 1;
    
        lanzadorRayos.current.setFromCamera(raton.current, camaraRef.current);
    
        const intersecciones = lanzadorRayos.current.intersectObjects(escenaRef.current.children, true);
        
        // Deselecciona el objeto anterior si existe
        if (objetoSeleccionadoRef.current) {
            objetoSeleccionadoRef.current.traverse((child) => {
                if (child.isMesh && child.colorOriginal) {
                    child.material.color.set(child.colorOriginal);
                }
            });
            objetoSeleccionadoRef.current = null;
        }

        // Si hay intersecciones, verifica si es un objeto arrastrable
        if (intersecciones.length > 0) {
            const obj = intersecciones[0].object;

            let parent = obj;
            while (parent && !parent.name.startsWith('modelo_objeto_') && parent.parent) {
                parent = parent.parent;
            }

            if (parent && parent.name.startsWith('modelo_objeto_')) {
                objetoSeleccionadoRef.current = parent;
                objetoArrastrableRef.current = parent;

                // Calcula el offset para un arrastre fluido
                const interseccion = lanzadorRayos.current.ray.intersectPlane(planoPiso.current, new THREE.Vector3());
                if (interseccion) {
                    offset.current.copy(interseccion).sub(objetoArrastrableRef.current.position);
                }

                // Deshabilita los controles de órbita
                controlesRef.current.enabled = false;

                // Resalta el objeto
                objetoArrastrableRef.current.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.colorOriginal = child.material.color.getHex();
                        child.material.color.set(0xffcc80);
                    }
                });
            } else {
                // Si se hizo clic en un objeto del entorno (pared, piso, etc.), solo seleccionarlo
                let parent = obj;
                while (parent && !['pared_trasera', 'pared_frontal', 'pared_izquierda_inferior', 'pared_izquierda_media', 'pared_izquierda_superior', 'pared_derecha', 'piso', 'techo'].includes(parent.name) && parent.parent) {
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
        const interseccion = lanzadorRayos.current.ray.intersectPlane(planoPiso.current, new THREE.Vector3());

        if (interseccion) {
            objetoArrastrableRef.current.position.x = interseccion.x - offset.current.x;
            objetoArrastrableRef.current.position.z = interseccion.z - offset.current.z;
        }
    };

    const alPointerUp = () => {
        // Habilita los controles de órbita
        controlesRef.current.enabled = true;
        // Reinicia la referencia del objeto arrastrable
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
        });
    };

     //Rotación con mouse derecho ---
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


    const handleGoToPerfil = () => {
        navigate('/perfil');
    };

    const handleGoToProyectos = () => {
        navigate('/proyectos');
    };

    

    useEffect(() => {
        iniciar();
        animar();
        const domElement = renderizadorRef.current.domElement;
        domElement.addEventListener('pointerdown', alPointerDown);
        domElement.addEventListener('pointermove', alPointerMove);
        domElement.addEventListener('pointerup', alPointerUp);
        window.addEventListener('resize', alRedimensionar);

        return () => {
            window.removeEventListener('resize', alRedimensionar);
            if (renderizadorRef.current) {
                domElement.removeEventListener('pointerdown', alPointerDown);
                domElement.removeEventListener('pointermove', alPointerMove);
                domElement.removeEventListener('pointerup', alPointerUp);
                domElement.remove();
                renderizadorRef.current.dispose();
            }
        };
    }, []);

    useEffect(() => {
        const escena = escenaRef.current;
        if (escena) {
            const ambiental = escena.getObjectByName('luzAmbiental');
            if (ambiental) ambiental.intensity = intensidadAmbiental;
            const direccional = escena.getObjectByName('luzDireccional');
            if (direccional) {
                direccional.intensity = intensidadDireccional;
                direccional.color.set(colorDireccional);
            }
        }
    }, [intensidadAmbiental, intensidadDireccional, colorDireccional]);

    return (
    <div className="simulator-container">
        <div ref={contenedorRef}></div>
        <div className="sidebar-container">
            {/* Barra lateral de íconos */}
            <div className="sidebar-icon-bar">
                 <button
      onClick={() => navigate("/Dashboard")}
      className="bg-transparent border-none p-0 cursor-pointer"
    >
      <img src={logo} alt="Logo" className="logo-img" />
    </button>
                <button
                    title="Perfil"
                    className={`icon-item ${menuAbierto === 'perfil' ? 'active' : ''}`}
                    onClick={() => {
                        setMenuAbierto(menuAbierto === 'perfil' ? null : 'perfil');
                        setCategoriaMaterialesAbierta(null);
                        setCategoriaObjetosAbierta(null);
                        setCategoriaTexturasAbierta(null);
                    }}
                >
                    <FaUserCircle />
                </button>
                <button
                    title="Materiales"
                    className={`icon-item ${menuAbierto === 'materiales' ? 'active' : ''}`}
                    onClick={() => {
                        setMenuAbierto(menuAbierto === 'materiales' ? null : 'materiales');
                        setCategoriaObjetosAbierta(null);
                        setCategoriaTexturasAbierta(null);
                    }}
                >
                    <FaPalette />
                </button>
                <button
                    title="Objetos"
                    className={`icon-item ${menuAbierto === 'objetos' ? 'active' : ''}`}
                    onClick={() => {
                        setMenuAbierto(menuAbierto === 'objetos' ? null : 'objetos');
                        setCategoriaMaterialesAbierta(null);
                        setCategoriaTexturasAbierta(null);
                    }}
                >
                    <FaCube />
                </button>
                <button
                    title="Texturas"
                    className={`icon-item ${menuAbierto === 'texturas' ? 'active' : ''}`}
                    onClick={() => {
                        setMenuAbierto(menuAbierto === 'texturas' ? null : 'texturas');
                        setCategoriaMaterialesAbierta(null);
                        setCategoriaObjetosAbierta(null);
                    }}
                >
                    <GiStoneWall />
                </button>
                <button
                    title="Iluminación"
                    className={`icon-item ${menuAbierto === 'iluminacion' ? 'active' : ''}`}
                    onClick={() => {
                        setMenuAbierto(menuAbierto === 'iluminacion' ? null : 'iluminacion');
                        setCategoriaMaterialesAbierta(null);
                        setCategoriaObjetosAbierta(null);
                        setCategoriaTexturasAbierta(null);
                    }}
                >
                    <FaLightbulb />
                </button>
                <button className="icon-item">
                    <FaSave />
                </button>
                <button className="icon-item">
                    <MdAddCircle />
                </button>
                
            </div>

            {/* Panel de contenido */}
            <div className={`sidebar-content-panel ${menuAbierto ? 'open' : ''}`}>
                {menuAbierto === 'perfil' && (
                    <div className="menu-section">
                        <h3>Mi perfil</h3>
                        <div className="profile-header">
                            <p className="profile-name">Maribel Marin Cortés</p>
                        </div>
                        <button className="category-card profile-action-card" onClick={handleGoToProyectos}>
                            <span>Mis proyectos</span>
                        </button>
                        <button className="category-card profile-action-card" onClick={handleGoToPerfil}>
                            <span>Perfil</span>
                        </button>
                        <button className="category-card profile-action-card">
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                )}

                {menuAbierto === 'materiales' && (
                    <div className="menu-section">
                        <h3>Texturas</h3>
                        {categoriaMaterialesAbierta ? (
                            <div className="submenu-details">
                                <button className="back-button" onClick={() => setCategoriaMaterialesAbierta(null)}>
                                    &larr; Volver a Texturas
                                </button>
                                <h4>{categoriaMaterialesAbierta}</h4>
                                <div className="item-grid">
                                    {materiales.find(mat => mat.nombre === categoriaMaterialesAbierta)?.subtipos.map((sub) => (
                                        <div key={sub.nombre} className="item-card material-subtype" onClick={() => aplicarTextura(sub.textura)}>
                                            <div className="item-preview" style={{ backgroundImage: `url(${sub.textura})` }} />
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
                                        <div className="category-image" style={{ backgroundImage: `url(${mat.imagenMenu})` }} />
                                        <span>{mat.nombre}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {menuAbierto === 'objetos' && (
                    <div className="menu-section">
                        <h3>Objetos</h3>
                        {categoriaObjetosAbierta ? (
                            <div className="submenu-details">
                                <button className="back-button" onClick={() => setCategoriaObjetosAbierta(null)}>
                                    &larr; Volver a Objetos
                                </button>
                                <h4>{categoriaObjetosAbierta}</h4>
                                <div className="item-grid">
                                    {objetos.find(obj => obj.nombre === categoriaObjetosAbierta)?.subtipos.map((sub) => (
                                        <div key={sub.nombre} className="item-card" onClick={() => cargarModelo(sub.modelo, false)}>
                                            <div className="item-preview" style={{ backgroundImage: `url(${sub.preview})` }} />
                                            <span>{sub.nombre}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="category-grid">
                                {objetos.map((obj) => (
                                    <button key={obj.nombre} className="category-card" onClick={() => setCategoriaObjetosAbierta(obj.nombre)}>
                                        <div className="category-image" style={{ backgroundImage: `url(${obj.imagenMenu})` }} />
                                        <span>{obj.nombre}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {menuAbierto === 'texturas' && (
                    <div className="menu-section">
                        <h3>Materiales</h3>
                        {categoriaTexturasAbierta ? (
                            <div className="submenu-details">
                                <button className="back-button" onClick={() => setCategoriaTexturasAbierta(null)}>
                                    &larr; Volver a Materiales
                                </button>
                                <h4>{categoriaTexturasAbierta}</h4>
                                <div className="item-grid">
                                    {subtipos.map((sub) => (
                                        <div key={sub.nombre} className="item-card">
                                            <span>{sub.nombre}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="category-grid">
                                {modelosTexturas.map((mod) => (
                                    <button key={mod.nombre} className="category-card" onClick={() => setCategoriaTexturasAbierta(mod.nombre)}>
                                        <div className="category-image" style={{ backgroundImage: `url(${mod.imagenMenu})` }} />
                                        <span>{mod.nombre}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {menuAbierto === 'iluminacion' && (
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
                                onChange={e => setIntensidadAmbiental(parseFloat(e.target.value))}
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
                                onChange={e => setIntensidadDireccional(parseFloat(e.target.value))}
                            />
                        </label>
                        <label>
                            Color luz:
                            <input
                                type="color"
                                value={colorDireccional}
                                onChange={e => setColorDireccional(e.target.value)}
                            />
                        </label>
                    </div>
                )}

            </div>
        </div>
    </div>
);
}

