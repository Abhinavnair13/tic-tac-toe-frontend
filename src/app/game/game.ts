import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NakamaService } from '../services/nakama.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.html',
  styleUrl: './game.css'
})
export class Game implements OnInit, OnDestroy {
  private router = inject(Router);
  public nakamaService = inject(NakamaService);

  matchStatus = this.nakamaService.matchStatus;
  ping = this.nakamaService.ping;
  
  gameState = signal<any>(null); // From NakamaService Protobuf state
  timeLeft = signal<number>(30);
  showForfeitModal = signal<boolean>(false);
  
  private timerInterval: any;
  private sub!: Subscription;

  ngOnInit() {
    if (!this.nakamaService.hasSession()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.sub = this.nakamaService.gameState$.subscribe(state => {
      this.gameState.set(state);
      this.updateTimer();
    });
    
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);

    // Join matchmaking on entry
    this.nakamaService.joinMatchmaking();
  }

 updateTimer() {
    const state = this.gameState();
    if (state && state.turnStartTime) {
      const nowRaw = Math.floor(Date.now() / 1000);
      const turnStart = Number(state.turnStartTime);
      const diff = 30 - (nowRaw - turnStart);
      this.timeLeft.set(Math.max(0, diff));
    } else {
      this.timeLeft.set(30);
    }
  }

  
  get myUserId(): string | null {
    return this.nakamaService.myUserId;
  }
  
  isMyTurn(): boolean {
    const state = this.gameState();
    if (!state) return false;

    // Safely handle both camelCase (JS) and snake_case (Raw)
    const p1 = state.p1Id || state.p1_id;
    const currentTurn = state.currentTurn || state.current_turn;

    const myTurnNumber = (this.myUserId === p1) ? 1 : 2;
    return currentTurn === myTurnNumber;
  }

  makeMove(index: number) {
    const state = this.gameState();
    console.log("--- Clicked Cell ---", index);
    
    if (!state) return;
    
    // 1. Turn Validation
    if (!this.isMyTurn()) {
       console.warn("Ignored: It is not your turn!");
       return;
    }

    const board = state.board || [0,0,0,0,0,0,0,0,0];
    if (board[index] !== 0) {
       console.warn("Ignored: This cell is already played!");
       return;
    }

    // 3. Game Over Validation
    if (state.winnerId || state.winner_id) {
       console.warn("Ignored: The game is already over!");
       return;
    }

    console.log("All checks passed! Sending move to Nakama...");
    this.nakamaService.sendMove(index);
  }
  // Safe getter for the winner ID (handles Protobuf JS formatting)
  getWinner(): string | null {
    const state = this.gameState();
    if (!state) return null;
    // pbjs might convert it to camelCase or keep snake_case
    return state.winnerId || state.winner_id || null; 
  }

  goToHome() {
    this.nakamaService.fetchMyTrophies(); // Refresh trophies after match ends!
    this.router.navigate(['/home']);
  }

  async cancelMatchmaking() {
    await this.nakamaService.cancelMatchmaking();
    this.router.navigate(['/home']);
  }

  confirmForfeit() {
    this.showForfeitModal.set(false);
    this.nakamaService.leaveMatch();
    setTimeout(() => {
      this.nakamaService.fetchMyTrophies();
    }, 500);
    this.router.navigate(['/home']);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.sub) this.sub.unsubscribe();
  }
  // NEW: Check if the win was due to a forfeit
  isForfeitWin(): boolean {
    const state = this.gameState();
    if (!state) return false;
    
    const winner = this.getWinner();
    if (!winner || winner === 'DRAW') return false;

    const board = state.board || [0,0,0,0,0,0,0,0,0];
    return !this.hasWinningLine(board);
  }

  // NEW: Helper to scan the board for an actual 3-in-a-row
  private hasWinningLine(board: number[]): boolean {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (const [a, b, c] of lines) {
      if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) {
        return true; // Someone actually connected 3!
      }
    }
    return false; 
  }
}
