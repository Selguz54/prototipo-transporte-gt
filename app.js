
function mostrarPantalla(nombre) {
  document.querySelectorAll(".screen").forEach(function(pantalla) {
    pantalla.classList.remove("active");
  });

  const destino = document.getElementById(nombre);

  if (destino) {
    destino.classList.add("active");
  }

  const mensaje = document.getElementById("mensaje");

  if (nombre === "inicio") {
    mensaje.textContent = "Una plataforma pensada para Guatemala 🇬🇹";
  } else if (nombre === "pasajero") {
    mensaje.textContent = "Tu viaje, tus decisiones y tarifas transparentes.";
  } else if (nombre === "conductor") {
    mensaje.textContent = "Conoce cuánto ganarás antes de aceptar un viaje.";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarAviso(texto) {
  document.getElementById("mensaje").textContent = texto;
}

function registrarUsuario(rol) {
  const pantalla = document.getElementById(rol);
  const campos = pantalla.querySelectorAll("input");

  const valores = Array.from(campos).map(function(campo) {
    return campo.value.trim();
  });

  if (valores.some(valor => valor === "")) {
    mostrarAviso("Completa todos los campos para continuar.");
    return;
  }

  const perfil = {
    rol: rol,
    nombre: valores[0],
    telefono: valores[1],
    motocicleta: rol === "conductor" ? valores[2] : "",
    placa: rol === "conductor" ? valores[3] : ""
  };

  localStorage.setItem("movgt_perfil", JSON.stringify(perfil));

  mostrarPerfil(perfil);
}

function mostrarPerfil(perfil) {
  const pantalla = document.getElementById(perfil.rol);

  let contenido = `
    <button class="back" onclick="cerrarSesion()">
      ← Cerrar sesión
    </button>

    <span class="tag">MI CUENTA MOVGT</span>
    <h1>¡Hola, ${escapar(perfil.nombre)}!</h1>
    <p>Tu perfil está registrado en este dispositivo.</p>

    <div class="panel">
      <h2>${perfil.rol === "pasajero" ? "Perfil de pasajero" : "Perfil de conductor"}</h2>
      <p>Nombre: ${escapar(perfil.nombre)}</p>
      <p>Teléfono: ${escapar(perfil.telefono)}</p>
      ${perfil.rol === "conductor" ? `
        <p>Motocicleta: ${escapar(perfil.motocicleta)}</p>
        <p>Placa: ${escapar(perfil.placa)}</p>
      ` : ""}
      <button class="primary" onclick="mostrarAviso('Esta función estará disponible próximamente.')">
        ${perfil.rol === "pasajero" ? "Solicitar un viaje" : "Ver solicitudes de viaje"}
      </button>
    </div>
  `;

  pantalla.innerHTML = contenido;
  mostrarPantalla(perfil.rol);
  mostrarAviso("Perfil guardado correctamente en este dispositivo.");
}

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, function(caracter) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[caracter];
  });
}

function cerrarSesion() {
  localStorage.removeItem("movgt_perfil");

  location.reload();
}

window.addEventListener("DOMContentLoaded", function() {
  const guardado = localStorage.getItem("movgt_perfil");

  if (guardado) {
    try {
      mostrarPerfil(JSON.parse(guardado));
    } catch (error) {
      localStorage.removeItem("movgt_perfil");
    }
  }
});
