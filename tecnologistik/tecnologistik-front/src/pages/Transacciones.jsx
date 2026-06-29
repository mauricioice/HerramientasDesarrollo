import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function Transacciones() {
  const fechaActual = new Date().toISOString().split('T')[0];

  const rol = localStorage.getItem('rol')?.toUpperCase();
  const esAdmin = rol === 'ADMIN';
  const emailUsuario = localStorage.getItem('email');

  const [transacciones, setTransacciones] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [resumen, setResumen] = useState({
    ingresos: 0,
    gastos: 0,
    saldoNeto: 0
  });

  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  const [form, setForm] = useState({
    tipo: 'INGRESO',
    monto: '',
    descripcion: '',
    categoria: '',
    fecha: fechaActual,
    cuentaId: ''
  });

  const formatoMoneda = (valor) => {
    return Number(valor || 0).toLocaleString('es-PE', {
      minimumFractionDigits: 2
    });
  };

  const obtenerSolicitante = (item) => {
    return (
      item.usuario?.nombreCompleto ||
      item.usuario?.email ||
      item.emailUsuario ||
      item.usuarioEmail ||
      'Sin usuario'
    );
  };

  const obtenerEmailSolicitante = (item) => {
    return (
      item.usuario?.email ||
      item.emailUsuario ||
      item.usuarioEmail ||
      ''
    );
  };

  const claseEstado = (estado) => {
    if (estado === 'APROBADO') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }

    if (estado === 'RECHAZADO') {
      return 'bg-red-50 text-red-700 border-red-100';
    }

    return 'bg-amber-50 text-amber-700 border-amber-100';
  };

  const iconoEstado = (estado) => {
    if (estado === 'APROBADO') return '✅';
    if (estado === 'RECHAZADO') return '❌';
    return '⏳';
  };

  const limpiarFormulario = () => {
    setEditando(null);

    setForm({
      tipo: 'INGRESO',
      monto: '',
      descripcion: '',
      categoria: '',
      fecha: fechaActual,
      cuentaId: ''
    });
  };

  const abrirCrear = () => {
    limpiarFormulario();
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    limpiarFormulario();
    setModalAbierto(false);
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const transaccionesRes = await api.get('/transacciones');
      const cuentasRes = await api.get('/cuentas');
      const resumenRes = await api.get('/transacciones/resumen');

      setTransacciones(transaccionesRes.data || []);
      setCuentas(cuentasRes.data || []);
      setResumen(resumenRes.data || {
        ingresos: 0,
        gastos: 0,
        saldoNeto: 0
      });

    } catch (error) {
      console.error(error);
      alert('Error cargando transacciones');
    } finally {
      setLoading(false);
    }
  };

  const guardarTransaccion = async (e) => {
    e.preventDefault();

    try {
      const data = {
        tipo: form.tipo,
        monto: Number(form.monto),
        descripcion: form.descripcion,
        categoria: form.categoria,
        fecha: form.fecha,
        cuentaId: form.cuentaId,
        estado: esAdmin ? 'APROBADO' : 'PENDIENTE',
        emailUsuario: emailUsuario
      };

      if (editando) {
        await api.put(`/transacciones/${editando}`, data);
        alert(esAdmin ? 'Movimiento actualizado correctamente' : 'Solicitud actualizada correctamente');
      } else {
        await api.post('/transacciones', data);
        alert(esAdmin ? 'Movimiento registrado correctamente' : 'Solicitud enviada correctamente');
      }

      cerrarModal();
      cargarDatos();

    } catch (error) {
      console.error(error);
      alert('Error guardando el registro');
    }
  };

  const editarTransaccion = (transaccion) => {
    setEditando(transaccion.id);

    setForm({
      tipo: transaccion.tipo,
      monto: transaccion.monto,
      descripcion: transaccion.descripcion,
      categoria: transaccion.categoria,
      fecha: transaccion.fecha,
      cuentaId: transaccion.cuenta?.id || ''
    });

    setModalAbierto(true);
  };

  const eliminarTransaccion = async (id) => {
    const confirmar = confirm('¿Deseas eliminar este movimiento?');

    if (!confirmar) return;

    try {
      await api.delete(`/transacciones/${id}`);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error eliminando movimiento');
    }
  };

  const aprobarTransaccion = async (id) => {
    try {
      await api.patch(`/transacciones/${id}/aprobar`);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error aprobando transacción');
    }
  };

  const rechazarTransaccion = async (id) => {
    try {
      await api.patch(`/transacciones/${id}/rechazar`);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error rechazando transacción');
    }
  };

  const transaccionesPorRol = esAdmin
    ? transacciones
    : transacciones.filter((item) => obtenerEmailSolicitante(item) === emailUsuario);

  const transaccionesFiltradas = transaccionesPorRol.filter((item) => {
    const texto = busqueda.toLowerCase();

    return (
      item.descripcion?.toLowerCase().includes(texto) ||
      item.categoria?.toLowerCase().includes(texto) ||
      item.tipo?.toLowerCase().includes(texto) ||
      item.estado?.toLowerCase().includes(texto) ||
      item.cuenta?.nombre?.toLowerCase().includes(texto) ||
      obtenerSolicitante(item).toLowerCase().includes(texto)
    );
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex">
      <Sidebar />

      <main className="flex-1 p-10 overflow-hidden">

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-10">
          <div>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-bold mb-5 shadow-sm">
              {esAdmin ? 'Gestión Financiera' : 'Gestión de Solicitudes'}
            </span>

            <h2 className="text-5xl font-black text-slate-900 mb-3">
              Transacciones
            </h2>

            <p className="text-slate-500 text-lg">
              {esAdmin
                ? 'Administra movimientos financieros, solicitudes y aprobaciones.'
                : 'Envía solicitudes de ingresos o gastos para revisión administrativa.'}
            </p>
          </div>

          <button
            type="button"
            onClick={abrirCrear}
            className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-300 transition-all duration-300"
          >
            <span>{esAdmin ? '💼' : '📨'}</span>
            {esAdmin ? 'Nuevo movimiento' : 'Nueva solicitud'}
          </button>
        </div>

        {esAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Ingresos aprobados</p>
              <h2 className="text-3xl font-black text-emerald-600">
                S/. {formatoMoneda(resumen.ingresos)}
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Gastos aprobados</p>
              <h2 className="text-3xl font-black text-red-600">
                S/. {formatoMoneda(resumen.gastos)}
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Saldo Neto</p>
              <h2 className="text-3xl font-black text-slate-900">
                S/. {formatoMoneda(resumen.saldoNeto)}
              </h2>
            </div>
          </div>
        )}

        <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
            <div>
              <h3 className="text-3xl font-black text-slate-900">
                {esAdmin ? 'Historial financiero' : 'Mis solicitudes'}
              </h3>

              <p className="text-slate-500 mt-2">
                {esAdmin
                  ? 'Consulta quién registró cada movimiento y gestiona aprobaciones.'
                  : 'Consulta el estado de tus solicitudes enviadas.'}
              </p>
            </div>

            <input
              placeholder={esAdmin ? 'Buscar movimiento o solicitante...' : 'Buscar solicitud...'}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full md:w-96 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500 font-semibold">
              Cargando transacciones...
            </div>
          ) : transaccionesFiltradas.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-16 text-center">
              <h3 className="text-2xl font-black text-slate-800">
                No hay registros
              </h3>

              <p className="text-slate-500 mt-3">
                {esAdmin
                  ? 'Registra un movimiento o espera solicitudes de empleados.'
                  : 'Envía una solicitud para verla aquí.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-100">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr className="text-left border-b border-slate-200">
                    {esAdmin && (
                      <th className="py-4 px-4 text-sm text-slate-500">
                        Solicitante
                      </th>
                    )}
                    <th className="py-4 px-4 text-sm text-slate-500">Tipo</th>
                    <th className="py-4 px-4 text-sm text-slate-500">Descripción</th>
                    <th className="py-4 px-4 text-sm text-slate-500">Categoría</th>
                    <th className="py-4 px-4 text-sm text-slate-500">Cuenta</th>
                    <th className="py-4 px-4 text-sm text-slate-500">Fecha</th>
                    <th className="py-4 px-4 text-sm text-slate-500">Estado</th>
                    <th className="py-4 px-4 text-sm text-slate-500">Monto</th>
                    <th className="py-4 px-4 text-sm text-slate-500 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transaccionesFiltradas.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      {esAdmin && (
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-700">
                              👤
                            </div>

                            <div>
                              <p className="font-black text-slate-900">
                                {obtenerSolicitante(item)}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {obtenerEmailSolicitante(item) || 'Sin correo'}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="py-5 px-4">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border ${
                            item.tipo === 'INGRESO'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-red-50 text-red-700 border-red-100'
                          }`}
                        >
                          {item.tipo === 'INGRESO' ? '⬆️' : '⬇️'}
                          {item.tipo}
                        </span>
                      </td>

                      <td className="py-5 px-4 font-bold text-slate-900">
                        {item.descripcion}
                      </td>

                      <td className="py-5 px-4 text-slate-500">
                        {item.categoria}
                      </td>

                      <td className="py-5 px-4 text-slate-500">
                        {item.cuenta?.nombre || 'Sin cuenta'}
                      </td>

                      <td className="py-5 px-4 text-slate-500">
                        {item.fecha}
                      </td>

                      <td className="py-5 px-4">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border ${claseEstado(item.estado)}`}
                        >
                          {iconoEstado(item.estado)}
                          {item.estado || 'PENDIENTE'}
                        </span>
                      </td>

                      <td
                        className={`py-5 px-4 font-black ${
                          item.tipo === 'INGRESO'
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        S/. {formatoMoneda(item.monto)}
                      </td>

                      <td className="py-5 px-4">
                        <div className="flex justify-end gap-2 flex-wrap">

                          {esAdmin && item.estado === 'PENDIENTE' && (
                            <>
                              <button
                                type="button"
                                onClick={() => aprobarTransaccion(item.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition"
                              >
                                ✅ Aprobar
                              </button>

                              <button
                                type="button"
                                onClick={() => rechazarTransaccion(item.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold transition"
                              >
                                ⚠️ Rechazar
                              </button>
                            </>
                          )}

                          {item.estado !== 'APROBADO' && (
                            <button
                              type="button"
                              onClick={() => editarTransaccion(item)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                            >
                              ✏️ Editar
                            </button>
                          )}

                          {esAdmin && (
                            <button
                              type="button"
                              onClick={() => eliminarTransaccion(item.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition"
                            >
                              🗑 Eliminar
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </section>

      </main>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-5">
          <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden">

            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-900">
                  {editando
                    ? 'Editar movimiento'
                    : esAdmin
                      ? 'Nuevo movimiento'
                      : 'Nueva solicitud'}
                </h3>

                <p className="text-slate-500 mt-1">
                  {esAdmin
                    ? 'Registra un movimiento financiero aprobado automáticamente.'
                    : 'Completa la información para enviarla a revisión.'}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black transition"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarTransaccion} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    Tipo
                  </label>

                  <select
                    value={form.tipo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tipo: e.target.value
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all"
                  >
                    <option value="INGRESO">INGRESO</option>
                    <option value="GASTO">GASTO</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    Monto
                  </label>

                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.monto}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monto: e.target.value
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    Descripción
                  </label>

                  <input
                    placeholder="Ej. Compra de repuestos"
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        descripcion: e.target.value
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    Categoría
                  </label>

                  <input
                    placeholder="Ej. Movilidad, ventas, soporte"
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        categoria: e.target.value
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    Fecha
                  </label>

                  <input
                    type="date"
                    value={form.fecha}
                    readOnly
                    className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    Cuenta
                  </label>

                  <select
                    value={form.cuentaId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cuentaId: e.target.value
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all"
                    required
                  >
                    <option value="">Selecciona una cuenta</option>

                    {cuentas.map((cuenta) => (
                      <option key={cuenta.id} value={cuenta.id}>
                        {cuenta.nombre} - S/. {formatoMoneda(cuenta.saldo)}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="flex flex-col md:flex-row gap-3 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 py-4 rounded-2xl text-white font-black transition-all duration-300 shadow-lg shadow-slate-300"
                >
                  {editando
                    ? 'Guardar cambios'
                    : esAdmin
                      ? 'Registrar movimiento'
                      : 'Enviar solicitud'}
                </button>

                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-2xl text-slate-700 font-black transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}