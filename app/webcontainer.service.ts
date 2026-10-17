import { Injectable } from '@angular/core';
import { auth, WebContainer, type FileSystemTree } from '@webcontainer/api';
import { WC_CLIENT_ID } from './webcontainer.config';

export interface RunningProcess {
  exit: Promise<number>;
  kill: () => void;
}

@Injectable({ providedIn: 'root' })
export class WebContainerService {
  private instance: Promise<WebContainer> | null = null;

  constructor() {
    // auth.init must run once, before WebContainer.boot().
    const result = auth.init({ clientId: WC_CLIENT_ID, scope: '' });
    if (result.status === 'auth-failed') {
      console.error('[webcontainer] auth.init failed:', result.error, result.description);
    }
  }

  // One WebContainer per page; boot() may only be called once.
  get(): Promise<WebContainer> {
    if (!this.instance) {
      const boot = WebContainer.boot({ coep: 'credentialless', workdirName: 'project' });
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('WebContainer не запустился за 30 секунд')), 30_000),
      );
      this.instance = Promise.race([boot, timeout]).catch(err => {
        this.instance = null;
        throw err;
      });
    }
    return this.instance;
  }

  async writeFiles(wc: WebContainer, files: Record<string, string>): Promise<void> {
    const tree: FileSystemTree = {};
    for (const [name, contents] of Object.entries(files)) {
      tree[name] = { file: { contents } };
    }
    await wc.mount(tree);
  }

  async run(
    wc: WebContainer,
    cmd: string,
    args: string[],
    onOutput: (text: string) => void,
  ): Promise<RunningProcess> {
    const proc = await wc.spawn(cmd, args);
    proc.output.pipeTo(new WritableStream({ write: chunk => onOutput(chunk) }));
    return { exit: proc.exit, kill: () => proc.kill() };
  }
}
