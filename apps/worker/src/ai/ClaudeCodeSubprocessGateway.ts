import { spawn } from 'child_process';

interface ClaudeJsonOutput {
  result: string;
  is_error?: boolean;
  cost_usd?: number;
}

export interface SubprocessResult {
  text: string;
  costUsd: number;
}

export class ClaudeCodeSubprocessGateway {
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(
    model = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6',
    timeoutMs = 120_000,
  ) {
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  async run(userPrompt: string, systemPrompt?: string): Promise<SubprocessResult> {
    return new Promise((resolve, reject) => {
      const args = [
        '-p', userPrompt,
        '--output-format', 'json',
        '--model', this.model,
      ];
      if (systemPrompt) args.push('--system-prompt', systemPrompt);

      const child = spawn('claude', args, {
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        child.kill();
        reject(new Error('claude subprocess timeout após ' + this.timeoutMs + 'ms'));
      }, this.timeoutMs);

      child.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
      child.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

      child.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0) {
          reject(new Error(`claude saiu com código ${code}: ${stderr.slice(0, 400)}`));
          return;
        }
        try {
          const out = JSON.parse(stdout.trim()) as ClaudeJsonOutput;
          if (out.is_error) {
            reject(new Error(`claude retornou erro: ${out.result}`));
            return;
          }
          resolve({ text: out.result, costUsd: out.cost_usd ?? 0 });
        } catch {
          // fallback: retorna o texto bruto
          resolve({ text: stdout.trim(), costUsd: 0 });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        reject(new Error(
          `Falha ao iniciar claude CLI: ${err.message}. ` +
          'Instale com: npm i -g @anthropic-ai/claude-code e autentique com: claude auth login'
        ));
      });
    });
  }
}
