# usuarios/emails.py
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def notificar_actividad(usuario, actividad):
    # Renderizar la plantilla HTML
    subject = 'Nueva actividad pendiente'
    html_message = render_to_string('email/notification.html', {
        'usuario': usuario,
        'actividad': actividad,
    })
    
    # Crear una versión en texto plano del mensaje HTML
    plain_message = strip_tags(html_message)
    
    # Enviar el correo
    send_mail(
        subject,
        plain_message,
        settings.EMAIL_HOST_USER,  # Remitente, el correo configurado en settings.py
        [usuario.email],  # Destinatario, el correo del usuario
        html_message=html_message,  # Mensaje HTML
        fail_silently=False,
    )