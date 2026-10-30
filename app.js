
function mostrarPantalla(nombre) {
  if (nombre === "pasajero" || nombre === "conductor") {
    const guardado = localStorage.getItem("movgt_" + nombre);

    if (guardado) {
      try {
        mostrarPerfil(JSON.parse(guardado));
        return;
      } catch (error) {
        localStorage.removeItem("movgt_" + nombre);
      }
    }
  }

  activarPantalla(nombre);
}

function activarPantalla(nombre) {
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

  localStorage.setItem("movgt_" + rol, JSON.stringify(perfil));

  mostrarPerfil(perfil);
}

function mostrarPerfil(perfil) {
  const pantalla = document.getElementById(perfil.rol);

  pantalla.innerHTML = `
    <button class="back" onclick="cerrarSesion()">
      ← Volver al inicio
    </button>

    <span class="tag">MI CUENTA MOVGT</span>
    <h1>¡Hola, ${escapar(perfil.nombre)}!</h1>
    <p>Tu perfil está guardado en este dispositivo.</p>

    <div class="panel">
      <h2>${perfil.rol === "pasajero" ? "Perfil de pasajero" : "Perfil de conductor"}</h2>
      <p>Nombre: ${escapar(perfil.nombre)}</p>
      <p>Teléfono: ${escapar(perfil.telefono)}</p>
      ${perfil.rol === "conductor" ? `
        <p>Motocicleta: ${escapar(perfil.motocicleta)}</p>
        <p>Placa: ${escapar(perfil.placa)}</p>
      ` : ""}
      <button class="primary" onclick="${perfil.rol === "pasajero" ? "abrirSolicitud()" : "verSolicitudes()"}">
  ${perfil.rol === "pasajero" ? "Solicitar un viaje" : "Ver solicitudes de viaje"}
</button>
    </div>
  `;

  activarPantalla(perfil.rol);
  mostrarAviso("Perfil guardado correctamente.");
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
  location.reload();
}
function abrirSolicitud() {
  const pantalla = document.getElementById("pasajero");

  pantalla.innerHTML = `
    <button class="back" onclick="mostrarPantalla('pasajero')">
      ← Volver a mi perfil
    </button>

    <span class="tag">NUEVO VIAJE</span>
    <h1>¿A dónde vamos?</h1>
    <p>Indica tu recorrido y cuánto propones pagar.</p>

    <div class="panel">
      <label>Punto de partida</label>
      <input id="origen" type="text" placeholder="Ej. Zona 1">

      <label>Destino</label>
      <input id="destino" type="text" placeholder="Ej. Zona 10">

      <label>Tu propuesta de tarifa (Q)</label>
      <input id="tarifa" type="number" min="1" step="0.50" placeholder="Ej. 25">

      <button class="primary" onclick="crearSolicitud()">
        Buscar conductor
      </button>
    </div>
  `;

  activarPantalla("pasajero");
}

function crearSolicitud() {
  const origen = document.getElementById("origen").value.trim();
  const destino = document.getElementById("destino").value.trim();
  const tarifa = Number(document.getElementById("tarifa").value);

  if (!origen || !destino || !Number.isFinite(tarifa) || tarifa <= 0) {
    mostrarAviso("Completa los datos y escribe una tarifa válida.");
    return;
  }

  const perfil = JSON.parse(localStorage.getItem("movgt_pasajero"));

  const viaje = {
    origen: origen,
    destino: destino,
    tarifa: tarifa,
    pasajero: perfil.nombre,
    estado: "pendiente"
  };

  localStorage.setItem("movgt_viaje", JSON.stringify(viaje));

  document.getElementById("pasajero").innerHTML = `
    <button class="back" onclick="mostrarPantalla('pasajero')">
      ← Volver a mi perfil
    </button>

    <span class="tag">SOLICITUD ENVIADA</span>
    <h1>¡Estamos buscando!</h1>

    <div class="panel">
      <h2>Resumen de tu viaje</h2>
      <p>Salida: ${escapar(origen)}</p>
      <p>Destino: ${escapar(destino)}</p>
      <p>Tarifa propuesta: Q${tarifa.toFixed(2)}</p>
      <p>Estado: Esperando conductor</p>
    </div>
  `;

  activarPantalla("pasajero");
}

function verSolicitudes() {
  const pantalla = document.getElementById("conductor");
  const guardado = localStorage.getItem("movgt_viaje");

  let contenido = `
    <button class="back" onclick="mostrarPantalla('conductor')">
      ← Volver a mi perfil
    </button>

    <span class="tag">SOLICITUDES DE VIAJE</span>
    <h1>Viajes disponibles</h1>
  `;

  if (!guardado) {
    contenido += `
      <div class="panel">
        <p>Por ahora no hay solicitudes disponibles.</p>
      </div>
    `;
  } else {
    const viaje = JSON.parse(guardado);

    contenido += `
      <div class="panel">
        <h2>Solicitud de viaje</h2>
        <p>Pasajero: ${escapar(viaje.pasajero)}</p>
        <p>Salida: ${escapar(viaje.origen)}</p>
        <p>Destino: ${escapar(viaje.destino)}</p>
        <p>Tarifa: Q${Number(viaje.tarifa).toFixed(2)}</p>
        <p>Estado: ${escapar(viaje.estado)}</p>

        <button class="primary" onclick="aceptarViaje()">
          Aceptar tarifa
        </button>

        <button class="primary" onclick="proponerTarifa()">
          Proponer otra tarifa
        </button>
      </div>
    `;
  }

  pantalla.innerHTML = contenido;
  activarPantalla("conductor");
}

function aceptarViaje() {
  const viaje = JSON.parse(localStorage.getItem("movgt_viaje"));

  if (!viaje) return;

  viaje.estado = "aceptado";

  localStorage.setItem("movgt_viaje", JSON.stringify(viaje));

  mostrarAviso("¡Has aceptado el viaje!");
}

function proponerTarifa() {
  const viaje = JSON.parse(localStorage.getItem("movgt_viaje"));

  if (!viaje) return;

  const nuevaTarifa = Number(prompt("¿Cuánto propones cobrar en quetzales?"));

  if (!Number.isFinite(nuevaTarifa) || nuevaTarifa <= 0) {
    mostrarAviso("Escribe una tarifa válida.");
    return;
  }

  viaje.tarifaOriginal = viaje.tarifa;
  viaje.tarifa = nuevaTarifa;
  viaje.estado = "contraoferta";

  localStorage.setItem("movgt_viaje", JSON.stringify(viaje));

  mostrarAviso("Contraoferta enviada al pasajero.");
}
