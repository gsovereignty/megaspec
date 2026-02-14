import { Command } from 'commander';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { input, select } from '@inquirer/prompts';
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

const CONTENT_TYPES = ['tutorial', 'guide', 'reference', 'whitepaper'] as const;
type ContentType = (typeof CONTENT_TYPES)[number];
type InteractionMode = 'interview' | 'transform';

const DEFAULT_PROJECT_MD = `# DocFlow Project

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

export interface InitAnswers {
  projectName: string;
  contentType: ContentType;
  audience: string;
  topic: string;
  interactionMode: InteractionMode;
}

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

export function copyToClipboard(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const platform = process.platform;
    if (platform === 'darwin') {
      execSync('pbcopy', { input: content });
      return true;
    } else if (platform === 'linux') {
      execSync('xclip -selection clipboard', { input: content });
      return true;
    } else if (platform === 'win32') {
      execSync('clip', { input: content });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function generateProjectMd(answers: InitAnswers): string {
  return `# ${answers.projectName}

## Configuration

\`\`\`yaml
agents:
  mode: single
  interaction: ${answers.interactionMode}
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
}

export function generatePromptMd(answers: InitAnswers): string {
  const slug = toSlug(answers.projectName);
  const lines: string[] = [
    `# Writing Prompt: ${answers.projectName}`,
    '',
    '> Paste this prompt into your AI assistant to start writing.',
    '',
    '---',
    '',
    `**Instructions file:** Read and follow \`docflow/AGENTS.md\` — it contains all the writing rules and workflows you need.`,
    '',
    `**Content type:** ${answers.contentType} (see \`templates/${answers.contentType}.md\` for the required structure)`,
    '',
    `**Target audience:** ${answers.audience}`,
    '',
    `**Topic:** ${answers.topic}`,
    '',
    `**Output directory:** \`drafts/${slug}/\``,
    '',
  ];

  if (answers.interactionMode === 'interview') {
    lines.push(
      '## Mode: Interview',
      '',
      `You are helping a subject matter expert write a ${answers.contentType} about "${answers.topic}" for ${answers.audience}.`,
      '',
      'Follow the **Interview Mode** instructions in `docflow/AGENTS.md`. Here is what you need to do:',
      '',
      `1. Read the ${answers.contentType} template from \`templates/${answers.contentType}.md\` to understand the required sections.`,
      '2. Ask the SME the 7 interview questions (listed in AGENTS.md under Interview Mode → Step 2), one at a time. Wait for each answer before asking the next question.',
      '',
      '   The questions are:',
      '   1. "Who is the target reader?"',
      '   2. "What should they be able to do after reading this?"',
      '   3. "What do they already know?"',
      '   4. "What\'s the core problem this solves?"',
      '   5. "Walk me through the main steps/concepts."',
      '   6. "What mistakes do people commonly make?"',
      '   7. "What\'s the surprising insight or key takeaway?"',
      '',
      '   **Context already provided:**',
      `   - Target audience: ${answers.audience}`,
      `   - Topic: ${answers.topic}`,
      '',
      '   You may skip or adapt question 1 since the audience is already specified. Use the remaining questions to gather the SME\'s domain knowledge.',
      '',
      `3. Generate \`drafts/${slug}/outline.md\` from the answers, following the ${answers.contentType} template structure.`,
      `4. Draft \`drafts/${slug}/content.md\` following the outline and applying the engagement rules from AGENTS.md.`,
      `5. Generate \`drafts/${slug}/checklist.md\` mapping content to the validation criteria.`,
      '6. Include `## Agent Contributions` (with `### Role`, `### Assumptions`, `### Unknowns`) at the end of every artifact.',
      '',
    );
  } else {
    lines.push(
      '## Mode: Transform',
      '',
      `You are helping a subject matter expert restructure raw content into a ${answers.contentType} about "${answers.topic}" for ${answers.audience}.`,
      '',
      'Follow the **Transform Mode** instructions in `docflow/AGENTS.md`. Here is what you need to do:',
      '',
      '1. Ask the SME to provide their raw content — notes, bullet points, rough draft, or brain dump.',
      `2. Read the ${answers.contentType} template from \`templates/${answers.contentType}.md\` to understand the required sections.`,
      '3. Analyze the raw input for engagement gaps: missing hooks, absent examples, passive voice, cognitive load issues, missing structure.',
      '4. Share your analysis with the SME before proceeding.',
      `5. Generate \`drafts/${slug}/outline.md\` mapping the raw content to the ${answers.contentType} template structure.`,
      `6. Transform the content into \`drafts/${slug}/content.md\` applying: opening hook, tension-release per section, concrete examples, reader-centric voice, progressive disclosure.`,
      `7. Generate \`drafts/${slug}/checklist.md\` mapping content to the validation criteria.`,
      '8. Include `## Agent Contributions` (with `### Role`, `### Assumptions`, `### Unknowns`) at the end of every artifact.',
      '',
      '**Critical rule:** Never hallucinate domain claims. Preserve all of the SME\'s factual content exactly. Flag uncertain transformations in `### Unknowns`.',
      '',
    );
  }

  lines.push(
    '---',
    '',
    `When done, the SME can run \`docflow validate ${slug}\` to check the content against engagement rules, and \`docflow metrics ${slug}\` to see engagement scores.`,
  );

  return lines.join('\n') + '\n';
}

