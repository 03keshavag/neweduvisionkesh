/**
 * Machine-generated API Registry and Contract for EduVision Custom Visual Primitives.
 * Injected into LLM code generation prompts to strictly eliminate API hallucination.
 */

export const CUSTOM_API_CONTRACT = `
================================================================================
SUPPORTED EDUVISION CUSTOM PRIMITIVES (OPTIONAL HELPERS):
================================================================================
If a concept is not directly served by these helpers, use STANDARD MANIM PRIMITIVES
(Axes, NumberPlane, Circle, Square, Rectangle, RoundedRectangle, Line, Arrow,
CurvedArrow, Dot, Arc, Text, VGroup, Brace, SurroundingRectangle, etc.).

1. LayoutManager:
   - LayoutManager.create_header(title_text: str, subtitle_text: str = "") -> VGroup
   - LayoutManager.create_status_bar(text_str: str, color = YELLOW) -> Text
   - LayoutManager.create_equation_card(equation_str: str, label: str = "", color = YELLOW) -> VGroup
   - LayoutManager.clear_stage(scene: Scene, preserve = None, run_time = 0.6) -> None
   - LayoutManager.safe_scale(mob: Mobject, max_w: float = 11.2, max_h: float = 5.2) -> Mobject

2. ArrayVisualizer(values: list, box_size: float = 0.8, color = BLUE_D, font_size: int = 22, show_indices: bool = True):
   - .get_group() -> VGroup (Entire visualizer group)
   - .get_element(idx: int) -> VGroup (Square + Text + optional Index)
   - .get_box(idx: int) -> Square
   - .get_val_mob(idx: int) -> Text
   - .create_pointer(idx: int, label: str = "", is_upper: bool = False, color = YELLOW) -> VGroup (Arrow + Label)

3. GraphVisualizer(positions_dict: dict[str, np.ndarray], edge_pairs: list[tuple[str, str]], radius: float = 0.38):
   - .get_group() -> VGroup (All edges and nodes combined)
   - .get_node(name: str) -> VGroup (Circle + Text)
   - .set_visited(name: str, color = GREEN) -> Animation (Animates node fill & stroke)

4. TreeVisualizer(root_val = None, tree_dict: dict = None, radius: float = 0.35):
   - .get_group() -> VGroup
   - .get_node(key: str) -> VGroup (key in ["root", "L", "R", "LL", "LR", "RL", "RR"])

5. LinkedListVisualizer(values: list, node_w: float = 1.2, node_h: float = 0.7, color = BLUE_B):
   - .get_group() -> VGroup
   - .get_node(idx: int) -> VGroup

6. KinematicsVisualizer:
   - KinematicsVisualizer.create_canvas(x_max: float = 10, y_max: float = 6) -> (Axes, Line)

7. OpticsVisualizer:
   - OpticsVisualizer.create_plane_mirror(length: float = 7.5, position = DOWN*1.0) -> VGroup
   - OpticsVisualizer.create_concave_lens(height: float = 4.5, focal_length: float = 2.5) -> VGroup
   - OpticsVisualizer.create_concave_mirror(radius: float = 3.5) -> VGroup

8. BioChemVisualizer:
   - BioChemVisualizer.create_chemical_reaction(reactants: str, products: str, catalyst: str = "") -> VGroup
   - BioChemVisualizer.create_action_reaction_pair(action_text: str, reaction_text: str) -> VGroup

9. CircuitVisualizer:
   - CircuitVisualizer.create_rc_circuit(voltage: float = 12, resistance: float = 4) -> VGroup

10. MatrixVisualizer:
    - MatrixVisualizer.create_matrix(matrix_vals: list[list]) -> VGroup

11. MoleculeVisualizer:
    - MoleculeVisualizer.make_atom(symbol: str, color = BLUE, radius: float = 0.3) -> VGroup
    - MoleculeVisualizer.make_bond(atom1: VGroup, atom2: VGroup, color = GRAY) -> Line
================================================================================
`;
