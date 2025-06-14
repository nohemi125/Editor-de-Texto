function formatText(command) {
    document.execCommand(command, false, null);
}

function changeFont(font) {
    document.execCommand('fontName', false, font);
}

function changeFontSize(size) {
    document.execCommand('fontSize', false, size);
}

function alignText(alignment) {
    document.execCommand(alignment, false, null);
}

// Función de búsqueda mejorada
function highlightWord() {
    const word = document.getElementById('search').value;
    if (!word) return;

    const editor = document.querySelector('.editor');
    const content = editor.innerHTML;
    
    // Remover resaltados anteriores
    const oldHighlights = editor.getElementsByClassName('highlight');
    while (oldHighlights.length > 0) {
        const parent = oldHighlights[0].parentNode;
        parent.replaceChild(document.createTextNode(oldHighlights[0].textContent), oldHighlights[0]);
        parent.normalize();
    }

    const regex = new RegExp(`(${word})`, 'gi');
    const newContent = content.replace(regex, '<span class="highlight">$1</span>');

    if (content === newContent) {
        alert("No se encontró esta palabra");
    } else {
        editor.innerHTML = newContent;
    }
}

// Función para generar PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const editorContent = document.querySelector('.editor').innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorContent;

    // Remover etiquetas HTML y tomar solo el texto
    const textContent = tempDiv.innerText || tempDiv.textContent;

    // Configurar el PDF
    doc.setFont("helvetica");
    doc.setFontSize(12);
    
    // Dividir el texto en líneas para que quepa en el PDF
    const splitText = doc.splitTextToSize(textContent, 180);
    
    // Agregar el texto al PDF
    doc.text(splitText, 10, 10);
    
    // Guardar el PDF
    doc.save('documento.pdf');
}

// Función para guardar el documento
function saveDocument() {
    const content = document.querySelector('.editor').innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.html';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Contador de palabras y caracteres
function updateStats() {
    const editor = document.querySelector('.editor');
    const text = editor.innerText || editor.textContent;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const chars = text.length;

    document.getElementById('wordCount').textContent = `Palabras: ${words.length}`;
    document.getElementById('charCount').textContent = `Caracteres: ${chars}`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const editor = document.querySelector('.editor');
    
    // Actualizar estadísticas mientras se escribe
    editor.addEventListener('input', updateStats);
    
    // Autoguardado cada 30 segundos
    let autoSaveInterval = setInterval(() => {
        const content = editor.innerHTML;
        localStorage.setItem('editorContent', content);
    }, 30000);

    // Cargar contenido guardado si existe
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
        updateStats();
    }
});
