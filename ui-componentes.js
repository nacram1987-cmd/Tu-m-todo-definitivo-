/**
 * UI COMPONENTES - Tu Método Definitivo
 * 
 * Funciones puras para renderizar elementos.
 * Retornan HTML strings o elementos DOM.
 */

// ════════════════════════════════════════════════════════════════════════════
// FORMATEO
// ════════════════════════════════════════════════════════════════════════════

/**
 * Formatea número como moneda
 * @param {number} cantidad - Cantidad a formatear
 * @param {string} simbolo - Símbolo moneda (default: €)
 * @param {number} decimales - Decimales (default: 2)
 * @returns {string} "124,50€" o "-250€"
 */
function formatMoneda(cantidad, simbolo = '€', decimales = 2) {
  const sign = cantidad < 0 ? '-' : '';
  const abs = Math.abs(cantidad).toFixed(decimales);
  return `${sign}${abs}${simbolo}`;
}

/**
 * Formatea con signo visible
 * @param {number} cantidad
 * @returns {string} "+124€" o "-250€"
 */
function formatConSigno(cantidad) {
  if (cantidad === 0) return '0€';
  return (cantidad > 0 ? '+' : '') + formatMoneda(cantidad);
}

/**
 * Formatea porcentaje
 * @param {number} valor - Valor 0-100
 * @returns {string} "45%" o "100%"
 */
