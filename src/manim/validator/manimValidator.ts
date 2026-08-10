/**
 * Validates Python Manim code for syntax correctness, scene class definitions,
 * and security constraints before execution.
 */
import {writeFile, unlink} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);

const DANGEROUS_PATTERNS = [
  /\bimport\s+(os|sys|subprocess|shutil|socket|pty|requests|urllib|pathlib|ctypes|winreg|pickle)\b/,
  /\bfrom\s+(os|sys|subprocess|shutil|socket|pty|requests|urllib|pathlib|ctypes|winreg|pickle)\b/,
  /\b(__import__|eval|exec|compile|open)\s*\(/,
  /\b(system|popen|spawn|fork)\s*\(/,
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sceneClassName: string;
}

export async function validateManimScript(code: string, expectedClass = 'EduVisionScene'): Promise<ValidationResult> {
  // 1. Basic non-empty check
  if (!code || code.trim().length < 50) {
    return {valid: false, error: 'Generated Manim script is empty or too short.', sceneClassName: expectedClass};
  }

  // 2. Security scanner
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      return {
        valid: false,
        error: `Security violation: script contains forbidden import or call matching ${pattern}`,
        sceneClassName: expectedClass,
      };
    }
  }

  // 3. Expected Scene class definition
  const classPattern = new RegExp(`class\\s+(${expectedClass}|AutoTeach|[A-Za-z0-9_]+Scene|[A-Za-z0-9_]+)\\s*\\(\\s*Scene\\s*\\):`);
  const classMatch = code.match(classPattern);
  if (!classMatch) {
    return {
      valid: false,
      error: `Missing required Scene class '${expectedClass}(Scene)' or 'AutoTeach(Scene)' in script.`,
      sceneClassName: expectedClass,
    };
  }
  const detectedClassName = classMatch[1];

  // 4. Check that manim is imported
  if (!code.includes('from manim import') && !code.includes('import manim')) {
    return {
      valid: false,
      error: "Script is missing 'from manim import *' import statement.",
      sceneClassName: detectedClassName,
    };
  }

  // 5. Python AST / Compilation syntax check
  const tempFile = path.join(os.tmpdir(), `validate_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.py`);
  try {
    await writeFile(tempFile, code, 'utf-8');
    await execFileAsync('python3', ['-m', 'py_compile', tempFile], {timeout: 5000});
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      error: `Python syntax compilation error: ${message}`,
      sceneClassName: detectedClassName,
    };
  } finally {
    await unlink(tempFile).catch(() => {});
  }

  return {valid: true, sceneClassName: detectedClassName};
}
