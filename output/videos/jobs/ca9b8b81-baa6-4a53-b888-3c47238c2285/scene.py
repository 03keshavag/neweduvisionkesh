from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Scene 1: Introduction to Projectile Motion
        axes = Axes(x_range=[-10, 10, 2], y_range=[-10, 10, 2], x_length=12, y_length=8, axis_config={"include_tip": False})
        dot = Dot(axes.coords_to_point(0, 0), color=WHITE)
        initial_velocity_vector = Vector([3, 4], color=YELLOW)
        gravity_vector = Vector([0, -1], color=RED)
        self.play(Create(axes), Create(dot), GrowArrow(initial_velocity_vector), GrowArrow(gravity_vector))
        self.wait(2)
        self.play(FadeOut(axes), FadeOut(dot), FadeOut(initial_velocity_vector), FadeOut(gravity_vector))
        self.wait(0.8)

        # Scene 2: Breaking Down Initial Velocity
        initial_velocity_vector = Vector([3, 4], color=YELLOW)
        horizontal_component_vector = Vector([3, 0], color=BLUE)
        vertical_component_vector = Vector([0, 4], color=GREEN)
        self.play(GrowArrow(initial_velocity_vector))
        self.wait(1)
        dashed_line1 = DashedLine(axes.coords_to_point(0, 0), axes.coords_to_point(3, 0), color=WHITE)
        dashed_line2 = DashedLine(axes.coords_to_point(0, 0), axes.coords_to_point(0, 4), color=WHITE)
        self.play(Create(dashed_line1), Create(dashed_line2))
        self.play(ReplacementTransform(initial_velocity_vector, horizontal_component_vector), Write(Text("v₀x", font_size=20, color=BLUE)))
        self.wait(1)
        self.play(ReplacementTransform(horizontal_component_vector, vertical_component_vector), Write(Text("v₀y", font_size=20, color=GREEN)))
        self.wait(2)
        self.play(FadeOut(dashed_line1), FadeOut(dashed_line2), FadeOut(vertical_component_vector), FadeOut(Text("v₀y", font_size=20, color=GREEN)))
        self.wait(0.7)

        # Scene 3: Visualizing the Trajectory
        projectile_path = VMobject()
        projectile_path.set_points_as_corners([[-3, 0, 0], [3, 4, 0], [6, 0, 0]])
        projectile = Dot(axes.coords_to_point(-3, 0), color=WHITE)
        velocity_vector1 = Vector([1, 1], color=YELLOW)
        velocity_vector2 = Vector([1, -1], color=YELLOW)
        self.play(Create(projectile_path), MoveAlongPath(projectile, projectile_path), GrowArrow(velocity_vector1))
        self.wait(2)
        self.play(ReplacementTransform(velocity_vector1, velocity_vector2))
        self.wait(2)
        self.play(FadeOut(projectile_path), FadeOut(projectile), FadeOut(velocity_vector2))
        self.wait(0.9)

        # Scene 4: Comparing Different Launch Angles
        projectile_path1 = VMobject()
        projectile_path1.set_points_as_corners([[-3, 0, 0], [3, 4, 0], [6, 0, 0]])
        projectile_path2 = VMobject()
        projectile_path2.set_points_as_corners([[-3, 0, 0], [3, 8, 0], [6, 4, 0]])
        projectile_path3 = VMobject()
        projectile_path3.set_points_as_corners([[-3, 0, 0], [3, 2, 0], [6, -2, 0]])
        projectile1 = Dot(axes.coords_to_point(-3, 0), color=WHITE)
        projectile2 = Dot(axes.coords_to_point(-3, 0), color=WHITE)
        projectile3 = Dot(axes.coords_to_point(-3, 0), color=WHITE)
        self.play(Create(projectile_path1), Create(projectile_path2), Create(projectile_path3))
        self.play(MoveAlongPath(projectile1, projectile_path1), MoveAlongPath(projectile2, projectile_path2), MoveAlongPath(projectile3, projectile_path3))
        self.wait(4)
        self.play(FadeOut(projectile_path1), FadeOut(projectile_path2), FadeOut(projectile_path3), FadeOut(projectile1), FadeOut(projectile2), FadeOut(projectile3))
        self.wait(0.6)

        # Scene 5: Conclusion and Summary
        summary_text = Text("Projectile Motion Summary", font_size=36, color=WHITE)
        summary_equation1 = Text("R = (v₀² * sin(2θ)) / g", font_size=24, color=YELLOW)
        summary_equation2 = Text("H = (v₀² * sin²(θ)) / (2g)", font_size=24, color=YELLOW)
        self.play(Write(summary_text))
        self.wait(1)
        self.play(Write(summary_equation1))
        self.wait(2)
        self.play(Write(summary_equation2))
        self.wait(4)
        self.play(FadeOut(summary_text), FadeOut(summary_equation1), FadeOut(summary_equation2))
        self.wait(0.9)