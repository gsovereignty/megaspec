export interface OutputContext {
  json: boolean;
  noInteractive: boolean;
}

export function createOutputContext(
  json: boolean,
  noInteractive: boolean,
): OutputContext {
  return { json, noInteractive };
}

export function output(
  ctx: OutputContext,
  humanMessage: string,
  jsonData: unknown,
): void {
  if (ctx.json) {
    process.stdout.write(JSON.stringify(jsonData) + '\n');
  } else {
    process.stdout.write(humanMessage + '\n');
  }
}

export function outputError(
  ctx: OutputContext,
  humanMessage: string,
  errorData: unknown,
): void {
  if (ctx.json) {
    process.stdout.write(
      JSON.stringify({ success: false, error: errorData }) + '\n',
    );
  } else {
    process.stderr.write(humanMessage + '\n');
  }
}
