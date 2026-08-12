from manim import *
import numpy as np
import math

from manim import *
import numpy as np


class LayoutManager:
    @staticmethod
    def create_header(title: str, subtitle: str) -> VGroup:
        title_text = Text(title, font_size=36, weight=BOLD).to_edge(UP)
        subtitle_text = Text(subtitle, font_size=24).next_to(title_text, DOWN)
        return VGroup(title_text, subtitle_text)


class SearchingVisualizer(VGroup):
    def __init__(self, array_vals, **kwargs):
        super().__init__(**kwargs)
        self.elements = []
        spacing = 1.2
        for i, val in enumerate(array_vals):
            rect = Square(side_length=0.8, fill_color=BLUE_D, fill_opacity=0.6, stroke_color=WHITE)
            rect.move_to(np.array([i * spacing, 0, 0]))
            label = Text(str(val), font_size=24, color=WHITE).move_to(rect.get_center())
            self.add(rect, label)
            self.elements.append(rect)


class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Helper method to clear stage while preserving certain mobjects
        def clear_stage(preserve=None):
            if preserve is not None:
                to_remove = [m for m in self.mobjects if m not in preserve]
                self.remove(*to_remove)
            else:
                self.clear()

        # ----- Common Header -----
        header = LayoutManager.create_header("Binary Search", "Algorithm Visualization")
        self.play(FadeIn(header), run_time=1.0)

        # ==================== Scene 1 ==================== (9.5 s)
        array_vals = [3, 8, 12, 17, 23, 31, 42]
        visualizer = SearchingVisualizer(array_vals)
        self.play(Create(visualizer), run_time=2.0)

        # Create pointers (LOW, MID, HIGH)
        low_ptr = Triangle().scale(0.2).set_color(RED)
        mid_ptr = Triangle().scale(0.2).set_color(ORANGE)
        high_ptr = Triangle().scale(0.2).set_color(PURPLE)

        # Position pointers under respective elements
        low_ptr.move_to(visualizer.elements[0].get_bottom() + np.array([0, -0.4, 0]))
        mid_ptr.move_to(visualizer.elements[3].get_bottom() + np.array([0, -0.4, 0]))
        high_ptr.move_to(visualizer.elements[6].get_bottom() + np.array([0, -0.4, 0]))

        # Labels for pointers
        low_label = Text("LOW", color=RED, font_size=24).next_to(low_ptr, DOWN)
        mid_label = Text("MID", color=ORANGE, font_size=24).next_to(mid_ptr, DOWN)
        high_label = Text("HIGH", color=PURPLE, font_size=24).next_to(high_ptr, DOWN)

        # Show pointers and labels
        self.play(FadeIn(VGroup(low_ptr, low_label, mid_ptr, mid_label, high_ptr, high_label)), run_time=1.5)

        # Show target card
        target_card = Text("Target: 23", color=YELLOW, font_size=28).to_edge(UP)
        self.play(FadeIn(target_card), run_time=1.0)

        # Hold for narration
        self.wait(4.0)   # 1.0 + 2.0 + 1.5 + 1.0 + 4.0 = 9.5 s

        # ==================== Scene 2 ==================== (11.5 s)
        clear_stage(preserve=header)

        # Re‑create visualizer for fresh start
        visualizer2 = SearchingVisualizer(array_vals)
        self.play(Create(visualizer2), run_time=2.0)

        # Re‑create pointers at initial positions
        low_ptr2 = Triangle().scale(0.2).set_color(RED)
        mid_ptr2 = Triangle().scale(0.2).set_color(ORANGE)
        high_ptr2 = Triangle().scale(0.2).set_color(PURPLE)

        low_ptr2.move_to(visualizer2.elements[0].get_bottom() + np.array([0, -0.4, 0]))
        mid_ptr2.move_to(visualizer2.elements[3].get_bottom() + np.array([0, -0.4, 0]))
        high_ptr2.move_to(visualizer2.elements[6].get_bottom() + np.array([0, -0.4, 0]))

        low_label2 = Text("LOW", color=RED, font_size=24).next_to(low_ptr2, DOWN)
        mid_label2 = Text("MID", color=ORANGE, font_size=24).next_to(mid_ptr2, DOWN)
        high_label2 = Text("HIGH", color=PURPLE, font_size=24).next_to(high_ptr2, DOWN)

        self.play(FadeIn(VGroup(low_ptr2, low_label2, mid_ptr2, mid_label2, high_ptr2, high_label2)), run_time=1.0)

        # Show target card again
        target_card2 = Text("Target: 23", color=YELLOW, font_size=28).to_edge(UP)
        self.play(FadeIn(target_card2), run_time=0.8)

        # First iteration: LOW moves from 0 → 4
        new_low_pos = visualizer2.elements[4].get_bottom() + np.array([0, -0.4, 0])
        self.play(
            low_ptr2.animate.move_to(new_low_pos),
            low_label2.animate.move_to(new_low_pos + np.array([0, -0.3, 0])),
            run_time=1.0,
        )

        # MID moves from 3 → 5 (value 31)
        new_mid_pos = visualizer2.elements[5].get_bottom() + np.array([0, -0.4, 0])
        self.play(
            mid_ptr2.animate.move_to(new_mid_pos),
            mid_label2.animate.move_to(new_mid_pos + np.array([0, -0.3, 0])),
            run_time=1.0,
        )

        # HIGH moves from 6 → 4
        new_high_pos = visualizer2.elements[4].get_bottom() + np.array([0, -0.4, 0])
        self.play(
            high_ptr2.animate.move_to(new_high_pos),
            high_label2.animate.move_to(new_high_pos + np.array([0, -0.3, 0])),
            run_time=1.0,
        )

        # Dim elements outside new range (indices 0‑3)
        dim_group = VGroup(*visualizer2.elements[:4])
        self.play(dim_group.animate.set_opacity(0.2), run_time=0.8)

        # Hold for narration
        self.wait(4.7)   # 2.0+1.0+0.8+1.0+1.0+1.0+0.8+4.7 = 11.5 s

        # ==================== Scene 3 ==================== (9.7 s)
        clear_stage(preserve=header)

        # Re‑create visualizer for final scene
        visualizer3 = SearchingVisualizer(array_vals)
        self.play(Create(visualizer3), run_time=2.0)

        # Pointers all at index 4
        low_ptr3 = Triangle().scale(0.2).set_color(RED)
        mid_ptr3 = Triangle().scale(0.2).set_color(ORANGE)
        high_ptr3 = Triangle().scale(0.2).set_color(PURPLE)

        base_pos = visualizer3.elements[4].get_bottom() + np.array([0, -0.4, 0])
        low_ptr3.move_to(base_pos)
        mid_ptr3.move_to(base_pos)
        high_ptr3.move_to(base_pos)

        low_label3 = Text("LOW", color=RED, font_size=24).next_to(low_ptr3, DOWN)
        mid_label3 = Text("MID", color=ORANGE, font_size=24).next_to(mid_ptr3, DOWN)
        high_label3 = Text("HIGH", color=PURPLE, font_size=24).next_to(high_ptr3, DOWN)

        self.play(FadeIn(VGroup(low_ptr3, low_label3, mid_ptr3, mid_label3, high_ptr3, high_label3)), run_time=1.0)

        # Show target card again
        target_card3 = Text("Target: 23", color=YELLOW, font_size=28).to_edge(UP)
        self.play(FadeIn(target_card3), run_time=0.8)

        # Highlight the found element (index 4)
        highlight_box = SurroundingRectangle(visualizer3.elements[4], color=GREEN, buff=0.1)
        self.play(Create(highlight_box), run_time=1.0)

        # Result text
        result_text = Text("FOUND at idx 4", color=GREEN, font_size=30).next_to(target_card3, DOWN, buff=0.5)
        self.play(FadeIn(result_text), run_time=1.0)

        # Hold for final narration
        self.wait(3.9)   # 2.0+1.0+0.8+1.0+1.0+3.9 = 9.7 s