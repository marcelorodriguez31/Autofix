import { useEffect, useState } from 'react';

import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

import FeedbackMessage from '../components/common/FeedbackMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';

import {
  getReservas,
  createReserva,
} from '../api/reservas';

import {
  getClientes,
  getVehiculosByCliente,
} from '../api/clientes';

import {
  formularioTieneDatos,
} from '../utils/formUtils';

const ESTADOS_RESERVA = [
  'PENDIENTE',
  'CONFIRMADA',
  'CANCELADA',
];

const EMPTY_FORM = {
  fecha: '',
  hora: '',
  motivo: '',
  estado: 'PENDIENTE',
  clienteId: '',
  vehiculoId: '',
};

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [
    vehiculosCliente,
    setVehiculosCliente,
  ] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] =
    useState(false);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [formLoading, setFormLoading] =
    useState(false);

  const [formError, setFormError] =
    useState('');

  const [fieldErrors, setFieldErrors] =
    useState({});

  const [vehLoading, setVehLoading] =
    useState(false);

  const [clienteSearch, setClienteSearch] =
    useState('');

  const [vehiculoSearch, setVehiculoSearch] =
    useState('');

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
      getReservas(),
      getClientes(),
    ])
      .then(([reservasData, clientesData]) => {
        setReservas(reservasData);
        setClientes(clientesData);
      })
      .catch((err) => {
        setError(
          err.message ||
            'No fue posible cargar las reservas.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const clientesFiltrados = clientes.filter(
    (cliente) => {
      const consulta = clienteSearch
        .trim()
        .toLowerCase();

      if (!consulta) {
        return true;
      }

      const textoCliente = [
        cliente.nombre,
        cliente.rut,
        cliente.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return textoCliente.includes(consulta);
    }
  );

  const vehiculosFiltrados =
    vehiculosCliente.filter((vehiculo) => {
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
    });

  const openModal = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setFieldErrors({});
    setVehiculosCliente([]);
    setClienteSearch('');
    setVehiculoSearch('');
    setShowCancelConfirm(false);
    setShowModal(true);
  };

  const cerrarModalDirectamente = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setFormError('');
    setFieldErrors({});
    setVehiculosCliente([]);
    setClienteSearch('');
    setVehiculoSearch('');
    setShowCancelConfirm(false);
  };

  const handleCancel = () => {
    const tieneDatos =
      formularioTieneDatos({
        fecha: form.fecha,
        hora: form.hora,
        motivo: form.motivo,
        clienteId: form.clienteId,
        vehiculoId: form.vehiculoId,
      });

    const estadoFueModificado =
      form.estado !== 'PENDIENTE';

    if (tieneDatos || estadoFueModificado) {
      setShowCancelConfirm(true);
      return;
    }

    cerrarModalDirectamente();
  };

  const confirmarCancelacion = () => {
    setShowCancelConfirm(false);
    cerrarModalDirectamente();
  };

  const continuarEditando = () => {
    setShowCancelConfirm(false);
  };

  const handleClienteChange = async (
    clienteId
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      clienteId,
      vehiculoId: '',
    }));

    setVehiculoSearch('');
    setVehiculosCliente([]);

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      clienteId: '',
      vehiculoId: '',
    }));

    if (!clienteId) {
      return;
    }

    setVehLoading(true);
    setFormError('');

    try {
      const vehiculos =
        await getVehiculosByCliente(
          clienteId
        );

      setVehiculosCliente(vehiculos);
    } catch (err) {
      setVehiculosCliente([]);

      setFormError(
        err.message ||
          'No fue posible cargar los vehículos del cliente.'
      );
    } finally {
      setVehLoading(false);
    }
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

    if (!form.fecha) {
      errores.fecha =
        'La fecha es obligatoria.';
    }

    if (!form.hora) {
      errores.hora =
        'La hora es obligatoria.';
    }

    if (!form.clienteId) {
      errores.clienteId =
        'Debe seleccionar un cliente.';
    }

    if (!form.vehiculoId) {
      errores.vehiculoId =
        'Debe seleccionar un vehículo.';
    }

    setFieldErrors(errores);

    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const hora =
        form.hora.length === 5
          ? `${form.hora}:00`
          : form.hora;

      await createReserva({
        fecha: form.fecha,
        hora,
        motivo: form.motivo.trim(),
        estado: form.estado,
        clienteId: Number(form.clienteId),
        vehiculoId: Number(
          form.vehiculoId
        ),
      });

      await load();

      cerrarModalDirectamente();

      setFeedback({
        type: 'success',
        message:
          'Reserva creada correctamente.',
      });
    } catch (err) {
      const mensaje =
        err.message ||
        'No fue posible crear la reserva.';

      setFormError(mensaje);

      setFeedback({
        type: 'error',
        message: mensaje,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      key: 'fecha',
      header: 'Fecha',
    },
    {
      key: 'hora',
      header: 'Hora',
      render: (reserva) =>
        reserva.hora?.slice(0, 5) ?? '—',
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (reserva) =>
        reserva.cliente?.nombre ?? '—',
    },
    {
      key: 'vehiculo',
      header: 'Vehículo',
      render: (reserva) =>
        reserva.vehiculo
          ? `${reserva.vehiculo.patente} – ${reserva.vehiculo.marca} ${reserva.vehiculo.modelo ?? ''}`
          : '—',
    },
    {
      key: 'motivo',
      header: 'Motivo',
      render: (reserva) =>
        reserva.motivo || '—',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (reserva) => (
        <Badge status={reserva.estado} />
      ),
    },
  ];

  return (
    <Layout title="Reservas">
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

      <div className="flex justify-end mb-4">
        <Button
          type="button"
          onClick={openModal}
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

          Nueva Reserva
        </Button>
      </div>

      <Table
        columns={columns}
        data={reservas}
        loading={loading}
        emptyMessage="No hay reservas registradas."
      />

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title="Nueva Reserva"
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
              form="reserva-form"
              loading={formLoading}
            >
              Agendar
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
          id="reserva-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha"
              id="fecha"
              type="date"
              value={form.fecha}
              onChange={handleFormChange(
                'fecha'
              )}
              required
              error={fieldErrors.fecha}
            />

            <Input
              label="Hora"
              id="hora"
              type="time"
              value={form.hora}
              onChange={handleFormChange(
                'hora'
              )}
              required
              error={fieldErrors.hora}
            />
          </div>

          {/* Buscar y seleccionar cliente */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Cliente{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              value={clienteSearch}
              onChange={(event) =>
                setClienteSearch(
                  event.target.value
                )
              }
              placeholder="Buscar por nombre, RUT o email..."
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              required
              value={form.clienteId}
              onChange={(event) =>
                handleClienteChange(
                  event.target.value
                )
              }
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.clienteId
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300'
              }`}
            >
              <option value="">
                Seleccionar cliente…
              </option>

              {clientesFiltrados.map(
                (cliente) => (
                  <option
                    key={cliente.id}
                    value={cliente.id}
                  >
                    {cliente.nombre} (
                    {cliente.rut})
                  </option>
                )
              )}
            </select>

            {clienteSearch &&
              clientesFiltrados.length ===
                0 && (
                <p className="text-xs text-red-600">
                  No se encontraron clientes.
                </p>
              )}

            {fieldErrors.clienteId && (
              <p className="text-xs text-red-600">
                {fieldErrors.clienteId}
              </p>
            )}
          </div>

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
              disabled={
                !form.clienteId ||
                vehLoading
              }
              placeholder={
                form.clienteId
                  ? 'Buscar por patente, marca o modelo...'
                  : 'Seleccione primero un cliente'
              }
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
            />

            <select
              required
              value={form.vehiculoId}
              onChange={handleFormChange(
                'vehiculoId'
              )}
              disabled={
                !form.clienteId ||
                vehLoading
              }
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 ${
                fieldErrors.vehiculoId
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300'
              }`}
            >
              <option value="">
                {vehLoading
                  ? 'Cargando vehículos…'
                  : !form.clienteId
                    ? 'Seleccione primero un cliente'
                    : 'Seleccionar vehículo…'}
              </option>

              {vehiculosFiltrados.map(
                (vehiculo) => (
                  <option
                    key={vehiculo.id}
                    value={vehiculo.id}
                  >
                    {vehiculo.patente} –{' '}
                    {vehiculo.marca}{' '}
                    {vehiculo.modelo}
                  </option>
                )
              )}
            </select>

            {form.clienteId &&
              !vehLoading &&
              vehiculosCliente.length ===
                0 && (
                <p className="text-xs text-amber-600">
                  El cliente seleccionado no
                  tiene vehículos registrados.
                </p>
              )}

            {vehiculoSearch &&
              vehiculosFiltrados.length ===
                0 &&
              vehiculosCliente.length > 0 && (
                <p className="text-xs text-red-600">
                  No se encontraron vehículos
                  con esa búsqueda.
                </p>
              )}

            {fieldErrors.vehiculoId && (
              <p className="text-xs text-red-600">
                {fieldErrors.vehiculoId}
              </p>
            )}
          </div>

          <Input
            label="Motivo"
            id="motivo"
            value={form.motivo}
            onChange={handleFormChange(
              'motivo'
            )}
            placeholder="Ej: Revisión de frenos, cambio de aceite…"
          />

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
              {ESTADOS_RESERVA.map(
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

      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Cancelar reserva"
        message="¿Está seguro de que desea cancelar la acción? Se perderán los datos ingresados."
        confirmText="Sí, cancelar"
        cancelText="Continuar editando"
        variant="danger"
        onConfirm={confirmarCancelacion}
        onCancel={continuarEditando}
      />
    </Layout>
  );
}