from manim import *
import numpy as np


# ==============================================================================
# EDUVISION SUBJECT-AWARE DETERMINISTIC VISUAL PRIMITIVES LIBRARY
# ==============================================================================

# Color safety aliases for commonly generated color names
LIGHT_GREEN = GREEN_B
DARK_GREEN = GREEN_E
LIGHT_BLUE = BLUE_B
DARK_BLUE = BLUE_E
LIGHT_RED = RED_B
DARK_RED = RED_E
LIGHT_YELLOW = YELLOW_B
DARK_YELLOW = YELLOW_E
LIGHT_GRAY = GRAY_B
DARK_GRAY = GRAY_D
CYAN = TEAL
MAGENTA = PINK
PURPLE_A = PURPLE
PURPLE_B = PURPLE

class LayoutManager:
    """Manages screen safe zones and auto-scales groups to prevent edge overflow."""
    HEADER_Y = 3.2
    UPPER_LANE_Y = 1.8
    STAGE_Y = 0.0
    LOWER_LANE_Y = -1.8
    BOTTOM_Y = -3.1
    MAX_WIDTH = 11.5
    MAX_HEIGHT = 5.2

    @staticmethod
    def safe_scale(mob, max_w=11.5, max_h=5.2, *args, **kwargs):
        w = kwargs.get("max_w", kwargs.get("width", max_w))
        h = kwargs.get("max_h", kwargs.get("height", max_h))
        if mob.width > w:
            mob.scale_to_fit_width(w)
        if mob.height > h:
            mob.scale_to_fit_height(h)
        return mob

    @staticmethod
    def create_header(title_text="", subtitle_text="", *args, **kwargs):
        title = kwargs.get("title", kwargs.get("title_text", kwargs.get("text", kwargs.get("main", title_text))))
        sub = kwargs.get("sub", kwargs.get("subtitle", kwargs.get("subtitle_text", kwargs.get("sub_text", subtitle_text))))
        if not title and len(args) > 0:
            title = args[0]
            if len(args) > 1 and not sub:
                sub = args[1]
        t = Text(str(title or "EduVision"), font_size=36, color=BLUE_B).to_edge(UP, buff=0.35)
        if sub:
            st = Text(str(sub), font_size=20, color=GRAY_B).next_to(t, DOWN, buff=0.12)
            return VGroup(t, st)
        return t

    @staticmethod
    def create_status_bar(text_str="", *args, **kwargs):
        color = kwargs.get("color", YELLOW)
        msg = kwargs.get("text", kwargs.get("text_str", kwargs.get("msg", kwargs.get("status", kwargs.get("label", text_str)))))
        if not msg and len(args) > 0:
            msg = args[0]
        return Text(str(msg or ""), font_size=20, color=color).to_edge(DOWN, buff=0.45)


