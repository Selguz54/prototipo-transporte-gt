
function seleccionarRol(rol) {
  const mensaje = document.getElementById("mensaje");

  if (rol === "pasajero") {
    mensaje.innerHTML =
      "¡Bienvenido! 🚀 Próximamente podrás solicitar tu viaje y conocer la tarifa antes de aceptar.";
  }

  if (rol === "conductor") {
    mensaje.innerHTML =
      "¡Bienvenido, conductor! 🏍️ Próximamente podrás recibir solicitudes, negociar tarifas y conocer tu ganancia antes de aceptar.";
  }
}
