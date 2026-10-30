
const COMISION_MOVGT = 0.07;
const TARIFA_KM = 3;
const PASO_CONTRAOFERTA = 3;

function dinero(valor) {
  return Number(valor).toFixed(2);
}

function gananciaNeta(tarifa) {
  return Number(tarifa) * (1 - COMISION_MOVGT);
}

function calcularOfertas(tarifaPasajero, kilometros) {
  const referencia = kilometros * TARIFA_KM;

  const opciones = [
    tarifaPasajero,
    referencia,
    referencia + PASO_CONTRAOFERTA,
    referencia + PASO_CONTRAOFERTA * 2
  ];

  return [...new Set(opciones.map(Number))];
}

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

  if (destino) destino.classList.add("active");

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

  const valores = Array.from(campos).map(campo => campo.value.trim());

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
    <button class="back" onclick="cerrarSesion()">← Volver al inicio</button>
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
    <button class="back" onclick="mostrarPantalla('pasajero')">← Volver a mi perfil</button>
    <span class="tag">NUEVO VIAJE</span>
    <h1>¿A dónde vamos?</h1>
    <p>Indica tu recorrido y cuánto propones pagar.</p>

    <div class="panel">
      <label>Punto de partida</label>
      <input id="origen" type="text" placeholder="Ej. Zona 1">

      <label>Destino</label>
      <input id="destino" type="text" placeholder="Ej. Zona 10">

      <label>Distancia estimada en kilómetros</label>
      <input id="kilometros" type="number" min="0.1" step="0.1" placeholder="Ej. 10">

      <label>Tu propuesta de tarifa (Q)</label>
      <input id="tarifa" type="number" min="1" step="0.50" placeholder="Ej. 27">

      <button class="primary" onclick="crearSolicitud()">Buscar conductor</button>
    </div>
  `;

  activarPantalla("pasajero");
}

function crearSolicitud() {
  const origen = document.getElementById("origen").value.trim();
  const destino = document.getElementById("destino").value.trim();
  const kilometros = Number(document.getElementById("kilometros").value);
  const tarifaIngresada = Number(document.getElementById("tarifa").value);

  if (
    !origen ||
    !destino ||
    !Number.isFinite(kilometros) ||
    kilometros <= 0 ||
    !Number.isFinite(tarifaIngresada) ||
    tarifaIngresada <= 0
  ) {
    mostrarAviso("Completa todos los datos con valores válidos.");
    return;
  }

  const tarifaMinima = Math.round(kilometros * 2.70 * 100) / 100;
  const tarifa = Math.max(tarifaIngresada, tarifaMinima);

  const perfil = JSON.parse(localStorage.getItem("movgt_pasajero"));

  if (!perfil) {
    mostrarAviso("No encontramos tu perfil de pasajero.");
    return;
  }

  const viaje = {
    origen,
    destino,
    kilometros,
    tarifa,
    tarifaOriginal: tarifa,
    tarifaMinima,
    pasajero: perfil.nombre,
    estado: "pendiente"
  };

  localStorage.setItem("movgt_viaje", JSON.stringify(viaje));

  document.getElementById("pasajero").innerHTML = `
    <button class="back" onclick="mostrarPantalla('pasajero')">← Volver a mi perfil</button>
    <span class="tag">SOLICITUD ENVIADA</span>
    <h1>¡Estamos buscando!</h1>

    <div class="panel">
      <h2>Resumen de tu viaje</h2>
      <p>Salida: ${escapar(origen)}</p>
      <p>Destino: ${escapar(destino)}</p>
      <p>Distancia estimada: ${dinero(kilometros)} km</p>
      <p>Tarifa mínima: Q${dinero(tarifaMinima)}</p>
      <p>Tu propuesta: Q${dinero(tarifa)}</p>

      <button class="primary" onclick="consultarEstado()">Consultar respuesta</button>
    </div>
  `;

  activarPantalla("pasajero");

  if (tarifaIngresada < tarifaMinima) {
    mostrarAviso("Tu propuesta se ajustó automáticamente a la tarifa mínima.");
  }
}

function verSolicitudes() {
  const pantalla = document.getElementById("conductor");
  const guardado = localStorage.getItem("movgt_viaje");

  let contenido = `
    <button class="back" onclick="mostrarPantalla('conductor')">← Volver a mi perfil</button>
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

    if (viaje.estado === "aceptado" || viaje.estado === "rechazado") {
      contenido += `
        <div class="panel">
          <p>Esta solicitud ya fue ${escapar(viaje.estado)}.</p>
        </div>
      `;
    } else {
      const tarifaMinima = viaje.tarifaMinima || Math.round(viaje.kilometros * 2.70 * 100) / 100;
      const ofertasBase = calcularOfertas(viaje.tarifaOriginal, viaje.kilometros);
      const ofertas = [...new Set(
        ofertasBase.map(oferta =>
          Math.max(Number(oferta), tarifaMinima).toFixed(2)
        )
      )].map(Number);

      contenido += `
        <div class="panel">
          <h2>Solicitud de viaje</h2>
          <p>Pasajero: ${escapar(viaje.pasajero)}</p>
          <p>Salida: ${escapar(viaje.origen)}</p>
          <p>Destino: ${escapar(viaje.destino)}</p>
          <p>Distancia: ${dinero(viaje.kilometros)} km</p>
          <p>Tarifa mínima: Q${dinero(tarifaMinima)}</p>

          <div style="margin-top:18px;padding:15px;border-radius:16px;background:rgba(0,230,165,.09);border:1px solid rgba(0,230,165,.2)">
            <small style="color:#a8bbc8">RECIBES PARA TI</small>
            <div style="font-size:36px;font-weight:900;color:#00e6a5;margin:5px 0">
              Q${dinero(gananciaNeta(viaje.tarifaOriginal))}
            </div>
            <small style="color:#a8bbc8">El pasajero paga Q${dinero(viaje.tarifaOriginal)}</small>
          </div>

          <h2 style="margin-top:22px">Otras ofertas</h2>

          <div style="display:flex;gap:9px;overflow-x:auto;padding:5px 0 12px">
      `;

      ofertas.forEach(function(oferta) {
        if (oferta === Number(viaje.tarifaOriginal)) return;

        contenido += `
          <div style="flex:0 0 112px;min-width:112px;padding:10px 8px;border-radius:13px;background:rgba(0,230,165,.07);border:1px solid rgba(0,230,165,.2);text-align:center">
            <div style="font-size:20px;font-weight:800;color:#00e6a5">
              Q${dinero(oferta)}
            </div>
            <small style="display:block;color:#a8bbc8;margin:5px 0">
              Recibes Q${dinero(gananciaNeta(oferta))}
            </small>
            <button class="primary" style="font-size:12px;padding:9px 5px;width:100%" onclick="seleccionarOferta(${oferta})">
              Proponer
            </button>
          </div>
        `;
      });

      contenido += `
          </div>

          <button class="primary" onclick="seleccionarOferta(${Number(viaje.tarifaOriginal)})">
            Aceptar oferta del pasajero
          </button>
        </div>
      `;
    }
  }

  pantalla.innerHTML = contenido;
  activarPantalla("conductor");
}

