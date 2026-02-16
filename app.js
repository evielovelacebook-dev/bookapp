// ⚠️ Rellena con tus datos reales de Supabase
const SUPABASE_URL = 'https://tlmumyswspfyswqnyssz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4MxsDe4SXkHa-Cq2WboYyg_kaYfT6x7';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Si NO hay sesión → volver al login
supabase.auth.getSession().then(({ data }) => {
  if (!data.session) {
    window.location.href = "login.html";
  }
});

// Obtener usuario actual
async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error(error);
    return null;
  }
  return data.user;
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = await getCurrentUser();
  if (!user) return;

  await Promise.all([
    loadCurrentReads(user.id),
    loadReadingChallenge(user.id),
    loadUpdates(user.id)
  ]);
});

// ------------------------------
// LECTURAS ACTUALES
// ------------------------------
async function loadCurrentReads(userId) {
  const container = document.getElementById('current-reads-list');
  container.innerHTML = 'Cargando lecturas actuales...';

  const { data, error } = await supabase
    .from('current_reads')
    .select(`
      id,
      current_page,
      current_percent,
      mode,
      updated_at,
      books (
        id,
        title,
        main_author,
        pages,
        cover_url
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = 'Error al cargar lecturas actuales.';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:#777;">No tienes lecturas actuales.</p>';
    return;
  }

  container.innerHTML = '';

  data.forEach(item => {
    const book = item.books;
    const totalPages = book?.pages || 0;
    let percent = item.current_percent;

    if (item.mode === 'pages' && totalPages > 0 && item.current_page != null) {
      percent = Math.round((item.current_page / totalPages) * 100);
    }

    const div = document.createElement('div');
    div.className = 'current-read-item';

    div.innerHTML = `
      <div class="current-read-cover">
        <img src="${book?.cover_url || ''}" alt="${book?.title || ''}">
      </div>
      <div class="current-read-info">
        <div class="current-read-info-title">${book?.title || 'Sin título'}</div>
        <div class="current-read-info-author">${book?.main_author || ''}</div>
        <div class="progress-bar">
          <div class="progress-bar-inner" style="width:${percent || 0}%;"></div>
        </div>
        <div class="current-read-meta">
          ${item.mode === 'pages' && item.current_page != null && totalPages
            ? `${item.current_page} / ${totalPages} páginas (${percent || 0}%)`
            : `${percent || 0}% leído`}
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

// ------------------------------
// RETO LECTOR
// ------------------------------
async function loadReadingChallenge(userId) {
  const container = document.getElementById('reading-challenge-content');
  container.innerHTML = 'Cargando reto lector...';

  const currentYear = new Date().getFullYear();

  const { data, error } = await supabase
    .from('reading_challenge')
    .select('*')
    .eq('user_id', userId)
    .eq('year', currentYear)
    .maybeSingle();

  if (error) {
    console.error(error);
    container.innerHTML = 'Error al cargar el reto lector.';
    return;
  }

  if (!data) {
    container.innerHTML = `
      <p class="challenge-year">${currentYear}</p>
      <p class="challenge-progress-text">Aún no has creado un reto lector para este año.</p>
    `;
    return;
  }

  const percent = data.goal > 0 ? Math.round((data.progress / data.goal) * 100) : 0;

  container.innerHTML = `
    <p class="challenge-year">${data.year}</p>
    <p class="challenge-progress-text">
      ${data.progress} de ${data.goal} libros (${percent}%)
    </p>
    <div class="challenge-bar">
      <div class="challenge-bar-inner" style="width:${percent}%;"></div>
    </div>
  `;
}

// ------------------------------
// ACTUALIZACIONES
// ------------------------------
async function loadUpdates(userId) {
  const container = document.getElementById('updates-list');
  container.innerHTML = 'Cargando actualizaciones...';

  const { data, error } = await supabase
    .from('updates')
    .select(`
      id,
      user_id,
      book_id,
      type,
      content,
      preview,
      progress_percent,
      created_at,
      books (
        title,
        main_author,
        pages
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error(error);
    container.innerHTML = 'Error al cargar actualizaciones.';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `
      <p style="font-size:13px;color:#777;">
        Aún no hay actualizaciones públicas.
      </p>
    `;
    return;
  }

  container.innerHTML = '';

  data.forEach(item => {
    const book = item.books;
    const div = document.createElement('div');
    div.className = 'update-item';

    const date = new Date(item.created_at);
    const dateStr = date.toLocaleDateString('es-ES');

    const previewText = item.preview || (item.content ? item.content.slice(0, 140) + '…' : '');

    div.innerHTML = `
      <div class="update-header">
        <div class="update-avatar">
          <i class="fa-solid fa-user"></i>
        </div>
        <div>
          <div class="update-user">Usuario</div>
          <div class="update-meta">${dateStr}</div>
        </div>
      </div>

      <div class="update-book-title">
        ${book ? `${book.title} ${book.main_author ? '· ' + book.main_author : ''}` : ''}
      </div>

      ${item.progress_percent != null ? `
        <div class="update-progress">
          Progreso: ${item.progress_percent}% leído
        </div>
      ` : ''}

      ${previewText ? `
        <div class="update-preview">${previewText}</div>
      ` : ''}
    `;

    container.appendChild(div);
  });
}
