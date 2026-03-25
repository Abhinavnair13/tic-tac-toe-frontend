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
  public client: Client;
  public session!: Session;
  private socket!: Socket;
  public selectedMode: 'timed' | 'untimed' = 'timed';
  private zone = inject(NgZone);
  private router = inject(Router);
  public myTrophies = signal<number>(0);
  private matchId: string | null = null;
  public sessionKicked = signal<boolean>(false);
  public isReconnecting = signal<boolean>(false);
  private reconnectAttempts = 0;
  private matchmakerTicket: string | null = null;
  public activeMatchId: string | null = null;
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
  async getUsers(userIds: string[]) {
    if (!this.session) return [];
    try {
      const response = await this.client.getUsers(this.session, userIds);
      return response.users || [];
    } catch (err) {
      console.error('Failed to fetch user profiles:', err);
      return [];
    }
  }
async restoreSession(): Promise<boolean> {
    const token = localStorage.getItem('nakama_token');
    const refreshToken = localStorage.getItem('nakama_refresh_token'); 
    
    if (!token) return false;

    try {
      // THE FIX: Pass both the token and the refresh token
      this.session = Session.restore(token, refreshToken || '');
      
      // Check if expired
      if (this.session.isexpired(Math.floor(Date.now() / 1000))) {
        localStorage.removeItem('nakama_token');
        localStorage.removeItem('nakama_refresh_token'); // NEW
        return false;
      }

      // Reconnect Socket
      this.socket = this.client.createSocket();
      await this.socket.connect(this.session, true);
      this.setupListeners();
      await this.joinGlobalChannel();
      this.fetchMyTrophies();

      // DID WE REFRESH DURING A MATCH?
      const savedMatchId = localStorage.getItem('active_match_id');
      if (savedMatchId) {
        await this.rejoinMatch(savedMatchId);
      }

      return true;
    } catch (err) {
      localStorage.removeItem('nakama_token');
      localStorage.removeItem('nakama_refresh_token'); // NEW
      return false;
    }
  }

  // 2. Helper to reconnect to an orphaned match
  async rejoinMatch(matchId: string) {
    try {
      const match = await this.socket.joinMatch(matchId);
      this.zone.run(() => {
        this.matchId = match.match_id;
        this.activeMatchId = match.match_id;
        this.matchStatus.set('ACTIVE');
        this.startPingHeartbeat();
        this.router.navigate(['/play']); // Force them to the board!
      });
    } catch (err) {
      // Match already ended on server, clear it
      localStorage.removeItem('active_match_id');
      this.activeMatchId = null;
    }
  }
  async login(email: string, password: string): Promise<{ success: boolean, message?: string }> {
    try {
      this.session = await this.client.authenticateEmail(email, password, false);
      localStorage.setItem('nakama_token', this.session.token); 
      localStorage.setItem('nakama_refresh_token', this.session.refresh_token); 
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
      localStorage.setItem('nakama_token', this.session.token); 
      localStorage.setItem('nakama_refresh_token', this.session.refresh_token);
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
    const query = `+properties.mode:${this.selectedMode}`;
    const stringProps = { mode: this.selectedMode };
    const matchmakerResponse = await this.socket.addMatchmaker(query, 2, 2, stringProps);
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
      localStorage.removeItem('active_match_id');
    } catch (err) {
      console.warn('Match already closed on server.');
    } finally {
      this.matchId = null;
      this.matchStatus.set('LOGIN');
      if (this.pingInterval) clearInterval(this.pingInterval);
      this.gameStateSubject.next(null); 
      localStorage.removeItem('active_match_id');
    }
  }

  logout() {
  
    this.session = null as any;
    this.matchStatus.set('LOGIN');
    this.matchId = null;
    this.matchmakerTicket = null;
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.queuePingInterval) clearInterval(this.queuePingInterval);
    this.gameStateSubject.next(null);

    localStorage.removeItem('nakama_token');
    localStorage.removeItem('nakama_refresh_token');
    localStorage.removeItem('active_match_id');

    if (this.socket) {
      this.socket.disconnect(false);
    }
  }

private setupListeners() {
  this.socket.onnotification = (notification) => {
      this.zone.run(() => {
        if (notification.code === -7 || notification.subject === 'single_socket') {
          console.warn('Received single_socket kick from server!');
          this.sessionKicked.set(true); // Trigger the UI modal
          this.logout(); // Completely wipe localStorage so it CANNOT auto-reconnect
        }
      });
    };

    // 2. HANDLE STANDARD DISCONNECTS safely
    this.socket.ondisconnect = (event) => {
      this.zone.run(() => {
        console.warn('WebSocket Disconnected', event);
        
        // THE FIX: Only reconnect if we weren't kicked AND we didn't intentionally log out
        if (!this.sessionKicked() && this.session) {
          this.isReconnecting.set(true);
          this.attemptReconnect();
        } else if (!this.sessionKicked()) {
          // We intentionally logged out, so cleanly reset the UI state
          this.matchStatus.set('LOGIN');
          this.matchId = null;
          this.activeMatchId = null;
        }
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
        localStorage.setItem('active_match_id', match.match_id);
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
private async attemptReconnect() {
    if (this.sessionKicked()) {
      this.isReconnecting.set(false);
      return;
    }

    // THE UPDATE: Give up after 5 failed attempts and log them out
    if (this.reconnectAttempts >= 5) {
      console.error('Failed to reconnect after 5 attempts. Logging out.');
      this.isReconnecting.set(false);
      this.reconnectAttempts = 0;
      this.logout(); // Wipes localStorage and resets all signals
      this.zone.run(() => {
        this.router.navigate(['/auth']);
      });
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnection attempt ${this.reconnectAttempts}...`);

    try {
      this.socket = this.client.createSocket();
      await this.socket.connect(this.session, true);
      this.setupListeners();
      await this.joinGlobalChannel();
      
      if (this.activeMatchId) {
        await this.rejoinMatch(this.activeMatchId);
      }

      this.zone.run(() => {
        this.isReconnecting.set(false);
        this.reconnectAttempts = 0;
      });
    } catch (err) {
      setTimeout(() => {
        this.zone.run(() => this.attemptReconnect());
      }, 2000);
    }
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
  async getProfileData() {
    if (!this.session) return null;
    try {
      // Fetch Account details (Name, Username, Email)
      const account = await this.client.getAccount(this.session);
      
      // Fetch Custom Stats from the Storage Engine
      const storage = await this.client.readStorageObjects(this.session, {
        object_ids: [{ collection: 'stats', key: 'profile', user_id: this.myUserId }]
      });

      let stats = { wins: 0, losses: 0, streak: 0 };
      if (storage.objects && storage.objects.length > 0) {
        stats = storage.objects[0].value as any;
      }

      return { account, stats };
    } catch (err) {
      console.error('Failed to fetch profile', err);
      return null;
    }
  }
  getSession(): Session | null {
    return this.session;
  }

  async getLeaderboardWithStats() {
    if (!this.session) return [];
    try {
      const response = await this.client.rpc(this.session, 'get_leaderboard_with_stats', {});
      
      if (response.payload) {
        return typeof response.payload === 'string' ? JSON.parse(response.payload) : response.payload;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch leaderboard rpc', err);
      return [];
    }
  }
}
