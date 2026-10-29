export function currentUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user-info') || 'null');
    return user && typeof user === 'object' ? user : null;
  } catch { return null; }
}

export function saveSession(data) {
  localStorage.setItem('restaurant-token', data.token);
  localStorage.setItem('user-info', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }));
}

export function clearSession() {
  localStorage.removeItem('restaurant-token');
  localStorage.removeItem('user-info');
}
