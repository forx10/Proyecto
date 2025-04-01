import json
import requests
from datetime import datetime
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import (
    login, authenticate, logout, get_user_model
)
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.http import HttpResponse, JsonResponse, HttpResponseForbidden
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.middleware.csrf import get_token
from .emails import notificar_actividad  # Importa la función que creamos antes
from django.template.loader import render_to_string
from .models import (
    Usuario, Plantacion, Siembra, 
    Actividad
)
from .forms import (
    RegistroForm, LoginForm, SetPasswordForm, UsuarioForm, 
    PlantacionForm,  EditarPerfilForm, EditarPlantacionForm
)
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from django.contrib.auth.decorators import login_required
from django.utils import timezone
import logging
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.utils import simpleSplit
from reportlab.platypus import Table, TableStyle
from django.contrib.auth.decorators import login_required
from django.utils.timezone import now, timedelta
import locale



logger = logging.getLogger(__name__)

@ensure_csrf_cookie
def obtener_csrf_token(request):
    csrf_token = get_token(request)  # Obtener el token CSRF
    return JsonResponse({"csrfToken": csrf_token})  # Enviar el token en la respuesta JSON


@csrf_exempt
def registro(request):
    if request.method == 'POST':
        try:
            # Convertir el cuerpo de la solicitud a un diccionario
            data = json.loads(request.body)
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "El formato del JSON es inválido."}, status=400)

        # Pasamos los datos al formulario
        form = RegistroForm(data)

        if form.is_valid():
            # Guardar el usuario sin confirmar el commit para poder ajustar la contraseña
            user = form.save(commit=False)
            user.set_password(data.get('password1'))  # Usar la contraseña proporcionada
            user.is_staff = True  # Opcional: hacer que todos sean staff
            user.save()

            # Realizar el login automáticamente después de guardar el usuario
            login(request, user)
            print("Errores del formulario:", form.errors)  
            # Respuesta de éxito
            return JsonResponse({"message": "Registro exitoso."}, status=200)
        else:
            print("Errores del formulario:", form.errors)  
            # Si el formulario no es válido, devolver los errores en formato JSON
            return JsonResponse({"errors": form.errors}, status=400)

    # Si no es un POST, devolver un error indicando que el método no es permitido
    return JsonResponse({"message": "Método no permitido."}, status=405)



@csrf_exempt 
def iniciar_sesion(request):
    if request.method == "POST":
        data = json.loads(request.body)
        form = LoginForm(data)
        
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            
            user = authenticate(request, email=email, password=password)
            
            if user is not None:
                # Iniciar sesión
                login(request, user)
                
                # Respuesta JSON con estado y is_staff
                return JsonResponse({
                    'status': 200,
                    'success': True,
                    'is_staff': user.is_staff,  
                    'message': 'Inicio de sesión exitoso'
                })
            else:
                return JsonResponse({'status': 400, 'success': False, 'message': 'Datos incorrectos'})
        else:
            return JsonResponse({'status': 400, 'success': False, 'message': 'Formulario inválido. Verifica los datos ingresados.'})
    else:
        return JsonResponse({'status': 405, 'success': False, 'message': 'Método no permitido, se esperaba POST.'})



@csrf_exempt
def perfil(request):
   
    usuario = request.user  

    es_administrador = usuario.is_superuser or usuario.is_staff  

    if request.method == 'PUT':

        # Permitir edición solo a administradores
        data = json.loads(request.body)  # Parseamos el cuerpo de la solicit
        # Si el usuario es administrador, permitir edición
        form = EditarPerfilForm(data, instance=usuario)
        if form.is_valid():
            form.save()
            return JsonResponse({
                'status': 200,
                'success': True,
                'message': 'Perfil actualizado correctamente.',
                'redirect_url': 'perfil'
            })
        else:
            errors = form.errors.as_json()
            return JsonResponse({
                'status': 400,
                'success': False,
                'message': 'Error al actualizar el perfil. Verifica los datos ingresados.',
                'errors': errors
            }, status=400)

    else:
        # Si es una solicitud GET, devolver solo la información permitida
        datos_usuario = {
            'first_name': usuario.first_name,
            'last_name': usuario.last_name,
            'email': usuario.email   
        }
       
        return JsonResponse({
            'status': 200,
            'success': True,
            'usuario': datos_usuario,
            'es_administrador': es_administrador,
        })


