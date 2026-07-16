import { handleResponse } from './apiUtils';

const BASE = '/api/documentos-pago';

export const getDocumentos = () => fetch(BASE).then(handleResponse);
export const getDocumento = (id) => fetch(`${BASE}/${id}`).then(handleResponse);
export const getDocumentoByPresupuesto = (presupuestoId) => fetch(`${BASE}/presupuesto/${presupuestoId}`).then(handleResponse);
export const getDocumentoByOrden = (ordenId) => fetch(`${BASE}/orden/${ordenId}`).then(handleResponse);
export const createDocumento = (data) => fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const deleteDocumento = (id) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);
