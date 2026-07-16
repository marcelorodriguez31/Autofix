import { handleResponse } from './apiUtils';

export const getHistorialByVehiculo = (vehiculoId) =>
  fetch(`/api/historial/vehiculo/${vehiculoId}`).then(handleResponse);
