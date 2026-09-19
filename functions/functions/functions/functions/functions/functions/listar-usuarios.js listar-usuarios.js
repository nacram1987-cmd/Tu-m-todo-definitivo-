/**
 * NETLIFY FUNCTION: Listar Usuarios
 * 
 * GET /api/listar-usuarios (requiere token)
 * 
 * Respuesta:
 *   - 200: { success: true, usuarios: array, total: number }
 *   - 401: { success: false, error: 'No autorizado' }
 */

const fs = require('fs');
const path = require('path');

const DATOS_DIR = process.env.DATOS_DIR || '/tmp/tmd-datos';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'tmd-beta-2026';

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
    // Verificar token
    const token = event.headers['authorization']?.replace('Bearer ', '');
    if (token !== ADMIN_TOKEN) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'No autorizado'
        })
      };
    }

    // Listar archivos de usuarios
    if (!fs.existsSync(DATOS_DIR)) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          usuarios: [],
          total: 0
        })
      };
    }

    const archivos = fs.readdirSync(DATOS_DIR);
    const usuarios = [];

    for (const archivo of archivos) {
      if (!archivo.endsWith('.json')) continue;

      const ruta = path.join(DATOS_DIR, archivo);
      const contenido = fs.readFileSync(ruta, 'utf-8');
      const datos = JSON.parse(contenido);

      usuarios.push({
        usuario: datos.usuario,
        operaciones: datos.cantidad,
        ultimaActualizacion: datos.timestamp,
        tamano: fs.statSync(ruta).size
      });
    }

    // Ordenar por fecha más reciente
    usuarios.sort((a, b) => 
      new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion)
    );

    console.log(`[LISTAR] ${usuarios.length} usuarios en la beta`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        usuarios,
        total: usuarios.length,
        operacionesTotales: usuarios.reduce((sum, u) => sum + u.operaciones, 0)
      })
    };
  } catch (error) {
    console.error('[ERROR] listar-usuarios:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
