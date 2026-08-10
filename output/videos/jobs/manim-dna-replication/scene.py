from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Scene 1: Introduction to DNA Structure
        dna_label = Text("DNA Structure", font_size=36, color=YELLOW)
        self.play(Write(dna_label), run_time=2)
        self.wait(1)
        double_helix = VGroup(
            Circle(radius=0.5, color=BLUE),
            Circle(radius=0.5, color=BLUE).shift(UP * 2),
            Line(UP * 0.5, DOWN * 0.5, color=BLUE),
            Line(UP * 1.5, DOWN * 1.5, color=BLUE),
            Line(UP * 2.5, DOWN * 2.5, color=BLUE),
            Line(UP * 3.5, DOWN * 3.5, color=BLUE),
        )
        self.play(Create(double_helix), run_time=3)
        self.play(Rotate(double_helix, angle=PI / 2), run_time=2)
        self.wait(2)
        self.play(FadeOut(dna_label), FadeOut(double_helix), run_time=2)
        self.wait(1)

        # Scene 2: Unwinding of DNA and Replication Fork
        replication_label = Text("DNA Replication", font_size=36, color=YELLOW)
        self.play(Write(replication_label), run_time=2)
        self.wait(1)
        unwound_dna = VGroup(
            Line(LEFT * 3, RIGHT * 3, color=BLUE),
            Line(LEFT * 3, RIGHT * 3, color=BLUE).shift(UP * 1),
        )
        self.play(Create(unwound_dna), run_time=3)
        replication_fork = Triangle(color=RED).shift(LEFT * 3)
        self.play(Create(replication_fork), run_time=1)
        self.play(MoveAlongPath(replication_fork, unwound_dna[0]), run_time=3)
        self.wait(2)
        self.play(FadeOut(replication_label), FadeOut(unwound_dna), FadeOut(replication_fork), run_time=2)
        self.wait(1)

        # Scene 3: Leading Strand Synthesis
        leading_strand_label = Text("Leading Strand Synthesis", font_size=36, color=YELLOW)
        self.play(Write(leading_strand_label), run_time=2)
        self.wait(1)
        leading_strand = Line(LEFT * 3, RIGHT * 3, color=BLUE)
        self.play(Create(leading_strand), run_time=3)
        nucleotides = VGroup(
            Circle(radius=0.2, color=GREEN).shift(LEFT * 2),
            Circle(radius=0.2, color=GREEN).shift(LEFT * 1),
            Circle(radius=0.2, color=GREEN).shift(RIGHT * 1),
            Circle(radius=0.2, color=GREEN).shift(RIGHT * 2),
        )
        self.play(Create(nucleotides), run_time=2)
        self.play(MoveAlongPath(nucleotides[0], leading_strand), run_time=2)
        self.play(MoveAlongPath(nucleotides[1], leading_strand), run_time=2)
        self.play(MoveAlongPath(nucleotides[2], leading_strand), run_time=2)
        self.play(MoveAlongPath(nucleotides[3], leading_strand), run_time=2)
        self.wait(2)
        self.play(FadeOut(leading_strand_label), FadeOut(leading_strand), FadeOut(nucleotides), run_time=2)
        self.wait(1)

        # Scene 4: Lagging Strand Synthesis
        lagging_strand_label = Text("Lagging Strand Synthesis", font_size=36, color=YELLOW)
        self.play(Write(lagging_strand_label), run_time=2)
        self.wait(1)
        lagging_strand = Line(LEFT * 3, RIGHT * 3, color=BLUE)
        self.play(Create(lagging_strand), run_time=3)
        okazaki_fragments = VGroup(
            Line(LEFT * 1, RIGHT * 1, color=GREEN).shift(LEFT * 2),
            Line(LEFT * 1, RIGHT * 1, color=GREEN).shift(LEFT * 0.5),
            Line(LEFT * 1, RIGHT * 1, color=GREEN).shift(RIGHT * 0.5),
            Line(LEFT * 1, RIGHT * 1, color=GREEN).shift(RIGHT * 2),
        )
        self.play(Create(okazaki_fragments), run_time=2)
        self.play(MoveAlongPath(okazaki_fragments[0], lagging_strand), run_time=2)
        self.play(MoveAlongPath(okazaki_fragments[1], lagging_strand), run_time=2)
        self.play(MoveAlongPath(okazaki_fragments[2], lagging_strand), run_time=2)
        self.play(MoveAlongPath(okazaki_fragments[3], lagging_strand), run_time=2)
        self.wait(2)
        self.play(FadeOut(lagging_strand_label), FadeOut(lagging_strand), FadeOut(okazaki_fragments), run_time=2)
        self.wait(1)

        # Scene 5: Completion of DNA Replication
        completion_label = Text("DNA Replication Completion", font_size=36, color=YELLOW)
        self.play(Write(completion_label), run_time=2)
        self.wait(1)
        completed_dna = VGroup(
            Circle(radius=0.5, color=BLUE),
            Circle(radius=0.5, color=BLUE).shift(UP * 2),
            Line(UP * 0.5, DOWN * 0.5, color=BLUE),
            Line(UP * 1.5, DOWN * 1.5, color=BLUE),
            Line(UP * 2.5, DOWN * 2.5, color=BLUE),
            Line(UP * 3.5, DOWN * 3.5, color=BLUE),
        )
        self.play(Create(completed_dna), run_time=3)
        self.play(Rotate(completed_dna, angle=PI / 2), run_time=2)
        new_dna = completed_dna.copy().shift(RIGHT * 4)
        self.play(Create(new_dna), run_time=3)
        self.play(Rotate(new_dna, angle=PI / 2), run_time=2)
        self.wait(2)
        self.play(FadeOut(completion_label), FadeOut(completed_dna), FadeOut(new_dna), run_time=2)
        self.wait(1)