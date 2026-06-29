import { useState } from "react";
import api from "../api/axios";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const login = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password.trim(),
      });

      console.log("Respuesta Login:", data);

      const token =
        data.token ||
        data.accessToken ||
        data.jwt;

      const rol = (data.rol || data.role || "")
        .trim()
        .toUpperCase();

      const usuarioId =
        data.usuarioId ||
        data.id ||
        "";

      if (!token) {
        alert("El backend no está enviando el token.");
        return;
      }

      if (!rol) {
        alert("El backend no está enviando el rol del usuario.");
        return;
      }

      localStorage.clear();

      localStorage.setItem("token", token);
      localStorage.setItem("rol", rol);
      localStorage.setItem("usuarioId", usuarioId);

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          id: usuarioId,
          email: data.email || form.email,
          nombreCompleto:
            data.nombreCompleto ||
            data.nombre ||
            "",
          rol,
        })
      );

      switch (rol) {
        case "ADMIN":
          window.location.replace("/admin/dashboard");
          break;

        case "TECNICO":
          window.location.replace("/tecnico/dashboard");
          break;

        case "USUARIO":
          window.location.replace("/usuario/dashboard");
          break;

        default:
          alert("Rol no reconocido: " + rol);
          localStorage.clear();
      }

    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(
          error.response.data?.message ||
          "Credenciales incorrectas."
        );
      } else {
        alert("No se pudo conectar con el servidor.");
      }
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={login}>

        <h1>Sistema de Tickets</h1>
        <p>Gestión de incidencias universitarias</p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
          required
        />

        <button type="submit">
          Ingresar
        </button>

      </form>
    </div>
  );
}