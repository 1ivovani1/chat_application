from django.contrib import admin
from django.urls import path

from chat_app.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login',login_page),
    path('api/register',register_page),
    path('api/load_users',load_users),
    path('api/search_users',search_users),
    path('api/send_friend_request',send_friend_request),
    path('api/accept_friend_request',accept_friend_request),
    path('api/deny_friend_request',deny_friend_request),
    path('api/get_user_messages',get_user_messages),
    path('api/send_message',send_message),
    path('api/check_user',check),
    path('',show_page)

]
