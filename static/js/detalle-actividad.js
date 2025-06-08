document.addEventListener('DOMContentLoaded', function() {
    const actividadId = obtenerIdActividad();
    const formComentario = document.getElementById('form-comentario');
    const listaComentarios = document.getElementById('lista-comentarios');
    
    cargarComentarios();
    
    if (formComentario) {
        formComentario.addEventListener('submit', function(e) {
            e.preventDefault();
            agregarComentario();
        });
    }
    
    function obtenerIdActividad() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.indexOf('actividad') + 1];
    }
    
    function cargarComentarios() {
        fetch(`/actividad/${actividadId}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            mostrarComentarios(data.comentarios || []);
        })
        .catch(error => {
            console.error('Error al cargar comentarios:', error);
            listaComentarios.innerHTML = '<p>Error al cargar los comentarios</p>';
        });
    }
    
    function mostrarComentarios(comentarios) {
        if (comentarios.length === 0) {
            listaComentarios.innerHTML = '<p>No hay comentarios todavía. ¡Sé el primero en comentar!</p>';
            return;
        }
        
        let html = '';
        comentarios.forEach(comentario => {
            html += `
                <div class="comentario">
                    <div class="comentario-header">
                        <strong>${escapeHtml(comentario.nombre)}</strong>
                        <span class="comentario-fecha">${comentario.fecha}</span>
                    </div>
                    <div class="comentario-texto">
                        ${escapeHtml(comentario.texto)}
                    </div>
                </div>
            `;
        });
        
        listaComentarios.innerHTML = html;
    }
    
    function agregarComentario() {
        limpiarErrores();
        
        const formData = new FormData(formComentario);
        
        fetch(`/actividad/${actividadId}/comentario`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                mostrarError(data.error);
            } else {
                formComentario.reset();
                mostrarMensajeExito('Comentario agregado exitosamente');
                cargarComentarios();
            }
        })
        .catch(error => {
            console.error('Error al agregar comentario:', error);
            mostrarError('Error al agregar el comentario. Inténtalo nuevamente.');
        });
    }
    
    function mostrarError(mensaje) {
        const errorDiv = document.getElementById('error-nombre') || document.getElementById('error-texto');
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = 'block';
        }
    }
    
    function mostrarMensajeExito(mensaje) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'success';
        mensajeDiv.textContent = mensaje;
        formComentario.appendChild(mensajeDiv);

        setTimeout(() => {
            if (mensajeDiv.parentNode) {
                mensajeDiv.parentNode.removeChild(mensajeDiv);
            }
        }, 3000);
    }
    
    function limpiarErrores() {
        const errores = document.querySelectorAll('.error');
        errores.forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
    }  
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
