from django.db import models
from django.contrib.auth.models import AbstractUser

class Message(models.Model):
    time = models.DateTimeField(auto_now=True)
    msg = models.TextField()
    is_seen = models.BooleanField(null=False,default=False)
    from_who = models.ForeignKey('CustomUser',on_delete=models.CASCADE,related_name='whom_msg',null=True)
    to_who = models.ForeignKey('CustomUser',on_delete=models.CASCADE,related_name='to_msg',null=True)

class CustomUser(AbstractUser):
    friends = models.ManyToManyField('CustomUser',related_name='friends_user')
    requests = models.ManyToManyField('CustomUser',related_name='requests_user')
