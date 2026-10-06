import { db, ref, set, onValue } from './firebase-config.js';

let currentUser = localStorage.getItem('nomina_user') || null;
let currentData = { parejas: [], notas: '' };

const loginModal = document.getElementById('loginModal');
const appContainer = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const pairForm = document.getElementById('pairForm');
const pairsTableBody = document.getElementById('pairsTableBody');
const notesArea = document.getElementById('notesArea');

// Inicialización de Usuario
if (currentUser) {
  initApp();
} else {
  loginModal.style.display = 'flex';
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('usernameInput').value.trim();
  if (user) {
    currentUser = user;
    localStorage.setItem('nomina_user', user);
    loginModal.style.display = 'none';
    initApp();
  }
});

function initApp() {
  appContainer.style.display = 'block';
  document.getElementById('userInfo').textContent = `Usuario: ${currentUser}`;

  // Escuchar cambios de Firebase en Tiempo Real
  const turnosRef = ref(db, 'turnos');
  onValue(turnosRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      currentData = data;
      renderPairs();
      renderNotes();
    }
  });
}

// Renderizar lista de parejas
function renderPairs() {
  pairsTableBody.innerHTML = '';
  const parejas = currentData.parejas || [];
  
  if (parejas.length === 0) {
    pairsTableBody.innerHTML = '<tr><td colspan="2" style="text-align:center; color: var(--text-muted);">No hay parejas registradas.</td></tr>';
    return;
  }

  parejas.forEach((p, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.nombre1}</strong> & <strong>${p.nombre2}</strong></td>
      <td>
        <button class="btn btn-danger" onclick="deletePair(${index})">Eliminar</button>
      </td>
    `;
    pairsTableBody.appendChild(tr);
  });
}

// Agregar Pareja
pairForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const n1 = document.getElementById('nombre1').value.trim();
  const n2 = document.getElementById('nombre2').value.trim();

  if (n1 && n2) {
    const parejas = currentData.parejas || [];
    parejas.push({ nombre1: n1, nombre2: n2 });
    
    set(ref(db, 'turnos/parejas'), parejas);
    pairForm.reset();
  }
});

// Renderizar y Guardar Notas
function renderNotes() {
  notesArea.value = currentData.notas || '';
}

document.getElementById('saveNotesBtn').addEventListener('click', () => {
  set(ref(db, 'turnos/notas'), notesArea.value);
});

// Función global para eliminar
window.deletePair = (index) => {
  const parejas = currentData.parejas || [];
  parejas.splice(index, 1);
  set(ref(db, 'turnos/parejas'), parejas);
};