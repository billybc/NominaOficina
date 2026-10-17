import {
  auth, db, ref, set, onValue, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged
} from './firebase-config.js';

// Cambia este correo por el correo real del administrador.
const ADMIN_EMAIL = 'billycardona7@gmail.com';
const meals = ['Desayuno', 'Almuerzo', 'Cena'];
const state = {
  user: null, isAdmin: false, members: {}, schedule: {}, activity: {},
  meals: {
    Desayuno: { enabled: true, name: 'Desayuno' },
    Almuerzo: { enabled: true, name: 'Almuerzo' },
    Cena: { enabled: true, name: 'Cena' }
  },
  preferences: {},
  preferencesByMember: {}
};
let authMode = 'login';

const $ = (id) => document.getElementById(id);
const show = (element, visible) => element.classList.toggle('hidden', !visible);
const todayKey = () => new Date().toISOString().slice(0, 10);
const escapeText = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));

function message(text, error = false) {
  $('authMessage').textContent = text;
  $('authMessage').classList.toggle('error', error);
}

function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll('[data-auth-mode]').forEach((button) => {
    button.classList.toggle('active', button.dataset.authMode === mode);
  });
  const registering = mode === 'register';
  $('authName').required = registering;
  $('authName').classList.toggle('hidden', !registering);
  $('authNameLabel').classList.toggle('hidden', !registering);
  $('authSubmit').textContent = registering ? 'Crear cuenta' : 'Ingresar';
  message(mode === 'admin' ? 'Usa el correo autorizado de administrador.' : '');
}

async function writeActivity(action) {
  if (!state.user) return;
  const id = `${Date.now()}-${state.user.uid}`;
  await set(ref(db, `actividad/${id}`), {
    uid: state.user.uid,
    email: state.user.email,
    action,
    createdAt: new Date().toISOString()
  });
}

function renderSchedule() {
  const date = todayKey();
  $('scheduleDate').textContent = date;
  const entries = state.schedule[date] || {};
  const enabledMeals = meals.filter((meal) => state.meals[meal]?.enabled);
  $('todayCount').textContent = Object.keys(entries).length;
  $('mealCount').textContent = enabledMeals.length;
  $('scheduleGrid').replaceChildren();

  enabledMeals.forEach((meal) => {
    const entry = entries[meal];
    const assignedNames = entry?.members?.length
      ? entry.members.map((member) => member.name).join(' y ')
      : entry?.name || 'Pendiente';
    const assignedShifts = entry?.members?.length
      ? [...new Set(entry.members.map((member) => member.shift).filter(Boolean))].join(' · ')
      : entry?.shift || 'Sin personas asignadas';
    const card = document.createElement('article');
    card.className = 'meal-card';
    card.innerHTML = `<span class="meal-icon">${meal === 'Desayuno' ? '🌅' : meal === 'Almuerzo' ? '☀️' : '🌙'}</span>
      <div><p class="eyebrow">${escapeText(state.meals[meal]?.name || meal)}</p><h3>${escapeText(assignedNames)}</h3>
      <p class="muted">${escapeText(assignedShifts)}</p></div>`;
    $('scheduleGrid').appendChild(card);
  });
}

function renderPreferences() {
  const form = $('preferencesForm');
  form.replaceChildren();
  meals.filter((meal) => state.meals[meal]?.enabled).forEach((meal) => {
    const preference = state.preferences[meal] || {};
    const row = document.createElement('label');
    row.className = 'preference-row';
    row.innerHTML = `<input type="checkbox" data-preference-meal="${meal}" ${preference.available === false ? 'checked' : ''}>
      <span>No participaré en ${escapeText(state.meals[meal].name)}</span>`;
    form.appendChild(row);
  });
}

function renderMealSettings() {
  const form = $('mealsForm');
  form.replaceChildren();
  meals.forEach((meal) => {
    const row = document.createElement('label');
    row.className = 'meal-setting-row';
    row.innerHTML = `<input type="checkbox" data-meal-enabled="${meal}" ${state.meals[meal]?.enabled ? 'checked' : ''}>
      <span>${meal}</span>
      <input class="input-text" type="text" data-meal-name="${meal}" value="${escapeText(state.meals[meal]?.name || meal)}" maxlength="40" required>`;
    form.appendChild(row);
  });
}

