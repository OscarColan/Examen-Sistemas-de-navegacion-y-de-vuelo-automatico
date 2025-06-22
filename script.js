let tiempoRestante = 600; // 10 minutos en segundos
let temporizador;

function iniciarTemporizador() {
    const temporizadorElemento = document.getElementById("temporizador");
    temporizador = setInterval(() => {
        const minutos = Math.floor(tiempoRestante / 60);
        const segundos = tiempoRestante % 60;
        temporizadorElemento.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;

        if (tiempoRestante <= 0) {
            clearInterval(temporizador);
            alert("¡Tiempo terminado! Se enviará automáticamente tu examen.");
            finalizarExamen(); // Corrige el examen al acabar el tiempo
        }

        tiempoRestante--;
    }, 1000);
}

function finalizarExamen() {
    document.querySelector("button").click();
}

// Obtener el nombre del cuestionario desde la URL
const params = new URLSearchParams(window.location.search);
const archivo = params.get("cuestionario");

const nombresBonitos = {
    Comunicaciones_por_radio: "Comunicaciones por Radio",
    Integracion_de_sistemas_de_avionica: "Integración de Sistemas de Aviónica",
    Primeras_ayudas_a_la_navegacion: "Primeras Ayudas a la Navegación",
    Sistemas_datos_de_aire: "Sistemas de Datos de Aire",
    Sistemas_de_aproximacion: "Sistemas de Aproximación",
    Sistemas_de_direccion_y_distancia: "Sistemas de Dirección y Distancia",
    Sistemas_de_navegacion_inercial: "Sistemas de Navegación Inercial",
    Sistemas_de_navegacion_RADAR: "Sistemas de Navegación RADAR",
    Sistemas_de_navegacion_por_satelite: "Sistemas de Navegación por Satélite",
    Sistemas_de_control_de_vuelo_automatico: "Sistemas de Control de Vuelo Automático"
};

if (!archivo) {
    document.body.innerHTML = "<h2>Error: No se indicó el cuestionario en la URL.</h2><p>Usa ?cuestionario=nombre_del_archivo (sin .json)</p>";
} else {
    // Cambiar título y encabezado dinámicamente
    const titulo = nombresBonitos[archivo] || "Examen";
    document.title = `Examen: ${titulo}`;
    const h1 = document.getElementById("titulo-examen");
    if (h1) h1.textContent = `Examen: ${titulo}`;

    // Cargar preguntas
    fetch(`cuestionarios/${archivo}.json`)
        .then(res => {
            if (!res.ok) throw new Error("No se pudo cargar el archivo JSON.");
            return res.json();
        })
        .then(preguntas => mostrarPreguntas(preguntas))
        .catch(err => {
            document.body.innerHTML = `<h2>Error al cargar el cuestionario: ${archivo}</h2><p>${err.message}</p>`;
        });

    iniciarTemporizador();
}

function mostrarPreguntas(preguntas) {
    const div = document.getElementById("preguntas");
    preguntas.forEach((pregunta, i) => {
        const contenedor = document.createElement("div");
        contenedor.classList.add("pregunta");
        contenedor.innerHTML = `<p>${i + 1}. ${pregunta.texto}</p>` +
            pregunta.opciones.map((op, j) =>
                `<label><input type="radio" name="p${i}" value="${j}"> ${op}</label><br>`).join("");
        div.appendChild(contenedor);
    });

    document.querySelector("button").onclick = () => {
        let puntos = 0;
        const fallos = [];
        preguntas.forEach((preg, i) => {
            const seleccion = document.querySelector(`input[name="p${i}"]:checked`);
            if (seleccion && parseInt(seleccion.value) === preg.correcta) {
                puntos++;
            } else {
                fallos.push({
                    numero: i + 1,
                    pregunta: preg.texto,
                    correcta: preg.opciones[preg.correcta]
                });
            }
        });

        let resultado = `Tu puntuación es: ${puntos} de ${preguntas.length}<br>`;
        if (fallos.length > 0) {
            resultado += "<br><strong>Respuestas incorrectas:</strong><ul>";
            fallos.forEach(f => {
                resultado += `<li><strong>${f.numero}.</strong> ${f.pregunta}<br>Respuesta correcta: ${f.correcta}</li>`;
            });
            resultado += "</ul>";
        }
        document.getElementById("resultado").innerHTML = resultado;

        clearInterval(temporizador); // Detener el temporizador si se corrige antes
    };
}
