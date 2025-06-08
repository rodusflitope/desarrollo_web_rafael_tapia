from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, scoped_session
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from utils.validation import validar_informar_actividad, validar_comentario

# Cargar variables desde el archivo .env
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')

# Configuración para cargar imágenes
UPLOAD_FOLDER = os.path.join('static', 'img', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB tamaño máximo

# Extensiones permitidas para imágenes
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Configuración de SQLAlchemy puro
DB_USER = os.getenv('MYSQL_USER', 'root')
DB_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
DB_HOST = os.getenv('MYSQL_HOST', 'localhost')
DB_NAME = os.getenv('MYSQL_DB', 'tarea2')

# Crear la conexión a la base de datos
engine = create_engine(f"mysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}?charset=utf8", pool_pre_ping=True)
Base = declarative_base()

# Crear una sesión
session_factory = sessionmaker(bind=engine)
Session = scoped_session(session_factory)

# Definición de modelos
class Region(Base):
    __tablename__ = 'region'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(200), nullable=False)
    
class Comuna(Base):
    __tablename__ = 'comuna'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(200), nullable=False)
    region_id = Column(Integer, ForeignKey('region.id'), nullable=False)
    region = relationship("Region", backref="comunas")

class Actividad(Base):
    __tablename__ = 'actividad'
    id = Column(Integer, primary_key=True)
    comuna_id = Column(Integer, ForeignKey('comuna.id'), nullable=False)
    sector = Column(String(100))
    nombre = Column(String(200), nullable=False)
    email = Column(String(100), nullable=False)
    celular = Column(String(15))
    dia_hora_inicio = Column(DateTime, nullable=False)
    dia_hora_termino = Column(DateTime)
    descripcion = Column(Text)
    comuna = relationship("Comuna", backref="actividades")
    
class ActividadTema(Base):
    __tablename__ = 'actividad_tema'
    id = Column(Integer, primary_key=True)
    tema = Column(String(15), nullable=False)
    glosa_otro = Column(String(15))
    actividad_id = Column(Integer, ForeignKey('actividad.id'), nullable=False)
    actividad = relationship("Actividad", backref="tema")

class Foto(Base):
    __tablename__ = 'foto'
    id = Column(Integer, primary_key=True)
    ruta_archivo = Column(String(300), nullable=False)
    nombre_archivo = Column(String(300), nullable=False)
    actividad_id = Column(Integer, ForeignKey('actividad.id'), nullable=False)
    actividad = relationship("Actividad", backref="fotos")

class ContactarPor(Base):
    __tablename__ = 'contactar_por'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(20), nullable=False)
    identificador = Column(String(150), nullable=False)
    actividad_id = Column(Integer, ForeignKey('actividad.id'), nullable=False)
    actividad = relationship("Actividad", backref="contactos")

class Comentario(Base):
    __tablename__ = 'comentario'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(80), nullable=False)
    texto = Column(String(300), nullable=False)
    fecha = Column(DateTime, nullable=False)
    actividad_id = Column(Integer, ForeignKey('actividad.id'), nullable=False)
    actividad = relationship("Actividad", backref="comentarios")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/ultimas-actividades')
def api_ultimas_actividades():
    """API endpoint para obtener las últimas 5 actividades en formato JSON"""
    session = Session()
    try:
        # Obtener las últimas 5 actividades de la base de datos
        actividad_ids = session.query(Actividad.id)\
            .order_by(Actividad.dia_hora_inicio.desc())\
            .limit(5).all()

        actividad_ids = [id[0] for id in actividad_ids]
        
        # Formatear datos para la respuesta JSON
        actividades_formateadas = []
        for act_id in actividad_ids:
            actividad_data = session.query(
                Actividad.id,
                Actividad.dia_hora_inicio,
                Actividad.dia_hora_termino,
                Comuna.nombre.label('comuna'),
                Actividad.sector,
                ActividadTema.tema,
                ActividadTema.glosa_otro
            ).join(Comuna, Actividad.comuna_id == Comuna.id)\
             .join(ActividadTema, Actividad.id == ActividadTema.actividad_id)\
             .filter(Actividad.id == act_id)\
             .first()

            if actividad_data:
                foto = session.query(Foto.nombre_archivo)\
                    .filter(Foto.actividad_id == act_id)\
                    .first()

                nombre_archivo = foto[0] if foto else 'placeholder.png'
                tema_display = actividad_data.glosa_otro if actividad_data.tema == 'otro' else actividad_data.tema
                
                # Crear la URL para la imagen
                img_url = url_for('static', filename=f'img/uploads/{nombre_archivo}')

                actividades_formateadas.append({
                    'id': actividad_data.id,
                    'inicio': actividad_data.dia_hora_inicio.strftime('%Y-%m-%d %H:%M'),
                    'termino': actividad_data.dia_hora_termino.strftime('%Y-%m-%d %H:%M') if actividad_data.dia_hora_termino else '-',
                    'comuna': actividad_data.comuna,
                    'sector': actividad_data.sector or '-',
                    'tema': tema_display,
                    'img_url': img_url
                })
                
        return jsonify(actividades_formateadas)
    finally:
        session.close()