class ArrayVisualizer:
    """Deterministic boxed array visualizer with values, indices, and pointer lanes."""
    def __init__(self, values=None, box_size=0.8, color=BLUE_D, font_size=22, show_indices=True, *args, **kwargs):
        vals = values
        if vals is None and len(args) > 0:
            vals = args[0]
        vals = kwargs.get("values", kwargs.get("array", kwargs.get("arr", vals or [])))
        
        self.values = vals
        self.box_size = kwargs.get("box_size", box_size)
        c = kwargs.get("color", color)
        fs = kwargs.get("font_size", font_size)
        si = kwargs.get("show_indices", show_indices)

        self.boxes = []
        self.val_texts = []
        self.idx_texts = []
        self.group = VGroup()

        for i, val in enumerate(self.values):
            sq = Square(side_length=self.box_size, color=c, fill_color="#0f172a", fill_opacity=0.85, stroke_width=2.5)
            num = Text(str(val), font_size=fs, color=WHITE).move_to(sq.get_center())
            self.boxes.append(sq)
            self.val_texts.append(num)
            
            elem_grp = VGroup(sq, num)
            if si:
                idx = Text(str(i), font_size=14, color=GRAY).next_to(sq, UP, buff=0.12)
                self.idx_texts.append(idx)
                elem_grp.add(idx)
            self.group.add(elem_grp)

        self.group.arrange(RIGHT, buff=0.08)
        LayoutManager.safe_scale(self.group)

    def get_group(self):
        return self.group

    def get_element(self, idx):
        return self.group[idx]

    def get_box(self, idx):
        return self.boxes[idx]

    def get_val_mob(self, idx):
        return self.val_texts[idx]

    def create_pointer(self, idx, label="", is_upper=False, color=YELLOW, *args, **kwargs):
        lbl_text = kwargs.get("label", kwargs.get("text", label))
        if not lbl_text and len(args) > 0:
            lbl_text = args[0]
        up = kwargs.get("is_upper", kwargs.get("upper", is_upper))
        col = kwargs.get("color", color)

        target_box = self.boxes[idx]
        if up:
            ptr = Arrow(UP*0.8, UP*0.1, color=col, stroke_width=3).next_to(target_box, UP, buff=0.35)
            lbl = Text(str(lbl_text), font_size=14, color=col).next_to(ptr, UP, buff=0.08)
        else:
            ptr = Arrow(DOWN*0.8, DOWN*0.1, color=col, stroke_width=3).next_to(target_box, DOWN, buff=0.15)
            lbl = Text(str(lbl_text), font_size=14, color=col).next_to(ptr, DOWN, buff=0.08)
        return VGroup(ptr, lbl)


class LinkedListVisualizer:
    """Deterministic Singly Linked List Node and Pointer visualizer."""
    def __init__(self, values=None, node_w=1.2, node_h=0.7, color=BLUE_B, *args, **kwargs):
        vals = values
        if vals is None and len(args) > 0:
            vals = args[0]
        vals = kwargs.get("values", kwargs.get("nodes", vals or []))

        nw = kwargs.get("node_w", kwargs.get("width", node_w))
        nh = kwargs.get("node_h", kwargs.get("height", node_h))
        col = kwargs.get("color", color)

        self.nodes = []
        self.arrows = []
        self.group = VGroup()

        for i, val in enumerate(vals):
            data_box = Rectangle(width=nw*0.65, height=nh, color=col, fill_color="#0f172a", fill_opacity=0.9, stroke_width=2)
            ptr_box = Rectangle(width=nw*0.35, height=nh, color=col, fill_color="#1e293b", fill_opacity=0.9, stroke_width=2).next_to(data_box, RIGHT, buff=0)
            dot = Dot(ptr_box.get_center(), radius=0.06, color=YELLOW)
            val_txt = Text(str(val), font_size=18, color=WHITE).move_to(data_box.get_center())
            
            node_grp = VGroup(data_box, ptr_box, dot, val_txt)
            self.nodes.append(node_grp)

        for i in range(len(self.nodes)):
            if i > 0:
                self.nodes[i].next_to(self.nodes[i-1], RIGHT, buff=0.8)
                arr = Arrow(self.nodes[i-1][2].get_center(), self.nodes[i][0].get_left(), color=YELLOW, buff=0.05, stroke_width=2.5)
                self.arrows.append(arr)
                self.group.add(arr)
            self.group.add(self.nodes[i])

        if len(self.nodes) > 0:
            null_txt = Text("NULL", font_size=16, color=GRAY_B).next_to(self.nodes[-1], RIGHT, buff=0.8)
            last_arr = Arrow(self.nodes[-1][2].get_center(), null_txt.get_left(), color=GRAY, buff=0.05, stroke_width=2)
            self.group.add(last_arr, null_txt)
        
        self.group.move_to(ORIGIN)
        LayoutManager.safe_scale(self.group)

    def get_group(self):
        return self.group


