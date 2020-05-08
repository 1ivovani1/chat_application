from django.contrib import admin
from django.urls import path

from chat_app.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login',login_page),
    path('api/register',register_page),
    path('api/load_users',load_users),
    path('',show_page)

]
