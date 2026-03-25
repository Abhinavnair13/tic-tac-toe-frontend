import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NakamaService } from './services/nakama.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  nakamaService = inject(NakamaService);
  private router = inject(Router);
  
  currentRoute = signal<string>('');
  isInitialized = signal(false);

  constructor() {
    // Listen to the router to keep our header UI updated
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute.set(event.urlAfterRedirects);
    });
  }

  async ngOnInit() {
    // 1. Wait for Nakama to read local storage and connect the socket
    const restored = await this.nakamaService.restoreSession();

    // 2. If we couldn't restore a session, kick them to login
    if (!restored && window.location.pathname !== '/auth') {
      this.router.navigate(['/auth']);
    }

    // 3. Unblock the UI and hide the loading spinner!
    this.isInitialized.set(true);
  }

  isHomePage(): boolean {
    return this.currentRoute().includes('/home');
  }

  isGamePage(): boolean {
    return this.currentRoute().includes('/play');
  }

  acknowledgeSessionKick() {
    this.nakamaService.sessionKicked.set(false);
    this.router.navigate(['/auth']);
  }
  handleHeaderAction() {
    if (this.isHomePage()) {
      this.promptLogout();
    } else {
      this.router.navigate(['/home']);
    }
  }

  isLogoutModalOpen = signal(false);

  promptLogout() {
    this.isLogoutModalOpen.set(true);
  }

  cancelLogout() {
    this.isLogoutModalOpen.set(false);
  }

  confirmLogout() {
    this.isLogoutModalOpen.set(false);
    this.nakamaService.logout();
    this.router.navigate(['/auth']);
  }
}