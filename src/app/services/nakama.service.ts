import { Injectable, signal, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Client, Session, Socket, MatchData } from '@heroiclabs/nakama-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState } from '../models/game-state.model';
import { tictactoe } from '../tictactoe.js';
import { environment } from '../../../environment';

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
    this.client = new Client(
      'defaultkey', 
      environment.nakamaHost, 
      environment.nakamaPort, 
      environment.nakamaUseSSL
    );
  }

  get myUserId(): string | '' {
    return this.session?.user_id || '';
  }

  get myUsername(): string | null {
    return this.session?.username || null;
  }

  public hasSession(): boolean {
    return !!this.session && !this.session.isexpired(Math.floor(Date.now() / 1000));
  }

  private async initializeGameSession() {
    if (this.socket) {
      try { this.socket.disconnect(false); } catch (e) {}
    }

    // 2. Create the ONE true socket using the environment's SSL setting
    this.socket = this.client.createSocket(environment.nakamaUseSSL, false);
    
    // 3. Connect and set up the game world
    await this.socket.connect(this.session, true);
    this.setupListeners();
    await this.joinGlobalChannel();
    this.fetchMyTrophies();
    await this.checkForActiveMatch();
  }

  async login(email: string, password: string): Promise<{ success: boolean, message?: string }> {
    try {
      this.session = await this.client.authenticateEmail(email, password, false);
      localStorage.setItem('nakama_token', this.session.token); 
      localStorage.setItem('nakama_refresh_token', this.session.refresh_token); 
      
      await this.initializeGameSession(); // Centralized setup!
      
      return { success: true };
    } catch (err: any) {
      console.error('Login failed', err);
      return { success: false, message: err.message || 'Login failed' };
    }
  }

  async register(email: string, password: string, username: string, firstName: string, lastName: string): Promise<{ success: boolean, message?: string }> {
    try {
      this.session = await this.client.authenticateEmail(email, password, true, username);
      
      // Prevent "Silent Login" if the email already exists
      if (!this.session.created) {
        this.session = null as any; 
        return { success: false, message: 'This email is already registered. Please log in.' };
      }

      await this.client.updateAccount(this.session, { display_name: `${firstName} ${lastName}` });
      localStorage.setItem('nakama_token', this.session.token); 
      localStorage.setItem('nakama_refresh_token', this.session.refresh_token);
      
      await this.initializeGameSession(); // Centralized setup!
      
      return { success: true };
    } catch (err: any) {
      if (err.message && err.message.includes('Invalid credentials')) {
         return { success: false, message: 'This email is already registered. Please log in.' };
      }
      console.error('Registration failed', err);
      return { success: false, message: err.message || 'Registration failed' };
    }
  }

  async restoreSession(): Promise<boolean> {
    const token = localStorage.getItem('nakama_token');
    const refreshToken = localStorage.getItem('nakama_refresh_token'); 
    
    if (!token) return false;

    try {
      this.session = Session.restore(token, refreshToken || '');
      
      if (this.session.isexpired(Math.floor(Date.now() / 1000))) {
        this.clearLocalData();
        return false;
      }

      await this.initializeGameSession(); // Centralized setup!

      const savedMatchId = localStorage.getItem('active_match_id');
      if (savedMatchId) {
        await this.rejoinMatch(savedMatchId);
      }

      return true;
    } catch (err) {
      this.clearLocalData();
      return false;
    }
  }

  logout() {
    this.session = null as any;
    this.matchStatus.set('LOGIN');
    this.matchId = null;
    this.activeMatchId = null;
    this.matchmakerTicket = null;
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.queuePingInterval) clearInterval(this.queuePingInterval);
    this.gameStateSubject.next(null);

    this.clearLocalData();

    if (this.socket) {
      try { this.socket.disconnect(false); } catch (e) {}
      this.socket = null as any; // Wipe the socket completely
    }
  }

  private clearLocalData() {
    localStorage.removeItem('nakama_token');
    localStorage.removeItem('nakama_refresh_token');
    localStorage.removeItem('active_match_id');
  }

  private async attemptReconnect() {
    if (this.sessionKicked()) {
      this.isReconnecting.set(false);
      return;
    }

    if (this.reconnectAttempts >= 5) {
      console.error('Failed to reconnect after 5 attempts. Logging out.');
      this.isReconnecting.set(false);
      this.reconnectAttempts = 0;
      this.logout(); 
      this.zone.run(() => {
        this.router.navigate(['/auth']);
      });
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnection attempt ${this.reconnectAttempts}...`);

    try {
      await this.initializeGameSession(); // Centralized setup!
      
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

  async rejoinMatch(matchId: string) {
    try {
      const match = await this.socket.joinMatch(matchId);
      this.zone.run(() => {
        this.matchId = match.match_id;
        this.activeMatchId = match.match_id;
        this.matchStatus.set('ACTIVE');
        this.startPingHeartbeat();
        this.router.navigate(['/play']); 
      });
    } catch (err) {
      localStorage.removeItem('active_match_id');
      this.activeMatchId = null;
    }
  }

  async checkForActiveMatch() {
    if (!this.session) return;
    try {
      const storage = await this.client.readStorageObjects(this.session, {
        object_ids: [{ collection: 'system', key: 'active_match', user_id: this.myUserId }]
      });
      
      if (storage.objects && storage.objects.length > 0) {
        const rawValue = storage.objects[0].value;
        const data = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
        
        if (data && data.match_id) {
          console.log("Found active cross-device match, rejoining!");
          await this.rejoinMatch(data.match_id);
        }
      }
    } catch (err) {
      console.warn('No active cross-device match found.');
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

    if (this.queuePingInterval) clearInterval(this.queuePingInterval);
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
      this.gameStateSubject.next(null); 
      return;
    }
    try {
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

  async sendMove(position: number) {
    if (!this.matchId || !this.socket) return;
    try {
      const payload = tictactoe.MoveRequest.create({ position });
      const encoded = tictactoe.MoveRequest.encode(payload).finish().slice(); 
      await this.socket.sendMatchState(this.matchId, 1, encoded);
    } catch (err) {
      console.error("Failed to send move over WebSocket:", err);
    }
  }

  async fetchMyTrophies() {
    if (!this.session) return;
    try {
      const records = await this.client.listLeaderboardRecords(this.session, 'global_trophies', [this.myUserId], 1);
      if (records.owner_records && records.owner_records.length > 0) {
        this.myTrophies.set(Number(records.owner_records[0].score) || 0);
      }
    } catch (err) {
      console.error('Failed to fetch trophies', err);
    }
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

  async getLeaderboard() {
    if (!this.session) return null;
    try {
      return await this.client.listLeaderboardRecords(this.session, 'global_trophies');
    } catch (err) {
      console.error('Failed to get leaderboard updates', err);
      return null;
    }
  }

  async getProfileData() {
    if (!this.session) return null;
    try {
      const account = await this.client.getAccount(this.session);
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

  private setupListeners() {
    this.socket.onnotification = (notification) => {
      this.zone.run(() => {
        if (notification.code === -7 || notification.subject === 'single_socket') {
          console.warn('Received single_socket kick from server!');
          this.sessionKicked.set(true); 
          this.logout(); 
        }
      });
    };

    this.socket.ondisconnect = (event) => {
      this.zone.run(() => {
        console.warn('WebSocket Disconnected', event);
        if (!this.sessionKicked() && this.session) {
          this.isReconnecting.set(true);
          this.attemptReconnect();
        } else if (!this.sessionKicked()) {
          this.matchStatus.set('LOGIN');
          this.matchId = null;
          this.activeMatchId = null;
        }
      });
    };

    this.socket.onchannelpresence = (presenceEvent) => {
      this.zone.run(() => {
        if (this.globalChannel && presenceEvent.channel_id === this.globalChannel.id) {
          const joins = presenceEvent.joins?.filter(p => p.user_id !== this.myUserId).length || 0;
          const leaves = presenceEvent.leaves?.filter(p => p.user_id !== this.myUserId).length || 0;
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

  getSession(): Session | null {
    return this.session;
  }
}