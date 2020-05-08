from django.shortcuts import render
from django import forms
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User


from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from rest_framework.response import Response


@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def register_page(request):
    username = request.POST.get('username','')
    password = request.POST.get('password','')

    if username is '' or password is '' :
        return Response({'error': 'Please provide both username and password'},
                        status=HTTP_400_BAD_REQUEST)

    if User.objects.filter(username = username).exists():
            return Response({'error': 'Such user is already exists'},
                        status=HTTP_400_BAD_REQUEST)       
    else:
               
        user = User()
        user.username = username
        user.set_password(password)
        user.save()

        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key,'username':username},
                        status=HTTP_200_OK)



@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def login_page(request):
    username = request.POST.get("username",'')
    password = request.POST.get("password",'')
    if username is '' or password is '':
        return Response({'error': 'Please provide both username and password'},
                        status=HTTP_400_BAD_REQUEST)
    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid Credentials'},
                        status=HTTP_404_NOT_FOUND)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key,'username':user.username},
                    status=HTTP_200_OK)

@csrf_exempt
@api_view(["GET"])
@permission_classes((AllowAny,))
def show_page(request):
    return render(request,'root.html')
       

@csrf_exempt
@api_view(["POST"])
def load_users(request):
    all_users = User.objects.all()
    data = {
        'users':all_users
    }
    return Response(data, status=HTTP_200_OK)

