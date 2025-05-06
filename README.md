# Tarea 1

### Estructura de código CSS y JavaScript
Decidí mantener los estilos CSS embebidos directamente en los archivos HTML mientras separé los scripts JavaScript en archivos independientes en la carpeta js/.

### Validación específica para números chilenos
Añadí validación mediante expresiones regulares para números de celular en formato chileno (+569 seguido de 8 dígitos) por
lo que la aplicación sólo soporta números chilenos.

# Tarea 2

### Estructura carpetas nueva
Se siguio una estructura de carpetas parecida al ejemplo de app de flask del auxiliar pero para usar la funcion render_template y la arquitectura standart se pusieron los htrml en templates.

### Separacion detalles de actividad
Se separo el html que tiene los detalles de la actividad del que tiene el listado de actividades para hacer mas modular la app.

### Usuario de DB
Se pusieron las credenciales en un .env porque es una practica comun pero este se subio al repo para que se pueda usar para entrar a la db de la tarea (no hay gitignore)

### Script suelto en informar actividad
Se dejo un pedazo de script en el html el cual sera movido a futuro al js(dio muchos problemas)