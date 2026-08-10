from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Title & Introduction
        title = Text("Projectile Motion Kinematics", font_size=38, color=BLUE_B).to_edge(UP, buff=0.35)
        subtitle = Text("2D Motion Under Constant Downward Gravity", font_size=20, color=GRAY_B).next_to(title, DOWN, buff=0.12)
        self.play(Write(title), FadeIn(subtitle), run_time=1.5)

        # 2. Mathematical Canvas: Axes & Ground
        axes = Axes(
            x_range=[0, 10, 2],
            y_range=[0, 6, 2],
            x_length=9,
            y_length=4.8,
            axis_config={"color": BLUE_D, "stroke_width": 2, "include_numbers": False},
        ).shift(LEFT * 0.5 + DOWN * 1.0)

        ground = Line(axes.c2p(-0.5, 0), axes.c2p(10.5, 0), color=GRAY_D, stroke_width=3)
        origin_lbl = Text("(0,0)", font_size=16, color=GRAY).next_to(axes.c2p(0, 0), DL, buff=0.1)

        self.play(Create(axes), Create(ground), Write(origin_lbl), run_time=1.5)

        # 3. Launch Vector v0 at Angle theta
        v0_val = 3.2
        theta_deg = 50
        theta_rad = np.radians(theta_deg)
        v0x = v0_val * np.cos(theta_rad)
        v0y = v0_val * np.sin(theta_rad)

        launch_pt = axes.c2p(0, 0)
        ball = Dot(launch_pt, color=YELLOW, radius=0.12)
        v0_arrow = Arrow(launch_pt, axes.c2p(v0x, v0y), color=YELLOW, buff=0, stroke_width=4)
        v0_lbl = Text("v₀", font_size=20, color=YELLOW).next_to(v0_arrow.get_end(), UR, buff=0.1)

        arc = Arc(radius=0.8, start_angle=0, angle=theta_rad, arc_center=launch_pt, color=ORANGE)
        theta_lbl = Text("θ = 50°", font_size=18, color=ORANGE).next_to(arc, RIGHT, buff=0.15).shift(UP * 0.1)

        self.play(FadeIn(ball), GrowArrow(v0_arrow), Write(v0_lbl), Create(arc), Write(theta_lbl), run_time=1.8)
        self.wait(1.0)

        # 4. Vector Decomposition: vx (horizontal) & vy (vertical)
        vx_arrow = Arrow(launch_pt, axes.c2p(v0x, 0), color=BLUE_B, buff=0, stroke_width=3.5)
        vx_lbl = Text("v₀x = v₀ · cos(θ)", font_size=18, color=BLUE_B).next_to(vx_arrow, DOWN, buff=0.15)

        vy_arrow = Arrow(launch_pt, axes.c2p(0, v0y), color=GREEN_B, buff=0, stroke_width=3.5)
        vy_lbl = Text("v₀y = v₀ · sin(θ)", font_size=18, color=GREEN_B).next_to(vy_arrow, LEFT, buff=0.15)

        dash_x = DashedLine(axes.c2p(v0x, 0), axes.c2p(v0x, v0y), color=GRAY)
        dash_y = DashedLine(axes.c2p(0, v0y), axes.c2p(v0x, v0y), color=GRAY)

        self.play(
            GrowArrow(vx_arrow), Write(vx_lbl),
            GrowArrow(vy_arrow), Write(vy_lbl),
            Create(dash_x), Create(dash_y),
            run_time=2.0
        )
        self.wait(1.2)

        # 5. Physics Trajectory: Parabolic Path
        g = 9.8
        t_flight = 2 * v0y / (g * 0.22)
        t_tracker = ValueTracker(0.0)

        def traj_pos(t):
            x = v0x * t * 2.2
            y = (v0y * t - 0.5 * (g * 0.22) * t**2) * 2.2
            return axes.c2p(max(0, x), max(0, y))

        moving_ball = always_redraw(lambda: Dot(traj_pos(t_tracker.get_value()), color=YELLOW, radius=0.12))
        path = always_redraw(lambda: TracedPath(moving_ball.get_center, stroke_color=YELLOW_C, stroke_width=3.5))

        # Dynamic velocity vectors during flight
        def get_vel_arrow():
            t = t_tracker.get_value()
            pt = traj_pos(t)
            cur_vy = (v0y - (g * 0.22) * t) * 0.8
            cur_vx = v0x * 0.8
            return Arrow(pt, pt + np.array([cur_vx, cur_vy, 0]), color=ORANGE, buff=0, stroke_width=3)

        def get_grav_arrow():
            pt = traj_pos(t_tracker.get_value())
            return Arrow(pt, pt + DOWN * 0.8, color=RED_B, buff=0, stroke_width=3)

        vel_vector = always_redraw(get_vel_arrow)
        grav_vector = always_redraw(get_grav_arrow)
        g_lbl = Text("g ↓ (Constant)", font_size=18, color=RED_B).to_edge(RIGHT, buff=1.0).shift(UP * 1.5)

        self.add(moving_ball, vel_vector, grav_vector)
        self.play(
            FadeOut(v0_arrow), FadeOut(v0_lbl), FadeOut(vx_arrow), FadeOut(vx_lbl),
            FadeOut(vy_arrow), FadeOut(vy_lbl), FadeOut(dash_x), FadeOut(dash_y), FadeOut(arc), FadeOut(theta_lbl),
            Write(g_lbl),
            run_time=1.5
        )

        # 6. Physical Animation to Apex (vy = 0)
        t_apex = v0y / (g * 0.22)
        self.play(t_tracker.animate.set_value(t_apex), run_time=3.0, rate_func=linear)

        # Apex Highlight
        apex_pt = traj_pos(t_apex)
        apex_dot = Dot(apex_pt, color=GREEN, radius=0.15)
        apex_lbl = Text("vy = 0 at Apex H", font_size=18, color=GREEN).next_to(apex_pt, UP, buff=0.25)
        h_line = DashedLine(apex_pt, [apex_pt[0], axes.c2p(0, 0)[1], 0], color=GREEN_C)
        h_eq = Text("H = v₀y² / (2g)", font_size=18, color=GREEN_B).next_to(h_line, LEFT, buff=0.15)

        self.play(FadeIn(apex_dot), Write(apex_lbl), Create(h_line), Write(h_eq), run_time=1.8)
        self.play(Indicate(apex_dot), run_time=1.2)
        self.wait(1.0)

        # 7. Descent to Landing
        self.play(
            FadeOut(apex_lbl),
            t_tracker.animate.set_value(t_flight),
            run_time=3.0,
            rate_func=linear
        )

        # 8. Range Measurement & Governing Equations
        land_pt = traj_pos(t_flight)
        range_line = Line(axes.c2p(0, 0), land_pt, color=BLUE_B, stroke_width=4)
        range_brace = Brace(range_line, DOWN, buff=0.15)
        range_lbl = Text("R = v₀² · sin(2θ) / g", font_size=18, color=BLUE_B).next_to(range_brace, DOWN, buff=0.1)

        self.play(Create(range_brace), Write(range_lbl), run_time=1.8)

        # Kinematic Summary Box
        summary_box = VGroup(
            Text("x(t) = v₀x · t", font_size=18, color=BLUE_B),
            Text("y(t) = v₀y · t - ½gt²", font_size=18, color=YELLOW),
        ).arrange(DOWN, buff=0.18).to_edge(RIGHT, buff=0.8).shift(UP * 0.5)

        box_border = SurroundingRectangle(summary_box, color=YELLOW, buff=0.2, stroke_width=1.5)
        self.play(Create(box_border), Write(summary_box), run_time=1.8)
        self.play(Circumscribe(summary_box, color=YELLOW), run_time=1.8)
        self.wait(2.5)
