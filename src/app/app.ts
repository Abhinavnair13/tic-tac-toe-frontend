import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router , NavigationEnd} from '@angular/router';
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
export class App {
  nakamaService = inject(NakamaService);
  private router = inject(Router);
  currentRoute = signal<string>('');
  constructor() {
    // Listen to the router to keep our signal updated with the current URL
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute.set(event.urlAfterRedirects);
    });
  }
  isHomePage(): boolean {
    return this.currentRoute().includes('/home');
  }

  isGamePage(): boolean {
    return this.currentRoute().includes('/play');
  }
  handleHeaderAction() {
    if (this.isHomePage()) {
      this.promptLogout(); // Show logout modal
    } else {
      this.router.navigate(['/home']); // Go back to home screen
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
