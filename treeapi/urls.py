from django.urls import path
from . import views

urlpatterns = [
    path("tree", views.get_tree, name="tree"),
    path("insert", views.insert, name="insert"),
    path("delete", views.delete, name="delete"),
    path("search", views.search, name="search"),
    path("reset", views.reset, name="reset"),
]
