from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Title
        title = Text("Binary Search Algorithm", font_size=38, color=BLUE_B).to_edge(UP, buff=0.35)
        subtitle = Text("Divide and Conquer in O(log n) Time", font_size=20, color=GRAY_B).next_to(title, DOWN, buff=0.12)
        self.play(Write(title), FadeIn(subtitle), run_time=1.5)

        # 2. Sorted Array of 9 numbers
        values = [2, 5, 8, 12, 16, 23, 38, 56, 72]
        target = 23
        target_card = Text(f"Target: {target}", color=YELLOW, font_size=24).to_edge(LEFT, buff=0.8).shift(UP * 1.5)
        self.play(Write(target_card), run_time=1.0)

        boxes = VGroup()
        for i, val in enumerate(values):
            sq = Square(side_length=0.9, color=BLUE_D, fill_color="#0f172a", fill_opacity=0.85, stroke_width=2)
            num = Text(str(val), font_size=22, color=WHITE).move_to(sq.get_center())
            idx = Text(str(i), font_size=14, color=GRAY).next_to(sq, UP, buff=0.12)
            boxes.add(VGroup(sq, num, idx))

        boxes.arrange(RIGHT, buff=0.1).shift(DOWN * 0.4)
        self.play(LaggedStart(*[FadeIn(b, shift=DOWN*0.3) for b in boxes], lag_ratio=0.08), run_time=1.8)
        self.wait(1.0)

        # 3. Pointer Lanes: LOW/HIGH at y-0.65, MID at y+0.75
        low_ptr = Arrow(DOWN*0.9, DOWN*0.1, color=GREEN, stroke_width=3).next_to(boxes[0][0], DOWN, buff=0.15)
        low_lbl = Text("LOW", font_size=14, color=GREEN).next_to(low_ptr, DOWN, buff=0.08)

        high_ptr = Arrow(DOWN*0.9, DOWN*0.1, color=RED, stroke_width=3).next_to(boxes[8][0], DOWN, buff=0.15)
        high_lbl = Text("HIGH", font_size=14, color=RED).next_to(high_ptr, DOWN, buff=0.08)

        mid_ptr = Arrow(UP*0.9, UP*0.1, color=YELLOW, stroke_width=3).next_to(boxes[4][0], UP, buff=0.4)
        mid_lbl = Text("MID (idx 4)", font_size=14, color=YELLOW).next_to(mid_ptr, UP, buff=0.08)

        step_info = Text("Step 1: Check Mid = 16 < 23. Target is in right half!", font_size=20, color=BLUE_B).to_edge(DOWN, buff=0.5)

        self.play(Create(low_ptr), Write(low_lbl), Create(high_ptr), Write(high_lbl), run_time=1.5)
        self.play(Create(mid_ptr), Write(mid_lbl), Write(step_info), run_time=1.5)
        self.play(Indicate(boxes[4][0], color=YELLOW), run_time=1.5)
        self.wait(1.2)

        # 4. Eliminate left half (indices 0..4)
        dim_anims = [boxes[i].animate.set_opacity(0.25) for i in range(5)]
        step_info2 = Text("Step 2: Eliminate left half. Set LOW = MID + 1 = 5", font_size=20, color=ORANGE).to_edge(DOWN, buff=0.5)

        self.play(
            *dim_anims,
            low_ptr.animate.next_to(boxes[5][0], DOWN, buff=0.15),
            low_lbl.animate.next_to(boxes[5][0], DOWN, buff=0.55),
            ReplacementTransform(step_info, step_info2),
            run_time=1.8
        )
        self.wait(1.2)

        # 5. Step 2: LOW=5, HIGH=8, MID=6 (Val=38)
        self.play(
            mid_ptr.animate.next_to(boxes[6][0], UP, buff=0.4),
            mid_lbl.animate.next_to(boxes[6][0], UP, buff=0.8).set_text("MID (idx 6)"),
            run_time=1.5
        )
        step_info3 = Text("Step 3: Check Mid = 38 > 23. Target is in left subarray!", font_size=20, color=YELLOW).to_edge(DOWN, buff=0.5)
        self.play(Indicate(boxes[6][0], color=YELLOW), ReplacementTransform(step_info2, step_info3), run_time=1.5)
        self.wait(1.2)

        # Eliminate 6..8
        dim_anims2 = [boxes[i].animate.set_opacity(0.25) for i in range(6, 9)]
        step_info4 = Text("Step 4: Set HIGH = MID - 1 = 5. Now LOW = HIGH = 5, MID = 5", font_size=20, color=GREEN_B).to_edge(DOWN, buff=0.5)
        self.play(
            *dim_anims2,
            high_ptr.animate.next_to(boxes[5][0], DOWN, buff=0.15),
            high_lbl.animate.next_to(boxes[5][0], DOWN, buff=0.55),
            mid_ptr.animate.next_to(boxes[5][0], UP, buff=0.4),
            mid_lbl.animate.next_to(boxes[5][0], UP, buff=0.8),
            ReplacementTransform(step_info3, step_info4),
            run_time=1.8
        )
        self.wait(1.0)

        # Target Found!
        found_box = SurroundingRectangle(boxes[5], color=GREEN, buff=0.12, stroke_width=3)
        success_text = Text(f"✓ Found target {target} at index 5 in only 3 comparisons!", font_size=22, color=GREEN).to_edge(DOWN, buff=0.4)
        self.play(Create(found_box), ReplacementTransform(step_info4, success_text), run_time=1.5)
        self.play(Indicate(boxes[5][1], scale_factor=1.4, color=GREEN), run_time=1.8)
        self.wait(2.5)
