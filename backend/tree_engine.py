"""A small, self-contained Red-Black Tree implementation for TreeForAll."""
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional, Any

RED = "RED"
BLACK = "BLACK"

@dataclass
class Node:
    value: int
    color: str = RED
    left: Any = None
    right: Any = None
    parent: Any = None
    uid: int = 0

class RedBlackTree:
    def __init__(self):
        self.nil = Node(value=0, color=BLACK, uid=-1)
        self.nil.left = self.nil.right = self.nil.parent = self.nil
        self.root = self.nil
        self._next_uid = 1
        self._events = []

    def _record_step(self, title, detail, focus=None):
        self._events.append({"title": title, "detail": detail, "focus": focus, "snapshot": self.snapshot()})

    def search_node(self, value: int) -> Optional[Node]:
        current = self.root
        while current != self.nil:
            if value == current.value: return current
            current = current.left if value < current.value else current.right
        return None

    def insert(self, value: int) -> bool:
        self._events = []
        parent = self.nil
        current = self.root
        while current != self.nil:
            parent = current
            if value == current.value: return False
            current = current.left if value < current.value else current.right
        node = Node(value=value, color=RED, left=self.nil, right=self.nil, parent=parent, uid=self._next_uid)
        self._next_uid += 1
        if parent == self.nil: self.root = node
        elif value < parent.value: parent.left = node
        else: parent.right = node
        self._record_step("New red node", f"{value} is attached in its binary-search-tree position. New nodes begin red.", value)
        self._insert_fixup(node)
        self._record_step("Insertion complete", "The insertion fix-up is complete and the Red-Black Tree properties have been checked.", value)
        return True

    def _left_rotate(self, x):
        y = x.right
        x.right = y.left
        if y.left != self.nil: y.left.parent = x
        y.parent = x.parent
        if x.parent == self.nil: self.root = y
        elif x == x.parent.left: x.parent.left = y
        else: x.parent.right = y
        y.left = x
        x.parent = y
        self._record_step("Left rotation", f"Left rotation around {x.value}: {y.value} moves up and {x.value} moves to its left.", x.value)

    def _right_rotate(self, y):
        x = y.left
        y.left = x.right
        if x.right != self.nil: x.right.parent = y
        x.parent = y.parent
        if y.parent == self.nil: self.root = x
        elif y == y.parent.right: y.parent.right = x
        else: y.parent.left = x
        x.right = y
        y.parent = x
        self._record_step("Right rotation", f"Right rotation around {y.value}: {x.value} moves up and {y.value} moves to its right.", y.value)

    def _insert_fixup(self, z):
        while z.parent.color == RED:
            if z.parent == z.parent.parent.left:
                y = z.parent.parent.right
                if y.color == RED:
                    z.parent.color = BLACK; y.color = BLACK; z.parent.parent.color = RED; z = z.parent.parent
                else:
                    if z == z.parent.right: z = z.parent; self._left_rotate(z)
                    z.parent.color = BLACK; z.parent.parent.color = RED; self._right_rotate(z.parent.parent)
            else:
                y = z.parent.parent.left
                if y.color == RED:
                    z.parent.color = BLACK; y.color = BLACK; z.parent.parent.color = RED; z = z.parent.parent
                else:
                    if z == z.parent.left: z = z.parent; self._right_rotate(z)
                    z.parent.color = BLACK; z.parent.parent.color = RED; self._left_rotate(z.parent.parent)
            self._record_step("Insertion recoloring / fix-up", "Colors and links have been adjusted to remove a red-red conflict.", z.value)
        self.root.color = BLACK
        self.root.parent = self.nil

    def _transplant(self, u, v):
        if u.parent == self.nil: self.root = v
        elif u == u.parent.left: u.parent.left = v
        else: u.parent.right = v
        v.parent = u.parent

    def _minimum(self, node):
        while node.left != self.nil: node = node.left
        return node

    def delete(self, value: int) -> bool:
        self._events = []
        z = self.search_node(value)
        if z is None: return False
        y = z
        original_color = y.color
        if z.left == self.nil:
            x = z.right; self._transplant(z, z.right)
        elif z.right == self.nil:
            x = z.left; self._transplant(z, z.left)
        else:
            y = self._minimum(z.right); original_color = y.color; x = y.right
            if y.parent == z: x.parent = y
            else:
                self._transplant(y, y.right); y.right = z.right; y.right.parent = y
            self._transplant(z, y); y.left = z.left; y.left.parent = y; y.color = z.color
        self._record_step("Node removed or replaced", f"The deletion of {value} has changed the tree structure. The engine now checks whether balancing is needed.", value)
        if original_color == BLACK: self._delete_fixup(x)
        if self.root != self.nil: self.root.parent = self.nil
        self._record_step("Deletion complete", "Deletion fix-up is complete and Red-Black Tree properties have been checked.", value)
        return True

    def _delete_fixup(self, x):
        while x != self.root and x.color == BLACK:
            if x == x.parent.left:
                w = x.parent.right
                if w.color == RED:
                    w.color = BLACK; x.parent.color = RED; self._left_rotate(x.parent); w = x.parent.right
                if w.left.color == BLACK and w.right.color == BLACK:
                    w.color = RED; x = x.parent
                else:
                    if w.right.color == BLACK:
                        w.left.color = BLACK; w.color = RED; self._right_rotate(w); w = x.parent.right
                    w.color = x.parent.color; x.parent.color = BLACK; w.right.color = BLACK; self._left_rotate(x.parent); x = self.root
            else:
                w = x.parent.left
                if w.color == RED:
                    w.color = BLACK; x.parent.color = RED; self._right_rotate(x.parent); w = x.parent.left
                if w.right.color == BLACK and w.left.color == BLACK:
                    w.color = RED; x = x.parent
                else:
                    if w.left.color == BLACK:
                        w.right.color = BLACK; w.color = RED; self._left_rotate(w); w = x.parent.left
                    w.color = x.parent.color; x.parent.color = BLACK; w.left.color = BLACK; self._right_rotate(x.parent); x = self.root
            self._record_step("Deletion recoloring / fix-up", "Sibling and parent colors have been adjusted to restore equal black-height.", x.value if x != self.nil else None)
        x.color = BLACK
        self._record_step("Final black coloring", "The replacement node is black, completing deletion fix-up.", x.value if x != self.nil else None)

    def values(self, order="inorder"):
        result = []
        def walk(node):
            if node == self.nil: return
            if order == "preorder": result.append(node.value)
            walk(node.left)
            if order == "inorder": result.append(node.value)
            walk(node.right)
            if order == "postorder": result.append(node.value)
        walk(self.root)
        if order == "level_order" and self.root != self.nil:
            result = []; queue = [self.root]
            while queue:
                node = queue.pop(0); result.append(node.value)
                if node.left != self.nil: queue.append(node.left)
                if node.right != self.nil: queue.append(node.right)
        return result

    def height(self):
        def h(node):
            if node == self.nil: return 0
            return 1 + max(h(node.left), h(node.right))
        return h(self.root)

    def validate(self):
        if self.root == self.nil: return True
        if self.root.color != BLACK: return False
        def check(node, low=None, high=None):
            if node == self.nil: return 1
            if low is not None and node.value <= low: raise ValueError("BST ordering violation")
            if high is not None and node.value >= high: raise ValueError("BST ordering violation")
            if node.color == RED and (node.left.color == RED or node.right.color == RED):
                raise ValueError("Adjacent red nodes")
            left_black = check(node.left, low, node.value)
            right_black = check(node.right, node.value, high)
            if left_black != right_black: raise ValueError("Black-height mismatch")
            return left_black + (1 if node.color == BLACK else 0)
        try: check(self.root); return True
        except ValueError: return False

    def get_events(self):
        return self._events

    def snapshot(self):
        nodes = []
        inorder_counter = 0
        def walk(node, depth):
            nonlocal inorder_counter
            if node == self.nil: return
            walk(node.left, depth + 1)
            node.x_order = inorder_counter
            inorder_counter += 1
            walk(node.right, depth + 1)
            nodes.append(node)
        walk(self.root, 0)
        root_id = None if self.root == self.nil else self.root.uid
        def child_id(n): return None if n == self.nil else n.uid
        serial = [{
            "id": n.uid, "value": n.value, "color": n.color, "depth": self._depth(n),
            "left": child_id(n.left), "right": child_id(n.right), "x_order": n.x_order
        } for n in nodes]
        return {
            "root_id": root_id,
            "root": None if self.root == self.nil else self.root.value,
            "root_color": None if self.root == self.nil else self.root.color.title(),
            "size": len(nodes), "height": self.height(), "valid": self.validate(),
            "nodes": serial,
            "traversals": {k: self.values(k) for k in ("inorder", "preorder", "postorder", "level_order")}
        }

    def _depth(self, node):
        depth = 0
        while node.parent != self.nil:
            node = node.parent; depth += 1
        return depth
