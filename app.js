// Crear la instancia global de Supabase (solo aquí)
const SUPABASE_URL = 'https://tlmumyswspfyswqnyssz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4MxsDe4SXkHa-Cq2WboYyg_kaYfT6x7';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Proteger la página: si no hay sesión → login
supabase.auth.getSession().then(({ data }) => {
  if (!data.session) {
    window.location.href = "login.html";
  }
});

// Aquí empieza tu lógica del dashboard
// Puedes añadir lo que ya tenías debajo de esto

console.log("Sesión activa:", supabase.auth.getUser());
