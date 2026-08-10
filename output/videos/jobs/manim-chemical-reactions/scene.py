from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Scene 1: Introduction to Chemical Reactions
        intro_text = Text("Chemical Reactions", font_size=36, color=BLUE_B)
        self.play(FadeIn(intro_text))
        self.wait(2)
        self.play(FadeOut(intro_text))
        equation = Text("2H₂ + O₂ → 2H₂O", font_size=24, color=WHITE)
        self.play(Write(equation))
        self.wait(4)
        self.play(FadeOut(equation))
        self.wait(6.6)

        # Scene 2: Law of Conservation of Mass
        balance_scale = Line(LEFT * 3, RIGHT * 3, color=WHITE)
        self.play(Create(balance_scale))
        self.wait(1)
        reactants = Text("2H₂ + O₂", font_size=24, color=WHITE)
        products = Text("2H₂O", font_size=24, color=WHITE)
        self.play(Write(reactants), Write(products))
        self.wait(2)
        self.play(ReplacementTransform(reactants, products))
        self.wait(3)
        self.play(FadeOut(balance_scale), FadeOut(products))
        self.wait(5)

        # Scene 3: Reactants and Products
        hydrogen = Text("H₂", font_size=24, color=WHITE)
        oxygen = Text("O₂", font_size=24, color=WHITE)
        water = Text("H₂O", font_size=24, color=WHITE)
        self.play(Create(hydrogen), Create(oxygen))
        self.wait(2)
        self.play(GrowFromCenter(water))
        self.wait(3)
        self.play(FadeOut(hydrogen), FadeOut(oxygen), FadeOut(water))
        self.wait(6)

        # Scene 4: Chemical Equation Balancing
        equation_unbalanced = Text("H₂ + O₂ → H₂O", font_size=24, color=WHITE)
        equation_balanced = Text("2H₂ + O₂ → 2H₂O", font_size=24, color=WHITE)
        self.play(Write(equation_unbalanced))
        self.wait(2)
        self.play(ReplacementTransform(equation_unbalanced, equation_balanced))
        self.wait(3)
        self.play(FadeOut(equation_balanced))
        self.wait(5.2)

        # Scene 5: Conclusion and Review
        conclusion_text = Text("Chemical Reactions: Reactants → Products", font_size=24, color=WHITE)
        self.play(FadeIn(conclusion_text))
        self.wait(2)
        equation_summary = Text("2H₂ + O₂ → 2H₂O", font_size=24, color=WHITE)
        self.play(Write(equation_summary))
        self.wait(4)
        self.play(FadeOut(conclusion_text), FadeOut(equation_summary))
        self.wait(10)