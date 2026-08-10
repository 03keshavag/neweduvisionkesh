from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Scene 1: Introduction to Graph and BFS
        graph = VGroup(
            Circle(radius=0.5, color=WHITE).shift(LEFT * 3),
            Circle(radius=0.5, color=WHITE).shift(UP * 2),
            Circle(radius=0.5, color=WHITE).shift(RIGHT * 3),
            Circle(radius=0.5, color=WHITE).shift(DOWN * 2),
            Line(LEFT * 3, UP * 2, color=WHITE),
            Line(UP * 2, RIGHT * 3, color=WHITE),
            Line(RIGHT * 3, DOWN * 2, color=WHITE),
            Line(DOWN * 2, LEFT * 3, color=WHITE)
        )
        start_node = Circle(radius=0.5, color=YELLOW).shift(LEFT * 3)
        self.play(Create(graph), Create(start_node), run_time=3.8)

        # Scene 2: Queue Initialization and Node Exploration
        queue = Rectangle(width=4, height=0.5, color=BLUE).shift(DOWN * 2)
        queue_text = Text("Queue", font_size=20, color=WHITE).next_to(queue, UP * 0.2)
        node_text = Text("Node 1", font_size=20, color=WHITE).next_to(queue, DOWN * 0.2)
        self.play(Create(queue), Write(queue_text), Write(node_text), run_time=3.8)

        # Scene 3: BFS Traversal and Visited Nodes
        visited_nodes = VGroup(
            Circle(radius=0.5, color=GREEN).shift(LEFT * 3),
            Circle(radius=0.5, color=GREEN).shift(UP * 2),
            Circle(radius=0.5, color=GREEN).shift(RIGHT * 3),
            Circle(radius=0.5, color=GREEN).shift(DOWN * 2)
        )
        traversal_order = Text("1, 2, 3, 4", font_size=20, color=WHITE).shift(DOWN * 3)
        self.play(ReplacementTransform(start_node, visited_nodes[0]), Write(traversal_order), run_time=3.6)

        # Scene 4: Conclusion and BFS Application
        web_crawler = Rectangle(width=4, height=1, color=BLUE).shift(UP * 2)
        web_crawler_text = Text("Web Crawler", font_size=20, color=WHITE).next_to(web_crawler, UP * 0.2)
        social_network = Rectangle(width=4, height=1, color=BLUE).shift(DOWN * 2)
        social_network_text = Text("Social Network", font_size=20, color=WHITE).next_to(social_network, UP * 0.2)
        self.play(FadeIn(web_crawler), Write(web_crawler_text), FadeIn(social_network), Write(social_network_text), run_time=5.6)