class TreeVisualizer:
    """Hierarchical Binary Tree visualizer with non-overlapping subtree coordinates."""
    def __init__(self, root_val=None, tree_dict=None, radius=0.35, level_h=1.2, *args, **kwargs):
        self.nodes = {}
        self.edges = VGroup()
        self.node_group = VGroup()

        t_dict = kwargs.get("tree_dict", kwargs.get("tree", tree_dict))
        tree_data = t_dict or (root_val if isinstance(root_val, dict) else {"root": root_val or 10})
        r = kwargs.get("radius", radius)

        # Deterministic positions
        positions = {
            "root": np.array([0, 1.6, 0]),
            "L": np.array([-2.5, 0.4, 0]),
            "R": np.array([2.5, 0.4, 0]),
            "LL": np.array([-3.8, -0.8, 0]),
            "LR": np.array([-1.4, -0.8, 0]),
            "RL": np.array([1.4, -0.8, 0]),
            "RR": np.array([3.8, -0.8, 0]),
        }

        for key, pos in positions.items():
            if key in tree_data:
                val = tree_data[key]
                c = Circle(radius=r, color=BLUE_B, fill_color="#0f172a", fill_opacity=1.0, stroke_width=2.5).move_to(pos)
                t = Text(str(val), font_size=18, color=WHITE).move_to(pos)
                node_mob = VGroup(c, t)
                self.nodes[key] = node_mob
                self.node_group.add(node_mob)

        # Edges behind nodes
        edge_links = [("root", "L"), ("root", "R"), ("L", "LL"), ("L", "LR"), ("R", "RL"), ("R", "RR")]
        for p, ch in edge_links:
            if p in self.nodes and ch in self.nodes:
                line = Line(self.nodes[p][0].get_center(), self.nodes[ch][0].get_center(), color="#334155", stroke_width=3)
                self.edges.add(line)

        self.group = VGroup(self.edges, self.node_group)
        LayoutManager.safe_scale(self.group)

    def get_group(self):
        return self.group


class GraphVisualizer:
    """Deterministic Graph Visualizer ensuring edges are rendered behind nodes."""
    def __init__(self, positions_dict=None, edge_pairs=None, radius=0.38, *args, **kwargs):
        pos_dict = positions_dict
        if pos_dict is None and len(args) > 0:
            pos_dict = args[0]
        pos_dict = kwargs.get("positions", kwargs.get("positions_dict", kwargs.get("nodes", pos_dict or {})))

        edges = edge_pairs
        if edges is None and len(args) > 1:
            edges = args[1]
        edges = kwargs.get("edges", kwargs.get("edge_pairs", edges or []))

        r = kwargs.get("radius", radius)

        self.positions = pos_dict
        self.nodes = {}
        self.node_group = VGroup()
        self.edges = VGroup()

        # Edges
        for edge in edges:
            if isinstance(edge, (list, tuple)) and len(edge) >= 2:
                u, v = edge[0], edge[1]
                if u in pos_dict and v in pos_dict:
                    line = Line(pos_dict[u], pos_dict[v], color="#334155", stroke_width=3)
                    self.edges.add(line)

        # Nodes
        for name, pos in pos_dict.items():
            c = Circle(radius=r, color=BLUE_B, fill_color="#0f172a", fill_opacity=1.0, stroke_width=2.5).move_to(pos)
            t = Text(str(name), font_size=18, color=WHITE).move_to(pos)
            node_mob = VGroup(c, t)
            self.nodes[name] = node_mob
            self.node_group.add(node_mob)

        self.group = VGroup(self.edges, self.node_group)
        LayoutManager.safe_scale(self.group)

    def get_group(self):
        return self.group

    def set_visited(self, name, color=GREEN, *args, **kwargs):
        col = kwargs.get("color", color)
        if name in self.nodes:
            return self.nodes[name][0].animate.set_fill(col, opacity=0.85).set_color(col)
        return FadeIn(VGroup())


class KinematicsVisualizer:
    """Deterministic Kinematics & Projectile Visualizer with attached vectors."""
    @staticmethod
    def create_canvas(x_max=10, y_max=6, x_len=8.5, y_len=4.5, *args, **kwargs):
        xm = kwargs.get("x_max", x_max)
        ym = kwargs.get("y_max", y_max)
        xl = kwargs.get("x_len", kwargs.get("x_length", x_len))
        yl = kwargs.get("y_len", kwargs.get("y_length", y_len))

        axes = Axes(
            x_range=[0, xm, 2],
            y_range=[0, ym, 2],
            x_length=xl,
            y_length=yl,
            axis_config={"color": BLUE_D, "stroke_width": 2, "include_numbers": False},
        ).shift(LEFT * 0.5 + DOWN * 0.9)
        ground = Line(axes.c2p(-0.5, 0), axes.c2p(xm+0.5, 0), color=GRAY_D, stroke_width=3)
        return axes, ground


