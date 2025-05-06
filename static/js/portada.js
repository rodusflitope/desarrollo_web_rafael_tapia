function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPage === href || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function checkPageStatus() {
    if (document.readyState === 'complete') {
        console.log('La página se ha cargado completamente');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    highlightCurrentPage();
    checkPageStatus();
    
    console.log('Aplicación de Actividades Recreativas inicializada');

    // Elementos del DOM
    const tableBody = document.getElementById('actividadesPortadaTableBody');
    
    // Cargar actividades al inicio
    cargarUltimasActividades();
    
    // Función para cargar las últimas actividades desde la API
    function cargarUltimasActividades() {
        // Mostrar estado de carga
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Cargando actividades...</td></tr>';
        
        // Realizar la petición AJAX
        fetch('/api/ultimas-actividades')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los datos');
                }
                return response.json();
            })
            .then(actividades => {
                // Actualizar la tabla con los datos recibidos
                actualizarTabla(actividades);
            })
            .catch(error => {
                console.error('Error:', error);
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Error al cargar los datos. Por favor, intenta de nuevo.</td></tr>';
            });
    }
    
    // Función para actualizar la tabla con los datos recibidos
    function actualizarTabla(actividades) {
        // Limpiar la tabla
        tableBody.innerHTML = '';
        
        // Si no hay actividades, mostrar mensaje
        if (!actividades || actividades.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay actividades disponibles</td></tr>';
            return;
        }
        
        // Agregar las filas a la tabla
        actividades.forEach(actividad => {
            const row = document.createElement('tr');
            row.className = 'actividad-row';
            row.setAttribute('data-id', actividad.id);
            
            row.innerHTML = `
                <td>${actividad.inicio}</td>
                <td>${actividad.termino}</td>
                <td>${actividad.comuna}</td>
                <td>${actividad.sector}</td>
                <td>${actividad.tema}</td>
                <td><img src="${actividad.img_url}" alt="Imagen de actividad" width="200"></td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Agregar event listeners a las filas
        agregarEventListenersAFilas();
    }
    
    // Función para agregar event listeners a las filas de la tabla
    function agregarEventListenersAFilas() {
        const actividadRows = document.querySelectorAll('.actividad-row');
        
        actividadRows.forEach(row => {
            row.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (id) {
                    // Navegar a la página de detalle
                    window.location.href = `/actividad/${id}`;
                } else {
                    console.error('La fila no tiene un atributo data-id');
                }
            });
        });
    }
    
    // Manejar errores de imagen
    function handleImageErrors() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('error', function() {
                console.error(`Error al cargar la imagen: ${img.src}`);
                img.src = '/static/img/placeholder.png';
                img.alt = 'Imagen no disponible';
            });
        });
    }
    
    // Llamar a la función para manejar errores de imagen después de cargar las actividades
    setTimeout(handleImageErrors, 500);
});