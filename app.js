
const ACCOUNTS_KEY = "lsrp_accounts_demo";
const SESSION_KEY = "lsrp_session_demo";

const app = document.getElementById("app");

let accounts = loadAccounts();
let currentUserId = localStorage.getItem(SESSION_KEY);

function loadAccounts() {
  try {
    const result = JSON.parse(
      localStorage.getItem(ACCOUNTS_KEY) || "[]"
    );
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

function saveAccounts() {
  localStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(accounts)
  );
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function getCurrentUser() {
  return accounts.find(
    user => user.id === currentUserId
  );
}

function makeId() {
  return "LS-" + Math.random()
    .toString(36).slice(2, 8).toUpperCase();
}

function showMessage(message, type = "error") {
  const box = document.getElementById("message");
  if (!box) return;

  box.className = type;
  box.textContent = message;
}

function showWelcome() {
  app.innerHTML = `
    <div class="auth-container">
      <section class="panel">
        <small style="color:#79bdff">
          LOS SANTOS ROLEPLAY
        </small>
        <h1>Bienvenido a la PDA</h1>
        <p style="color:#91a7bd">
          Crea tu personaje o entra con tu cuenta.
        </p>

        <button class="primary"
          onclick="showRegister()">
          Crear cuenta
        </button>

        <button class="secondary"
          onclick="showLogin()">
          Iniciar sesión
        </button>
      </section>

      <section class="panel">
        <h3>¿Nuevo en la ciudad?</h3>
        <p style="color:#91a7bd">
          Registra los datos de tu personaje de roleplay
          para añadirlo al registro de ciudadanos.
        </p>
        <button class="secondary"
          onclick="showCitizens(true)">
          Consultar ciudadanos
        </button>
      </section>
    </div>
  `;
}

function showRegister() {
  app.innerHTML = `
    <div class="auth-container">
      <section class="panel">
        <h1>Crear cuenta</h1>
        <p style="color:#91a7bd">
          Registra tu usuario y tu personaje ficticio.
        </p>

        <form id="registerForm">
          <label class="field-label">Nombre de usuario</label>
          <input name="username"
            minlength="3" maxlength="24"
            autocomplete="username"
            required>

          <label class="field-label">Contraseña de prueba</label>
          <input name="password" type="password"
            minlength="8" maxlength="100"
            autocomplete="new-password" required>

          <label class="field-label">Nombre del personaje</label>
          <input name="firstName" maxlength="40" required>

          <label class="field-label">Apellido del personaje</label>
          <input name="lastName" maxlength="40" required>

          <label class="field-label">Fecha de nacimiento del personaje</label>
          <input name="birthDate" type="date" required>

          <label class="field-label">Trabajo del personaje</label>
          <select name="job" required>
            <option value="">Selecciona un trabajo</option>
            <option>Desempleado</option>
            <option>Policía</option>
            <option>EMS</option>
            <option>Mecánico</option>
            <option>Taxista</option>
            <option>Otro</option>
          </select>

          <button class="primary" type="submit">
            Registrar personaje
          </button>
          <button class="secondary" type="button"
            onclick="showWelcome()">
            Volver
          </button>
        </form>

        <p id="message"></p>
      </section>
    </div>
  `;

  document.getElementById("registerForm").onsubmit =
    event => {
      event.preventDefault();

      const form = new FormData(event.target);

      const username = String(
        form.get("username") || ""
      ).trim();

      const password = String(
        form.get("password") || ""
      );

      const firstName = String(
        form.get("firstName") || ""
      ).trim();

      const lastName = String(
        form.get("lastName") || ""
      ).trim();

      const birthDate = String(
        form.get("birthDate") || ""
      );

      const job = String(form.get("job") || "");

      if (accounts.some(user =>
        user.username.toLowerCase() ===
        username.toLowerCase()
      )) {
        showMessage("Ese nombre de usuario ya existe.");
        return;
      }

      if (
        !/^[a-zA-Z0-9_.-]{3,24}$/.test(username)
      ) {
        showMessage(
          "Usa de 3 a 24 letras, números, puntos, guiones o guiones bajos."
        );
        return;
      }

      if (password.length < 8) {
        showMessage(
          "La contraseña debe tener al menos 8 caracteres."
        );
        return;
      }

      if (
        !firstName || !lastName ||
        !birthDate || !job
      ) {
        showMessage("Completa todos los campos.");
        return;
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
        Number.isNaN(Date.parse(birthDate)) ||
        birthDate > new Date().toISOString().slice(0, 10)
      ) {
        showMessage("Introduce una fecha válida.");
        return;
      }

      const user = {
        id: makeId(),
        username,
        // Solo para la demo local: no usar en producción.
        password,
        character: {
          firstName,
          lastName,
          birthDate,
          job,
          citizenId: makeId(),
          createdAt: new Date().toISOString()
        }
      };

      accounts.push(user);
      saveAccounts();

      currentUserId = user.id;
      localStorage.setItem(SESSION_KEY, user.id);

      showDashboard();
    };
}

function showLogin() {
  app.innerHTML = `
    <div class="auth-container">
      <section class="panel">
        <h1>Iniciar sesión</h1>
        <p style="color:#91a7bd">
          Introduce las credenciales que creaste.
        </p>

        <form id="loginForm">
          <label class="field-label">Usuario</label>
          <input name="username"
            autocomplete="username" required>

          <label class="field-label">Contraseña</label>
          <input name="password" type="password"
            autocomplete="current-password" required>

          <button class="primary" type="submit">
            Entrar en la PDA
          </button>
          <button class="secondary" type="button"
            onclick="showWelcome()">
            Volver
          </button>
        </form>

        <p id="message"></p>
      </section>
    </div>
  `;

  document.getElementById("loginForm").onsubmit =
    event => {
      event.preventDefault();

      const form = new FormData(event.target);
      const username = String(
        form.get("username") || ""
      ).trim().toLowerCase();

      const password = String(
        form.get("password") || ""
      );

      const user = accounts.find(account =>
        account.username.toLowerCase() === username &&
        account.password === password
      );

      if (!user) {
        showMessage("Usuario o contraseña incorrectos.");
        return;
      }

      currentUserId = user.id;
      localStorage.setItem(SESSION_KEY, user.id);

      showDashboard();
    };
}

function showDashboard() {
  const user = getCurrentUser();

  if (!user) {
    logout();
    return;
  }

  const character = user.character;

  app.innerHTML = `
    <div class="panel">
      <small style="color:#79bdff">
        SESIÓN INICIADA
      </small>
      <h1>Hola, ${esc(character.firstName)}</h1>
      <p style="color:#91a7bd">
        Tu personaje está registrado en Los Santos.
      </p>
      <p class="profile-id">
        ID: ${esc(character.citizenId)}
      </p>
      <div class="actions">
        <button class="primary"
          onclick="showMyCharacter()">
          Mi personaje
        </button>
        <button class="secondary"
          onclick="showCitizens()">
          Lista de ciudadanos
        </button>
        <button class="delete"
          onclick="logout()">
          Cerrar sesión
        </button>
      </div>
    </div>

    <nav class="app-nav">
      <button class="secondary"
        onclick="showDashboard()">Inicio</button>
      <button class="secondary"
        onclick="showCitizens()">Ciudadanos</button>
      <button class="secondary"
        onclick="showMyCharacter()">Mi personaje</button>
    </nav>

    <div class="grid">
      <div class="card">
        <small>CIUDADANOS REGISTRADOS</small>
        <div class="number">${accounts.length}</div>
      </div>
      <div class="card">
        <small>MI TRABAJO</small>
        <div class="number" style="font-size:20px">
          ${esc(character.job)}
        </div>
      </div>
    </div>

    <p style="color:#91a7bd">
      Los datos son de demostración y se guardan
      en este navegador.
    </p>
  `;
}

function showMyCharacter() {
  const user = getCurrentUser();

  if (!user) {
    showWelcome();
    return;
  }

  const c = user.character;

  app.innerHTML = `
    <section class="panel">
      <h2>Mi personaje</h2>
      <div class="citizen-card">
        <strong>${esc(c.firstName)} ${esc(c.lastName)}</strong>
        <p>ID ciudadano: ${esc(c.citizenId)}</p>
        <p>Usuario: ${esc(user.username)}</p>
        <p>Fecha de nacimiento: ${esc(c.birthDate)}</p>
        <p>Trabajo: ${esc(c.job)}</p>
      </div>
      <button class="secondary"
        onclick="showDashboard()">Volver</button>
    </section>
  `;
}

function showCitizens(publicView = false) {
  if (!publicView && !getCurrentUser()) {
    showWelcome();
    return;
  }

  app.innerHTML = `
    <section class="panel">
      <h2>Registro de ciudadanos</h2>
      <p style="color:#91a7bd">
        Personajes registrados en esta instalación.
      </p>
      <input id="citizenSearch"
        placeholder="Buscar por nombre, ID o trabajo...">
      <div id="citizenList"></div>
      <div class="actions">
        <button class="secondary"
          onclick="${publicView ? "showWelcome()" : "showDashboard()"}">
          Volver
        </button>
      </div>
    </section>
  `;

  const search = document.getElementById("citizenSearch");

  function renderCitizens() {
    const term = search.value.toLowerCase();

    const filtered = accounts.filter(user => {
      const c = user.character;

      return [
        c.firstName,
        c.lastName,
        c.citizenId,
        c.job
      ].some(value =>
        String(value).toLowerCase().includes(term)
      );
    });

    document.getElementById("citizenList").innerHTML =
      filtered.map(user => {
        const c = user.character;

        return `
          <article class="citizen-card">
            <strong>
              ${esc(c.firstName)} ${esc(c.lastName)}
            </strong>
            <p>ID: ${esc(c.citizenId)}</p>
            <p>Trabajo: ${esc(c.job)}</p>
            <p>Fecha de nacimiento: ${esc(c.birthDate)}</p>
          </article>
        `;
      }).join("") ||
      "<p>No hay ciudadanos que coincidan.</p>";
  }

  search.addEventListener("input", renderCitizens);
  renderCitizens();
}

function logout() {
  currentUserId = null;
  localStorage.removeItem(SESSION_KEY);
  showWelcome();
}

// Al abrir la web, comprueba si existe una sesión.
if (getCurrentUser()) {
  showDashboard();
} else {
  currentUserId = null;
  localStorage.removeItem(SESSION_KEY);
  showWelcome();
}
