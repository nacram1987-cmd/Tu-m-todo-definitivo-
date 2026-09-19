/**
 * APP - Tu Método Definitivo FASE 4
 * 
 * Versión con Netlify Functions integrado + datos iniciales
 */

class AplicacionTMDBeta {
  constructor(elementoRaiz = '#app') {
    this.estado = {
      operaciones: [],
      mesActual: 'septiembre',
      usuarioId: this.obtenerUsuario(),
      isLoading: false,
      modo: 'ver',
      conectadoNube: false
    };

    this.motor = MotorFinanciero;
    this.datos = DatosModelo;
    this.almacen = new Almacenamiento.AlmacenamientoLocal();
    this.ui = UIComponentes;
    this.raiz = document.querySelector(elementoRaiz);

    // URL base de Netlify (cambiar por tu dominio)
    this.NETLIFY_BASE = process.env.NETLIFY_URL || window.location.origin;
  }

  obtenerUsuario() {
    let usuario = localStorage.getItem('tmd_usuario');
    if (!usuario) {
      usuario = `usuario_${Date.now()}@tmd.local`;
      localStorage.setItem('tmd_usuario', usuario);
    }
    return usuario;
  }

  async iniciar() {
    console.log('🚀 Iniciando Fase 4 Beta...');

    try {
      // Cargar datos (local primero, luego nube)
      await this.cargarDatos();

      // Renderizar
      this.renderizar();

      // Vincular eventos
      this.vincularEventos();

      console.log('✅ App lista (usuario: ' + this.estado.usuarioId + ')');
    } catch (error) {
      console.error('❌ Error al iniciar:', error);
      this.mostrarError('No se pudo iniciar la aplicación');
    }
  }

  async cargarDatos() {
    // Primero intentar cargar de Netlify
    try {
      const datosNube = await this.descargarDeNube();
      if (datosNube && datosNube.length > 0) {
        this.estado.operaciones = datosNube;
        this.estado.conectadoNube = true;
        console.log('✅ Datos cargados desde nube');
        return;
      }
    } catch (e) {
      console.warn('⚠️ No se pudo conectar con nube:', e.message);
    }

    // Fallback: cargar de localStorage
    const local = this.almacen.obtener();
    if (local.length === 0) {
      // Si está vacío, cargar datos demo
      this.estado.operaciones = this.crearDemosDatos();
      this.almacen.guardar(this.estado.operaciones);
      console.log('📦 Datos demo cargados');
    } else {
      this.estado.operaciones = local;
      console.log('📦 Datos locales cargados');
    }
  }

  crearDemosDatos() {
    return [
      // Septiembre (mes actual)
      this.datos.FactoryOperacion.crearIngreso({
        concepto: 'Salario mensual',
        importe: 2500,
        mes: 'septiembre'
      }),
      this.datos.FactoryOperacion.crearGasto({
        concepto: 'Alquiler',
        importe: 600,
        mes: 'septiembre',
        esRecurrente: true
      }),
      this.datos.FactoryOperacion.crearGasto({
        concepto: 'Servicios',
        importe: 150,
        mes: 'septiembre',
        esRecurrente: true
      }),
      this.datos.FactoryOperacion.crearGasto({
        concepto: 'Cena fuera',
        importe: 45,
        mes: 'septiembre',
        esRecurrente: false
      }),
      this.datos.FactoryOperacion.crearProvision({
        concepto: 'Amortización',
        importe: 1268,
        inicio: 'julio',
        fin: 'diciembre'
      }),
      this.datos.FactoryOperacion.crearFinanciacion({
        concepto: 'Préstamo coche',
        importe: 350,
        inicio: 'julio',
        fin: 'diciembre'
      }),

      // Julio y agosto (meses anteriores)
      this.datos.FactoryOperacion.crearIngreso({
        concepto: 'Salario mensual',
        importe: 2500,
        mes: 'julio'
      }),
      this.datos.FactoryOperacion.crearGasto({
        concepto: 'Alquiler',
        importe: 600,
        mes: 'julio',
        esRecurrente: true
      }),
      this.datos.FactoryOperacion.crearIngreso({
        concepto: 'Salario mensual',
        importe: 2500,
        mes: 'agosto'
      }),
      this.datos.FactoryOperacion.crearGasto({
        concepto: 'Alquiler',
        importe: 600,
        mes: 'agosto',
        esRecurrente: true
      })
    ];
  }

