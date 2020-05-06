from django.contrib import admin
from django.urls import path

from chat_app.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('logout',logout_page),
    path('main',main),
    path('api/authenticate',authenticate),
    path('api/sampleapi',sample_api)

]
