import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Tags,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ListChecks,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function Sidebar({ usuario }) {
  const [open, setOpen] = useState(false);

  const rol = (
    usuario?.rol ||
    localStorage.getItem("rol") ||
    ""
  ).toUpperCase();

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const menuAdmin = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={19} />,
    },
    {
      to: "/tickets",
      label: "Tickets",
      icon: <Ticket size={19} />,
    },
    {
      to: "/usuarios",
      label: "Usuarios",
      icon: <Users size={19} />,
    },
    {
      to: "/categorias",
      label: "Categorías",
      icon: <Tags size={19} />,
    },
    {
      to: "/reportes",
      label: "Reportes",
      icon: <BarChart3 size={19} />,
    },
    {
      to: "/perfil",
      label: "Mi Perfil",
      icon: <User size={19} />,
    },
  ];

  const menuUsuario = [
    {
      to: "/usuario/dashboard",
      label: "Inicio",
      icon: <LayoutDashboard size={19} />,
    },
    {
      to: "/usuario/crear-ticket",
      label: "Crear Ticket",
      icon: <PlusCircle size={19} />,
    },
    {
      to: "/usuario/mis-tickets",
      label: "Mis Tickets",
      icon: <ListChecks size={19} />,
    },
    {
      to: "/perfil",
      label: "Mi Perfil",
      icon: <User size={19} />,
    },
  ];

  const menuTecnico = [
    {
      to: "/tecnico/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={19} />,
    },
    {
      to: "/tecnico/tickets",
      label: "Tickets Asignados",
      icon: <Ticket size={19} />,
    },
    {
      to: "/tecnico/reportes",
      label: "Reportes",
      icon: <BarChart3 size={19} />,
    },
    {
      to: "/perfil",
      label: "Mi Perfil",
      icon: <User size={19} />,
    },
  ];

  const menu =
    rol === "USUARIO"
      ? menuUsuario
      : rol === "TECNICO"
      ? menuTecnico
      : menuAdmin;

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(true)}
      >
        <Menu size={24} />
      </button>

      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <button
          className="sidebar-close"
          onClick={() => setOpen(false)}
        >
          <X size={22} />
        </button>

        <div className="brand">
          <div className="brand-icon">🎫</div>

          <div>
            <h2>Tickets UTP</h2>
            <span>{rol || "SIN ROL"}</span>
          </div>
        </div>

        <nav className="menu">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-box">
            <div className="avatar">
              {usuario?.nombreCompleto?.charAt(0) || "U"}
            </div>

            <div>
              <strong>{usuario?.nombreCompleto || "Usuario"}</strong>
              <small>{usuario?.email || ""}</small>
            </div>
          </div>

          <button onClick={logout} className="logout-btn">
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}