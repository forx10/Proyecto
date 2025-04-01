from django.contrib import admin
from .models import Usuario
from .models import Actividad

#Aqui en admin se se filtran los campos del usuario admin ( otorga los accesos especiales )

class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_active')

admin.site.register(Usuario, UsuarioAdmin)  


# Configurar el admin para la clase Actividad
class ActividadAdmin(admin.ModelAdmin):
    list_display = ('nombre_actividad', 'tiempo_estimado', 'clima_requerido', 'fecha_vencimiento', 'fecha')
    search_fields = ('nombre_actividad',)  # Permitir búsqueda por nombre



# Registrar los modelos en el admin
admin.site.register(Actividad, ActividadAdmin)