@csrf_exempt
def logout_view(request):
    logout(request)  # Esto elimina la sesión en el servidor
    return JsonResponse({
        "status": 200,
        "message": "Logout exitoso"
    })
    
    #hay que hacer las vista de el aditarr actividad y borra

@csrf_exempt
def password_reset_api(request):
    if request.method == "POST":
        User = get_user_model()  # Obtiene el modelo de usuario actual
        try:
            data = json.loads(request.body)
            email = data.get("email")

            if not email:
                return JsonResponse({"error": "El correo es obligatorio."}, status=400)

            try:
                user = User.objects.get(email=email)
                
                # Generar token y UID
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))

                # Crear enlace de restablecimiento
                reset_url = f'http://localhost:5173/password/?uid64={uid}&token={token}'

                # Renderizar el template del correo
                subject = "Restablecimiento de contraseña"
                context = {"user": user.first_name, "reset_link": reset_url}
                html_message = render_to_string("email/password.html", context)

                # Enviar el correo con el template                                                                                                                                                                                            
                send_mail(                                                                                                                                          
                    subject,
                    message="Para ver este correo, usa un cliente compatible con HTML.",
                    from_email="canomoreno78@gmail.com",
                    recipient_list=[email],
                    fail_silently=False,
                    html_message=html_message
                )

                return JsonResponse({"message": "Se ha enviado un enlace de recuperación a tu correo."}, status=200)
            except User.DoesNotExist:
                return JsonResponse({"error": "No encontramos una cuenta con ese correo."}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Datos inválidos."}, status=400)

    return JsonResponse({"error": "Método no permitido."}, status=405)


@csrf_exempt
def reset_password(request, uidb64, token):
    if request.method != 'POST':
        return JsonResponse({
            'status': 405,
            'success': False,
            'message': 'Método no permitido. Solo se permite POST.'
        }, status=405)

    try:
        data = json.loads(request.body)
        uid = urlsafe_base64_decode(uidb64).decode()
        user = get_user_model().objects.get(pk=uid)

        if not default_token_generator.check_token(user, token):
            return JsonResponse({
                'status': 400,
                'success': False,
                'message': 'El enlace de restablecimiento de contraseña no es válido o ha expirado.'
            }, status=400)

        form = SetPasswordForm(user, data)
        if form.is_valid():
            form.save()
            return JsonResponse({
                'status': 200,
                'success': True,
                'message': 'Tu contraseña ha sido restablecida correctamente.',
            })

        return JsonResponse({
            'status': 400,
            'success': False,
            'message': 'Formulario inválido.',
            'errors': form.errors.as_json()
        }, status=400)

    except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
        return JsonResponse({
            'status': 400,
            'success': False,
            'message': 'El enlace de restablecimiento de contraseña no es válido o ha expirado.'
        }, status=400)
    except json.JSONDecodeError:
        return JsonResponse({
            'status': 400,
            'success': False,
            'message': 'Error en la solicitud. Asegúrate de enviar datos en formato JSON válido.'
        }, status=400)




@login_required
def gestion_usuarios(request):
    # Verificar autenticación y permisos
    if not request.user.is_authenticated or (not request.user.is_superuser and not request.user.is_staff):
        return JsonResponse({"error": "No tienes permiso para acceder a esta página."}, status=403)

    if request.method == 'GET':
        # Obtener los usuarios creados por el usuario actual
        usuarios = Usuario.objects.filter(admin_creator=request.user).values("id", "first_name", "email", "last_name")

        logger.debug(f"Usuarios creados por {request.user.email}: {list(usuarios)}")

        return JsonResponse({"usuarios": list(usuarios)}, status=200)

    # Métodos no permitidos
    return JsonResponse({"error": "Método no permitido"}, status=405)



@csrf_exempt 
@login_required
def editar_usuario(request, user_id):
    if not request.user.is_staff:
        return JsonResponse({
            'status': 403,
            'success': False,
            'message': 'No tienes permiso para acceder a esta página.'
        }, status=403)

    usuario = get_object_or_404(Usuario, id=user_id)

    if request.method == 'PUT':
        try:
            # Cargar los datos del cuerpo de la solicitud (JSON)
            data = json.loads(request.body)

            # Pasar los datos al formulario
            form = UsuarioForm(data, instance=usuario)

            if form.is_valid():
                form.save()
                return JsonResponse({
                    'status': 200,
                    'success': True,
                    'message': 'Usuario actualizado exitosamente.'
                })
            else:
                errors = form.errors.as_json()
                return JsonResponse({
                'status': 400,
                'success': False,
                'message': 'Formulario inválido.',
                'errors': errors
            }, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 400,
                'success': False,
                'message': 'El cuerpo de la solicitud no es JSON válido.'
            }, status=400)
            
    return JsonResponse({
        'status': 405,
        'success': False,
        'message': 'Método no permitido'
    }, status=405)
    