function renderMembers() {
  const members = Object.entries(state.members);
  $('memberCount').textContent = members.length;
  $('membersBody').replaceChildren();
  members.forEach(([id, member]) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${escapeText(member.name)}</td><td>${escapeText(member.email)}</td>
      <td>${escapeText(member.shift)}</td><td>${state.isAdmin ? `<button class="btn btn-danger delete-member" data-id="${id}">Eliminar</button>` : ''}</td>`;
    $('membersBody').appendChild(row);
  });
  document.querySelectorAll('.delete-member').forEach((button) => {
    button.addEventListener('click', () => deleteMember(button.dataset.id));
  });
}

function renderActivity() {
  $('activityBody').replaceChildren();
  Object.values(state.activity).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${escapeText(item.createdAt?.slice(0, 19).replace('T', ' '))}</td>
      <td>${escapeText(item.email)}</td><td>${escapeText(item.action)}</td>`;
    $('activityBody').appendChild(row);
  });
}

function generateSchedule() {
  if (!state.isAdmin) return;
  const members = Object.values(state.members);
  if (members.length < 2) {
    alert('Se necesitan al menos dos personas registradas para formar una pareja.');
    return;
  }
  const entries = {};
  const memberEntries = Object.entries(state.members);
  meals.filter((meal) => state.meals[meal]?.enabled).forEach((meal, index) => {
    const available = memberEntries.filter(([id]) => state.preferencesByMember?.[id]?.[meal]?.available !== false);
    const candidates = available.length >= 2 ? available : memberEntries;
    const firstIndex = (new Date().getDate() - 1 + index * 2) % candidates.length;
    const secondIndex = (firstIndex + 1) % candidates.length;
    const pair = [candidates[firstIndex], candidates[secondIndex]].map(([, member]) => ({
      uid: member.uid,
      name: member.name,
      shift: member.shift
    }));
    entries[meal] = {
      uid: pair.map((member) => member.uid).join(','),
      name: pair.map((member) => member.name).join(' y '),
      shift: [...new Set(pair.map((member) => member.shift).filter(Boolean))].join(' · '),
      members: pair
    };
  });
  set(ref(db, `horarios/${todayKey()}`), entries)
    .then(() => writeActivity('Actualizó la rotación de limpieza'))
    .catch((error) => alert(`No se pudo generar la rotación: ${error.message}`));
}

async function deleteMember(id) {
  if (!state.isAdmin || !confirm('¿Eliminar esta persona del equipo?')) return;
  await set(ref(db, `personas/${id}`), null);
  await writeActivity('Eliminó una persona del equipo');
}

document.querySelectorAll('[data-auth-mode]').forEach((button) => {
  button.addEventListener('click', () => setAuthMode(button.dataset.authMode));
});

$('authForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  message('');
  const email = $('authEmail').value.trim().toLowerCase();
  const password = $('authPassword').value;
  try {
    if (authMode === 'register') {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, `personas/${result.user.uid}`), {
        uid: result.user.uid, name: $('authName').value.trim(), email, shift: '08:00 - 16:00'
      });
      await set(ref(db, `preferencias/${result.user.uid}`), {});
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    message(error.code === 'auth/email-already-in-use' ? 'Ese correo ya está registrado.' : error.message, true);
  }
});

$('forgotPasswordBtn').addEventListener('click', () => {
  show($('authForm'), false);
  show($('forgotPasswordForm'), true);
  show($('forgotPasswordBtn'), false);
  message('Escribe tu correo y te enviaremos un enlace para cambiar la contraseña.');
});
$('backToLoginBtn').addEventListener('click', () => {
  show($('authForm'), true);
  show($('forgotPasswordForm'), false);
  show($('forgotPasswordBtn'), true);
  message('');
});
$('forgotPasswordForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await sendPasswordResetEmail(auth, $('resetEmail').value.trim().toLowerCase());
    message('Revisa tu Gmail: te enviamos un enlace para cambiar tu contraseña.');
  } catch (error) {
    message(error.code === 'auth/user-not-found' ? 'No encontramos una cuenta con ese correo.' : error.message, true);
  }
});

$('logoutBtn').addEventListener('click', () => signOut(auth));
$('refreshScheduleBtn').addEventListener('click', generateSchedule);
$('addMemberBtn').addEventListener('click', () => show($('memberForm'), true));
$('cancelMemberBtn').addEventListener('click', () => show($('memberForm'), false));

