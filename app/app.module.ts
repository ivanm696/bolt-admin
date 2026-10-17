import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { ProjectsListComponent } from './projects-list.component';
import { ProjectEditorComponent } from './project-editor.component';

const routes: Routes = [
  { path: '', component: ProjectsListComponent },
  { path: 'projects/:id', component: ProjectEditorComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    // Hash routing: GitHub Pages does not serve deep links.
    RouterModule.forRoot(routes, { useHash: true }),
  ],
  declarations: [AppComponent, ProjectsListComponent, ProjectEditorComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
