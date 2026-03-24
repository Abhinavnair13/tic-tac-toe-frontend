import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NakamaService } from '../services/nakama.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private router = inject(Router);
  public nakamaService = inject(NakamaService);
  
  username = signal<string>('Player');

  ngOnInit() {
    if (!this.nakamaService.hasSession()) {
      this.router.navigate(['/auth']);
      return;
    }
    
    const name = this.nakamaService.myUsername;
    if (name) {
      this.username.set(name);
    }
  }

  playNow() {
    this.router.navigate(['/play']);
  }

  goToLeaderboard() {
    this.router.navigate(['/leaderboard']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
