# Generated by Django 3.0.6 on 2020-05-09 14:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat_app', '0003_auto_20200508_2047'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='message',
            name='to',
        ),
    ]
