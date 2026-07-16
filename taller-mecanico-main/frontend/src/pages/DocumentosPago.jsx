import { useEffect, useState } from 'react';

import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

import FeedbackMessage from '../components/common/FeedbackMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';

import {
  getDocumentos,
  createDocumento,
  deleteDocumento,
} from '../api/documentosPago';

import { getPresupuestos } from '../api/presupuestos';

import {
  formularioTieneDatos,
} from '../utils/formUtils';

const TIPOS = [
  'BOLETA',
  'FACTURA',
];

const EMPTY = {
  presupuestoId: '',
  tipoDocumento: 'BOLETA',
};

export default function DocumentosPago() {
  const [documentos, setDocumentos] =
    useState([]);

  const [presupuestos, setPresupuestos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

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

  const load = () => {
    setLoading(true);
    setError('');

    return Promise.all([
      getDocumentos(),
      getPresupuestos(),
    ])
      .then(
        ([
          documentosData,
          presupuestosData,
        ]) => {
          setDocumentos(documentosData);
          setPresupuestos(presupuestosData);
        }
      )
      .catch((err) => {
        setError(
          err.message ||
            'No fue posible cargar los documentos de pago.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const presupuestosAprobados =
    presupuestos.filter(
      (presupuesto) =>
        presupuesto.estadoAprobacion ===
        'APROBADO'
    );

  const presupuestoLabel = (id) => {
    const presupuesto =
      presupuestos.find(
        (item) =>
          item.id === id ||
          item.id === Number(id)
      );

    return presupuesto
      ? `Presupuesto #${presupuesto.id} — $${Number(
          presupuesto.montoTotal ?? 0
        ).toLocaleString('es-CL')}`
      : `Presupuesto #${id}`;
  };

  const obtenerFechaDocumento = (documento) => {
            return documento?.fecha ?? null;
          };

          const formatearFecha = (fecha) => {
            if (!fecha) {
              return '—';
            }

            /*
            * Spring Boot puede enviar LocalDateTime con microsegundos:
            * 2026-07-14T01:54:14.477815
            *
            * JavaScript trabaja de forma más segura con milisegundos:
            * 2026-07-14T01:54:14.477
            */
            const fechaNormalizada = String(fecha).replace(
              /(\.\d{3})\d+/,
              '$1'
            );

            const fechaParseada = new Date(
              fechaNormalizada
            );

            if (
              Number.isNaN(
                fechaParseada.getTime()
              )
            ) {
              return 'Fecha inválida';
            }

            return fechaParseada.toLocaleString(
              'es-CL',
              {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }
            );
          };

  const openCreate = () => {
    setSelected(null);
    setForm(EMPTY);
    setFormError('');
    setFieldErrors({});
    setShowCancelConfirm(false);
    setModal('create');
  };

  const openDelete = (
    documento
  ) => {
    setSelected(documento);
    setFormError('');
    setModal('delete');
  };

  const close = () => {
    setModal(null);
    setSelected(null);
    setForm(EMPTY);
    setFormError('');
    setFieldErrors({});
    setShowCancelConfirm(false);
  };

  const handleFormChange =
    (field) => (event) => {
      const value =
        event.target.value;

      setForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }));

      setFieldErrors(
        (currentErrors) => ({
          ...currentErrors,
          [field]: '',
        })
      );

      setFormError('');
    };

  const validarFormulario = () => {
    const errores = {};

    if (!form.presupuestoId) {
      errores.presupuestoId =
        'Debe seleccionar un presupuesto aprobado.';
    }

    setFieldErrors(errores);

    return (
      Object.keys(errores).length ===
      0
    );
  };

  const handleSave = async (
    event
  ) => {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      await createDocumento({
        presupuestoId: Number(
          form.presupuestoId
        ),
        tipoDocumento:
          form.tipoDocumento,
      });

      await load();

      close();

      setFeedback({
        type: 'success',
        message:
          'Documento de pago emitido correctamente.',
      });
    } catch (err) {
      const mensaje =
        err.message ||
        'No fue posible emitir el documento de pago.';

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
      await deleteDocumento(
        selected.id
      );

      await load();

      close();

      setFeedback({
        type: 'success',
        message:
          'Documento eliminado correctamente.',
      });
    } catch (err) {
      setFormError(
        err.message ||
          'No fue posible eliminar el documento.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelCreate = () => {
    const tieneDatos =
      formularioTieneDatos({
        presupuestoId:
          form.presupuestoId,
      }) ||
      form.tipoDocumento !==
        'BOLETA';

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

  const tipoBadge = (tipo) => {
    const colors = {
      BOLETA:
        'bg-blue-100 text-blue-700',
      FACTURA:
        'bg-purple-100 text-purple-700',
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          colors[tipo] ||
          'bg-slate-100 text-slate-700'
        }`}
      >
        {tipo}
      </span>
    );
  };

  const columns = [
    {
      key: 'id',
      header: 'N° Documento',
      render: (documento) =>
        `#${documento.id}`,
    },
    {
      key: 'presupuesto',
      header: 'Presupuesto',
      render: (documento) =>
        presupuestoLabel(
          documento.presupuestoId ??
            documento.presupuesto?.id
        ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (documento) =>
        tipoBadge(
          documento.tipoDocumento
        ),
    },
    {
      key: 'fecha',
      header: 'Fecha de emisión',
      render: (documento) =>
        formatearFecha(
          obtenerFechaDocumento(documento)
        ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (documento) => (
        <button
          type="button"
          onClick={() =>
            openDelete(documento)
          }
          title="Eliminar documento"
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
      ),
    },
  ];

  return (
    <Layout title="Documentos de Pago">
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

          Emitir Documento
        </Button>
      </div>

      <Table
        columns={columns}
        data={documentos}
        loading={loading}
        emptyMessage="No hay documentos de pago emitidos."
      />

      <Modal
        isOpen={
          modal === 'create'
        }
        onClose={
          handleCancelCreate
        }
        title="Emitir Documento de Pago"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={
                handleCancelCreate
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              form="doc-form"
              loading={formLoading}
            >
              Emitir
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
          id="doc-form"
          onSubmit={handleSave}
          className="space-y-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Presupuesto{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              value={
                form.presupuestoId
              }
              onChange={handleFormChange(
                'presupuestoId'
              )}
              required
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.presupuestoId
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300'
              }`}
            >
              <option value="">
                Seleccionar presupuesto…
              </option>

              {presupuestosAprobados.map(
                (presupuesto) => (
                  <option
                    key={
                      presupuesto.id
                    }
                    value={
                      presupuesto.id
                    }
                  >
                    #
                    {presupuesto.id}{' '}
                    — $
                    {Number(
                      presupuesto.montoTotal ??
                        0
                    ).toLocaleString(
                      'es-CL'
                    )}{' '}
                    (
                    {
                      presupuesto.estadoAprobacion
                    }
                    )
                  </option>
                )
              )}
            </select>

            {fieldErrors.presupuestoId && (
              <p className="text-xs text-red-600">
                {
                  fieldErrors.presupuestoId
                }
              </p>
            )}

            {presupuestosAprobados.length ===
              0 && (
              <p className="text-xs text-amber-600 mt-1">
                Solo se pueden emitir
                documentos para presupuestos
                aprobados.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Tipo de documento
            </label>

            <select
              value={
                form.tipoDocumento
              }
              onChange={handleFormChange(
                'tipoDocumento'
              )}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIPOS.map((tipo) => (
                <option
                  key={tipo}
                  value={tipo}
                >
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            La fecha y hora de emisión serán asignadas automáticamente al guardar.
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={
          modal === 'delete'
        }
        onClose={close}
        title="Eliminar Documento"
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
          ¿Eliminar el documento{' '}
          <strong>
            #{selected?.id}
          </strong>
          ? Esta acción no se puede deshacer.
        </p>
      </Modal>

      <ConfirmDialog
        isOpen={
          showCancelConfirm
        }
        title="Cancelar emisión"
        message="¿Está seguro de que desea cancelar la acción? Se perderán los datos seleccionados."
        confirmText="Sí, cancelar"
        cancelText="Continuar editando"
        variant="danger"
        onConfirm={
          confirmarCancelacion
        }
        onCancel={
          continuarEditando
        }
      />
    </Layout>
  );
}