@csrf_exempt  
def agregar_usuario(request):

    if not request.user.is_superuser and not request.user.is_staff:
        return JsonResponse({"error": "No tienes permiso para acceder a esta página."}, status=403)

    if request.method == 'POST':
        if request.content_type != "application/json":
            return JsonResponse({"error": "Se esperaba JSON en la solicitud"}, status=400)

        try:
            data = json.loads(request.body)  
            form = RegistroForm(data)  
        except json.JSONDecodeError:
            return JsonResponse({"error": "Formato JSON inválido"}, status=400)

        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password1'])
            user.admin_creator = request.user
            user.is_staff = False
            user.save()
            return JsonResponse({"message": "Usuario creado exitosamente", "user_id": user.id}, status=201)
        else:
            return JsonResponse({"error": "Datos inválidos", "details": form.errors}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)



@login_required
@csrf_exempt
def eliminar_usuario(request, user_id):
    if not request.user.is_staff:
        return JsonResponse({
            'status': 403,
            'success': False,
            'message': 'No tienes permiso para acceder a esta página.'
        }, status=403)

    usuario = get_object_or_404(Usuario, id=user_id)

    if request.method == 'DELETE':
        try:
            usuario.actividades.clear()
            usuario.plantacion = None
            #FechasSiembra.objects.filter(usuario=usuario).delete()
            usuario.delete()
            return JsonResponse({
                'status': 200,
                'success': True,
                'message': f"El usuario {usuario.first_name} {usuario.last_name} ha sido eliminado exitosamente.",
                'redirect_url': 'gestion_usuarios'
            })
        except Exception as e:
            return JsonResponse({
                'status': 500,
                'success': False,
                'message': f"Ocurrió un error al eliminar el usuario: {str(e)}"
            }, status=500)
    else:
        return JsonResponse({
        "status": 405,
        "success": False,
        "message": "Método no permitido."
    }, status=405)


def plantacion(request):
    if request.method == 'GET':
        try:
            # Filtrar las plantaciones del usuario actual
            plantaciones = Plantacion.objects.filter(usuario=request.user)
            
           

            # Crear la respuesta JSON con los datos
            plantaciones_data = list(plantaciones.values('id', 'nombre', 'descripcion', 'fecha_siembra'))
            
            # Si no tienes datos, no hagas nada
            if not plantaciones_data:
                return JsonResponse({'message': 'No hay plantaciones registradas.'}, status=404)

            response_data = {
                'plantaciones': plantaciones_data,
            }

            return JsonResponse(response_data, status=200)
        
        except Exception as e:
            # En caso de error, devolver un mensaje de error
            error_data = {
                'status': 'error',
                'message': str(e),
            }
            return JsonResponse(error_data, status=500)
        


def obtener_fechas_recomendadas(request):
    # Configuración de la API del clima
    API_KEY = 'b38f3f8558d7bee2759f548984ae5505'  # Reemplaza con tu clave API
    ubicacion = 'Pereira,CO'
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={ubicacion}&appid={API_KEY}&units=metric"

    # Obtener datos del clima
    response = requests.get(url)
    if response.status_code != 200:
        return JsonResponse({'status': 500, 'message': 'No se pudo obtener el clima. Inténtalo de nuevo más tarde.'}, status=500)

    clima_data = response.json()
    fechas_recomendadas = []

    # Filtrar fechas con clima templado
    for pronostico in clima_data['list']:
        fecha = pronostico['dt_txt']  # Fecha en formato 'año-mes-dia h:min:seg'
        temperatura = pronostico['main']['temp']
        if 15 <= temperatura <= 25:  # Rango de clima templado
            fecha_formateada = datetime.strptime(fecha, '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d')
            if fecha_formateada not in fechas_recomendadas:  # Evitar duplicados
                fechas_recomendadas.append(fecha_formateada)

    return JsonResponse({
        'status': 200,
        'success': True,
        'fechas_recomendadas': fechas_recomendadas
    })



