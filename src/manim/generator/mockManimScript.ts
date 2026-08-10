/**
 * Subject-Aware Canonical Manim Community scripts for offline testing and fallback execution.
 * Covers all STEM domains with deterministic visual primitives and concrete examples.
 */
import type {ManimEducationalPlan} from '../types';
import {classifyTopicDomain} from '../planner/domainClassifier';
import {PYTHON_PRIMITIVES_CODE} from './pythonPrimitives';

function wrapScript(body: string): string {
  return `from manim import *\nimport numpy as np\n\n${PYTHON_PRIMITIVES_CODE}\n\n${body}`;
}

export function getMockManimPlan(topic: string, language: string): ManimEducationalPlan {
  const analysis = classifyTopicDomain(topic);

  return {
    id: `plan-${Date.now()}`,
    title: topic,
    topic,
    subject: analysis.domain,
    domainAnalysis: analysis,
    language,
    learningObjective: `Understand the core visual mechanism and governing rules of ${topic}`,
    totalEstimatedDuration: 35,
    scenes: [
      {
        id: 'scene-1',
        purpose: 'Physical / conceptual framework setup',
        narration: `Let us explore ${topic}. We start by establishing the foundational state and input parameters.`,
        estimatedDuration: 8,
        visualObjective: `Establish visual framework and initial state for ${analysis.conceptType}`,
        keyEntities: analysis.entities.slice(0, 3),
        transformations: ['Create', 'Write'],
      },
      {
        id: 'scene-2',
        purpose: 'Decomposition and active state transformation',
        narration: 'Next, we examine the governing operations as the system transforms step by step.',
        estimatedDuration: 10,
        visualObjective: `Execute core state transitions: ${analysis.transformations.join(', ')}`,
        keyEntities: analysis.entities,
        transformations: ['Transform', 'ReplacementTransform', 'Indicate'],
      },
      {
        id: 'scene-3',
        purpose: 'Critical point, comparison, and governing rules',
        narration: 'At this critical stage, the underlying mathematical or physical law determines the outcome.',
        estimatedDuration: 9,
        visualObjective: 'Highlight critical inflection, comparisons, or formula derivations',
        keyEntities: ['Governing Formula', 'State Badge'],
        transformations: ['Indicate', 'Write'],
      },
      {
        id: 'scene-4',
        purpose: 'Final state, complexity analysis, and synthesis',
        narration: 'In summary, this systematic process produces the exact result with optimal clarity and efficiency.',
        estimatedDuration: 8,
        visualObjective: 'Show final settled state, measurement, or complexity badge',
        keyEntities: ['Summary Box', 'Complexity Badge'],
        transformations: ['FadeIn', 'Circumscribe'],
      },
    ],
  };
}

