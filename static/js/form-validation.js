const comunasPorRegion = {
    metropolitana: ["Santiago", "Providencia", "Las Condes", "Ñuñoa", "La Florida", "Maipú"],
    valparaiso: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "Concón"],
    biobio: ["Concepción", "Talcahuano", "Chiguayante", "San Pedro de la Paz", "Hualpén"],
    araucania: ["Temuco", "Padre Las Casas", "Villarrica", "Pucón", "Lautaro"],
    coquimbo: ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Los Vilos"]
};

const form = document.getElementById('actividadForm');
const regionSelect = document.getElementById('region');
const comunaSelect = document.getElementById('comuna');
const temaSelect = document.getElementById('tema');
const otroTemaContainer = document.getElementById('otroTemaContainer');
const otroTemaInput = document.getElementById('otroTema');
const inicioInput = document.getElementById('inicio');
const terminoInput = document.getElementById('termino');
const agregarContactoBtn = document.getElementById('agregarContacto');
const contactoContainer = document.getElementById('contactoContainer');
const agregarFotoBtn = document.getElementById('agregarFoto');
const fotosContainer = document.getElementById('fotosContainer');
const confirmacionModal = document.getElementById('confirmacionModal');
const exitoModal = document.getElementById('exitoModal');
const confirmarBtn = document.getElementById('confirmarBtn');
const cancelarBtn = document.getElementById('cancelarBtn');

function inicializarFechas() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minuto = String(ahora.getMinutes()).padStart(2, '0');
    
    const fechaHoraActual = `${año}-${mes}-${dia}T${hora}:${minuto}`;
    inicioInput.value = fechaHoraActual;
    
    const despues = new Date(ahora);
    despues.setHours(despues.getHours() + 3);
    const horaDespues = String(despues.getHours()).padStart(2, '0');
    const minutoDespues = String(despues.getMinutes()).padStart(2, '0');
    
    const fechaHoraDespues = `${año}-${mes}-${dia}T${horaDespues}:${minutoDespues}`;
    terminoInput.value = fechaHoraDespues;
}

function actualizarComunas() {
    const regionSeleccionada = regionSelect.value;
    comunaSelect.innerHTML = '';
    
    if (!regionSeleccionada) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione primero una región';
        comunaSelect.appendChild(defaultOption);
        return;
    }
    
    const comunas = comunasPorRegion[regionSeleccionada];
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccione una comuna';
    comunaSelect.appendChild(defaultOption);
    
    comunas.forEach(comuna => {
        const option = document.createElement('option');
        option.value = comuna.toLowerCase();
        option.textContent = comuna;
        comunaSelect.appendChild(option);
    });
}

function toggleOtroTema() {
    if (temaSelect.value === 'otro') {
        otroTemaContainer.style.display = 'block';
        otroTemaInput.setAttribute('required', '');
    } else {
        otroTemaContainer.style.display = 'none';
        otroTemaInput.removeAttribute('required');
    }
}

function agregarContacto() {
    const contactos = document.querySelectorAll('.contacto-grupo');
    
    if (contactos.length >= 5) {
        alert('Solo puede agregar hasta 5 formas de contacto');
        return;
    }
    
    const nuevoContacto = document.createElement('div');
    nuevoContacto.className = 'contacto-grupo';
    nuevoContacto.innerHTML = `
        <select class="contacto-tipo" name="contacto_tipo[]">
            <option value="">Seleccionar</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
            <option value="x">X</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="otra">Otra</option>
        </select>
        <input type="text" class="contacto-id" name="contacto_id[]" minlength="4" maxlength="50" placeholder="ID de contacto o URL">
        <button type="button" class="eliminar-contacto">Eliminar</button>
    `;
    
    contactoContainer.insertBefore(nuevoContacto, agregarContactoBtn);
    
    nuevoContacto.querySelector('.eliminar-contacto').addEventListener('click', function() {
        contactoContainer.removeChild(nuevoContacto);
    });
}

function agregarFoto() {
    const fotos = document.querySelectorAll('.foto-input');
    
    if (fotos.length >= 5) {
        alert('Solo puede agregar hasta 5 fotos');
        return;
    }
    
    const nuevaFoto = document.createElement('div');
    nuevaFoto.className = 'foto-grupo';
    nuevaFoto.innerHTML = `
        <input type="file" class="foto-input" name="fotos[]" accept="image/*" required>
        <button type="button" class="eliminar-foto">Eliminar</button>
    `;
    
    fotosContainer.insertBefore(nuevaFoto, agregarFotoBtn);
    
    nuevaFoto.querySelector('.eliminar-foto').addEventListener('click', function() {
        const totalFotos = document.querySelectorAll('.foto-input').length;
        if (totalFotos <= 1) {
            alert('Debe incluir al menos una foto');
            return;
        }
        fotosContainer.removeChild(nuevaFoto);
    });
}

function validarFormulario(event) {
    event.preventDefault();
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    
    const celular = document.getElementById('celular').value;
    if (celular && !validarCelular(celular)) {
        alert('El número de celular debe tener el formato +NNN.NNNNNNNN, por ejemplo: +569.12345678');
        return false;
    }
    
    if (terminoInput.value) {
        const inicio = new Date(inicioInput.value);
        const termino = new Date(terminoInput.value);
        
        if (termino <= inicio) {
            alert('La fecha y hora de término debe ser posterior a la fecha y hora de inicio');
            return false;
        }
    }
    
    const fotos = document.querySelectorAll('.foto-input');
    if (fotos.length < 1) {
        alert('Debe incluir al menos una foto');
        return false;
    }
    
    confirmacionModal.style.display = 'block';
    return false;
}

function validarCelular(celular) {
    const regex = /^\+569\d{8}$/;
    return regex.test(celular);
}

function confirmarEnvio() {
    confirmacionModal.style.display = 'none';
    exitoModal.style.display = 'block';
}

function cancelarEnvio() {
    confirmacionModal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    inicializarFechas();
    
    regionSelect.addEventListener('change', actualizarComunas);
    
    temaSelect.addEventListener('change', toggleOtroTema);
    
    agregarContactoBtn.addEventListener('click', agregarContacto);
    agregarFotoBtn.addEventListener('click', agregarFoto);
    
    form.addEventListener('submit', validarFormulario);
    confirmarBtn.addEventListener('click', confirmarEnvio);
    cancelarBtn.addEventListener('click', cancelarEnvio);
});