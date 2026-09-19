/**
 * MODELO DE DATOS - Tu Método Definitivo
 * 
 * Estructura y validación de operaciones.
 * Normalización, esquema, tipos, factories.
 */

// ════════════════════════════════════════════════════════════════════════════
// ESQUEMA DE OPERACIONES
// ════════════════════════════════════════════════════════════════════════════

const TIPOS_OPERACION = {
  INGRESO: 'ingreso',
  GASTO: 'gasto',
  PROVISION: 'provision',
  FINANCIACION: 'financiacion',
  LIQUIDACION: 'liquidacion'
};

const SENTIDOS_COMPARTIDO = {
  ME_DEBEN: 'me_deben',
  YO_DEBO: 'yo_debo'
};

/**
 * Schema de una operación básica
 */
const SCHEMA_OPERACION = {
  id: { tipo: 'string', requerido: true },
  tipo: { tipo: 'enum', valores: Object.values(TIPOS_OPERACION), requerido: true },
  concepto: { tipo: 'string', requerido: true },
  importe: { tipo: 'number', requerido: true, minimo: 0 },
  mes: { tipo: 'string', requerido: true },
  
  // Opcionales
  esPuente: { tipo: 'boolean', default: false },
  esRecurrente: { tipo: 'boolean', default: false },
  inicio: { tipo: 'string' },
  fin: { tipo: 'string' },
  notas: { tipo: 'string' },
  
  // Compartidos
  sentido: { tipo: 'enum', valores: Object.values(SENTIDOS_COMPARTIDO) },
  participantes: { tipo: 'array' },
  reparto: { tipo: 'object' },
  liquidaciones: { tipo: 'array' }
};

// ════════════════════════════════════════════════════════════════════════════
// FACTORY - CREAR OPERACIONES
// ════════════════════════════════════════════════════════════════════════════

class FactoryOperacion {
  /**
   * Crea una operación ingreso
   */
  static crearIngreso({ concepto, importe, mes, esPuente = false, notas = '' }) {
    return {
      id: generarId(),
      tipo: TIPOS_OPERACION.INGRESO,
      concepto,
      importe,
      mes,
      esPuente,
      notas,
      timestamp: Date.now()
    };
  }

  /**
   * Crea una operación gasto
   */
  static crearGasto({ concepto, importe, mes, esRecurrente = false, esPuente = false, notas = '' }) {
    return {
      id: generarId(),
      tipo: TIPOS_OPERACION.GASTO,
      concepto,
      importe,
      mes,
      esRecurrente,
      esPuente,
      notas,
      timestamp: Date.now()
    };
  }

  /**
   * Crea una provisión
   */
  static crearProvision({ concepto, importe, inicio, fin, notas = '' }) {
    return {
      id: generarId(),
      tipo: TIPOS_OPERACION.PROVISION,
      concepto,
      importe,
      inicio,
      fin,
      notas,
      timestamp: Date.now()
    };
  }

  /**
   * Crea una financiación
   */
  static crearFinanciacion({ concepto, importe, inicio, fin, notas = '' }) {
    return {
      id: generarId(),
      tipo: TIPOS_OPERACION.FINANCIACION,
      concepto,
      importe,
      inicio,
      fin,
      notas,
      timestamp: Date.now()
    };
  }

