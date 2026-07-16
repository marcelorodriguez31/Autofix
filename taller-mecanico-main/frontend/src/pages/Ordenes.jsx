import { useEffect, useState } from 'react';

import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

import FeedbackMessage from '../components/common/FeedbackMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';

import {
  getOrdenes,
  createOrden,
  deleteOrden,
  asignarMecanico,
} from '../api/ordenes';

import { getVehiculos } from '../api/vehiculos';
import { getMecanicos } from '../api/mecanicos';

import {
  formularioTieneDatos,
} from '../utils/formUtils';

const ESTADOS = [
  {
    value: 'CREADA',
    label: 'Creadas',
  },
  {
    value: 'ASIGNADA',
    label: 'Asignadas',
  },
  {
    value: 'EN_PROCESO',
    label: 'En proceso',
  },
  {
    value: 'FINALIZADA',
    label: 'Finalizadas',
  },
];

const EMPTY_FORM = {
  vehiculoId: '',
  mecanicoId: '',
  estado: 'CREADA',
  diagnosticoPreliminar: '',
};

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [mecanicoId, setMecanicoId] = useState('');

  const [vehiculoSearch, setVehiculoSearch] =
    useState('');

  const [mecanicoSearch, setMecanicoSearch] =
    useState('');

  const [feedback, setFeedback] = useState({
    type: '',
    message: '',
  });

  const [
    showCancelCreateConfirm,
    setShowCancelCreateConfirm,
  ] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');

    return Promise.all([
      getOrdenes(),
      getVehiculos(),
      getMecanicos(),
    ])
      .then(([ordenesData, vehiculosData, mecanicosData]) => {
        setOrdenes(ordenesData);
        setVehiculos(vehiculosData);
        setMecanicos(mecanicosData);
      })
      .catch((err) => {
        setError(
          err.message ||
            'No fue posible cargar los datos.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const normalizarEstado = (estado = '') =>
    String(estado)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_');

  const filtered = estadoFilter
    ? ordenes.filter(
        (orden) =>
          normalizarEstado(orden.estado) ===
          normalizarEstado(estadoFilter)
      )
    : ordenes;

  const vehiculosFiltrados = vehiculos.filter(
    (vehiculo) => {
      const consulta = vehiculoSearch
        .trim()
        .toLowerCase();

      if (!consulta) {
        return true;
      }

      const textoVehiculo = [
        vehiculo.patente,
        vehiculo.marca,
        vehiculo.modelo,
        vehiculo.anio,
      ]
        .filter(
          (valor) =>
            valor !== null &&
            valor !== undefined
        )
        .join(' ')
        .toLowerCase();

      return textoVehiculo.includes(consulta);
    }
  );

  const mecanicosFiltrados = mecanicos.filter(
    (mecanico) => {
      const consulta = mecanicoSearch
        .trim()
        .toLowerCase();

      if (!consulta) {
        return true;
      }

      const textoMecanico = [
        mecanico.nombre,
        mecanico.rut,
        mecanico.especialidad,
      ]
        .filter(
          (valor) =>
            valor !== null &&
            valor !== undefined
        )
        .join(' ')
        .toLowerCase();

      return textoMecanico.includes(consulta);
    }
  );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setVehiculoSearch('');
    setMecanicoSearch('');
    setShowCancelCreateConfirm(false);
    setModal('create');
  };

  const openDetail = (orden) => {
    setSelected(orden);
    setMecanicoId('');
    setFormError('');
    setModal('detail');
  };

  const openDelete = (orden) => {
    setSelected(orden);
    setFormError('');
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setFormError('');
    setForm(EMPTY_FORM);
    setMecanicoId('');
    setVehiculoSearch('');
    setMecanicoSearch('');
    setShowCancelCreateConfirm(false);
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    setFormLoading(true);
    setFormError('');

    try {
      await createOrden({
        ...form,
        vehiculoId: Number(form.vehiculoId),
        mecanicoId: form.mecanicoId
          ? Number(form.mecanicoId)
          : null,
      });

      await load();

      closeModal();

      setFeedback({
        type: 'success',
        message:
          'Orden de trabajo creada correctamente.',
      });
    } catch (err) {
      setFormError(
        err.message ||
          'No fue posible crear la orden de trabajo.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleAsignar = async () => {
    if (!mecanicoId) {
      setFormError(
        'Debe seleccionar un mecánico.'
      );
      return;
    }

    setFormLoading(true);
    setFormError('');

    const estabaAsignado = Boolean(
      selected?.mecanico
    );

    try {
      const ordenActualizada =
        await asignarMecanico(
          selected.id,
          Number(mecanicoId)
        );

      setSelected(ordenActualizada);
      setMecanicoId('');

      await load();

      setFeedback({
        type: 'success',
        message: estabaAsignado
          ? 'Mecánico cambiado correctamente.'
          : 'Mecánico asignado correctamente.',
      });
    } catch (err) {
      const mensaje =
        err.message ||
        'No fue posible asignar el mecánico.';

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
      await deleteOrden(selected.id);

      await load();

      closeModal();

      setFeedback({
        type: 'success',
        message:
          'Orden de trabajo eliminada correctamente.',
      });
    } catch (err) {
      setFormError(
        err.message ||
          'No fue posible eliminar la orden.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelCreate = () => {
    const tieneDatos =
      formularioTieneDatos({
        vehiculoId: form.vehiculoId,
        mecanicoId: form.mecanicoId,
        diagnosticoPreliminar:
          form.diagnosticoPreliminar,
      });

    const estadoFueModificado =
      form.estado !== 'CREADA';

    if (tieneDatos || estadoFueModificado) {
      setShowCancelCreateConfirm(true);
      return;
    }

    closeModal();
  };

  const confirmarCancelacionCreate = () => {
    setShowCancelCreateConfirm(false);
    closeModal();
  };

  const continuarCreandoOrden = () => {
    setShowCancelCreateConfirm(false);
  };

  const columns = [
    {
      key: 'numero',
      header: 'Número',
    },
    {
      key: 'fechaIngreso',
      header: 'Fecha Ingreso',
      render: (orden) =>
        orden.fechaIngreso
          ? new Date(
              orden.fechaIngreso
            ).toLocaleString('es-CL', {
              dateStyle: 'short',
              timeStyle: 'short',
            })
          : '—',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (orden) => (
        <Badge status={orden.estado} />
      ),
    },
    {
      key: 'vehiculo',
      header: 'Vehículo',
      render: (orden) =>
        orden.vehiculo
          ? `${orden.vehiculo.patente} – ${orden.vehiculo.marca} ${orden.vehiculo.modelo}`
          : '—',
    },
    {
      key: 'mecanico',
      header: 'Mecánico',
      render: (orden) =>
        orden.mecanico ? (
          orden.mecanico.nombre
        ) : (
          <span className="text-slate-400 text-xs">
            Sin asignar
          </span>
        ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (orden) => (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => openDetail(orden)}
            title="Ver detalle"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => openDelete(orden)}
            title="Eliminar"
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
    <Layout title="Órdenes de Trabajo">
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
          <button
            type="button"
            onClick={() =>
              setEstadoFilter('')
            }
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              estadoFilter === ''
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todas
          </button>

          {ESTADOS.map((estado) => (
            <button
              key={estado.value}
              type="button"
              onClick={() =>
                setEstadoFilter(
                  estado.value
                )
              }
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                estadoFilter === estado.value
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {estado.label}
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

          Nueva Orden
        </Button>
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No hay órdenes registradas."
      />

      {/* Modal para crear orden */}
      <Modal
        isOpen={modal === 'create'}
        onClose={handleCancelCreate}
        title="Nueva Orden de Trabajo"
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
              form="orden-form"
              loading={formLoading}
            >
              Crear Orden
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
          id="orden-form"
          onSubmit={handleCreate}
          className="space-y-4"
        >
          {/* Buscar y seleccionar vehículo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Vehículo{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              value={vehiculoSearch}
              onChange={(event) =>
                setVehiculoSearch(
                  event.target.value
                )
              }
              placeholder="Buscar por patente, marca, modelo o año..."
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              required
              value={form.vehiculoId}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  vehiculoId:
                    event.target.value,
                }))
              }
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Seleccionar vehículo…
              </option>

              {vehiculosFiltrados.map(
                (vehiculo) => (
                  <option
                    key={vehiculo.id}
                    value={vehiculo.id}
                  >
                    {vehiculo.patente} –{' '}
                    {vehiculo.marca}{' '}
                    {vehiculo.modelo}{' '}
                    ({vehiculo.anio})
                  </option>
                )
              )}
            </select>

            {vehiculoSearch &&
              vehiculosFiltrados.length ===
                0 && (
                <p className="text-xs text-red-600">
                  No se encontraron vehículos.
                </p>
              )}
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Estado
            </label>

            <select
              value={form.estado}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  estado:
                    event.target.value,
                }))
              }
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ESTADOS.map((estado) => (
                <option
                  key={estado.value}
                  value={estado.value}
                >
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          {/* Buscar y seleccionar mecánico */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Mecánico{' '}
              <span className="text-slate-400 text-xs">
                (opcional)
              </span>
            </label>

            <input
              type="text"
              value={mecanicoSearch}
              onChange={(event) =>
                setMecanicoSearch(
                  event.target.value
                )
              }
              placeholder="Buscar por nombre, RUT o especialidad..."
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={form.mecanicoId}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  mecanicoId:
                    event.target.value,
                }))
              }
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Sin asignar
              </option>

              {mecanicosFiltrados.map(
                (mecanico) => (
                  <option
                    key={mecanico.id}
                    value={mecanico.id}
                  >
                    {mecanico.nombre} —{' '}
                    {mecanico.especialidad}
                  </option>
                )
              )}
            </select>

            {mecanicoSearch &&
              mecanicosFiltrados.length ===
                0 && (
                <p className="text-xs text-red-600">
                  No se encontraron mecánicos.
                </p>
              )}
          </div>

          {/* Diagnóstico preliminar */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Diagnóstico Preliminar
            </label>

            <textarea
              rows={3}
              value={
                form.diagnosticoPreliminar
              }
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  diagnosticoPreliminar:
                    event.target.value,
                }))
              }
              placeholder="Descripción del problema o diagnóstico inicial…"
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Modal de detalle */}
      <Modal
        isOpen={modal === 'detail'}
        onClose={closeModal}
        title={`Orden ${
          selected?.numero ?? ''
        }`}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
            >
              Cerrar
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={() => {
                const ordenParaEliminar =
                  selected;

                closeModal();

                setTimeout(() => {
                  openDelete(
                    ordenParaEliminar
                  );
                }, 50);
              }}
            >
              Eliminar
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">
                  Número
                </p>

                <p className="font-semibold text-slate-800">
                  {selected.numero}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-0.5">
                  Estado
                </p>

                <Badge
                  status={selected.estado}
                />
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-0.5">
                  Fecha Ingreso
                </p>

                <p className="text-slate-700">
                  {selected.fechaIngreso
                    ? new Date(
                        selected.fechaIngreso
                      ).toLocaleString(
                        'es-CL'
                      )
                    : '—'}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-0.5">
                  Vehículo
                </p>

                <p className="text-slate-700">
                  {selected.vehiculo
                    ? `${selected.vehiculo.patente} – ${selected.vehiculo.marca} ${selected.vehiculo.modelo}`
                    : '—'}
                </p>
              </div>
            </div>

            {selected.diagnosticoPreliminar && (
              <div>
                <p className="text-slate-400 text-xs mb-0.5">
                  Diagnóstico Preliminar
                </p>

                <p className="text-slate-700 bg-slate-50 rounded-lg p-3">
                  {
                    selected.diagnosticoPreliminar
                  }
                </p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3">
              <p className="text-slate-400 text-xs mb-1">
                Mecánico Asignado
              </p>

              {selected.mecanico ? (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
                    {selected.mecanico.nombre?.charAt(
                      0
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-slate-800">
                      {
                        selected.mecanico
                          .nombre
                      }
                    </p>

                    <p className="text-xs text-slate-500">
                      {
                        selected.mecanico
                          .especialidad
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic mb-3">
                  Sin mecánico asignado
                </p>
              )}

              {formError && (
                <p className="mb-2 text-sm text-red-600">
                  {formError}
                </p>
              )}

              <div className="flex gap-2">
                <select
                  value={mecanicoId}
                  onChange={(event) =>
                    setMecanicoId(
                      event.target.value
                    )
                  }
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {mecanicos.length === 0
                      ? 'No hay mecánicos registrados'
                      : 'Seleccionar mecánico…'}
                  </option>

                  {mecanicos.map(
                    (mecanico) => (
                      <option
                        key={mecanico.id}
                        value={mecanico.id}
                      >
                        {mecanico.nombre} —{' '}
                        {
                          mecanico.especialidad
                        }
                      </option>
                    )
                  )}
                </select>

                <Button
                  type="button"
                  onClick={handleAsignar}
                  loading={formLoading}
                  disabled={!mecanicoId}
                >
                  {selected.mecanico
                    ? 'Cambiar'
                    : 'Asignar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para eliminar */}
      <Modal
        isOpen={modal === 'delete'}
        onClose={closeModal}
        title="Eliminar Orden"
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
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
          ¿Estás seguro de que deseas
          eliminar la orden{' '}
          <strong>{selected?.numero}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </Modal>

      {/* Confirmación para cancelar nueva orden */}
      <ConfirmDialog
        isOpen={showCancelCreateConfirm}
        title="Cancelar nueva orden"
        message="¿Está seguro de que desea cancelar la acción? Se perderán los datos ingresados."
        confirmText="Sí, cancelar"
        cancelText="Continuar editando"
        variant="danger"
        onConfirm={
          confirmarCancelacionCreate
        }
        onCancel={
          continuarCreandoOrden
        }
      />
    </Layout>
  );
}