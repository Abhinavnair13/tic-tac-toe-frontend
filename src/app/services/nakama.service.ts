import { Injectable, signal,NgZone,inject} from '@angular/core';
import { Router } from '@angular/router';
import { Client, Session, Socket, MatchData } from '@heroiclabs/nakama-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState } from '../models/game-state.model';
import { tictactoe } from '../tictactoe.js';


@Injectable({
  providedIn: 'root'
})
export class NakamaService {
  private client: Client;
  private session!: Session;
  private socket!: Socket;

  private zone = inject(NgZone);
  private router = inject(Router);
  public myTrophies = signal<number>(0);
  private matchId: string | null = null;
  private matchmakerTicket: string | null = null;
  
  private gameStateSubject = new BehaviorSubject<GameState | null>(null);
  public gameState$: Observable<GameState | null> = this.gameStateSubject.asObservable();

  public matchStatus = signal<'LOGIN' | 'QUEUE' | 'ACTIVE'>('LOGIN');
  public ping = signal<number>(0);
  public onlinePlayers = signal<number>(1);
  
  private globalChannel: any = null;
  private pingInterval: any;
  private queuePingInterval: any;
  private lastPingTime: number = 0;

  constructor() {
    this.client = new Client('defaultkey', '127.0.0.1', '7350', false);
  }

  get myUserId(): string | '' {
    return this.session?.user_id || '';
  }

  get myUsername(): string | null {
    return this.session?.username || null;
  }
  async fetchMyTrophies() {
    if (!this.session) return;
    try {
      // Ask Nakama for just our own leaderboard record
      const records = await this.client.listLeaderboardRecords(this.session, 'global_trophies', [this.myUserId], 1);
      if (records.owner_records && records.owner_records.length > 0) {
        this.myTrophies.set(Number(records.owner_records[0].score) || 0);
      }
    } catch (err) {
      console.error('Failed to fetch trophies', err);
    }
  }
  public hasSession(): boolean {
    return !!this.session && !this.session.isexpired(Math.floor(Date.now() / 1000));
  }

  async login(email: string, password: string): Promise<{ success: boolean, message?: string }> {
    try {
      this.session = await this.client.authenticateEmail(email, password, false);
      this.socket = this.client.createSocket();
      await this.socket.connect(this.session, true);
      this.setupListeners();
      await this.joinGlobalChannel();
      this.fetchMyTrophies();
      return { success: true };
    } catch (err: any) {
      console.error('Login failed', err);
      return { success: false, message: err.message || 'Login failed' };
    }
  }

  async register(email: string, password: string, username: string, firstName: string, lastName: string): Promise<{ success: boolean, message?: string }> {
    try {
      this.session = await this.client.authenticateEmail(email, password, true, username);
      await this.client.updateAccount(this.session, { display_name: `${firstName} ${lastName}` });
      this.socket = this.client.createSocket();
      await this.socket.connect(this.session, true);
      this.setupListeners();
      await this.joinGlobalChannel();
      this.fetchMyTrophies();
      return { success: true };
    } catch (err: any) {
      console.error('Registration failed', err);
      return { success: false, message: err.message || 'Registration failed' };
    }
  }

  async getLeaderboard() {
    if (!this.session) return null;
    try {
      return await this.client.listLeaderboardRecords(this.session, 'global_trophies');
    } catch (err) {
      console.error('Failed to get leaderboard updates', err);
      return null;
    }
  }

  async joinMatchmaking() {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.matchStatus.set('QUEUE');
    const matchmakerResponse = await this.socket.addMatchmaker('*', 2, 2);
    this.matchmakerTicket = matchmakerResponse.ticket;

    // Fake a ping metric while in queue using a dummy HTTP call
    if (this.queuePingInterval) clearInterval(this.queuePingInterval);
    // Do an immediate ping
    this.measureHttpPing();
    this.queuePingInterval = setInterval(() => {
      if (this.matchStatus() === 'QUEUE') {
        this.measureHttpPing();
      } else {
        clearInterval(this.queuePingInterval);
      }
    }, 4000);
  }

  private async measureHttpPing() {
    const start = Date.now();
    try {
      // Very lightweight call to measure API server latency
      await this.client.getAccount(this.session);
      this.ping.set(Date.now() - start);
    } catch { }
  }

