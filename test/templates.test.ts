import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { scaffold } from '../src/commands/init.js';

describe('content-type templates', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docflow-tpl-'));
    scaffold(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('tutorial.md (DF-040P)', () => {
    it('has correct YAML front matter', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, 'templates', 'tutorial.md'),
        'utf-8',
      );
      expect(content).toMatch(/^---\n/);
      expect(content).toMatch(/type:\s*tutorial/);
      expect(content).toMatch(/title:/);
      expect(content).toMatch(/id:/);
      expect(content).toMatch(/audience:/);
    });

    it('contains required sections', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, 'templates', 'tutorial.md'),
        'utf-8',
      );
      expect(content).toMatch(/## Learning Objectives/);
      expect(content).toMatch(/## Prerequisites/);
      expect(content).toMatch(/## Worked Example/);
      expect(content).toMatch(/## Practice Exercise/);
      expect(content).toMatch(/## Next Steps/);
    });

    it('contains opening hook comment', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, 'templates', 'tutorial.md'),
        'utf-8',
      );
      expect(content).toMatch(/Opening hook/i);
    });
  });

  describe('reference.md (DF-041P)', () => {
    it('has correct YAML front matter', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, 'templates', 'reference.md'),
        'utf-8',
      );
      expect(content).toMatch(/type:\s*reference/);
      expect(content).toMatch(/title:/);
      expect(content).toMatch(/id:/);
      expect(content).toMatch(/audience:/);
    });

    it('contains required sections', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, 'templates', 'reference.md'),
        'utf-8',
      );
      // Heading hierarchy
      expect(content).toMatch(/^## /m);
      expect(content).toMatch(/^### /m);
      // Code examples
      expect(content).toMatch(/```/);
    });
  });

  describe('guide.md (DF-042P)', () => {
    it('has correct YAML front matter', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, 'templates', 'guide.md'),
        'utf-8',
      );
      expect(content).toMatch(/type:\s*guide/);
      expect(content).toMatch(/title:/);
      expect(content).toMatch(/id:/);
      expect(content).toMatch(/audience:/);
    });

    it('contains required sections', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, 'templates', 'guide.md'),
        'utf-8',
      );
      expect(content).toMatch(/Opening hook/i);
      expect(content).toMatch(/\*\*Example\*\*/);
      expect(content).toMatch(/question/i);
      expect(content).toMatch(/## Next Steps/);
    });
  });

  describe('whitepaper.md (DF-043P)', () => {
    it('has correct YAML front matter', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, 'templates', 'whitepaper.md'),
        'utf-8',
      );
      expect(content).toMatch(/type:\s*whitepaper/);
      expect(content).toMatch(/title:/);
      expect(content).toMatch(/id:/);
      expect(content).toMatch(/audience:/);
    });

    it('contains required sections', () => {
      const content = fs.readFileSync(
        path.join(tmpDir, 'templates', 'whitepaper.md'),
        'utf-8',
      );
      expect(content).toMatch(/Opening hook/i);
      expect(content).toMatch(/ethos/i);
      expect(content).toMatch(/evidence|citations/i);
      expect(content).toMatch(/logical/i);
    });
  });
});
