import { useEffect, useState } from "react";
import { Plus, Search, X, Tags } from "lucide-react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Categorias() {
  const usuarioStorage = localStorage.getItem("usuario");

  const usuario =
    usuarioStorage && usuarioStorage !== "undefined"
      ? JSON.parse(usuarioStorage)
      : {
          email: "admin@gmail.com",
          rol: "ADMIN",
        };

  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarCategorias = async () => {
    try {
      const res = await api.get("/api/categorias");
      setCategorias(res.data || []);
    } catch (error) {
      console.error("Error cargando categorías", error);
      setCategorias([]);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const abrirDrawer = () => {
    setNombre("");
    setDrawerOpen(true);
  };

  const cerrarDrawer = () => {
    setDrawerOpen(false);
    setNombre("");
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert("Ingrese el nombre de la categoría");
      return;
    }

    try {
      setGuardando(true);

      await api.post("/api/categorias", {
        nombre: nombre.trim(),
        estado: true,
      });

      await cargarCategorias();
      cerrarDrawer();
      alert("Categoría creada correctamente");
    } catch (error) {
      console.error("Error creando categoría", error);
      alert("Error creando categoría");
    } finally {
      setGuardando(false);
    }
  };

  const categoriasFiltradas = categorias.filter((categoria) =>
    `${categoria.nombre || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <div className="main-area">
        <Topbar usuario={usuario} />

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>Categorías</h1>
              <p className="subtitle">
                Administra las categorías usadas para clasificar tickets
              </p>
            </div>

            <button className="primary-btn" onClick={abrirDrawer}>
              <Plus size={18} />
              Nueva Categoría
            </button>
          </div>

          <div className="stats-grid category-summary">
            <div className="stat-card purple">
              <div className="stat-icon">
                <Tags size={28} />
              </div>
              <div>
                <p>Total Categorías</p>
                <strong>{categorias.length}</strong>
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar categoría..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <span className="table-count">
                Total: {categoriasFiltradas.length}
              </span>
            </div>

            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {categoriasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="empty-table">
                        No hay categorías registradas.
                      </td>
                    </tr>
                  ) : (
                    categoriasFiltradas.map((categoria) => (
                      <tr key={categoria.id}>
                        <td>
                          <strong>{categoria.nombre}</strong>
                        </td>

                        <td>
                          <span className="badge state-RESUELTO">
                            {categoria.estado === false
                              ? "INACTIVA"
                              : "ACTIVA"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {drawerOpen && (
        <div className="drawer-overlay" onClick={cerrarDrawer}>
          <aside
            className="drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <h2>Nueva Categoría</h2>
                <p>Registra una categoría para tickets</p>
              </div>

              <button className="drawer-close" onClick={cerrarDrawer}>
                <X size={20} />
              </button>
            </div>

            <form className="drawer-body" onSubmit={guardarCategoria}>
              <div className="form-group">
                <label>Nombre de la categoría</label>
                <input
                  type="text"
                  placeholder="Ejemplo: Software, Hardware, Redes..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="drawer-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={cerrarDrawer}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar Categoría"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}