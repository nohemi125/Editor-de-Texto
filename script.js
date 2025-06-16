function formatearTexto(comando) {
    document.execCommand(comando, false, null);
}

function cambiarFuente(fuente) {
    document.execCommand('fontName', false, fuente);
}

function cambiarTamanoFuente(tamano) {
    document.execCommand('fontSize', false, tamano);
}

function alinearTexto(alineacion) {
    document.execCommand(alineacion, false, null);
}

// Función de búsqueda mejorada
function resaltarPalabra() {
    const palabra = document.getElementById('buscar')?.value;
    if (!palabra) return;

    const editor = document.querySelector('.editor');
    if (!editor) return;

    const contenido = editor.innerHTML;
    
    // Remover resaltados anteriores
    const resaltadosAnteriores = editor.getElementsByClassName('highlight');
    while (resaltadosAnteriores.length > 0) {
        const padre = resaltadosAnteriores[0].parentNode;
        padre.replaceChild(document.createTextNode(resaltadosAnteriores[0].textContent), resaltadosAnteriores[0]);
        padre.normalize();
    }

    const regex = new RegExp(`(${palabra})`, 'gi');
    const nuevoContenido = contenido.replace(regex, '<span class="highlight">$1</span>');

    if (contenido === nuevoContenido) {
        alert("No se encontró esta palabra");
    } else {
        editor.innerHTML = nuevoContenido;
    }
}

// Función para generar PDF
function generarPDF() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        alert('Error: La biblioteca PDF no está cargada correctamente');
        return;
    }

    const editor = document.querySelector('.editor');
    if (!editor) return;

    const doc = new jsPDF();
    const contenidoEditor = editor.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contenidoEditor;

    const textoContenido = tempDiv.innerText || tempDiv.textContent;

    // Configurar el PDF
    doc.setFont("helvetica");
    doc.setFontSize(12);
    
    // Dividir el texto en líneas para que quepa en el PDF
    const textoDividido = doc.splitTextToSize(textoContenido, 180);
    
    // Agregar el texto al PDF
    doc.text(textoDividido, 10, 10);
    
    // Guardar el PDF
    doc.save('documento.pdf');
}

// Función para guardar el documento
function guardarDocumento() {
    const editor = document.querySelector('.editor');
    if (!editor) return;

    const contenido = editor.innerHTML;
    const blob = new Blob([contenido], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.html';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Contador de palabras y caracteres
function actualizarEstadisticas() {
    const editor = document.querySelector('.editor');
    const contadorPalabras = document.getElementById('contadorPalabras');
    const contadorCaracteres = document.getElementById('contadorCaracteres');

    if (!editor || !contadorPalabras || !contadorCaracteres) return;

    const texto = editor.innerText || editor.textContent;
    const palabras = texto.trim().split(/\s+/).filter(palabra => palabra.length > 0);
    const caracteres = texto.length;

    contadorPalabras.textContent = `Palabras: ${palabras.length}`;
    contadorCaracteres.textContent = `Caracteres: ${caracteres}`;
}

// Función para detectar el idioma
async function detectarIdioma(texto) {
    try {
        // Intentar detectar el idioma usando un par de idiomas común
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=es|en`;
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            return 'es'; 
        }
        const datos = await respuesta.json();
        
        // Verifica si la API detectó el idioma
        if (datos.responseData && datos.responseData.detectedLanguage) {
            return datos.responseData.detectedLanguage.language;
        }
        
        // Si no se pudo detectar, intentar con otro par de idiomas
        const url2 = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|es`;
        const respuesta2 = await fetch(url2);
        if (!respuesta2.ok) {
            return 'es';
        }
        const datos2 = await respuesta2.json();
        
        if (datos2.responseData && datos2.responseData.detectedLanguage) {
            return datos2.responseData.detectedLanguage.language;
        }
        
        // Si aún no se pudo detectar, usar el idioma de destino como origen
        const idiomaDestino = document.getElementById('idiomaDestino').value;
        return idiomaDestino === 'es' ? 'en' : 'es';
    } catch (error) {
        console.error('Error al detectar idioma:', error);
        // Si hay error, usar el idioma opuesto al destino
        const idiomaDestino = document.getElementById('idiomaDestino').value;
        return idiomaDestino === 'es' ? 'en' : 'es';
    }
}

// Función para traducir el texto
async function traducirTexto() {
    const editor = document.querySelector('.editor');
    const idiomaDestino = document.getElementById('idiomaDestino');
    const botonTraducir = document.querySelector('.translate-btn');

    if (!editor || !idiomaDestino || !botonTraducir) {
        alert('Error: No se pudieron encontrar los elementos necesarios');
        return;
    }

    const texto = editor.innerText || editor.textContent;
    if (!texto.trim()) {
        alert('Por favor, escribe algo para traducir');
        return;
    }

    try {
        // Mostrar estado de carga
        botonTraducir.classList.add('translating');
        botonTraducir.disabled = true;

        // Guardar el texto original
        const textoOriginal = editor.innerHTML;
        localStorage.setItem('ultimoTextoOriginal', textoOriginal);

        // Detectar el idioma de origen
        const idiomaOrigen = await detectarIdioma(texto);

        // Dividir el texto en partes más pequeñas si es necesario (la API tiene un límite)
        const maxLength = 500;
        const partes = [];
        for (let i = 0; i < texto.length; i += maxLength) {
            partes.push(texto.slice(i, i + maxLength));
        }

        // Traducir cada parte
        const traducciones = await Promise.all(
            partes.map(async (parte) => {
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(parte)}&langpair=${idiomaOrigen}|${idiomaDestino.value}`;
                const respuesta = await fetch(url);
                if (!respuesta.ok) {
                    throw new Error('Error en la traducción');
                }
                const datos = await respuesta.json();
                return datos.responseData.translatedText;
            })
        );

        // Unir las traducciones
        const textoTraducido = traducciones.join(' ');

        // Actualizar el editor con el texto traducido
        editor.innerHTML = textoTraducido;
        actualizarEstadisticas();

    } catch (error) {
        console.error('Error:', error);
        alert('Error al traducir el texto. Por favor, intenta de nuevo.');
        // Restaurar el texto original en caso de error
        const textoOriginal = localStorage.getItem('ultimoTextoOriginal');
        if (textoOriginal) {
            editor.innerHTML = textoOriginal;
        }
    } finally {
        // Restaurar el botón
        botonTraducir.classList.remove('translating');
        botonTraducir.disabled = false;
    }
}

// Función para restaurar el texto original
function restaurarTextoOriginal() {
    const editor = document.querySelector('.editor');
    if (!editor) return;

    const textoOriginal = localStorage.getItem('ultimoTextoOriginal');
    if (textoOriginal) {
        editor.innerHTML = textoOriginal;
        actualizarEstadisticas();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const editor = document.querySelector('.editor');
    if (!editor) return;
    
    // Actualizar estadísticas mientras se escribe
    editor.addEventListener('input', actualizarEstadisticas);
    
    // Autoguardado cada 30 segundos
    let intervaloAutoguardado = setInterval(() => {
        const contenido = editor.innerHTML;
        localStorage.setItem('contenidoEditor', contenido);
    }, 30000);

    // Cargar contenido guardado si existe
    const contenidoGuardado = localStorage.getItem('contenidoEditor');
    if (contenidoGuardado) {
        editor.innerHTML = contenidoGuardado;
        actualizarEstadisticas();
    }

    // Agregar atajo de teclado para restaurar texto original (Ctrl + Z)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'z') {
            restaurarTextoOriginal();
        }
    });
});