function seleccionarOferta(precio) {
  const viaje = JSON.parse(localStorage.getItem("movgt_viaje"));

  if (!viaje || viaje.estado !== "pendiente") return;

  const tarifa = Number(precio);
  const tarifaMinima = viaje.tarifaMinima || Math.round(viaje.kilometros * 2.70 * 100) / 100;

  if (!Number.isFinite(tarifa) || tarifa < tarifaMinima) {
    mostrarAviso("No puedes proponer menos de la tarifa mínima.");
    return;
  }

  if (tarifa === Number(viaje.tarifaOriginal)) {
    viaje.tarifa = tarifa;
    viaje.estado = "aceptado";
    localStorage.setItem("movgt_viaje", JSON.stringify(viaje));
    mostrarAviso("¡Has aceptado la oferta del pasajero!");
    verSolicitudes();
    return;
  }

  viaje.tarifa = tarifa;
  viaje.estado = "contraoferta";

  localStorage.setItem("movgt_viaje", JSON.stringify(viaje));

  mostrarAviso("Contraoferta enviada al pasajero.");
  verSolicitudes();
}
function aceptarViaje() {
  const viaje = JSON.parse(localStorage.getItem("movgt_viaje"));
  if (!viaje) return;
  seleccionarOferta(viaje.tarifaOriginal);
}

function proponerTarifa() {
  verSolicitudes();
}

function consultarEstado() {
  const viaje = JSON.parse(localStorage.getItem("movgt_viaje"));

  if (!viaje) {
    mostrarAviso("No encontramos una solicitud.");
    return;
  }

  let contenido = `
    <button class="back" onclick="mostrarPantalla('pasajero')">← Volver a mi perfil</button>
    <span class="tag">ESTADO DE TU VIAJE</span>
    <h1>Tu solicitud</h1>

    <div class="panel">
      <p>Salida: ${escapar(viaje.origen)}</p>
      <p>Destino: ${escapar(viaje.destino)}</p>
      <p>Distancia: ${dinero(viaje.kilometros)} km</p>
  `;

  if (viaje.estado === "pendiente") {
    contenido += `
      <p>Tu oferta: Q${dinero(viaje.tarifaOriginal)}</p>
      <p>Esperando respuesta del conductor.</p>
    `;
  } else if (viaje.estado === "aceptado") {
    contenido += `
      <h2>¡Viaje aceptado!</h2>
      <p>Precio acordado: Q${dinero(viaje.tarifa)}</p>
    `;
  } else if (viaje.estado === "contraoferta") {
    contenido += `
      <h2>El conductor te propone otra tarifa</h2>
      <p>Precio propuesto: Q${dinero(viaje.tarifa)}</p>
      <button class="primary" onclick="responderContraoferta(true)">Aceptar tarifa</button>
      <button class="primary" onclick="responderContraoferta(false)">Rechazar tarifa</button>
    `;
  } else {
    contenido += `<p>La solicitud fue rechazada.</p>`;
  }

  contenido += `</div>`;

  document.getElementById("pasajero").innerHTML = contenido;
  activarPantalla("pasajero");
}

function responderContraoferta(aceptar) {
  const viaje = JSON.parse(localStorage.getItem("movgt_viaje"));

  if (!viaje || viaje.estado !== "contraoferta") return;

  viaje.estado = aceptar ? "aceptado" : "rechazado";

  localStorage.setItem("movgt_viaje", JSON.stringify(viaje));

  consultarEstado();
}
