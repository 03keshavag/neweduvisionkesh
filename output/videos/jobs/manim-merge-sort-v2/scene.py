from manim import *
import numpy as np

from manim import *
import numpy as np


# ==============================================================================
# EDUVISION SUBJECT-AWARE DETERMINISTIC VISUAL PRIMITIVES LIBRARY
# ==============================================================================

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
    def safe_scale(mob, max_w=11.5, max_h=5.2):
        if mob.width > max_w:
            mob.scale_to_fit_width(max_w)
        if mob.height > max_h:
            mob.scale_to_fit_height(max_h)
        return mob

    @staticmethod
    def create_header(title_text, subtitle_text=""):
        t = Text(str(title_text), font_size=36, color=BLUE_B).to_edge(UP, buff=0.35)
        if subtitle_text:
            st = Text(str(subtitle_text), font_size=20, color=GRAY_B).next_to(t, DOWN, buff=0.12)
            return VGroup(t, st)
        return t

    @staticmethod
    def create_status_bar(text_str, color=YELLOW):
        return Text(str(text_str), font_size=20, color=color).to_edge(DOWN, buff=0.45)


class ArrayVisualizer:
    """Deterministic boxed array visualizer with values, indices, and pointer lanes."""
    def __init__(self, values, box_size=0.8, color=BLUE_D, font_size=22, show_indices=True, **kwargs):
        self.values = values
        self.box_size = box_size
        self.boxes = []
        self.val_texts = []
        self.idx_texts = []
        self.group = VGroup()

        for i, val in enumerate(values):
            sq = Square(side_length=box_size, color=color, fill_color="#0f172a", fill_opacity=0.85, stroke_width=2.5)
            num = Text(str(val), font_size=font_size, color=WHITE).move_to(sq.get_center())
            self.boxes.append(sq)
            self.val_texts.append(num)
            
            elem_grp = VGroup(sq, num)
            if show_indices:
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

    def create_pointer(self, idx, label, is_upper=False, color=YELLOW):
        target_box = self.boxes[idx]
        if is_upper:
            ptr = Arrow(UP*0.8, UP*0.1, color=color, stroke_width=3).next_to(target_box, UP, buff=0.35)
            lbl = Text(str(label), font_size=14, color=color).next_to(ptr, UP, buff=0.08)
        else:
            ptr = Arrow(DOWN*0.8, DOWN*0.1, color=color, stroke_width=3).next_to(target_box, DOWN, buff=0.15)
            lbl = Text(str(label), font_size=14, color=color).next_to(ptr, DOWN, buff=0.08)
        return VGroup(ptr, lbl)


class LinkedListVisualizer:
    """Deterministic Singly Linked List Node and Pointer visualizer."""
    def __init__(self, values, node_w=1.2, node_h=0.7, color=BLUE_B, **kwargs):
        self.nodes = []
        self.arrows = []
        self.group = VGroup()

        for i, val in enumerate(values):
            data_box = Rectangle(width=node_w*0.65, height=node_h, color=color, fill_color="#0f172a", fill_opacity=0.9, stroke_width=2)
            ptr_box = Rectangle(width=node_w*0.35, height=node_h, color=color, fill_color="#1e293b", fill_opacity=0.9, stroke_width=2).next_to(data_box, RIGHT, buff=0)
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

        null_txt = Text("NULL", font_size=16, color=GRAY_B).next_to(self.nodes[-1], RIGHT, buff=0.8)
        last_arr = Arrow(self.nodes[-1][2].get_center(), null_txt.get_left(), color=GRAY, buff=0.05, stroke_width=2)
        self.group.add(last_arr, null_txt)
        self.group.move_to(ORIGIN)
        LayoutManager.safe_scale(self.group)

    def get_group(self):
        return self.group


class TreeVisualizer:
    """Hierarchical Binary Tree visualizer with non-overlapping subtree coordinates."""
    def __init__(self, root_val=None, tree_dict=None, radius=0.35, level_h=1.2, **kwargs):
        self.nodes = {}
        self.edges = VGroup()
        self.node_group = VGroup()

        tree_data = tree_dict or (root_val if isinstance(root_val, dict) else {"root": root_val or 10})

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
                c = Circle(radius=radius, color=BLUE_B, fill_color="#0f172a", fill_opacity=1.0, stroke_width=2.5).move_to(pos)
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
    def __init__(self, positions_dict, edge_pairs, radius=0.38, **kwargs):
        self.positions = positions_dict
        self.nodes = {}
        self.node_group = VGroup()
        self.edges = VGroup()

        # Edges
        for u, v in edge_pairs:
            if u in positions_dict and v in positions_dict:
                line = Line(positions_dict[u], positions_dict[v], color="#334155", stroke_width=3)
                self.edges.add(line)

        # Nodes
        for name, pos in positions_dict.items():
            c = Circle(radius=radius, color=BLUE_B, fill_color="#0f172a", fill_opacity=1.0, stroke_width=2.5).move_to(pos)
            t = Text(str(name), font_size=18, color=WHITE).move_to(pos)
            node_mob = VGroup(c, t)
            self.nodes[name] = node_mob
            self.node_group.add(node_mob)

        self.group = VGroup(self.edges, self.node_group)
        LayoutManager.safe_scale(self.group)

    def get_group(self):
        return self.group

    def set_visited(self, name, color=GREEN):
        if name in self.nodes:
            return self.nodes[name][0].animate.set_fill(color, opacity=0.85).set_color(color)
        return FadeIn(VGroup())


