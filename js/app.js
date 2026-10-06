// Importas las funciones que exportaste en firebase-config.js
import { db, ref, set, onValue } from './firebase-config.js';

// 1. Guardar un turno nuevo en Firebase
function guardarTurno(fecha, empleado1, empleado2) {
  // Crea una referencia dentro del nodo "turnos" con la fecha como clave
  const turnoRef = ref(db, 'turnos/' + fecha);
  
  set(turnoRef, {
    pareja: [empleado1, empleado2],
    actualizadoEn: new Date().toISOString()
  })
  .then(() => console.log("Turno guardado con éxito"))
  .catch((error) => console.error("Error al guardar:", error));
}

// 2. Escuchar cambios en tiempo real (se activa solo cada vez que alguien cambia un turno)
const todosLosTurnosRef = ref(db, 'turnos');

onValue(todosLosTurnosRef, (snapshot) => {
  const datos = snapshot.val();
  console.log("Datos recibidos de Firebase:", datos);
  
  // Aquí ejecutas la función que dibuja la tabla o calendario en tu HTML
  actualizarTablaUI(datos);
});