import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService, TaskItem, TaskStatus } from './task.services';

@Component({
    selector: 'app-tasks',
    standalone: true,
    imports: [CommonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <h2>Tasks</h2>
  
    <form (submit)="add($event)" style="display:flex; gap:.5rem; flex-wrap:wrap">
      <input placeholder="Title" [value]="title()" (input)="onTitleChange($event)" required />
      <input placeholder="Description" [value]="desc()" (input)="onDescChange($event)" />
      <input type="date" [value]="due()" (input)="onDueChange($event)" />
      <button type="submit">Add</button>
    </form>
  
    <ul>
      <li *ngFor="let t of list(); trackBy: trackByTaskId">
        <b>{{t.title}}</b> — {{t.description || '—'}} — {{t.dueDate || '—'}} —
        <select [ngModel]="t.status" (ngModelChange)="setStatus(t, $event)">
          <option value="Pending">Pending</option>
          <option value="InProgress">InProgress</option>
          <option value="Completed">Completed</option>
        </select>
        <button (click)="del(t)">Delete</button>
      </li>
    </ul>
    `
  })
  export class TasksComponent {
    title = signal(''); desc = signal(''); due = signal<string>('');
    list = signal<TaskItem[]>([]);
  
    constructor(private api: TasksService) { this.reload(); }

  trackByTaskId(index: number, task: TaskItem): number {
    return task.id;
  }
  
    reload() { 
    console.log('Reloading tasks...');
    this.api.list().subscribe({
      next: (tasks) => {
        console.log('Tasks loaded:', tasks);
        this.list.set(tasks);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }
  
    onTitleChange(event: Event) {
      this.title.set((event.target as HTMLInputElement).value);
    }
  
    onDescChange(event: Event) {
      this.desc.set((event.target as HTMLInputElement).value);
    }
  
    onDueChange(event: Event) {
      this.due.set((event.target as HTMLInputElement).value);
    }
  
  
    add(ev: Event) {
      ev.preventDefault();
      this.api.create({
        title: this.title(),
        description: this.desc() || undefined,
        dueDate: this.due() || undefined
      }).subscribe(() => {
        this.title.set(''); this.desc.set(''); this.due.set('');
        this.reload();
      });
    }
  
  setStatus(t: TaskItem, s: TaskStatus) {
    console.log('Updating status for task:', t.id, 'to:', s);
    
    // Atualização otimista - atualiza a UI imediatamente
    this.list.update(tasks => {
      const taskIndex = tasks.findIndex(task => task.id === t.id);
      if (taskIndex !== -1) {
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: s };
        return updatedTasks;
      }
      return tasks;
    });
    
    // Sincroniza com o servidor
    this.api.setStatus(t.id, s).subscribe({
      next: (updatedTask) => {
        console.log('Status updated successfully:', updatedTask);
        // Atualiza com a resposta do servidor
        this.list.update(tasks => {
          const taskIndex = tasks.findIndex(task => task.id === t.id);
          if (taskIndex !== -1) {
            const updatedTasks = [...tasks];
            updatedTasks[taskIndex] = updatedTask;
            return updatedTasks;
          }
          return tasks;
        });
      },
      error: (error) => {
        console.error('Error updating status:', error);
        // Se der erro, recarrega tudo
        this.reload();
      }
    });
  }
  
    del(t: TaskItem) { this.api.remove(t.id).subscribe(() => this.reload()); }
  }