@app.route('/')
def index():
    """Renderiza la página de portada"""
    return render_template('portada.html')

@app.route('/informar-actividad')
def informar_actividad():
    # Obtener regiones para el formulario
    session = Session()
    try:
        regiones = [(r.id, r.nombre) for r in session.query(Region).order_by(Region.id).all()]
        return render_template('informar_actividad.html', regiones=regiones)
    finally:
        session.close()

@app.route('/informar-actividad/procesar', methods=['POST'])
def procesar_actividad():
    if request.method == 'POST':
        # Validar datos del formulario
        errores = validar_informar_actividad(request.form, request.files)
        
        # Si hay errores, volver a mostrar el formulario con los errores
        if errores:
            session = Session()
            try:
                # Obtener regiones para el formulario
                regiones = [(r.id, r.nombre) for r in session.query(Region).order_by(Region.id).all()]
                
                # Si se seleccionó una región, obtener las comunas correspondientes
                comunas = []
                if request.form.get('region'):
                    comunas = [(c.id, c.nombre) for c in session.query(Comuna).filter(Comuna.region_id == request.form.get('region'))\
                                       .order_by(Comuna.nombre).all()]
                
                # Preparar datos para conservar lo ingresado por el usuario
                datos_form = {
                    'region': request.form.get('region', ''),
                    'comuna': request.form.get('comuna', ''),
                    'sector': request.form.get('sector', ''),
                    'nombre': request.form.get('nombre', ''),
                    'email': request.form.get('email', ''),
                    'celular': request.form.get('celular', ''),
                    'inicio': request.form.get('inicio', ''),
                    'termino': request.form.get('termino', ''),
                    'descripcion': request.form.get('descripcion', ''),
                    'tema': request.form.get('tema', ''),
                    'otro_tema': request.form.get('otro_tema', ''),
                    'contactos': zip(request.form.getlist('contacto_tipo[]'), 
                                    request.form.getlist('contacto_id[]'))
                }
                
                for error in errores.values():
                    flash(error, 'error')
                    
                return render_template('informar_actividad.html', 
                                      regiones=regiones, 
                                      comunas=comunas, 
                                      form=datos_form, 
                                      errores=errores)
            finally:
                session.close()
        
        # No hay errores, proceder con la inserción
        session = Session()
        try:
            # Obtener datos del formulario
            comuna_id = request.form.get('comuna')
            sector = request.form.get('sector')
            nombre = request.form.get('nombre')
            email = request.form.get('email')
            celular = request.form.get('celular')
            inicio = datetime.strptime(request.form.get('inicio'), '%Y-%m-%dT%H:%M')
            
            # Verificar si existe término
            termino = None
            if request.form.get('termino'):
                termino = datetime.strptime(request.form.get('termino'), '%Y-%m-%dT%H:%M')
            
            descripcion = request.form.get('descripcion')
            tema = request.form.get('tema')
            otro_tema = request.form.get('otro_tema') if tema == 'otro' else None
            
            # Crear nueva actividad
            nueva_actividad = Actividad(
                comuna_id=comuna_id,
                sector=sector,
                nombre=nombre,
                email=email,
                celular=celular,
                dia_hora_inicio=inicio,
                dia_hora_termino=termino,
                descripcion=descripcion
            )
            session.add(nueva_actividad)
            session.flush()  # Para obtener el ID asignado
            
            # Crear el tema de la actividad
            nuevo_tema = ActividadTema(
                tema=tema,
                glosa_otro=otro_tema,
                actividad_id=nueva_actividad.id
            )
            session.add(nuevo_tema)
            
            # Procesar y guardar fotos
            fotos = request.files.getlist('fotos[]')
            for foto in fotos:
                if foto and foto.filename and allowed_file(foto.filename):
                    # Generar nombre único para la foto
                    filename = secure_filename(foto.filename)
                    unique_filename = f"{uuid.uuid4()}_{filename}"
                    
                    # Guardar la foto en el sistema de archivos
                    foto_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                    foto.save(foto_path)
                    
                    # Guardar referencia en la base de datos
                    ruta_archivo = f"img/uploads/{unique_filename}"
                    nueva_foto = Foto(
                        ruta_archivo=ruta_archivo,
                        nombre_archivo=unique_filename,
                        actividad_id=nueva_actividad.id
                    )
                    session.add(nueva_foto)
            
            # Insertar contactos adicionales
            contacto_tipos = request.form.getlist('contacto_tipo[]')
            contacto_ids = request.form.getlist('contacto_id[]')
            
            for i in range(len(contacto_tipos)):
                if contacto_tipos[i] and contacto_ids[i]:
                    nuevo_contacto = ContactarPor(
                        nombre=contacto_tipos[i],
                        identificador=contacto_ids[i],
                        actividad_id=nueva_actividad.id
                    )
                    session.add(nuevo_contacto)
            
            # Confirmar todos los cambios
            session.commit()
            
            # Mensaje de éxito y redirección a la portada
            flash('¡Actividad registrada exitosamente!', 'success')
            return redirect(url_for('index'))
            
        except Exception as e:
            # Revertir cambios en caso de error
            session.rollback()
            flash(f'Error al registrar la actividad: {str(e)}', 'error')
            return redirect(url_for('informar_actividad'))
        finally:
            session.close()