@csrf_exempt
def editar_plantacion(request, id):
    plantacion = get_object_or_404(Plantacion, id=id)
    if request.method == 'PUT':
        data = json.loads(request.body)
        form = EditarPlantacionForm(data, instance=plantacion)
        if form.is_valid():
            form.save()
            return JsonResponse({
                'status': 200,
                'success': True,
                'message': 'Plantación actualizada correctamente.',
                'redirect_url': 'plantaciones'
            })
        else:
            errors = form.errors.as_json()
            return JsonResponse({
                'status': 400,
                'success': False,
                'message': 'Formulario inválido.',
                'errors': errors
            }, status=400)
    else:
        form = EditarPlantacionForm(instance=plantacion)
      


@csrf_exempt
def registrar_plantacion(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = PlantacionForm(data)
        if form.is_valid():
            plantacion = form.save(commit=False)
            plantacion.usuario = request.user

            plantacion.save()
            return JsonResponse({
                'status': 200,
                'success': True,
                'message': 'Plantación registrada correctamente.',
                'redirect_url': '/plantaciones'
            })
        else:
            errors = form.errors.as_json()
            return JsonResponse({
                'status': 400,
                'success': False,
                'message': 'Formulario inválido.',
                'errors': errors
            }, status=400)



@csrf_exempt
def eliminar_plantacion(request, id):
    plantacion = get_object_or_404(Plantacion, id=id)
    if request.method == 'DELETE':
        try:
            plantacion.delete()
            return JsonResponse({
                'status': 200,
                'success': True,
                'message': 'Plantación eliminada correctamente.',
                'redirect_url': 'plantaciones'
            })
        except Exception as e:
            return JsonResponse({
                'status': 500,
                'success': False,
                'message': f"Ocurrió un error al eliminar la plantación: {str(e)}"
            }, status=500)
    else:
        return JsonResponse({
            'status': 405,
            'success': False,
            'message': 'Método no permitido.'
        }, status=405)



@csrf_exempt
def asignar_actividad(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Método no permitido."}, status=405)
    
    if not request.body:
        return JsonResponse({"status": "error", "message": "No se recibió ninguna información."}, status=400)
    print("Raw request body:", request.body)
    try:
        data = json.loads(request.body)
        print("Parsed data:", data)
    except json.JSONDecodeError:
        print("Error: JSON inválido")

        return JsonResponse({"status": "error", "message": "El formato del JSON es inválido."}, status=400)
    
    usuario_id = data.get("usuario_id")
    actividad = data.get("actividad")
    descripcion = data.get("descripcion")
    tiempo_estimado = data.get("tiempo_estimado")
    fecha_vencimiento = data.get("fecha_vencimiento")
    fecha = data.get("fecha")
    plantacion_id = data.get("plantacion_id")
    nuevo_estado = "pendiente"
    
    if not all([usuario_id, actividad, tiempo_estimado, fecha_vencimiento, fecha, plantacion_id]):
        return JsonResponse({"status": "error", "message": "Todos los campos son obligatorios."}, status=400)
    
    if ":" not in tiempo_estimado or tiempo_estimado.count(":") < 2:
        tiempo_estimado += ":00"
    
    try:
        tiempo_estimado = datetime.strptime(tiempo_estimado, '%H:%M:%S').time()
    except ValueError:
        return JsonResponse({"status": "error", "message": "El tiempo estimado debe tener el formato HH:MM:SS."}, status=400)
    
    try:
        fecha_vencimiento = datetime.strptime(fecha_vencimiento, '%Y-%m-%d').date()
        fecha = datetime.strptime(fecha, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({"status": "error", "message": "Formato de fecha incorrecto. Usa el formato yyyy-mm-dd."}, status=400)
    
    usuario = Usuario.objects.filter(id=usuario_id).first()
    if not usuario:
        return JsonResponse({"status": "error", "message": "El usuario no existe."}, status=400)
    
    plantacion = Plantacion.objects.filter(id=plantacion_id).first()
    if not plantacion:
        return JsonResponse({"status": "error", "message": "La plantación especificada no existe."}, status=400)
    
    nueva_actividad = Actividad.objects.create(
        nombre_actividad=actividad,
        tiempo_estimado=tiempo_estimado,
        fecha_vencimiento=fecha_vencimiento,
        fecha=fecha,
        descripcion=descripcion,
        usuario_id=usuario.id,
        estado=nuevo_estado,
        plantacion=plantacion
    )
    
    try:
        notificar_actividad(usuario, nueva_actividad)
    except Exception as e:
        return JsonResponse({"status": "error", "message": f"Error al enviar notificación: {str(e)}"}, status=500)
    
    return JsonResponse({
        "status": "success",
        "message": "Actividad creada correctamente",
        "actividad": {
            "id": nueva_actividad.id,
            "usuario": usuario.first_name,
            "nombre_actividad": nueva_actividad.nombre_actividad,
            "descripcion": nueva_actividad.descripcion,
            "tiempo_estimado": str(nueva_actividad.tiempo_estimado),
            "fecha_vencimiento": str(nueva_actividad.fecha_vencimiento),
            "fecha": str(nueva_actividad.fecha),
            "estado": "pendiente",
            "plantacion": plantacion.nombre
        }
    }, status=201)

    
@csrf_exempt
@login_required
def actividades_admin(request):
    if request.method == "GET":
        usuarios = Usuario.objects.filter(admin_creator=request.user).values("id", "first_name")

        actividades_resultado = []

        for user in usuarios:
            actividades = Actividad.objects.filter(usuario_id=user["id"]).select_related("plantacion")

            for actividad in actividades:
                nuevo_estado = cambiar_estado(actividad.id, actividad.estado)

                actividad_data = {
                    "id": actividad.id,
                    "first_name": user["first_name"],  
                    "nombre_actividad": actividad.nombre_actividad,
                    "descripcion": actividad.descripcion,
                    "tiempo_estimado": str(actividad.tiempo_estimado),
                    "fecha_vencimiento": actividad.fecha_vencimiento.strftime("%Y-%m-%d %H:%M:%S"),
                    "fecha": actividad.fecha.strftime("%Y-%m-%d"),
                    "estado": nuevo_estado,
                    "nombre_plantacion": actividad.plantacion.nombre if actividad.plantacion else "Sin asignar"
                }

                actividades_resultado.append(actividad_data)

        return JsonResponse({"actividades": actividades_resultado}, safe=False)
    


@csrf_exempt
def editar_actividad(request, id):
    actividad = get_object_or_404(Actividad, id=id)

    if request.method == 'PUT':
        try:
            # Cargar los datos correctamente si se envían en formato JSON
            data = json.loads(request.body.decode('utf-8'))

            # Obtener datos con valores por defecto si no están en la petición
            fecha_vencimiento = data.get('fecha_vencimiento')
            fecha = data.get('fecha')
            estado = data.get('estado')

            # Ajustar el estado si es necesario
            if estado in ["incompleta", "pendiente"]:
                estado = "pendiente"

            # Actualizar la actividad
            actividad.fecha_vencimiento = fecha_vencimiento
            actividad.fecha = fecha
            actividad.estado = estado
            actividad.save()

            return JsonResponse({"status": "success", "message": "Actividad actualizada correctamente."}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Error al decodificar JSON."}, status=400)

    return JsonResponse({"status": "error", "message": "Método no permitido."}, status=405)



@csrf_exempt
def eliminar_actividad(request, id):
    if request.method == 'DELETE':
        actividad = get_object_or_404(Actividad, id=id)
        actividad.delete()
        return JsonResponse({"status": "success", "message": "Actividad eliminada correctamente."},status=200)

    return JsonResponse({"status": "error", "message": "Método no permitido."}, status=405)


@csrf_exempt
def actividades_de_usuario(request):
    usuario_id = request.user.id

    # Verificar que el método sea GET
    if request.method != 'GET':
        return JsonResponse({"status": "error", "message": "Método no permitido."}, status=405)
    
    # Obtener el usuario
    usuario = Usuario.objects.filter(id=usuario_id).first()
    if not usuario:
        return JsonResponse({"status": "error", "message": "El usuario no existe."}, status=400)
    
    # Filtrar las actividades del usuario
    actividades = Actividad.objects.filter(usuario_id=usuario_id).select_related("plantacion")
    if not actividades.exists():
        return JsonResponse({"status": "success", "message": "No hay actividades asignadas."}, status=200)
    
    # Crear una lista de actividades con el estado actualizado
    actividades_data = []
    for actividad in actividades:
        # Aquí se llamará a la función cambiar_estado para obtener el estado actualizado
        nuevo_estado = cambiar_estado( actividad.id, actividad.estado)  # Llamada correcta a la función
        
        actividad_data = {
            "id": actividad.id,
            "nombre_actividad": actividad.nombre_actividad,
            "descripcion": actividad.descripcion,
            "tiempo_estimado": str(actividad.tiempo_estimado),
            "fecha_vencimiento": actividad.fecha_vencimiento.strftime("%Y-%m-%d %H:%M:%S"),  # Formato de fecha
            "fecha": actividad.fecha.strftime("%Y-%m-%d %H:%M:%S"),  # Formato de fecha
            "estado": nuevo_estado,
            "nombre_plantacion": actividad.plantacion.nombre if actividad.plantacion else "Sin asignar"
        }
        
        actividades_data.append(actividad_data)

    # Devolver la respuesta JSON con las actividades
    return JsonResponse({"status": "success", "actividades": actividades_data}, status=200, safe=False)


@csrf_exempt
def marcar_completo(request):
    # Cargar los datos enviados como JSON
    data = json.loads(request.body)
    actividad_id = data.get('id')

    # Asegurarse de que se pase un id válido
    if not actividad_id:
        return JsonResponse({"error": "ID de actividad no proporcionado"}, status=400)

    # Obtener la actividad correspondiente
    actividad = get_object_or_404(Actividad, id=actividad_id)

    # Verificar si la fecha de la actividad ya pasó o es hoy
    if actividad.fecha <= now().date():
        # Cambiar el estado de la actividad a 'completada'
        if actividad.estado != 'completada':  # Verificamos si ya está completada
            actividad.estado = 'completada'
            actividad.save()
            return JsonResponse({"mensaje": "Actividad marcada como completada correctamente."}, status=200)

        return JsonResponse({"mensaje": "La actividad ya está marcada como completada."}, status=200)

    return JsonResponse({"error": "No se puede completar la actividad antes de la fecha programada."}, status=400)
    
    
@login_required
def informes(request):
    if request.method != "GET":
        return JsonResponse({"status": "error", "message": "Método no permitido."}, status=405)

    actividad_id = request.GET.get("id")

    empleados_ids = Usuario.objects.filter(admin_creator=request.user).values_list("id", flat=True)

    actividades = Actividad.objects.filter(usuario_id__in=empleados_ids, estado="completada").select_related("plantacion")


    if actividad_id:
        actividades = actividades.filter(id=actividad_id)

    actividades = actividades.values(
        "id", "nombre_actividad", "descripcion", "usuario_id", "usuario__first_name", "fecha", "fecha_vencimiento", "estado", "plantacion__nombre"
    )
    print("Empleados encontrados:", list(empleados_ids))
    return JsonResponse ({"status": "success", "actividades": list(actividades)}, status=200)





@login_required
def descargar_informes_pdf(request):
    # 🌍 Establecer idioma en español
    try:
        locale.setlocale(locale.LC_TIME, "es_ES.utf8")  # Linux/Mac
    except:
        locale.setlocale(locale.LC_TIME, "Spanish_Spain.1252")  # Windows

    fecha_actual = now()
    mes_actual = fecha_actual.strftime("%B").capitalize()
    año_actual = fecha_actual.year

    # 📌 Filtrar actividades completadas del mes actual
    empleados_ids = Usuario.objects.filter(admin_creator=request.user).values_list("id", flat=True)
    actividades = Actividad.objects.filter(
        usuario_id__in=empleados_ids,
        estado="completada",
        fecha__year=año_actual,
        fecha__month=fecha_actual.month
    ).select_related("plantacion").values(
        "id", "nombre_actividad", "descripcion", 
        "usuario__first_name", "fecha", "estado", 
        "plantacion__nombre"
    )

    if not actividades:
        return JsonResponse({"error": "No hay informes de este mes."}, status=400)

    # 📄 Generar PDF
    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="informes_trabajadores.pdf"'

    p = canvas.Canvas(response, pagesize=letter)
    width, height = letter

    # 🎨 Fondo minimalista
    p.setFillColor(colors.HexColor("#FAF3E0"))  # Color crema suave
    p.rect(0, 0, width, height, fill=True, stroke=False)

    # 🏆 Encabezado estilizado
    titulo = f"📊 Informe de Actividades - {mes_actual} {año_actual}"
    p.setFont("Helvetica-Bold", 18)
    p.setFillColor(colors.HexColor("#6D4C41"))  # Marrón oscuro
    p.drawCentredString(width / 2, height - 70, titulo)

    # Línea decorativa
    p.setStrokeColor(colors.HexColor("#D7A86E"))
    p.setLineWidth(2)
    p.line(50, height - 75, width - 50, height - 75)

    # 📋 Tabla de datos
    data = [["👤 Trabajador", "📌 Actividad", "📅 Fecha", "✅ Estado", "🌱 Plantación"]]
    for actividad in actividades:
        data.append([
            actividad["usuario__first_name"],
            actividad["nombre_actividad"],
            actividad["fecha"].strftime("%d-%m-%Y"),
            actividad["estado"],
            actividad["plantacion__nombre"]
        ])

    table = Table(data, colWidths=[120, 140, 80, 80, 110])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FFD6B3")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#6D4C41")),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 12),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#D7A86E")),
    ]))

    table.wrapOn(p, width, height)
    
    # Ajustar la posición de la tabla para agregar espacio entre el título y la tabla
    espacio_adicional = 40  # Ajusta este valor para obtener el espacio que necesitas
    table.drawOn(p, 40, height - 160 - espacio_adicional)

    p.save()
    return response





