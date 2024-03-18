
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
//import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';
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
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
      url: '../../assets/audio/micro-machines.wav',
      autoplay: false,
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
  }

  togglePlayback(): void {
    if (this.isPlaying) {
      this.pauseAudio();
    } else {
      this.playAudio();
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
  /**
  customRender(wavesurfer: WaveSurfer): void {
    const canvas = wavesurfer.container.querySelector('canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas context not available');
        return;
    }

    // Limpa o canvas antes de aplicar a renderização personalizada
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Obtém os picos de áudio
    const peaks = wavesurfer.backend.getPeaks(canvas.width);

    // Calcula o valor máximo de pico
    const maxPeak = Math.max(...peaks);

    // Calcula o valor máximo absoluto de pico
    const absMaxPeak = Math.max(...peaks.map(Math.abs));

    const { width, height } = canvas;
    const step = 10;

    ctx.translate(0, height / 2);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();

    for (let i = 0; i < width; i += step * 2) {
        const peakIndex = Math.floor((i / width) * peaks.length);
        const peakValue = peaks[peakIndex];
        const normalizedPeakValue = Math.abs(peakValue) / absMaxPeak;
        const value = normalizedPeakValue * height;
        let x = i;
        let y = value;

        ctx.moveTo(x, 0);
        ctx.lineTo(x, y);
        ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, true);
        ctx.lineTo(x + step, 0);

        x += step;
        y = -y;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, y);
        ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, false);
        ctx.lineTo(x + step, 0);
    }

    ctx.stroke();
    ctx.closePath();

    // Reset the transform after drawing
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}**/


}// fim
