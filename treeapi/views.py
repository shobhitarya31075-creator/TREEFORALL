import json
from pathlib import Path

from django.http import HttpResponse, Http404
from django.views.static import serve
from rest_framework.decorators import api_view
from rest_framework.response import Response

from tree_engine import RedBlackTree

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"
tree = RedBlackTree()

def index(request):
    return HttpResponse((FRONTEND / "index.html").read_text(encoding="utf-8"))

def frontend_asset(request, path):
    candidate = (FRONTEND / path).resolve()
    if not candidate.is_relative_to(FRONTEND.resolve()) or not candidate.is_file():
        raise Http404("Asset not found")
    return serve(request, path, document_root=str(FRONTEND))

def read_value(request):
    value = request.data.get("value") if isinstance(request.data, dict) else None
    if isinstance(value, bool) or not isinstance(value, int):
        return None
    if abs(value) > 9007199254740991:
        return None
    return value

@api_view(["GET"])
def get_tree(request):
    return Response(tree.snapshot())

@api_view(["POST"])
def insert(request):
    value = read_value(request)
    if value is None:
        return Response({"ok": False, "error": "Provide a whole-number value."}, status=400)
    changed = tree.insert(value)
    return Response({"ok": True, "changed": changed, "value": value, "events": tree.get_events()})

@api_view(["POST"])
def delete(request):
    value = read_value(request)
    if value is None:
        return Response({"ok": False, "error": "Provide a whole-number value."}, status=400)
    changed = tree.delete(value)
    return Response({"ok": True, "changed": changed, "value": value, "events": tree.get_events()})

@api_view(["POST"])
def search(request):
    value = read_value(request)
    if value is None:
        return Response({"ok": False, "error": "Provide a whole-number value."}, status=400)
    return Response({"ok": True, "found": tree.search_node(value) is not None, "value": value})

@api_view(["POST"])
def reset(request):
    global tree
    tree = RedBlackTree()
    return Response({"ok": True})
