import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterOutlet } from '@angular/router';
import { scaleInOutAnimation } from '@vex/animations/scale-in-out.animation';

import { RsvpreaderComponent } from 'src/app/pages/dashboards/components/dialog-rsvpreader/rsvpreader.component';
import { ShareBottomBookComponent } from 'src/app/pages/dashboards/components/share-bottom-book/share-bottom-book.component';
import { ShareBottomGpt4Component } from 'src/app/pages/dashboards/components/share-bottom-gpt4/share-bottom-gpt4.component';
import { ShareBottomWimHofComponent } from '../../../../../src/app/pages/dashboards/components/share-bottom-wim-hof/share-bottom-wim-hof.component';
import { ShareBottomSheetComponent } from './../../../pages/dashboards/components/share-bottom-sheet/share-bottom-sheet.component';

import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'vex-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [scaleInOutAnimation],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    RouterLink,
    RouterOutlet,
    MatChipsModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    ShareBottomWimHofComponent,
    ShareBottomSheetComponent,
    MatBottomSheetModule,
    ShareBottomGpt4Component,
    ShareBottomBookComponent,
    RsvpreaderComponent,
    HttpClientModule,
    MatSliderModule,
    FormsModule
  ]
})
export class FooterComponent implements OnInit, OnDestroy {

  //chatMessage: string = this.data.texto;

  @Output() openConfig = new EventEmitter();
  @Output() openBottomConfig = new EventEmitter();
  volume: number = 0.5; // Valor inicial do volume

  showButton: boolean = false;
  result?: string;

  audios: string[] = [
    '../../assets/audio/bineural/music.mp3'
  ];

  audioPlayer: HTMLAudioElement | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private _bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private http: HttpClient
    //@Inject(MAT_DIALOG_DATA) public data: { texto: string },
    ) { }

  displayTime: string = '30:00';
  displayTimeMin: string = '30';
  timer: any;
  durationInSeconds: number = 1800;
  selected: string | null = null;
  icon1: string = 'some-icon1';
  icon2: string = 'some-icon2';
  icon3: string = 'some-icon3';
  icon60fps: string = 'mat:60fps';
  icon30fps: string = 'mat:30fps';
  iconmilitarytech: string = 'mat:military_tech';
  paused: boolean = false;
  remainingSeconds: number = 0;
  progress: number = 0;
  isPlaying = false;

changeIcons(): void {
  this.icon60fps = 'mat:60fps_select';
  this.icon30fps = 'mat:30fps_select';
  this.iconmilitarytech = 'mat:military_tech';
}

ngOnInit(): void {
  this.startTimer();
}

ngOnDestroy(): void {
  this.stopTimer();
}

onToggleChange(selection: string) {
  if (selection === 'get-vex3') {
    // Modo exclusivo - Deseleciona os outros
    if (this.selected !== 'get-vex3') {
      this.selected = 'get-vex3';
    } else {
      this.selected = null;
    }
  } else {
    // Se outro botão for selecionado, limpe 'get-vex3'
    this.selected = selection;

    // Se o botão 'get-vex1' ou 'get-vex2' for selecionado, resete o relógio
    if (selection === 'get-vex1' || selection === 'get-vex2') {
      this.stopTimer(); // Pare o timer atual
      if (selection === 'get-vex1') {
        this.durationInSeconds = 30 * 60; // Defina a duração para 30 minutos
      } else {
        this.durationInSeconds = 60 * 60; // Defina a duração para 60 minutos
      }
      this.startTimer(); // Inicie o novo timer
    }
  }
}

startTimer(): void {
  if (this.paused) {
    // Se estiver pausado, continue de onde parou
    this.timer = setInterval(() => {
      const hours = Math.floor(this.remainingSeconds / 3600); // Calcula as horas restantes
      const minutes = Math.floor((this.remainingSeconds % 3600) / 60); // Calcula os minutos restantes
      const seconds = this.remainingSeconds % 60; // Calcula os segundos restantes

      // Formata a exibição da hora, minuto e segundo
      this.displayTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      this.displayTimeMin = `${hours * 60 + minutes}`; // Atualiza displayTimeMin com os minutos totais
      this.cdr.detectChanges();

      if (this.remainingSeconds === 0) {
        this.stopTimer();
        this.endTime(); // Dispara a função quando o tempo acaba
      } else {
        this.remainingSeconds--;
      }
    }, 1000);
  } else {
    // Se não estiver pausado, inicie um novo timer
    this.stopTimer(); // Certifique-se de parar o temporizador antes de iniciar um novo
    this.remainingSeconds = this.durationInSeconds;  // Altere esta linha

    this.timer = setInterval(() => {
      const minutes = Math.floor(this.remainingSeconds / 60);
      const seconds = this.remainingSeconds % 60;
      this.displayTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      this.displayTimeMin = `${minutes}`;
      this.cdr.detectChanges();
      if (this.remainingSeconds === 0) {
        this.stopTimer();
        this.endTime(); // Dispara a função quando o tempo acaba
      } else {
        this.remainingSeconds--;
      }
    }, 1000);
  }
}

endTime(): void {
  this.openBothConfigs();
}


stopTimer(): void {
  clearInterval(this.timer);
}

pauseTimer(): void {
  clearInterval(this.timer);
  this.paused = true;
}

continueTimer(): void {
  if (!this.paused) return;
  this.startTimer();
  this.paused = false;
}

stopProgressBar(): void {
  clearInterval(this.timer);
  this.paused = true;
  this.progress = 0;
}

openBothConfigs() { //shared
  this._bottomSheet.open(ShareBottomWimHofComponent);
}

openBothConfigsBook() { //boooks
  this._bottomSheet.open(ShareBottomBookComponent);
}

openBothConfigsShadowing() { //shadowing
  this._bottomSheet.open(ShareBottomWimHofComponent);
}

openBothConfigsWimHof() {//wim hof
  this._bottomSheet.open(ShareBottomWimHofComponent);
}

openBothConfigsGpt() {//gpt
  this._bottomSheet.open(ShareBottomGpt4Component);
}

openBothConfigsZettelkasten() {//zettelkasten
  this._bottomSheet.open(ShareBottomWimHofComponent);
}

adjustVolume(value: number): void {
  this.volume = value; // Atualiza a propriedade de volume
  if (this.audioPlayer) {
    this.audioPlayer.volume = this.volume;
  }
}

// Método playBiNeural modificado para usar a propriedade 'volume'
playBiNeural() {
  if (this.audioPlayer && !this.audioPlayer.paused) {
    this.audioPlayer.pause();
    this.isPlaying = false;
  } else {
    if (!this.audioPlayer) {
      this.audioPlayer = new Audio('/assets/audio/bineural/music.mp3');
      this.audioPlayer.volume = this.volume; // Defina o volume do player de áudio
    }
    this.audioPlayer.play().then(() => {
      this.isPlaying = true;
    }).catch(error => console.error("Erro ao tentar reproduzir o áudio:", error));

    this.audioPlayer.onended = () => {
      this.isPlaying = false;
      this.audioPlayer = null;
    };
  }
}



}// fim
