import { Component } from '@angular/core';
import { Project } from './project.model';
import { ProjectService } from './project.service';

@Component({
  selector: 'app-projects-list',
  standalone: false,
  templateUrl: './projects-list.component.html',
})
export class ProjectsListComponent {
  projects: Project[];
  newName = '';

  constructor(private svc: ProjectService) {
    this.projects = svc.list();
  }

  create(): void {
    const name = this.newName.trim();
    if (!name) return;
    this.svc.create(name);
    this.projects = this.svc.list();
    this.newName = '';
  }

  remove(id: string): void {
    if (!confirm('Удалить проект?')) return;
    this.svc.remove(id);
    this.projects = this.svc.list();
  }
}
