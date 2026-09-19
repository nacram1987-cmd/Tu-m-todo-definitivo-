/**
 * ALMACENAMIENTO - Tu Método Definitivo
 * 
 * Capa de persistencia: LocalStorage → IndexedDB
 * Con sincronización en la nube (Netlify).
 */

class AlmacenamientoLocal {
  constructor(clave = 'tmd_operaciones') {
    this.clave = clave;
    this.datos = this.cargar();
  }

  /**
   * Carga datos desde localStorage
   */
  cargar() {
    try {
      const json = localStorage.getItem(this.clave);
      return json ? JSON.parse(json) : [];
    } catch (e) {
      console.error('Error al cargar localStorage:', e);
      return [];
    }
  }

  /**
   * Guarda datos a localStorage
   */
  guardar(datos) {
    try {
      this.datos = datos;
      localStorage.setItem(this.clave, JSON.stringify(datos));
      return true;
    } catch (e) {
      console.error('Error al guardar localStorage:', e);
      return false;
    }
  }

  /**
   * Obtiene todos los datos
   */
  obtener() {
    return [...this.datos];
  }

  /**
   * Agrega una operación
   */
  agregar(operacion) {
    this.datos.push(operacion);
    this.guardar(this.datos);
    return operacion;
  }

  /**
   * Actualiza una operación
   */
  actualizar(id, cambios) {
    const idx = this.datos.findIndex(op => op.id === id);
    if (idx === -1) return null;
    
    this.datos[idx] = { ...this.datos[idx], ...cambios };
    this.guardar(this.datos);
    return this.datos[idx];
  }

  /**
   * Elimina una operación
   */
  eliminar(id) {
    const idx = this.datos.findIndex(op => op.id === id);
    if (idx === -1) return false;
    
    this.datos.splice(idx, 1);
    this.guardar(this.datos);
    return true;
  }

  /**
   * Limpia todos los datos
   */
  limpiar() {
    this.datos = [];
    localStorage.removeItem(this.clave);
  }

  /**
   * Exporta a JSON
   */
  exportar() {
    return JSON.stringify(this.datos, null, 2);
  }

  /**
   * Importa desde JSON
   */
  importar(json) {
    try {
      const datos = JSON.parse(json);
      if (!Array.isArray(datos)) throw new Error('Debe ser un array');
      
      this.datos = datos;
      this.guardar(this.datos);
      return true;
    } catch (e) {
      console.error('Error al importar:', e);
      return false;
    }
  }
}

/**
 * Sincronizador con Netlify
 */
class SincronizadorNube {
  constructor(usuario, baseURL = 'https://tu-dominio.netlify.app/.netlify/functions') {
    this.usuario = usuario;
    this.baseURL = baseURL;
    this.conectado = false;
  }

  /**
   * Sube datos a la nube
   */
  async subir(datos) {
    try {
      const respuesta = await fetch(`${this.baseURL}/guardar-datos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: this.usuario, datos })
      });

      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      
      this.conectado = true;
      return true;
    } catch (e) {
      console.error('Error al subir a nube:', e);
      this.conectado = false;
      return false;
    }
  }

  /**
   * Descarga datos de la nube
   */
  async descargar() {
    try {
      const respuesta = await fetch(`${this.baseURL}/obtener-datos?usuario=${this.usuario}`);
      
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      
      const { datos } = await respuesta.json();
      this.conectado = true;
      return datos;
    } catch (e) {
      console.error('Error al descargar de nube:', e);
      this.conectado = false;
      return null;
    }
  }

  /**
   * Sincroniza bidireccional (descarga → carga local → sube si hay cambios)
   */
  async sincronizar(almacenLocal) {
    const datosNube = await this.descargar();
    if (!datosNube) return false;

    // Comparar timestamps
    const timestampLocal = almacenLocal.datos[almacenLocal.datos.length - 1]?.timestamp || 0;
    const timestampNube = datosNube[datosNube.length - 1]?.timestamp || 0;

    if (timestampNube > timestampLocal) {
      // Nube es más reciente, cargar
      almacenLocal.importar(JSON.stringify(datosNube));
    } else if (timestampLocal > timestampNube) {
      // Local es más reciente, subir
      await this.subir(almacenLocal.obtener());
    }

    return true;
  }

  /**
   * Obtiene estado de conexión
   */
  estaConectado() {
    return this.conectado;
  }
}

/**
 * Gestor unificado de almacenamiento
 */
class GestorAlmacenamiento {
  constructor(usuario) {
    this.local = new AlmacenamientoLocal('tmd_operaciones');
    this.nube = new SincronizadorNube(usuario);
  }

  /**
   * Obtiene datos (prefiere local, fallback a nube)
   */
  async obtener() {
    return this.local.obtener();
  }

  /**
   * Guarda con intento de sincronización
   */
  async guardar(datos) {
    const ok = this.local.guardar(datos);
    
    // Intenta sincronizar en background (no bloquea)
    if (this.nube.estaConectado()) {
      this.nube.subir(datos).catch(e => console.log('Sync fallido:', e));
    }
    
    return ok;
  }

  /**
   * Sincronización forzada
   */
  async sincronizarAhora() {
    return await this.nube.sincronizar(this.local);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTAR
// ════════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AlmacenamientoLocal,
    SincronizadorNube,
    GestorAlmacenamiento
  };
}

const Almacenamiento = {
  AlmacenamientoLocal,
  SincronizadorNube,
  GestorAlmacenamiento
};
