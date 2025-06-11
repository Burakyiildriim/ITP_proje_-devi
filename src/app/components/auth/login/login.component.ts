import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Giriş Yap</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-posta</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required>
              <mat-error *ngIf="loginForm.form.get('email')?.errors?.['required']">
                E-posta adresi gereklidir
              </mat-error>
              <mat-error *ngIf="loginForm.form.get('email')?.errors?.['email']">
                Geçerli bir e-posta adresi giriniz
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Şifre</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
              <mat-error *ngIf="loginForm.form.get('password')?.errors?.['required']">
                Şifre gereklidir
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="!loginForm.form.valid || isLoading">
              {{ isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap' }}
            </button>

            <button mat-button color="accent" routerLink="/register" class="register-button">
              Hesabınız yok mu? Kayıt olun
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    mat-card {
      max-width: 400px;
      width: 100%;
      padding: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    button[type="submit"] {
      width: 100%;
      margin-bottom: 10px;
    }
    .register-button {
      width: 100%;
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async onSubmit() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    try {
      await this.authService.login(this.email, this.password);
      this.snackBar.open('Giriş başarılı!', 'Kapat', { duration: 3000 });
      this.router.navigate(['/books']);
    } catch (error) {
      console.error('Login error:', error);
      this.snackBar.open('Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin.', 'Kapat', { duration: 5000 });
    } finally {
      this.isLoading = false;
    }
  }
} 