class MoleculeVisualizer:
    """Deterministic particle & chemical bond visualizer."""
    @staticmethod
    def make_atom(symbol="H", color=BLUE, radius=0.3, font_size=18, *args, **kwargs):
        sym = kwargs.get("symbol", symbol)
        col = kwargs.get("color", color)
        r = kwargs.get("radius", radius)
        fs = kwargs.get("font_size", font_size)

        c = Circle(radius=r, color=col, fill_color=col, fill_opacity=0.85, stroke_width=2)
        t = Text(str(sym), font_size=fs, color=WHITE).move_to(c.get_center())
        return VGroup(c, t)

    @staticmethod
    def make_bond(atom1, atom2, color=GRAY, stroke_width=2.5, *args, **kwargs):
        col = kwargs.get("color", color)
        sw = kwargs.get("stroke_width", stroke_width)
        return Line(atom1.get_center(), atom2.get_center(), color=col, stroke_width=sw)


class CircuitVisualizer:
    """Deterministic Electric Circuit visualizer with voltage source and resistor."""
    @staticmethod
    def create_rc_circuit(voltage=12, resistance=4, current=None, width=6.0, height=3.2, *args, **kwargs):
        v = kwargs.get("voltage", kwargs.get("v", voltage))
        r = kwargs.get("resistance", kwargs.get("r", resistance))
        w = kwargs.get("width", kwargs.get("w", width))
        h = kwargs.get("height", kwargs.get("h", height))

        loop = Rectangle(width=w, height=h, color=BLUE_D, stroke_width=3)
        
        # Source on left
        v_src = Circle(radius=0.45, color=YELLOW, fill_color="#0f172a", fill_opacity=1.0, stroke_width=2.5).move_to(loop.get_left())
        v_lbl = Text(f"{v}V", font_size=16, color=YELLOW).move_to(v_src.get_center())
        v_group = VGroup(v_src, v_lbl)

        # Resistor on top
        r_box = Rectangle(width=1.4, height=0.5, color=GREEN_B, fill_color="#0f172a", fill_opacity=1.0, stroke_width=2.5).move_to(loop.get_top())
        r_lbl = Text(f"{r} Ω", font_size=16, color=GREEN_B).move_to(r_box.get_center())
        r_group = VGroup(r_box, r_lbl)

        # Current Arrow on right
        calc_i = current if current is not None else kwargs.get("current", kwargs.get("i", round(float(v) / float(r), 1)))
        i_arrow = Arrow(loop.get_right() + UP*0.8, loop.get_right() + DOWN*0.8, color=ORANGE, stroke_width=3.5)
        i_lbl = Text(f"I = {calc_i}A", font_size=16, color=ORANGE).next_to(i_arrow, RIGHT, buff=0.15)
        i_group = VGroup(i_arrow, i_lbl)

        return VGroup(loop, v_group, r_group, i_group)


class MatrixVisualizer:
    """Deterministic Matrix Visualizer with row/column highlights."""
    @staticmethod
    def create_matrix(matrix_vals=None, font_size=20, cell_size=0.7, *args, **kwargs):
        m = matrix_vals
        if m is None and len(args) > 0:
            m = args[0]
        m = kwargs.get("matrix_vals", kwargs.get("matrix", kwargs.get("vals", m or [[1, 0], [0, 1]])))

        fs = kwargs.get("font_size", font_size)
        cs = kwargs.get("cell_size", cell_size)

        grp = VGroup()
        rows = len(m)
        cols = len(m[0])
        cells = []
        for r in range(rows):
            row_cells = []
            for c in range(cols):
                sq = Square(side_length=cs, color=BLUE_D, fill_color="#0f172a", fill_opacity=0.85, stroke_width=2)
                val = Text(str(m[r][c]), font_size=fs, color=WHITE).move_to(sq.get_center())
                cell = VGroup(sq, val)
                row_cells.append(cell)
            row_grp = VGroup(*row_cells).arrange(RIGHT, buff=0.05)
            cells.append(row_grp)
        grid = VGroup(*cells).arrange(DOWN, buff=0.05)
        brackets = SurroundingRectangle(grid, color=BLUE_B, buff=0.12, stroke_width=2)
        return VGroup(grid, brackets)


