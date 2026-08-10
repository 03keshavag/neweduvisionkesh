/**
 * Domain Classifier & Concept Analyzer for Subject-Aware Educational Animations.
 *
 * Classifies the user topic into a visual domain, selects a deterministic pedagogical example,
 * and identifies the appropriate visualizer primitive.
 */
import type {DomainAnalysisResult, VisualDomain, VisualizerType} from '../types';

export function classifyTopicDomain(topic: string): DomainAnalysisResult {
  const t = topic.toLowerCase().trim();

  // 1. Computer Science: Sorting Algorithms
  if (t.includes('merge sort') || t.includes('bubble sort') || t.includes('quick sort') || t.includes('insertion sort') || (t.includes('sort') && t.includes('algorithm'))) {
    return {
      domain: 'Computer Science',
      subdomain: 'Algorithms',
      conceptType: 'sorting_algorithm',
      visualizerType: 'SortingVisualizer',
      entities: ['Array', 'Subarrays', 'Elements', 'Split Arrows', 'Comparisons'],
      relationships: ['left_half = arr[:mid]', 'right_half = arr[mid:]', 'compare and merge'],
      transformations: ['Divide array into halves', 'Recursive split to single elements', 'Two-pointer comparison and merge'],
      exampleData: {
        rawArray: [38, 27, 43, 3, 9, 82, 10],
        demoArray: [38, 27, 43, 3],
        leftHalf: [38, 27],
        rightHalf: [43, 3],
        sortedResult: [3, 27, 38, 43],
      },
      suggestedPointers: ['L', 'R', 'K'],
    };
  }

  // 2. Computer Science: Searching Algorithms (Binary Search, Linear Search)
  if (t.includes('binary search') || t.includes('linear search') || (t.includes('search') && (t.includes('array') || t.includes('algorithm')))) {
    return {
      domain: 'Computer Science',
      subdomain: 'Algorithms',
      conceptType: 'search_algorithm',
      visualizerType: 'SearchingVisualizer',
      entities: ['Sorted Array', 'LOW Pointer', 'MID Pointer', 'HIGH Pointer', 'Target Card'],
      relationships: ['LOW <= MID <= HIGH', 'MID = (LOW + HIGH) // 2', 'arr[MID] vs Target'],
      transformations: ['Calculate MID', 'Compare arr[MID] with target', 'Dim eliminated half', 'Move LOW or HIGH pointer', 'Highlight found target'],
      exampleData: {
        array: [3, 8, 12, 17, 23, 31, 42],
        target: 23,
        steps: [
          {low: 0, high: 6, mid: 3, midVal: 17, action: '17 < 23 => LOW = 4'},
          {low: 4, high: 6, mid: 5, midVal: 31, action: '31 > 23 => HIGH = 4'},
          {low: 4, high: 4, mid: 4, midVal: 23, action: '23 == 23 => FOUND at idx 4'},
        ],
      },
      suggestedPointers: ['LOW', 'MID', 'HIGH'],
    };
  }

  // 3. Computer Science: Graph Traversal (BFS, DFS, Dijkstra, Kruskal, Prim)
  if (t.includes('bfs') || t.includes('dfs') || t.includes('graph') || t.includes('dijkstra') || t.includes('shortest path') || t.includes('tree traversal')) {
    return {
      domain: 'Computer Science',
      subdomain: 'Data Structures & Graphs',
      conceptType: 'graph_traversal',
      visualizerType: 'GraphVisualizer',
      entities: ['Graph Nodes', 'Edges (Behind Nodes)', 'Traversal Queue / Stack', 'Visited Status Badges'],
      relationships: ['Node adjacency', 'Level order queue', 'Parent-child tree edges'],
      transformations: ['Enqueue start node', 'Visit node & color green', 'Explore neighbors', 'Update queue display at bottom'],
      exampleData: {
        nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
        edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'F']],
        startNode: 'A',
        traversalOrder: ['A', 'B', 'C', 'D', 'E', 'F'],
      },
      suggestedPointers: ['Current', 'Neighbor'],
    };
  }

  // 4. Computer Science: Linked List / Stack / Queue
  if (t.includes('linked list') || t.includes('stack') || t.includes('queue') || t.includes('data structure')) {
    return {
      domain: 'Data Structures',
      subdomain: 'Linear Data Structures',
      conceptType: 'linear_data_structure',
      visualizerType: t.includes('linked list') ? 'LinkedListVisualizer' : 'ArrayVisualizer',
      entities: ['Data Cells', 'Next Pointers', 'Head / Tail Pointers', 'New Node'],
      relationships: ['node.next -> next_node', 'head -> first_node'],
      transformations: ['Create new node in safe upper zone', 'Redirect pointers', 'Insert node into sequence'],
      exampleData: {
        initialList: [10, 20, 30],
        insertValue: 25,
        targetIndex: 2,
        resultList: [10, 20, 25, 30],
      },
      suggestedPointers: ['Head', 'Current', 'NewNode'],
    };
  }

  // 5. Mathematics: Derivatives & Calculus
  if (t.includes('derivative') || t.includes('calculus') || t.includes('tangent') || t.includes('slope') || t.includes('rate of change') || t.includes('limit')) {
    return {
      domain: 'Mathematics',
      subdomain: 'Calculus',
      conceptType: 'calculus_derivative',
      visualizerType: 'DerivativeVisualizer',
      entities: ['Coordinate Axes', 'Function Curve f(x)', 'Point (x0, f(x0))', 'Secant Line', 'Tangent Line', 'Slope Formula'],
      relationships: ['secant_slope = (f(x0+dx) - f(x0)) / dx', 'tangent_slope = f\'(x0) as dx -> 0'],
      transformations: ['Plot curve f(x)=0.25x²+0.5', 'Draw secant line with dx=2.0', 'Animate dx -> 0', 'Transform secant to green tangent line', 'Move tangent along curve'],
      exampleData: {
        functionStr: 'f(x) = 0.25x² + 0.5',
        x0: 1.5,
        derivativeStr: "f'(x) = 0.5x",
        slopeAtX0: 0.75,
      },
      suggestedPointers: ['x₀', 'x₀ + Δx'],
    };
  }

  // 6. Mathematics: Matrix Multiplication / Linear Algebra
  if (t.includes('matrix') || t.includes('linear algebra') || t.includes('determinant') || t.includes('vector transformation')) {
    return {
      domain: 'Mathematics',
      subdomain: 'Linear Algebra',
      conceptType: 'matrix_multiplication',
      visualizerType: 'MatrixVisualizer',
      entities: ['Matrix A (2x2)', 'Matrix B (2x2)', 'Result Matrix C', 'Row Highlight Box', 'Column Highlight Box', 'Dot Product Calculation'],
      relationships: ['C[i][j] = sum(A[i][k] * B[k][j])'],
      transformations: ['Highlight Row i of A and Column j of B', 'Animate dot product multiplication', 'Place result in C[i][j]'],
      exampleData: {
        matrixA: [[1, 2], [3, 4]],
        matrixB: [[5, 6], [7, 8]],
        matrixC: [[19, 22], [43, 50]],
      },
    };
  }

  // 7. Physics: Projectile Motion / Kinematics
  if (t.includes('projectile') || t.includes('motion') || t.includes('trajectory') || t.includes('kinematics') || t.includes('gravity')) {
    return {
      domain: 'Physics',
      subdomain: 'Mechanics',
      conceptType: 'projectile_motion',
      visualizerType: 'KinematicsVisualizer',
      entities: ['Axes & Ground Line', 'Moving Particle', 'Velocity Vector v0', 'Components v0x & v0y', 'Gravity Vector g', 'Apex H', 'Range R'],
      relationships: ['x(t) = v0x * t', 'y(t) = v0y * t - 0.5*g*t^2', 'vy = 0 at Apex'],
      transformations: ['Launch particle at angle theta', 'Decompose into horizontal & vertical velocity', 'Trace parabolic path', 'Highlight apex H with vy=0', 'Measure ground range R'],
      exampleData: {
        v0: 20,
        thetaDeg: 45,
        g: 9.8,
        hMaxFormula: 'H = v₀y² / (2g)',
        rangeFormula: 'R = v₀² · sin(2θ) / g',
      },
      suggestedPointers: ['v₀', 'v₀x', 'v₀y', 'g↓'],
    };
  }

  // 8. Physics: Newton's Laws / Forces
  if (t.includes('newton') || t.includes('force') || t.includes('friction') || t.includes('acceleration')) {
    return {
      domain: 'Physics',
      subdomain: 'Dynamics',
      conceptType: 'newton_laws',
      visualizerType: 'KinematicsVisualizer',
      entities: ['Mass Block', 'Force Arrow F', 'Friction Arrow f', 'Acceleration Vector a', 'Surface Plane'],
      relationships: ['F_net = m * a', 'f_friction = mu * N'],
      transformations: ['Apply force vector to block', 'Overcome friction threshold', 'Accelerate block across surface', 'Display F = m · a box'],
      exampleData: {
        mass: 'm = 2 kg',
        force: 'F = 10 N',
        accel: 'a = 5 m/s²',
      },
    };
  }

  // 9. Chemistry: Chemical Reactions & Molecular Bonding
  if (t.includes('chemical') || t.includes('reaction') || t.includes('methane') || t.includes('bonding') || t.includes('combustion') || t.includes('molecule') || t.includes('chemistry') || t.includes('ionic') || t.includes('covalent')) {
    return {
      domain: 'Chemistry',
      subdomain: 'Chemical Reactions & Bonding',
      conceptType: 'chemical_reaction',
      visualizerType: 'MoleculeVisualizer',
      entities: ['Reactant Molecules (CH4 + 2 O2)', 'Atom Spheres (C, H, O)', 'Bonds', 'Reaction Arrow', 'Product Molecules (CO2 + 2 H2O)', 'Exothermic Badge'],
      relationships: ['Conservation of mass / atoms', 'Bond breaking requires activation energy', 'Bond forming releases energy'],
      transformations: ['Present reactant molecules', 'Simulate bond vibration & collision', 'Rearrange atoms into product molecules', 'Display balanced equation'],
      exampleData: {
        reactants: 'CH₄ + 2 O₂',
        products: 'CO₂ + 2 H₂O',
        equation: 'CH₄ + 2 O₂ ⟶ CO₂ + 2 H₂O + ΔH',
      },
    };
  }

  // 10. Biology: DNA Replication / Genetics / Cell Division
  if (t.includes('dna') || t.includes('rna') || t.includes('replication') || t.includes('biology') || t.includes('cell') || t.includes('mitosis') || t.includes('photosynthesis')) {
    return {
      domain: 'Biology',
      subdomain: 'Molecular Biology',
      conceptType: 'dna_replication',
      visualizerType: 'DNAVisualizer',
      entities: ['Double Helix Backbone Strands', 'Base Pairs (A-T, G-C)', 'Helicase Enzyme Indicator', 'Complementary Free Nucleotides', 'Two Daughter Strands'],
      relationships: ['Adenine pairs with Thymine (A-T)', 'Guanine pairs with Cytosine (G-C)', 'Semi-conservative replication'],
      transformations: ['Display parent double helix', 'Unzip hydrogen bonds at replication fork', 'Attach complementary base pairs', 'Form two identical daughter DNA strands'],
      exampleData: {
        sequence: ['A-T', 'C-G', 'T-A', 'G-C'],
        rule: 'Complementary Base Pairing: A ↔ T, G ↔ C',
      },
    };
  }

  // 11. Electronics & Circuits
  if (t.includes('circuit') || t.includes('resistor') || t.includes('capacitor') || t.includes('ohm') || t.includes('voltage') || t.includes('current') || t.includes('electronics')) {
    return {
      domain: 'Electronics',
      subdomain: 'Circuit Analysis',
      conceptType: 'electric_circuit',
      visualizerType: 'CircuitVisualizer',
      entities: ['DC Voltage Source', 'Resistor R', 'Capacitor C', 'Connecting Wire Loop', 'Current Flow Arrows I'],
      relationships: ['V = I * R (Ohm\'s Law)', 'I = V / R'],
      transformations: ['Assemble circuit loop', 'Close switch and activate current flow', 'Highlight potential drop across resistor', 'Display Ohm\'s Law equation'],
      exampleData: {
        voltage: 'V = 12 V',
        resistance: 'R = 4 Ω',
        current: 'I = 3 A',
        formula: 'I = V / R = 12V / 4Ω = 3A',
      },
    };
  }

  // 12. Default / General Science
  return {
    domain: 'General Science',
    subdomain: 'Conceptual Explainer',
    conceptType: 'general_scientific_concept',
    visualizerType: 'GenericVisualizer',
    entities: ['Primary Visual Model', 'Component Entities', 'Relationship Vectors', 'Summary Formula / Badge'],
    relationships: ['Cause -> Effect', 'Input -> Transformation -> Output'],
    transformations: ['Establish visual setup', 'Animate core transformation', 'Highlight key inflection point', 'Present summary'],
    exampleData: {
      topic,
    },
  };
}
