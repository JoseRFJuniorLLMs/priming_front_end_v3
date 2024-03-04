import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import gpt4 from 'gpt4.json';
import { WidgetAssistantComponent } from '../components/widgets/widget-assistant/widget-assistant.component';
import { WidgetLargeChartComponent } from '../components/widgets/widget-large-chart/widget-large-chart.component';
import { WidgetLargeGoalChartComponent } from '../components/widgets/widget-large-goal-chart/widget-large-goal-chart.component';
import { WidgetQuickLineChartComponent } from '../components/widgets/widget-quick-line-chart/widget-quick-line-chart.component';
import { WidgetQuickValueCenterComponent } from '../components/widgets/widget-quick-value-center/widget-quick-value-center.component';
import { WidgetTableComponent } from '../components/widgets/widget-table/widget-table.component';

import { MatTabsModule } from '@angular/material/tabs';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { PageLayoutDemoComponent } from '../../ui/page-layouts/page-layout-demo/page-layout-demo.component';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';

import { MatTooltipModule } from '@angular/material/tooltip';
import screenfull from 'screenfull';

import WaveSurfer from 'wavesurfer.js';

/* import * as Annyang from 'annyang'; */

// Interface para descrever a estrutura da resposta da API
interface ResponseData {
  choices?: { message: { content: string } }[];
}

@Component({
  selector: 'vex-dashboard-analytics',
  templateUrl: './dashboard-analytics.component.html',
  styleUrls: ['./dashboard-analytics.component.scss'],
  standalone: true,
  imports: [CommonModule,FormsModule, MatBottomSheetModule, MatListModule,
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    WidgetAssistantComponent,
    WidgetQuickLineChartComponent,
    WidgetLargeGoalChartComponent,
    WidgetQuickValueCenterComponent,
    WidgetLargeChartComponent,
    WidgetTableComponent,
    PageLayoutDemoComponent,
    MatTabsModule,
    VexPageLayoutContentDirective,
    VexPageLayoutHeaderDirective,
    VexPageLayoutComponent,
    MatCardModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    HttpClientModule

  ]
})


export class DashboardAnalyticsComponent implements OnInit , AfterViewInit {

  @ViewChild('waveform', { static: false }) waveformEl!: ElementRef<any>;
  private waveform!: WaveSurfer;
  public isPlaying: boolean = false;

  ngAfterViewInit(): void {

    this.isPlaying = false;

    this.waveform = WaveSurfer.create({

      container: this.waveformEl.nativeElement,
     /*  url: 'https://storage.googleapis.com/priming_text_wav/ABOVE.wav', */

      url: '../../assets/audio/ADVANCE.wav',
/*       waveColor: '#d3d3d3',
      progressColor: '#000000', */
      waveColor: 'rgb(200, 0, 200)',
      progressColor: '#000000',
      cursorColor: '#000000',
      cursorWidth: 5,

      minPxPerSec: 50,

      barWidth: 10,
      barRadius: 2,
      barGap: 2,

      autoScroll: true,
      autoCenter: true,
      interact: true,
      dragToSeek: true,
      mediaControls: true,
      autoplay: false,
      fillParent: true

    });

    this.events();
  }

  events() {

    this.waveform.once('interaction', () => {
      this.waveform.play();
    })

    this.waveform.on('play', () => {
      this.isPlaying = true;
    })

    this.waveform.on('pause', () => {
      this.isPlaying = false;
    })
  }

  playAudio() {
    this.waveform.play();
  }

  pauseAudio() {
    this.waveform.pause();
  }

  stopAudio() {
    this.waveform.stop();
  }


    // Defina as vozes disponíveis
  voices: string[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

  speechRecognition: any;

  isTranscribing = false;

  textToSpeech!: string;
  audioBlob!: Blob;
  audioUrl!: string;

  durationInSeconds = 130;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  questionAnswerList: any[] = [];
  questionText: any = '';
  chatMessage: any;
  isLoading = false;
  errorText = '';
  selectedText: string = '';
  data: any;

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {}

    // Função para selecionar uma voz aleatória
    getRandomVoice(): string {
      const randomIndex = Math.floor(Math.random() * this.voices.length);
      return this.voices[randomIndex];
    }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Save Notes', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
    this.generateAudio();
  }

