// Listado de actividades con JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const tableBody = document.getElementById('actividadesTableBody');
    const paginacionControles = document.getElementById('paginacionControles');
    
    let paginaActual = 1;
    
    // Cargar actividades al inicio
    cargarActividades(paginaActual);
    
    // Función para cargar actividades desde la API
    function cargarActividades(pagina) {
        // Mostrar estado de carga
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Cargando actividades...</td></tr>';
        
        // Realizar la petición AJAX
        fetch(`/api/actividades?page=${pagina}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los datos');
                }
                return response.json();
            })
            .then(data => {
                // Actualizar la tabla con los datos recibidos
                actualizarTabla(data.actividades);
                
                // Actualizar los controles de paginación
                actualizarPaginacion(data.paginacion);
                
                // Actualizar la variable de página actual
                paginaActual = data.paginacion.pagina_actual;
            })
            .catch(error => {
                console.error('Error:', error);
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Error al cargar los datos. Por favor, intenta de nuevo.</td></tr>';
            });
    }
    
    // Función para actualizar la tabla con los datos recibidos
    function actualizarTabla(actividades) {
        // Limpiar la tabla
        tableBody.innerHTML = '';
        
        // Si no hay actividades, mostrar mensaje
        if (!actividades || actividades.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay actividades disponibles</td></tr>';
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
                <td>${actividad.nombre_organizador}</td>
                <td>${actividad.total_fotos}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Agregar event listeners a las nuevas filas
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
    
    // Función para actualizar los controles de paginación
    function actualizarPaginacion(paginacion) {
        const { pagina_actual, total_paginas } = paginacion;
        
        // Limpiar controles de paginación
        paginacionControles.innerHTML = '';
        
        // Si solo hay una página, no mostrar controles
        if (total_paginas <= 1) {
            return;
        }
        
        // Crear controles de paginación
        const paginacionHTML = document.createElement('div');
        
        // Botón 'Anterior'
        if (pagina_actual > 1) {
            const btnAnterior = document.createElement('a');
            btnAnterior.className = 'btn-pagina';
            btnAnterior.href = '#';
            btnAnterior.textContent = 'Anterior';
            btnAnterior.addEventListener('click', function(e) {
                e.preventDefault();
                cargarActividades(pagina_actual - 1);
            });
            paginacionHTML.appendChild(btnAnterior);
        } else {
            const btnAnteriorDisabled = document.createElement('span');
            btnAnteriorDisabled.className = 'btn-pagina disabled';
            btnAnteriorDisabled.textContent = 'Anterior';
            paginacionHTML.appendChild(btnAnteriorDisabled);
        }
        
        // Información de página actual
        const infoPagina = document.createElement('span');
        infoPagina.className = 'info-pagina';
        infoPagina.textContent = `Página ${pagina_actual} de ${total_paginas}`;
        paginacionHTML.appendChild(infoPagina);
        
        // Botón 'Siguiente'
        if (pagina_actual < total_paginas) {
            const btnSiguiente = document.createElement('a');
            btnSiguiente.className = 'btn-pagina';
            btnSiguiente.href = '#';
            btnSiguiente.textContent = 'Siguiente';
            btnSiguiente.addEventListener('click', function(e) {
                e.preventDefault();
                cargarActividades(pagina_actual + 1);
            });
            paginacionHTML.appendChild(btnSiguiente);
        } else {
            const btnSiguienteDisabled = document.createElement('span');
            btnSiguienteDisabled.className = 'btn-pagina disabled';
            btnSiguienteDisabled.textContent = 'Siguiente';
            paginacionHTML.appendChild(btnSiguienteDisabled);
        }
        
        paginacionControles.appendChild(paginacionHTML);
    }
});