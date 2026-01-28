// Token Management
export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("signalforge_token", token);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("signalforge_token");
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("signalforge_token");
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};

// --- NEW: API Calls for Login/Register ---
const API_URL = "http://127.0.0.1:8000/api";

export async function login(email: string, password: string) {
  // Uses FormData because OAuth2PasswordRequestForm expects form data
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);

  const res = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Login failed");
  }

  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Registration failed");
  }

  // Auto-login after register
  return login(email, password);
}
