// Listado de actividades realizads con JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const tableBody = document.getElementById('actividadesRealizadasTableBody');
    const paginacionControles = document.getElementById('paginacionControles');
    
    let paginaActual = 1;
    
    // Cargar actividades al inicio
    cargarActividadesRealizadas(paginaActual);
    
    // Función para cargar actividades desde la API
    function cargarActividadesRealizadas(pagina) {
        // Mostrar estado de carga
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Cargando actividades...</td></tr>';
        
        // Realizar la petición AJAX
        fetch(`/api/actividades-realizadas?page=${pagina}`)
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
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Error al cargar los datos. Por favor, intenta de nuevo.</td></tr>';
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
                <td class="clickable-cell">${actividad.id}</td>
                <td class="clickable-cell">${actividad.fecha_inicio}</td>
                <td class="clickable-cell">${actividad.sector}</td>
                <td class="clickable-cell">${actividad.nombre}</td>
                <td class="clickable-cell">${actividad.tema}</td>
                <td class="nota-display clickable-cell" data-id="${actividad.id}">${actividad.nota}</td>
                <td><button class="btn-evaluar" onclick="evaluarActividad(${actividad.id})">evaluar</button></td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Agregar event listeners a las nuevas filas
        agregarEventListenersAFilas();
    }
    
    // Función para agregar event listeners a las filas de la tabla
    function agregarEventListenersAFilas() {
        const clickableCells = document.querySelectorAll('.clickable-cell');
        
        clickableCells.forEach(cell => {
            cell.addEventListener('click', function() {
                const row = this.closest('.actividad-row');
                const id = row.getAttribute('data-id');
                if (id) {
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
                cargarActividadesRealizadas(pagina_actual - 1);
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
                cargarActividadesRealizadas(pagina_actual + 1);
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
    
    window.evaluarActividad = function(actividadId) {
        const nota = prompt("Ingrese una nota entre 1 y 7 para esta actividad:");
        
        if (nota === null) {
            return;
        }
        
        const notaNum = parseInt(nota);
        if (isNaN(notaNum) || notaNum < 1 || notaNum > 7) {
            alert("La nota debe ser un número entero entre 1 y 7");
            return;
        }
        
        fetch('/api/evaluar-actividad', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                actividad_id: actividadId,
                nota: notaNum
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const notaDisplay = document.querySelector(`.nota-display[data-id="${actividadId}"]`);
                if (notaDisplay) {
                    notaDisplay.textContent = data.nota_promedio;
                }
                alert("Nota agregada exitosamente");
            } else {
                alert("Error al agregar la nota: " + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error al conectar con el servidor");
        });
    };
});