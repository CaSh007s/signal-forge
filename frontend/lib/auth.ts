// 1. Save the token to LocalStorage
export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("signalforge_token", token);
  }
}

// 2. Get the token
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("signalforge_token");
  }
  return null;
}

// 3. Remove the token (Logout)
export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("signalforge_token");
  }
}

// 4. Check if user is logged in
export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token; // Returns true if token exists, false otherwise
}
