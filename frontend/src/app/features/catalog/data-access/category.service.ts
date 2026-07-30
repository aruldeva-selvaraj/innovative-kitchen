import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { Category } from './category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);

  getAll() {
    return this.api.get<Category[]>('/categories');
  }

  getTopCategories() {
    return this.api.get<Category[]>('/categories/top');
  }

  getCategory(slug: string) {
    return this.api.get<Category>(`/categories/${slug}`);
  }

  getTree() {
    return this.api.get<Category[]>('/categories/tree');
  }
}
