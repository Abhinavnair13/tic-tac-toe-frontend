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
  opponentTimer = signal<number>(0);
  opponentName = signal<string | null>(null);
  private fetchedUsers = false;
  matchStatus = this.nakamaService.matchStatus;
  ping = this.nakamaService.ping;
  showGameOverModal = signal<boolean>(false);
  winningClass = signal<string | null>(null);
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
      const oldState = this.gameState();
      this.gameState.set(state);
      this.updateTimer();
      
      if (!state) return;
      const p1 = state.p1Id || state.p1_id;
      const p2 = state.p2Id || state.p2_id;
      if (p1 && p2 && !this.fetchedUsers) {
        this.fetchedUsers = true;
        this.resolveUsernames(p1, p2);
      }

      // Check if the game JUST finished on this exact tick
      const winnerNow = this.extractWinner(state);
      const winnerBefore = this.extractWinner(oldState);

      if (winnerNow && !winnerBefore) {
        const board = state.board || [0,0,0,0,0,0,0,0,0];
        const wLine = this.getWinningLineClass(board);
        
        if (wLine) {
          // It's a normal win: Show the line and wait 3 seconds
          this.winningClass.set(wLine);
          setTimeout(() => {
            this.showGameOverModal.set(true);
          }, 4000);
        } else {
          // It's a Forfeit or Draw: Show modal immediately
          this.showGameOverModal.set(true);
        }
      } else if (!winnerNow) {
        this.showGameOverModal.set(false);
        this.winningClass.set(null);
      }
    });
    
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);

    if (this.nakamaService.matchStatus() !== 'ACTIVE') {
      this.nakamaService.joinMatchmaking();
    }
  }
  updateTimer() {
    // --- Existing Turn Timer Logic ---
    if (this.isTimedMode()) {
      const state = this.gameState();
      if (state && (state.turnStartTime || state.turn_start_time)) {
        const turnStartTime = Number(state.turnStartTime || state.turn_start_time);
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - turnStartTime;
        const remaining = Math.max(0, 30 - elapsed);
        this.timeLeft.set(remaining);
      } else {
        this.timeLeft.set(30);
      }
    }

    // --- NEW: Disconnect Countdown Logic ---
    const dTime = this.opponentDisconnectTime();
    // Only tick down if someone disconnected AND the game isn't already over
    if (dTime > 0 && !this.getWinner()) {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - dTime;
      this.opponentTimer.set(Math.max(0, 15 - elapsed));
    } else {
      this.opponentTimer.set(0);
    }
  }
  isTimedMode(): boolean {
    const s = this.gameState(); 
    
    // If the server explicitly sent the mode, use it
    if (s && s.isTimedMode !== undefined) return s.isTimedMode;
    if (s && s.is_timed_mode !== undefined) return s.is_timed_mode;
    
    // THE FIX: Fallback to whatever button the user clicked on the home screen
    return this.nakamaService.selectedMode === 'timed';
  }
  p1TimeUsed(): number {
    const s = this.gameState(); 
    return s ? Number(s.p1TimeUsed || s.p1_time_used || 0) : 0;
  }

  p2TimeUsed(): number {
    const s = this.gameState(); 
    return s ? Number(s.p2TimeUsed || s.p2_time_used || 0) : 0;
  }
  opponentDisconnectTime(): number {
    const s = this.gameState();
    if (!s) return 0;
    const p1 = s.p1Id || s.p1_id;
    // Return the other guy's disconnect time
    if (this.myUserId === p1) return Number(s.p2DisconnectTime || s.p2_disconnect_time || 0);
    return Number(s.p1DisconnectTime || s.p1_disconnect_time || 0);
  }

  getEarnedTrophies(): number {
    if (this.isTimedMode()) return 10;
    
    const p1 = this.p1Id();
    const myTime = this.myUserId === p1 ? this.p1TimeUsed() : this.p2TimeUsed();
    
    if (myTime <= 120) return 10;
    if (myTime <= 180) return 9;
    if (myTime <= 240) return 8;
    return 7;
  }
  extractWinner(state: any): string | null {
    if (!state) return null;
    
    const winner = state.winnerId || state.winner_id;
    if (winner) return winner;

    const board = state.board || [0,0,0,0,0,0,0,0,0];
    const isFull = board.every((cell: number) => cell !== 0);
    if (isFull) return 'DRAW';

    return null;
  }
  async resolveUsernames(p1: string, p2: string) {
    const opponentId = (p1 === this.myUserId) ? p2 : p1;
    const users = await this.nakamaService.getUsers([opponentId]);
    
    if (users.length > 0 && users[0].username) {
      this.opponentName.set(users[0].username);
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
    if (!state) return;
    
    if (!this.isMyTurn()) return;

    const board = state.board || [0,0,0,0,0,0,0,0,0];
    if (board[index] !== 0) return;

    // THE FIX: Use getWinner() so it blocks moves if the game is a DRAW
    if (this.getWinner()) return;

    this.nakamaService.sendMove(index);
  }
  // Safe getter for the winner ID (handles Protobuf JS formatting)
  getWinner(): string | null {
    return this.extractWinner(this.gameState()); 
  }

  goToHome() {
    this.nakamaService.fetchMyTrophies(); // Refresh trophies after match ends!
    this.nakamaService.leaveMatch();
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

  p1Id(): string | null {
    const s = this.gameState(); return s ? (s.p1Id || s.p1_id) : null;
  }
  
  p2Id(): string | null {
    const s = this.gameState(); return s ? (s.p2Id || s.p2_id) : null;
  }

  isXTurn(): boolean {
    const s = this.gameState(); return s ? (s.currentTurn === 1 || s.current_turn === 1) : false;
  }

  isOTurn(): boolean {
    const s = this.gameState(); return s ? (s.currentTurn === 2 || s.current_turn === 2) : false;
  }

  getPlayerName(id: string | null): string {
    if (!id) return '...';
    if (id === this.myUserId) return '(You)';
    
    return this.opponentName() || 'Opponent'; 
  }

  // --- NEW HELPER TO FIND THE WINNING LINE ---
  getWinningLineClass(board: number[]): string | null {
    const lines = [
      { indices: [0, 1, 2], class: 'strike-row-1' },
      { indices: [3, 4, 5], class: 'strike-row-2' },
      { indices: [6, 7, 8], class: 'strike-row-3' },
      { indices: [0, 3, 6], class: 'strike-col-1' },
      { indices: [1, 4, 7], class: 'strike-col-2' },
      { indices: [2, 5, 8], class: 'strike-col-3' },
      { indices: [0, 4, 8], class: 'strike-diag-1' },
      { indices: [2, 4, 6], class: 'strike-diag-2' }
    ];
    for (const line of lines) {
      const [a, b, c] = line.indices;
      if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) {
        return line.class;
      }
    }
    return null;
  }
}