function formatPorcentaje(valor) {
  return `${Math.round(valor)}%`;
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════

/**
 * Renderiza el dashboard hero con 4 KPIs
 */
function renderizarDashboard({
  disponibleHoy = 0,
  proximoCompromiso = 0,
  progreso = 0,
  compartidosNeto = 0,
  provisionesHoy = 0,
  estaEnDeficit = false,
  estaEnRiesgo = false
}) {
  const clasAlerta = estaEnDeficit 
    ? 'dashboard-alert alert-defict' 
    : estaEnRiesgo 
    ? 'dashboard-alert alert-riesgo' 
    : '';

  const textoAlerta = estaEnDeficit
    ? '🚨 ALERTA: Disponible negativo'
    : estaEnRiesgo
    ? '⚠️ RIESGO: Margen muy estrecho'
    : '';

  return `
    <div class="dashboard-hero">
      <div class="hero-principal">
        <div class="hero-etiqueta">💰 DISPONIBLE HOY</div>
        <div class="hero-valor ${estaEnDeficit ? 'negativo' : ''}">${formatMoneda(disponibleHoy)}</div>
        <div class="hero-subtitulo">Dinero real que puedes gastar sin problema</div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card">
          <div class="card-icono">⚠️</div>
          <div class="card-titulo">PRÓXIMO COMPROMISO</div>
          <div class="card-valor">${formatMoneda(proximoCompromiso)}</div>
        </div>

        <div class="dashboard-card">
          <div class="card-icono">📈</div>
          <div class="card-titulo">HACIA OBJETIVO</div>
          <div class="card-valor">${formatPorcentaje(progreso)}</div>
        </div>

        <div class="dashboard-card">
          <div class="card-icono">🤝</div>
          <div class="card-titulo">COMPARTIDOS NETO</div>
          <div class="card-valor">${formatConSigno(compartidosNeto)}</div>
        </div>

        <div class="dashboard-card">
          <div class="card-icono">🏺</div>
          <div class="card-titulo">PROVISIONES HOY</div>
          <div class="card-valor">${formatMoneda(provisionesHoy)}</div>
        </div>
      </div>

      ${textoAlerta ? `<div class="${clasAlerta}">${textoAlerta}</div>` : ''}

      <div class="dashboard-actions">
        <button class="btn-primario">📝 Registrar Gasto</button>
        <button class="btn-secundario">📊 Ver Análisis</button>
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════════════════════
// TABLAS Y LISTAS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Renderiza tabla de operaciones
 */
function renderizarTablaOperaciones(operaciones) {
  if (operaciones.length === 0) {
    return '<p class="sin-datos">No hay operaciones registradas</p>';
  }

  const filas = operaciones.map(op => `
    <tr>
      <td>${op.concepto}</td>
      <td>${op.tipo}</td>
      <td>${formatMoneda(op.importe)}</td>
      <td>${op.mes || '—'}</td>
      <td>
        <button class="btn-editar" data-id="${op.id}">✏️</button>
        <button class="btn-eliminar" data-id="${op.id}">🗑️</button>
      </td>
    </tr>
  `).join('');

  return `
    <table class="tabla-operaciones">
      <thead>
        <tr>
          <th>Concepto</th>
          <th>Tipo</th>
          <th>Importe</th>
          <th>Mes</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>
  `;
}

/**
 * Renderiza lista resumida
 */
function renderizarListaResumida(operaciones, tipo) {
  const filtradas = operaciones.filter(op => op.tipo === tipo);
  
  if (filtradas.length === 0) {
    return `<p class="sin-datos">No hay ${tipo}s</p>`;
  }

  const items = filtradas.slice(0, 5).map(op => `
    <div class="lista-item">
      <span class="item-concepto">${op.concepto}</span>
      <span class="item-importe">${formatMoneda(op.importe)}</span>
    </div>
  `).join('');

  return `
    <div class="lista-resumida">
      ${items}
      ${filtradas.length > 5 ? `<p class="ver-mas">+${filtradas.length - 5} más</p>` : ''}
    </div>
  `;
}

// ════════════════════════════════════════════════════════════════════════════
// FORMS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Renderiza formulario de ingreso
 */
function renderizarFormIngreso(meses) {
  return `
    <form class="form-operacion" id="form-ingreso">
      <div class="form-grupo">
        <label>Concepto</label>
        <input type="text" name="concepto" required />
      </div>

      <div class="form-grupo">
        <label>Importe</label>
        <input type="number" name="importe" min="0" step="0.01" required />
      </div>

      <div class="form-grupo">
        <label>Mes</label>
        <select name="mes" required>
          <option value="">Seleccionar...</option>
          ${meses.map(m => `<option value="${m}">${m}</option>`).join('')}
        </select>
      </div>

      <div class="form-grupo">
        <label>
          <input type="checkbox" name="esPuente" />
          ¿Es préstamo puente?
        </label>
      </div>

      <div class="form-grupo">
        <label>Notas</label>
        <textarea name="notas" rows="3"></textarea>
      </div>

      <button type="submit" class="btn-guardar">Guardar Ingreso</button>
    </form>
  `;
}

/**
 * Renderiza formulario de gasto
 */
function renderizarFormGasto(meses) {
  return `
    <form class="form-operacion" id="form-gasto">
      <div class="form-grupo">
        <label>Concepto</label>
        <input type="text" name="concepto" required />
      </div>

      <div class="form-grupo">
        <label>Importe</label>
        <input type="number" name="importe" min="0" step="0.01" required />
      </div>

      <div class="form-grupo">
        <label>Mes</label>
        <select name="mes" required>
          <option value="">Seleccionar...</option>
          ${meses.map(m => `<option value="${m}">${m}</option>`).join('')}
        </select>
      </div>

      <div class="form-grupo">
        <label>
          <input type="checkbox" name="esRecurrente" />
          ¿Gasto recurrente?
        </label>
      </div>

      <div class="form-grupo">
        <label>
          <input type="checkbox" name="esPuente" />
          ¿Excluir de cálculos?
        </label>
      </div>

      <div class="form-grupo">
        <label>Notas</label>
        <textarea name="notas" rows="3"></textarea>
      </div>

      <button type="submit" class="btn-guardar">Guardar Gasto</button>
    </form>
  `;
}

// ════════════════════════════════════════════════════════════════════════════
// MODALES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Renderiza modal genérico
 */
function renderizarModal({ titulo, contenido, botones = [] }) {
  const botonesHTML = botones.map(btn => 
    `<button class="btn-modal" data-accion="${btn.accion}">${btn.texto}</button>`
  ).join('');

  return `
    <div class="modal-overlay">
      <div class="modal-contenido">
        <div class="modal-header">
          <h2>${titulo}</h2>
          <button class="modal-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          ${contenido}
        </div>
        <div class="modal-footer">
          ${botonesHTML}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza toast (notificación)
 */
function renderizarToast({ mensaje, tipo = 'info' }) {
  return `
    <div class="toast toast-${tipo}">
      ${tipo === 'exito' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️'}
      ${mensaje}
    </div>
  `;
}

// ════════════════════════════════════════════════════════════════════════════
// ESTADÍSTICAS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Renderiza resumen estadístico
 */
function renderizarEstadisticas({
  totalIngresos = 0,
  totalGastos = 0,
  totalProvisionado = 0,
  conteoOperaciones = {}
}) {
  return `
    <div class="estadisticas">
      <div class="estadistica-card">
        <div class="est-icono">💰</div>
        <div class="est-titulo">Ingresos Totales</div>
        <div class="est-valor">${formatMoneda(totalIngresos)}</div>
      </div>

      <div class="estadistica-card">
        <div class="est-icono">📉</div>
        <div class="est-titulo">Gastos Totales</div>
        <div class="est-valor negativo">${formatMoneda(totalGastos)}</div>
      </div>

      <div class="estadistica-card">
        <div class="est-icono">🏺</div>
        <div class="est-titulo">Provisionado</div>
        <div class="est-valor">${formatMoneda(totalProvisionado)}</div>
      </div>

      <div class="estadistica-card">
        <div class="est-icono">📊</div>
        <div class="est-titulo">Total Operaciones</div>
        <div class="est-valor">${Object.values(conteoOperaciones).reduce((a,b) => a+b, 0)}</div>
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTAR
// ════════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatMoneda,
    formatConSigno,
    formatPorcentaje,
    renderizarDashboard,
    renderizarTablaOperaciones,
    renderizarListaResumida,
    renderizarFormIngreso,
    renderizarFormGasto,
    renderizarModal,
    renderizarToast,
    renderizarEstadisticas
  };
}

const UIComponentes = {
  formatMoneda,
  formatConSigno,
  formatPorcentaje,
  renderizarDashboard,
  renderizarTablaOperaciones,
  renderizarListaResumida,
  renderizarFormIngreso,
  renderizarFormGasto,
  renderizarModal,
  renderizarToast,
  renderizarEstadisticas
};
