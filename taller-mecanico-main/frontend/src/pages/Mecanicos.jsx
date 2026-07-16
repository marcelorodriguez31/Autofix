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
  getMecanicos,
  createMecanico,
  updateMecanico,
  deleteMecanico,
} from '../api/mecanicos';

import {
  validarRut,
  formatearRut,
  validarNombreCompleto,
  formatearNombre,
} from '../utils/validators';

import {
  formularioTieneDatos,
  formularioTieneCambios,
} from '../utils/formUtils';

const EMPTY = {
  rut: '',
  nombre: '',
  especialidad: '',
  disponible: true,
};

const ESPECIALIDADES = [
  'Mecánico automotriz general',
  'Mecánico de motores',
  'Mecánico diésel',
  'Mecánico de motocicletas',
  'Mecánico de maquinaria pesada',
  'Mecánico de camiones y buses',
  'Mecánico de transmisión y cajas de cambio',
  'Mecánico de frenos',
  'Mecánico de suspensión y dirección',
  'Mecánico de sistemas de escape',
  'Mecánico de inyección electrónica',
  'Mecánico electricista automotriz',
  'Técnico en diagnóstico automotriz',
  'Técnico en aire acondicionado automotriz',
  'Técnico en alineación y balanceo',
  'Técnico en neumáticos o vulcanizador',
  'Desabollador de vehículos',
  'Pintor automotriz',
  'Soldador automotriz',
  'Técnico en carrocería',
  'Mecánico de sistemas hidráulicos',
  'Mecánico de sistemas neumáticos',
  'Mecánico de maquinaria agrícola',
  'Mecánico de vehículos eléctricos',
  'Mecánico de vehículos híbridos',
  'Técnico en instalación de accesorios automotrices',
  'Técnico en alarmas y sistemas de seguridad',
  'Técnico en sistemas de audio para vehículos',
  'Técnico en revisión técnica y emisiones',
  'Restaurador de vehículos clásicos',
];

export default function Mecanicos() {
  const [mecanicos, setMecanicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState(EMPTY);
  const [initialForm, setInitialForm] = useState(EMPTY);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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

    return getMecanicos()
      .then(setMecanicos)
      .catch((err) => {
        setError(
          err.message ||
            'No fue posible cargar los mecánicos.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = mecanicos.filter((mecanico) => {
    const consulta = search
      .trim()
      .toLowerCase();

    return (
      mecanico.nombre
        ?.toLowerCase()
        .includes(consulta) ||
      mecanico.rut
        ?.toLowerCase()
        .includes(consulta) ||
      mecanico.especialidad
        ?.toLowerCase()
        .includes(consulta)
    );
  });

  const openCreate = () => {
    setSelected(null);
    setForm(EMPTY);
    setInitialForm(EMPTY);
    setFormError('');
    setFieldErrors({});
    setShowCancelConfirm(false);
    setModal('create');
  };

  const openEdit = (mecanico) => {
    const datosFormulario = {
      rut: mecanico.rut ?? '',
      nombre: mecanico.nombre ?? '',
      especialidad:
        mecanico.especialidad ?? '',
      disponible:
        mecanico.disponible ?? true,
    };

    setSelected(mecanico);
    setForm(datosFormulario);
    setInitialForm(datosFormulario);
    setFormError('');
    setFieldErrors({});
    setShowCancelConfirm(false);
    setModal('edit');
  };

  const openDelete = (mecanico) => {
    setSelected(mecanico);
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

  const handleFormChange = (field) => (event) => {
    let value = event.target.value;

    if (field === 'rut') {
      value = formatearRut(value);
    }

    if (field === 'disponible') {
      value = value === 'true';
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

  const validarFormulario = () => {
    const errores = {};

    if (!form.rut.trim()) {
      errores.rut =
        'El RUT es obligatorio.';
    } else if (!validarRut(form.rut)) {
      errores.rut =
        'El RUT ingresado no es válido.';
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

    if (!form.especialidad) {
      errores.especialidad =
        'Debe seleccionar una especialidad.';
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
      rut: formatearRut(form.rut),
      nombre: formatearNombre(form.nombre),
      disponible:
        form.disponible === true ||
        form.disponible === 'true',
    };

    try {
      if (editando) {
        await updateMecanico(
          selected.id,
          payload
        );
      } else {
        await createMecanico(payload);
      }

      await load();

      close();

      setFeedback({
        type: 'success',
        message: editando
          ? 'Mecánico actualizado correctamente.'
          : 'Mecánico guardado correctamente.',
      });
    } catch (err) {
      setFormError(
        err.message ||
          'No fue posible guardar el mecánico.'
      );

      setFeedback({
        type: 'error',
        message:
          err.message ||
          'No fue posible guardar el mecánico.',
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
      await deleteMecanico(selected.id);

      await load();

      close();

      setFeedback({
        type: 'success',
        message:
          'Mecánico eliminado correctamente.',
      });
    } catch (err) {
      setFormError(
        err.message ||
          'No fue posible eliminar el mecánico.'
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
          rut: form.rut,
          nombre: form.nombre,
          especialidad:
            form.especialidad,
        }) ||
        form.disponible !== true;
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
      key: 'especialidad',
      header: 'Especialidad',
      render: (mecanico) =>
        mecanico.especialidad || '—',
    },
    {
      key: 'disponible',
      header: 'Estado',
      render: (mecanico) => (
        <Badge
          status={
            mecanico.disponible
              ? 'DISPONIBLE'
              : 'NO_DISPONIBLE'
          }
        />
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (mecanico) => (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() =>
              openEdit(mecanico)
            }
            title="Editar mecánico"
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
              openDelete(mecanico)
            }
            title="Eliminar mecánico"
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
    <Layout title="Mecánicos">
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

      <div className="flex items-center justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre, RUT o especialidad…"
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

          Nuevo Mecánico
        </Button>
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No hay mecánicos registrados."
      />

      <Modal
        isOpen={
          modal === 'create' ||
          modal === 'edit'
        }
        onClose={handleCancel}
        title={
          modal === 'create'
            ? 'Nuevo Mecánico'
            : 'Editar Mecánico'
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
              form="mec-form"
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
          id="mec-form"
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
            placeholder="Juan Pérez Tapia"
            error={fieldErrors.nombre}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Especialidad{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              value={form.especialidad}
              onChange={handleFormChange(
                'especialidad'
              )}
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.especialidad
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300'
              }`}
            >
              <option value="">
                Seleccionar especialidad…
              </option>

              {ESPECIALIDADES.map(
                (especialidad) => (
                  <option
                    key={especialidad}
                    value={especialidad}
                  >
                    {especialidad}
                  </option>
                )
              )}
            </select>

            {fieldErrors.especialidad && (
              <p className="text-xs text-red-600">
                {fieldErrors.especialidad}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Disponibilidad
            </label>

            <select
              value={String(form.disponible)}
              onChange={handleFormChange(
                'disponible'
              )}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">
                Disponible
              </option>

              <option value="false">
                No disponible
              </option>
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modal === 'delete'}
        onClose={close}
        title="Eliminar Mecánico"
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
          ¿Eliminar al mecánico{' '}
          <strong>
            {selected?.nombre}
          </strong>
          ? Esta acción no se puede deshacer.
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