@login_required
@csrf_exempt
def eliminar_informe(request, id):  # Recibe el ID desde la URL
    if request.method != "DELETE":
        return JsonResponse({"status": "error", "message": "Método no permitido."}, status=405)

    actividad = get_object_or_404(Actividad, id=id, estado="completada")

    actividad.delete()

    return JsonResponse({"status": "success", "message": "Informe eliminado correctamente."}, status=200)




def obtener_clima(ubicacion):
    api_key = 'b38f3f8558d7bee2759f548984ae5505'  # Reemplaza con tu clave API
    url = f'https://api.openweathermap.org/data/2.5/weather?q={ubicacion}&appid={api_key}&units=metric'


    try:
        response = requests.get(url)
        response.raise_for_status()  # Lanza una excepción si hay un error en la respuesta
        data = response.json()  # Convierte la respuesta a JSON

        # Verificar que los datos esperados están en la respuesta
        if "main" in data and "weather" in data:
            # Extraer la información necesaria
            temperatura = data['main']['temp']
            descripcion_ingles = data['weather'][0]['description']
            # Traducir la descripción al español
            descripcion = TRADUCCION_CLIMA.get(descripcion_ingles, descripcion_ingles) 
            humedad = data['main']['humidity']
            presion = data['main']['pressure']
            velocidad_viento = data['wind']['speed']
            return {
                'temperatura': temperatura,
                'descripcion': descripcion,
                'humedad': humedad,
                'presion': presion,
                'velocidad_viento': velocidad_viento
            }
        else:
            print("La respuesta no contiene los datos esperados:", data)
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error al obtener datos del clima: {e}")
        return None
    
    