$('memberForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = crypto.randomUUID();
  await set(ref(db, `personas/${id}`), {
    uid: id, name: $('memberName').value.trim(), email: $('memberEmail').value.trim(),
    shift: $('memberShift').value
  });
  await writeActivity('Agregó una persona al equipo');
  event.target.reset();
  show(event.target, false);
});

$('saveNotesBtn').addEventListener('click', async () => {
  try {
    await set(ref(db, 'notas'), { contenido: $('notesArea').value.trim(), updatedAt: new Date().toISOString() });
    await writeActivity('Guardó una nota del equipo');
    $('saveNotesBtn').textContent = '✅ Nota guardada';
    setTimeout(() => { $('saveNotesBtn').textContent = '💾 Guardar nota'; }, 1800);
  } catch (error) {
    alert(`No se pudo guardar la nota: ${error.message}`);
  }
});

$('clearActivityBtn').addEventListener('click', async () => {
  if (confirm('¿Borrar todo el historial de actividad?')) await set(ref(db, 'actividad'), null);
});
$('clearScheduleBtn').addEventListener('click', async () => {
  if (confirm('¿Reiniciar el horario de hoy?')) await set(ref(db, `horarios/${todayKey()}`), null);
});

$('saveMealsBtn').addEventListener('click', async () => {
  if (!state.isAdmin) return;
  const config = {};
  meals.forEach((meal) => {
    config[meal] = {
      enabled: $(`[data-meal-enabled="${meal}"]`).checked,
      name: $(`[data-meal-name="${meal}"]`).value.trim() || meal
    };
  });
  try {
    await set(ref(db, 'configuracion/comidas'), config);
    await writeActivity('Actualizó las comidas habilitadas y sus nombres');
    renderSchedule();
    renderPreferences();
  } catch (error) {
    alert(`No se pudo guardar la configuración de comidas: ${error.message}`);
  }
});

$('savePreferencesBtn').addEventListener('click', async () => {
  if (!state.user) return;
  const preferences = {};
  meals.forEach((meal) => {
    const checkbox = $(`[data-preference-meal="${meal}"]`);
    if (checkbox) preferences[meal] = { available: !checkbox.checked };
  });
  try {
    await set(ref(db, `preferencias/${state.user.uid}`), preferences);
    await writeActivity('Actualizó sus preferencias de comidas');
  } catch (error) {
    alert(`No se pudieron guardar tus preferencias: ${error.message}`);
  }
});

onValue(ref(db, 'personas'), (snapshot) => { state.members = snapshot.val() || {}; renderMembers(); });
onValue(ref(db, 'horarios'), (snapshot) => { state.schedule = snapshot.val() || {}; renderSchedule(); });
onValue(ref(db, 'actividad'), (snapshot) => { state.activity = snapshot.val() || {}; renderActivity(); });
onValue(ref(db, 'notas'), (snapshot) => { $('notesArea').value = snapshot.val()?.contenido || ''; });
onValue(ref(db, 'configuracion/comidas'), (snapshot) => {
  state.meals = { ...state.meals, ...(snapshot.val() || {}) };
  renderSchedule();
  renderMealSettings();
  renderPreferences();
});
onValue(ref(db, 'preferencias'), (snapshot) => {
  state.preferencesByMember = snapshot.val() || {};
  state.preferences = state.user ? state.preferencesByMember[state.user.uid] || {} : {};
  renderPreferences();
});

onAuthStateChanged(auth, (user) => {
  state.user = user;
  const loggedIn = Boolean(user);
  state.isAdmin = loggedIn && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  show($('authScreen'), !loggedIn);
  show($('app'), loggedIn);
  if (!loggedIn) return;
  $('userInfo').textContent = `${user.email}`;
  $('roleBadge').textContent = state.isAdmin ? 'Administrador' : 'Personal';
  show($('adminPanel'), state.isAdmin);
  show($('addMemberBtn'), state.isAdmin);
  renderMembers();
  document.querySelectorAll('.admin-only').forEach((element) => show(element, state.isAdmin));
  state.preferences = state.preferencesByMember?.[user.uid] || {};
  renderPreferences();
});

setAuthMode('login');
