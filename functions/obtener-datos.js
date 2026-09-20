/**
 * NETLIFY FUNCTION: Obtener Datos
 * 
 * GET /api/obtener-datos?usuario=email@example.com
 * 
 * Respuesta:
 *   - 200: { success: true, datos: array, timestamp: string }
 *   - 404: { success: false, error: 'No hay datos para este usuario' }
 *   - 400: { success: false, error: string }
 */

const fs = require('fs');
const path = require('path');

const DATOS_DIR = process.env.DATOS_DIR || '/tmp/tmd-datos';

exports.handler = async (event) => {
  // Solo aceptar GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        success: false,
        error: 'Método no permitido. Use GET.'
      })
    };
  }

  try {
    const usuario = event.queryStringParameters?.usuario;

    if (!usuario || typeof usuario !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Parámetro "usuario" requerido'
        })
      };
    }

    // Sanitizar usuario
    const usuarioSano = usuario
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .slice(0, 100);

    const archivoUsuario = path.join(DATOS_DIR, `${usuarioSano}.json`);

    // Verificar si existe el archivo
    if (!fs.existsSync(archivoUsuario)) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'No hay datos para este usuario',
          usuario: usuarioSano
        })
      };
    }

    // Leer archivo
    const contenido = fs.readFileSync(archivoUsuario, 'utf-8');
    const datosGuardados = JSON.parse(contenido);

    console.log(`[OBTENER] ${usuarioSano}: ${datosGuardados.operaciones.length} operaciones`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        usuario: usuarioSano,
        datos: datosGuardados.operaciones,
        timestamp: datosGuardados.timestamp,
        cantidad: datosGuardados.operaciones.length
      })
    };
  } catch (error) {
    console.error('[ERROR] obtener-datos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
