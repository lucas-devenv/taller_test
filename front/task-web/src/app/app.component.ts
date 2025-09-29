import { Component } from '@angular/core';
import { TasksComponent } from './tasks.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TasksComponent],
  template: `<app-tasks />`
})
export class AppComponent {}