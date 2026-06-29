import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function CrearTicket() {
  const navigate = useNavigate();

  const usuarioStorage = localStorage.getItem("usuario");

  const usuario =
    usuarioStorage &&
    usuarioStorage !== "undefined"
      ? JSON.parse(usuarioStorage)
      : null;

  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "MEDIA",
    categoriaId: "",
    fechaLimite: "",
    tiempoEstimadoHoras: "",
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const res = await api.get("/api/categorias");
      setCategorias(res.data || []);
    } catch (error) {
      console.error("Error cargando categorías", error);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!form.titulo.trim()) {
      alert("Ingrese el título");
      return;
    }

    if (!form.descripcion.trim()) {
      alert("Ingrese la descripción");
      return;
    }

    if (!form.categoriaId) {
      alert("Seleccione una categoría");
      return;
    }

    const usuarioId =
      usuario?.id ||
      localStorage.getItem("usuarioId");

    if (!usuarioId) {
      alert(
        "No se encontró el usuario logueado. Cierre sesión e ingrese nuevamente."
      );
      return;
    }

    try {
      await api.post(
        `/api/tickets?usuarioId=${usuarioId}`,
        {
          titulo: form.titulo,
          descripcion: form.descripcion,
          prioridad: form.prioridad,
          categoriaId: form.categoriaId,
          fechaLimite: form.fechaLimite
            ? `${form.fechaLimite}T23:59:00`
            : null,
          tiempoEstimadoHoras: form.tiempoEstimadoHoras
            ? Number(form.tiempoEstimadoHoras)
            : null,
        }
      );

      alert("Ticket creado correctamente");

      navigate("/tickets");
    } catch (error) {
      console.error("Error al crear ticket", error);

      if (error.response) {
        console.log(error.response.data);
      }

      alert("Error al crear ticket");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <div className="main-area">
        <Topbar usuario={usuario} />

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>Nuevo Ticket</h1>

              <p className="subtitle">
                Registrar incidencia o requerimiento
              </p>
            </div>
          </div>

          <form
            className="form-card"
            onSubmit={guardar}
          >
            <div className="form-group">
              <label>Título</label>

              <input
                type="text"
                placeholder="Ej. Error al iniciar sesión"
                value={form.titulo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    titulo: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>

              <textarea
                rows="5"
                placeholder="Detalle del problema o requerimiento"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({
                    ...form,
                    descripcion: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Prioridad</label>

                <select
                  value={form.prioridad}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      prioridad: e.target.value,
                    })
                  }
                >
                  <option value="BAJA">
                    BAJA
                  </option>

                  <option value="MEDIA">
                    MEDIA
                  </option>

                  <option value="ALTA">
                    ALTA
                  </option>

                  <option value="CRITICA">
                    CRÍTICA
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Categoría</label>

                <select
                  value={form.categoriaId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoriaId: e.target.value,
                    })
                  }
                >
                  <option value="">
                    Seleccione una categoría
                  </option>

                  {categorias.map((categoria) => (
                    <option
                      key={categoria.id}
                      value={categoria.id}
                    >
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha límite</label>

                <input
                  type="date"
                  value={form.fechaLimite}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fechaLimite: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Tiempo estimado (horas)
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.tiempoEstimadoHoras}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tiempoEstimadoHoras:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() =>
                  navigate("/tickets")
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="primary-btn"
              >
                Guardar Ticket
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}