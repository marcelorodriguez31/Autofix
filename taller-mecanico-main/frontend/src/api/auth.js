const BASE = '/api';

export async function signIn(empresa, password) {
  const response = await fetch(`${BASE}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      empresa,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'No fue posible iniciar sesión'
    );
  }

  return data;
}