from manim import *
import numpy as np

class AutoTeach(Scene):
    def construct(self):
        # ----- Header -----
        title = Text("Photosynthesis", font_size=36, color=WHITE)
        subtitle = Text("How plants turn light into food", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN, buff=0.2)
        header.to_edge(UP, buff=0.3)
        self.play(Write(title), Write(subtitle))
        self.wait(0.5)

        # ----- Main Elements -----
        # Leaf (center)
        leaf = Ellipse(width=4, height=2, color=GREEN, fill_opacity=0.6)
        leaf.shift(DOWN * 0.5)

        # Sun
        sun = Circle(radius=0.5, color=YELLOW, fill_opacity=1, fill_color=YELLOW)
        sun.to_edge(RIGHT, buff=1).shift(UP * 1.5)

        # Water droplet
        water = Circle(radius=0.2, color=BLUE_D, fill_opacity=0.8, fill_color=BLUE_D)
        water.to_edge(LEFT, buff=1).shift(DOWN * 1.2)

        # CO₂ molecule (simple text)
        co2 = Text("CO₂", font_size=28, color=GRAY)
        co2.next_to(water, UP, buff=0.3)

        # ----- Scene 1: Setup -----
        self.play(FadeIn(sun), FadeIn(water), FadeIn(co2), FadeIn(leaf))
        self.wait(1)

        # ----- Scene 2: Light Capture -----
        # Photon particle
        photon = Circle(radius=0.08, color=YELLOW, fill_opacity=1, fill_color=YELLOW)
        photon.move_to(sun.get_center())

        # Arrow path from sun to leaf
        path_arrow = Arrow(start=sun.get_center(), end=leaf.get_center(),
                           buff=0, color=YELLOW)

        # Chlorophyll cluster (small green dot inside leaf)
        chlorophyll = Dot(point=leaf.get_center(), radius=0.12, color=GREEN_D)

        # Glucose molecule (text)
        glucose = Text("Glucose", font_size=28, color=ORANGE)
        glucose.move_to(leaf.get_center())

        self.play(FadeIn(photon), FadeIn(chlorophyll))
        self.play(MoveAlongPath(photon, path_arrow), run_time=1.5)
        self.play(ReplacementTransform(photon, glucose))
        self.wait(0.8)

        # ----- Scene 3: Oxygen Release -----
        # O₂ molecule (text)
        o2 = Text("O₂", font_size=28, color=RED)
        o2.move_to(leaf.get_center())

        # Exit arrow
        exit_arrow = Arrow(start=leaf.get_center(), end=leaf.get_center() + RIGHT * 3,
                           buff=0, color=RED)

        self.play(FadeIn(o2))
        self.play(MoveAlongPath(o2, exit_arrow), run_time=1.5)
        self.play(FadeOut(exit_arrow), FadeOut(o2))
        self.wait(0.5)

        # ----- Scene 4: Summary Badge -----
        badge = RoundedRectangle(width=6, height=2, corner_radius=0.3,
                                 color=WHITE, fill_opacity=0.2, fill_color=WHITE)
        formula = Text("6CO₂ + 6H₂O + light → C₆H₁₂O₆ + O₂",
                       font_size=24, color=YELLOW)
        formula.move_to(badge.get_center())
        summary = VGroup(badge, formula)

        summary.to_edge(DOWN, buff=1)

        self.play(FadeIn(badge), Write(formula))
        self.wait(0.5)
        # Pulse effect
        self.play(badge.animate.scale(1.2).set_fill(YELLOW, opacity=0.5), run_time=0.4)
        self.play(badge.animate.scale(1/1.2).set_fill(WHITE, opacity=0.2), run_time=0.4)

        # ----- End -----
        self.wait(1)