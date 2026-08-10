from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Scene 1
        banner = Text("Newton's Second Law of Motion", font_size=36)
        self.play(Write(banner), run_time=2)
        self.wait(1)
        axes = Axes(x_range=[-6, 6, 2], y_range=[-3, 3, 1], x_length=12, y_length=6, axis_config={"include_tip": False})
        force_vector = Vector([2, 1], color=BLUE)
        mass_value = Text("m = 1 kg", font_size=24, color=YELLOW)
        acceleration_value = Text("a = 2 m/s²", font_size=24, color=RED)
        equation = Text("F = m × a", font_size=24, color=WHITE)
        self.play(Create(axes), run_time=2)
        self.play(GrowArrow(force_vector), run_time=1)
        self.play(Write(mass_value), Write(acceleration_value), Write(equation), run_time=2)
        self.wait(4)
        self.play(FadeOut(banner), FadeOut(axes), FadeOut(force_vector), FadeOut(mass_value), FadeOut(acceleration_value), FadeOut(equation), run_time=2)

        # Scene 2
        block = Rectangle(width=2, height=1, color=BLUE)
        force_vector = Vector([2, 0], color=RED)
        mass_value = Text("m = 1 kg", font_size=24, color=YELLOW)
        acceleration_vector = Vector([1, 0], color=GREEN)
        self.play(Create(block), run_time=1)
        self.play(GrowArrow(force_vector), run_time=1)
        self.play(Write(mass_value), run_time=1)
        self.play(GrowArrow(acceleration_vector), run_time=1)
        self.wait(5)
        self.play(FadeOut(block), FadeOut(force_vector), FadeOut(mass_value), FadeOut(acceleration_vector), run_time=2)

        # Scene 3
        block1 = Rectangle(width=2, height=1, color=BLUE).shift(LEFT * 3)
        force_vector1 = Vector([2, 0], color=RED).shift(LEFT * 3)
        mass_value1 = Text("m = 1 kg", font_size=24, color=YELLOW).shift(LEFT * 3)
        acceleration_vector1 = Vector([1, 0], color=GREEN).shift(LEFT * 3)
        block2 = Rectangle(width=2, height=1, color=BLUE).shift(RIGHT * 3)
        force_vector2 = Vector([4, 0], color=RED).shift(RIGHT * 3)
        mass_value2 = Text("m = 1 kg", font_size=24, color=YELLOW).shift(RIGHT * 3)
        acceleration_vector2 = Vector([2, 0], color=GREEN).shift(RIGHT * 3)
        self.play(Create(block1), Create(block2), run_time=1)
        self.play(GrowArrow(force_vector1), GrowArrow(force_vector2), run_time=1)
        self.play(Write(mass_value1), Write(mass_value2), run_time=1)
        self.play(GrowArrow(acceleration_vector1), GrowArrow(acceleration_vector2), run_time=1)
        self.wait(6)
        self.play(FadeOut(block1), FadeOut(block2), FadeOut(force_vector1), FadeOut(force_vector2), FadeOut(mass_value1), FadeOut(mass_value2), FadeOut(acceleration_vector1), FadeOut(acceleration_vector2), run_time=2)

        # Scene 4
        equation = Text("F = m × a", font_size=24, color=WHITE)
        force_vector = Vector([2, 0], color=RED)
        mass_value = Text("m = 1 kg", font_size=24, color=YELLOW)
        acceleration_vector = Vector([1, 0], color=GREEN)
        self.play(Write(equation), run_time=1)
        self.play(GrowArrow(force_vector), run_time=1)
        self.play(Write(mass_value), run_time=1)
        self.play(GrowArrow(acceleration_vector), run_time=1)
        self.wait(5)
        self.play(FadeOut(equation), FadeOut(force_vector), FadeOut(mass_value), FadeOut(acceleration_vector), run_time=2)

        # Scene 5
        summary = Text("In conclusion, Newton's Second Law of Motion describes the relationship between force, mass, and acceleration.", font_size=24, color=WHITE)
        equation = Text("F = m × a", font_size=24, color=WHITE)
        force_vector = Vector([2, 0], color=RED)
        mass_value = Text("m = 1 kg", font_size=24, color=YELLOW)
        acceleration_vector = Vector([1, 0], color=GREEN)
        self.play(Write(summary), run_time=2)
        self.play(Write(equation), run_time=1)
        self.play(GrowArrow(force_vector), run_time=1)
        self.play(Write(mass_value), run_time=1)
        self.play(GrowArrow(acceleration_vector), run_time=1)
        self.wait(8)
        self.play(FadeOut(summary), FadeOut(equation), FadeOut(force_vector), FadeOut(mass_value), FadeOut(acceleration_vector), run_time=2)