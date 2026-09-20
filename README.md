# 🌊 Fluxia

**Tu plan financiero, control absoluto · flujo perfecto**

App de planificación financiera personal. Ordena cada mes en un orden fijo: **ingresos → gastos fijos → provisiones → gastos variables**. Te dice cuánto te queda y sigue dos metas: amortizar el déficit y llenar tu fondo de emergencia.

## ✨ Características

- 💰 **Disponible Real**: Calcula exactamente cuánto puedes gastar sin problema
- 📊 **Dashboard Intuitivo**: Todo en una pantalla, los números que importan
- 🏦 **Importación CSV**: Carga movimientos de tu banco (Revolut, Caixa, genérico)
- 🏺 **Provisiones Inteligentes**: Aparta dinero cada mes para gastos ocasionales, con avisos de reposición si las usas como préstamo
- 🤝 **Gastos Compartidos**: Control total de quién debe qué, reparto a medias o completo
- 💳 **Financiaciones**: Sigue tus cuotas y saldos pendientes
- 🔐 **Face ID**: Protege tus datos con autenticación biométrica (desactivable)
- 🌙 **Modo Oscuro**: Tema claro/oscuro automático según tu dispositivo
- 📱 **PWA**: Funciona offline, instálate como app en iOS/Android

## 🚀 Versión Actual

**v3.5** — últimas mejoras:
- ✅ Logo unificado Fluxia en todas partes (Face ID, dashboard, iOS)
- ✅ Retiros temporales de provisiones con aviso de reposición
- ✅ CSV con selección completa (antes solo importaba 15 movimientos)
- ✅ Eliminado el confirm() nativo en importaciones

## 🔧 Tecnología

- HTML5 + CSS3 + JavaScript vanilla (sin frameworks)
- localStorage para persistencia
- WebAuthn para Face ID
- Responsive (móvil, tablet, desktop)

## 🌐 Acceso

- **Web**: https://nacram1987-cmd.github.io/Tu-m-todo-definitivo-
- **CDN**: https://rawcdn.githack.com/nacram1987-cmd/Tu-m-todo-definitivo-/main/index.html
- **Instalar en iOS**: Safari → Compartir → Añadir a pantalla de inicio
- **Instalar en Android**: Botón de menú → Instalar app

## 📋 Flujo de Datos

1. **Ingresos**: Todo lo que entra (nómina, pensión, ingresos variables)
2. **Gastos Fijos**: Lo que se repite cada mes (alquiler, seguros, suministros)
3. **Provisiones**: Cuota mensual para gastos ocasionales (reparaciones, eventos)
4. **Gastos Variables**: Lo que sobra (comida, ocio, gasolina) — los únicos que realmente controlas
5. **Financiaciones**: Cuotas de deudas o créditos
6. **Disponible Real** = Ingresos - Fijos - Provisiones - Variables

## 🛡️ Seguridad

- Datos almacenados **solo en tu dispositivo** (localStorage)
- Sin conexión a servidores externos (excepto banco para CSV)
- Face ID local, sin biometría remota
- Opción de desactivar Face ID permanentemente

## 🗂️ Estructura del Repo

```
Tu-m-todo-definitivo-/
├── index.html          (app completa, 8000+ líneas)
├── README.md           (este archivo)
└── ... (solo HTML, todo embebido)
```

## 📝 Cómo Empezar

1. Abre https://nacram1987-cmd.github.io/Tu-m-todo-definitivo-
2. Sigue el asistente (5 pasos): ingresos, fijos, fondo de emergencia, déficit, revisión
3. Importa tu CSV del banco o añade gastos manualmente
4. Elige modo de bloqueo (Face ID, contraseña, o ninguno)

## 🔄 Importar/Exportar

- **Importar**: Pestaña "Datos" → "Importar CSV" (banco) o "Restaurar copia de seguridad"
- **Exportar**: Pestaña "Datos" → "Exportar Datos" → descarga como JSON

## ⚙️ FAQ

**¿Se ven mis datos en la nube?**  
No. Todo queda en tu dispositivo. No hay servidor.

**¿Puedo usar en varios dispositivos?**  
Aún no. Planeado: sincronización OAuth en v4.0.

**¿Soportas más bancos?**  
Ahora: Revolut, Caixa, genérico. Puedes enviar un CSV de cualquier banco si el formato es fecha-concepto-importe.

**¿Face ID funciona en Desktop?**  
Sí, pero depende del navegador (Chrome/Edge/Safari moderno soportan WebAuthn).

---

**Fluxia** — Control absoluto · Flujo perfecto  
v3.5 — Septiembre 2026
