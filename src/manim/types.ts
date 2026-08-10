/**
 * Type definitions for EduVision's Subject-Aware Manim generation & rendering engine.
 */

export type VisualDomain =
  | 'Computer Science'
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Electronics'
  | 'Statistics'
  | 'Data Structures'
  | 'Algorithms'
  | 'Engineering'
  | 'General Science';

export type VisualizerType =
  | 'ArrayVisualizer'
  | 'LinkedListVisualizer'
  | 'TreeVisualizer'
  | 'GraphVisualizer'
  | 'SortingVisualizer'
  | 'SearchingVisualizer'
  | 'FunctionVisualizer'
  | 'DerivativeVisualizer'
  | 'IntegralVisualizer'
  | 'KinematicsVisualizer'
  | 'CircuitVisualizer'
  | 'MoleculeVisualizer'
  | 'DNAVisualizer'
  | 'MatrixVisualizer'
  | 'ProbabilityVisualizer'
  | 'GenericVisualizer';

export interface DomainAnalysisResult {
  domain: VisualDomain;
  subdomain: string;
  conceptType: string;
  visualizerType: VisualizerType;
  entities: string[];
  relationships: string[];
  transformations: string[];
  exampleData: Record<string, any>;
  suggestedPointers?: string[];
}

export interface ManimScenePlan {
  id: string;
  purpose: string;
  narration: string;
  estimatedDuration: number;
  visualObjective: string;
  keyEntities: string[];
  transformations: string[];
  equations?: string[];
  layoutZone?: 'header' | 'main_stage' | 'upper_lane' | 'lower_lane' | 'bottom_band';
}

export interface ManimEducationalPlan {
  id: string;
  title: string;
  topic: string;
  subject: VisualDomain;
  domainAnalysis?: DomainAnalysisResult;
  language: string;
  ageGroup?: string;
  learningObjective: string;
  scenes: ManimScenePlan[];
  totalEstimatedDuration: number;
}

export interface ManimScriptResult {
  code: string;
  sceneClassName: string;
  plan: ManimEducationalPlan;
}

export interface ManimRenderOptions {
  scriptPath: string;
  sceneClassName: string;
  outputDir: string;
  jobId: string;
  quality?: 'l' | 'm' | 'h' | 'k'; // low (480p), medium (720p), high (1080p), 4k (2160p)
  fps?: number;
  timeoutMs?: number;
}

export interface ManimRenderResult {
  videoPath: string;
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
}

export interface AudioMuxOptions {
  videoPath: string;
  audioPath: string;
  outputPath: string;
}

export type ManimPipelineStage =
  | 'domain-analysis'
  | 'plan'
  | 'tts'
  | 'manim-script'
  | 'manim-render'
  | 'mux'
  | 'completed'
  | 'failed';
