
function highlightWord() {
    const word = document.getElementById('search').value;
    if (!word) return;

    const editor = document.querySelector('.editor');
    const content = editor.innerHTML;

    const regex = new RegExp(`(${word})`, 'gi');
    const newContent = content.replace(regex, '<span class="highlight">$1</span>');

    editor.innerHTML = newContent;

    if (content== newContent){
        alert("no se encontro esta palabra");
    }else {
        editor.innerHTML = newContent;
    }
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const editorContent = document.querySelector('.editor').innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorContent;

    // Remover etiquetas HTML y tomar solo el texto
    const textContent = tempDiv.innerText || tempDiv.textContent;

    doc.text(textContent, 10, 10);
    doc.save('documento.pdf');
}