export async function promptUser(): Promise<InitAnswers> {
  const projectName = await input({
    message: 'Project name:',
    validate: (val) => (val.trim().length > 0 ? true : 'Project name is required'),
  });

  const contentType = await select<ContentType>({
    message: 'Content type:',
    choices: [
      { name: 'Tutorial — step-by-step learning with exercises', value: 'tutorial' },
      { name: 'Guide — practical how-to with examples', value: 'guide' },
      { name: 'Reference — structured lookup documentation', value: 'reference' },
      { name: 'Whitepaper — in-depth analysis with evidence', value: 'whitepaper' },
    ],
  });

  const audience = await input({
    message: 'Target audience (e.g., "Backend developers familiar with Express"):',
    validate: (val) => (val.trim().length > 0 ? true : 'Audience description is required'),
  });

  const topic = await input({
    message: 'Topic (e.g., "How to deploy a WebSocket server to production"):',
    validate: (val) => (val.trim().length > 0 ? true : 'Topic description is required'),
  });

  const interactionMode = await select<InteractionMode>({
    message: 'How do you want to work with your AI assistant?',
    choices: [
      { name: 'Interview — AI asks questions, you answer', value: 'interview' },
      { name: 'Transform — you provide raw notes, AI restructures', value: 'transform' },
    ],
  });

  return { projectName, contentType, audience, topic, interactionMode };
}

export function scaffold(
  targetDir: string,
  answers?: InitAnswers,
): {
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

  // Create project.md — tailored if answers provided, default otherwise
  const projectMdContent = answers ? generateProjectMd(answers) : DEFAULT_PROJECT_MD;
  const projectMdResult = writeFileIfNotExists(
    path.join(targetDir, 'project.md'),
    projectMdContent,
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

  // If interactive answers provided, scaffold drafts/<slug>/ and PROMPT.md
  if (answers) {
    const slug = toSlug(answers.projectName);
    const draftDir = path.join(targetDir, 'drafts', slug);
    const draftDirResult = ensureDir(draftDir);
    if (draftDirResult.created) {
      created.push(`drafts/${slug}/`);
    } else {
      skipped.push(`drafts/${slug}/`);
    }

    const promptContent = generatePromptMd(answers);
    const promptResult = writeFileIfNotExists(
      path.join(draftDir, 'PROMPT.md'),
      promptContent,
    );
    if (promptResult.created) {
      created.push(`drafts/${slug}/PROMPT.md`);
    } else {
      skipped.push(`drafts/${slug}/PROMPT.md`);
    }
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
    .action(async (targetPath?: string) => {
      const ctx = getCtx();
      const resolvedPath = path.resolve(targetPath ?? '.');

      // Interactive mode: ask questions unless --no-interactive or --json
      let answers: InitAnswers | undefined;
      if (!ctx.noInteractive && !ctx.json) {
        answers = await promptUser();
      }

      const result = scaffold(resolvedPath, answers);

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

        if (answers) {
          const slug = toSlug(answers.projectName);
          const promptPath = path.join(resolvedPath, 'drafts', slug, 'PROMPT.md');
          const copied = copyToClipboard(promptPath);
          output(ctx, '', {});
          if (copied) {
            output(
              ctx,
              `✓ Prompt copied to clipboard. Paste it into your AI assistant to start writing.`,
              {},
            );
          } else {
            output(
              ctx,
              `Next step: Open drafts/${slug}/PROMPT.md and paste it into your AI assistant.`,
              {},
            );
          }
        }
      }
    });
}
