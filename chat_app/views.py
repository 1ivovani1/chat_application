from django.shortcuts import render
from django import forms
from django.contrib.auth import login, authenticate, logout
from .models import *


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
from django.db.models import Q

@csrf_exempt
@api_view(["POST"])
def send_friend_request(request):
    id = request.POST.get('user_id','')
    if id is '':
        return Response({'error': 'Cant find user_id'},
                        status=HTTP_400_BAD_REQUEST)
    
    user = CustomUser.objects.get(pk=id)
    if not request.user in user.requests.all() or not request.user in user.friends.all():
        user.requests.add(request.user)
        return Response({'username':user.username},status=HTTP_200_OK)
    else:
        return Response({'error': 'Request already sent or u are friends'},
                        status=HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def register_page(request):
    username = request.POST.get('username','')
    password = request.POST.get('password','')

    if username is '' or password is '' :
        return Response({'error': 'Please provide both username and password'},
                        status=HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(username = username).exists():
            return Response({'error': 'Such user is already exists'},
                        status=HTTP_400_BAD_REQUEST)       
    else:
               
        user = CustomUser()
        user.username = username
        user.set_password(password)
        user.save()

        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key,'username':username,'user_id':user.id},
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
    return Response({'token': token.key,'username':user.username,'user_id':user.id},
                    status=HTTP_200_OK)

@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def check(request):
    token = request.POST.get('token','')
    if token is '':
        return Response(status=HTTP_400_BAD_REQUEST)

    if Token.objects.filter(key=token).exists():
        user = Token.objects.filter(key=token).first().user

        data = {
            'user_id':user.id,
            'username':user.username
        }

        return Response(data,status=HTTP_200_OK)
    else:
        return Response(status=HTTP_404_NOT_FOUND)

@csrf_exempt
@api_view(["GET"])
@permission_classes((AllowAny,))
def show_page(request):
    return render(request,'root.html')


@csrf_exempt
@api_view(["POST"])
def get_user_messages(request):
    id = request.POST.get('user_id','')
    if id is '':
        return Response({'error': 'Cant find id'},
                        status=HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.get(pk=id)
    if user in request.user.friends.all():
        data = {
            'username':user.username,
            'id':id,
            'request_user_id':request.user.id,
            'history':[]
        }
        
        history = Message.objects.filter( (Q(to_who=user) & Q(from_who=request.user)) | (Q(to_who=request.user) & Q(from_who=user)) ).order_by('id').all()

        for msg in history:
            message = {
                'id':msg.id,
                'msg':msg.msg,
                'from_id':msg.from_who.id,
                'to_id':msg.to_who.id
            }
            data['history'].append(message)

        return Response(data, status=HTTP_200_OK)
    else:
        return Response({'error': 'This user is not your friend'},
                        status=HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(["POST"])
def send_message(request):
    id = request.POST.get('user_id','')
    msg = request.POST.get('msg','')
    if id is '' or msg is '':
        return Response({'error': 'Cant find id'},
                        status=HTTP_400_BAD_REQUEST)
    
    whom_send = CustomUser.objects.get(pk=id)
    if whom_send in request.user.friends.all():
        mess = Message(msg=msg,from_who=request.user,to_who=whom_send)
        mess.save()
        
        data = {
            'id':mess.id,
            'msg':mess.msg,
            'from_id':mess.from_who.id,
            'to_id':mess.to_who.id
        }

        return Response(data,status=HTTP_200_OK)

    else:
        return Response({'error': 'This user is not your friend'},
                        status=HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(["POST"])
def search_users(request):
    query = request.POST.get('query','')
    if query is '':
        return Response({'error': 'Cant find your query'},
                        status=HTTP_400_BAD_REQUEST)

    probably_users = CustomUser.objects.filter(Q(username__icontains = query) | Q(id__icontains = query))
    data = {
        'search_users':[]
    }
    for user in probably_users:
        if request.user != user: 
            new_user = {
                'username':user.username,
                'id':user.id
            }
            if user in request.user.friends.all():
                new_user['status'] = 'friends'
            elif request.user in user.requests.all():
                new_user['status'] = 'request'
            else:
                new_user['status'] = 'ready_to_send'

            data['search_users'].append(new_user)

    return Response(data, status=HTTP_200_OK)


@csrf_exempt
@api_view(["POST"])
def deny_friend_request(request):
    id = request.POST.get('user_id','')
    if id is '':
        return Response({'error': 'Cant find user_id'},
                        status=HTTP_400_BAD_REQUEST)

    user_to_remove = CustomUser.objects.get(pk=id)
    if not user_to_remove in request.user.friends.all():
        request.user.requests.remove(user_to_remove)
        return Response({'user_to_remove':user_to_remove.username}, status=HTTP_200_OK)

@csrf_exempt
@api_view(["POST"])
def accept_friend_request(request):
    id = request.POST.get('user_id','')
    if id is '':
        return Response({'error': 'Cant find user_id'},
                        status=HTTP_400_BAD_REQUEST)

    user_to_add = CustomUser.objects.get(pk=id)
    if not user_to_add in request.user.friends.all():
        request.user.requests.remove(user_to_add)
        request.user.friends.add(user_to_add) 
        user_to_add.friends.add(request.user)
        return Response({'user_to_add':user_to_add.username}, status=HTTP_200_OK)
    else:
        return Response({'error': 'You are already friends'},
                        status=HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(["POST"])
def load_users(request):
    last_loaded_index = int(request.POST.get('last_loaded_index',''))

    if last_loaded_index is '':
        return Response({'error': 'Cant find last loaded index'},
                        status=HTTP_400_BAD_REQUEST)

    all_users = CustomUser.objects.all()
    
    if request.user.requests != None:
        current_user_requests = request.user.requests.all()
    else:
        current_user_requests = []

    if request.user.friends != None:
        current_user_friends = request.user.friends.all()
    else:
        current_user_requests = []
    

    data = {
        'users':[],
        'requests':[],
        'friends':[]
    }
    # --------------working with friends
    for friend in current_user_friends:
        friend = {
            "id":friend.id,
            'username':friend.username
        }
        data['friends'].append(friend)


    # --------------working with friend requests
    for req in current_user_requests:
        new_request = {
            "id":req.id,
            'username':req.username
        }
        data['requests'].append(new_request)

    # --------------working with users rendering
    real_length = len(all_users)

    if real_length > 10:
        length = 10
    else:
        length = 1
    
    data['length'] = length
    data['real_length'] = real_length

    for i in range(last_loaded_index,last_loaded_index + length):
        
            new_user = {
                'username':all_users[i].username,
                'id':all_users[i].id
            }
            if all_users[i] in request.user.friends.all():
                new_user['status'] = 'friends'
            elif request.user in all_users[i].requests.all():
                new_user['status'] = 'request'
            else:
                new_user['status'] = 'ready_to_send'
            data['users'].append(new_user)
        

    return Response(data, status=HTTP_200_OK)