TRADUCCION_CLIMA = {
        "Clear": "Despejado",
        "Clouds": "Nublado",
        "Rain": "Lluvia",
        "Drizzle": "Llovizna",
        "Thunderstorm": "Tormenta",
        "Snow": "Nieve",
        "Mist": "Neblina",
        "Smoke": "Humo",
        "Haze": "Bruma",
        "Dust": "Polvo",
        "Fog": "Niebla",
        "Sand": "Arena",
        "Ash": "Ceniza",
        "Squall": "Chubasco",
        "Tornado": "Tornado",
        "light rain": "llovizna",
        "moderate rain": "lluvia moderada",
        "heavy intensity rain": "lluvia intensa",
        "very heavy rain": "lluvia muy intensa",
        "extreme rain": "lluvia extrema",
        "freezing rain": "lluvia helada",
        "thunderstorm": "tormenta",
        "snow": "nieve",
        "mist": "neblina",
        "drizzle": "llovizna",
        "overcast clouds": "nubes cubiertas",
        "scattered clouds": "nubes dispersas",
        "broken clouds": "nubes rotas",
        "few clouds": "pocas nubes"
}



@csrf_exempt
def cambiar_estado(actividad_id, nuevo_estado):
    
    # Obtenemos la actividad correspondiente
    actividad = Actividad.objects.filter(id=actividad_id).first()

    # Verificamos si la fecha de vencimiento ya pasó y el estado no es 'Completada'
    if actividad.fecha_vencimiento < timezone.now().date() and nuevo_estado != 'completada':
        nuevo_estado = 'incompleta'  # Si la fecha de vencimiento pasó, el estado será 'Incompleta' (equivalente a 'En Progreso')
   

    # Actualizamos el estado de la actividad
    actividad.estado = nuevo_estado
    actividad.save()  # Guardamos los cambios en la actividad

    # Creamos un nuevo registro de estado para la actividad (si deseas guardar el historial de estados)
    # EstadoActividad.objects.create(actividad=actividad, estado=nuevo_estado)

    # Redirigimos a la lista de actividades
    return nuevo_estado
    
