import { handleResponse } from './apiUtils';

const BASE = '/api/avances';

export const getAvances = () => fetch(BASE).then(handleResponse);
export const getAvance = (id) => fetch(`${BASE}/${id}`).then(handleResponse);
export const getAvancesByOrden = (ordenId) => fetch(`${BASE}/orden/${ordenId}`).then(handleResponse);
export const getAvancesByEstado = (estado) => fetch(`${BASE}/estado/${estado}`).then(handleResponse);
export const createAvance = (data) => fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const updateAvance = (id, data) => fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const deleteAvance = (id) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);
