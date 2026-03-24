import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NakamaService } from './services/nakama.service';

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
