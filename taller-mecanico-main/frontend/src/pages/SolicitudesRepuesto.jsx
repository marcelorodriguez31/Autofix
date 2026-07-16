import { useEffect, useState } from 'react';

import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

import FeedbackMessage from '../components/common/FeedbackMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';

import {
  getSolicitudes,
  createSolicitud,
  deleteSolicitud,
  confirmarRecepcionSolicitud,
} from '../api/solicitudesRepuesto';

import { getOrdenes } from '../api/ordenes';
import { getRepuestos } from '../api/repuestos';

import {
  formularioTieneDatos,
} from '../utils/formUtils';

const ESTADOS_SOLICITUD = [
  'PENDIENTE',
  'APROBADA',
  'RECHAZADA',
  'RECIBIDA',
];

const ESTADOS_CREACION = [
  'PENDIENTE',
  'APROBADA',
  'RECHAZADA',
];

const EMPTY = {
  ordenTrabajoId: '',
  repuestoId: '',
  cantidad: '',
  estado: 'PENDIENTE',
};

export default function SolicitudesRepuesto() {
  const [solicitudes, setSolicitudes] =
    useState([]);

  const [ordenes, setOrdenes] =
    useState([]);

  const [repuestos, setRepuestos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [filtroEstado, setFiltroEstado] =
    useState('TODOS');

  const [modal, setModal] =
    useState(null);

  const [selected, setSelected] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY);

  const [formLoading, setFormLoading] =
    useState(false);

  const [formError, setFormError] =
    useState('');

  const [fieldErrors, setFieldErrors] =
    useState({});

  const [feedback, setFeedback] =
    useState({
      type: '',
      message: '',
    });

  const [
    showCancelConfirm,
    setShowCancelConfirm,
  ] = useState(false);

  const [
    showReceptionConfirm,
    setShowReceptionConfirm,
  ] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');

    return Promise.all([
      getSolicitudes(),
      getOrdenes(),
      getRepuestos(),
    ])
      .then(
        ([
          solicitudesData,
          ordenesData,
          repuestosData,
        ]) => {
          setSolicitudes(solicitudesData);
          setOrdenes(ordenesData);
          setRepuestos(repuestosData);
        }
      )
      .catch((err) => {
        setError(
          err.message ||
            'No fue posible cargar las solicitudes.'
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

  const repuestoLabel = (id) => {
    const repuesto = repuestos.find(
      (item) =>
        item.id === id ||
        item.id === Number(id)
    );

    return repuesto
      ? `${repuesto.nombre} (${repuesto.codigo})`
      : `Repuesto #${id}`;
  };

  const filtered =
    filtroEstado === 'TODOS'
      ? solicitudes
      : solicitudes.filter(
          (solicitud) =>
            solicitud.estado ===
            filtroEstado
        );

  const openCreate = () => {
    setSelected(null);
    setForm(EMPTY);
    setFormError('');
    setFieldErrors({});
    setShowCancelConfirm(false);
    setModal('create');
  };

  const openDelete = (solicitud) => {
    setSelected(solicitud);
    setFormError('');
    setModal('delete');
  };

  const openConfirmReception = (
    solicitud
  ) => {
    setSelected(solicitud);
    setFormError('');
    setShowReceptionConfirm(true);
  };

  const close = () => {
    setModal(null);
    setSelected(null);
    setForm(EMPTY);
    setFormError('');
    setFieldErrors({});
    setShowCancelConfirm(false);
    setShowReceptionConfirm(false);
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

    if (!form.repuestoId) {
      errores.repuestoId =
        'Debe seleccionar un repuesto.';
    }

    const cantidad = Number(
      form.cantidad
    );

    if (!form.cantidad) {
      errores.cantidad =
        'La cantidad es obligatoria.';
    } else if (
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      errores.cantidad =
        'La cantidad debe ser un número entero mayor que cero.';
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

    try {
      await createSolicitud({
        ordenTrabajoId: Number(
          form.ordenTrabajoId
        ),
        repuestoId: Number(
          form.repuestoId
        ),
        cantidad: Number(
          form.cantidad
        ),
        estado: form.estado,
      });

      await load();

      close();

      setFeedback({
        type: 'success',
        message:
          'Solicitud de repuesto guardada correctamente.',
      });
    } catch (err) {
      const mensaje =
        err.message ||
        'No fue posible guardar la solicitud.';

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
      await deleteSolicitud(
        selected.id
      );

      await load();

      close();

      setFeedback({
        type: 'success',
        message:
          'Solicitud eliminada correctamente.',
      });
    } catch (err) {
      setFormError(
        err.message ||
          'No fue posible eliminar la solicitud.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmReception =
    async () => {
      if (!selected?.id) {
        return;
      }

      setFormLoading(true);
      setFormError('');

      try {
        await confirmarRecepcionSolicitud(
          selected.id
        );

        await load();

        setShowReceptionConfirm(false);
        setSelected(null);

        setFeedback({
          type: 'success',
          message:
            'Recepción del repuesto confirmada correctamente.',
        });
      } catch (err) {
        const mensaje =
          err.message ||
          'No fue posible confirmar la recepción.';

        setShowReceptionConfirm(false);
        setSelected(null);

        setFeedback({
          type: 'error',
          message: mensaje,
        });
      } finally {
        setFormLoading(false);
      }
    };

  const handleCancelCreate = () => {
    const tieneDatos =
      formularioTieneDatos({
        ordenTrabajoId:
          form.ordenTrabajoId,
        repuestoId:
          form.repuestoId,
        cantidad:
          form.cantidad,
      }) ||
      form.estado !== 'PENDIENTE';

    if (tieneDatos) {
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

  const cancelarRecepcion = () => {
    setShowReceptionConfirm(false);
    setSelected(null);
  };

  const estadoColor = {
    PENDIENTE: 'PENDIENTE',
    APROBADA: 'FINALIZADA',
    RECHAZADA: 'CANCELADA',
    RECIBIDA: 'DISPONIBLE',
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (solicitud) =>
        `#${solicitud.id}`,
    },
    {
      key: 'orden',
      header: 'Orden',
      render: (solicitud) =>
        ordenLabel(
          solicitud.ordenTrabajoId ??
            solicitud.ordenTrabajo?.id
        ),
    },
    {
      key: 'repuesto',
      header: 'Repuesto',
      render: (solicitud) =>
        repuestoLabel(
          solicitud.repuestoId ??
            solicitud.repuesto?.id
        ),
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      render: (solicitud) =>
        solicitud.cantidad,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (solicitud) => (
        <Badge
          status={
            estadoColor[
              solicitud.estado
            ] || 'PENDIENTE'
          }
        />
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (solicitud) => (
        <div className="flex items-center gap-1">
          {solicitud.estado ===
            'APROBADA' && (
            <button
              type="button"
              onClick={() =>
                openConfirmReception(
                  solicitud
                )
              }
              title="Confirmar recepción"
              className="px-2 py-1 rounded text-xs bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors"
            >
              Confirmar recepción
            </button>
          )}

          {solicitud.estado ===
            'RECIBIDA' && (
            <span className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 font-medium">
              Recepción confirmada
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              openDelete(solicitud)
            }
            title="Eliminar solicitud"
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
    <Layout title="Solicitudes de Repuesto">
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
          {[
            'TODOS',
            ...ESTADOS_SOLICITUD,
          ].map((estado) => (
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
                : estado}
            </button>
          ))}
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

          Nueva Solicitud
        </Button>
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No hay solicitudes de repuesto registradas."
      />

      <Modal
        isOpen={modal === 'create'}
        onClose={handleCancelCreate}
        title="Nueva Solicitud de Repuesto"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelCreate}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              form="sol-form"
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
          id="sol-form"
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
            <label className="text-sm font-medium text-slate-700">
              Repuesto{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              value={form.repuestoId}
              onChange={handleFormChange(
                'repuestoId'
              )}
              required
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.repuestoId
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300'
              }`}
            >
              <option value="">
                Seleccionar repuesto…
              </option>

              {repuestos.map((repuesto) => (
                <option
                  key={repuesto.id}
                  value={repuesto.id}
                >
                  {repuesto.nombre} —{' '}
                  {repuesto.codigo} — Stock:{' '}
                  {repuesto.stock}
                </option>
              ))}
            </select>

            {fieldErrors.repuestoId && (
              <p className="text-xs text-red-600">
                {fieldErrors.repuestoId}
              </p>
            )}
          </div>

          <Input
            label="Cantidad"
            id="cantidad"
            type="number"
            min="1"
            step="1"
            value={form.cantidad}
            onChange={handleFormChange(
              'cantidad'
            )}
            required
            error={fieldErrors.cantidad}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Estado inicial
            </label>

            <select
              value={form.estado}
              onChange={handleFormChange(
                'estado'
              )}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ESTADOS_CREACION.map(
                (estado) => (
                  <option
                    key={estado}
                    value={estado}
                  >
                    {estado}
                  </option>
                )
              )}
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modal === 'delete'}
        onClose={close}
        title="Eliminar Solicitud"
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
          ¿Eliminar la solicitud{' '}
          <strong>#{selected?.id}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </Modal>

      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Cancelar solicitud"
        message="¿Está seguro de que desea cancelar la acción? Se perderán los datos ingresados."
        confirmText="Sí, cancelar"
        cancelText="Continuar editando"
        variant="danger"
        onConfirm={confirmarCancelacion}
        onCancel={continuarEditando}
      />

      <ConfirmDialog
        isOpen={showReceptionConfirm}
        title="Confirmar recepción"
        message={`¿Confirma que fue recibido el repuesto correspondiente a la solicitud #${selected?.id ?? ''}? Esta acción cerrará el ciclo de la solicitud.`}
        confirmText="Confirmar recepción"
        cancelText="Cancelar"
        variant="primary"
        loading={formLoading}
        onConfirm={handleConfirmReception}
        onCancel={cancelarRecepcion}
      />
    </Layout>
  );
}