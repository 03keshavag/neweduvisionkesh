from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Scene 1: Setup & Frame of Reference
        axes = Axes(
            x_range=[0, 4, 1],
            y_range=[0, 16, 4],
            x_length=8,
            y_length=6,
            axis_config={"include_tip": False},
        )
        func_graph = axes.plot(lambda x: x**2, x_range=[0, 4], color=BLUE)
        area = axes.get_area(func_graph, x_range=[0, 4], color=BLUE, opacity=0.5)
        self.play(Create(axes), Create(func_graph), Create(area))
        self.wait(1.5)
        title = Text("Integration: Accumulation of Area", font_size=36, color=YELLOW).to_edge(UP)
        subtitle = Text("Under Curves", font_size=20, color=YELLOW).next_to(title, DOWN)
        self.play(Write(title), Write(subtitle))
        self.wait(1.4)

        # Scene 2: Breaking Down the Area
        rect_group = VGroup()
        for i in range(4):
            rect = Rectangle(
                width=1,
                height=axes.c2p(i + 1, (i + 1)**2)[1] - axes.c2p(i, 0)[1],
                color=RED,
                fill_opacity=0.5,
            ).move_to(axes.c2p(i + 0.5, (i + 0.5)**2 / 2), UP)
            rect_group.add(rect)
        self.play(FadeIn(rect_group))
        self.wait(1.5)
        self.play(FadeOut(title), FadeOut(subtitle))
        self.wait(2.5)

        # Scene 3: Increasing Precision
        rect_group2 = VGroup()
        for i in range(8):
            rect = Rectangle(
                width=0.5,
                height=axes.c2p(i / 2 + 0.25, ((i / 2) + 0.25)**2)[1] - axes.c2p(i / 2, 0)[1],
                color=RED,
                fill_opacity=0.5,
            ).move_to(axes.c2p(i / 2 + 0.25, ((i / 2) + 0.25)**2 / 2), UP)
            rect_group2.add(rect)
        self.play(ReplacementTransform(rect_group, rect_group2))
        self.wait(1.5)
        self.play(FadeOut(rect_group2))
        self.wait(2)

        # Scene 4: Introduction to Integral Notation
        integral_notation = Text("∫x^2 dx", font_size=36, color=YELLOW).next_to(axes, RIGHT)
        self.play(Write(integral_notation))
        self.wait(1.7)