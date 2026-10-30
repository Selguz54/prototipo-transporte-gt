
function mostrarPantalla(nombre) {
  const pantallas = document.querySelectorAll(".screen");

  pantallas.forEach(function(pantalla) {
    pantalla.classList.remove("active");
  });

  const destino = document.getElementById(nombre);

  if (destino) {
    destino.classList.add("active");
  }

  const mensaje = document.getElementById("mensaje");

  if (nombre === "inicio") {
    mensaje.textContent =
      "Una plataforma pensada para Guatemala 🇬🇹";
  } else if (nombre === "pasajero") {
    mensaje.textContent =
      "Tu viaje, tus decisiones y tarifas transparentes.";
  } else if (nombre === "conductor") {
    mensaje.textContent =
      "Conoce cuánto ganarás antes de aceptar un viaje.";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function mostrarAviso(texto) {
  const mensaje = document.getElementById("mensaje");
  mensaje.textContent = texto;
}