  ngOnInit(): void {
     if (screenfull.isEnabled) {
      screenfull.request();
    }

   /*  Annyang.start({ autoRestart: true }); */
    this.speechRecognition.continuous = true;
 }

 async questionToOpenAI(question: string) {
  this.isLoading = true;
  try {
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${gpt4.gptApiKey}`,
      "Content-Type": "application/json"
    });

    const response: ResponseData | undefined = await this.http.post<ResponseData>(gpt4.gptUrl, {
      messages: [{ role: 'user', content: question }],
      temperature: 0.0,//0.5
      max_tokens: 100,//4000
      model: "gpt-4",
    }, { headers }).toPromise();
         // Verificando se a resposta é indefinida
         if (response === undefined) {
          throw new Error("Resposta indefinida.");
        }
        // Verificando se a propriedade 'choices' está presente na resposta
        if (response.choices && response.choices.length > 0) {
          this.chatMessage = response.choices[0].message.content;
          // Chamando a função para exibir o Snackbar com a mensagem processada
          this.openSnackBar(this.chatMessage);
        } else {
          throw new Error("Resposta inválida.");
        }
      } catch (error) {
        this.errorText = (error as any).error.message;
      } finally {
        this.isLoading = false;
      }
    }

    @HostListener('document:mouseup', ['$event'])
    handleMouseUp(event: MouseEvent) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== '') {
        this.selectedText = selection.toString();
        this.questionToOpenAI(this.selectedText);
      }
    }

    generateAudio(): void {
      if (!this.chatMessage) {
        // Handle case where chatMessage is empty or undefined
        console.error('No chatMessage to generate audio from.');
        return;
      }

      const openAIKey = gpt4.gptApiKey;
      const url = "https://api.openai.com/v1/audio/speech";

      const body = {
        model: "tts-1",
        voice: this.getRandomVoice(),
        input: this.chatMessage
      };

      const headers = new HttpHeaders({
        "Authorization": `Bearer ${openAIKey}`
      });

      this.http.post(url, body, { headers, responseType: "blob"})
        .subscribe(response => {
          this.audioBlob = new Blob([response], { type: 'audio/mpeg' }); // Adjust type if needed
          this.audioUrl = URL.createObjectURL(this.audioBlob);
          const audio = new Audio(this.audioUrl);
          audio.play();
        });
    }

    async transcribeAudio(audioBlob: Blob) {
      const formData = new FormData();
      formData.append('file', audioBlob);

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${gpt4.gptApiKey}`
      });

      try {
        const transcription = await this.http.post<any>(
          'https://api.openai.com/v1/audio/transcribe',
          formData,
          { headers }
        ).toPromise();
        console.log(transcription.text);
      } catch (error) {
        console.error('Error transcribing audio:', error);
      }
    }

    onFileSelected(event: any) {
      const file: File = event.target.files[0];
      this.transcribeAudio(file);
    }

    async startSpeechRecognition() {
      try {
        if (!this.speechRecognition || this.isTranscribing) {
          return;
        }

        this.isTranscribing = true;

        this.speechRecognition.start();

        this.speechRecognition.onresult = (event: { results: { transcript: any; }[]; }) => {
          const transcript = event.results[0].transcript;
          this.questionText = transcript;
        };

        this.speechRecognition.onerror = (error: any) => {
          console.error('Erro no reconhecimento de voz:', error);
          this._snackBar.open('Erro ao transcrever áudio.', 'Ok', { duration: 2000 });
        };

      } catch (error) {
        this.isTranscribing = false;
        console.error('Erro ao iniciar reconhecimento de voz:', error);
        // Exibir erro adequado
      }
    }




  }

  interface ResponseData {
    choices?: { message: { content: string; }; }[];
  }

