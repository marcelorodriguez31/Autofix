const colors = {
  CREADA: 'bg-blue-100 text-blue-700',
  EN_PROCESO: 'bg-yellow-100 text-yellow-700',
  FINALIZADA: 'bg-green-100 text-green-700',
  PENDIENTE: 'bg-orange-100 text-orange-700',
  CONFIRMADA: 'bg-teal-100 text-teal-700',
  CANCELADA: 'bg-red-100 text-red-700',
  DISPONIBLE: 'bg-green-100 text-green-700',
  NO_DISPONIBLE: 'bg-slate-100 text-slate-500',
  APROBADO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
  PAUSADO: 'bg-slate-100 text-slate-600',
  COMPLETADO: 'bg-green-100 text-green-700',
  APROBADA: 'bg-green-100 text-green-700',
  RECHAZADA: 'bg-red-100 text-red-700',
  ASIGNADA: 'bg-purple-100 text-purple-700',
  PRESUPUESTADA: 'bg-indigo-100 text-indigo-700',
  PRESUPUESTO_APROBADO: 'bg-teal-100 text-teal-700',
  PRESUPUESTO_RECHAZADO: 'bg-red-100 text-red-700',
  PAGADA: 'bg-green-100 text-green-700',
};

export default function Badge({ status }) {
  const cls = colors[status] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}
