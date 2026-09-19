/**
 * MOTOR FINANCIERO - Tu Método Definitivo
 * 
 * Módulo de cálculos financieros puros.
 * Sin estado global, sin efectos secundarios, testeable.
 * 
 * Exporta: Todas las funciones de cálculo
 */

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ════════════════════════════════════════════════════════════════════════════

const MES_INDEX = {
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11
};

const MESES = ["julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// ════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Redondea un número a N decimales
 * @param {number} num - Número a redondear
 * @param {number} decimales - Cantidad de decimales (default: 2)
 * @returns {number} Número redondeado
 */
function redondear(num, decimales = 2) {
  return Math.round(num * Math.pow(10, decimales)) / Math.pow(10, decimales);
}

/**
 * Comprueba si una operación está activa en un mes
 * @param {object} operacion - Operación con inicio/fin
 * @param {string} mes - Nombre del mes
 * @returns {boolean} true si está activa
 */
function esActivoEnMes(operacion, mes) {
  const mesIdx = MES_INDEX[mes];
  if (mesIdx === undefined) return false;
  
  const inicioIdx = MES_INDEX[operacion.inicio] || 0;
  const finIdx = operacion.fin ? MES_INDEX[operacion.fin] : 99;
  
  return mesIdx >= inicioIdx && mesIdx <= finIdx;
}

// ════════════════════════════════════════════════════════════════════════════
// CÁLCULOS PRINCIPALES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Calcula ingresos totales (excluye préstamos puente)
 * @param {array} operaciones - Lista de operaciones
 * @param {string} mes - Mes a calcular
 * @returns {number} Total de ingresos
 */
function calcularIngresosTotal(operaciones, mes) {
  return redondear(
    operaciones
      .filter(op => op.mes === mes && op.tipo === 'ingreso' && !op.esPuente)
      .reduce((suma, op) => suma + op.importe, 0)
  );
}

/**
 * Calcula gastos fijos totales (incluye financiaciones)
 * @param {array} operaciones - Lista de operaciones
 * @param {string} mes - Mes a calcular
 * @returns {number} Total de gastos fijos
 */
function calcularGastosFijosTotal(operaciones, mes) {
  // Gastos fijos ordinarios
  const gastosFijos = operaciones
    .filter(op => op.mes === mes && op.tipo === 'gasto' && op.esRecurrente && !op.esPuente)
    .reduce((suma, op) => suma + op.importe, 0);
  
  // Financiaciones (cuotas de préstamos)
  const financiaciones = operaciones
    .filter(op => op.tipo === 'financiacion' && esActivoEnMes(op, mes))
    .reduce((suma, op) => suma + op.importe, 0);
  
  return redondear(gastosFijos + financiaciones);
}

/**
 * Calcula provisiones totales (solo activas en el mes)
 * @param {array} operaciones - Lista de operaciones
 * @param {string} mes - Mes a calcular
 * @returns {number} Total de provisiones
 */
function calcularProvisionesTotal(operaciones, mes) {
  return redondear(
    operaciones
      .filter(op => op.tipo === 'provision' && esActivoEnMes(op, mes))
      .reduce((suma, op) => suma + op.importe, 0)
  );
}

/**
 * Calcula gastos variables totales
 * @param {array} operaciones - Lista de operaciones
 * @param {string} mes - Mes a calcular
 * @returns {number} Total de gastos variables
 */
function calcularGastosVariablesTotal(operaciones, mes) {
  return redondear(
    operaciones
      .filter(op => op.mes === mes && op.tipo === 'gasto' && !op.esRecurrente && !op.esPuente)
      .reduce((suma, op) => suma + op.importe, 0)
  );
}

/**
 * Calcula impacto de liquidaciones de compartidos
 * @param {array} operaciones - Lista de operaciones
 * @param {string} mes - Mes a calcular
 * @returns {number} Impacto neto
 */
function calcularImpactoLiquidaciones(operaciones, mes) {
  let impacto = 0;
  
  operaciones
    .filter(op => op.tipo === 'liquidacion' && op.mes === mes)
    .forEach(liq => {
      if (liq.sentido === 'me_deben') {
        impacto += liq.importe;
      } else {
        impacto -= liq.importe;
      }
    });
  
  return redondear(impacto);
}

/**
 * LA FÓRMULA CENTRAL - Calcula disponible real
 * 
 * DISPONIBLE = 
 *   Ingresos (sin puente)
 *   - Gastos Fijos (incluye financiaciones)
 *   - Provisiones
 *   - Gastos Variables
 *   + Liquidaciones (me_deben - yo_debo)
 * 
 * @param {array} operaciones - Lista de operaciones
 * @param {string} mes - Mes a calcular
 * @returns {number} Disponible real en el mes
 */
function calcularDisponibleReal(operaciones, mes) {
  const ingresos = calcularIngresosTotal(operaciones, mes);
  const gastosFijos = calcularGastosFijosTotal(operaciones, mes);
  const provisiones = calcularProvisionesTotal(operaciones, mes);
  const variables = calcularGastosVariablesTotal(operaciones, mes);
  const liquidaciones = calcularImpactoLiquidaciones(operaciones, mes);
  
  return redondear(ingresos - gastosFijos - provisiones - variables + liquidaciones);
}

/**
 * Calcula saldo acumulado desde inicio hasta un mes
 * @param {array} operaciones - Lista de operaciones
 * @param {string} mesLimite - Mes hasta el cual acumular
 * @returns {number} Saldo acumulado
 */
function calcularSaldoAcumulado(operaciones, mesLimite) {
  let total = 0;
  
  MESES.forEach(mes => {
    if (MES_INDEX[mes] <= MES_INDEX[mesLimite]) {
      total += calcularDisponibleReal(operaciones, mes);
    }
  });
  
  return redondear(total);
}

/**
 * Calcula provisión aportada acumulada
 * @param {array} operaciones - Lista de operaciones
 * @param {object} provision - La provisión
 * @param {string} mesLimite - Mes hasta el cual acumular
 * @returns {number} Total aportado
 */
function calcularProvisionAportadaAcumulada(operaciones, provision, mesLimite) {
  let total = 0;
  
  MESES.forEach(mes => {
    if (MES_INDEX[mes] <= MES_INDEX[mesLimite] && esActivoEnMes(provision, mes)) {
      // Buscar aportaciones reales de esta provisión en este mes
      const aportaciones = operaciones
        .filter(op => 
          op.mes === mes && 
          op.tipo === 'provision' && 
          op.concepto === provision.nombre
        )
        .reduce((suma, op) => suma + op.importe, 0);
      
      total += aportaciones;
    }
  });
  
  return redondear(total);
}

/**
 * Calcula provisión usada acumulada
 * @param {array} operaciones - Lista de operaciones
 * @param {object} provision - La provisión
 * @param {string} mesLimite - Mes hasta el cual acumular
 * @returns {number} Total usado
 */
function calcularProvisionUsadaAcumulada(operaciones, provision, mesLimite) {
  let total = 0;
  
  MESES.forEach(mes => {
    if (MES_INDEX[mes] <= MES_INDEX[mesLimite] && esActivoEnMes(provision, mes)) {
      // Buscar gastos relacionados a esta provisión
      const gastos = operaciones
        .filter(op => 
          op.mes === mes && 
          op.tipo === 'gasto' && 
          op.concepto === provision.nombre
        )
        .reduce((suma, op) => suma + op.importe, 0);
      
      total += gastos;
    }
  });
  
  return redondear(total);
}

/**
 * Calcula saldo disponible en una provisión
 * @param {array} operaciones - Lista de operaciones
 * @param {object} provision - La provisión
 * @param {string} mesLimite - Mes hasta el cual calcular
 * @returns {number} Saldo en la provisión
 */
function calcularSaldoProvision(operaciones, provision, mesLimite) {
  const aportado = calcularProvisionAportadaAcumulada(operaciones, provision, mesLimite);
  const usado = calcularProvisionUsadaAcumulada(operaciones, provision, mesLimite);
  return redondear(aportado - usado);
}

/**
 * Calcula compartidos pendiente
 * @param {object} compartido - El gasto compartido
 * @returns {number} Dinero aún pendiente
 */
function calcularCompartidoPendiente(compartido) {
  const liquidado = (compartido.liquidaciones || [])
    .reduce((suma, l) => suma + l.importe, 0);
  
  const pendiente = compartido.importeInicial - liquidado;
  return redondear(Math.max(0, pendiente));
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTAR
// ════════════════════════════════════════════════════════════════════════════

// Para Node.js/tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MES_INDEX,
    MESES,
    redondear,
    esActivoEnMes,
    calcularIngresosTotal,
    calcularGastosFijosTotal,
    calcularProvisionesTotal,
    calcularGastosVariablesTotal,
    calcularImpactoLiquidaciones,
    calcularDisponibleReal,
    calcularSaldoAcumulado,
    calcularProvisionAportadaAcumulada,
    calcularProvisionUsadaAcumulada,
    calcularSaldoProvision,
    calcularCompartidoPendiente
  };
}

// Para navegador (variables globales)
const MotorFinanciero = {
  MES_INDEX,
  MESES,
  redondear,
  esActivoEnMes,
  calcularIngresosTotal,
  calcularGastosFijosTotal,
  calcularProvisionesTotal,
  calcularGastosVariablesTotal,
  calcularImpactoLiquidaciones,
  calcularDisponibleReal,
  calcularSaldoAcumulado,
  calcularProvisionAportadaAcumulada,
  calcularProvisionUsadaAcumulada,
  calcularSaldoProvision,
  calcularCompartidoPendiente
};
