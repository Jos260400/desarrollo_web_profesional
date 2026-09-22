// Archivo de JavaScript del proyecto.
// Se empieza a trabajar en la sesión 4.
// El código se escribe debajo de este comentario.

// Botones "Mostrar más / Mostrar menos" (usados en perfil.html)
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.btn-expandir').forEach(function (boton) {
    var targetId = boton.getAttribute('data-toggle');
    var claseExpandir = boton.getAttribute('data-expand-class') || 'expandido';
    var objetivo = document.getElementById(targetId);
    if (!objetivo) return;
    boton.addEventListener('click', function () {
      var expandido = objetivo.classList.toggle(claseExpandir);
      boton.setAttribute('aria-expanded', expandido);
      boton.textContent = expandido ? 'Mostrar menos' : 'Mostrar más';
    });
  });
});