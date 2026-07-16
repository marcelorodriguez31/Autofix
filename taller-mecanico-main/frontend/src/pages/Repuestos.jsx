import { useEffect, useState } from 'react';

import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

import FeedbackMessage from '../components/common/FeedbackMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';

import {
  getRepuestos,
  createRepuesto,
  updateRepuesto,
  aumentarStock,
  disminuirStock,
  deleteRepuesto,
} from '../api/repuestos';

import {
  formularioTieneDatos,
  formularioTieneCambios,
} from '../utils/formUtils';

const EMPTY = {
  codigo: '',
  nombre: '',
  stock: '',
  precioUnitario: '',
};

export default function Repuestos() {
  const [repuestos, setRepuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState(EMPTY);
  const [initialForm, setInitialForm] =
    useState(EMPTY);

  const [cantidad, setCantidad] = useState('');

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

    return getRepuestos()
      .then(setRepuestos)
      .catch((err) => {
        setError(
          err.message ||
            'No fue posible cargar los repuestos.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = repuestos.filter(
    (repuesto) => {
      const consulta = search
        .trim()
        .toLowerCase();

      return (
        repuesto.nombre
          ?.toLowerCase()
          .includes(consulta) ||
        repuesto.codigo
          ?.toLowerCase()
          .includes(consulta)
      );
    }
  );

  const openCreate = () => {
    setSelected(null);
    setForm(EMPTY);
    setInitialForm(EMPTY);
    setFormError('');
    setFieldErrors({});
    setShowCancelConfirm(false);
    setModal('create');
  };

  const openEdit = (repuesto) => {
    const datosFormulario = {
      codigo: repuesto.codigo ?? '',
      nombre: repuesto.nombre ?? '',
      stock: repuesto.stock ?? '',
      precioUnitario:
        repuesto.precioUnitario ?? '',
    };

    setSelected(repuesto);
    setForm(datosFormulario);
    setInitialForm(datosFormulario);
    setFormError('');
    setFieldErrors({});
    setShowCancelConfirm(false);
    setModal('edit');
  };

  const openStock = (repuesto, tipo) => {
    setSelected(repuesto);
    setCantidad('');
    setFormError('');
    setModal(tipo);
  };

  const openDelete = (repuesto) => {
    setSelected(repuesto);
    setFormError('');
    setModal('delete');
  };

  const close = () => {
    setModal(null);
    setSelected(null);
    setForm(EMPTY);
    setInitialForm(EMPTY);
    setCantidad('');
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

    if (!form.nombre.trim()) {
      errores.nombre =
        'El nombre del repuesto es obligatorio.';
    }

    if (
      form.stock === '' ||
      form.stock === null ||
      form.stock === undefined
    ) {
      errores.stock =
        'El stock inicial es obligatorio.';
    } else if (Number(form.stock) < 0) {
      errores.stock =
        'El stock no puede ser negativo.';
    }

    if (
      form.precioUnitario === '' ||
      form.precioUnitario === null ||
      form.precioUnitario === undefined
    ) {
      errores.precioUnitario =
        'El precio unitario es obligatorio.';
    } else if (
      Number(form.precioUnitario) < 0
    ) {
      errores.precioUnitario =
        'El precio no puede ser negativo.';
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
      nombre: form.nombre.trim(),
      stock: Number(form.stock),
      precioUnitario: Number(
        form.precioUnitario
      ),
    };

    try {
      if (editando) {
        await updateRepuesto(
          selected.id,
          payload
        );
      } else {
        /*
         * No enviamos código.
         * El backend debe generarlo al guardar.
         */
        await createRepuesto(payload);
      }

      await load();

      close();

      setFeedback({
        type: 'success',
        message: editando
          ? 'Repuesto actualizado correctamente.'
          : 'Repuesto guardado correctamente.',
      });
    } catch (err) {
      const mensaje =
        err.message ||
        'No fue posible guardar el repuesto.';

      setFormError(mensaje);

      setFeedback({
        type: 'error',
        message: mensaje,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    let tieneCambios = false;

    if (modal === 'create') {
      tieneCambios =
        formularioTieneDatos({
          nombre: form.nombre,
          stock: form.stock,
          precioUnitario:
            form.precioUnitario,
        });
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

  const handleStock = async () => {
    const cantidadNumerica =
      Number(cantidad);

    if (
      !cantidad ||
      cantidadNumerica <= 0 ||
      !Number.isInteger(cantidadNumerica)
    ) {
      setFormError(
        'Ingresa una cantidad entera mayor que cero.'
      );
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      if (modal === 'aumentar') {
        await aumentarStock(
          selected.id,
          cantidadNumerica
        );
      } else {
        await disminuirStock(
          selected.id,
          cantidadNumerica
        );
      }

      await load();

      const accion =
        modal === 'aumentar'
          ? 'aumentado'
          : 'disminuido';

      close();

      setFeedback({
        type: 'success',
        message: `Stock ${accion} correctamente.`,
      });
    } catch (err) {
      setFormError(
        err.message ||
          'No fue posible modificar el stock.'
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
      await deleteRepuesto(selected.id);

      await load();

      close();

      setFeedback({
        type: 'success',
        message:
          'Repuesto eliminado correctamente.',
      });
    } catch (err) {
      setFormError(
        err.message ||
          'No fue posible eliminar el repuesto.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      key: 'codigo',
      header: 'Código',
    },
    {
      key: 'nombre',
      header: 'Nombre',
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (repuesto) => (
        <span
          className={`font-semibold ${
            repuesto.stock <= 5
              ? 'text-red-600'
              : repuesto.stock <= 15
                ? 'text-yellow-600'
                : 'text-green-600'
          }`}
        >
          {repuesto.stock}
        </span>
      ),
    },
    {
      key: 'precioUnitario',
      header: 'Precio Unit.',
      render: (repuesto) =>
        `$${Number(
          repuesto.precioUnitario
        ).toLocaleString('es-CL')}`,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (repuesto) => (
        <div className="flex gap-1 flex-wrap">
          <button
            type="button"
            onClick={() =>
              openStock(
                repuesto,
                'aumentar'
              )
            }
            title="Aumentar stock"
            className="px-2 py-1 rounded text-xs bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors"
          >
            +Stock
          </button>

          <button
            type="button"
            onClick={() =>
              openStock(
                repuesto,
                'disminuir'
              )
            }
            title="Disminuir stock"
            className="px-2 py-1 rounded text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100 font-medium transition-colors"
          >
            -Stock
          </button>

          <button
            type="button"
            onClick={() =>
              openEdit(repuesto)
            }
            title="Editar repuesto"
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
              openDelete(repuesto)
            }
            title="Eliminar repuesto"
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
    <Layout title="Repuestos">
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
          placeholder="Buscar por nombre o código…"
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

          Nuevo Repuesto
        </Button>
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No hay repuestos registrados."
      />

      {/* Crear o editar repuesto */}
      <Modal
        isOpen={
          modal === 'create' ||
          modal === 'edit'
        }
        onClose={handleCancelForm}
        title={
          modal === 'create'
            ? 'Nuevo Repuesto'
            : 'Editar Repuesto'
        }
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelForm}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              form="rep-form"
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
          id="rep-form"
          onSubmit={handleSave}
          className="space-y-3"
        >
          {modal === 'create' ? (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Código
              </label>

              <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500">
                Se asignará automáticamente al guardar
              </div>

              <p className="text-xs text-slate-400">
                El correlativo solo se ocupará si el repuesto se guarda correctamente.
              </p>
            </div>
          ) : (
            <Input
              label="Código"
              id="codigo"
              value={form.codigo}
              disabled
            />
          )}

          <Input
            label="Nombre"
            id="nombre"
            value={form.nombre}
            onChange={handleFormChange(
              'nombre'
            )}
            required
            placeholder="Ej: Filtro de aceite"
            error={fieldErrors.nombre}
          />

          <Input
            label="Stock inicial"
            id="stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={handleFormChange(
              'stock'
            )}
            required
            error={fieldErrors.stock}
          />

          <Input
            label="Precio unitario ($)"
            id="precio"
            type="number"
            min="0"
            step="1"
            value={form.precioUnitario}
            onChange={handleFormChange(
              'precioUnitario'
            )}
            required
            error={
              fieldErrors.precioUnitario
            }
          />
        </form>
      </Modal>

      {/* Modificar stock */}
      <Modal
        isOpen={
          modal === 'aumentar' ||
          modal === 'disminuir'
        }
        onClose={close}
        title={
          modal === 'aumentar'
            ? `Aumentar stock — ${selected?.nombre ?? ''}`
            : `Disminuir stock — ${selected?.nombre ?? ''}`
        }
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
              onClick={handleStock}
              loading={formLoading}
            >
              {modal === 'aumentar'
                ? 'Aumentar'
                : 'Disminuir'}
            </Button>
          </>
        }
      >
        {formError && (
          <p className="mb-3 text-sm text-red-600">
            {formError}
          </p>
        )}

        <p className="text-sm text-slate-500 mb-3">
          Stock actual:{' '}
          <strong>
            {selected?.stock}
          </strong>
        </p>

        <Input
          label="Cantidad"
          id="cantidad"
          type="number"
          min="1"
          step="1"
          value={cantidad}
          onChange={(event) => {
            setCantidad(event.target.value);
            setFormError('');
          }}
          required
        />
      </Modal>

      {/* Eliminar repuesto */}
      <Modal
        isOpen={modal === 'delete'}
        onClose={close}
        title="Eliminar Repuesto"
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
          ¿Eliminar el repuesto{' '}
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