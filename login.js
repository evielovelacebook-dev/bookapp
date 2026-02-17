const supabase = window.supabase;
const SUPABASE_URL = 'https://tlmumyswspfyswqnyssz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4MxsDe4SXkHa-Cq2WboYyg_kaYfT6x7';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Si ya hay sesión → ir al dashboard
supabase.auth.getSession().then(({ data }) => {
  if (data.session) {
    window.location.href = "index.html";
  }
});

// Cambiar pestañas login/registro
document.getElementById("tab-login").addEventListener("click", () => {
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("tab-login").classList.add("active");
  document.getElementById("tab-register").classList.remove("active");
});

document.getElementById("tab-register").addEventListener("click", () => {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("register-form").classList.remove("hidden");
  document.getElementById("tab-register").classList.add("active");
  document.getElementById("tab-login").classList.remove("active");
});

// Mostrar / ocultar contraseña
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const target = document.getElementById(icon.dataset.target);
    const isPassword = target.type === "password";
    target.type = isPassword ? "text" : "password";
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });
});

// LOGIN
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    document.getElementById("auth-error").textContent = "Credenciales incorrectas";
  } else {
    window.location.href = "index.html";
  }
});

// REGISTRO
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    document.getElementById("auth-error").textContent = "Error al crear la cuenta";
  } else {
    document.getElementById("auth-error").textContent = "Cuenta creada. Revisa tu correo.";
  }
});

