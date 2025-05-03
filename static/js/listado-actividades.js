const actividades = [
    {
        id: 1,
        inicio: "2025-03-28 12:00",
        termino: "2025-03-28 14:00",
        region: "Metropolitana",
        comuna: "Santiago",
        sector: "Beauchef 850",
        nombre_organizador: "Juan Pérez",
        email: "juan.perez@ejemplo.com",
        celular: "+569.12345678",
        contacto: [
            { tipo: "whatsapp", id: "+569.12345678" },
            { tipo: "instagram", id: "@juan_perez_box" }
        ],
        descripcion: "Entrenamiento de Calistenia para principiantes. Aprende técnicas básicas y ejercicios de acondicionamiento físico.",
        tema: "Entrenamiento de Calistenia",
        fotos: ["perrocalistenia.png", "boxeo2.jpg", "boxeo3.jpg"]
    },
    {
        id: 2,
        inicio: "2025-03-29 19:00",
        termino: "2025-03-29 21:30",
        region: "Metropolitana",
        comuna: "Ñuñoa",
        sector: "Plaza Ñuñoa, sector kiosco central",
        nombre_organizador: "María González",
        email: "maria.gonzalez@ejemplo.com",
        celular: "+569.87654321",
        contacto: [
            { tipo: "telegram", id: "@mariagonzalez" }
        ],
        descripcion: "Taller de astronomía urbana para aficionados, con observación de estrellas y planetas.",
        tema: "Taller de astronomía urbana",
        fotos: ["galaxia.png", "fruta2.jpg"]
    },
    {
        id: 3,
        inicio: "2025-03-30 18:00",
        termino: "2025-03-30 22:00",
        region: "Metropolitana",
        comuna: "Santiago",
        sector: "Parque Quinta Normal, anfiteatro",
        nombre_organizador: "Carlos Rodríguez",
        email: "carlos.rodriguez@ejemplo.com",
        celular: "",
        contacto: [
            { tipo: "instagram", id: "@carlos_music" },
            { tipo: "x", id: "@carlos_urban" },
            { tipo: "tiktok", id: "@carlosmusica" }
        ],
        descripcion: "Jam session de jazz experimental con artistas locales. Evento abierto y gratuito para toda la comunidad.",
        tema: "Jam session de jazz experimental",
        fotos: ["saxo.png", "musica2.jpg", "musica3.jpg", "musica4.jpg"]
    },
    {
        id: 4,
        inicio: "2025-04-01 10:00",
        termino: "2025-04-01 12:30",
        region: "Metropolitana",
        comuna: "Providencia",
        sector: "Jardín Japonés, Parque Metropolitano",
        nombre_organizador: "Laura Muñoz",
        email: "laura.munoz@ejemplo.com",
        celular: "+569.55443322",
        contacto: [
            { tipo: "whatsapp", id: "+569.55443322" }
        ],
        descripcion: "Sesión de meditación trascendental para todos los niveles. Traer mat o toalla y ropa cómoda.",
        tema: "Meditación trascendental",
        fotos: ["demiurgo.png", "yoga2.jpg"]
    },
    {
        id: 5,
        inicio: "2025-04-02 15:00",
        termino: "2025-04-02 19:00",
        region: "Metropolitana",
        comuna: "Las Condes",
        sector: "Parque Araucano, zona de picnic",
        nombre_organizador: "Pedro Soto",
        email: "pedro.soto@ejemplo.com",
        celular: "+569.11223344",
        contacto: [
            { tipo: "whatsapp", id: "+569.11223344" },
            { tipo: "telegram", id: "@pedrosoto" },
            { tipo: "x", id: "@pedro_robotica" }
        ],
        descripcion: "Taller de construcción de maquinaria con materiales reciclados para niños y jóvenes. Se trabajará con materiales reciclados para crear máquinas simples.",
        tema: "Taller de construcción de maquinaria con materiales reciclados",
        fotos: ["titanwhm.png", "robotica2.jpg", "robotica3.jpg", "robotica4.jpg", "robotica5.jpg"]
    }
];

const listadoSection = document.getElementById('listado');
const detalleSection = document.getElementById('detalle');
const detalleActividad = document.getElementById('detalleActividad');
const actividadRows = document.querySelectorAll('.actividad-row');
const volverListadoBtn = document.getElementById('volverListadoBtn');
const fotoModal = document.getElementById('fotoModal');
const fotoAmpliada = document.getElementById('fotoAmpliada');
const cerrarFotoBtn = document.getElementById('cerrarFotoBtn');

function mostrarDetalle(id) {
    const actividad = actividades.find(act => act.id === parseInt(id));
    
    if (!actividad) {
        alert('Actividad no encontrada');
        return;
    }
    
    let fotosHTML = '<div class="galeria-fotos">';
    actividad.fotos.forEach(foto => {
        fotosHTML += `<img src="img/${foto}" alt="Foto de la actividad" class="mini-foto" onclick="ampliarFoto('img/${foto}')">`;
    });
    fotosHTML += '</div>';
    
    let contactosHTML = '';
    if (actividad.contacto && actividad.contacto.length > 0) {
        contactosHTML = '<h3>Contacto adicional</h3><ul>';
        actividad.contacto.forEach(c => {
            contactosHTML += `<li>${c.tipo}: ${c.id}</li>`;
        });
        contactosHTML += '</ul>';
    }
    
    let detalleHTML = `
        <div class="detalle-info">
            <h3>Información del evento</h3>
            <dl>
                <dt>Inicio:</dt>
                <dd>${actividad.inicio}</dd>
                
                <dt>Término:</dt>
                <dd>${actividad.termino || '-'}</dd>
                
                <dt>Región:</dt>
                <dd>${actividad.region}</dd>
                
                <dt>Comuna:</dt>
                <dd>${actividad.comuna}</dd>
                
                <dt>Sector:</dt>
                <dd>${actividad.sector || '-'}</dd>
                
                <dt>Tema:</dt>
                <dd>${actividad.tema}</dd>
            </dl>
        </div>
        
        <div class="detalle-info">
            <h3>Organizador</h3>
            <dl>
                <dt>Nombre:</dt>
                <dd>${actividad.nombre_organizador}</dd>
                
                <dt>Email:</dt>
                <dd>${actividad.email}</dd>
                
                <dt>Celular:</dt>
                <dd>${actividad.celular || '-'}</dd>
            </dl>
            ${contactosHTML}
        </div>
        
        <div class="detalle-info">
            <h3>Descripción</h3>
            <p>${actividad.descripcion}</p>
        </div>
        
        <div class="detalle-fotos">
            <h3>Fotos (${actividad.fotos.length})</h3>
            ${fotosHTML}
        </div>
    `;
    
    detalleActividad.innerHTML = detalleHTML;
    listadoSection.classList.add('hidden');
    detalleSection.classList.remove('hidden');
}

function volverAlListado() {
    detalleSection.classList.add('hidden');
    listadoSection.classList.remove('hidden');
}

function ampliarFoto(src) {
    fotoAmpliada.src = src;
    fotoModal.style.display = 'block';
}

function cerrarFoto() {
    fotoModal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    actividadRows.forEach(row => {
        row.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            mostrarDetalle(id);
        });
    });
    
    volverListadoBtn.addEventListener('click', volverAlListado);
    
    cerrarFotoBtn.addEventListener('click', cerrarFoto);
    
    window.ampliarFoto = ampliarFoto;
});