  /**
   * Crea una liquidación de compartido
   */
  static crearLiquidacion({ concepto, importe, mes, sentido, notas = '' }) {
    if (!Object.values(SENTIDOS_COMPARTIDO).includes(sentido)) {
      throw new Error(`Sentido inválido: ${sentido}`);
    }
    return {
      id: generarId(),
      tipo: TIPOS_OPERACION.LIQUIDACION,
      concepto,
      importe,
      mes,
      sentido,
      notas,
      timestamp: Date.now()
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// VALIDACIÓN
// ════════════════════════════════════════════════════════════════════════════

class Validador {
  /**
   * Valida una operación
   * @returns { valido: boolean, errores: string[] }
   */
  static validarOperacion(op) {
    const errores = [];

    // Tipo
    if (!op.tipo || !Object.values(TIPOS_OPERACION).includes(op.tipo)) {
      errores.push(`Tipo inválido: ${op.tipo}`);
    }

    // Concepto
    if (!op.concepto || typeof op.concepto !== 'string' || op.concepto.trim() === '') {
      errores.push('Concepto requerido y debe ser texto');
    }

    // Importe
    if (typeof op.importe !== 'number' || op.importe < 0) {
      errores.push(`Importe debe ser número positivo, recibido: ${op.importe}`);
    }

    // Mes (para ingresos/gastos/liquidaciones)
    if ([TIPOS_OPERACION.INGRESO, TIPOS_OPERACION.GASTO, TIPOS_OPERACION.LIQUIDACION].includes(op.tipo)) {
      if (!op.mes) {
        errores.push('Mes requerido para este tipo de operación');
      }
    }

    // Rango (para provisiones/financiaciones)
    if ([TIPOS_OPERACION.PROVISION, TIPOS_OPERACION.FINANCIACION].includes(op.tipo)) {
      if (!op.inicio) {
        errores.push('Mes inicio requerido para este tipo');
      }
      // fin es opcional
    }

    // Sentido (para liquidaciones)
    if (op.tipo === TIPOS_OPERACION.LIQUIDACION) {
      if (!op.sentido || !Object.values(SENTIDOS_COMPARTIDO).includes(op.sentido)) {
        errores.push(`Sentido inválido para liquidación: ${op.sentido}`);
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Valida un array de operaciones
   */
  static validarOperaciones(operaciones) {
    if (!Array.isArray(operaciones)) {
      return { valido: false, errores: ['Debe ser un array'] };
    }

    const resultado = {
      valido: true,
      errores: [],
      porOperacion: []
    };

    operaciones.forEach((op, idx) => {
      const v = this.validarOperacion(op);
      if (!v.valido) {
        resultado.valido = false;
        v.errores.forEach(e => {
          resultado.errores.push(`Op[${idx}] ${e}`);
        });
      }
      resultado.porOperacion.push(v);
    });

    return resultado;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// FILTROS Y BÚSQUEDAS
// ════════════════════════════════════════════════════════════════════════════

class RepositorioOperaciones {
  /**
   * Filtra operaciones por tipo
   */
  static filtrarPorTipo(operaciones, tipo) {
    return operaciones.filter(op => op.tipo === tipo);
  }

  /**
   * Filtra por mes
   */
  static filtrarPorMes(operaciones, mes) {
    return operaciones.filter(op => op.mes === mes);
  }

  /**
   * Filtra por concepto (búsqueda parcial)
   */
  static filtrarPorConcepto(operaciones, concepto) {
    const busca = concepto.toLowerCase();
    return operaciones.filter(op => op.concepto.toLowerCase().includes(busca));
  }

  /**
   * Obtiene operaciones de un mes específico
   */
  static obtenerDelMes(operaciones, mes) {
    return operaciones.filter(op => op.mes === mes || !op.mes);
  }

  /**
   * Busca por ID
   */
  static obtenerPorId(operaciones, id) {
    return operaciones.find(op => op.id === id);
  }

  /**
   * Cuenta operaciones por tipo
   */
  static contarPorTipo(operaciones) {
    const count = {};
    Object.values(TIPOS_OPERACION).forEach(tipo => {
      count[tipo] = operaciones.filter(op => op.tipo === tipo).length;
    });
    return count;
  }

  /**
   * Suma importes por tipo
   */
  static sumaPorTipo(operaciones) {
    const suma = {};
    Object.values(TIPOS_OPERACION).forEach(tipo => {
      suma[tipo] = operaciones
        .filter(op => op.tipo === tipo)
        .reduce((total, op) => total + op.importe, 0);
    });
    return suma;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// UTILITARIOS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Genera ID único
 */
function generarId() {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Serializa operaciones para guardar
 */
function serializarOperaciones(operaciones) {
  return JSON.stringify(operaciones, null, 2);
}

/**
 * Deserializa desde JSON
 */
function deserializarOperaciones(json) {
  try {
    const ops = JSON.parse(json);
    const validacion = Validador.validarOperaciones(ops);
    
    if (!validacion.valido) {
      console.warn('Advertencias de deserialización:', validacion.errores);
    }
    
    return ops;
  } catch (e) {
    console.error('Error al deserializar:', e);
    return [];
  }
}

/**
 * Clona una operación
 */
function clonarOperacion(op) {
  return JSON.parse(JSON.stringify(op));
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTAR
// ════════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TIPOS_OPERACION,
    SENTIDOS_COMPARTIDO,
    SCHEMA_OPERACION,
    FactoryOperacion,
    Validador,
    RepositorioOperaciones,
    generarId,
    serializarOperaciones,
    deserializarOperaciones,
    clonarOperacion
  };
}

const DatosModelo = {
  TIPOS_OPERACION,
  SENTIDOS_COMPARTIDO,
  SCHEMA_OPERACION,
  FactoryOperacion,
  Validador,
  RepositorioOperaciones,
  generarId,
  serializarOperaciones,
  deserializarOperaciones,
  clonarOperacion
};
