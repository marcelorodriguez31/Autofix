function normalizarValor(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

/**
 * Compara dos formularios y devuelve true si existe
 * al menos un campo diferente.
 */
export function formularioTieneCambios(
  formularioInicial,
  formularioActual
) {
  const campos = new Set([
    ...Object.keys(formularioInicial ?? {}),
    ...Object.keys(formularioActual ?? {}),
  ]);

  return [...campos].some((campo) => {
    const valorInicial = normalizarValor(
      formularioInicial?.[campo]
    );

    const valorActual = normalizarValor(
      formularioActual?.[campo]
    );

    return valorInicial !== valorActual;
  });
}

/**
 * Comprueba si existe al menos un campo con datos.
 */
export function formularioTieneDatos(formulario) {
  return Object.values(formulario ?? {}).some(
    (value) => normalizarValor(value) !== ''
  );
}