  async cancelMatchmaking() {
    if (!this.socket || !this.matchmakerTicket) return;
    try {
      await this.socket.removeMatchmaker(this.matchmakerTicket);
      this.matchmakerTicket = null;
      this.matchStatus.set('LOGIN');
      if (this.queuePingInterval) clearInterval(this.queuePingInterval);
      this.zone.run(() => {
        this.router.navigate(['/home']);
      });
    } catch (err) {
      console.error('Failed to cancel matchmaking', err);
    }
  }

 async leaveMatch() {
    if (!this.socket || !this.matchId) {
      this.gameStateSubject.next(null); // Catch-all
      return;
    }
    try {
      // This might throw an error if the server already destroyed the match instance
      await this.socket.leaveMatch(this.matchId);
    } catch (err) {
      console.warn('Match already closed on server.');
    } finally {
      this.matchId = null;
      this.matchStatus.set('LOGIN');
      if (this.pingInterval) clearInterval(this.pingInterval);
      this.gameStateSubject.next(null); 
    }
  }

  logout() {
    if (this.socket) {
      this.socket.disconnect(false);
    }
    this.session = null as any;
    this.matchStatus.set('LOGIN');
    this.matchId = null;
    this.matchmakerTicket = null;
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.queuePingInterval) clearInterval(this.queuePingInterval);
    this.gameStateSubject.next(null);
  }

private setupListeners() {
  this.socket.ondisconnect = (event) => {
      this.zone.run(() => {
        console.error('WebSocket Disconnected!', event);
        this.logout(); 
        window.location.href = '/auth'; 
      });
    };
    this.socket.onchannelpresence = (presenceEvent) => {
      this.zone.run(() => {
        if (this.globalChannel && presenceEvent.channel_id === this.globalChannel.id) {
          const joins = presenceEvent.joins?.length || 0;
          const leaves = presenceEvent.leaves?.length || 0;
          this.onlinePlayers.update(count => count + joins - leaves);
        }
      });
    };

    this.socket.onmatchmakermatched = async (matched) => {
      const match = await this.socket.joinMatch(matched.match_id, matched.token);
      
      this.zone.run(() => {
        this.matchId = match.match_id;
        this.matchStatus.set('ACTIVE');
        this.startPingHeartbeat();
      });
    };

    this.socket.onmatchdata = (matchData: MatchData) => {
      this.zone.run(() => {
        
        const opCode = Number(matchData.op_code);

        switch (opCode) {
          case 2:
            let buffer = matchData.data as any;
            if (typeof buffer === 'string') {
              buffer = Uint8Array.from(atob(buffer), c => c.charCodeAt(0));
            } else if (!(buffer instanceof Uint8Array)) {
              buffer = new Uint8Array(buffer);
            }

            const decoded = tictactoe.GameState.decode(buffer);
            
            // THE FIX: If ProtobufJS drops the zero-filled array, recreate it!
            if (!decoded.board || decoded.board.length === 0) {
              decoded.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            }
            
            this.gameStateSubject.next(decoded as unknown as GameState);
            break;
            
          case 4:
            const rtt = Date.now() - this.lastPingTime;
            this.ping.set(rtt);
            break;
        }
      });
    };
  }

async sendMove(position: number) {
  if (!this.matchId || !this.socket) return;
  try {
    const payload = tictactoe.MoveRequest.create({ position });
    
    // THE FIX: Add .slice() to break out of the 8KB memory pool!
    // This creates a fresh, exact-sized copy (usually just 2 bytes)
    const encoded = tictactoe.MoveRequest.encode(payload).finish().slice(); 
    
    // Now Nakama will send a tiny, clean payload like "CAA="
    await this.socket.sendMatchState(this.matchId, 1, encoded);
    
    console.log("Move successfully sent to the server!");
  } catch (err) {
    console.error("Failed to send move over WebSocket:", err);
  }
}

  private startPingHeartbeat() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    
    this.pingInterval = setInterval(() => {
      if (this.matchId && this.socket) {
        this.lastPingTime = Date.now();
        this.socket.sendMatchState(this.matchId, 4, new Uint8Array());
      }
    }, 5000);
  }

  private async joinGlobalChannel() {
    try {
      this.globalChannel = await this.socket.joinChat('Global', 1, false, false);
      
      if (!this.globalChannel.presences) {
        this.globalChannel.presences = [];
      }
      
      const existingPlayers = this.globalChannel.presences.length;
      this.onlinePlayers.set(existingPlayers + 1);
    } catch (err) {
      console.error('Failed to join global channel', err);
    }
  }
}