export function getMockManimScript(topic: string, sceneDurationSeconds: number = 35): string {
  const t = topic.toLowerCase();

  // 1. Computer Science: Merge Sort ([38, 27, 43, 3] -> [3, 27, 38, 43])
  if (t.includes('merge sort') || (t.includes('sort') && !t.includes('bubble') && !t.includes('quick'))) {
    return wrapScript(`class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header
        header = LayoutManager.create_header("Merge Sort Algorithm", "Divide and Conquer in O(n log n) Time")
        self.play(FadeIn(header), run_time=1.2)

        # 2. Level 0: Original Unsorted Array [38, 27, 43, 3]
        arr_root = ArrayVisualizer([38, 27, 43, 3], box_size=0.75, font_size=22)
        arr_root.get_group().shift(UP * 1.8)
        lbl_div = Text("Level 0: Original Array", font_size=18, color=YELLOW).next_to(arr_root.get_group(), UP, buff=0.15)

        self.play(FadeIn(arr_root.get_group(), shift=DOWN*0.2), Write(lbl_div), run_time=1.5)
        self.wait(1.0)

        # Level 1: Split into Left [38, 27] and Right [43, 3]
        arr_l1_a = ArrayVisualizer([38, 27], box_size=0.65, font_size=18).get_group().shift(LEFT * 2.8 + UP * 0.4)
        arr_l1_b = ArrayVisualizer([43, 3], box_size=0.65, font_size=18).get_group().shift(RIGHT * 2.8 + UP * 0.4)

        split_a = Arrow(arr_root.get_group().get_bottom(), arr_l1_a.get_top(), color=GRAY_B, buff=0.15, stroke_width=2.5)
        split_b = Arrow(arr_root.get_group().get_bottom(), arr_l1_b.get_top(), color=GRAY_B, buff=0.15, stroke_width=2.5)

        status_split = LayoutManager.create_status_bar("Step 1: Divide array into two halves (n/2)", color=BLUE_B)
        self.play(GrowArrow(split_a), GrowArrow(split_b), FadeIn(arr_l1_a), FadeIn(arr_l1_b), Write(status_split), run_time=1.8)
        self.wait(1.0)

        # Level 2: Single Elements [38], [27], [43], [3]
        arr_e1 = ArrayVisualizer([38], box_size=0.55, font_size=16).get_group().shift(LEFT * 4.2 + DOWN * 0.8)
        arr_e2 = ArrayVisualizer([27], box_size=0.55, font_size=16).get_group().shift(LEFT * 1.4 + DOWN * 0.8)
        arr_e3 = ArrayVisualizer([43], box_size=0.55, font_size=16).get_group().shift(RIGHT * 1.4 + DOWN * 0.8)
        arr_e4 = ArrayVisualizer([3], box_size=0.55, font_size=16).get_group().shift(RIGHT * 4.2 + DOWN * 0.8)
        singles = VGroup(arr_e1, arr_e2, arr_e3, arr_e4)

        status_base = LayoutManager.create_status_bar("Step 2: Base case reached (single elements are trivially sorted)", color=ORANGE)
        self.play(FadeIn(singles, shift=DOWN*0.2), ReplacementTransform(status_split, status_base), run_time=1.8)
        self.wait(1.0)

        # Clear division tree for merging
        div_tree = VGroup(arr_root.get_group(), lbl_div, split_a, split_b, arr_l1_a, arr_l1_b, singles)
        self.play(FadeOut(div_tree), FadeOut(status_base), run_time=1.0)

        # 3. Two-Pointer Merging: [27, 38] + [3, 43] -> [3, 27, 38, 43]
        m_left = ArrayVisualizer([27, 38], box_size=0.75, color=GREEN_D, font_size=20)
        m_left.get_group().shift(LEFT * 3.0 + UP * 1.2)
        lbl_l = Text("Sorted Left", font_size=16, color=GREEN_B).next_to(m_left.get_group(), UP, buff=0.15)

        m_right = ArrayVisualizer([3, 43], box_size=0.75, color=BLUE_D, font_size=20)
        m_right.get_group().shift(RIGHT * 3.0 + UP * 1.2)
        lbl_r = Text("Sorted Right", font_size=16, color=BLUE_B).next_to(m_right.get_group(), UP, buff=0.15)

        status_merge = LayoutManager.create_status_bar("Step 3: Compare 27 vs 3 -> 3 is smaller -> place in merged array", color=YELLOW)
        self.play(FadeIn(m_left.get_group()), Write(lbl_l), FadeIn(m_right.get_group()), Write(lbl_r), Write(status_merge), run_time=1.5)

        # Final Sorted Array in Center
        final_arr = ArrayVisualizer([3, 27, 38, 43], box_size=0.85, color=YELLOW_D, font_size=22)
        final_arr.get_group().shift(DOWN * 0.9)

        for elem in final_arr.get_group():
            self.play(FadeIn(elem, scale=1.2), run_time=0.4)

        success_box = SurroundingRectangle(final_arr.get_group(), color=GREEN, buff=0.15, stroke_width=2.5)
        status_done = LayoutManager.create_status_bar("✓ Merged Result: [3, 27, 38, 43] in O(n log n) Time", color=GREEN)

        self.play(Create(success_box), ReplacementTransform(status_merge, status_done), run_time=1.5)
        self.play(Circumscribe(final_arr.get_group(), color=YELLOW), run_time=1.8)
        self.wait(2.0)
`);
  }

  // 2. Computer Science: Binary Search ([3, 8, 12, 17, 23, 31, 42], target=23)
  if (t.includes('binary search') || t.includes('search')) {
    return wrapScript(`class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header & Target Card
        header = LayoutManager.create_header("Binary Search Algorithm", "Divide and Conquer Search in O(log n)")
        target_card = Text("Target = 23", font_size=22, color=YELLOW).to_edge(LEFT, buff=0.8).shift(UP * 1.5)
        self.play(FadeIn(header), Write(target_card), run_time=1.2)

        # 2. Sorted Array
        vals = [3, 8, 12, 17, 23, 31, 42]
        arr = ArrayVisualizer(vals, box_size=0.85, font_size=22)
        arr.get_group().shift(DOWN * 0.2)
        self.play(FadeIn(arr.get_group(), shift=DOWN*0.3), run_time=1.5)
        self.wait(0.8)

        # 3. Iteration 1: LOW=0, HIGH=6, MID=3 (Val=17)
        p_low = arr.create_pointer(0, "LOW", is_upper=False, color=GREEN)
        p_high = arr.create_pointer(6, "HIGH", is_upper=False, color=RED)
        p_mid = arr.create_pointer(3, "MID (17)", is_upper=True, color=YELLOW)

        status_1 = LayoutManager.create_status_bar("Step 1: MID = arr[3] = 17 < 23. Target is in right half!", color=BLUE_B)
        self.play(Create(p_low), Create(p_high), run_time=1.2)
        self.play(Create(p_mid), Write(status_1), run_time=1.2)
        self.play(Indicate(arr.get_box(3), color=YELLOW), run_time=1.2)
        self.wait(1.0)

        # 4. Eliminate 0..3 and set LOW = 4
        dim_left = [arr.get_element(i).animate.set_opacity(0.25) for i in range(4)]
        p_low_new = arr.create_pointer(4, "LOW", is_upper=False, color=GREEN)
        status_2 = LayoutManager.create_status_bar("Step 2: Eliminate left half. Set LOW = MID + 1 = 4", color=ORANGE)

        self.play(*dim_left, Transform(p_low, p_low_new), ReplacementTransform(status_1, status_2), run_time=1.5)
        self.wait(0.8)

        # 5. Iteration 2: LOW=4, HIGH=6, MID=5 (Val=31)
        p_mid_2 = arr.create_pointer(5, "MID (31)", is_upper=True, color=YELLOW)
        status_3 = LayoutManager.create_status_bar("Step 3: MID = arr[5] = 31 > 23. Target is in left subarray!", color=YELLOW)

        self.play(Transform(p_mid, p_mid_2), ReplacementTransform(status_2, status_3), run_time=1.2)
        self.play(Indicate(arr.get_box(5), color=YELLOW), run_time=1.2)
        self.wait(0.8)

        # 6. Eliminate 5..6 and set HIGH = 4
        dim_right = [arr.get_element(i).animate.set_opacity(0.25) for i in range(5, 7)]
        p_high_new = arr.create_pointer(4, "HIGH", is_upper=False, color=RED)
        p_mid_3 = arr.create_pointer(4, "MID (23)", is_upper=True, color=GREEN)
        status_4 = LayoutManager.create_status_bar("Step 4: LOW = HIGH = MID = 4. arr[4] == 23 -> TARGET FOUND!", color=GREEN)

        self.play(
            *dim_right,
            Transform(p_high, p_high_new),
            Transform(p_mid, p_mid_3),
            ReplacementTransform(status_3, status_4),
            run_time=1.5
        )
        self.wait(0.8)

        # Target Found Box
        found_box = SurroundingRectangle(arr.get_element(4), color=GREEN, buff=0.15, stroke_width=3)
        self.play(Create(found_box), Indicate(arr.get_val_mob(4), scale_factor=1.4, color=GREEN), run_time=1.8)
        self.wait(2.0)
`);
  }

  // 3. Computer Science: Linked List Insertion ([10 -> 20 -> 30], insert 25)
  if (t.includes('linked list') || t.includes('list')) {
    return wrapScript(`class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header
        header = LayoutManager.create_header("Linked List Node Insertion", "Dynamic Memory Pointer Manipulation")
        self.play(FadeIn(header), run_time=1.2)

        # 2. Existing Linked List: [10 -> 20 -> 30 -> NULL]
        ll = LinkedListVisualizer([10, 20, 30])
        ll.get_group().shift(DOWN * 0.5)
        self.play(FadeIn(ll.get_group(), shift=DOWN*0.3), run_time=1.8)
        self.wait(1.0)

        # 3. Create New Node: [25 | *] in Upper Safe Zone
        new_data = Rectangle(width=0.75, height=0.7, color=GREEN, fill_color="#0f172a", fill_opacity=0.9, stroke_width=2)
        new_ptr = Rectangle(width=0.45, height=0.7, color=GREEN, fill_color="#1e293b", fill_opacity=0.9, stroke_width=2).next_to(new_data, RIGHT, buff=0)
        new_dot = Dot(new_ptr.get_center(), radius=0.06, color=YELLOW)
        new_val = Text("25", font_size=18, color=WHITE).move_to(new_data.get_center())
        new_lbl = Text("New Node", font_size=14, color=GREEN_B).next_to(new_data, UP, buff=0.12)
        new_node = VGroup(new_data, new_ptr, new_dot, new_val, new_lbl).shift(UP * 1.5 + RIGHT * 0.5)

        status_create = LayoutManager.create_status_bar("Step 1: Allocate new node with data = 25 in memory", color=BLUE_B)
        self.play(FadeIn(new_node, shift=DOWN*0.3), Write(status_create), run_time=1.5)
        self.wait(1.0)

        # 4. Redirect Pointers
        ptr_arrow1 = Arrow(new_dot.get_center(), ll.nodes[2][0].get_left(), color=GREEN, buff=0.08, stroke_width=3)
        status_ptr1 = LayoutManager.create_status_bar("Step 2: newNode.next = current.next (points to node 30)", color=YELLOW)
        self.play(GrowArrow(ptr_arrow1), ReplacementTransform(status_create, status_ptr1), run_time=1.5)
        self.wait(1.0)

        status_ptr2 = LayoutManager.create_status_bar("Step 3: current.next = newNode -> Insertion Complete in O(1) Time", color=GREEN)
        self.play(ReplacementTransform(ll.arrows[1], Arrow(ll.nodes[1][2].get_center(), new_data.get_left(), color=YELLOW, buff=0.08, stroke_width=3)), ReplacementTransform(status_ptr1, status_ptr2), run_time=1.5)
        self.play(Circumscribe(new_node, color=GREEN), run_time=1.8)
        self.wait(2.0)
`);
  }

  // 4. Computer Science: BFS Graph Traversal
  if (t.includes('bfs') || t.includes('dfs') || t.includes('graph')) {
    return wrapScript(`class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header
        header = LayoutManager.create_header("Breadth-First Search (BFS)", "Level-by-Level Graph Exploration")
        self.play(FadeIn(header), run_time=1.2)

        # 2. Deterministic Graph
        positions = {
            "A": np.array([-3.5, 1.2, 0]),
            "B": np.array([-1.2, 1.8, 0]),
            "C": np.array([-1.2, 0.4, 0]),
            "D": np.array([1.2, 2.0, 0]),
            "E": np.array([1.2, 0.8, 0]),
            "F": np.array([3.5, 1.2, 0]),
        }
        edges = [("A", "B"), ("A", "C"), ("B", "D"), ("B", "E"), ("C", "E"), ("D", "F"), ("E", "F")]
        graph = GraphVisualizer(positions, edges)

        self.play(FadeIn(graph.get_group()), run_time=1.8)
        self.wait(1.0)

        # 3. Queue & Traversal State
        status_q = LayoutManager.create_status_bar("Queue: [ A ] | Visited: { A }", color=YELLOW)
        self.play(Write(status_q), graph.set_visited("A", GREEN), run_time=1.5)
        self.wait(1.0)

        # Discover Level 1 (B, C)
        status_l1 = LayoutManager.create_status_bar("Queue: [ B, C ] | Visited: { A, B, C }", color=YELLOW)
        self.play(
            graph.set_visited("B", GREEN_B),
            graph.set_visited("C", GREEN_B),
            ReplacementTransform(status_q, status_l1),
            run_time=1.8
        )
        self.wait(1.0)

        # Discover Level 2 (D, E)
        status_l2 = LayoutManager.create_status_bar("Queue: [ D, E ] | Visited: { A, B, C, D, E }", color=YELLOW)
        self.play(
            graph.set_visited("D", GREEN_B),
            graph.set_visited("E", GREEN_B),
            ReplacementTransform(status_l1, status_l2),
            run_time=1.8
        )
        self.wait(1.0)

        # Discover F
        status_done = LayoutManager.create_status_bar("✓ Traversal Order: A ⟶ B ⟶ C ⟶ D ⟶ E ⟶ F in O(V + E) Time", color=GREEN)
        self.play(
            graph.set_visited("F", GREEN_A),
            ReplacementTransform(status_l2, status_done),
            run_time=1.8
        )
        self.wait(2.0)
`);
  }

  // 5. Mathematics: Matrix Multiplication (2x2)
  if (t.includes('matrix') || t.includes('linear algebra')) {
    return wrapScript(`class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header
        header = LayoutManager.create_header("Matrix Multiplication (2 × 2)", "Row by Column Dot Product Accumulation")
        self.play(FadeIn(header), run_time=1.2)

        # 2. Matrices A, B, and Result C
        mat_a = MatrixVisualizer.create_matrix([[1, 2], [3, 4]]).shift(LEFT * 4.2 + UP * 0.4)
        lbl_a = Text("Matrix A", font_size=16, color=BLUE_B).next_to(mat_a, UP, buff=0.15)

        mul_sign = Text("×", font_size=28, color=GRAY_B).shift(LEFT * 2.1 + UP * 0.4)

        mat_b = MatrixVisualizer.create_matrix([[5, 6], [7, 8]]).shift(ORIGIN + UP * 0.4)
        lbl_b = Text("Matrix B", font_size=16, color=BLUE_B).next_to(mat_b, UP, buff=0.15)

        eq_sign = Text("=", font_size=28, color=GRAY_B).shift(RIGHT * 2.1 + UP * 0.4)

        mat_c = MatrixVisualizer.create_matrix([[19, 22], [43, 50]]).shift(RIGHT * 4.2 + UP * 0.4)
        lbl_c = Text("Result C", font_size=16, color=GREEN_B).next_to(mat_c, UP, buff=0.15)

        self.play(
            FadeIn(mat_a), Write(lbl_a), Write(mul_sign),
            FadeIn(mat_b), Write(lbl_b), Write(eq_sign),
            FadeIn(mat_c), Write(lbl_c),
            run_time=2.0
        )
        self.wait(1.0)

        # 3. Highlight Row 1 of A and Col 1 of B -> C[0][0] = 1*5 + 2*7 = 19
        row1_box = SurroundingRectangle(mat_a[0][0], color=YELLOW, buff=0.08)
        col1_box = SurroundingRectangle(VGroup(mat_b[0][0][0], mat_b[0][1][0]), color=YELLOW, buff=0.08)
        c00_box = SurroundingRectangle(mat_c[0][0][0], color=GREEN, buff=0.08)

        status_dot = LayoutManager.create_status_bar("C[0][0] = (1 × 5) + (2 × 7) = 5 + 14 = 19", color=YELLOW)
        self.play(Create(row1_box), Create(col1_box), Write(status_dot), run_time=1.5)
        self.play(Create(c00_box), Indicate(mat_c[0][0][0], color=GREEN), run_time=1.5)
        self.wait(1.5)

        status_final = LayoutManager.create_status_bar("✓ Result: C = [[19, 22], [43, 50]] computed in O(n³) operations", color=GREEN)
        self.play(ReplacementTransform(status_dot, status_final), run_time=1.5)
        self.play(Circumscribe(mat_c, color=GREEN), run_time=1.8)
        self.wait(2.0)
`);
  }

  // 6. Mathematics: Derivatives (Secant to Tangent)
  if (t.includes('derivative') || t.includes('calculus') || t.includes('tangent') || t.includes('slope')) {
    return wrapScript(`class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header
        header = LayoutManager.create_header("Understanding Derivatives", "Rate of Change & The Tangent Line")
        self.play(FadeIn(header), run_time=1.2)

        # 2. Axes & Function Curve
        axes = Axes(
            x_range=[-1, 5, 1],
            y_range=[-1, 6, 1],
            x_length=7,
            y_length=4.8,
            axis_config={"color": BLUE_C, "include_numbers": False},
        ).shift(LEFT * 1.5 + DOWN * 0.6)

        labels = axes.get_axis_labels(x_label=Text("x", font_size=18), y_label=Text("f(x)", font_size=18))
        curve = axes.plot(lambda x: 0.25 * x**2 + 0.5, x_range=[0, 4.5], color=YELLOW)
        func_label = Text("f(x) = 0.25x² + 0.5", color=YELLOW, font_size=20).next_to(curve, UR, buff=0.1)

        self.play(Create(axes), Write(labels), run_time=1.5)
        self.play(Create(curve), Write(func_label), run_time=1.5)
        self.wait(1.0)

        # 3. Secant Line: dx -> 0
        dx_tracker = ValueTracker(2.0)
        x0 = 1.5

        def get_secant():
            dx = dx_tracker.get_value()
            p1 = axes.c2p(x0, 0.25 * x0**2 + 0.5)
            p2 = axes.c2p(x0 + dx, 0.25 * (x0 + dx)**2 + 0.5)
            line = Line(p1, p2, color=RED, stroke_width=4)
            line.set_length(6)
            return line

        dot1 = Dot(axes.c2p(x0, 0.25 * x0**2 + 0.5), color=RED, radius=0.08)
        dot2 = always_redraw(lambda: Dot(axes.c2p(x0 + dx_tracker.get_value(), 0.25 * (x0 + dx_tracker.get_value())**2 + 0.5), color=ORANGE, radius=0.08))
        secant_line = always_redraw(get_secant)

        status_secant = LayoutManager.create_status_bar("Secant Line Slope = Δf / Δx", color=RED)
        self.play(FadeIn(dot1), FadeIn(dot2), Create(secant_line), Write(status_secant), run_time=1.8)
        self.wait(1.0)

        # 4. Limit dx -> 0
        status_tangent = LayoutManager.create_status_bar("✓ Limit as Δx ⟶ 0: Tangent Slope f'(1.5) = 0.75", color=GREEN)
        self.play(
            dx_tracker.animate.set_value(0.01),
            ReplacementTransform(status_secant, status_tangent),
            run_time=3.0,
            rate_func=smooth
        )
        self.play(Indicate(status_tangent), run_time=1.5)
        self.wait(2.0)
`);
  }

  // 7. Electronics: Electric Circuit (Ohm's Law V = I * R)
  if (t.includes('circuit') || t.includes('resistor') || t.includes('capacitor') || t.includes('ohm') || t.includes('voltage') || t.includes('electronics')) {
    return wrapScript(`class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header
        header = LayoutManager.create_header("Electric Circuit & Ohm's Law", "Voltage, Current, and Resistance (V = I · R)")
        self.play(FadeIn(header), run_time=1.2)

        # 2. Circuit Diagram
        circuit = CircuitVisualizer.create_rc_circuit().shift(UP * 0.3)
        self.play(Create(circuit[0]), run_time=1.5)
        self.play(FadeIn(circuit[1]), FadeIn(circuit[2]), GrowArrow(circuit[3][0]), Write(circuit[3][1]), run_time=2.0)
        self.wait(1.0)

        # 3. Calculation & Status
        status_calc = LayoutManager.create_status_bar("Ohm's Law: I = V / R = 12V / 4Ω = 3.0 Amperes", color=YELLOW)
        self.play(Write(status_calc), run_time=1.5)
        self.play(Indicate(circuit[2]), run_time=1.5)
        self.wait(2.0)
`);
  }

  // 8. Physics / Optics: Mirror Properties & Law of Reflection
  if (t.includes('mirror') || t.includes('reflection') || t.includes('optics') || t.includes('refraction') || t.includes('light')) {
    return wrapScript(`class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header
        header = LayoutManager.create_header("Law of Reflection & Mirror Properties", "Angle of Incidence (θi) = Angle of Reflection (θr)")
        self.play(FadeIn(header), run_time=1.2)

        # 2. Plane Mirror & Normal Line
        mirror_grp = OpticsVisualizer.create_plane_mirror(length=7.5, position=DOWN*1.0)
        self.play(Create(mirror_grp[0]), Create(mirror_grp[1]), run_time=1.5)
        self.play(Create(mirror_grp[2]), Write(mirror_grp[3]), run_time=1.2)
        self.wait(1.0)

        # 3. Incident Ray (θi = 40°)
        hit_pt = DOWN * 1.0
        inc_start = hit_pt + np.array([-3.2, 3.2, 0])
        inc_ray = Arrow(inc_start, hit_pt, color=YELLOW, buff=0, stroke_width=4)
        inc_lbl = Text("Incident Ray (θi = 45°)", font_size=18, color=YELLOW).next_to(inc_start, UP, buff=0.1)

        status_inc = LayoutManager.create_status_bar("Step 1: Light ray strikes the mirror surface at point of incidence", color=YELLOW)
        self.play(GrowArrow(inc_ray), Write(inc_lbl), Write(status_inc), run_time=1.8)
        self.wait(1.0)

        # 4. Reflected Ray (θr = θi = 40°)
        ref_end = hit_pt + np.array([3.2, 3.2, 0])
        ref_ray = Arrow(hit_pt, ref_end, color=ORANGE, buff=0, stroke_width=4)
        ref_lbl = Text("Reflected Ray (θr = 45°)", font_size=18, color=ORANGE).next_to(ref_end, UP, buff=0.1)

        status_ref = LayoutManager.create_status_bar("Step 2: Ray reflects symmetrically: Angle of Incidence = Angle of Reflection", color=GREEN)
        self.play(GrowArrow(ref_ray), Write(ref_lbl), ReplacementTransform(status_inc, status_ref), run_time=1.8)
        self.wait(1.0)

        # 5. Virtual Image Behind Mirror
        status_virtual = LayoutManager.create_status_bar("✓ Plane Mirror Properties: Virtual, Upright, Same Size, Equidistant", color=BLUE_B)
        self.play(ReplacementTransform(status_ref, status_virtual), run_time=1.5)
        self.play(Circumscribe(mirror_grp[0], color=GREEN), run_time=1.8)
        self.wait(2.0)
`);
  }

  // 9. Default: Projectile Motion Kinematics (Physics Gold Standard)
  return wrapScript(`class AutoTeach(Scene):
    def construct(self):
        self.camera.background_color = "#070b14"

        # 1. Header
        header = LayoutManager.create_header("Projectile Motion Kinematics", "2D Motion Under Constant Downward Gravity")
        self.play(FadeIn(header), run_time=1.2)

        # 2. Canvas & Ground
        axes, ground = KinematicsVisualizer.create_canvas(10, 6)
        origin_lbl = Text("(0,0)", font_size=16, color=GRAY).next_to(axes.c2p(0, 0), DL, buff=0.1)
        self.play(Create(axes), Create(ground), Write(origin_lbl), run_time=1.5)

        # 3. Launch Vector
        v0_val = 3.2
        theta_rad = np.radians(50)
        v0x = v0_val * np.cos(theta_rad)
        v0y = v0_val * np.sin(theta_rad)

        launch_pt = axes.c2p(0, 0)
        ball = Dot(launch_pt, color=YELLOW, radius=0.12)
        v0_arrow = Arrow(launch_pt, axes.c2p(v0x, v0y), color=YELLOW, buff=0, stroke_width=4)
        v0_lbl = Text("v₀ (50°)", font_size=18, color=YELLOW).next_to(v0_arrow.get_end(), UR, buff=0.1)

        self.play(FadeIn(ball), GrowArrow(v0_arrow), Write(v0_lbl), run_time=1.5)
        self.wait(0.8)

        # 4. Trajectory Simulation
        g = 9.8
        t_flight = 2 * v0y / (g * 0.22)
        t_tracker = ValueTracker(0.0)

        def traj_pos(t):
            x = v0x * t * 2.2
            y = (v0y * t - 0.5 * (g * 0.22) * t**2) * 2.2
            return axes.c2p(max(0, x), max(0, y))

        moving_ball = always_redraw(lambda: Dot(traj_pos(t_tracker.get_value()), color=YELLOW, radius=0.12))
        path = TracedPath(moving_ball.get_center, stroke_color=YELLOW_C, stroke_width=3.5)
        g_arrow = always_redraw(lambda: Arrow(traj_pos(t_tracker.get_value()), traj_pos(t_tracker.get_value()) + DOWN * 0.8, color=RED_B, buff=0, stroke_width=3))

        self.add(moving_ball, path, g_arrow)
        self.play(FadeOut(v0_arrow), FadeOut(v0_lbl), run_time=0.8)

        # Animate to Apex
        t_apex = v0y / (g * 0.22)
        status_apex = LayoutManager.create_status_bar("Apex H: Vertical velocity vy = 0 | H = v₀y² / (2g)", color=GREEN)
        self.play(t_tracker.animate.set_value(t_apex), Write(status_apex), run_time=2.5, rate_func=linear)
        self.wait(0.8)

        # Descent to Landing & Range
        status_range = LayoutManager.create_status_bar("✓ Landed: Total Range R = v₀² · sin(2θ) / g", color=BLUE_B)
        self.play(t_tracker.animate.set_value(t_flight), ReplacementTransform(status_apex, status_range), run_time=2.5, rate_func=linear)

        land_pt = traj_pos(t_flight)
        range_line = Line(axes.c2p(0, 0), land_pt, color=BLUE_B, stroke_width=4)
        range_brace = Brace(range_line, DOWN, buff=0.15)
        range_lbl = Text("Range R", font_size=16, color=BLUE_B).next_to(range_brace, DOWN, buff=0.08)

        self.play(Create(range_brace), Write(range_lbl), run_time=1.5)
        self.wait(2.0)
`);
}
