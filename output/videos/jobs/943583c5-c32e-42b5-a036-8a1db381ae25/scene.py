from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Scene 1: Introduction to Graph and DFS
        title = Text("Depth-First Search (DFS)", font_size=36, color=YELLOW)
        subtitle = Text("A graph traversal algorithm", font_size=20, color=BLUE_B)
        title.shift(3.25 * UP)
        subtitle.shift(3.0 * UP)
        self.play(FadeIn(title), FadeIn(subtitle))
        self.wait(0.5)

        graph = VGroup()
        nodes = VGroup(
            Circle(radius=0.5, color=WHITE, fill_opacity=0.5).shift(2 * LEFT),
            Circle(radius=0.5, color=WHITE, fill_opacity=0.5).shift(2 * RIGHT),
            Circle(radius=0.5, color=WHITE, fill_opacity=0.5).shift(2 * UP),
            Circle(radius=0.5, color=WHITE, fill_opacity=0.5).shift(2 * DOWN)
        )
        edges = VGroup(
            Line(nodes[0].get_center(), nodes[1].get_center(), color=WHITE),
            Line(nodes[0].get_center(), nodes[2].get_center(), color=WHITE),
            Line(nodes[0].get_center(), nodes[3].get_center(), color=WHITE),
            Line(nodes[1].get_center(), nodes[2].get_center(), color=WHITE),
            Line(nodes[1].get_center(), nodes[3].get_center(), color=WHITE),
            Line(nodes[2].get_center(), nodes[3].get_center(), color=WHITE)
        )
        graph.add(nodes, edges)
        graph.shift(0.5 * DOWN)
        self.play(Create(graph))
        self.wait(2.4)

        # Scene 2: Visualizing DFS Traversal
        self.play(FadeOut(title), FadeOut(subtitle))
        self.wait(0.5)

        dfs_nodes = nodes.copy()
        dfs_edges = edges.copy()
        dfs_nodes.set_color(YELLOW)
        dfs_edges.set_color(YELLOW)
        self.play(ReplacementTransform(nodes, dfs_nodes), ReplacementTransform(edges, dfs_edges))
        self.wait(1.5)

        visited_nodes = VGroup()
        visited_edges = VGroup()
        visited_nodes.add(dfs_nodes[0])
        visited_edges.add(dfs_edges[0])
        self.play(FadeToColor(visited_nodes, color=GREEN), FadeToColor(visited_edges, color=GREEN))
        self.wait(1.1)

        visited_nodes.add(dfs_nodes[1])
        visited_edges.add(dfs_edges[1])
        self.play(FadeToColor(visited_nodes, color=GREEN), FadeToColor(visited_edges, color=GREEN))
        self.wait(1.5)

        # Scene 3: Illustrating Backtracking in DFS
        self.play(FadeToColor(visited_nodes, color=YELLOW), FadeToColor(visited_edges, color=YELLOW))
        self.wait(0.5)

        backtracked_nodes = VGroup()
        backtracked_edges = VGroup()
        backtracked_nodes.add(dfs_nodes[0])
        backtracked_edges.add(dfs_edges[0])
        self.play(FadeToColor(backtracked_nodes, color=RED), FadeToColor(backtracked_edges, color=RED))
        self.wait(1.2)

        backtracked_nodes.add(dfs_nodes[2])
        backtracked_edges.add(dfs_edges[2])
        self.play(FadeToColor(backtracked_nodes, color=RED), FadeToColor(backtracked_edges, color=RED))
        self.wait(1.2)

        # Scene 4: Conclusion and Summary
        self.play(FadeToColor(backtracked_nodes, color=YELLOW), FadeToColor(backtracked_edges, color=YELLOW))
        self.wait(0.5)

        conclusion = Text("DFS is a fundamental algorithm for searching and traversing graphs.", font_size=20, color=BLUE_B)
        conclusion.shift(3.0 * UP)
        self.play(FadeIn(conclusion))
        self.wait(2.5)

        self.play(FadeOut(conclusion), FadeOut(graph))
        self.wait(1)