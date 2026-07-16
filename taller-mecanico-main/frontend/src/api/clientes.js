import { handleResponse } from './apiUtils';

const BASE = '/api/clientes';

export const getClientes = () => fetch(BASE).then(handleResponse);
export const getCliente = (id) => fetch(`${BASE}/${id}`).then(handleResponse);
export const createCliente = (data) =>
  fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const updateCliente = (id, data) =>
  fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const deleteCliente = (id) =>
  fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);
export const getVehiculosByCliente = (clienteId) =>
  fetch(`${BASE}/${clienteId}/vehiculos`).then(handleResponse);
export const createVehiculoForCliente = (clienteId, data) =>
  fetch(`${BASE}/${clienteId}/vehiculos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
