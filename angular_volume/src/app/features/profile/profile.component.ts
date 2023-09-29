import { Component, ElementRef, ViewChild } from '@angular/core';
import { LoginService } from 'src/app/core/services/login.service';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  user: string | null;
  profileImage: string;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private readonly login: LoginService) {
    if (this.login.getUser() !== null) this.user = this.login.getUser();
    else this.user = 'USER';
    this.profileImage = 'https://i.ytimg.com/vi/RQnE2EDbIks/maxresdefault.jpg';
  }

  onFileSelected(event: Event) {
    // WIP: LOGICA MOMENTANEA => DA INVIARE A BACKEND
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
