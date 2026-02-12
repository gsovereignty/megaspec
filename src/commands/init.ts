import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { output, type OutputContext } from '../utils/output-context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIRECTORIES = ['publish', 'drafts', 'archive', 'templates', 'docflow'];

const TEMPLATE_FILES = [
  'tutorial.md',
  'reference.md',
  'guide.md',
  'whitepaper.md',
];

const PROJECT_MD_CONTENT = `# DocFlow Project

## Configuration

\`\`\`yaml
agents:
  mode: single
  interaction: interview
  roles:
    researcher: true
    writer: true
    reviewer: true
  human_review: required
\`\`\`

## Content Types

- tutorial
- reference
- guide
- whitepaper
`;

function getTemplatesDir(): string {
  return path.resolve(__dirname, '..', 'templates');
}

function ensureDir(dirPath: string): { path: string; created: boolean } {
  if (fs.existsSync(dirPath)) {
    return { path: dirPath, created: false };
  }
  fs.mkdirSync(dirPath, { recursive: true });
  return { path: dirPath, created: true };
}

function writeFileIfNotExists(
  filePath: string,
  content: string,
): { path: string; created: boolean } {
  if (fs.existsSync(filePath)) {
    return { path: filePath, created: false };
  }
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  return { path: filePath, created: true };
}

export function scaffold(targetDir: string): {
  created: string[];
  skipped: string[];
} {
  const created: string[] = [];
  const skipped: string[] = [];

  // Ensure target directory exists
  ensureDir(targetDir);

  // Create directories
  for (const dir of DIRECTORIES) {
    const result = ensureDir(path.join(targetDir, dir));
    if (result.created) {
      created.push(dir + '/');
    } else {
      skipped.push(dir + '/');
    }
  }

  // Create project.md
  const projectMdResult = writeFileIfNotExists(
    path.join(targetDir, 'project.md'),
    PROJECT_MD_CONTENT,
  );
  if (projectMdResult.created) {
    created.push('project.md');
  } else {
    skipped.push('project.md');
  }

  // Copy template files
  const templatesSourceDir = getTemplatesDir();
  for (const templateFile of TEMPLATE_FILES) {
    const sourcePath = path.join(templatesSourceDir, templateFile);
    const destPath = path.join(targetDir, 'templates', templateFile);

    let content: string;
    if (fs.existsSync(sourcePath)) {
      content = fs.readFileSync(sourcePath, 'utf-8');
    } else {
      // Fallback: generate minimal template if bundled file not found
      content = generateFallbackTemplate(templateFile);
    }

    const result = writeFileIfNotExists(destPath, content);
    if (result.created) {
      created.push('templates/' + templateFile);
    } else {
      skipped.push('templates/' + templateFile);
    }
  }

  // Copy AGENTS.md into docflow/
  const agentsSourcePath = path.join(templatesSourceDir, 'agents.md');
  const agentsDestPath = path.join(targetDir, 'docflow', 'AGENTS.md');
  let agentsContent: string;
  if (fs.existsSync(agentsSourcePath)) {
    agentsContent = fs.readFileSync(agentsSourcePath, 'utf-8');
  } else {
    agentsContent = generateFallbackAgentsTemplate();
  }
  const agentsResult = writeFileIfNotExists(agentsDestPath, agentsContent);
  if (agentsResult.created) {
    created.push('docflow/AGENTS.md');
  } else {
    skipped.push('docflow/AGENTS.md');
  }

  return { created, skipped };
}

function generateFallbackTemplate(filename: string): string {
  const type = filename.replace('.md', '');
  return `---
type: ${type}
title: ''
id: ''
audience: ''
---

# ${type.charAt(0).toUpperCase() + type.slice(1)}
`;
}

function generateFallbackAgentsTemplate(): string {
  return `# DocFlow Writing Instructions

These instructions are for AI coding assistants helping subject matter experts (SMEs) write documentation using DocFlow.

## Quick Reference Checklist

- [ ] Opening hook in first paragraph
- [ ] Question before answer in each section
- [ ] Concrete examples (no foo/bar)
- [ ] Active voice with "you"
- [ ] Short paragraphs (≤6 sentences)
- [ ] Short lists (≤7 items)
- [ ] Descriptive headings
- [ ] Next steps section
- [ ] No LLM vocabulary
- [ ] Agent Contributions section at end of every artifact

## Agent Contributions Format

Every artifact MUST end with:

\`\`\`markdown
## Agent Contributions

### Role
[role and mode]

### Assumptions
- [list of assumptions]

### Unknowns
- [items needing verification, or "None"]
\`\`\`

Run \`docflow init\` with the bundled templates for the full instruction set.
`;
}

export function registerInitCommand(
  program: Command,
  getCtx: () => OutputContext,
): void {
  program
    .command('init')
    .description('Initialize a new DocFlow project')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action((targetPath?: string) => {
      const ctx = getCtx();
      const resolvedPath = path.resolve(targetPath ?? '.');

      const result = scaffold(resolvedPath);

      if (ctx.json) {
        output(ctx, '', {
          success: true,
          created: result.created,
          skipped: result.skipped,
        });
      } else {
        if (result.created.length > 0) {
          output(ctx, 'Created:', {});
          for (const item of result.created) {
            output(ctx, `  ${item}`, {});
          }
        }
        if (result.skipped.length > 0) {
          output(ctx, 'Skipped (already exist):', {});
          for (const item of result.skipped) {
            output(ctx, `  ${item}`, {});
          }
        }
        if (result.created.length === 0 && result.skipped.length === 0) {
          output(ctx, 'Nothing to do.', {});
        }
        output(
          ctx,
          `\nDocFlow project initialized at ${resolvedPath}`,
          {},
        );
      }
    });
}
