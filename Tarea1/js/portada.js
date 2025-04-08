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

function handleImageErrors() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.error(`Error al cargar la imagen: ${img.src}`);
            img.src = 'img/placeholder.jpg';
            img.alt = 'Imagen no disponible';
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    highlightCurrentPage();
    checkPageStatus();
    handleImageErrors();
    
    console.log('Aplicación de Actividades Recreativas inicializada');
});