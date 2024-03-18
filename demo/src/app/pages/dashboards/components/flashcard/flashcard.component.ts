
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HighlightModule } from 'ngx-highlightjs';
import { QuillEditorComponent } from 'ngx-quill';

import WaveSurfer from 'wavesurfer.js';
//import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
//import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js'
//import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js'
//import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
//import gpt4 from '../../../../../../gpt4.json';

@Component({
  selector: 'vex-flashcard',
  standalone: true,
  templateUrl: './flashcard.component.html',
  styleUrl: './flashcard.component.scss',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    QuillEditorComponent,
    MatRippleModule,
    MatTooltipModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    MatStepperModule,
    MatProgressBarModule,
    MatDividerModule,
    HighlightModule,
    MatProgressSpinnerModule,
    CommonModule

  ]
})
export class FlashcardComponent implements AfterViewInit {


  @ViewChild('waveformContainer') waveformContainer!: ElementRef;
  private wavesurfer!: WaveSurfer;
  isPlaying = false; // Variável para controlar o estado de reprodução

  errorText = "";
  isLoading = false;

  ngAfterViewInit(): void {
    this.initWaveSurfer();
  }

  private initWaveSurfer(): void {
    this.wavesurfer = WaveSurfer.create({
      container: this.waveformContainer.nativeElement,
      waveColor: '#ff4e00',
      progressColor: '#e60a6d',
      barRadius: 30,
      barWidth: 0.1,
      url: '../../assets/audio/micro-machines.wav',
    });

    // Adicione um evento para lidar com o estado de reprodução
    this.wavesurfer.on('play', () => {
      this.isPlaying = true;
    });

    this.wavesurfer.on('pause', () => {
      this.isPlaying = false;
    });

    // Adicione um evento para lidar com a parada do áudio
    this.wavesurfer.on('finish', () => {
      this.isPlaying = false;
    });

    this.wavesurfer.on('play', () => this.isPlaying = true);
    this.wavesurfer.on('pause', () => this.isPlaying = false);
    this.wavesurfer.on('finish', () => this.isPlaying = false);

  }

  togglePlayback(): void {
    if (this.isPlaying) {
      this.wavesurfer.pause();
    } else {
      this.wavesurfer.play();
    }
  }

  playAudio(): void {
    if (this.wavesurfer) {
      this.wavesurfer.play();
    }
  }

  pauseAudio(): void {
    if (this.wavesurfer) {
      this.wavesurfer.pause();
    }
  }


  // Custom Render Function


}// fim