@csrf_exempt
def vista_clima(request):
    if request.method == "GET":
        ubicacion = "Pereira,CO"
        resultado = obtener_clima(ubicacion)

        if resultado is None:
            return JsonResponse({"error": "No se pudo obtener el clima"}, status=500)

        return JsonResponse({"clima": resultado}, status=200)


# Apartados de la IA 


@login_required
def count_plantaciones(request):
    if request.method == 'GET':
        try:
          
            conteo = Plantacion.objects.filter(usuario=request.user).count()
            
            return JsonResponse({
                'status': 200,
                'success': True,
                'conteo': conteo
            }, status=200)
            
        except Exception as e:
            logger.error(f"Error en count_plantaciones: {str(e)}")
            return JsonResponse({
                'status': 500,
                'success': False,
                'message': 'Error al contar las plantaciones',
                'error': str(e)
            }, status=500)
            
    return JsonResponse({
        'status': 405,
        'success': False,
        'message': 'Método no permitido'
    }, status=405)
 
 
logger = logging.getLogger(__name__)

@csrf_exempt  # Solo si necesitas permitir peticiones sin CSRF
@login_required
def count_empleados(request):
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
    
    if request.method == 'GET':
        try:
            conteo = Usuario.objects.filter(admin_creator=request.user).count()
            return JsonResponse({"conteo": conteo}, status=200)
        except Exception as e:
            logger.error(f"Error contando empleados: {str(e)}")
            return JsonResponse({"error": "Error del servidor"}, status=500)
    
    return JsonResponse({"error": "Método no permitido"}, status=405)



