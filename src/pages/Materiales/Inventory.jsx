import React, { useEffect, useRef, useState } from "react";
import { NavbarL } from "../../components/NavbarL";
import { useNavigate } from "react-router-dom";
import "./Inventory.css";


const API_BASE = (
  import.meta.env.VITE_API_BASE ||
  "https://envifo-java-backend-api-rest.onrender.com/api"
).replace(/\/+$/, "");
const PROCESS_API = "http://51.120.2.146:8000/process-material/";

export default function Inventory() {
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const rol = sessionStorage.getItem("rol") || "";
  const vistaMateriales = sessionStorage.getItem("vistaMateriales") === "true";

  if (!(rol === "GLOBAL" || vistaMateriales)) {
    return (
      <NavbarL>
        <div className="materiales-container" style={{ padding: 32 }}>
          <div className="card-denied">
            <h2>🚫 Acceso denegado</h2>
            <p>No tienes permisos para ver la sección de Materiales.</p>
            <button
              className="btn-orange"
              onClick={() => navigate("/Dashboard")}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </NavbarL>
    );
  }

  const [categorias, setCategorias] = useState([]);
  const [materiales, setMateriales] = useState([]);
     // ...
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 nuevo estado
  // ...

  // --- Lista filtrada
  const filteredMateriales = materiales.filter((m) =>
    m.nameMaterial?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [loading, setLoading] = useState(true);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    idMaterial: null,
    nameMaterial: "",
    descripcionMate: "",
    height: "",
    width: "",
    status: true,
    idCategoria: "",
    idTextura: null,
    idCliente: sessionStorage.getItem("usuario"),
  });
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);
  const token = sessionStorage.getItem("token");
  const idCliente = sessionStorage.getItem("usuario");

  // --- Nuevos estados para texturas
  const [categoriasTexturas, setCategoriasTexturas] = useState([]);
  const [texturas, setTexturas] = useState([]);
  const [selectedCategoriaTextura, setSelectedCategoriaTextura] = useState("");
  const [selectedTextura, setSelectedTextura] = useState(null);

  // --- Estado para último material actualizado/creado
  const [ultimoMaterial, setUltimoMaterial] = useState(null);
  const [loadingUltimo, setLoadingUltimo] = useState(false);
  const [procesando, setProcesando] = useState(false);

  // --- Traer categorías
  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories/customer/${idCliente}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : [];
      setCategorias(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error("Error cargando categorías:", err);
      setCategorias([]);
    }
  };

  // --- Traer materiales
  const fetchMaterialesEmpresa = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/materials/client/${idCliente}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : [];
      setMateriales(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error("Error cargando materiales:", err);
      setMateriales([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialesPorCategoria = async (nameCategory) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/materials/category/${nameCategory}/client/${idCliente}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.ok ? await res.json() : [];
      setMateriales(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error("Error filtrando materiales:", err);
      setMateriales([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Traer categorías de texturas
  const fetchCategoriasTexturas = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories/section/texturas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : [];
      setCategoriasTexturas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando categorías de texturas:", err);
      setCategoriasTexturas([]);
    }
  };

  // --- Traer texturas por categoría
  const fetchTexturasPorCategoria = async (nombreCategoria) => {
    try {
      const res = await fetch(
        `${API_BASE}/textures/category/${nombreCategoria}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.ok ? await res.json() : [];
      setTexturas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando texturas:", err);
      setTexturas([]);
    }
  };

  // --- Traer último material creado/actualizado
  const fetchUltimoMaterial = async () => {
    setLoadingUltimo(true);
    try {
      const res = await fetch(`${API_BASE}/materials/last/${idCliente}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : null;
      setUltimoMaterial(data);
    } catch (err) {
      console.error("Error cargando último material:", err);
      setUltimoMaterial(null);
    } finally {
      setLoadingUltimo(false);
    }
  };

  // --- Subir material rápido
  const subirMaterial = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubiendo(true);
      const form = new FormData();
      form.append("file", file);
      form.append("nombre", file.name);

      const resp = await fetch(`${API_BASE}/materials/client/${idCliente}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      await fetchUltimoMaterial();
      setShowForm(false);
      alert("✅ Material subido correctamente");
    } catch (err) {
      console.error("No se pudo subir el material:", err);
      alert("❌ No se pudo subir el material");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // --- Abrir panel de crear
  const openCreateForm = () => {
    setFormData({
      idMaterial: null,
      nameMaterial: "",
      descripcionMate: "",
      height: "",
      width: "",
      status: true,
      idCategoria: categorias.length > 0 ? categorias[0].idCategoria : "",
      idTextura: null,
      idCliente,
    });
    setFile(null);
    setEditMode(false);
    setSelectedTextura(null);
    setSelectedCategoriaTextura("");
    setTexturas([]);
    setPreview(null);
    setShowForm(true);
  };

  // --- Abrir panel de editar
  const openEditForm = (material) => {
    setFormData({
      idMaterial: material.idMaterial,
      nameMaterial: material.nameMaterial,
      descripcionMate: material.descripcionMate,
      height: material.height,
      width: material.width,
      status: material.status,
      idCategoria: material.idCategoria || "",
      idTextura: material.texture?.idTexture || null,
      idCliente,
    });

    setPreview(material.material?.keyR2 || null);

    if (material.texture) {
      setSelectedTextura(material.texture);
      setSelectedCategoriaTextura(material.textureCategory || "");
      if (material.textureCategory)
        fetchTexturasPorCategoria(material.textureCategory);
    } else {
      setSelectedTextura(null);
      setSelectedCategoriaTextura("");
      setTexturas([]);
    }

    setFile(null);
    setEditMode(true);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validación para creación
  if (!editMode && !file) {
    alert("⚠️ Para crear un material debes seleccionar una imagen.");
    return;
  }

  // Validación para edición
  if (editMode && !file && !preview) {
    alert(
      "⚠️ Para actualizar este material debes seleccionar una nueva imagen o mantener la actual."
    );
    return;
  }

  try {
    setProcesando(true);

    const form = new FormData();
    const payload = {
      ...formData,
      idMaterial: editMode ? formData.idMaterial : null,
      idTextura: formData.idTextura || null,
    };

    form.append("material", JSON.stringify(payload));
    if (file) form.append("imagen", file);

    const resp = await fetch(PROCESS_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Error ${resp.status}: ${errorText}`);
    }

    alert(
      editMode
        ? "✅ Material actualizado correctamente"
        : "✅ Material creado correctamente"
    );

    // 🔑 Importante: cerrar formulario y limpiar estados
    setShowForm(false);
    setPreview(null);
    setFile(null);
    setSelectedMaterial(null);
    setUltimoMaterial(null);

    // 🔄 Volver a la vista de todos los materiales
    await fetchMaterialesEmpresa();
  } catch (err) {
    console.error("Error guardando material:", err);
    alert(
      "❌ No se pudo guardar el material.\n\nRevisa lo siguiente:\n- Todos los campos estén completos.\n- Estás enviando una imagen válida.\n- El archivo no supere los 2MB."
    );
  } finally {
    setProcesando(false);
  }
};


  // --- Función de eliminar
  const eliminarMaterial = async (id) => {
    if (!window.confirm("⚠️ ¿Estás seguro de eliminar este material?")) return;

    try {
      const res = await fetch(`${API_BASE}/materials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      alert("✅ Material eliminado");
      fetchMaterialesEmpresa();
      setSelectedMaterial(null);
      setUltimoMaterial(null);
    } catch (err) {
      console.error("Error eliminando material:", err);
      alert("❌ No se pudo eliminar el material");
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchCategoriasTexturas();
    fetchMaterialesEmpresa();
  }, []);

  return (
    <NavbarL>
      <div className="materiales-container">
        <h1>
          {ultimoMaterial
            ? "Detalle del último material creado/actualizado"
            : selectedMaterial
            ? "Detalle del material"
            : "📦 Materiales de la Empresa"}
        </h1>

        {/* Animación de procesamiento */}
        {procesando && (
          <div className="processing-overlay">
            <div className="processing-card">
              <div className="spinner"></div>
              <p>⏳ Procesando material...</p>
              <small>Esto puede tardar unos segundos</small>
            </div>
          </div>
        )}

        {/* Panel de último material */}
        {ultimoMaterial && !showForm && !selectedMaterial && (
          <div className="material-detalle">
            <h2>{ultimoMaterial.nameMaterial}</h2>
            <p>
              <b>Descripción:</b> {ultimoMaterial.descripcionMate}
            </p>
            <p>
              <b>Dimensiones:</b> {ultimoMaterial.height} x{" "}
              {ultimoMaterial.width} cm
            </p>
            <p>
              <b>Estado:</b>{" "}
              {ultimoMaterial.status ? "Disponible ✅" : "No disponible ❌"}
            </p>
            <p>
              <b>Categoría:</b> {ultimoMaterial.nameCategory || "Sin categoría"}
            </p>

            {ultimoMaterial.texture && (
              <>
                <h3>
                  Textura: {ultimoMaterial.texture.nameTexture || "Sin nombre"}
                </h3>
                <p>{ultimoMaterial.texture.description || "Sin descripción"}</p>
                {ultimoMaterial.texture.image?.keyR2 && (
                  <img
                    src={ultimoMaterial.texture.image.keyR2}
                    alt={ultimoMaterial.texture.image.nameFile || "Textura"}
                    className="detalle-imagen round"
                  />
                )}
              </>
            )}

            <h3>Imagen del material</h3>
            {ultimoMaterial.material?.keyR2 ? (
              <img
                src={ultimoMaterial.material.keyR2}
                alt={ultimoMaterial.material.nameFile || "Imagen material"}
                className="detalle-imagen round"
              />
            ) : (
              <p>No hay imagen disponible</p>
            )}

            <div className="detalle-actions">
              <button
                className="btn-orange"
                onClick={() => {
                  setUltimoMaterial(null);
                  fetchMaterialesEmpresa();
                }}
              >
                Volver
              </button>
              <button
                className="btn-edit"
                onClick={() => openEditForm(ultimoMaterial)}
              >
                Editar
              </button>
              <button
                className="btn-delete"
                onClick={() => eliminarMaterial(ultimoMaterial.idMaterial)}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}

        {/* Formulario de crear/editar */}
        {showForm && (
          <div className="panel-form">
            <h2>{editMode ? "Editar Material" : "Nuevo Material"}</h2>

            {/* Aviso sobre el backend */}
            <div className="backend-notice">
              <p>
                ⚠️ <strong>Nota:</strong> El procesamiento puede tardar unos
                segundos debido al servidor backend.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="nameMaterial">Nombre del material</label>
              <input
                id="nameMaterial"
                type="text"
                name="nameMaterial"
                value={formData.nameMaterial}
                onChange={handleChange}
                placeholder="Nombre del material"
                required
              />

              <label htmlFor="descripcionMate">Descripción</label>
              <textarea
                id="descripcionMate"
                name="descripcionMate"
                value={formData.descripcionMate}
                onChange={handleChange}
                placeholder="Descripción del material"
              />

              <label htmlFor="height">Alto (cm)</label>
              <input
                id="height"
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="Alto en centímetros"
              />

              <label htmlFor="width">Ancho (cm)</label>
              <input
                id="width"
                type="number"
                name="width"
                value={formData.width}
                onChange={handleChange}
                placeholder="Ancho en centímetros"
              />

              <label>
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                />
                Disponible (marcar si el material está disponible)
              </label>

              <label htmlFor="idCategoria">Categoría</label>
              <select
                id="idCategoria"
                name="idCategoria"
                value={formData.idCategoria}
                onChange={handleChange}
              >
                {categorias.map((c) => (
                  <option key={c.idCategoria} value={c.idCategoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              {/* Selector de texturas */}
              <label htmlFor="categoriaTextura">Categoría de textura</label>
              <select
                id="categoriaTextura"
                value={selectedCategoriaTextura}
                onChange={(e) => {
                  const categoria = e.target.value;
                  setSelectedCategoriaTextura(categoria);
                  fetchTexturasPorCategoria(categoria);
                  setSelectedTextura(null);
                  setFormData((prev) => ({ ...prev, idTextura: null }));
                }}
              >
                <option value="">Selecciona una categoría</option>
                {categoriasTexturas.map((cat) => (
                  <option key={cat.idCategoria} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>

              {texturas.length > 0 && (
                <div className="texturas-grid">
                  {texturas.map((t) => (
                    <div
                      key={t.idTexture}
                      className={`textura-card ${
                        selectedTextura?.idTexture === t.idTexture
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedTextura(t);
                        setFormData((prev) => ({
                          ...prev,
                          idTextura: t.idTexture,
                        }));
                      }}
                    >
                      <img
                        src={t.image?.keyR2 || ""}
                        alt={t.nameTexture}
                        className="textura-image round"
                      />
                      <div className="textura-info">
                        <p className="textura-name">{t.nameTexture}</p>
                        <p className="textura-desc">
                          {t.description || "Sin descripción"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label htmlFor="file">Subir imagen</label>
              <input
                id="file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  setFile(selectedFile);
                  if (selectedFile) {
                    const reader = new FileReader();
                    reader.onloadend = () => setPreview(reader.result);
                    reader.readAsDataURL(selectedFile);
                  }
                }}
              />

              {preview && (
                <div className="preview-container">
                  <p>Vista previa:</p>
                  <img
                    src={preview}
                    alt="Previsualización del material"
                    className="preview-image round"
                  />
                </div>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-orange"
                  disabled={procesando}
                >
                  {procesando
                    ? "Procesando..."
                    : editMode
                    ? "Actualizar"
                    : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={procesando}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Panel de detalle individual */}
        {selectedMaterial && !showForm && (
          <div className="material-detalle">
            <h2>{selectedMaterial.nameMaterial}</h2>
            <p>
              <b>Descripción:</b> {selectedMaterial.descripcionMate}
            </p>
            <p>
              <b>Dimensiones:</b> {selectedMaterial.height} x{" "}
              {selectedMaterial.width} cm
            </p>
            <p>
              <b>Estado:</b>{" "}
              {selectedMaterial.status ? "Disponible ✅" : "No disponible ❌"}
            </p>
            <p>
              <b>Categoría:</b>{" "}
              {selectedMaterial.nameCategory || "Sin categoría"}
            </p>

            {selectedMaterial.texture && (
              <>
                <h3>
                  Textura:{" "}
                  {selectedMaterial.texture.nameTexture || "Sin nombre"}
                </h3>
                <p>
                  {selectedMaterial.texture.description || "Sin descripción"}
                </p>
                {selectedMaterial.texture.image?.keyR2 && (
                  <img
                    src={selectedMaterial.texture.image.keyR2}
                    alt={selectedMaterial.texture.image.nameFile || "Textura"}
                    className="detalle-imagen round"
                  />
                )}
              </>
            )}

            <h3>Imagen del material</h3>
            {selectedMaterial.material?.keyR2 ? (
              <img
                src={selectedMaterial.material.keyR2}
                alt={selectedMaterial.material.nameFile || "Imagen material"}
                className="detalle-imagen round"
              />
            ) : (
              <p>No hay imagen disponible</p>
            )}

            <div className="detalle-actions">
              <button
                className="btn-orange"
                onClick={() => setSelectedMaterial(null)}
              >
                Volver
              </button>
              <button
                className="btn-edit"
                onClick={() => openEditForm(selectedMaterial)}
              >
                Editar
              </button>
              <button
                className="btn-delete"
                onClick={() => eliminarMaterial(selectedMaterial.idMaterial)}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}

        {/* Lista de materiales */}
        {!showForm && !selectedMaterial && !ultimoMaterial && (
          <>
            <div className="categorias-filtro">
              <button
                className={!selectedCategoria ? "tab active" : "tab"}
                onClick={() => {
                  setSelectedCategoria(null);
                  fetchMaterialesEmpresa();
                  setSearchTerm(""); // reset buscador
                }}
              >
                Todas
              </button>
              {categorias.map((cat) => {
                const name = cat?.nombre || cat?.name || "Sin nombre";
                return (
                  <button
                    key={cat.idCategoria || cat.id}
                    className={
                      selectedCategoria === name ? "tab active" : "tab"
                    }
                    onClick={() => {
                      setSelectedCategoria(name);
                      fetchMaterialesPorCategoria(name);
                      setSearchTerm(""); // reset buscador
                    }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>

            {/*  Input de búsqueda */}
            <div className="buscador-materiales">
              <input
                type="text"
                placeholder="Buscar materiales por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="subir-material">
              <button className="btn-upload" onClick={openCreateForm}>
                Nuevo material
              </button>
              <button
                className="btn-ver-ultimo"
                onClick={fetchUltimoMaterial}
                disabled={loadingUltimo}
              >
                {loadingUltimo ? "Cargando..." : " Ver último material"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={subirMaterial}
                className="hidden-input"
              />
            </div>

            {loading ? (
              <p>Cargando materiales...</p>
            ) : filteredMateriales.length > 0 ? ( //  usamos la lista filtrada
              <div className="materiales-grid">
                {filteredMateriales.map((m) => (
                  <div key={m.idMaterial} className="material-card">
                    <img
                      src={m.material?.keyR2 || ""}
                      alt={m.nameMaterial}
                      className="material-image round"
                    />
                    <div className="material-body">
                      <p>{m.nameMaterial}</p>
                      <button
                        className="btn-fancy"
                        onClick={() => setSelectedMaterial(m)}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay materiales que coincidan con la búsqueda.</p>
            )}
          </>
        )}
      </div>
    </NavbarL>
  );
}