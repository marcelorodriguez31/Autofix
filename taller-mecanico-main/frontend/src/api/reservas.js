import { handleResponse } from './apiUtils';

const BASE = '/api/reservas';

export const getReservas = () => fetch(BASE).then(handleResponse);
export const createReserva = (data) =>
  fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
