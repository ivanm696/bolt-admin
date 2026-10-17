import { Injectable } from '@angular/core';
import { Project } from './project.model';

const STORAGE_KEY = 'bolt-admin.projects.v1';

export const DEFAULT_INDEX_JS = `import express from 'express';
const app = express();
app.get('/', (req, res) => res.json({ hello: 'from WebContainer!' }));
app.listen(3000, () => console.log('Server on :3000'));
`;

function packageJson(name: string): string {
  const safe = name.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
  return JSON.stringify(
    {
      name: safe,
      type: 'module',
      private: true,
      scripts: { start: 'node index.js' },
      dependencies: { express: '^4.19.2' },
    },
    null,
    2,
  ) + '\n';
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private items: Project[] = this.load();

  list(): Project[] {
    return [...this.items];
  }

  get(id: string): Project | undefined {
    return this.items.find(p => p.id === id);
  }

  create(name: string): Project {
    const project = this.makeProject(name);
    this.items = [...this.items, project];
    this.persist();
    return project;
  }

  save(project: Project): void {
    project.updatedAt = new Date().toISOString();
    this.persist();
  }

  remove(id: string): void {
    this.items = this.items.filter(p => p.id !== id);
    this.persist();
  }

  private makeProject(name: string): Project {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name,
      files: { 'index.js': DEFAULT_INDEX_JS, 'package.json': packageJson(name) },
      updatedAt: new Date().toISOString(),
    };
  }

  private load(): Project[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Project[];
    } catch {
      // Storage unavailable or corrupted: start with a sample project.
    }
    return [this.makeProject('Пример')];
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      // Storage unavailable (private mode / quota): keep working in memory.
    }
  }
}
