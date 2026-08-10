from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header
        title = Text("Merge Sort Algorithm", font_size=38, color=BLUE_B).to_edge(UP, buff=0.35)
        subtitle = Text("Divide and Conquer in O(n log n) Time", font_size=20, color=GRAY_B).next_to(title, DOWN, buff=0.12)
        self.play(Write(title), FadeIn(subtitle), run_time=1.5)

        # Helper to create array box group
        def make_array_group(values, box_size=0.6, font_size=18, color=BLUE_D):
            grp = VGroup()
            for val in values:
                sq = Square(side_length=box_size, color=color, fill_color="#0f172a", fill_opacity=0.85, stroke_width=2)
                num = Text(str(val), font_size=font_size, color=WHITE).move_to(sq.get_center())
                grp.add(VGroup(sq, num))
            grp.arrange(RIGHT, buff=0.06)
            return grp

        # Level 0: Root Array
        root_vals = [8, 3, 5, 1, 4, 7, 2, 6]
        arr_root = make_array_group(root_vals, 0.65, 20).shift(UP * 2.0)
        lbl_div = Text("Level 0: Original Unsorted Array", font_size=18, color=YELLOW).next_to(arr_root, UP, buff=0.2)

        self.play(FadeIn(arr_root, shift=DOWN*0.3), Write(lbl_div), run_time=1.5)
        self.wait(1.0)

        # Level 1: Split into Left and Right halves
        arr_l1_a = make_array_group(root_vals[:4], 0.55, 16).shift(LEFT * 3.2 + UP * 0.7)
        arr_l1_b = make_array_group(root_vals[4:], 0.55, 16).shift(RIGHT * 3.2 + UP * 0.7)

        split_arrow_1a = Arrow(arr_root.get_bottom(), arr_l1_a.get_top(), color=GRAY_B, buff=0.15, stroke_width=2.5)
        split_arrow_1b = Arrow(arr_root.get_bottom(), arr_l1_b.get_top(), color=GRAY_B, buff=0.15, stroke_width=2.5)

        lbl_step1 = Text("Step 1: Divide into two halves (n/2)", font_size=18, color=BLUE_B).to_edge(DOWN, buff=0.4)
        self.play(
            GrowArrow(split_arrow_1a), GrowArrow(split_arrow_1b),
            FadeIn(arr_l1_a), FadeIn(arr_l1_b),
            Write(lbl_step1),
            run_time=2.0
        )
        self.wait(1.2)

        # Level 2: Recursive split into pairs
        arr_l2_1 = make_array_group([8, 3], 0.45, 14).shift(LEFT * 4.8 + DOWN * 0.5)
        arr_l2_2 = make_array_group([5, 1], 0.45, 14).shift(LEFT * 1.6 + DOWN * 0.5)
        arr_l2_3 = make_array_group([4, 7], 0.45, 14).shift(RIGHT * 1.6 + DOWN * 0.5)
        arr_l2_4 = make_array_group([2, 6], 0.45, 14).shift(RIGHT * 4.8 + DOWN * 0.5)

        arr2_group = VGroup(arr_l2_1, arr_l2_2, arr_l2_3, arr_l2_4)

        lbl_step2 = Text("Step 2: Recursively divide until single elements", font_size=18, color=ORANGE).to_edge(DOWN, buff=0.4)
        self.play(
            FadeIn(arr2_group, shift=DOWN*0.2),
            ReplacementTransform(lbl_step1, lbl_step2),
            run_time=2.0
        )
        self.wait(1.2)

        # Clear division tree for merging animation
        div_tree = VGroup(arr_root, lbl_div, split_arrow_1a, split_arrow_1b, arr_l1_a, arr_l1_b, arr2_group)
        self.play(FadeOut(div_tree), FadeOut(lbl_step2), run_time=1.2)

        # Merging Phase: Show merging of [1, 3, 5, 8] and [2, 4, 6, 7]
        m_left_vals = [1, 3, 5, 8]
        m_right_vals = [2, 4, 6, 7]

        m_left = make_array_group(m_left_vals, 0.65, 20, color=GREEN_D).shift(LEFT * 3.5 + UP * 1.2)
        m_right = make_array_group(m_right_vals, 0.65, 20, color=BLUE_D).shift(RIGHT * 3.5 + UP * 1.2)

        lbl_left = Text("Sorted Left Half", font_size=18, color=GREEN_B).next_to(m_left, UP, buff=0.2)
        lbl_right = Text("Sorted Right Half", font_size=18, color=BLUE_B).next_to(m_right, UP, buff=0.2)

        lbl_merge = Text("Step 3: Two-Pointer Merge into Sorted Array", font_size=20, color=YELLOW).to_edge(DOWN, buff=0.5)

        self.play(FadeIn(m_left), Write(lbl_left), FadeIn(m_right), Write(lbl_right), Write(lbl_merge), run_time=1.8)

        # Final Sorted Array in Center
        sorted_vals = [1, 2, 3, 4, 5, 6, 7, 8]
        final_arr = make_array_group(sorted_vals, 0.7, 22, color=YELLOW_D).shift(DOWN * 1.2)

        for i, b in enumerate(final_arr):
            self.play(FadeIn(b, scale=1.2), run_time=0.45)

        final_box = SurroundingRectangle(final_arr, color=GREEN, buff=0.15, stroke_width=2.5)
        success_lbl = Text("✓ Merged Result: Perfectly Sorted Array in O(n log n)", font_size=22, color=GREEN).to_edge(DOWN, buff=0.4)

        self.play(Create(final_box), ReplacementTransform(lbl_merge, success_lbl), run_time=1.8)
        self.play(Circumscribe(final_arr, color=YELLOW), run_time=2.0)
        self.wait(2.5)
