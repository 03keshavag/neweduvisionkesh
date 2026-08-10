from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Scene 1
        intro_text = Text("Sorting and Merge Sort", font_size=36, color=YELLOW)
        self.play(Create(intro_text), run_time=2)
        self.wait(1)
        list_text = Text("Unsorted List: [5, 2, 8, 3, 1, 6, 4]", font_size=24, color=BLUE_B)
        self.play(Write(list_text), run_time=2)
        self.wait(1)
        divide_text = Text("Divide into two halves", font_size=24, color=GREEN)
        self.play(Write(divide_text), run_time=2)
        self.wait(2)
        self.play(FadeOut(intro_text), FadeOut(list_text), FadeOut(divide_text), run_time=2)
        self.wait(2)

        # Scene 2
        list_rect = Rectangle(width=6, height=1, color=BLUE_B)
        self.play(Create(list_rect), run_time=1)
        self.wait(1)
        divide_arrow = Arrow(start=list_rect.get_left(), end=list_rect.get_right(), color=GREEN)
        self.play(GrowArrow(divide_arrow), run_time=1)
        self.wait(1)
        left_rect = Rectangle(width=3, height=1, color=BLUE_B).shift(LEFT * 1.5)
        right_rect = Rectangle(width=3, height=1, color=BLUE_B).shift(RIGHT * 1.5)
        self.play(ReplacementTransform(list_rect, left_rect), ReplacementTransform(list_rect.copy(), right_rect), run_time=2)
        self.wait(2)
        self.play(FadeOut(left_rect), FadeOut(right_rect), FadeOut(divide_arrow), run_time=2)
        self.wait(2)

        # Scene 3
        left_rect = Rectangle(width=1, height=1, color=BLUE_B).shift(LEFT * 2)
        right_rect = Rectangle(width=1, height=1, color=BLUE_B).shift(RIGHT * 2)
        self.play(Create(left_rect), Create(right_rect), run_time=1)
        self.wait(1)
        comparison_text = Text("Compare and Merge", font_size=24, color=YELLOW)
        self.play(Write(comparison_text), run_time=1)
        self.wait(1)
        merged_rect = Rectangle(width=2, height=1, color=GREEN).shift(LEFT * 1)
        self.play(ReplacementTransform(left_rect, merged_rect), ReplacementTransform(right_rect, merged_rect), run_time=2)
        self.wait(2)
        self.play(FadeOut(merged_rect), FadeOut(comparison_text), run_time=2)
        self.wait(2)

        # Scene 4
        example_text = Text("Example: [5, 2, 8, 3, 1, 6, 4]", font_size=24, color=BLUE_B)
        self.play(Write(example_text), run_time=2)
        self.wait(1)
        list_rect = Rectangle(width=6, height=1, color=BLUE_B)
        self.play(Create(list_rect), run_time=1)
        self.wait(1)
        divide_arrow = Arrow(start=list_rect.get_left(), end=list_rect.get_right(), color=GREEN)
        self.play(GrowArrow(divide_arrow), run_time=1)
        self.wait(1)
        left_rect = Rectangle(width=3, height=1, color=BLUE_B).shift(LEFT * 1.5)
        right_rect = Rectangle(width=3, height=1, color=BLUE_B).shift(RIGHT * 1.5)
        self.play(ReplacementTransform(list_rect, left_rect), ReplacementTransform(list_rect.copy(), right_rect), run_time=2)
        self.wait(2)
        sorted_text = Text("Sorted List: [1, 2, 3, 4, 5, 6, 8]", font_size=24, color=YELLOW)
        self.play(Write(sorted_text), run_time=2)
        self.wait(3)
        self.play(FadeOut(example_text), FadeOut(left_rect), FadeOut(right_rect), FadeOut(divide_arrow), FadeOut(sorted_text), run_time=2)
        self.wait(2)