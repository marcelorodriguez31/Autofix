import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { getDiagnosticos, createDiagnostico, updateDiagnostico, deleteDiagnostico } from '../api/diagnosticos';
import { getOrdenes } from '../api/ordenes';

const EMPTY = { fallas: '', observaciones: '', recomendaciones: '', ordenTrabajoId: '' };

// ⚠️ Definido FUERA del componente para que React no lo destruya al re-renderizar
function Textarea({ label, id, value, onChange, required, placeholder, rows = 3 }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default function Diagnosticos() {
  const [diagnosticos, setDiagnosticos] = useState([]);
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
    Promise.all([getDiagnosticos(), getOrdenes()])
      .then(([d, o]) => { setDiagnosticos(d); setOrdenes(o); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const ordenLabel = (id) => {
    const o = ordenes.find(o => o.id === id || o.id === Number(id));
    return o ? `#${o.id} — ${o.vehiculo?.patente ?? ''}` : `Orden #${id}`;
  };

  const openCreate = () => { setForm(EMPTY); setFormError(''); setModal('create'); };
  const openEdit = (d) => {
    setSelected(d);
    setForm({ fallas: d.fallas ?? '', observaciones: d.observaciones ?? '', recomendaciones: d.recomendaciones ?? '', ordenTrabajoId: d.ordenTrabajo?.id ?? '' });
    setFormError('');
    setModal('edit');
  };
  const openDetail = (d) => { setSelected(d); setModal('detail'); };
  const openDelete = (d) => { setSelected(d); setFormError(''); setModal('delete'); };
  const close = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      const payload = { ...form, ordenTrabajoId: Number(form.ordenTrabajoId) };
      if (modal === 'create') await createDiagnostico(payload);
      else await updateDiagnostico(selected.id, payload);
      load(); close();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try { await deleteDiagnostico(selected.id); load(); close(); }
    catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const columns = [
    { key: 'id', header: 'ID', render: d => `#${d.id}` },
    { key: 'orden', header: 'Orden', render: d => ordenLabel(d.ordenTrabajo?.id) },
    { key: 'fallas', header: 'Fallas', render: d => <span className="line-clamp-1">{d.fallas || '—'}</span> },
    { key: 'recomendaciones', header: 'Recomendaciones', render: d => <span className="line-clamp-1">{d.recomendaciones || '—'}</span> },
    {
      key: 'acciones', header: 'Acciones',
      render: d => (
        <div className="flex gap-1">
          <button onClick={() => openDetail(d)} className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-slate-500 hover:bg-yellow-50 hover:text-yellow-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={() => openDelete(d)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Diagnósticos">
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Diagnóstico
        </Button>
      </div>
      <Table columns={columns} data={diagnosticos} loading={loading} emptyMessage="No hay diagnósticos registrados." />

      <Modal isOpen={modal === 'create' || modal === 'edit'} onClose={close}
        title={modal === 'create' ? 'Nuevo Diagnóstico' : 'Editar Diagnóstico'}
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button type="submit" form="diag-form" loading={formLoading}>Guardar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <form id="diag-form" onSubmit={handleSave} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Orden de Trabajo <span className="text-red-500">*</span></label>
            <select value={form.ordenTrabajoId} onChange={e => setForm(f => ({ ...f, ordenTrabajoId: e.target.value }))} required
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar orden…</option>
              {ordenes.map(o => <option key={o.id} value={o.id}>#{o.id} — {o.vehiculo?.patente ?? ''} ({o.estado})</option>)}
            </select>
          </div>
          <Textarea
            label="Fallas detectadas" id="fallas" required
            value={form.fallas}
            onChange={e => setForm(f => ({ ...f, fallas: e.target.value }))}
          />
          <Textarea
            label="Observaciones" id="observaciones"
            value={form.observaciones}
            onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
          />
          <Textarea
            label="Recomendaciones" id="recomendaciones"
            value={form.recomendaciones}
            onChange={e => setForm(f => ({ ...f, recomendaciones: e.target.value }))}
          />
        </form>
      </Modal>

      <Modal isOpen={modal === 'detail'} onClose={close} title={`Diagnóstico #${selected?.id}`}
        footer={<Button variant="secondary" onClick={close}>Cerrar</Button>}>
        {selected && (
          <dl className="space-y-3 text-sm">
            <div><dt className="font-medium text-slate-500">Orden</dt><dd>{ordenLabel(selected.ordenTrabajo?.id)}</dd></div>
            <div><dt className="font-medium text-slate-500">Fallas</dt><dd className="whitespace-pre-wrap">{selected.fallas || '—'}</dd></div>
            <div><dt className="font-medium text-slate-500">Observaciones</dt><dd className="whitespace-pre-wrap">{selected.observaciones || '—'}</dd></div>
            <div><dt className="font-medium text-slate-500">Recomendaciones</dt><dd className="whitespace-pre-wrap">{selected.recomendaciones || '—'}</dd></div>
          </dl>
        )}
      </Modal>

      <Modal isOpen={modal === 'delete'} onClose={close} title="Eliminar Diagnóstico" size="sm"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" onClick={handleDelete} loading={formLoading}>Eliminar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <p className="text-slate-600 text-sm">¿Eliminar el diagnóstico <strong>#{selected?.id}</strong>? Esta acción no se puede deshacer.</p>
      </Modal>
    </Layout>
  );
}