  renderizar() {
    const disponible = this.motor.calcularDisponibleReal(
      this.estado.operaciones,
      this.estado.mesActual
    );

    const proximoCompromiso = this.motor.calcularGastosFijosTotal(
      this.estado.operaciones,
      this.estado.mesActual
    );

    const saldoAcum = this.motor.calcularSaldoAcumulado(
      this.estado.operaciones,
      this.estado.mesActual
    );

    const progreso = (saldoAcum / 16500) * 100;

    const dashboardHTML = this.ui.renderizarDashboard({
      disponibleHoy: disponible,
      proximoCompromiso,
      progreso: Math.max(0, Math.min(100, progreso)),
      compartidosNeto: 0,
      provisionesHoy: this.motor.calcularProvisionesTotal(
        this.estado.operaciones,
        this.estado.mesActual
      ),
      estaEnDeficit: disponible < 0,
      estaEnRiesgo: disponible > 0 && disponible < 100
    });

    const operacionesMes = this.datos.RepositorioOperaciones.filtrarPorMes(
      this.estado.operaciones,
      this.estado.mesActual
    );

    const tablaHTML = operacionesMes.length > 0
      ? this.ui.renderizarTablaOperaciones(operacionesMes)
      : '<p class="sin-datos">No hay operaciones este mes</p>';

    const estadisticas = this.datos.RepositorioOperaciones.contarPorTipo(
      this.estado.operaciones
    );

    const statusNube = this.estado.conectadoNube
      ? '<span style="color: var(--color-success);">✅ Conectado</span>'
      : '<span style="color: var(--color-warning);">⚠️ Local</span>';

    this.raiz.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="beta-badge">🧪 BETA PRIVADA</div>
          <h1>📊 Tu Método Definitivo</h1>
          <nav class="app-nav">
            <button class="nav-item activo" data-seccion="inicio">🏠 Inicio</button>
            <button class="nav-item" data-seccion="operaciones">📋 Operaciones</button>
            <button class="nav-item" data-seccion="analisis">📈 Análisis</button>
          </nav>
          <div style="margin-top: 10px; font-size: 0.9rem; color: var(--color-text-muted);">
            ${statusNube} | Usuario: ${this.estado.usuarioId.split('@')[0]}
          </div>
        </header>

        <main class="app-main">
          ${dashboardHTML}
          
          <section class="operaciones-mes">
            <h2>Operaciones de ${this.estado.mesActual}</h2>
            ${tablaHTML}
          </section>

          <section class="stats-section" style="margin-top: 40px;">
            <h2>📊 Estadísticas</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Ingresos</div>
                <div class="stat-valor">${this.ui.formatMoneda(
                  this.motor.calcularIngresosTotal(this.estado.operaciones, this.estado.mesActual)
                )}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Gastos</div>
                <div class="stat-valor negativo">${this.ui.formatMoneda(
                  this.motor.calcularGastosFijosTotal(this.estado.operaciones, this.estado.mesActual) +
                  this.motor.calcularGastosVariablesTotal(this.estado.operaciones, this.estado.mesActual)
                )}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Operaciones</div>
                <div class="stat-valor">${this.estado.operaciones.length}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Saldo Acum.</div>
                <div class="stat-valor">${this.ui.formatMoneda(saldoAcum)}</div>
              </div>
            </div>
          </section>
        </main>

        <footer class="app-footer">
          <p>v4.0 Beta | Motor probado (86% coverage) | Netlify Functions sincronizado</p>
        </footer>
      </div>
    `;

    // Guardar automáticamente en nube
    this.guardarEnNube().catch(e => console.warn('⚠️ No se guardó en nube:', e.message));
  }

  vincularEventos() {
    // Botones del dashboard
    this.raiz.addEventListener('click', (e) => {
      if (e.target.textContent.includes('Registrar Gasto')) {
        this.abrirFormGasto();
      }
      if (e.target.textContent.includes('Ver Análisis')) {
        this.mostrarAnalisis();
      }
      if (e.target.classList.contains('nav-item')) {
        this.cambiarSeccion(e.target.dataset.seccion);
      }
    });

    // Botones de tabla (editar/eliminar)
    this.raiz.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', (e) => this.editarOperacion(e.target.dataset.id));
    });

    this.raiz.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', (e) => this.confirmarEliminar(e.target.dataset.id));
    });
  }

  abrirFormGasto() {
    const formHTML = this.ui.renderizarFormGasto(this.motor.MESES);
    const modal = this.crearModal({
      titulo: '📝 Registrar Nuevo Gasto',
      contenido: formHTML,
      botones: [
        { texto: 'Guardar', accion: 'guardar' },
        { texto: 'Cancelar', accion: 'cancelar' }
      ]
    });

    modal.querySelector('[data-accion="guardar"]').addEventListener('click', (e) => {
      const form = modal.querySelector('form');
      const datos = new FormData(form);

      this.agregarOperacion('gasto', {
        concepto: datos.get('concepto'),
        importe: parseFloat(datos.get('importe')),
        mes: datos.get('mes'),
        esRecurrente: datos.has('esRecurrente')
      });

      modal.remove();
    });

    modal.querySelector('[data-accion="cancelar"]')?.addEventListener('click', () => modal.remove());
  }

  agregarOperacion(tipo, datos) {
    try {
      const op = this.datos.FactoryOperacion['crear' + 
        tipo.charAt(0).toUpperCase() + tipo.slice(1)](datos);

      const validacion = this.datos.Validador.validarOperacion(op);
      if (!validacion.valido) {
        throw new Error(validacion.errores.join(', '));
      }

      this.almacen.agregar(op);
      this.estado.operaciones.push(op);

      this.mostrarToast({
        mensaje: `✅ ${datos.concepto} agregado`,
        tipo: 'exito'
      });

      this.renderizar();
    } catch (error) {
      this.mostrarToast({
        mensaje: `❌ Error: ${error.message}`,
        tipo: 'error'
      });
    }
  }

  crearModal({ titulo, contenido, botones = [] }) {
    const html = this.ui.renderizarModal({ titulo, contenido, botones });
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const modal = temp.firstElementChild;

    document.body.appendChild(modal);

    modal.querySelector('.modal-cerrar')?.addEventListener('click', () => modal.remove());

    return modal;
  }

  mostrarToast({ mensaje, tipo = 'info' }) {
    const html = this.ui.renderizarToast({ mensaje, tipo });
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const toast = temp.firstElementChild;

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  mostrarError(mensaje) {
    this.mostrarToast({ mensaje: `⚠️ ${mensaje}`, tipo: 'error' });
  }

  confirmarEliminar(id) {
    const op = this.datos.RepositorioOperaciones.obtenerPorId(
      this.estado.operaciones,
      id
    );
    if (!op) return;

    const modal = this.crearModal({
      titulo: '🗑️ Eliminar',
      contenido: `<p>¿Eliminar "${op.concepto}"?</p>`,
      botones: [
        { texto: 'Eliminar', accion: 'eliminar' },
        { texto: 'Cancelar', accion: 'cancelar' }
      ]
    });

    modal.querySelector('[data-accion="eliminar"]').addEventListener('click', () => {
      this.almacen.eliminar(id);
      this.estado.operaciones = this.estado.operaciones.filter(o => o.id !== id);
      this.mostrarToast({ mensaje: 'Eliminado', tipo: 'exito' });
      this.renderizar();
      modal.remove();
    });

    modal.querySelector('[data-accion="cancelar"]')?.addEventListener('click', () => modal.remove());
  }

  cambiarSeccion(seccion) {
    console.log('Cambiando a:', seccion);
    // Aquí irían otras secciones
    this.renderizar();
  }

  mostrarAnalisis() {
    this.mostrarToast({
      mensaje: 'Análisis detallado - próximamente en Fase 5',
      tipo: 'info'
    });
  }

  async guardarEnNube() {
    try {
      const endpoint = `${this.NETLIFY_BASE}/.netlify/functions/guardar-datos`;
      const respuesta = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: this.estado.usuarioId,
          datos: this.estado.operaciones
        })
      });

      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

      const resultado = await respuesta.json();
      if (resultado.success) {
        this.estado.conectadoNube = true;
        console.log('☁️ Guardado en nube');
      }
    } catch (e) {
      console.warn('⚠️ No se guardó en nube:', e.message);
      this.estado.conectadoNube = false;
    }
  }

  async descargarDeNube() {
    try {
      const endpoint = `${this.NETLIFY_BASE}/.netlify/functions/obtener-datos?usuario=${encodeURIComponent(this.estado.usuarioId)}`;
      const respuesta = await fetch(endpoint);

      if (respuesta.status === 404) {
        console.log('ℹ️ Sin datos en nube (primera vez)');
        return null;
      }

      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

      const resultado = await respuesta.json();
      if (resultado.success) {
        console.log('☁️ Datos descargados de nube');
        return resultado.datos;
      }
    } catch (e) {
      console.warn('⚠️ No se descargó de nube:', e.message);
    }
    return null;
  }
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = new AplicacionTMDBeta('#app');
  app.iniciar();
  window.APP = app;
});
