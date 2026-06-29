import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      alert("Ingresa correo y contraseña");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password.trim(),
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("rol", response.data.rol);
      localStorage.setItem("usuarioId", response.data.usuarioId);

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          id: response.data.usuarioId,
          email: response.data.email,
          nombreCompleto: response.data.nombreCompleto,
          rol: response.data.rol,
        })
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={login}>
        <div className="login-logo">🎫</div>

        <h1>Sistema de Tickets</h1>

        <p>
          Plataforma universitaria para gestión de incidencias y requerimientos
        </p>

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

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <small className="login-footer">
          Sistema protegido con autenticación JWT
        </small>
      </form>
    </div>
  );
}