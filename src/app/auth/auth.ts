import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NakamaService } from '../services/nakama.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth {
  private router = inject(Router);
  private nakamaService = inject(NakamaService);

  isLoginMode = signal(true);
  
  // Form fields
  email = signal('');
  password = signal('');
  firstName = signal('');
  lastName = signal('');
  username = signal('');
  
  // Field Errors
  emailError = signal('');
  passwordError = signal('');
  firstNameError = signal('');
  lastNameError = signal('');
  usernameError = signal('');

  errorMessage = signal('');
  isLoading = signal(false);

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
    this.clearErrors();
  }

  clearErrors() {
    this.errorMessage.set('');
    this.emailError.set('');
    this.passwordError.set('');
    this.firstNameError.set('');
    this.lastNameError.set('');
    this.usernameError.set('');
  }

  async submit() {
    this.clearErrors();
    
    if (this.isLoginMode()) {
      if (!this.email() || !this.email().includes('@') || !this.password()) {
        this.errorMessage.set('Invalid email or password');
        return;
      }
    } else {
      let isValid = true;
      if (!this.email()) {
        this.emailError.set('Email is required');
        isValid = false;
      } else if (!this.email().includes('@')) {
        this.emailError.set('Please enter a valid email');
        isValid = false;
      }

      if (!this.password()) {
        this.passwordError.set('Password is required');
        isValid = false;
      } else if (this.password().length < 8) {
        this.passwordError.set('Password must be at least 8 characters');
        isValid = false;
      }

      if (!this.firstName()) {
        this.firstNameError.set('First name is required');
        isValid = false;
      }
      if (!this.lastName()) {
        this.lastNameError.set('Last name is required');
        isValid = false;
      }
      if (!this.username()) {
        this.usernameError.set('Username is required');
        isValid = false;
      }

      if (!isValid) return;
    }

    this.isLoading.set(true);
    
    // We expect an object back now, not just a boolean
    let result: { success: boolean, message?: string };
    
    if (this.isLoginMode()) {
       result = await this.nakamaService.login(this.email(), this.password());
    } else {
       result = await this.nakamaService.register(
         this.email(), 
         this.password(),
         this.username(),
         this.firstName(),
         this.lastName()
       );
    }
    
    this.isLoading.set(false);
    
    if (result.success) {
      this.router.navigate(['/home']);
    } else {
      if (this.isLoginMode()) {
        this.errorMessage.set('Invalid email or password');
      } else {
        const msg = (result.message || '').toLowerCase();
        if (msg.includes('username')) {
          this.usernameError.set(result.message!);
        } else if (msg.includes('email')) {
          this.emailError.set(result.message!);
        } else if (msg.includes('password')) {
          this.passwordError.set(result.message!);
        } else {
          this.errorMessage.set(result.message || 'Registration failed.');
        }
      }
    }
  }
}
