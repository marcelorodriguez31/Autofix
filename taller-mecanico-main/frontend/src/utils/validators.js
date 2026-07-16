/**
 * Elimina puntos, guiones y espacios del RUT.
 * Ejemplo: 12.345.678-5 -> 123456785
 */
export function limpiarRut(rut = '') {
  return String(rut)
    .replace(/\./g, '')
    .replace(/-/g, '')
    .replace(/\s/g, '')
    .toUpperCase();
}

/**
 * Valida un RUT chileno mediante el algoritmo módulo 11.
 */
export function validarRut(rut) {
  const rutLimpio = limpiarRut(rut);

  if (!/^\d{7,8}[0-9K]$/.test(rutLimpio)) {
    return false;
  }

  const cuerpo = rutLimpio.slice(0, -1);
  const digitoIngresado = rutLimpio.slice(-1);

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const resultado = 11 - resto;

  let digitoCalculado;

  if (resultado === 11) {
    digitoCalculado = '0';
  } else if (resultado === 10) {
    digitoCalculado = 'K';
  } else {
    digitoCalculado = String(resultado);
  }

  return digitoIngresado === digitoCalculado;
}

/**
 * Formatea el RUT mientras se escribe.
 * Ejemplo: 123456785 -> 12.345.678-5
 */
export function formatearRut(rut) {
  const rutLimpio = limpiarRut(rut).slice(0, 9);

  if (rutLimpio.length <= 1) {
    return rutLimpio;
  }

  const cuerpo = rutLimpio.slice(0, -1);
  const digitoVerificador = rutLimpio.slice(-1);

  const cuerpoFormateado = cuerpo.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    '.'
  );

  return `${cuerpoFormateado}-${digitoVerificador}`;
}

/**
 * Valida que exista al menos un nombre y un apellido.
 */
export function validarNombreCompleto(nombre = '') {
  const nombreLimpio = nombre.trim().replace(/\s+/g, ' ');

  const partes = nombreLimpio.split(' ').filter(Boolean);

  if (partes.length < 2) {
    return false;
  }

  return partes.every((parte) =>
    /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü'-]{2,}$/.test(parte)
  );
}

/**
 * Convierte nombres a formato legible.
 * Ejemplo:
 * "jaime andres unda salinas"
 * Resultado:
 * "Jaime Andres Unda Salinas"
 */
export function formatearNombre(nombre = '') {
  return nombre
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|\s|[-'])\p{L}/gu, (letra) => letra.toUpperCase());
}

/**
 * Valida un teléfono móvil chileno.
 * Formato aceptado:
 * +56912345678
 */
export function validarTelefonoChile(telefono = '') {
  return /^\+569\d{8}$/.test(telefono.trim());
}

/**
 * Normaliza el teléfono al formato chileno.
 */
export function normalizarTelefonoChile(telefono = '') {
  let valor = String(telefono).trim();

  if (!valor) {
    return '';
  }

  if (valor.startsWith('+569')) {
    const numeros = valor
      .slice(4)
      .replace(/\D/g, '')
      .slice(0, 8);

    return `+569${numeros}`;
  }

  const numeros = valor.replace(/\D/g, '');

  if (numeros.startsWith('569')) {
    return `+${numeros.slice(0, 11)}`;
  }

  if (numeros.startsWith('9')) {
    return `+56${numeros.slice(0, 9)}`;
  }

  return `+569${numeros.slice(0, 8)}`;
}

/**
 * Valida un correo electrónico.
 */
export function validarEmail(email = '') {
  const emailLimpio = email.trim();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio);
}