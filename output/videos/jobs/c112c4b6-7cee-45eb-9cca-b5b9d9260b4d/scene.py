from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Scene 1
        title = Text("Dijkstra's Algorithm", font_size=36, color=YELLOW)
        subtitle = Text("Finding the Shortest Path in a Graph", font_size=20, color=BLUE)
        title.shift(3 * UP)
        subtitle.shift(3 * UP + 0.5 * DOWN)
        self.play(Create(title), Create(subtitle))
        self.wait(2)
        graph = VGroup(
            Circle(radius=0.5, color=WHITE).shift(2 * LEFT),
            Circle(radius=0.5, color=WHITE).shift(2 * RIGHT),
            Line(start=2 * LEFT, end=2 * RIGHT, color=WHITE)
        )
        self.play(Create(graph))
        self.wait(4)
        self.play(FadeOut(title), FadeOut(subtitle), FadeOut(graph))
        self.wait(0.7)

        # Scene 2
        graph = VGroup(
            Circle(radius=0.5, color=WHITE).shift(2 * LEFT),
            Circle(radius=0.5, color=WHITE).shift(2 * RIGHT),
            Line(start=2 * LEFT, end=2 * RIGHT, color=WHITE)
        )
        source_node = Circle(radius=0.5, color=YELLOW).shift(2 * LEFT)
        priority_queue = Rectangle(width=2, height=1, color=BLUE).shift(2 * DOWN)
        distance_labels = VGroup(
            Text("0", font_size=20, color=WHITE).shift(2 * LEFT + 0.5 * DOWN),
            Text("3", font_size=20, color=WHITE).shift(2 * RIGHT + 0.5 * DOWN)
        )
        self.play(Create(graph), Create(source_node), Create(priority_queue), Create(distance_labels))
        self.wait(4)
        self.play(ReplacementTransform(distance_labels, VGroup(
            Text("0", font_size=20, color=WHITE).shift(2 * LEFT + 0.5 * DOWN),
            Text("2", font_size=20, color=WHITE).shift(2 * RIGHT + 0.5 * DOWN)
        )))
        self.wait(4)
        self.play(FadeOut(graph), FadeOut(source_node), FadeOut(priority_queue), FadeOut(distance_labels))
        self.wait(0.7)

        # Scene 3
        graph = VGroup(
            Circle(radius=0.5, color=WHITE).shift(2 * LEFT),
            Circle(radius=0.5, color=WHITE).shift(2 * RIGHT),
            Line(start=2 * LEFT, end=2 * RIGHT, color=WHITE)
        )
        source_node = Circle(radius=0.5, color=YELLOW).shift(2 * LEFT)
        self.play(Create(graph), Create(source_node))
        self.wait(2)
        self.play(MoveAlongPath(source_node, Line(start=2 * LEFT, end=2 * RIGHT, color=YELLOW)))
        self.wait(2)
        self.play(FadeOut(graph), FadeOut(source_node))
        self.wait(0.7)

        # Scene 4
        graph = VGroup(
            Circle(radius=0.5, color=WHITE).shift(2 * LEFT),
            Circle(radius=0.5, color=WHITE).shift(2 * RIGHT),
            Line(start=2 * LEFT, end=2 * RIGHT, color=WHITE)
        )
        source_node = Circle(radius=0.5, color=YELLOW).shift(2 * LEFT)
        target_node = Circle(radius=0.5, color=RED).shift(2 * RIGHT)
        self.play(Create(graph), Create(source_node), Create(target_node))
        self.wait(2)
        self.play(MoveAlongPath(source_node, Line(start=2 * LEFT, end=2 * RIGHT, color=YELLOW)))
        self.wait(2)
        self.play(FadeOut(graph), FadeOut(source_node), FadeOut(target_node))
        self.wait(0.7)

        # Scene 5
        title = Text("Dijkstra's Algorithm", font_size=36, color=YELLOW)
        subtitle = Text("Finding the Shortest Path in a Graph", font_size=20, color=BLUE)
        title.shift(3 * UP)
        subtitle.shift(3 * UP + 0.5 * DOWN)
        graph = VGroup(
            Circle(radius=0.5, color=WHITE).shift(2 * LEFT),
            Circle(radius=0.5, color=WHITE).shift(2 * RIGHT),
            Line(start=2 * LEFT, end=2 * RIGHT, color=YELLOW)
        )
        self.play(Create(title), Create(subtitle), Create(graph))
        self.wait(4)
        self.play(FadeOut(title), FadeOut(subtitle), FadeOut(graph))
        self.wait(0.7)