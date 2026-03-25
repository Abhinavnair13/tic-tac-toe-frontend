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
  public nakamaService = inject(NakamaService);

  isLoading = signal<boolean>(true);
  leaderboardRecords = signal<any[]>([]);

  async ngOnInit() {
    if (!this.nakamaService.hasSession()) {
      this.router.navigate(['/auth']);
      return;
    }

    // Just fetch the global Top 50 and render it directly
    const records = await this.nakamaService.getLeaderboardWithStats();
    this.leaderboardRecords.set(records);
    this.isLoading.set(false);
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
  }

  getInitials(username: string | null): string {
    if (!username || username === 'Anonymous') return '?';
    return username.charAt(0).toUpperCase();
  }
}