import { supabase } from "@/lib/supabase";

export const getToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

// Legacy Helpers (Refactored to use Supabase)

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function register(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function logout() {
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    localStorage.removeItem("signalforge_token");
  }
}

export const setToken = (token: string) => {
  console.log("setToken is deprecated: Supabase handles session storage.");
};

export const removeToken = () => {
  // No-op: handled by logout()
};
