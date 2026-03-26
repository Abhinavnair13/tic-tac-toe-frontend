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
  showPassword = signal(false);
  
  // Modal Signals
  showNetworkModal = signal(false);
  showServerModal = signal(false);
  
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

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  clearErrors() {
    this.errorMessage.set('');
    this.emailError.set('');
    this.passwordError.set('');
    this.firstNameError.set('');
    this.lastNameError.set('');
    this.usernameError.set('');
  }

  closeModals() {
    this.showNetworkModal.set(false);
    this.showServerModal.set(false);
  }

  async submit() {
    this.clearErrors();
    
    // 1. Check if the user is completely offline before trying
    if (!window.navigator.onLine) {
      this.showNetworkModal.set(true);
      return;
    }

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
      // THE FIX: Only route to home if the service didn't already throw us into an active match!
      if (!this.nakamaService.activeMatchId) {
        this.router.navigate(['/home']);
      }
    } else {
      const msg = (result.message || '').toLowerCase();
      console.log("Message", msg);
      // 2. Intercept Server Down / Fetch Failures
      if (msg.includes('failed to fetch') || msg.includes('network error') || msg.includes('load failed')) {
        this.showServerModal.set(true);
        return;
      }

      // 3. Normal Authentication Errors
      if (this.isLoginMode()) {
        this.errorMessage.set('Invalid email or password');
      } else {
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