import { handleResponse } from './apiUtils';

const BASE = '/api/mecanicos';

export const getMecanicos = () => fetch(BASE).then(handleResponse);
export const getMecanicosDisponibles = () => fetch(`${BASE}/disponibles`).then(handleResponse);
export const getMecanico = (id) => fetch(`${BASE}/${id}`).then(handleResponse);
export const createMecanico = (data) => fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const updateMecanico = (id, data) => fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const deleteMecanico = (id) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);
