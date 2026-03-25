import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NakamaService } from '../services/nakama.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private router = inject(Router);
  public nakamaService = inject(NakamaService);

  isLoading = signal<boolean>(true);
  profileData = signal<any>(null);

  async ngOnInit() {
    if (!this.nakamaService.hasSession()) {
      this.router.navigate(['/auth']);
      return;
    }

    const data = await this.nakamaService.getProfileData();
    this.profileData.set(data);
    this.isLoading.set(false);
  }


  get initials(): string {
    const data = this.profileData();
    if (!data?.account?.user?.username) return '?';
    return data.account.user.username.charAt(0).toUpperCase();
  }
}
