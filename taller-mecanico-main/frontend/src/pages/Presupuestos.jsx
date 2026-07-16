import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { getPresupuestos, createPresupuesto, aprobarPresupuesto, rechazarPresupuesto, deletePresupuesto } from '../api/presupuestos';
import { getOrdenes } from '../api/ordenes';

const EMPTY = { ordenTrabajoId: '', manoObra: '', detalle: '' };

export default function Presupuestos() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getPresupuestos(), getOrdenes()])
      .then(([p, o]) => { setPresupuestos(p); setOrdenes(o); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const ordenLabel = (id) => {
    const o = ordenes.find(o => o.id === id || o.id === Number(id));
    return o ? `#${o.id} — ${o.vehiculo?.patente ?? ''}` : `Orden #${id}`;
  };

  const openCreate = () => { setForm(EMPTY); setFormError(''); setModal('create'); };
  const openDetail = (p) => { setSelected(p); setModal('detail'); };
  const openDelete = (p) => { setSelected(p); setFormError(''); setModal('delete'); };
  const close = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      await createPresupuesto({ ...form, ordenTrabajoId: Number(form.ordenTrabajoId), manoObra: Number(form.manoObra) });
      load(); close();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleAprobar = async () => {
    setFormLoading(true); setFormError('');
    try { await aprobarPresupuesto(selected.id); load(); close(); }
    catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleRechazar = async () => {
    setFormLoading(true); setFormError('');
    try { await rechazarPresupuesto(selected.id); load(); close(); }
    catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try { await deletePresupuesto(selected.id); load(); close(); }
    catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const estadoBadge = (estado) => {
    const map = { PENDIENTE: 'PENDIENTE', APROBADO: 'FINALIZADA', RECHAZADO: 'CANCELADA' };
    return <Badge status={map[estado] || 'PENDIENTE'} />;
  };

  const columns = [
    { key: 'id', header: 'ID', render: p => `#${p.id}` },
    { key: 'orden', header: 'Orden', render: p => ordenLabel(p.ordenTrabajo?.id) },
    { key: 'manoObra', header: 'Mano de obra', render: p => `$${Number(p.manoObra).toLocaleString('es-CL')}` },
    { key: 'montoTotal', header: 'Total', render: p => <span className="font-semibold">${Number(p.montoTotal ?? 0).toLocaleString('es-CL')}</span> },
    { key: 'estado', header: 'Estado', render: p => estadoBadge(p.estadoAprobacion) },
    {
      key: 'acciones', header: 'Acciones',
      render: p => (
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => openDetail(p)} className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button onClick={() => openDelete(p)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Presupuestos">
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Presupuesto
        </Button>
      </div>
      <Table columns={columns} data={presupuestos} loading={loading} emptyMessage="No hay presupuestos registrados." />

      <Modal isOpen={modal === 'create'} onClose={close} title="Nuevo Presupuesto"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button type="submit" form="pres-form" loading={formLoading}>Guardar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <form id="pres-form" onSubmit={handleSave} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Orden de Trabajo <span className="text-red-500">*</span></label>
            <select value={form.ordenTrabajoId} onChange={e => setForm(f => ({ ...f, ordenTrabajoId: e.target.value }))} required
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar orden…</option>
              {ordenes.map(o => <option key={o.id} value={o.id}>#{o.id} — {o.vehiculo?.patente ?? ''} ({o.estado})</option>)}
            </select>
          </div>
          <Input label="Mano de obra ($)" id="mano" type="number" min="0" step="1" value={form.manoObra} onChange={e => setForm(f => ({ ...f, manoObra: e.target.value }))} required />
          <div className="flex flex-col gap-1">
            <label htmlFor="detalle" className="text-sm font-medium text-slate-700">Detalle</label>
            <textarea id="detalle" value={form.detalle} onChange={e => setForm(f => ({ ...f, detalle: e.target.value }))} rows={3}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </form>
      </Modal>

      <Modal isOpen={modal === 'detail'} onClose={close} title={`Presupuesto #${selected?.id}`}
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="secondary" onClick={close} className="mr-auto">Cerrar</Button>
            {selected?.estadoAprobacion === 'PENDIENTE' && (
              <>
                <Button variant="danger" onClick={handleRechazar} loading={formLoading}>Rechazar</Button>
                <Button onClick={handleAprobar} loading={formLoading}>Aprobar</Button>
              </>
            )}
          </div>
        }>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        {selected && (
          <dl className="space-y-3 text-sm">
            <div><dt className="font-medium text-slate-500">Orden</dt><dd>{ordenLabel(selected.ordenTrabajo?.id)}</dd></div>
            <div><dt className="font-medium text-slate-500">Estado</dt><dd>{estadoBadge(selected.estadoAprobacion)}</dd></div>
            <div><dt className="font-medium text-slate-500">Mano de obra</dt><dd>${Number(selected.manoObra).toLocaleString('es-CL')}</dd></div>
            <div><dt className="font-medium text-slate-500">Total</dt><dd className="font-bold text-lg">${Number(selected.montoTotal ?? 0).toLocaleString('es-CL')}</dd></div>
            {selected.detalle && <div><dt className="font-medium text-slate-500">Detalle</dt><dd className="whitespace-pre-wrap">{selected.detalle}</dd></div>}
          </dl>
        )}
      </Modal>

      <Modal isOpen={modal === 'delete'} onClose={close} title="Eliminar Presupuesto" size="sm"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" onClick={handleDelete} loading={formLoading}>Eliminar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <p className="text-slate-600 text-sm">¿Eliminar el presupuesto <strong>#{selected?.id}</strong>? Esta acción no se puede deshacer.</p>
      </Modal>
    </Layout>
  );
}
