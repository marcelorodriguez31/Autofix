import { handleResponse } from './apiUtils';

const BASE = '/api/vehiculos';

export const getVehiculos = () =>
  fetch(BASE).then(handleResponse);

export const createVehiculo = (data) =>
  fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateVehiculo = (id, data) =>
  fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(handleResponse);

export async function deleteVehiculo(id) {
  const response = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let mensaje =
      'No fue posible eliminar el vehículo.';

    try {
      const data = await response.json();
      mensaje = data.message || mensaje;
    } catch {
      // La respuesta no contenía JSON.
    }

    throw new Error(mensaje);
  }

  return true;
}