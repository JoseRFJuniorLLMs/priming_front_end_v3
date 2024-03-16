import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';


import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexScrollbarComponent } from '@vex/components/vex-scrollbar/vex-scrollbar.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';


import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import {
  CdkDrag,
  CdkDropList
} from '@angular/cdk/drag-drop';


/**
 * @title Drag&Drop position opened and boundary
 */
@Component({
  selector: 'puzzle-block',
  templateUrl: 'puzzle-block.html',
  styleUrls: ['puzzle-block.scss'],
  animations: [stagger40ms, fadeInUp400ms],
  standalone: true,
  imports: [
    CdkDrag,
    MatIconModule,
    MatButtonModule,
    NgFor,
    MatRippleModule,
    RouterLinkActive,
    NgClass,
    RouterLink,
    RouterOutlet,
    MatSidenavModule,
    MatMenuModule,
    MatIconModule,
    NgClass,
    NgIf,
    VexScrollbarComponent,
    NgFor,
    MatRippleModule,
    RouterLinkActive,
    RouterLink,
    RouterOutlet,
    AsyncPipe,
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    CdkDropList,
    VexBreadcrumbsComponent,
    VexSecondaryToolbarComponent
  ],
})


export class PuzzleBlockComponent {
  audioChunks: any[] = [];
  isRecording = false;
  mediaRecorder?: MediaRecorder;
  audioUrl: string | null = null;

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  activateMicrophone(): void {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();
        this.audioChunks = [];
        this.mediaRecorder.ondataavailable = event => {
          this.audioChunks.push(event.data);
        };
      })
      .catch(err => {
        console.error('Não foi possível acessar o microfone', err);
      });
  }

  startRecording(): void {
    if (!this.isRecording) {
      this.activateMicrophone();
      this.isRecording = true;
    }
  }

  stopRecording(): void {
    if (!this.mediaRecorder) {
      return;
    }
    this.mediaRecorder.stop();
    this.isRecording = false;

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      if (this.audioUrl) {
        URL.revokeObjectURL(this.audioUrl);
      }
      this.audioUrl = URL.createObjectURL(audioBlob);
      this.audioChunks = [];
      this.enviarArquivoDeAudio(audioBlob); // Envia o áudio imediatamente após parar a gravação
    };
  }

  enviarArquivoDeAudio(audioBlob: Blob): void {
    const formData = new FormData();
    formData.append('file', audioBlob);
    this.http.post<any>('http://127.0.0.1/audio/transcribe/', formData)
    .subscribe(
      response => console.log('Resposta do servidor:', response),
      error => console.error('Erro ao enviar arquivo de áudio:', error)
    );
  }

  enviarArquivo() {
    // Caminho onde seu arquivo de áudio é acessível após o deployment
    const urlDoArquivo = '../../assets/audio/micro-machines.wav';
    // Faz uma requisição GET para obter o arquivo como um Blob
    this.http.get(urlDoArquivo, { responseType: 'blob' }).subscribe(blob => {
      const formData = new FormData();
      formData.append('file', blob, 'micro-machines.wav');

      // Envia o Blob para a sua API
      this.http.post('http://127.0.0.1:8000/audio/transcribe/', formData).subscribe(
        resposta => console.log('Resposta do servidor:', resposta),
        erro => console.error('Erro ao enviar arquivo:', erro)
      );
    });
  }

}
