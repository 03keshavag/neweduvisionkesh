from manim import *
import numpy as np

class EduVisionScene(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # Scene 1
        banner = Text("Binary Search", font_size=36)
        self.play(Create(banner))
        self.wait(2)
        self.play(FadeOut(banner))
        self.wait(1)
        narration = Text("Welcome to binary search, a fast and efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.", font_size=24)
        self.play(Write(narration))
        self.wait(4)
        self.play(FadeOut(narration))
        self.wait(1)
        numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        dots = VGroup(*[Dot() for _ in range(len(numbers))])
        dots.arrange(RIGHT, buff=0.5)
        for i, dot in enumerate(dots):
            dot.set_x(i - len(numbers) / 2 + 0.5)
        target_dot = dots[6]
        target_dot.set_color(RED)
        self.play(Create(dots))
        self.wait(4)
        self.play(FadeOut(dots))

        # Scene 2
        narration = Text("Imagine we're looking for the number 7 in this sorted list. We start by looking at the middle element. If the middle element is greater than 7, we know 7 must be in the left half of the list. If it's less than 7, then 7 must be in the right half.", font_size=24)
        self.play(Write(narration))
        self.wait(4)
        self.play(FadeOut(narration))
        self.wait(1)
        numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        dots = VGroup(*[Dot() for _ in range(len(numbers))])
        dots.arrange(RIGHT, buff=0.5)
        for i, dot in enumerate(dots):
            dot.set_x(i - len(numbers) / 2 + 0.5)
        middle_dot = dots[len(numbers) // 2]
        middle_dot.set_color(YELLOW)
        self.play(Create(dots))
        self.wait(2)
        line = Line(dots[0], dots[-1])
        self.play(Create(line))
        self.wait(1)
        rectangle = Rectangle(width=4, height=0.5)
        rectangle.set_x(dots[0].get_x())
        self.play(Create(rectangle))
        self.wait(2)
        self.play(FadeOut(rectangle))
        rectangle = Rectangle(width=4, height=0.5)
        rectangle.set_x(dots[-1].get_x() - 4)
        self.play(Create(rectangle))
        self.wait(2)
        self.play(FadeOut(dots), FadeOut(line), FadeOut(rectangle))

        # Scene 3
        narration = Text("We continue this process, dividing the list in half with each comparison, until we find the target number or determine it's not in the list. This process is much faster than checking each element one by one, especially for large lists.", font_size=24)
        self.play(Write(narration))
        self.wait(4)
        self.play(FadeOut(narration))
        self.wait(1)
        numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        dots = VGroup(*[Dot() for _ in range(len(numbers))])
        dots.arrange(RIGHT, buff=0.5)
        for i, dot in enumerate(dots):
            dot.set_x(i - len(numbers) / 2 + 0.5)
        target_dot = dots[6]
        target_dot.set_color(RED)
        self.play(Create(dots))
        self.wait(2)
        line = Line(dots[0], dots[-1])
        self.play(Create(line))
        self.wait(1)
        rectangle = Rectangle(width=2, height=0.5)
        rectangle.set_x(dots[0].get_x())
        self.play(Create(rectangle))
        self.wait(1)
        self.play(FadeOut(rectangle))
        rectangle = Rectangle(width=2, height=0.5)
        rectangle.set_x(dots[4].get_x())
        self.play(Create(rectangle))
        self.wait(1)
        self.play(FadeOut(rectangle))
        rectangle = Rectangle(width=1, height=0.5)
        rectangle.set_x(dots[6].get_x() - 0.5)
        self.play(Create(rectangle))
        self.wait(2)
        self.play(FadeOut(dots), FadeOut(line), FadeOut(rectangle))

        # Scene 4
        narration = Text("Binary search is an example of a divide-and-conquer algorithm, which solves a problem by breaking it down into smaller sub-problems. Its efficiency is measured in terms of the number of comparisons it makes, which is logarithmic in the size of the input list, making it very efficient for large datasets.", font_size=24)
        self.play(Write(narration))
        self.wait(4)
        self.play(FadeOut(narration))
        self.wait(1)
        axes = Axes(x_range=[0, 10, 2], y_range=[0, 10, 2], x_length=6, y_length=4)
        self.play(Create(axes))
        self.wait(1)
        linear_graph = axes.plot(lambda x: x, x_range=[0, 10], color=BLUE)
        self.play(Create(linear_graph))
        self.wait(1)
        logarithmic_graph = axes.plot(lambda x: np.log2(x), x_range=[1, 10], color=RED)
        self.play(Create(logarithmic_graph))
        self.wait(2)
        self.play(FadeOut(axes), FadeOut(linear_graph), FadeOut(logarithmic_graph))

        # Scene 5
        narration = Text("Binary search has many applications, from finding words in a dictionary to locating data in a database. Its speed and efficiency make it a fundamental algorithm in computer science.", font_size=24)
        self.play(Write(narration))
        self.wait(4)
        self.play(FadeOut(narration))
        self.wait(1)
        image = Rectangle(width=2, height=2, color=BLUE)
        self.play(Create(image))
        self.wait(1)
        text = Text("Dictionary", font_size=24)
        self.play(Write(text))
        self.wait(1)
        self.play(FadeOut(image), FadeOut(text))
        image = Rectangle(width=2, height=2, color=RED)
        self.play(Create(image))
        self.wait(1)
        text = Text("Database", font_size=24)
        self.play(Write(text))
        self.wait(2)
        self.play(FadeOut(image), FadeOut(text))