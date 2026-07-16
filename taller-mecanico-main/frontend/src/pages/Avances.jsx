import { useEffect, useState } from 'react';

import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

import FeedbackMessage from '../components/common/FeedbackMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';

import {
  getAvances,
  createAvance,
  updateAvance,
  deleteAvance,
} from '../api/avances';

import { getOrdenes } from '../api/ordenes';

import {
  formularioTieneDatos,
  formularioTieneCambios,
} from '../utils/formUtils';

const ESTADOS = [
  'EN_PROCESO',
  'PAUSADO',
  'COMPLETADO',
];

const PORCENTAJES = [
  {
    value: 0,
    label: '🟥 0%',
  },
  {
    value: 25,
    label: '🟧 25%',
  },
  {
    value: 50,
    label: '🟨 50%',
  },
  {
    value: 75,
    label: '🟩 75%',
  },
  {
    value: 100,
    label: '🟦 100%',
  },
];

const EMPTY = {
  descripcion: '',
  porcentajeAvance: '',
  estado: 'EN_PROCESO',
  ordenTrabajoId: '',
};

export default function Avances() {
  const [avances, setAvances] = useState([]);
  const [ordenes, setOrdenes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filtroEstado, setFiltroEstado] =
    useState('TODOS');

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState(EMPTY);
  const [initialForm, setInitialForm] =
    useState(EMPTY);

  const [formLoading, setFormLoading] =
    useState(false);

  const [formError, setFormError] =
    useState('');

  const [fieldErrors, setFieldErrors] =
    useState({});

  const [feedback, setFeedback] = useState({
    type: '',
    message: '',
  });

  const [
    showCancelConfirm,
    setShowCancelConfirm,
  ] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');

    return Promise.all([
      getAvances(),
      getOrdenes(),
    ])
      .then(([avancesData, ordenesData]) => {
        setAvances(avancesData);
        setOrdenes(ordenesData);
      })
      .catch((err) => {
        setError(
          err.message ||
            'No fue posible cargar los avances.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const ordenLabel = (id) => {
    const orden = ordenes.find(
      (item) =>
        item.id === id ||
        item.id === Number(id)
    );

    return orden
      ? `#${orden.id} — ${
          orden.vehiculo?.patente ?? ''
        }`
      : `Orden #${id}`;
  };

  const filtered =
    filtroEstado === 'TODOS'
      ? avances
      : avances.filter(
          (avance) =>
            avance.estado === filtroEstado
        );

  const porcentajesDisponibles =
    modal === 'edit'
      ? PORCENTAJES.filter(
          (opcion) =>
            opcion.value >=
            Number(
              initialForm.porcentajeAvance
            )
        )
      : PORCENTAJES;

  const openCreate = () => {
    setSelected(null);
    setForm(EMPTY);
    setInitialForm(EMPTY);
    setFormError('');
    setFieldErrors({});
    setShowCancelConfirm(false);
    setModal('create');
  };

  const openEdit = (avance) => {
    const datosFormulario = {
      descripcion:
        avance.descripcion ?? '',
      porcentajeAvance:
        avance.porcentajeAvance ?? '',
      estado:
        avance.estado ?? 'EN_PROCESO',
      ordenTrabajoId:
        avance.ordenTrabajoId ??
        avance.ordenTrabajo?.id ??
        '',
    };

    setSelected(avance);
    setForm(datosFormulario);
    setInitialForm(datosFormulario);
    setFormError('');
    setFieldErrors({});
    setShowCancelConfirm(false);
    setModal('edit');
  };

  const openDelete = (avance) => {
    setSelected(avance);
    setFormError('');
    setModal('delete');
  };

  const close = () => {
    setModal(null);
    setSelected(null);
    setForm(EMPTY);
    setInitialForm(EMPTY);
    setFormError('');
    setFieldErrors({});
    setShowCancelConfirm(false);
  };

  const handleFormChange =
    (field) => (event) => {
      const value = event.target.value;

      setForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }));

      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [field]: '',
      }));

      setFormError('');
    };

  const validarFormulario = () => {
    const errores = {};

    if (!form.ordenTrabajoId) {
      errores.ordenTrabajoId =
        'Debe seleccionar una orden de trabajo.';
    }

    if (!form.descripcion.trim()) {
      errores.descripcion =
        'La descripción es obligatoria.';
    }

    if (
      form.porcentajeAvance === '' ||
      form.porcentajeAvance === null ||
      form.porcentajeAvance === undefined
    ) {
      errores.porcentajeAvance =
        'Debe seleccionar el porcentaje de avance.';
    } else {
      const porcentaje = Number(
        form.porcentajeAvance
      );

      if (
        !PORCENTAJES.some(
          (opcion) =>
            opcion.value === porcentaje
        )
      ) {
        errores.porcentajeAvance =
          'El porcentaje debe ser 0%, 25%, 50%, 75% o 100%.';
      }

      if (
        modal === 'edit' &&
        porcentaje <
          Number(
            initialForm.porcentajeAvance
          )
      ) {
        errores.porcentajeAvance =
          'El porcentaje de avance no puede disminuir.';
      }
    }

    setFieldErrors(errores);

    return Object.keys(errores).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setFormLoading(true);
    setFormError('');

    const editando = modal === 'edit';

    const payload = {
      ...form,
      descripcion: form.descripcion.trim(),
      ordenTrabajoId: Number(
        form.ordenTrabajoId
      ),
      porcentajeAvance: Number(
        form.porcentajeAvance
      ),
    };

    try {
      if (editando) {
        await updateAvance(
          selected.id,
          payload
        );
      } else {
        await createAvance(payload);
      }

      await load();

      close();

      setFeedback({
        type: 'success',
        message: editando
          ? 'Avance actualizado correctamente.'
          : 'Avance guardado correctamente.',
      });
    } catch (err) {
      const mensaje =
        err.message ||
        'No fue posible guardar el avance.';

      setFormError(mensaje);

      setFeedback({
        type: 'error',
        message: mensaje,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected?.id) {
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      await deleteAvance(selected.id);

      await load();

      close();

      setFeedback({
        type: 'success',
        message:
          'Avance eliminado correctamente.',
      });
    } catch (err) {
      setFormError(
        err.message ||
          'No fue posible eliminar el avance.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    let tieneCambios = false;

    if (modal === 'create') {
      tieneCambios =
        formularioTieneDatos({
          descripcion: form.descripcion,
          porcentajeAvance:
            form.porcentajeAvance,
          ordenTrabajoId:
            form.ordenTrabajoId,
        }) ||
        form.estado !== 'EN_PROCESO';
    }

    if (modal === 'edit') {
      tieneCambios =
        formularioTieneCambios(
          initialForm,
          form
        );
    }

    if (tieneCambios) {
      setShowCancelConfirm(true);
      return;
    }

    close();
  };

  const confirmarCancelacion = () => {
    setShowCancelConfirm(false);
    close();
  };

  const continuarEditando = () => {
    setShowCancelConfirm(false);
  };

  const estadoColor = {
    EN_PROCESO: 'EN_PROCESO',
    PAUSADO: 'PENDIENTE',
    COMPLETADO: 'FINALIZADA',
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (avance) =>
        `#${avance.id}`,
    },
    {
      key: 'orden',
      header: 'Orden',
      render: (avance) =>
        ordenLabel(
          avance.ordenTrabajoId ??
            avance.ordenTrabajo?.id
        ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (avance) => (
        <span className="line-clamp-1">
          {avance.descripcion || '—'}
        </span>
      ),
    },
    {
      key: 'porcentaje',
      header: 'Avance',
      render: (avance) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  avance.porcentajeAvance || 0
                )}%`,
              }}
            />
          </div>

          <span className="text-xs font-medium text-slate-600 w-10 text-right">
            {avance.porcentajeAvance ?? 0}%
          </span>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (avance) => (
        <Badge
          status={
            estadoColor[avance.estado] ||
            'PENDIENTE'
          }
        />
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (avance) => (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() =>
              openEdit(avance)
            }
            title="Editar avance"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() =>
              openDelete(avance)
            }
            title="Eliminar avance"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Avances de Reparación">
      <FeedbackMessage
        type={feedback.type}
        message={feedback.message}
        onClose={() =>
          setFeedback({
            type: '',
            message: '',
          })
        }
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {['TODOS', ...ESTADOS].map(
            (estado) => (
              <button
                key={estado}
                type="button"
                onClick={() =>
                  setFiltroEstado(estado)
                }
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === estado
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {estado === 'TODOS'
                  ? 'Todos'
                  : estado.replace(
                      /_/g,
                      ' '
                    )}
              </button>
            )
          )}
        </div>

        <Button
          type="button"
          onClick={openCreate}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>

          Nuevo Avance
        </Button>
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No hay avances registrados."
      />

      <Modal
        isOpen={
          modal === 'create' ||
          modal === 'edit'
        }
        onClose={handleCancel}
        title={
          modal === 'create'
            ? 'Nuevo Avance'
            : 'Editar Avance'
        }
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              form="av-form"
              loading={formLoading}
            >
              Guardar
            </Button>
          </>
        }
      >
        {formError && (
          <p className="mb-3 text-sm text-red-600">
            {formError}
          </p>
        )}

        <form
          id="av-form"
          onSubmit={handleSave}
          className="space-y-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Orden de Trabajo{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              value={form.ordenTrabajoId}
              onChange={handleFormChange(
                'ordenTrabajoId'
              )}
              required
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.ordenTrabajoId
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300'
              }`}
            >
              <option value="">
                Seleccionar orden…
              </option>

              {ordenes.map((orden) => (
                <option
                  key={orden.id}
                  value={orden.id}
                >
                  #{orden.id} —{' '}
                  {orden.vehiculo?.patente ??
                    ''}{' '}
                  ({orden.estado})
                </option>
              ))}
            </select>

            {fieldErrors.ordenTrabajoId && (
              <p className="text-xs text-red-600">
                {
                  fieldErrors.ordenTrabajoId
                }
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="descripcion"
              className="text-sm font-medium text-slate-700"
            >
              Descripción{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <textarea
              id="descripcion"
              value={form.descripcion}
              onChange={handleFormChange(
                'descripcion'
              )}
              required
              rows={3}
              placeholder="Describa el trabajo realizado..."
              className={`px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.descripcion
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300'
              }`}
            />

            {fieldErrors.descripcion && (
              <p className="text-xs text-red-600">
                {fieldErrors.descripcion}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Porcentaje de avance{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              value={form.porcentajeAvance}
              onChange={handleFormChange(
                'porcentajeAvance'
              )}
              required
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.porcentajeAvance
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300'
              }`}
            >
              <option value="">
                Seleccionar porcentaje…
              </option>

              {porcentajesDisponibles.map(
                (opcion) => (
                  <option
                    key={opcion.value}
                    value={opcion.value}
                  >
                    {opcion.label}
                  </option>
                )
              )}
            </select>

            {modal === 'edit' && (
              <p className="text-xs text-slate-500">
                El porcentaje actual es{' '}
                {
                  initialForm.porcentajeAvance
                }
                %. Solo puede mantenerse o
                aumentar.
              </p>
            )}

            {fieldErrors.porcentajeAvance && (
              <p className="text-xs text-red-600">
                {
                  fieldErrors.porcentajeAvance
                }
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Estado
            </label>

            <select
              value={form.estado}
              onChange={handleFormChange(
                'estado'
              )}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ESTADOS.map((estado) => (
                <option
                  key={estado}
                  value={estado}
                >
                  {estado.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modal === 'delete'}
        onClose={close}
        title="Eliminar Avance"
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={close}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              loading={formLoading}
            >
              Eliminar
            </Button>
          </>
        }
      >
        {formError && (
          <p className="mb-3 text-sm text-red-600">
            {formError}
          </p>
        )}

        <p className="text-slate-600 text-sm">
          ¿Eliminar el avance{' '}
          <strong>#{selected?.id}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </Modal>

      <ConfirmDialog
        isOpen={showCancelConfirm}
        title={
          modal === 'edit'
            ? 'Cancelar edición'
            : 'Cancelar registro'
        }
        message="¿Está seguro de que desea cancelar la acción? Se perderán los cambios realizados."
        confirmText="Sí, cancelar"
        cancelText="Continuar editando"
        variant="danger"
        onConfirm={confirmarCancelacion}
        onCancel={continuarEditando}
      />
    </Layout>
  );
}