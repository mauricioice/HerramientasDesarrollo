import { useEffect, useState } from "react";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Tags,
} from "lucide-react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import PanelCard from "../components/PanelCard";

export default function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [dashboard, setDashboard] = useState({
    totalTickets: 0,
    abiertos: 0,
    asignados: 0,
    enProceso: 0,
    resueltos: 0,
    cerrados: 0,
  });

  const [tickets, setTickets] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const cargarDatos = async () => {
    try {
      const [dashboardRes, ticketsRes, usuariosRes, categoriasRes] =
        await Promise.all([
          api.get("/api/dashboard"),
          api.get("/api/tickets"),
          api.get("/usuarios"),
          api.get("/api/categorias"),
        ]);

      setDashboard(dashboardRes.data || {});
      setTickets(ticketsRes.data || []);
      setUsuarios(usuariosRes.data || []);
      setCategorias(categoriasRes.data || []);
    } catch (error) {
      console.error("Error cargando dashboard", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const ticketsRecientes = [...tickets]
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    .slice(0, 3);

  const categoriasConConteo = categorias
    .map((categoria) => ({
      ...categoria,
      total: tickets.filter((t) => t.categoria?.id === categoria.id).length,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const tecnicosConConteo = usuarios
    .filter((u) => u.rol?.nombre === "TECNICO")
    .map((tecnico) => ({
      ...tecnico,
      total: tickets.filter((t) => t.tecnico?.id === tecnico.id).length,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <div className="main-area">
        <Topbar usuario={usuario} />

        <main className="dashboard-content">
          <h1>Buenos días, {usuario.nombreCompleto || usuario.email} 👋</h1>
          <p className="subtitle">Resumen general del sistema de tickets</p>

          <div className="stats-grid">
            <StatCard icon={<Ticket size={28} />} title="Total Tickets" value={dashboard.totalTickets || 0} tone="purple" />
            <StatCard icon={<AlertCircle size={28} />} title="Abiertos" value={dashboard.abiertos || 0} tone="orange" />
            <StatCard icon={<Clock size={28} />} title="En Proceso" value={dashboard.enProceso || 0} tone="cyan" />
            <StatCard icon={<CheckCircle size={28} />} title="Resueltos" value={dashboard.resueltos || 0} tone="green" />
          </div>

          <div className="panels-grid">
            <PanelCard title="Tickets recientes" icon="🕒">
              {ticketsRecientes.length === 0 ? (
                <p className="empty-text">No hay tickets registrados.</p>
              ) : (
                ticketsRecientes.map((ticket) => (
                  <div className="list-row" key={ticket.id}>
                    <span>{ticket.titulo}</span>
                    <b>{ticket.estado}</b>
                  </div>
                ))
              )}
            </PanelCard>

            <PanelCard title="Categorías más usadas" icon="🏷️">
              {categoriasConConteo.length === 0 ? (
                <p className="empty-text">No hay categorías registradas.</p>
              ) : (
                categoriasConConteo.map((categoria) => (
                  <div className="list-row" key={categoria.id}>
                    <span>{categoria.nombre}</span>
                    <b>{categoria.total} TICKETS</b>
                  </div>
                ))
              )}
            </PanelCard>

            <PanelCard title="Técnicos con más tickets" icon="👨‍💻">
              {tecnicosConConteo.length === 0 ? (
                <p className="empty-text">No hay técnicos con tickets.</p>
              ) : (
                tecnicosConConteo.map((tecnico) => (
                  <div className="list-row" key={tecnico.id}>
                    <span>{tecnico.nombreCompleto}</span>
                    <b>{tecnico.total} TICKETS</b>
                  </div>
                ))
              )}
            </PanelCard>
          </div>

          <div className="section-title">
            <Tags size={18} />
            ESTADO GENERAL DE TICKETS
          </div>

          <div className="mini-grid">
            <div className="mini-card">
              <span>Abiertos</span>
              <strong>{dashboard.abiertos || 0}</strong>
            </div>

            <div className="mini-card">
              <span>Asignados</span>
              <strong>{dashboard.asignados || 0}</strong>
            </div>

            <div className="mini-card">
              <span>En Proceso</span>
              <strong>{dashboard.enProceso || 0}</strong>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}