@login_required
@csrf_exempt
def contar_informes(request):
    if request.method != "GET":
        return JsonResponse({"status": "error", "message": "Método no permitido."}, status=405)

    try:
        # Obtener IDs de empleados creados por el usuario actual
        empleados_ids = list(Usuario.objects.filter(admin_creator=request.user).values_list("id", flat=True))

        # Si no hay empleados, devolver conteo 0 en lugar de error
        if not empleados_ids:
            return JsonResponse({ "conteo": 0}, status=200)

        # Contar informes (actividades completadas) de los empleados
        conteo = Actividad.objects.filter(usuario_id__in=empleados_ids, estado="completada").count()

        return JsonResponse({ "conteo": conteo}, status=200)

    except Exception as e:
        logger.error(f"Error en contar_informes: {str(e)}")
        return JsonResponse({"message": "Ocurrió un error inesperado."}, status=500)
    
    
    
@csrf_exempt
@login_required
def contar_actividades_empleado(request):
    if request.method != "GET":
        return JsonResponse({"status": "error", "message": "Método no permitido."}, status=405)

    nombre_empleado = request.GET.get("nombre", "").lower()

    if not nombre_empleado:
        return JsonResponse({"status": "error", "message": "Debes proporcionar el nombre de un empleado."}, status=400)

    try:
        # Buscar empleados creados por el usuario actual cuyo nombre coincida (insensible a mayúsculas)
        empleados = Usuario.objects.filter(
            admin_creator=request.user,
            first_name__icontains=nombre_empleado
        )

        if not empleados.exists():
            return JsonResponse({"status": "error", "message": f"No se encontró al empleado {nombre_empleado}."}, status=404)

        # Para el primer empleado que coincida (podrías ajustar esto para manejar múltiples coincidencias)
        empleado = empleados.first()
        actividades = Actividad.objects.filter(usuario=empleado)

        # Contar por estado
        conteo = {
            "total": actividades.count(),
            "pendientes": actividades.filter(estado="pendiente").count(),
            "completadas": actividades.filter(estado="completada").count(),
            "incompletas": actividades.filter(estado="incompleta").count(),
        }

        return JsonResponse({
            "status": "success",
            "empleado": empleado.first_name,
            "conteo": conteo
        }, status=200)

    except Exception as e:
        logger.error(f"Error en contar_actividades_empleado: {str(e)}")
        return JsonResponse({"status": "error", "message": "Ocurrió un error inesperado."}, status=500)
    
    
    
