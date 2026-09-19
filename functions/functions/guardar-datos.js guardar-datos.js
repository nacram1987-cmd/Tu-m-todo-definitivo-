/**
 * NETLIFY FUNCTION: Guardar Datos
 * 
 * POST /api/guardar-datos
 * Body: { usuario: string, datos: array }
 * 
 * Respuesta:
 *   - 200: { success: true, guardado: true }
 *   - 400: { success: false, error: string }
 *   - 500: { success: false, error: string }
 */

const fs = require('fs');
const path = require('path');

// Directorio para almacenar datos (en Netlify, usar variable de entorno)
const DATOS_DIR = process.env.DATOS_DIR || '/tmp/tmd-datos';

// Asegurar que el directorio existe
if (!fs.existsSync(DATOS_DIR)) {
  fs.mkdirSync(DATOS_DIR, { recursive: true });
}

exports.handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        success: false,
        error: 'Método no permitido. Use POST.'
      })
    };
  }

  try {
    const { usuario, datos } = JSON.parse(event.body || '{}');

    // Validar entrada
    if (!usuario || typeof usuario !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Usuario es requerido y debe ser string'
        })
      };
    }

    if (!Array.isArray(datos)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Datos debe ser un array'
        })
      };
    }

    // Sanitizar usuario (solo caracteres seguros)
    const usuarioSano = usuario
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .slice(0, 100);

    if (!usuarioSano) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Usuario inválido después de sanitizar'
        })
      };
    }

    // Ruta del archivo de datos del usuario
    const archivoUsuario = path.join(DATOS_DIR, `${usuarioSano}.json`);

    // Preparar datos a guardar
    const datosGuardar = {
      usuario: usuarioSano,
      timestamp: new Date().toISOString(),
      operaciones: datos,
      cantidad: datos.length
    };

    // Escribir archivo
    fs.writeFileSync(
      archivoUsuario,
      JSON.stringify(datosGuardar, null, 2)
    );

    console.log(`[GUARDAR] ${usuarioSano}: ${datos.length} operaciones guardadas`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        guardado: true,
        usuario: usuarioSano,
        cantidad: datos.length,
        timestamp: datosGuardar.timestamp
      })
    };
  } catch (error) {
    console.error('[ERROR] guardar-datos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
