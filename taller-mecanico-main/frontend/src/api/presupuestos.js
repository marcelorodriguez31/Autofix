import { handleResponse } from './apiUtils';

const BASE = '/api/presupuestos';

export const getPresupuestos = () => fetch(BASE).then(handleResponse);
export const getPresupuesto = (id) => fetch(`${BASE}/${id}`).then(handleResponse);
export const getPresupuestoByOrden = (ordenId) => fetch(`${BASE}/orden/${ordenId}`).then(handleResponse);
export const createPresupuesto = (data) => fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const aprobarPresupuesto = (id) => fetch(`${BASE}/${id}/aprobar`, { method: 'PUT' }).then(handleResponse);
export const rechazarPresupuesto = (id) => fetch(`${BASE}/${id}/rechazar`, { method: 'PUT' }).then(handleResponse);
export const deletePresupuesto = (id) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);
