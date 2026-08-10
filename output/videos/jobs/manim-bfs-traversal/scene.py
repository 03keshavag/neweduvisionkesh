from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header
        title = Text("Breadth-First Search (BFS) Traversal", font_size=36, color=BLUE_B).to_edge(UP, buff=0.35)
        subtitle = Text("Level-by-Level Graph Exploration Using a Queue", font_size=20, color=GRAY_B).next_to(title, DOWN, buff=0.12)
        self.play(Write(title), FadeIn(subtitle), run_time=1.5)

        # 2. Deterministic Graph Layout (Pre-calculated positions)
        positions = {
            "A": np.array([-3.5, 1.2, 0]),
            "B": np.array([-1.2, 1.8, 0]),
            "C": np.array([-1.2, 0.4, 0]),
            "D": np.array([1.2, 2.0, 0]),
            "E": np.array([1.2, 0.8, 0]),
            "F": np.array([3.5, 1.2, 0]),
        }

        # Edges
        edge_pairs = [("A", "B"), ("A", "C"), ("B", "D"), ("B", "E"), ("C", "E"), ("D", "F"), ("E", "F")]
        edges = VGroup()
        for u, v in edge_pairs:
            line = Line(positions[u], positions[v], color="#334155", stroke_width=3)
            edges.add(line)

        # Nodes
        nodes = {}
        node_group = VGroup()
        for name, pos in positions.items():
            circle = Circle(radius=0.4, color=BLUE_B, fill_color="#0f172a", fill_opacity=1.0, stroke_width=2.5).move_to(pos)
            text = Text(name, font_size=20, color=WHITE).move_to(pos)
            nodes[name] = VGroup(circle, text)
            node_group.add(nodes[name])

        # Render edges BEHIND nodes (canonical edge rule)
        self.play(Create(edges), run_time=1.8)
        self.play(FadeIn(node_group), run_time=1.5)
        self.wait(1.0)

        # 3. BFS Queue Visualization at Bottom
        queue_label = Text("BFS Queue: [ A ]", font_size=22, color=YELLOW).to_edge(DOWN, buff=0.8)
        traversal_order = Text("Visit Order: A", font_size=20, color=GREEN_B).to_edge(DOWN, buff=0.35)

        self.play(Write(queue_label), Write(traversal_order), run_time=1.5)

        # Step 1: Visit A (Level 0)
        self.play(
            nodes["A"][0].animate.set_fill(GREEN, opacity=0.8).set_color(GREEN_B),
            Indicate(nodes["A"]),
            run_time=1.5
        )

        # Step 2: Discover Level 1 (B, C)
        queue_label2 = Text("BFS Queue: [ B, C ]", font_size=22, color=YELLOW).to_edge(DOWN, buff=0.8)
        traversal_order2 = Text("Visit Order: A ⟶ B ⟶ C", font_size=20, color=GREEN_B).to_edge(DOWN, buff=0.35)

        self.play(
            nodes["B"][0].animate.set_fill(GREEN_D, opacity=0.8).set_color(GREEN_B),
            nodes["C"][0].animate.set_fill(GREEN_D, opacity=0.8).set_color(GREEN_B),
            ReplacementTransform(queue_label, queue_label2),
            ReplacementTransform(traversal_order, traversal_order2),
            run_time=2.0
        )
        self.wait(1.0)

        # Step 3: Discover Level 2 (D, E)
        queue_label3 = Text("BFS Queue: [ D, E ]", font_size=22, color=YELLOW).to_edge(DOWN, buff=0.8)
        traversal_order3 = Text("Visit Order: A ⟶ B ⟶ C ⟶ D ⟶ E", font_size=20, color=GREEN_B).to_edge(DOWN, buff=0.35)

        self.play(
            nodes["D"][0].animate.set_fill(GREEN_D, opacity=0.8).set_color(GREEN_B),
            nodes["E"][0].animate.set_fill(GREEN_D, opacity=0.8).set_color(GREEN_B),
            ReplacementTransform(queue_label2, queue_label3),
            ReplacementTransform(traversal_order2, traversal_order3),
            run_time=2.0
        )
        self.wait(1.0)

        # Step 4: Discover Destination F (Level 3)
        queue_label4 = Text("BFS Queue: [ F ] ⟶ Empty", font_size=22, color=YELLOW).to_edge(DOWN, buff=0.8)
        traversal_order4 = Text("Visit Order: A ⟶ B ⟶ C ⟶ D ⟶ E ⟶ F (Complete)", font_size=20, color=GREEN).to_edge(DOWN, buff=0.35)

        self.play(
            nodes["F"][0].animate.set_fill(GREEN, opacity=0.9).set_color(GREEN_A),
            ReplacementTransform(queue_label3, queue_label4),
            ReplacementTransform(traversal_order3, traversal_order4),
            run_time=2.0
        )
        self.play(Indicate(nodes["F"]), run_time=1.5)
        self.wait(2.5)
