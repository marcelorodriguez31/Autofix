/**
 * Maneja la respuesta HTTP y extrae mensajes de error legibles.
 * Spring Boot incluye el mensaje en res.json().message cuando
 * server.error.include-message=always está configurado.
 */
export async function handleResponse(res) {
  if (res.status === 204) return null;

  const text = await res.text();

  if (!res.ok) {
    let message = `Error ${res.status}`;
    if (text) {
      try {
        const json = JSON.parse(text);
        // Spring Boot pone el mensaje de la excepción en "message"
        message = json.message || json.error || message;
      } catch {
        // Si no es JSON (poco probable), usar el texto directo
        message = text;
      }
    }
    throw new Error(message);
  }

  return text ? JSON.parse(text) : null;
}
