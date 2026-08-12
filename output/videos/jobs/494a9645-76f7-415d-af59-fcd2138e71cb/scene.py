from manim import *
import numpy as np
import math


# ==============================================================================
# EDUVISION SUBJECT-AWARE DETERMINISTIC VISUAL PRIMITIVES LIBRARY
# ==============================================================================
import math

# Vector & coordinate safety helpers
def vec3(x, y=0.0, z=0.0):
    """Guarantees a 3D float NumPy vector for Manim positioning."""
    return np.array([float(x), float(y), float(z)])

def deg_to_vec(degrees, length=1.0):
    """Creates a 3D unit direction vector from an angle in degrees."""
    rad = np.radians(degrees)
    return np.array([length * np.cos(rad), length * np.sin(rad), 0.0])

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

# Safe LaTeX fallback - automatically redirects MathTex and Tex to native Text
class SafeText(Text):
    def __init__(self, *args, **kwargs):
        kwargs.pop("tex_environment", None)
        kwargs.pop("tex_template", None)
        kwargs.pop("arg_separator", None)
        kwargs.pop("substrings_to_isolate", None)
        str_args = [str(a) for a in args] if args else [""]
        super().__init__(*str_args, **kwargs)

MathTex = SafeText
Tex = SafeText
SingleStringMathTex = SafeText


class LayoutManager:
    """Manages screen safe zones, clear-stage transitions, and auto-scales groups."""
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

    @staticmethod
    def clear_stage(scene, preserve=None, run_time=0.6, *args, **kwargs):
        """Fades out all active screen objects except preserved ones (e.g. the header)."""
        keep_list = []
        if preserve is not None:
            if isinstance(preserve, (list, tuple, set, VGroup, Group)):
                keep_list = list(preserve)
            else:
                keep_list = [preserve]
        to_fade = [m for m in list(scene.mobjects) if m not in keep_list and not any(m in getattr(k, 'submobjects', []) for k in keep_list)]
        if to_fade:
            scene.play(*[FadeOut(m) for m in to_fade], run_time=run_time)

# Equip Scene with anti-crash aliases, clear_stage, and wait safety
Scene.clear_stage = lambda self, preserve=None, run_time=0.6: LayoutManager.clear_stage(self, preserve, run_time)
Scene.scene1 = lambda self, *args, **kwargs: None
Scene.scene2 = lambda self, *args, **kwargs: None
Scene.scene3 = lambda self, *args, **kwargs: None
Scene.scene4 = lambda self, *args, **kwargs: None

_orig_scene_wait = getattr(Scene, "wait", None)
def _safe_scene_wait(self, duration=1.0, *args, **kwargs):
    try:
        dur = float(duration)
        if dur <= 0.001:
            return
        if _orig_scene_wait:
            return _orig_scene_wait(self, dur, *args, **kwargs)
    except Exception:
        pass
Scene.wait = _safe_scene_wait
Scene.safe_wait = _safe_scene_wait


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


class OpticsVisualizer:
    """Deterministic Optics & Mirror Reflection Visualizer."""
    @staticmethod
    def create_plane_mirror(length=8.0, position=DOWN*0.5, *args, **kwargs):
        p = position
        mirror_line = Line(p + LEFT*(length/2), p + RIGHT*(length/2), color=BLUE_B, stroke_width=4)
        hatch_points = np.linspace(p + LEFT*(length/2), p + RIGHT*(length/2), int(length * 3))
        hatches = VGroup(*[Line(pt, pt + DL*0.2, color=GRAY, stroke_width=2) for pt in hatch_points])
        normal = DashedLine(p, p + UP*3.2, color=GRAY_B, stroke_width=2)
        normal_lbl = Text("Normal", font_size=16, color=GRAY_B).next_to(normal.get_top(), UR, buff=0.1)
        return VGroup(mirror_line, hatches, normal, normal_lbl)


class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Header (kept across scenes)
        header = LayoutManager.create_header("Projectile Motion", "Understanding trajectory")
        self.add(header)

        # ---------- Scene 1 (12.5s) ----------
        axes, ground = KinematicsVisualizer.create_canvas(x_max=50, y_max=15)
        ground_line = Line(axes.c2p(0, 0), axes.c2p(50, 0), color=WHITE)

        particle = Dot(axes.c2p(0, 0), radius=0.15, color=YELLOW)

        v0 = 20
        theta_deg = 45
        theta_rad = np.deg2rad(theta_deg)
        v0x = v0 * np.cos(theta_rad)
        v0y = v0 * np.sin(theta_rad)

        velocity_vector = Arrow(
            axes.c2p(0, 0),
            axes.c2p(v0x, v0y),
            buff=0,
            color=GREEN
        )

        self.play(Create(axes), run_time=2.0)
        self.play(Create(ground_line), run_time=1.5)
        self.play(FadeIn(particle), run_time=0.5)
        self.play(Create(velocity_vector), run_time=1.5)
        self.wait(7.0)

        # ---------- Scene 2 (11.4s) ----------
        self.clear_stage(preserve=header)

        v0x_vector = Arrow(
            axes.c2p(0, 0),
            axes.c2p(v0x, 0),
            buff=0,
            color=BLUE
        )
        v0y_vector = Arrow(
            axes.c2p(0, 0),
            axes.c2p(0, v0y),
            buff=0,
            color=RED
        )
        v0x_label = Text("v₀ₓ = 14.14 m/s", font_size=24).next_to(v0x_vector, UP, buff=0.2)
        v0y_label = Text("v₀ᵧ = 14.14 m/s", font_size=24).next_to(v0y_vector, UP, buff=0.2)

        self.play(Create(v0x_vector), run_time=1.0)
        self.play(Create(v0y_vector), run_time=1.0)
        self.play(Write(v0x_label), run_time=1.0)
        self.play(Write(v0y_label), run_time=1.0)
        self.wait(7.4)

        # ---------- Scene 3 (8.3s) ----------
        self.clear_stage(preserve=header)

        g = 9.8
        t_flight = 2 * v0y / g
        path = ParametricFunction(
            lambda t: axes.c2p(v0x * t, v0y * t - 0.5 * g * t**2),
            t_range=[0, t_flight],
            color=YELLOW
        )

        self.play(Create(path), run_time=1.0)
        self.play(MoveAlongPath(particle, path), run_time=4.0)
        self.wait(3.3)

        # ---------- Scene 4 (12.2s) ----------
        self.clear_stage(preserve=header)

        t_apex = v0y / g
        x_apex = v0x * t_apex
        h_max = v0y**2 / (2 * g)

        apex_point = axes.c2p(x_apex, h_max)
        apex_dot = Dot(apex_point, radius=0.15, color=ORANGE)
        H_label = Text("H = 10.2 m", font_size=24).next_to(apex_dot, UP, buff=0.2)

        x_range = 2 * x_apex
        range_line = Line(apex_point, axes.c2p(x_range, 0), color=WHITE)
        R_label = Text("R = 40.8 m", font_size=24).next_to(range_line, DOWN, buff=0.2)

        self.play(Create(apex_dot), run_time=0.5)
        self.play(Create(range_line), run_time=1.0)
        self.play(Write(H_label), run_time=1.0)
        self.play(Write(R_label), run_time=1.0)
        self.wait(8.7)