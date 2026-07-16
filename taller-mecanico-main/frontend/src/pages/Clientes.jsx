import { useEffect, useState } from 'react';

import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import FeedbackMessage from '../components/common/FeedbackMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';

import {
  formularioTieneCambios,
  formularioTieneDatos,
} from '../utils/formUtils';

import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  getVehiculosByCliente,
  createVehiculoForCliente,
} from '../api/clientes';

import {
  updateVehiculo,
  deleteVehiculo,
} from '../api/vehiculos';

import {
  validarRut,
  formatearRut,
  validarNombreCompleto,
  formatearNombre,
  validarTelefonoChile,
  normalizarTelefonoChile,
  validarEmail,
} from '../utils/validators';

const EMPTY_FORM = {
  rut: '',
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
};

const EMPTY_VEH = {
  patente: '',
  marca: '',
  modelo: '',
  anio: '',
  kilometraje: '',
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [vehiculos, setVehiculos] = useState([]);
  const [vehLoading, setVehLoading] = useState(false);

  const [vehForm, setVehForm] = useState(EMPTY_VEH);
  const [vehFormVisible, setVehFormVisible] = useState(false);
  const [vehFormLoading, setVehFormLoading] = useState(false);
  const [vehFormError, setVehFormError] = useState('');
  const [initialClientForm, setInitialClientForm] =
    useState(EMPTY_FORM);

  const [showCancelClientConfirm, setShowCancelClientConfirm] =
    useState(false);

  const [clientFeedback, setClientFeedback] = useState({
    type: '',
    message: '',
  });

  const [vehiculoEditando, setVehiculoEditando] =
    useState(null);

  const [vehiculoEliminando, setVehiculoEliminando] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState('');

  const load = () => {
      setLoading(true);
      setError('');

      return getClientes()
        .then(setClientes)
        .catch((e) => {
          setError(e.message);
          throw e;
        })
        .finally(() => setLoading(false));
    };

  useEffect(() => {
    load();
  }, []);

  const filtered = clientes.filter((cliente) => {
    const consulta = search.toLowerCase();

    return (
      cliente.nombre?.toLowerCase().includes(consulta) ||
      cliente.rut?.toLowerCase().includes(consulta) ||
      cliente.email?.toLowerCase().includes(consulta)
    );
  });

  const openCreate = () => {
      setForm(EMPTY_FORM);
      setInitialClientForm(EMPTY_FORM);
      setSelected(null);
      setFormError('');
      setFieldErrors({});
      setShowCancelClientConfirm(false);
      setModal('create');
    };

  const openEdit = (cliente) => {
      const clienteForm = {
        rut: cliente.rut ?? '',
        nombre: cliente.nombre ?? '',
        telefono: cliente.telefono ?? '',
        email: cliente.email ?? '',
        direccion: cliente.direccion ?? '',
      };

      setSelected(cliente);
      setForm(clienteForm);
      setInitialClientForm(clienteForm);
      setFormError('');
      setFieldErrors({});
      setShowCancelClientConfirm(false);
      setModal('edit');
    };

  const openDelete = (cliente) => {
    setSelected(cliente);
    setFormError('');
    setModal('delete');
  };

  const openVehiculos = async (cliente) => {
    setSelected(cliente);

    setVehiculos([]);
    setVehForm(EMPTY_VEH);
    setVehFormVisible(false);
    setVehiculoEditando(null);
    setVehiculoEliminando(null);
    setVehFormError('');
    setSuccessMessage('');

    setModal('vehiculos');
    setVehLoading(true);

    try {
      const data = await getVehiculosByCliente(
        cliente.id
      );

      setVehiculos(data);
    } catch (err) {
      setVehFormError(err.message);
    } finally {
      setVehLoading(false);
    }
  };

  const closeModal = () => {
      setModal(null);
      setSelected(null);

      setForm(EMPTY_FORM);
      setInitialClientForm(EMPTY_FORM);
      setFormError('');
      setFieldErrors({});
      setShowCancelClientConfirm(false);

      setVehiculos([]);
      setVehForm(EMPTY_VEH);
      setVehFormVisible(false);
      setVehiculoEditando(null);
      setVehiculoEliminando(null);
      setVehFormError('');
      setSuccessMessage('');
    };

  const recargarVehiculos = async () => {
    if (!selected?.id) {
      return;
    }

    const updated = await getVehiculosByCliente(
      selected.id
    );

    setVehiculos(updated);
  };

  const handleFormChange = (field) => (event) => {
    let value = event.target.value;

    if (field === 'rut') {
      value = formatearRut(value);
    }

    if (field === 'telefono') {
      value = normalizarTelefonoChile(value);
    }

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

  const validarFormularioCliente = () => {
    const errores = {};

    if (!form.rut.trim()) {
      errores.rut = 'El RUT es obligatorio.';
    } else if (!validarRut(form.rut)) {
      errores.rut = 'El RUT ingresado no es válido.';
    }

    if (!form.nombre.trim()) {
      errores.nombre =
        'El nombre completo es obligatorio.';
    } else if (
      !validarNombreCompleto(form.nombre)
    ) {
      errores.nombre =
        'Ingrese al menos un nombre y un apellido válidos.';
    }

    if (
      form.telefono &&
      !validarTelefonoChile(form.telefono)
    ) {
      errores.telefono =
        'El teléfono debe tener el formato +56912345678.';
    }

    if (!form.email.trim()) {
      errores.email =
        'El correo electrónico es obligatorio.';
    } else if (!validarEmail(form.email)) {
      errores.email =
        'Ingrese un correo válido, por ejemplo usuario@correo.cl.';
    }

    setFieldErrors(errores);

    return Object.keys(errores).length === 0;
  };

  const handleCancelCliente = () => {
      let hayCambios = false;

      if (modal === 'edit') {
        hayCambios = formularioTieneCambios(
          initialClientForm,
          form
        );
      }

      if (modal === 'create') {
        hayCambios = formularioTieneDatos(form);
      }

      if (hayCambios) {
        setShowCancelClientConfirm(true);
        return;
      }

      closeModal();
    };

    const confirmarCancelacionCliente = () => {
      setShowCancelClientConfirm(false);
      closeModal();
    };

    const continuarEditandoCliente = () => {
      setShowCancelClientConfirm(false);
    };

  const handleSave = async (event) => {
      event.preventDefault();

      if (!validarFormularioCliente()) {
        return;
      }

      setFormLoading(true);
      setFormError('');

      const editando = modal === 'edit';

      const payload = {
        ...form,
        rut: formatearRut(form.rut),
        nombre: formatearNombre(form.nombre),
        telefono: form.telefono.trim(),
        email: form.email.trim().toLowerCase(),
        direccion: form.direccion.trim(),
      };

      try {
        if (editando) {
          await updateCliente(selected.id, payload);
        } else {
          await createCliente(payload);
        }

        await load();

        closeModal();

        setClientFeedback({
          type: 'success',
          message: editando
            ? 'Cliente actualizado correctamente.'
            : 'Cliente guardado correctamente.',
        });
      } catch (err) {
        setFormError(
          err.message ||
            'No fue posible guardar el cliente.'
        );
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
      await deleteCliente(selected.id);

      load();
      closeModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleVehFormChange =
    (field) => (event) => {
      const value = event.target.value;

      setVehForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }));

      setVehFormError('');
    };

  const openNuevoVehiculo = () => {
    setVehForm(EMPTY_VEH);
    setVehiculoEditando(null);
    setVehFormError('');
    setSuccessMessage('');
    setVehFormVisible(true);
  };

  const openEditVehiculo = (vehiculo) => {
    setVehiculoEditando(vehiculo);

    setVehForm({
      patente: vehiculo.patente ?? '',
      marca: vehiculo.marca ?? '',
      modelo: vehiculo.modelo ?? '',
      anio: vehiculo.anio ?? '',
      kilometraje: vehiculo.kilometraje ?? '',
    });

    setVehFormVisible(true);
    setVehFormError('');
    setSuccessMessage('');
  };

  const cancelarFormularioVehiculo = () => {
    const tieneDatos =
      String(vehForm.patente ?? '').trim() !== '' ||
      String(vehForm.marca ?? '').trim() !== '' ||
      String(vehForm.modelo ?? '').trim() !== '' ||
      String(vehForm.anio ?? '').trim() !== '' ||
      String(
        vehForm.kilometraje ?? ''
      ).trim() !== '';

    if (tieneDatos) {
      const confirmarCancelacion = window.confirm(
        '¿Está seguro de que desea cancelar la acción? Se perderán los cambios.'
      );

      if (!confirmarCancelacion) {
        return;
      }
    }

    setVehForm(EMPTY_VEH);
    setVehFormVisible(false);
    setVehiculoEditando(null);
    setVehFormError('');
    setSuccessMessage('');
  };

  const handleSaveVehiculo = async (event) => {
    event.preventDefault();

    setVehFormLoading(true);
    setVehFormError('');
    setSuccessMessage('');

    try {
      const payload = {
        patente: vehForm.patente
          .trim()
          .toUpperCase(),
        marca: vehForm.marca.trim(),
        modelo: vehForm.modelo.trim(),
        anio: Number(vehForm.anio),
        kilometraje: Number(
          vehForm.kilometraje
        ),
      };

      if (vehiculoEditando) {
        await updateVehiculo(
          vehiculoEditando.id,
          payload
        );

        setSuccessMessage(
          'Vehículo actualizado correctamente.'
        );
      } else {
        await createVehiculoForCliente(
          selected.id,
          payload
        );

        setSuccessMessage(
          'Vehículo guardado correctamente.'
        );
      }

      await recargarVehiculos();

      setVehForm(EMPTY_VEH);
      setVehFormVisible(false);
      setVehiculoEditando(null);
    } catch (err) {
      setVehFormError(err.message);
    } finally {
      setVehFormLoading(false);
    }
  };

  const handleDeleteVehiculo = async () => {
    if (!vehiculoEliminando?.id) {
      return;
    }

    setVehFormLoading(true);
    setVehFormError('');
    setSuccessMessage('');

    try {
      await deleteVehiculo(
        vehiculoEliminando.id
      );

      setVehiculoEliminando(null);

      await recargarVehiculos();

      setSuccessMessage(
        'Vehículo eliminado correctamente.'
      );
    } catch (err) {
      setVehiculoEliminando(null);

      setVehFormError(
        err.message ||
          'No fue posible eliminar el vehículo.'
      );
    } finally {
      setVehFormLoading(false);
    }
  };

  const columns = [
    {
      key: 'rut',
      header: 'RUT',
    },
    {
      key: 'nombre',
      header: 'Nombre',
    },
    {
      key: 'telefono',
      header: 'Teléfono',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'direccion',
      header: 'Dirección',
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (cliente) => (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() =>
              openVehiculos(cliente)
            }
            title="Ver vehículos"
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
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h8zM13 16h2l4-4-1-5h-5v9z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => openEdit(cliente)}
            title="Editar"
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
              openDelete(cliente)
            }
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

  const vehColumns = [
    {
      key: 'patente',
      header: 'Patente',
    },
    {
      key: 'marca',
      header: 'Marca',
    },
    {
      key: 'modelo',
      header: 'Modelo',
    },
    {
      key: 'anio',
      header: 'Año',
    },
    {
      key: 'kilometraje',
      header: 'Kilometraje',
      render: (vehiculo) =>
        vehiculo.kilometraje != null
          ? `${vehiculo.kilometraje.toLocaleString(
              'es-CL'
            )} km`
          : '—',
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (vehiculo) => (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() =>
              openEditVehiculo(vehiculo)
            }
            title="Editar vehículo"
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
              setVehiculoEliminando(vehiculo)
            }
            title="Eliminar vehículo"
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
    <Layout title="Clientes">
            <FeedbackMessage
        type={clientFeedback.type}
        message={clientFeedback.message}
        onClose={() =>
          setClientFeedback({
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

      <div className="flex items-center justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre, RUT o email…"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="flex-1 max-w-sm px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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

          Nuevo Cliente
        </Button>
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No hay clientes registrados."
      />

      {/* Modal para crear o editar cliente */}
      <Modal
        isOpen={
          modal === 'create' ||
          modal === 'edit'
        }
        onClose={closeModal}
        title={
          modal === 'create'
            ? 'Nuevo Cliente'
            : 'Editar Cliente'
        }
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelCliente}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              form="cliente-form"
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
          id="cliente-form"
          onSubmit={handleSave}
          className="space-y-3"
        >
          <Input
            label="RUT"
            id="rut"
            value={form.rut}
            onChange={handleFormChange('rut')}
            required
            placeholder="12.345.678-5"
            error={fieldErrors.rut}
          />

          <Input
            label="Nombre completo"
            id="nombre"
            value={form.nombre}
            onChange={handleFormChange(
              'nombre'
            )}
            required
            placeholder="Juanito Pérez Tapia"
            error={fieldErrors.nombre}
          />

          <Input
            label="Teléfono móvil"
            id="telefono"
            value={form.telefono}
            onChange={handleFormChange(
              'telefono'
            )}
            placeholder="+56912345678"
            error={fieldErrors.telefono}
          />

          <Input
            label="Email"
            id="email"
            type="email"
            value={form.email}
            onChange={handleFormChange(
              'email'
            )}
            required
            placeholder="cliente@correo.cl"
            error={fieldErrors.email}
          />

          <Input
            label="Dirección"
            id="direccion"
            value={form.direccion}
            onChange={handleFormChange(
              'direccion'
            )}
            placeholder="Calle y número"
          />
        </form>
      </Modal>

      {/* Modal para eliminar cliente */}
      <Modal
        isOpen={modal === 'delete'}
        onClose={closeModal}
        title="Eliminar Cliente"
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelCliente}
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
          eliminar al cliente{' '}
          <strong>{selected?.nombre}</strong>?
          Esta acción también eliminará sus
          vehículos asociados.
        </p>
      </Modal>

      {/* Modal de vehículos */}
      <Modal
        isOpen={modal === 'vehiculos'}
        onClose={closeModal}
        title={`Vehículos de ${
          selected?.nombre ?? ''
        }`}
        size="lg"
      >
        {successMessage && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        {vehFormError && !vehFormVisible && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {vehFormError}
          </div>
        )}

        <Table
          columns={vehColumns}
          data={vehiculos}
          loading={vehLoading}
          emptyMessage="Este cliente no tiene vehículos."
        />

        <div className="mt-4">
          {!vehFormVisible ? (
            <Button
              type="button"
              variant="secondary"
              onClick={openNuevoVehiculo}
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

              Agregar Vehículo
            </Button>
          ) : (
            <div className="border border-slate-200 rounded-xl p-4 mt-2">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                {vehiculoEditando
                  ? 'Editar Vehículo'
                  : 'Nuevo Vehículo'}
              </h4>

              {vehFormError && (
                <p className="mb-3 text-sm text-red-600">
                  {vehFormError}
                </p>
              )}

              <form
                onSubmit={handleSaveVehiculo}
                className="grid grid-cols-2 gap-3"
              >
                <Input
                  label="Patente"
                  id="patente"
                  value={vehForm.patente}
                  onChange={handleVehFormChange(
                    'patente'
                  )}
                  required
                  placeholder="ABCD12"
                  disabled={Boolean(
                    vehiculoEditando
                  )}
                />

                <Input
                  label="Marca"
                  id="marca"
                  value={vehForm.marca}
                  onChange={handleVehFormChange(
                    'marca'
                  )}
                  required
                  placeholder="Toyota"
                />

                <Input
                  label="Modelo"
                  id="modelo"
                  value={vehForm.modelo}
                  onChange={handleVehFormChange(
                    'modelo'
                  )}
                  required
                  placeholder="Yaris"
                />

                <Input
                  label="Año"
                  id="anio"
                  type="number"
                  value={vehForm.anio}
                  onChange={handleVehFormChange(
                    'anio'
                  )}
                  required
                  placeholder="2020"
                />

                <Input
                  label="Kilometraje"
                  id="kilometraje"
                  type="number"
                  value={vehForm.kilometraje}
                  onChange={handleVehFormChange(
                    'kilometraje'
                  )}
                  required
                  placeholder="50000"
                />

                <div className="col-span-2 flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={
                      cancelarFormularioVehiculo
                    }
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    loading={vehFormLoading}
                  >
                    {vehiculoEditando
                      ? 'Actualizar'
                      : 'Guardar'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal para eliminar vehículo */}
      <Modal
        isOpen={Boolean(
          vehiculoEliminando
        )}
        onClose={() =>
          setVehiculoEliminando(null)
        }
        title="Eliminar Vehículo"
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setVehiculoEliminando(null)
              }
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteVehiculo}
              loading={vehFormLoading}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-slate-600 text-sm">
          ¿Estás seguro de que deseas
          eliminar el vehículo{' '}
          <strong>
            {vehiculoEliminando?.patente}
          </strong>
          ?
        </p>

        <p className="mt-2 text-xs text-red-600">
          Esta acción no se puede deshacer.
        </p>
      </Modal>
      <ConfirmDialog
      isOpen={showCancelClientConfirm}
      title="Cancelar edición"
      message="¿Está seguro de que desea cancelar la acción? Se perderán los cambios realizados."
      confirmText="Sí, cancelar"
      cancelText="Continuar editando"
      variant="danger"
      onConfirm={confirmarCancelacionCliente}
      onCancel={continuarEditandoCliente}
    />

    
    </Layout>
  );
}