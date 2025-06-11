import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule
  ],
  template: `
    <div class="register-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Kayıt Ol</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-posta</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required>
              <mat-error *ngIf="registerForm.form.get('email')?.errors?.['required']">
                E-posta adresi gereklidir
              </mat-error>
              <mat-error *ngIf="registerForm.form.get('email')?.errors?.['email']">
                Geçerli bir e-posta adresi giriniz
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Şifre</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required minlength="6">
              <mat-error *ngIf="registerForm.form.get('password')?.errors?.['required']">
                Şifre gereklidir
              </mat-error>
              <mat-error *ngIf="registerForm.form.get('password')?.errors?.['minlength']">
                Şifre en az 6 karakter olmalıdır
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Şifre Tekrar</mat-label>
              <input matInput type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required>
              <mat-error *ngIf="registerForm.form.get('confirmPassword')?.errors?.['required']">
                Şifre tekrarı gereklidir
              </mat-error>
              <mat-error *ngIf="password !== confirmPassword && confirmPassword">
                Şifreler eşleşmiyor
              </mat-error>
            </mat-form-field>

            <mat-checkbox [(ngModel)]="isAdmin" name="isAdmin" class="admin-checkbox">
              Yönetici olarak kayıt ol
            </mat-checkbox>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="!registerForm.form.valid || password !== confirmPassword || isLoading">
              {{ isLoading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
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
    .admin-checkbox {
      display: block;
      margin-bottom: 15px;
    }
    button {
      width: 100%;
    }
  `]
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isAdmin: boolean = false;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async onSubmit() {
    if (this.isLoading) return;
    
    if (this.password !== this.confirmPassword) {
      this.snackBar.open('Şifreler eşleşmiyor!', 'Kapat', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    try {
      const user = await this.authService.register(this.email, this.password, this.isAdmin);
      this.snackBar.open('Kayıt başarılı! Giriş yapabilirsiniz.', 'Kapat', { duration: 3000 });
      
      // Yönetici ise direkt giriş yap ve admin paneline yönlendir
      if (this.isAdmin) {
        await this.authService.login(this.email, this.password);
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.snackBar.open('Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.', 'Kapat', { duration: 5000 });
    } finally {
      this.isLoading = false;
    }
  }
} 