class KinematicsVisualizer:
    """Deterministic Kinematics & Projectile Visualizer with attached vectors."""
    @staticmethod
    def create_canvas(x_max=10, y_max=6, x_len=8.5, y_len=4.5, **kwargs):
        axes = Axes(
            x_range=[0, x_max, 2],
            y_range=[0, y_max, 2],
            x_length=x_len,
            y_length=y_len,
            axis_config={"color": BLUE_D, "stroke_width": 2, "include_numbers": False},
        ).shift(LEFT * 0.5 + DOWN * 0.9)
        ground = Line(axes.c2p(-0.5, 0), axes.c2p(x_max+0.5, 0), color=GRAY_D, stroke_width=3)
        return axes, ground


class MoleculeVisualizer:
    """Deterministic particle & chemical bond visualizer."""
    @staticmethod
    def make_atom(symbol, color, radius=0.3, font_size=18, **kwargs):
        c = Circle(radius=radius, color=color, fill_color=color, fill_opacity=0.85, stroke_width=2)
        t = Text(str(symbol), font_size=font_size, color=WHITE).move_to(c.get_center())
        return VGroup(c, t)

    @staticmethod
    def make_bond(atom1, atom2, color=GRAY, stroke_width=2.5, **kwargs):
        return Line(atom1.get_center(), atom2.get_center(), color=color, stroke_width=stroke_width)


class CircuitVisualizer:
    """Deterministic Electric Circuit visualizer with voltage source and resistor."""
    @staticmethod
    def create_rc_circuit(voltage=12, resistance=4, current=None, width=6.0, height=3.2, **kwargs):
        w, h = width, height
        loop = Rectangle(width=w, height=h, color=BLUE_D, stroke_width=3)
        
        # Source on left
        v_src = Circle(radius=0.45, color=YELLOW, fill_color="#0f172a", fill_opacity=1.0, stroke_width=2.5).move_to(loop.get_left())
        v_lbl = Text(f"{voltage}V", font_size=16, color=YELLOW).move_to(v_src.get_center())
        v_group = VGroup(v_src, v_lbl)

        # Resistor on top
        r_box = Rectangle(width=1.4, height=0.5, color=GREEN_B, fill_color="#0f172a", fill_opacity=1.0, stroke_width=2.5).move_to(loop.get_top())
        r_lbl = Text(f"{resistance} Ω", font_size=16, color=GREEN_B).move_to(r_box.get_center())
        r_group = VGroup(r_box, r_lbl)

        # Current Arrow on right
        calc_i = current if current is not None else round(float(voltage) / float(resistance), 1)
        i_arrow = Arrow(loop.get_right() + UP*0.8, loop.get_right() + DOWN*0.8, color=ORANGE, stroke_width=3.5)
        i_lbl = Text(f"I = {calc_i}A", font_size=16, color=ORANGE).next_to(i_arrow, RIGHT, buff=0.15)
        i_group = VGroup(i_arrow, i_lbl)

        return VGroup(loop, v_group, r_group, i_group)


class MatrixVisualizer:
    """Deterministic Matrix Visualizer with row/column highlights."""
    @staticmethod
    def create_matrix(matrix_vals, font_size=20, cell_size=0.7, **kwargs):
        grp = VGroup()
        rows = len(matrix_vals)
        cols = len(matrix_vals[0])
        cells = []
        for r in range(rows):
            row_cells = []
            for c in range(cols):
                sq = Square(side_length=cell_size, color=BLUE_D, fill_color="#0f172a", fill_opacity=0.85, stroke_width=2)
                val = Text(str(matrix_vals[r][c]), font_size=font_size, color=WHITE).move_to(sq.get_center())
                cell = VGroup(sq, val)
                row_cells.append(cell)
            row_grp = VGroup(*row_cells).arrange(RIGHT, buff=0.05)
            cells.append(row_grp)
        grid = VGroup(*cells).arrange(DOWN, buff=0.05)
        brackets = SurroundingRectangle(grid, color=BLUE_B, buff=0.12, stroke_width=2)
        return VGroup(grid, brackets)


