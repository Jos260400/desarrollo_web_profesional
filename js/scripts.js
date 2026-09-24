// Archivo de JavaScript del sitio.

document.addEventListener('DOMContentLoaded', function () {
  var reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Las secciones aparecen al entrar en pantalla
  var secciones = document.querySelectorAll('main section');
  if ('IntersectionObserver' in window && !reducirMovimiento) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.15 });
    secciones.forEach(function (s) { observador.observe(s); });
  } else {
    secciones.forEach(function (s) { s.classList.add('visible'); });
  }

  // 2. Botones "Mostrar más / Mostrar menos" (perfil.html)
  document.querySelectorAll('.btn-expandir').forEach(function (boton) {
    var objetivo = document.getElementById(boton.getAttribute('data-toggle'));
    var clase = boton.getAttribute('data-expand-class') || 'expandido';
    if (!objetivo) return;
    boton.addEventListener('click', function () {
      var abierto = objetivo.classList.toggle(clase);
      boton.setAttribute('aria-expanded', abierto);
      boton.textContent = abierto ? 'Mostrar menos' : 'Mostrar más';
    });
  });

  // 3. Botón flotante para volver arriba
  var arriba = document.createElement('button');
  arriba.type = 'button';
  arriba.className = 'btn-arriba';
  arriba.setAttribute('aria-label', 'Volver arriba');
  arriba.textContent = '↑';
  document.body.appendChild(arriba);

  window.addEventListener('scroll', function () {
    arriba.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  arriba.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reducirMovimiento ? 'auto' : 'smooth' });
  });

  // 4. Envío del formulario a joseovando042000@gmail.com (servicio FormSubmit)
  var form = document.getElementById('form-contacto');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var aviso = document.getElementById('form-mensaje');
      var boton = document.getElementById('btn-enviar');
      var nombre = form.nombre.value.trim();

      boton.disabled = true;
      boton.textContent = 'Enviando…';

      fetch('https://formsubmit.co/ajax/joseovando042000@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          nombre: nombre,
          email: form.email.value.trim(),
          asunto: form.asunto.value,
          mensaje: form.mensaje.value.trim(),
          _subject: 'Nuevo mensaje del sitio web: ' + form.asunto.value,
          _template: 'table',
          _honey: form._honey.value
        })
      })
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
          console.log('Respuesta de FormSubmit:', datos);
          var exito = datos.success === true || datos.success === 'true';
          var activacion = /activat/i.test(datos.message || '');
          if (exito || activacion) {
            if (activacion) console.warn('FormSubmit: revisa tu Gmail y presiona "Activate Form".');
            mostrarAviso(aviso, '¡Correo enviado exitosamente! Gracias, ' + nombre.split(' ')[0] + '. Te responderé pronto.', false);
            form.reset();
          } else {
            mostrarAviso(aviso, 'No se pudo enviar el mensaje: ' + (datos.message || 'error desconocido') + '. Puedes escribirme directamente a joseovando042000@gmail.com.', true);
          }
        })
        .catch(function (error) {
          // Si la petición no llega (red, bloqueador, etc.), se envía de la forma tradicional
          console.error('Error al contactar FormSubmit:', error);
          HTMLFormElement.prototype.submit.call(form);
        })
        .finally(function () {
          boton.disabled = false;
          boton.textContent = 'Enviar mensaje';
        });
    });
  }

  function mostrarAviso(aviso, texto, esError) {
    aviso.textContent = texto;
    aviso.classList.toggle('error', esError);
    aviso.classList.remove('visible');
    void aviso.offsetWidth; // reinicia la animación
    aviso.classList.add('visible');
  }

  // 5. Año actual en el footer
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
});