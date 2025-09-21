# Sistema de Asignación de Turnos - Oficina

## 📋 Descripción
Sistema web para la gestión y asignación automática de turnos de trabajo en una oficina. Permite registrar parejas de trabajadores, asignar turnos rotativamente y mantener un registro completo de auditoría.

## 🚀 Características

### 👥 Gestión de Usuario
- **Login seguro**: Acceso mediante nombre de usuario
- **Persistencia de sesión**: Mantiene la sesión activa
- **Auditoría completa**: Registro de todas las acciones por usuario

### 📅 Sistema de Turnos
- **2 turnos diarios**: 08:00-16:00 y 16:00-00:00
- **Ciclo semanal**: De jueves a jueves
- **Asignación automática**: Distribución equitativa entre parejas
- **Patrón consecutivo**: Alternancia sistemática entre equipos

### ⚙️ Funcionalidades
- ✅ Registro y edición de parejas trabajadoras
- ✅ Eliminación de parejas con confirmación
- ✅ Redistribución automática de turnos
- ✅ Patrón organizado consecutivo
- ✅ Descarga de tabla en formato CSV
- ✅ Función de impresión
- ✅ Datos de ejemplo pre-configurados

### 📝 Sistema de Notas
- **Editor de notas**: Para escribir observaciones
- **Notas guardadas**: Campo separado para notas permanentes
- **Auto-guardado**: Borrador automático mientras escribes
- **Gestión independiente**: Limpiar editor sin afectar notas guardadas

### 📊 Auditoría y Seguridad
- **Registro completo**: Todas las acciones quedan registradas
- **Protección con contraseña**: Limpieza de auditoría requiere clave "Jessica"
- **Timestamps precisos**: Fecha y hora de cada cambio
- **Trazabilidad**: Siempre se sabe quién hizo cada cambio

## 🛠️ Tecnologías Utilizadas
- HTML5
- CSS3 (Responsive Design)
- JavaScript (ES6+)
- LocalStorage para persistencia de datos

## 📦 Uso
1. Abrir `index.html` en cualquier navegador web moderno
2. Ingresar nombre de usuario para acceder
3. Cargar datos de ejemplo o registrar parejas manualmente
4. Usar botones para generar diferentes patrones de asignación

## 👥 Equipos de Ejemplo
- **Billy & Chex**
- **Humber & Casimiro** 
- **Josh & Axel**

## 🔒 Seguridad
- Acceso protegido mediante login
- Registro de auditoría inmutable
- Limpieza de registros protegida por contraseña

## 📱 Compatible
- ✅ Escritorio
- ✅ Tablets
- ✅ Móviles (diseño responsivo)

---
*Desarrollado para optimizar la gestión de turnos y mantener un control detallado de las asignaciones laborales.*