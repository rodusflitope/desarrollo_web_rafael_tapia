from datetime import datetime
import re

def validar_informar_actividad(form, files):
    """
    Valida los datos del formulario de informar actividad
    Retorna un diccionario con errores o None si no hay errores
    """
    errores = {}
    
    # Validar campos requeridos
    campos_requeridos = ['comuna', 'nombre', 'email', 'inicio', 'tema']
    for campo in campos_requeridos:
        if not form.get(campo):
            errores[campo] = f'El campo {campo} es obligatorio'
    
    # Validar fechas
    if form.get('inicio'):
        try:
            inicio = datetime.strptime(form.get('inicio'), '%Y-%m-%dT%H:%M')
            now = datetime.now()
            if inicio < now:
                errores['inicio'] = 'La fecha de inicio debe ser posterior a la fecha actual'
        except ValueError:
            errores['inicio'] = 'Formato de fecha inválido'
    
    if form.get('termino'):
        try:
            if form.get('inicio'):
                inicio = datetime.strptime(form.get('inicio'), '%Y-%m-%dT%H:%M')
                termino = datetime.strptime(form.get('termino'), '%Y-%m-%dT%H:%M')
                if termino <= inicio:
                    errores['termino'] = 'La fecha de término debe ser posterior a la fecha de inicio'
        except ValueError:
            errores['termino'] = 'Formato de fecha inválido'
    
    # Validar email
    if form.get('email') and not re.match(r"[^@]+@[^@]+\.[^@]+", form.get('email')):
        errores['email'] = 'Email inválido'
    
    # Validar celular (opcional)
    if form.get('celular') and not re.match(r"\+569[0-9]{8}", form.get('celular')):
        errores['celular'] = 'Formato de celular inválido, debe ser +569XXXXXXXX'
    
    # Validar tema "otro"
    if form.get('tema') == 'otro' and not form.get('otro_tema'):
        errores['otro_tema'] = 'Debe especificar el tema'
    
    # Validar fotos (al menos una)
    fotos = files.getlist('fotos[]')
    if not fotos or not fotos[0].filename:
        errores['fotos'] = 'Debe subir al menos una foto'
    
    # Validar contactos adicionales
    if form.getlist('contacto_tipo[]'):
        for i, tipo in enumerate(form.getlist('contacto_tipo[]')):
            if tipo and not form.getlist('contacto_id[]')[i]:
                errores[f'contacto_id_{i}'] = 'Debe ingresar un identificador para este contacto'
            elif not tipo and form.getlist('contacto_id[]')[i]:
                errores[f'contacto_tipo_{i}'] = 'Debe seleccionar un tipo de contacto'
    
    return errores if errores else None

def validar_comentario(form_data):
    """Valida los datos del formulario de comentarios"""
    errores = {}

    nombre = form_data.get('nombre', '').strip()
    if not nombre:
        errores['nombre'] = 'El nombre es obligatorio'
    elif len(nombre) < 3:
        errores['nombre'] = 'El nombre debe tener al menos 3 caracteres'
    elif len(nombre) > 80:
        errores['nombre'] = 'El nombre no puede tener mas de 80 caracteres'

    texto = form_data.get('texto', '').strip()
    if not texto:
        errores['texto'] = 'El comentario es obligatorio'
    elif len(texto) < 5:
        errores['texto'] = 'El comentario debe tener al menos 5 caracteres'
    elif len(texto) > 300:
        errores['texto'] = 'El comentario no puede tener mas de 300 caracteres'
    
    return errores if errores else None