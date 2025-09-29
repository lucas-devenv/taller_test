import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';

export type TaskItem = {
    id: number;
    title: string;
    description?: string;
    dueDate?: string;
    status: 'Pending' | 'InProgress' | 'Completed';
  };

export type TaskStatus = 'Pending' | 'InProgress' | 'Completed';

@Injectable({ providedIn: 'root' })
  export class TasksService {
  private base = `${environment.apiBaseUrl}/api/tasks`;
  constructor(private http: HttpClient) {}
  list() { return this.http.get<TaskItem[]>(`${this.base}/`); }
  create(data: { title: string; description?: string; dueDate?: string }) {
    const payload = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined
    };
    return this.http.post<TaskItem>(`${this.base}/`, payload);
  }
  update(id: number, data: Partial<TaskItem>) {
    const payload = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined
    };
    return this.http.put<TaskItem>(`${this.base}/${id}`, payload);
  }
  setStatus(id: number, status: TaskStatus) {
    return this.http.patch<TaskItem>(`${this.base}/${id}/status?status=${status}`, {});
  }
  remove(id: number) { return this.http.delete(`${this.base}/${id}`); }
}