@app.route('/comunas/<int:region_id>')
def obtener_comunas(region_id):
    session = Session()
    try:
        comunas = session.query(Comuna).filter(Comuna.region_id == region_id).order_by(Comuna.nombre).all()
        return {'comunas': [(comuna.id, comuna.nombre) for comuna in comunas]}
    finally:
        session.close()

@app.route('/api/actividades')
def api_actividades():
    """API endpoint para obtener actividades en formato JSON con paginación"""
    # Obtener el número de página desde el parámetro de la URL
    page = request.args.get('page', 1, type=int)
    per_page = 5  # Número de actividades por página
    
    session = Session()
    try:
        # Contar el total de actividades
        total_actividades = session.query(func.count(Actividad.id)).scalar()
        
        # Calcular paginación
        total_pages = (total_actividades + per_page - 1) // per_page
        offset = (page - 1) * per_page
        
        # Primero obtenemos solo los IDs paginados de las actividades
        actividad_ids = session.query(Actividad.id)\
            .order_by(Actividad.dia_hora_inicio.desc())\
            .offset(offset).limit(per_page).all()
        
        actividad_ids = [id[0] for id in actividad_ids]
        
        # Formatear datos para la respuesta JSON
        actividades_formateadas = []
        for act_id in actividad_ids:
            # Obtenemos los datos básicos de la actividad
            actividad_data = session.query(
                Actividad.id,
                Actividad.dia_hora_inicio,
                Actividad.dia_hora_termino,
                Comuna.nombre.label('comuna'),
                Actividad.sector,
                ActividadTema.tema,
                ActividadTema.glosa_otro,
                Actividad.nombre.label('nombre_organizador')
            ).join(Comuna, Actividad.comuna_id == Comuna.id)\
             .join(ActividadTema, Actividad.id == ActividadTema.actividad_id)\
             .filter(Actividad.id == act_id)\
             .first()
            
            if actividad_data:
                # Contamos las fotos para esta actividad
                total_fotos = session.query(func.count(Foto.id))\
                    .filter(Foto.actividad_id == act_id)\
                    .scalar()
                
                tema_display = actividad_data.glosa_otro if actividad_data.tema == 'otro' else actividad_data.tema
                actividades_formateadas.append({
                    'id': actividad_data.id,
                    'inicio': actividad_data.dia_hora_inicio.strftime('%Y-%m-%d %H:%M'),
                    'termino': actividad_data.dia_hora_termino.strftime('%Y-%m-%d %H:%M') if actividad_data.dia_hora_termino else '-',
                    'comuna': actividad_data.comuna,
                    'sector': actividad_data.sector or '-',
                    'tema': tema_display,
                    'nombre_organizador': actividad_data.nombre_organizador,
                    'total_fotos': total_fotos
                })
        
        # Devolver JSON con los datos y la información de paginación
        return jsonify({
            'actividades': actividades_formateadas,
            'paginacion': {
                'pagina_actual': page,
                'total_paginas': total_pages,
                'total_actividades': total_actividades
            }
        })
    finally:
        session.close()

