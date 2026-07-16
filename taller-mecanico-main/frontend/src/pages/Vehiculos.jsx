import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import { getVehiculos } from '../api/vehiculos';

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getVehiculos()
      .then(setVehiculos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vehiculos.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.patente?.toLowerCase().includes(q) ||
      v.marca?.toLowerCase().includes(q) ||
      v.modelo?.toLowerCase().includes(q)
    );
  });

  const columns = [
    { key: 'patente', header: 'Patente' },
    { key: 'marca', header: 'Marca' },
    { key: 'modelo', header: 'Modelo' },
    { key: 'anio', header: 'Año' },
    { key: 'kilometraje', header: 'Kilometraje', render: (v) => v.kilometraje != null ? `${v.kilometraje.toLocaleString('es-CL')} km` : '—' },
    { key: 'createdAt', header: 'Registrado', render: (v) => v.createdAt ? new Date(v.createdAt).toLocaleDateString('es-CL') : '—' },
  ];

  return (
    <Layout title="Vehículos">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por patente, marca o modelo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No hay vehículos registrados." />

      <p className="mt-3 text-xs text-slate-400">
        Para agregar un vehículo, ve a la sección <strong>Clientes</strong> y selecciona el cliente correspondiente.
      </p>
    </Layout>
  );
}