class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header
        header = LayoutManager.create_header("Merge Sort Algorithm", "Divide and Conquer in O(n log n) Time")
        self.play(FadeIn(header), run_time=1.2)

        # 2. Level 0: Original Unsorted Array [38, 27, 43, 3]
        arr_root = ArrayVisualizer([38, 27, 43, 3], box_size=0.75, font_size=22)
        arr_root.get_group().shift(UP * 1.8)
        lbl_div = Text("Level 0: Original Array", font_size=18, color=YELLOW).next_to(arr_root.get_group(), UP, buff=0.15)

        self.play(FadeIn(arr_root.get_group(), shift=DOWN*0.2), Write(lbl_div), run_time=1.5)
        self.wait(1.0)

        # Level 1: Split into Left [38, 27] and Right [43, 3]
        arr_l1_a = ArrayVisualizer([38, 27], box_size=0.65, font_size=18).get_group().shift(LEFT * 2.8 + UP * 0.4)
        arr_l1_b = ArrayVisualizer([43, 3], box_size=0.65, font_size=18).get_group().shift(RIGHT * 2.8 + UP * 0.4)

        split_a = Arrow(arr_root.get_group().get_bottom(), arr_l1_a.get_top(), color=GRAY_B, buff=0.15, stroke_width=2.5)
        split_b = Arrow(arr_root.get_group().get_bottom(), arr_l1_b.get_top(), color=GRAY_B, buff=0.15, stroke_width=2.5)

        status_split = LayoutManager.create_status_bar("Step 1: Divide array into two halves (n/2)", color=BLUE_B)
        self.play(GrowArrow(split_a), GrowArrow(split_b), FadeIn(arr_l1_a), FadeIn(arr_l1_b), Write(status_split), run_time=1.8)
        self.wait(1.0)

        # Level 2: Single Elements [38], [27], [43], [3]
        arr_e1 = ArrayVisualizer([38], box_size=0.55, font_size=16).get_group().shift(LEFT * 4.2 + DOWN * 0.8)
        arr_e2 = ArrayVisualizer([27], box_size=0.55, font_size=16).get_group().shift(LEFT * 1.4 + DOWN * 0.8)
        arr_e3 = ArrayVisualizer([43], box_size=0.55, font_size=16).get_group().shift(RIGHT * 1.4 + DOWN * 0.8)
        arr_e4 = ArrayVisualizer([3], box_size=0.55, font_size=16).get_group().shift(RIGHT * 4.2 + DOWN * 0.8)
        singles = VGroup(arr_e1, arr_e2, arr_e3, arr_e4)

        status_base = LayoutManager.create_status_bar("Step 2: Base case reached (single elements are trivially sorted)", color=ORANGE)
        self.play(FadeIn(singles, shift=DOWN*0.2), ReplacementTransform(status_split, status_base), run_time=1.8)
        self.wait(1.0)

        # Clear division tree for merging
        div_tree = VGroup(arr_root.get_group(), lbl_div, split_a, split_b, arr_l1_a, arr_l1_b, singles)
        self.play(FadeOut(div_tree), FadeOut(status_base), run_time=1.0)

        # 3. Two-Pointer Merging: [27, 38] + [3, 43] -> [3, 27, 38, 43]
        m_left = ArrayVisualizer([27, 38], box_size=0.75, color=GREEN_D, font_size=20)
        m_left.get_group().shift(LEFT * 3.0 + UP * 1.2)
        lbl_l = Text("Sorted Left", font_size=16, color=GREEN_B).next_to(m_left.get_group(), UP, buff=0.15)

        m_right = ArrayVisualizer([3, 43], box_size=0.75, color=BLUE_D, font_size=20)
        m_right.get_group().shift(RIGHT * 3.0 + UP * 1.2)
        lbl_r = Text("Sorted Right", font_size=16, color=BLUE_B).next_to(m_right.get_group(), UP, buff=0.15)

        status_merge = LayoutManager.create_status_bar("Step 3: Compare 27 vs 3 -> 3 is smaller -> place in merged array", color=YELLOW)
        self.play(FadeIn(m_left.get_group()), Write(lbl_l), FadeIn(m_right.get_group()), Write(lbl_r), Write(status_merge), run_time=1.5)

        # Final Sorted Array in Center
        final_arr = ArrayVisualizer([3, 27, 38, 43], box_size=0.85, color=YELLOW_D, font_size=22)
        final_arr.get_group().shift(DOWN * 0.9)

        for elem in final_arr.get_group():
            self.play(FadeIn(elem, scale=1.2), run_time=0.4)

        success_box = SurroundingRectangle(final_arr.get_group(), color=GREEN, buff=0.15, stroke_width=2.5)
        status_done = LayoutManager.create_status_bar("✓ Merged Result: [3, 27, 38, 43] in O(n log n) Time", color=GREEN)

        self.play(Create(success_box), ReplacementTransform(status_merge, status_done), run_time=1.5)
        self.play(Circumscribe(final_arr.get_group(), color=YELLOW), run_time=1.8)
        self.wait(2.0)