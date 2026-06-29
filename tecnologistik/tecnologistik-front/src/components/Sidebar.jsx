import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const rol = localStorage.getItem('rol')?.toUpperCase();

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const menuAdmin = [
    { nombre: 'Usuarios', ruta: '/admin/usuarios' },
    { nombre: 'Cuentas', ruta: '/admin/cuentas' },
    { nombre: 'Transacciones', ruta: '/transacciones' },
  ];

  const menuEmpleado = [
    { nombre: 'Dashboard', ruta: '/empleado/dashboard' },
    { nombre: 'Mis Solicitudes', ruta: '/transacciones' },
  ];

  const menu = rol === 'ADMIN' ? menuAdmin : menuEmpleado;

  return (
    <aside className="w-72 min-h-screen bg-[#020617] border-r border-white/10 flex flex-col justify-between p-6 relative overflow-hidden">

      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">

        <div className="mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 mb-5">
            <span className="text-2xl font-black text-white">T</span>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight">
            TecnoLogistik
          </h1>

          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            {rol === 'ADMIN'
              ? 'Panel Administrativo'
              : 'Panel de Empleado'}
          </p>
        </div>

        <nav className="space-y-3">
          {menu.map((item) => {
            const active = location.pathname === item.ruta;

            return (
              <Link
                key={item.ruta}
                to={item.ruta}
                className={`
                  flex items-center gap-3 px-5 py-4 rounded-2xl
                  transition-all duration-300 font-semibold border
                  ${active
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400/30 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 border-white/5 bg-white/[0.03] hover:bg-white/10 hover:text-white hover:border-white/10'}
                `}
              >
                <span>{item.nombre}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={logout}
        className="
          relative z-10 w-full py-4 rounded-2xl
          bg-white/5 hover:bg-red-500/90
          border border-white/10 hover:border-red-400/30
          transition-all duration-300
          text-white font-bold shadow-lg
        "
      >
        Cerrar sesión
      </button>

    </aside>
  );
}