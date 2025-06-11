import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary" class="main-toolbar" fixedTop>
      <span class="logo">
        <mat-icon>local_library</mat-icon>
        <span class="brand">KutuphaneITP</span>
      </span>
      <span class="spacer"></span>
      <ng-container *ngIf="authService.currentUser$ | async as user; else guestLinks">
        <span class="welcome">Hoş geldin, {{ user.email }}</span>
        <button mat-button routerLink="/books">
          <mat-icon>menu_book</mat-icon>
          Kitaplar
        </button>
        <button mat-button routerLink="/admin" *ngIf="isAdmin">
          <mat-icon>admin_panel_settings</mat-icon>
          Yönetim
        </button>
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon> Çıkış
          </button>
        </mat-menu>
      </ng-container>
      <ng-template #guestLinks>
        <button mat-button routerLink="/login">Giriş Yap</button>
        <button mat-button routerLink="/register">Kayıt Ol</button>
      </ng-template>
    </mat-toolbar>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <span>© 2024 KutuphaneITP | Powered by Angular & Firebase</span>
    </footer>
  `,
  styles: [`
    .main-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .logo {
      display: flex;
      align-items: center;
      font-size: 1.3rem;
      font-weight: 600;
      gap: 8px;
    }
    .brand {
      letter-spacing: 1px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .welcome {
      margin-right: 16px;
      font-weight: 500;
      color: #fff;
    }
    .main-content {
      min-height: 80vh;
      max-width: 900px;
      margin: 32px auto 0 auto;
      padding: 16px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.04);
    }
    .footer {
      text-align: center;
      padding: 18px 0 10px 0;
      color: #888;
      font-size: 1rem;
      background: transparent;
    }
    @media (max-width: 600px) {
      .main-content {
        margin: 0;
        border-radius: 0;
        padding: 8px;
      }
      .main-toolbar {
        flex-direction: column;
        align-items: flex-start;
      }
      .welcome {
        margin: 8px 0;
      }
    }
  `]
})
export class AppComponent {
  isAdmin = false;

  constructor(
    public authService: AuthService,
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.authService.currentUser$.subscribe(async user => {
      if (user) {
        const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
        this.isAdmin = userDoc.data()?.['isAdmin'] || false;
      } else {
        this.isAdmin = false;
      }
    });
  }

  async logout() {
    try {
      await this.authService.logout();
      this.snackBar.open('Başarıyla çıkış yapıldı.', 'Kapat', { duration: 3000 });
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      this.snackBar.open('Çıkış yapılırken bir hata oluştu.', 'Kapat', { duration: 3000 });
    }
  }
} 