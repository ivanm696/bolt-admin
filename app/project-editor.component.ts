import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import type { WebContainer } from '@webcontainer/api';
import { Project } from './project.model';
import { ProjectService } from './project.service';
import { RunningProcess, WebContainerService } from './webcontainer.service';

@Component({
  selector: 'app-project-editor',
  standalone: false,
  templateUrl: './project-editor.component.html',
})
export class ProjectEditorComponent implements OnInit, OnDestroy {
  project: Project | null = null;
  activeFile = 'index.js';
  terminal = '';
  status = '';
  busy = false;
  preview: SafeResourceUrl | null = null;

  private wc: WebContainer | null = null;
  private server: RunningProcess | null = null;
  private installed = false;

  constructor(
    private route: ActivatedRoute,
    private projects: ProjectService,
    private container: WebContainerService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.project = this.projects.get(id) ?? null;
    this.activeFile = this.fileNames[0] ?? 'index.js';
  }

  ngOnDestroy(): void {
    this.server?.kill();
  }

  get fileNames(): string[] {
    return this.project ? Object.keys(this.project.files) : [];
  }

  get content(): string {
    return this.project?.files[this.activeFile] ?? '';
  }

  set content(value: string) {
    if (this.project) this.project.files[this.activeFile] = value;
  }

  save(): void {
    if (!this.project) return;
    this.projects.save(this.project);
    this.status = 'Сохранено';
  }

  async installDeps(): Promise<void> {
    await this.withBusy(async () => {
      const wc = await this.ensure();
      this.save();
      await this.sync(wc);
      this.installed = false;
      await this.install(wc);
    });
  }

  async runServer(): Promise<void> {
    await this.withBusy(async () => {
      const wc = await this.ensure();
      this.save();
      await this.sync(wc);
      this.server?.kill();
      if (!this.installed) await this.install(wc);
      this.log('\n$ npm start\n');
      const proc = await this.container.run(wc, 'npm', ['start'], t => this.log(t));
      this.server = proc;
      void proc.exit.then(code => this.log(`\n[сервер остановлен, код ${code}]\n`));
    });
  }

  private async ensure(): Promise<WebContainer> {
    if (this.wc) return this.wc;
    this.status = 'Запуск WebContainer…';
    const wc = await this.container.get();
    wc.on('server-ready', (_port, url) => {
      this.preview = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
    this.wc = wc;
    this.status = 'WebContainer готов';
    return wc;
  }

  private async sync(wc: WebContainer): Promise<void> {
    if (this.project) await this.container.writeFiles(wc, this.project.files);
  }

  private async install(wc: WebContainer): Promise<void> {
    this.log('\n$ npm install\n');
    const proc = await this.container.run(wc, 'npm', ['install'], t => this.log(t));
    const code = await proc.exit;
    this.log(`\n[npm install: код ${code}]\n`);
    if (code !== 0) throw new Error(`npm install завершился с кодом ${code}`);
    this.installed = true;
  }

  private log(text: string): void {
    this.terminal += text;
  }

  private async withBusy(fn: () => Promise<void>): Promise<void> {
    this.busy = true;
    try {
      await fn();
    } catch (e) {
      this.status = '❌ ' + (e instanceof Error ? e.message : String(e));
    } finally {
      this.busy = false;
    }
  }
}
