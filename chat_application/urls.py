from django.contrib import admin
from django.urls import path

from chat_app.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login',login_page),
    path('api/register',register_page),
    path('api/main',sample_api),
    path('',show_page)

]
