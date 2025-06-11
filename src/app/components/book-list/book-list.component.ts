import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="book-list-container">
      <div class="search-container">
        <mat-form-field appearance="outline">
          <mat-label>Ara</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup)="onSearch()" placeholder="Kitap adı, yazar veya ISBN">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <table mat-table [dataSource]="books" class="mat-elevation-z8">
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

        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Kategori</th>
          <td mat-cell *matCellDef="let book">{{book.category}}</td>
        </ng-container>

        <ng-container matColumnDef="available">
          <th mat-header-cell *matHeaderCellDef>Durum</th>
          <td mat-cell *matCellDef="let book">
            {{book.available ? 'Müsait' : 'Ödünç Alındı'}}
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>İşlemler</th>
          <td mat-cell *matCellDef="let book">
            <ng-container *ngIf="isAdmin">
              <button mat-icon-button color="primary" (click)="onEdit(book)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="onDelete(book)">
                <mat-icon>delete</mat-icon>
              </button>
            </ng-container>
            <ng-container *ngIf="!isAdmin">
              <button mat-raised-button color="primary" 
                      *ngIf="book.available"
                      (click)="onBorrow(book)">
                <mat-icon>book</mat-icon>
                Ödünç Al
              </button>
              <button mat-raised-button color="accent" 
                      *ngIf="!book.available && book.borrowedBy === currentUserId"
                      (click)="onReturn(book)">
                <mat-icon>bookmark_remove</mat-icon>
                İade Et
              </button>
            </ng-container>
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
    .search-container {
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
    .mat-mdc-form-field {
      width: 100%;
    }
    button {
      margin: 0 4px;
    }
  `]
})
export class BookListComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  searchQuery: string = '';
  displayedColumns: string[] = ['title', 'author', 'isbn', 'category', 'available', 'actions'];
  isAdmin: boolean = false;
  currentUserId: string | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadBooks();
    this.checkUserRole();
    
    // Kullanıcı durumu değişikliklerini dinle
    this.userSubscription = this.authService.currentUser$.subscribe(async user => {
      if (user) {
        this.currentUserId = user.uid;
        const userDoc = await this.bookService.getUserDoc(user.uid);
        this.isAdmin = userDoc?.['isAdmin'] || false;
        console.log('User state changed:', { 
          userId: this.currentUserId, 
          isAdmin: this.isAdmin,
          userDoc: userDoc 
        });
      } else {
        this.currentUserId = null;
        this.isAdmin = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async checkUserRole() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.uid;
      const userDoc = await this.bookService.getUserDoc(user.uid);
      this.isAdmin = userDoc?.['isAdmin'] || false;
      console.log('User role checked:', { 
        userId: this.currentUserId, 
        isAdmin: this.isAdmin,
        userDoc: userDoc 
      });
    } else {
      this.currentUserId = null;
      this.isAdmin = false;
    }
  }

  async loadBooks() {
    try {
      this.books = await this.bookService.getAllBooks();
      console.log('Books loaded:', this.books);
    } catch (error) {
      console.error('Error loading books:', error);
      this.snackBar.open('Kitaplar yüklenirken bir hata oluştu.', 'Kapat', { duration: 3000 });
    }
  }

  async onSearch() {
    if (this.searchQuery.trim()) {
      try {
        this.books = await this.bookService.searchBooks(this.searchQuery);
      } catch (error) {
        console.error('Error searching books:', error);
        this.snackBar.open('Arama yapılırken bir hata oluştu.', 'Kapat', { duration: 3000 });
      }
    } else {
      this.loadBooks();
    }
  }

  onEdit(book: Book) {
    // TODO: Implement edit functionality
    console.log('Edit book:', book);
  }

  async onDelete(book: Book) {
    if (book.id && confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
      try {
        await this.bookService.deleteBook(book.id);
        this.snackBar.open('Kitap başarıyla silindi.', 'Kapat', { duration: 3000 });
        this.loadBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
        this.snackBar.open('Kitap silinirken bir hata oluştu.', 'Kapat', { duration: 3000 });
      }
    }
  }

  async onBorrow(book: Book) {
    if (!this.currentUserId) {
      this.snackBar.open('Lütfen giriş yapın.', 'Kapat', { duration: 3000 });
      return;
    }

    try {
      await this.bookService.borrowBook(book.id!, this.currentUserId);
      this.snackBar.open('Kitap başarıyla ödünç alındı.', 'Kapat', { duration: 3000 });
      await this.loadBooks();
    } catch (error) {
      console.error('Error borrowing book:', error);
      this.snackBar.open('Kitap ödünç alınırken bir hata oluştu.', 'Kapat', { duration: 3000 });
    }
  }

  async onReturn(book: Book) {
    if (!this.currentUserId) {
      this.snackBar.open('Lütfen giriş yapın.', 'Kapat', { duration: 3000 });
      return;
    }

    try {
      await this.bookService.returnBook(book.id!);
      this.snackBar.open('Kitap başarıyla iade edildi.', 'Kapat', { duration: 3000 });
      await this.loadBooks();
    } catch (error) {
      console.error('Error returning book:', error);
      this.snackBar.open('Kitap iade edilirken bir hata oluştu.', 'Kapat', { duration: 3000 });
    }
  }
} 