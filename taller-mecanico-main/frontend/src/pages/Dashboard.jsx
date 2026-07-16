import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import { getClientes } from '../api/clientes';
import { getVehiculos } from '../api/vehiculos';
import { getOrdenes } from '../api/ordenes';
import { getReservas } from '../api/reservas';

const ESTADOS = ['CREADA', 'EN_PROCESO', 'FINALIZADA'];

export default function Dashboard() {
  const [data, setData] = useState({ clientes: [], vehiculos: [], ordenes: [], reservas: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getClientes(), getVehiculos(), getOrdenes(), getReservas()])
      .then(([clientes, vehiculos, ordenes, reservas]) =>
        setData({ clientes, vehiculos, ordenes, reservas })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const proximasReservas = [...data.reservas]
    .filter((r) => r.fecha >= today)
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .slice(0, 5);

  const ordenesActivas = data.ordenes.filter((o) => o.estado !== 'FINALIZADA').length;

  const reservaColumns = [
    { key: 'fecha', header: 'Fecha' },
    { key: 'hora', header: 'Hora', render: (r) => r.hora?.slice(0, 5) },
    { key: 'cliente', header: 'Cliente', render: (r) => r.cliente?.nombre ?? '—' },
    { key: 'vehiculo', header: 'Vehículo', render: (r) => r.vehiculo ? `${r.vehiculo.patente} – ${r.vehiculo.marca}` : '—' },
    { key: 'motivo', header: 'Motivo' },
    { key: 'estado', header: 'Estado', render: (r) => <Badge status={r.estado} /> },
  ];

  return (
    <Layout title="Dashboard">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card
          title="Total Clientes"
          value={loading ? '…' : data.clientes.length}
          color="blue"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <Card
          title="Total Vehículos"
          value={loading ? '…' : data.vehiculos.length}
          color="purple"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h8zM13 16h2l4-4-1-5h-5v9z" /></svg>}
        />
        <Card
          title="Órdenes Activas"
          value={loading ? '…' : ordenesActivas}
          color="yellow"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <Card
          title="Próximas Reservas"
          value={loading ? '…' : proximasReservas.length}
          color="green"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Órdenes por Estado</h3>
          {loading ? (
            <p className="text-slate-400 text-sm">Cargando…</p>
          ) : (
            <div className="space-y-3">
              {ESTADOS.map((estado) => {
                const count = data.ordenes.filter((o) => o.estado === estado).length;
                const total = data.ordenes.length || 1;
                return (
                  <div key={estado}>
                    <div className="flex items-center justify-between mb-1">
                      <Badge status={estado} />
                      <span className="text-sm font-semibold text-slate-700">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Próximas Reservas</h3>
            <Table
              columns={reservaColumns}
              data={proximasReservas}
              loading={loading}
              emptyMessage="No hay reservas próximas."
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
