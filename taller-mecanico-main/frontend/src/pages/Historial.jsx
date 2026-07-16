import { useEffect, useState } from 'react';

import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

import FeedbackMessage from '../components/common/FeedbackMessage';

import {
  getHistorialByVehiculo,
} from '../api/historial';

import {
  getVehiculos,
} from '../api/vehiculos';

export default function Historial() {
  const [vehiculos, setVehiculos] =
    useState([]);

  const [vehiculoId, setVehiculoId] =
    useState('');

  const [vehiculoSearch, setVehiculoSearch] =
    useState('');

  const [historial, setHistorial] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    loadingVehiculos,
    setLoadingVehiculos,
  ] = useState(true);

  const [error, setError] =
    useState('');

  const [buscado, setBuscado] =
    useState(false);

  const [feedback, setFeedback] =
    useState({
      type: '',
      message: '',
    });

  useEffect(() => {
    setLoadingVehiculos(true);
    setError('');

    getVehiculos()
      .then((data) => {
        setVehiculos(data);
      })
      .catch((err) => {
        setError(
          err.message ||
            'No fue posible cargar los vehículos.'
        );
      })
      .finally(() => {
        setLoadingVehiculos(false);
      });
  }, []);

  const obtenerAnioVehiculo = (vehiculo) =>
    vehiculo?.anio ??
    vehiculo?.año ??
    '';

  const obtenerClienteVehiculo = (
    vehiculo
  ) =>
    vehiculo?.cliente?.nombre ??
    vehiculo?.clienteNombre ??
    '';

  const obtenerRutCliente = (
    vehiculo
  ) =>
    vehiculo?.cliente?.rut ??
    vehiculo?.clienteRut ??
    '';

  const vehiculosFiltrados =
    vehiculos.filter((vehiculo) => {
      const consulta = vehiculoSearch
        .trim()
        .toLowerCase();

      if (!consulta) {
        return true;
      }

      const textoBuscable = [
        vehiculo.patente,
        vehiculo.marca,
        vehiculo.modelo,
        obtenerAnioVehiculo(vehiculo),
        obtenerClienteVehiculo(vehiculo),
        obtenerRutCliente(vehiculo),
      ]
        .filter(
          (valor) =>
            valor !== null &&
            valor !== undefined
        )
        .join(' ')
        .toLowerCase();

      return textoBuscable.includes(
        consulta
      );
    });

  const vehiculoSeleccionado =
    vehiculos.find(
      (vehiculo) =>
        vehiculo.id ===
        Number(vehiculoId)
    );

  const limpiarResultado = () => {
    setBuscado(false);
    setHistorial([]);
    setError('');
    setFeedback({
      type: '',
      message: '',
    });
  };

  const handleVehiculoChange = (
    event
  ) => {
    setVehiculoId(
      event.target.value
    );

    limpiarResultado();
  };

  const handleSearchChange = (
    event
  ) => {
    setVehiculoSearch(
      event.target.value
    );

    /*
     * Si el vehículo seleccionado deja de estar
     * dentro de los resultados filtrados,
     * se elimina la selección.
     */
    const consulta =
      event.target.value
        .trim()
        .toLowerCase();

    if (
      vehiculoId &&
      consulta
    ) {
      const seleccionado =
        vehiculos.find(
          (vehiculo) =>
            vehiculo.id ===
            Number(vehiculoId)
        );

      const textoSeleccionado = [
        seleccionado?.patente,
        seleccionado?.marca,
        seleccionado?.modelo,
        obtenerAnioVehiculo(
          seleccionado
        ),
        obtenerClienteVehiculo(
          seleccionado
        ),
        obtenerRutCliente(
          seleccionado
        ),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (
        !textoSeleccionado.includes(
          consulta
        )
      ) {
        setVehiculoId('');
      }
    }

    limpiarResultado();
  };

  const buscar = async (event) => {
    event.preventDefault();

    if (!vehiculoId) {
      setFeedback({
        type: 'warning',
        message:
          'Debe seleccionar un vehículo para consultar el historial.',
      });

      return;
    }

    setLoading(true);
    setError('');
    setBuscado(false);
    setFeedback({
      type: '',
      message: '',
    });

    try {
      const data =
        await getHistorialByVehiculo(
          vehiculoId
        );

      setHistorial(
        Array.isArray(data)
          ? data
          : []
      );

      setBuscado(true);
    } catch (err) {
      const mensaje =
        err.message ||
        'No fue posible consultar el historial del vehículo.';

      setError(mensaje);

      setFeedback({
        type: 'error',
        message: mensaje,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return '—';
    }

    const fechaNormalizada =
      String(fecha).replace(
        /(\.\d{3})\d+/,
        '$1'
      );

    const fechaParseada =
      new Date(fechaNormalizada);

    if (
      Number.isNaN(
        fechaParseada.getTime()
      )
    ) {
      return '—';
    }

    return fechaParseada.toLocaleDateString(
      'es-CL',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };

  return (
    <Layout title="Historial de Mantención">
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

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4">
          Consultar historial por vehículo
        </h2>

        <form
          onSubmit={buscar}
          className="flex gap-3 items-end flex-wrap"
        >
          <div className="flex flex-col gap-2 flex-1 min-w-[260px]">
            <label className="text-sm font-medium text-slate-700">
              Vehículo
            </label>

            {loadingVehiculos ? (
              <div className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-400">
                Cargando vehículos…
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={vehiculoSearch}
                  onChange={
                    handleSearchChange
                  }
                  placeholder="Buscar por patente, marca, modelo, cliente o RUT..."
                  className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={vehiculoId}
                  onChange={
                    handleVehiculoChange
                  }
                  required
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
                        {vehiculo.patente} —{' '}
                        {vehiculo.marca}{' '}
                        {vehiculo.modelo}
                        {obtenerAnioVehiculo(
                          vehiculo
                        )
                          ? ` (${obtenerAnioVehiculo(
                              vehiculo
                            )})`
                          : ''}
                        {obtenerClienteVehiculo(
                          vehiculo
                        )
                          ? ` — ${obtenerClienteVehiculo(
                              vehiculo
                            )}`
                          : ''}
                      </option>
                    )
                  )}
                </select>

                {vehiculoSearch &&
                  vehiculosFiltrados.length ===
                    0 && (
                    <p className="text-xs text-red-600">
                      No se encontraron
                      vehículos con esa
                      búsqueda.
                    </p>
                  )}

                {!vehiculoSearch &&
                  vehiculos.length === 0 && (
                    <p className="text-xs text-amber-600">
                      No hay vehículos
                      registrados.
                    </p>
                  )}
              </>
            )}
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={
              !vehiculoId ||
              loadingVehiculos
            }
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            Consultar
          </Button>
        </form>
      </div>

      {buscado && (
        <div>
          {vehiculoSeleccionado && (
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>

              <div>
                <p className="font-semibold text-slate-800">
                  {
                    vehiculoSeleccionado.patente
                  }{' '}
                  —{' '}
                  {
                    vehiculoSeleccionado.marca
                  }{' '}
                  {
                    vehiculoSeleccionado.modelo
                  }
                </p>

                <p className="text-sm text-slate-500">
                  {obtenerAnioVehiculo(
                    vehiculoSeleccionado
                  )
                    ? `Año ${obtenerAnioVehiculo(
                        vehiculoSeleccionado
                      )} · `
                    : ''}

                  {historial.length}{' '}
                  registro
                  {historial.length !== 1
                    ? 's'
                    : ''}{' '}
                  encontrado
                  {historial.length !== 1
                    ? 's'
                    : ''}
                </p>

                {obtenerClienteVehiculo(
                  vehiculoSeleccionado
                ) && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cliente:{' '}
                    {obtenerClienteVehiculo(
                      vehiculoSeleccionado
                    )}
                    {obtenerRutCliente(
                      vehiculoSeleccionado
                    )
                      ? ` · ${obtenerRutCliente(
                          vehiculoSeleccionado
                        )}`
                      : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {historial.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <svg
                className="h-12 w-12 text-slate-300 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>

              <p className="text-slate-500">
                No hay historial de
                mantención para este
                vehículo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historial.map(
                (item, index) => (
                  <div
                    key={
                      item.ordenId ??
                      item.id ??
                      index
                    }
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          Orden #
                          {item.ordenId}
                          {item.numeroOrden
                            ? ` — ${item.numeroOrden}`
                            : ''}
                        </span>

                        {item.estadoOrden && (
                          <Badge
                            status={
                              item.estadoOrden
                            }
                          />
                        )}
                      </div>

                      <span className="text-sm text-slate-400">
                        {formatearFecha(
                          item.fechaIngreso
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {item.diagnosticoPreliminar && (
                        <div className="sm:col-span-2">
                          <span className="font-medium text-slate-500">
                            Diagnóstico
                            preliminar:{' '}
                          </span>

                          <span className="text-slate-700">
                            {
                              item.diagnosticoPreliminar
                            }
                          </span>
                        </div>
                      )}

                      {item.fallas && (
                        <div>
                          <span className="font-medium text-slate-500">
                            Fallas:{' '}
                          </span>

                          <span className="text-slate-700">
                            {item.fallas}
                          </span>
                        </div>
                      )}

                      {item.recomendaciones && (
                        <div>
                          <span className="font-medium text-slate-500">
                            Recomendaciones:{' '}
                          </span>

                          <span className="text-slate-700">
                            {
                              item.recomendaciones
                            }
                          </span>
                        </div>
                      )}

                      {item.mecanicoNombre && (
                        <div>
                          <span className="font-medium text-slate-500">
                            Mecánico:{' '}
                          </span>

                          <span className="text-slate-700">
                            {
                              item.mecanicoNombre
                            }{' '}
                            {item.mecanicoEspecialidad
                              ? `(${item.mecanicoEspecialidad})`
                              : ''}
                          </span>
                        </div>
                      )}

                      {item.montoPresupuesto !=
                        null && (
                        <div>
                          <span className="font-medium text-slate-500">
                            Presupuesto:{' '}
                          </span>

                          <span className="text-slate-700 font-semibold">
                            $
                            {Number(
                              item.montoPresupuesto
                            ).toLocaleString(
                              'es-CL'
                            )}{' '}
                            {item.estadoPresupuesto
                              ? `(${item.estadoPresupuesto})`
                              : ''}
                          </span>
                        </div>
                      )}

                      {item.montoPagado !=
                        null && (
                        <div>
                          <span className="font-medium text-slate-500">
                            Pagado
                            {item.tipoDocumento
                              ? ` (${item.tipoDocumento})`
                              : ''}
                            :{' '}
                          </span>

                          <span className="text-slate-700 font-semibold">
                            $
                            {Number(
                              item.montoPagado
                            ).toLocaleString(
                              'es-CL'
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}