from django.urls import include, path, re_path
from treeapi import views

urlpatterns = [
    path("", views.index, name="home"),
    path("api/", include("treeapi.urls")),
    re_path(r"^(?P<path>css/.*|js/.*)$", views.frontend_asset, name="frontend-asset"),
]
