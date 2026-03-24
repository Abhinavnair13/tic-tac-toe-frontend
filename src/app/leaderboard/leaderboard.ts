import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NakamaService } from '../services/nakama.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css'
})
export class Leaderboard implements OnInit {
  private router = inject(Router);
  private nakamaService = inject(NakamaService);

  records = signal<any[]>([]);
  isLoading = signal(true);

  async ngOnInit() {
    if (!this.nakamaService.hasSession()) {
      this.router.navigate(['/auth']);
      return;
    }

    const leaderboardItems = await this.nakamaService.getLeaderboard();
    if (leaderboardItems && leaderboardItems.records) {
      // Map API records to a structured format for UI
      this.records.set(
        leaderboardItems.records.map((r, i) => ({
          rank: i + 1,
          username: r.username || 'Anonymous',
          score: r.score
        }))
      );
    }
    this.isLoading.set(false);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
