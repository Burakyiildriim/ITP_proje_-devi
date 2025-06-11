import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BookService, Book } from '../../../services/book.service';
import { AuthService } from '../../../services/auth.service';
import { HapticService } from '../../../services/haptic.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <div class="book-list-container">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Ara</mat-label>
        <input matInput [(ngModel)]="searchTerm" (keyup)="filterBooks()" placeholder="Kitap adı veya yazar">
      </mat-form-field>

      <table mat-table [dataSource]="filteredBooks" class="mat-elevation-z8">
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
            <button mat-icon-button color="primary" 
                    (click)="borrowBook(book)"
                    [disabled]="!book.available">
              <mat-icon>book</mat-icon>
            </button>
            <button mat-icon-button color="warn" 
                    (click)="returnBook(book)"
                    [disabled]="book.available || !isBookBorrowedByCurrentUser(book)">
              <mat-icon>undo</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .book-list-container {
      padding: 20px;
    }
    .search-field {
      width: 100%;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
    .mat-column-actions {
      width: 120px;
      text-align: center;
    }
  `]
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  searchTerm: string = '';
  displayedColumns: string[] = ['title', 'author', 'isbn', 'status', 'actions'];

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    private hapticService: HapticService
  ) {}

  ngOnInit() {
    this.loadBooks();
  }

  async loadBooks() {
    try {
      this.books = await this.bookService.getAllBooks();
      this.filteredBooks = [...this.books];
    } catch (error) {
      console.error('Error loading books:', error);
    }
  }

  filterBooks() {
    this.hapticService.light();
    if (!this.searchTerm) {
      this.filteredBooks = [...this.books];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredBooks = this.books.filter(book => 
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower)
    );
  }

  async borrowBook(book: Book) {
    this.hapticService.medium();
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        await this.bookService.borrowBook(book.id!, user.uid);
        await this.loadBooks();
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  }

  async returnBook(book: Book) {
    this.hapticService.medium();
    try {
      await this.bookService.returnBook(book.id!);
      await this.loadBooks();
    } catch (error) {
      console.error('Error returning book:', error);
    }
  }

  isBookBorrowedByCurrentUser(book: Book): boolean {
    const user = this.authService.getCurrentUser();
    return user ? book.borrowedBy === user.uid : false;
  }
} 