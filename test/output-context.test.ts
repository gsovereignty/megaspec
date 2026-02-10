import { describe, it, expect } from 'vitest';
import {
  createOutputContext,
  output,
  outputError,
} from '../src/utils/output-context.js';

describe('OutputContext', () => {
  it('creates context with json=false, noInteractive=false', () => {
    const ctx = createOutputContext(false, false);
    expect(ctx.json).toBe(false);
    expect(ctx.noInteractive).toBe(false);
  });

  it('creates context with json=true, noInteractive=true', () => {
    const ctx = createOutputContext(true, true);
    expect(ctx.json).toBe(true);
    expect(ctx.noInteractive).toBe(true);
  });

  it('output writes human message when json=false', () => {
    const ctx = createOutputContext(false, false);
    const chunks: string[] = [];
    const origWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      chunks.push(chunk);
      return true;
    }) as typeof process.stdout.write;

    output(ctx, 'hello human', { data: 'json' });
    process.stdout.write = origWrite;

    expect(chunks).toEqual(['hello human\n']);
  });

  it('output writes JSON when json=true', () => {
    const ctx = createOutputContext(true, false);
    const chunks: string[] = [];
    const origWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      chunks.push(chunk);
      return true;
    }) as typeof process.stdout.write;

    output(ctx, 'hello human', { data: 'json' });
    process.stdout.write = origWrite;

    expect(chunks.length).toBe(1);
    expect(JSON.parse(chunks[0])).toEqual({ data: 'json' });
  });

  it('outputError writes JSON error when json=true', () => {
    const ctx = createOutputContext(true, false);
    const chunks: string[] = [];
    const origWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      chunks.push(chunk);
      return true;
    }) as typeof process.stdout.write;

    outputError(ctx, 'something broke', 'error details');
    process.stdout.write = origWrite;

    expect(chunks.length).toBe(1);
    expect(JSON.parse(chunks[0])).toEqual({
      success: false,
      error: 'error details',
    });
  });

  it('outputError writes to stderr when json=false', () => {
    const ctx = createOutputContext(false, false);
    const chunks: string[] = [];
    const origWrite = process.stderr.write;
    process.stderr.write = ((chunk: string) => {
      chunks.push(chunk);
      return true;
    }) as typeof process.stderr.write;

    outputError(ctx, 'something broke', 'error details');
    process.stderr.write = origWrite;

    expect(chunks).toEqual(['something broke\n']);
  });
});
