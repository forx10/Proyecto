"""
URL configuration for sistema_usuarios project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from usuarios import views as usuarios_views
from django.contrib.auth import views as auth_views
from usuarios.views import ( obtener_csrf_token, password_reset_api, iniciar_sesion, agregar_usuario,
                            registro,perfil,logout_view,reset_password, obtener_fechas_recomendadas, 
                            registrar_plantacion, plantacion, editar_plantacion,asignar_actividad,
                            gestion_usuarios,actividades_de_usuario,marcar_completo,actividades_admin)

from usuarios.views import editar_actividad,eliminar_actividad, vista_clima,descargar_informes_pdf

urlpatterns = [
    # url del token
    path("obtener_token/", obtener_csrf_token, name="obtener_csrf_token"),
    
    # Ruta de panel de administración
    path('admin/', admin.site.urls),

    # Rutas de inicio de sesión y registro como de dashboard de la página (inicio)
    path('registro/', registro, name='registro'),
    path('login/', iniciar_sesion, name='login'),
    path('perfil/', perfil, name='perfil'),
    path('logout/', logout_view, name='logout'),

    # Gestión de usuarios (solo para administradores y superusuario)
    path('gestion_usuarios/', gestion_usuarios, name='gestion_usuarios'),
    path('api/agregar-usuario/', agregar_usuario, name='api_agregar_usuario'), 
    path('editar-usuario/<int:user_id>/', usuarios_views.editar_usuario, name='editar_usuario'),
    path('eliminar-usuario/<int:user_id>/', usuarios_views.eliminar_usuario, name='eliminar_usuario'),


    # Recuperación de contraseña
    path('password-reset/', password_reset_api, name='password_reset_api'),
    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='usuarios/password_reset_done.html'), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', reset_password, name='reset_password'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='usuarios/password_reset_complete.html'), name='password_reset_complete'),

    # Actividades de fragaria
    path('plantacion/', plantacion, name='plantacion'),  # Mostrar las plantaciones
    path('obtener_fechas_recomendadas/', obtener_fechas_recomendadas, name='obtener_fechas_recomendadas'),
    path("clima/", vista_clima, name="obtener_clima"),
    path('registrar_plantacion/', registrar_plantacion, name='registrar_plantacion'),
    path('actividades/<int:actividad_id>/estado/<str:nuevo_estado>/', usuarios_views.cambiar_estado, name='cambiar_estado'),
    path('editar-plantacion/<int:id>/', editar_plantacion, name='editar_plantacion'),
    path('eliminar-plantacion/<int:id>/', usuarios_views.eliminar_plantacion, name='eliminar_plantacion'),

    
    
    # Administrador envia actividades a Trabajadores
    path('asignar_actividad/', asignar_actividad, name='asignar_actividad'),
    path('actividades_de_trabajador/', actividades_de_usuario, name='actividades_empleado'),
    path('marca/', marcar_completo, name='marca'),
    path('actividadAdmin/', actividades_admin, name='actividadAdmin'), 
    path('editar/<int:id>/', editar_actividad, name='editar_actividad'),
    path('eliminar/<int:id>/', eliminar_actividad, name='eliminar_actividad'),

    # URL para informes (si es necesaria)
   
    path('informe/', usuarios_views.informes, name='informes'),
    path("descargar_informes_pdf/", descargar_informes_pdf, name="descargar_informes_pdf"),
    path('eliminar_informe/<int:id>/', usuarios_views.eliminar_informe, name='eliminar_informe'),
    
    
    #Apartado de IA
    
    path("contar_plantacion/", usuarios_views.count_plantaciones, name = 'contar_plantacion'),
    path("contar_empleados/", usuarios_views.count_empleados, name= 'contar_empleados'),
    path('contar_informes/', usuarios_views.contar_informes, name='contar_informes'),
    path('contar_actividades_empleado/', usuarios_views.contar_actividades_empleado, name='contar_actividades_empleado'),
]


