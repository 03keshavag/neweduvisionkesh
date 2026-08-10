from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Title
        title = Text("Understanding Derivatives", font_size=38, color=BLUE_B).to_edge(UP, buff=0.4)
        sub = Text("Rate of Change & The Tangent Line", font_size=20, color=GRAY_B).next_to(title, DOWN, buff=0.15)
        self.play(Write(title), FadeIn(sub), run_time=1.5)

        # 2. Axes & Function Curve
        axes = Axes(
            x_range=[-1, 5, 1],
            y_range=[-1, 6, 1],
            x_length=7,
            y_length=5,
            axis_config={"color": BLUE_C, "include_numbers": False},
        ).shift(LEFT * 1.5 + DOWN * 0.5)

        labels = axes.get_axis_labels(x_label=Text("x", font_size=20), y_label=Text("f(x)", font_size=20))
        curve = axes.plot(lambda x: 0.25 * x**2 + 0.5, x_range=[0, 4.5], color=YELLOW)
        func_label = Text("f(x) = 0.25x² + 0.5", color=YELLOW, font_size=22).next_to(curve, UR, buff=0.1)

        self.play(Create(axes), Write(labels), run_time=1.5)
        self.play(Create(curve), Write(func_label), run_time=1.8)
        self.wait(1.0)

        # 3. Secant Line between x0 = 1.5 and x0 + dx
        dx_tracker = ValueTracker(2.0)
        x0 = 1.5

        def get_secant_line():
            dx = dx_tracker.get_value()
            p1 = axes.c2p(x0, 0.25 * x0**2 + 0.5)
            p2 = axes.c2p(x0 + dx, 0.25 * (x0 + dx)**2 + 0.5)
            line = Line(p1, p2, color=RED, stroke_width=4)
            line.set_length(6)
            return line

        dot1 = Dot(axes.c2p(x0, 0.25 * x0**2 + 0.5), color=RED, radius=0.08)
        dot2 = always_redraw(lambda: Dot(axes.c2p(x0 + dx_tracker.get_value(), 0.25 * (x0 + dx_tracker.get_value())**2 + 0.5), color=ORANGE, radius=0.08))
        secant_line = always_redraw(get_secant_line)

        secant_label = Text("Secant Slope = Δf / Δx", color=RED, font_size=22).to_edge(RIGHT, buff=0.8).shift(UP * 1.0)

        self.play(FadeIn(dot1), FadeIn(dot2), Create(secant_line), Write(secant_label), run_time=1.8)
        self.wait(1.0)

        # 4. Limit dx -> 0 (Secant becomes Tangent)
        tangent_label = Text("Tangent Slope f'(x) = lim (Δf / Δx)", color=GREEN_B, font_size=22).to_edge(RIGHT, buff=0.5).shift(UP * 1.0)
        deriv_val = Text("f'(1.5) = 2 · (0.25)(1.5) = 0.75", color=GREEN_C, font_size=20).next_to(tangent_label, DOWN, buff=0.3)

        self.play(
            dx_tracker.animate.set_value(0.01),
            ReplacementTransform(secant_label, tangent_label),
            run_time=3.5,
            rate_func=smooth
        )
        self.play(Write(deriv_val), Indicate(tangent_label), run_time=1.8)
        self.wait(2.0)

        # 5. Move tangent along the curve
        tangent_x_tracker = ValueTracker(1.5)
        def get_tangent_line_moving():
            x_val = tangent_x_tracker.get_value()
            p = axes.c2p(x_val, 0.25 * x_val**2 + 0.5)
            slope = 0.5 * x_val
            angle = np.arctan(slope * (axes.y_length / 7) / (axes.x_length / 6))
            line = Line(LEFT * 2, RIGHT * 2, color=GREEN_B, stroke_width=4).rotate(angle).move_to(p)
            return line

        tangent_dynamic = always_redraw(get_tangent_line_moving)
        moving_dot = always_redraw(lambda: Dot(axes.c2p(tangent_x_tracker.get_value(), 0.25 * tangent_x_tracker.get_value()**2 + 0.5), color=GREEN, radius=0.09))

        self.remove(dot1, dot2, secant_line)
        self.add(tangent_dynamic, moving_dot)

        slope_note = always_redraw(lambda: Text(f"Slope at x={tangent_x_tracker.get_value():.1f} => f'={0.5 * tangent_x_tracker.get_value():.2f}", color=YELLOW, font_size=22).to_edge(RIGHT, buff=0.6).shift(DOWN * 1.0))
        self.play(Write(slope_note), run_time=1.0)

        self.play(tangent_x_tracker.animate.set_value(3.8), run_time=3.5, rate_func=smooth)
        self.play(tangent_x_tracker.animate.set_value(0.5), run_time=3.5, rate_func=smooth)
        self.wait(2.0)
