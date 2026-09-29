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

  // 4. Validación y envío del formulario (contacto.html)
  //    Primero se valida cada campo; si todo está bien, el mensaje se envía
  //    directo a mi Gmail con Google Apps Script (mi propia cuenta lo envía).
  //    Si el envío falla, se ofrece abrir la aplicación de correo (mailto).
  var form = document.getElementById('form-contacto');
  if (form) {
    var CORREO_DESTINO = 'joseovando042000@gmail.com';
    // URL de la aplicación web de Google Apps Script (termina en /exec)
    var URL_SCRIPT = 'https://script.google.com/macros/s/AKfycbxqXzecY10QH7rj4tvsnpPObZ3GzUjIu54XsdYYlRr_m78WQuSrJLq-aEVgYZZzxipYjA/exec';
    var boton = document.getElementById('btn-enviar');

    var campoNombre = document.getElementById('nombre');
    var campoCorreo = document.getElementById('correo');
    var campoMensaje = document.getElementById('mensaje');
    var errorNombre = document.getElementById('error-nombre');
    var errorCorreo = document.getElementById('error-correo');
    var errorMensaje = document.getElementById('error-mensaje');
    var aviso = document.getElementById('form-mensaje');

    // Marca o limpia un campo y escribe su mensaje de error
    function marcar(campo, parrafo, texto) {
      parrafo.textContent = texto;
      campo.classList.toggle('campo-invalido', texto !== '');
      campo.setAttribute('aria-invalid', texto !== '');
    }

    function validarNombre() {
      if (campoNombre.value.trim().length < 3) {
        marcar(campoNombre, errorNombre, 'Escribe tu nombre completo (al menos 3 letras).');
        return false;
      }
      marcar(campoNombre, errorNombre, '');
      return true;
    }

    function validarCorreo() {
      var correo = campoCorreo.value.trim();
      var posArroba = correo.indexOf('@');
      if (correo === '') {
        marcar(campoCorreo, errorCorreo, 'Escribe tu correo.');
        return false;
      }
      if (posArroba === -1) {
        marcar(campoCorreo, errorCorreo, 'Al correo le falta la arroba (@).');
        return false;
      }
      if (correo.indexOf('.', posArroba) === -1) {
        marcar(campoCorreo, errorCorreo, 'Al correo le falta el punto después de la arroba (por ejemplo, .com).');
        return false;
      }
      marcar(campoCorreo, errorCorreo, '');
      return true;
    }

    function validarMensaje() {
      if (campoMensaje.value.trim().length < 10) {
        marcar(campoMensaje, errorMensaje, 'Escribe un mensaje de al menos 10 caracteres.');
        return false;
      }
      marcar(campoMensaje, errorMensaje, '');
      return true;
    }

    // Si un campo ya tenía error, se revisa otra vez mientras la persona escribe
    [[campoNombre, validarNombre], [campoCorreo, validarCorreo], [campoMensaje, validarMensaje]]
      .forEach(function (par) {
        par[0].addEventListener('input', function () {
          if (par[0].classList.contains('campo-invalido')) par[1]();
        });
      });

    // Arma el enlace mailto con todos los datos ya escritos
    function enlaceCorreo(datos) {
      var cuerpo =
        'Nombre: ' + datos.nombre + '\n' +
        'Correo: ' + datos.email + '\n' +
        'Asunto: ' + datos.asunto + '\n\n' +
        'Mensaje:\n' + datos.mensaje;
      return 'mailto:' + CORREO_DESTINO +
        '?subject=' + encodeURIComponent('Mensaje del sitio web: ' + datos.asunto) +
        '&body=' + encodeURIComponent(cuerpo);
    }

    // Muestra el aviso verde con una copia del mensaje enviado
    function mostrarEnviado(datos) {
      aviso.textContent = '';
      aviso.classList.remove('error');

      var titulo = document.createElement('strong');
      titulo.textContent = '✅ ¡Mensaje enviado con éxito! Ya llegó a mi correo y te responderé pronto.';
      aviso.appendChild(titulo);

      var resumen = document.createElement('div');
      resumen.style.marginTop = '10px';
      [['Nombre', datos.nombre], ['Correo', datos.email], ['Asunto', datos.asunto], ['Mensaje', datos.mensaje]]
        .forEach(function (fila) {
          var linea = document.createElement('div');
          linea.style.whiteSpace = 'pre-line';   // respeta los saltos de línea del mensaje
          var etiqueta = document.createElement('strong');
          etiqueta.textContent = fila[0] + ': ';
          linea.appendChild(etiqueta);
          linea.appendChild(document.createTextNode(fila[1]));
          resumen.appendChild(linea);
        });
      aviso.appendChild(resumen);

      aviso.classList.remove('visible');
      void aviso.offsetWidth; // reinicia la animación
      aviso.classList.add('visible');
    }

    // Si el envío falla: aviso rojo con un enlace para mandarlo desde su correo
    function mostrarFallo(datos) {
      aviso.textContent = 'No se pudo enviar el mensaje automáticamente. ';
      var enlace = document.createElement('a');
      enlace.href = enlaceCorreo(datos);
      enlace.textContent = 'Haz clic aquí para enviarlo desde tu correo';
      aviso.appendChild(enlace);
      aviso.appendChild(document.createTextNode(' (ya va escrito), o escríbeme a ' + CORREO_DESTINO + '.'));
      aviso.classList.add('error');
      aviso.classList.remove('visible');
      void aviso.offsetWidth;
      aviso.classList.add('visible');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();                 // sin esto la página se recarga
      aviso.classList.remove('visible');  // se limpia el aviso del envío anterior

      // Se validan los tres campos (no se usa && para que todos muestren su error)
      var nombreOk = validarNombre();
      var correoOk = validarCorreo();
      var mensajeOk = validarMensaje();

      if (!nombreOk || !correoOk || !mensajeOk) {
        // Lleva el cursor al primer campo con error
        form.querySelector('.campo-invalido').focus();
        return;
      }

      var datos = {
        nombre: campoNombre.value.trim(),
        email: campoCorreo.value.trim(),
        asunto: form.asunto.value,
        mensaje: campoMensaje.value.trim()
      };

      if (URL_SCRIPT.indexOf('https://script.google.com/') !== 0) {
        console.error('Falta pegar la URL de Google Apps Script en js/scripts.js');
        mostrarFallo(datos);
        return;
      }

      boton.disabled = true;
      boton.textContent = 'Enviando…';

      // Envío directo a mi Gmail con Google Apps Script
      fetch(URL_SCRIPT, {
        method: 'POST',
        // Se envía como texto plano para que Google lo acepte sin problemas de CORS
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(datos)
      })
        .then(function (respuesta) {
          return respuesta.json().then(function (resultado) {
            console.log('Respuesta de Google:', resultado);
            if (!resultado.ok) throw new Error(resultado.error || 'error desconocido');
            mostrarEnviado(datos);
            form.reset();
          });
        })
        .catch(function (error) {
          console.error('No se pudo enviar el formulario:', error);
          mostrarFallo(datos);
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

  // 6. Proyectos desde archivo de datos (perfil.html)
  //    Requiere datos/proyectos.json y abrir el sitio con Live Server:
  //    con doble clic sobre el archivo (file://) el fetch falla.
  var contenedor = document.getElementById('tarjetas');

  function dibujarTarjetas(proyectos) {
    contenedor.innerHTML = ''; // limpia el contenido previo

    proyectos.forEach(function (proyecto) {
      var tarjeta = document.createElement('article');
      tarjeta.className = 'tarjeta';

      var titulo = document.createElement('h3');
      var emoji = document.createElement('span');
      emoji.className = 'emoji';
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = proyecto.emoji || '📁';
      titulo.appendChild(emoji);
      titulo.appendChild(document.createTextNode(' ' + proyecto.nombre));

      var descripcion = document.createElement('p');
      descripcion.textContent = proyecto.institucion + ' · ' + proyecto.anio + '. ' + proyecto.descripcion;

      var chips = document.createElement('ul');
      chips.className = 'chips chips-sm';
      (proyecto.tecnologias || []).forEach(function (tec) {
        var chip = document.createElement('li');
        chip.textContent = tec;
        chips.appendChild(chip);
      });

      tarjeta.appendChild(titulo);
      tarjeta.appendChild(descripcion);
      tarjeta.appendChild(chips);
      contenedor.appendChild(tarjeta);
    });
  }

  if (contenedor) {
    fetch('datos/proyectos.json')
      .then(function (respuesta) {
        if (!respuesta.ok) throw new Error('Error en la respuesta de la red');
        return respuesta.json();
      })
      .then(function (proyectos) {
        dibujarTarjetas(proyectos);
      })
      .catch(function (error) {
        console.error('Error al cargar los proyectos:', error);
        contenedor.innerHTML = '<p>No se pudieron cargar los proyectos. Recarga la página para intentarlo de nuevo.</p>';
      });
  }
});