import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookService, Book } from '../../../services/book.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="admin-panel-container">
      <h2>Kitap Yönetimi</h2>
      
      <div class="add-book-form">
        <h3>Yeni Kitap Ekle</h3>
        <form (ngSubmit)="addBook()" #bookForm="ngForm">
          <mat-form-field appearance="outline">
            <mat-label>Kitap Adı</mat-label>
            <input matInput [(ngModel)]="newBook.title" name="title" required>
            <mat-error *ngIf="bookForm.form.get('title')?.errors?.['required']">
              Kitap adı gereklidir
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Yazar</mat-label>
            <input matInput [(ngModel)]="newBook.author" name="author" required>
            <mat-error *ngIf="bookForm.form.get('author')?.errors?.['required']">
              Yazar adı gereklidir
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>ISBN</mat-label>
            <input matInput [(ngModel)]="newBook.isbn" name="isbn" required>
            <mat-error *ngIf="bookForm.form.get('isbn')?.errors?.['required']">
              ISBN gereklidir
            </mat-error>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="!bookForm.form.valid || isAdding">
            {{ isAdding ? 'Kitap Ekleniyor...' : 'Kitap Ekle' }}
          </button>
        </form>
      </div>

      <div class="book-list">
        <h3>Kitap Listesi</h3>
        <div *ngIf="isLoading" class="loading-spinner">
          Kitaplar yükleniyor...
        </div>
        <table mat-table [dataSource]="books" class="mat-elevation-z8" *ngIf="!isLoading">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Kitap Adı</th>
            <td mat-cell *matCellDef="let book">{{book.title}}</td>
          </ng-container>

          <ng-container matColumnDef="author">
            <th mat-header-cell *matHeaderCellDef>Yazar</th>
            <td mat-cell *matCellDef="let book">{{book.author}}</td>
          </ng-container>

          <ng-container matColumnDef="isbn">
            <th mat-header-cell *matHeaderCellDef>ISBN</th>
            <td mat-cell *matCellDef="let book">{{book.isbn}}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Durum</th>
            <td mat-cell *matCellDef="let book">
              {{book.available ? 'Müsait' : 'Ödünç Alındı'}}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>İşlemler</th>
            <td mat-cell *matCellDef="let book">
              <button mat-icon-button color="warn" (click)="deleteBook(book)" [disabled]="isDeleting">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-panel-container {
      padding: 20px;
    }
    .add-book-form {
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 15px;
    }
    .book-list {
      margin-top: 30px;
    }
    table {
      width: 100%;
    }
    .mat-column-actions {
      width: 80px;
      text-align: center;
    }
    .loading-spinner {
      text-align: center;
      padding: 20px;
      color: #666;
    }
  `]
})
export class AdminPanelComponent implements OnInit {
  books: Book[] = [];
  displayedColumns: string[] = ['title', 'author', 'isbn', 'status', 'actions'];
  newBook: Partial<Book> = {
    title: '',
    author: '',
    isbn: ''
  };
  isLoading: boolean = false;
  isAdding: boolean = false;
  isDeleting: boolean = false;

  constructor(
    private bookService: BookService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadBooks();
  }

  async loadBooks() {
    this.isLoading = true;
    try {
      this.books = await this.bookService.getAllBooks();
    } catch (error) {
      console.error('Error loading books:', error);
      this.snackBar.open('Kitaplar yüklenirken bir hata oluştu.', 'Kapat', { duration: 5000 });
    } finally {
      this.isLoading = false;
    }
  }

  async addBook() {
    if (this.isAdding) return;
    
    this.isAdding = true;
    try {
      await this.bookService.addBook(this.newBook as Book);
      this.newBook = {
        title: '',
        author: '',
        isbn: ''
      };
      await this.loadBooks();
      this.snackBar.open('Kitap başarıyla eklendi.', 'Kapat', { duration: 3000 });
    } catch (error) {
      console.error('Error adding book:', error);
      this.snackBar.open('Kitap eklenirken bir hata oluştu.', 'Kapat', { duration: 5000 });
    } finally {
      this.isAdding = false;
    }
  }

  async deleteBook(book: Book) {
    if (this.isDeleting) return;
    
    if (confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
      this.isDeleting = true;
      try {
        await this.bookService.deleteBook(book.id!);
        await this.loadBooks();
        this.snackBar.open('Kitap başarıyla silindi.', 'Kapat', { duration: 3000 });
      } catch (error) {
        console.error('Error deleting book:', error);
        this.snackBar.open('Kitap silinirken bir hata oluştu.', 'Kapat', { duration: 5000 });
      } finally {
        this.isDeleting = false;
      }
    }
  }
} 