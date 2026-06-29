import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function UsuarioDashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = localStorage.getItem("usuarioId");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarTickets = async () => {
    try {
      if (!usuarioId) {
        setTickets([]);
        return;
      }

      const { data } = await api.get(`/api/tickets/usuario/${usuarioId}`);
      setTickets(Array.isArray(data) ? data : data.content || []);
    } catch (error) {
      console.error("Error cargando tickets del usuario:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  const total = tickets.length;

  const abiertos = tickets.filter(
    (t) => t.estado === "ABIERTO" || t.estado === "PENDIENTE"
  ).length;

  const proceso = tickets.filter(
    (t) => t.estado === "ASIGNADO" || t.estado === "EN_PROCESO"
  ).length;

  const resueltos = tickets.filter(
    (t) => t.estado === "RESUELTO" || t.estado === "CERRADO"
  ).length;

  const recientes = tickets.slice(0, 5);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Buenos días, {usuario.nombreCompleto || "Usuario"} 👋</h1>
          <p>Consulta el estado de tus tickets y solicita ayuda cuando la necesites.</p>
        </div>

        <Link className="btn-primary" to="/usuario/crear-ticket">
          + Crear ticket
        </Link>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div>
            <h2>¿Necesitas ayuda hoy?</h2>
            <p>Registra una incidencia y el equipo de soporte la atenderá.</p>
          </div>

          <Link className="btn-primary" to="/usuario/crear-ticket">
            Crear nuevo ticket
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Mis Tickets</span>
          <h2>{total}</h2>
        </div>

        <div className="stat-card">
          <span>Abiertos</span>
          <h2>{abiertos}</h2>
        </div>

        <div className="stat-card">
          <span>En proceso</span>
          <h2>{proceso}</h2>
        </div>

        <div className="stat-card">
          <span>Resueltos</span>
          <h2>{resueltos}</h2>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Mis últimos tickets</h2>
          <Link to="/usuario/mis-tickets">Ver todos</Link>
        </div>

        {loading ? (
          <p>Cargando tickets...</p>
        ) : recientes.length === 0 ? (
          <p>Aún no tienes tickets registrados.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Prioridad</th>
              </tr>
            </thead>

            <tbody>
              {recientes.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.codigo || "-"}</td>
                  <td>{ticket.titulo || "Sin título"}</td>
                  <td>{ticket.categoria?.nombre || "-"}</td>
                  <td>{ticket.estado || "-"}</td>
                  <td>{ticket.prioridad || "MEDIA"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="content-card">
        <div className="card-header">
          <div>
            <h2>Asistente inteligente</h2>
            <p>Próximamente podrás recibir sugerencias automáticas antes de crear un ticket.</p>
          </div>
        </div>
      </div>
    </div>
  );
}