@app.route('/listado-actividades')
def listado_actividades():
    """Renderiza la página de listado de actividades"""
    return render_template('listado-actividades.html')

@app.route('/actividad/<int:actividad_id>')
def detalle_actividad(actividad_id):
    session = Session()
    try:
        # Obtener actividad
        actividad = session.query(
            Actividad.id,
            Actividad.dia_hora_inicio,
            Actividad.dia_hora_termino,
            Region.nombre.label('region'),
            Comuna.nombre.label('comuna'),
            Actividad.sector,
            ActividadTema.tema,
            ActividadTema.glosa_otro,
            Actividad.nombre.label('nombre_organizador'),
            Actividad.email,
            Actividad.celular,
            Actividad.descripcion
        ).join(Comuna, Actividad.comuna_id == Comuna.id)\
         .join(Region, Comuna.region_id == Region.id)\
         .join(ActividadTema, Actividad.id == ActividadTema.actividad_id)\
         .filter(Actividad.id == actividad_id).first()
        if not actividad:
            return jsonify({"error": "Actividad no encontrada"}), 404

        # Obtener fotos y contactos
        fotos = session.query(Foto).filter(Foto.actividad_id == actividad_id).all()
        contactos = session.query(ContactarPor).filter(ContactarPor.actividad_id == actividad_id).all()
        
        # Formatear los datos para el template
        tema_display = actividad.glosa_otro if actividad.tema == 'otro' else actividad.tema
        
        # OBtener comentarios
        comentarios = session.query(Comentario).filter(Comentario.actividad_id == actividad_id).all()

        actividad_formateada = { 
            'id': actividad.id,
            'inicio': actividad.dia_hora_inicio.strftime('%Y-%m-%d %H:%M') if actividad.dia_hora_inicio else '',
            'termino': actividad.dia_hora_termino.strftime('%Y-%m-%d %H:%M') if actividad.dia_hora_termino else '',
            'region': actividad.region if actividad.region else '',
            'comuna': actividad.comuna if actividad.comuna else '',
            'sector': actividad.sector if actividad.sector else '',
            'tema': tema_display if tema_display else '', 
            'nombre_organizador': actividad.nombre_organizador if actividad.nombre_organizador else '', 
            'email': actividad.email if actividad.email else '',
            'celular': actividad.celular if actividad.celular else '',
            'descripcion': actividad.descripcion if actividad.descripcion else '',
            'fotos': [{'id': foto.id, 'ruta': foto.ruta_archivo, 'nombre': foto.nombre_archivo} for foto in fotos],
            'contactos': [{'id': contacto.id, 'tipo': contacto.nombre, 'identificador': contacto.identificador} for contacto in contactos],
            'comentarios': [{'id': comentario.id, 'nombre': comentario.nombre, 'texto': comentario.texto, 
                             'fecha': comentario.fecha.strftime('%Y-%m-%d %H:%M')} for comentario in comentarios]
        }
        
        # Determinar tipo de respuesta (JSON para AJAX o HTML para navegación directa)
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or 'json' in request.accept_mimetypes.values():
            return jsonify(actividad_formateada)
        else:
            return render_template('detalle-actividad.html', actividad=actividad_formateada)
            
    except Exception as e:
        app.logger.error(f"Error en detalle_actividad: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500
    finally:
        session.close()

@app.route('/estadisticas')
def estadisticas():
    return render_template('estadisticas.html')

# Rutas para servir archivos estáticos (JS, CSS, imágenes)
@app.route('/js/<path:path>')
def serve_js(path):
    return app.send_static_file(f'js/{path}')

@app.route('/img/<path:path>')
def serve_img(path):
    return app.send_static_file(f'img/{path}')

@app.route('/css/<path:path>')
def serve_css(path):
    return app.send_static_file(f'css/{path}')

#Rutas para obtener datos para graficos
@app.route('/api/estadisticas/actividades-por-dia')
def api_actividades_por_dia():
    """API endpoint para obtener actividades por día"""
    session = Session()
    try:
        resultado = session.query(
            func.date(Actividad.dia_hora_inicio).label('fecha'),
            func.count(Actividad.id).label('cantidad')
        ).group_by(func.date(Actividad.dia_hora_inicio))\
         .order_by(func.date(Actividad.dia_hora_inicio))\
         .all()
        
        datos = [{'fecha': fecha.strftime('%Y-%m-%d'), 'cantidad': cantidad} 
                for fecha, cantidad in resultado]
        
        return jsonify(datos)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@app.route('/api/estadisticas/actividades-por-tipo')
def api_actividades_por_tipo():
    """API endpoint para obtener actividades agrupadas por tipo"""
    session = Session()
    try:
        resultado = session.query(
            ActividadTema.tema,
            ActividadTema.glosa_otro,
            func.count(ActividadTema.id).label('cantidad')
        ).group_by(ActividadTema.tema, ActividadTema.glosa_otro)\
         .order_by(func.count(ActividadTema.id).desc())\
         .all()
        
        datos = []
        for tema, glosa_otro, cantidad in resultado:
            nombre_tema = glosa_otro if tema == 'otro' and glosa_otro else tema
            datos.append({'tema': nombre_tema, 'cantidad': cantidad})
        
        return jsonify(datos)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@app.route('/api/estadisticas/actividades-por-mes')
def api_actividades_por_mes_horario():
    """API endpoint para obtener actividades por mes y horario de inicio"""
    session = Session()
    try:
        actividades = session.query(
            func.year(Actividad.dia_hora_inicio).label('año'),
            func.month(Actividad.dia_hora_inicio).label('mes'),
            func.hour(Actividad.dia_hora_inicio).label('hora')
        ).all()

        datos_agrupados = {}
        for año, mes, hora in actividades:
            mes_año = f"{año}-{mes:02d}"
            if mes_año not in datos_agrupados:
                datos_agrupados[mes_año] = {'mañana': 0, 'mediodia': 0, 'tarde': 0}

            if 4 <= hora <= 11:
                datos_agrupados[mes_año]['mañana'] += 1
            elif 12 <= hora <= 17:
                datos_agrupados[mes_año]['mediodia'] += 1
            elif 18 <= hora <= 23 or 0 <= hora <= 3:
                datos_agrupados[mes_año]['tarde'] += 1

        datos = []
        for mes_año in sorted(datos_agrupados.keys()):
            datos.append({
                'mes': mes_año,
                'mañana': datos_agrupados[mes_año]['mañana'],
                'mediodia': datos_agrupados[mes_año]['mediodia'],
                'tarde': datos_agrupados[mes_año]['tarde']
            })
        
        return jsonify(datos)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@app.route('/actividad/<int:actividad_id>/comentario', methods=['POST'])
def agregar_comentario(actividad_id):
    """Procesa el formulario para agregar un nuevo comentario"""
    session = Session()
    try:
        actividad_existe = session.query(Actividad).filter(Actividad.id == actividad_id).first()
        if not actividad_existe:
            return jsonify({"error": "Actividad no encontrada"}), 404
        
        errores = validar_comentario(request.form)
        
        if errores:
            primer_error = list(errores.values())[0]
            return jsonify({"error": primer_error}), 400

        nombre = request.form.get('nombre').strip()
        texto = request.form.get('texto').strip()
        
        nuevo_comentario = Comentario(
            nombre=nombre,
            texto=texto,
            fecha=datetime.now(),
            actividad_id=actividad_id
        )
        
        session.add(nuevo_comentario)
        session.commit()
        
        return jsonify({"success": "Comentario agregado exitosamente"})
        
    except Exception as e:
        session.rollback()
        return jsonify({"error": "Error al agregar el comentario"}), 500
    finally:
        session.close()

if __name__ == '__main__':
    app.run(debug=True)