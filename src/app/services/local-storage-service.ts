import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  constructor() {}

  // Method to get data from localStorage by key
  getData(key: string): any {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
  }

  // Method to set data to localStorage by key
  setData(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Method to remove data from localStorage by key
  removeData(key: string): void {
    localStorage.removeItem(key);
  }
}
