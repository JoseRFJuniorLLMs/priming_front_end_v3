import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import gpt4 from '../../../../../gpt4.json';

import { WidgetAssistantComponent } from '../components/widgets/widget-assistant/widget-assistant.component';
import { WidgetLargeChartComponent } from '../components/widgets/widget-large-chart/widget-large-chart.component';
import { WidgetLargeGoalChartComponent } from '../components/widgets/widget-large-goal-chart/widget-large-goal-chart.component';
import { WidgetQuickLineChartComponent } from '../components/widgets/widget-quick-line-chart/widget-quick-line-chart.component';
import { WidgetQuickValueCenterComponent } from '../components/widgets/widget-quick-value-center/widget-quick-value-center.component';
import { WidgetTableComponent } from '../components/widgets/widget-table/widget-table.component';

import { MatStepperModule } from '@angular/material/stepper';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from '@vex/animations/scale-in.animation';
import { stagger80ms } from '@vex/animations/stagger.animation';

import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexHighlightDirective } from '@vex/components/vex-highlight/vex-highlight.directive';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';

import nlp from 'compromise';
import { interval, Observable, Subscription } from 'rxjs';
import screenfull from 'screenfull';
import WaveSurfer from 'wavesurfer.js';
//import { NlpService } from 'promise-nlp';
import { WordComponent } from '../components/word/word.component';

import { Course } from 'src/app/model/course/course';
import { CoursesService } from '../../../services/courses.service';
import { PageLayoutDemoComponent } from '../../ui/page-layouts/page-layout-demo/page-layout-demo.component';
import { DialogExampleComponent } from '../components/dialog/dialog-example.component';

// Interface para descrever a estrutura da resposta da API
interface ResponseData {
  choices?: { message: { content: string } }[];
}

@Component({
  selector: 'vex-dashboard-analytics',
  templateUrl: './dashboard-analytics.component.html',
  styleUrls: ['./dashboard-analytics.component.scss'],
  animations: [stagger80ms, fadeInUp400ms, scaleIn400ms, fadeInRight400ms],
  standalone: true,
  imports: [CommonModule, FormsModule, MatBottomSheetModule, MatListModule,
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
    HttpClientModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatStepperModule,
    MatChipsModule,
    VexHighlightDirective,
    WordComponent
  ]
})

export class DashboardAnalyticsComponent implements OnInit, AfterViewInit {

  /* ==================COURSES SERVICES==================== */

  courses$!: Observable<Course[]>;
  //displayedColumns : string[] = ['_id', 'name', 'objective', 'category', 'level', 'price', 'status', 'content', 'lessons', 'description'];
  displayedColumns: string[] = ['name', 'level', 'objective', 'status'];

  /* ==================VIEWCHILD==================== */
  @ViewChild('waveform', { static: false }) waveformEl!: ElementRef<any>;

  /* ==================VARIAVEIS==================== */
  private waveform!: WaveSurfer;
  private subscription: Subscription = new Subscription;
  public isPlaying: boolean = false;
  voices: string[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  //voices: string[] = ['alloy'];
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
  currentTime!: string;
  progressPercentage: number = 0;
  mediaControlsEnabled: boolean = false;
  mediaControlIcon: string = 'mat:sports_esports';
  wordsArray: string[] = [];
  wordsDisplayed: number = 0;
  wordDuration: number = 0;
  result: any;
  imageDisplayed: boolean = false;
  dialogRef: any = null;
  isDialogOpen: boolean = false; // desativa globalmente
  private isGeneratingAudio: boolean = false;
  private readyListener: () => void;
  private finishListener: () => void;

//NLP
// Manipulação de Texto
textNLP: string = 'After a long day at work, she quickly went home to relax and prepare for the busy day ahead.';
pronouns: string[] = []; // Pronome
verbs: string[] = []; // Verbo
nouns: string[] = []; // Substantivo
adjectives: string[] = []; // Adjetivo
adverbs: string[] = []; // Advérbio
people: string[] = []; // Pessoas
places: string[] = []; // Lugares
organizations: string[] = []; // Organizações
dates: string[] = []; // Datas
values: string[] = []; // Valores

// Adicionando novas variáveis para funcionalidades adicionais
phrases: string[] = []; // Frases
clauses: string[] = []; // Cláusulas
negations: string[] = []; // Negativas
questions: string[] = []; // Perguntas
quotes: string[] = []; // Citações
acronyms: string[] = []; // Siglas
emails: string[] = []; // E-mails
urls: string[] = []; // URLs
emojis: string[] = []; // Emojis
mentions: string[] = []; // Menções (@usuario)
hashtags: string[] = []; // Hashtags


  selectedChip: 'phrase' | 'text' | 'word' | null = null;

  /* ==================CONTRUTOR==================== */
  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private coursesService : CoursesService,
    private cdRef: ChangeDetectorRef
  ) {
    this.readyListener = () => {};
    this.finishListener = () => {};
  }

  /* ==================openDialog==================== */
  openDialog(textDisplay: string): void {
    this.isDialogOpen = true;
    // Verifica se já existe um diálogo aberto
    if (this.dialogRef) {
      // Fecha o diálogo atual antes de abrir um novo
      this.dialogRef.close();
    }

// Abre o novo diálogo e armazena sua referência
this.dialogRef = this.dialog.open(DialogExampleComponent, {
  width: '900px',
  height: '800px',
  data: { texto: textDisplay }
});

    // Quando o diálogo for fechado, limpa a referência
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.isDialogOpen = false; // Resetar quando o diálogo é fechado
    });
  }

  dataSource = new MatTableDataSource<Course>();

  /* ==================OnINIT==================== */
  ngOnInit(): void {

    this.analyzeText();

     // Inicialização direta
  this.displayedColumns = ['_id', 'name', 'objective', 'category', 'level', 'price', 'status', 'content', 'lessons'];
  //this.displayedColumns = ['name', 'level', 'objective', 'status'];
  this.coursesService.getCoursesByStudentId('65c6b529c2c6b863b27a3172').subscribe(cursos => {
    this.dataSource = new MatTableDataSource(cursos);
  });

    const studentId = 'student_id';
    this.courses$ = this.coursesService.getCoursesByStudentId(studentId);

    // Definindo colunas dinamicamente com base na entidade Course (exemplo simplificado)
    this.displayedColumns = this.getColumnsFromCourseEntity();

    this.waveform.play();
    this.subscription = interval(1000).subscribe(() => {
      this.getCurrentTime();
    });

    if (screenfull.isEnabled) {
      screenfull.request();
    }
    this.speechRecognition.continuous = true;
  }

   /* ==================COLUMNS COURSE==================== */
  private getColumnsFromCourseEntity(): string[] {
      return ['_id', 'name', 'objective', 'category'];
  }

  /* ==================OnDESTROY==================== */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /*questionToOpenAI CONSOME API DA OPEN IA, recebe question, retorna messages */
  /* async questionToOpenAI(question: string) {
    this.isLoading = true;
    try {
      const headers = new HttpHeaders({
        "Authorization": `Bearer ${gpt4.gptApiKey}`,
        "Content-Type": "application/json"
      });

      const response: ResponseData | undefined = await this.http.post<ResponseData>(gpt4.gptUrl, {
        messages: [{ role: 'user', content: "repeat this word:" + question +",more 3 priming sentences, children's phrases that contain the word" }],
        //messages: [{ role: 'user', content: "repeat this word:" + question }],
        temperature: 0.0,//0.5
        max_tokens: 1000,//4000
        model: "gpt-4",
      }, { headers }).toPromise();
      if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message) {
        throw new Error("Resposta da API não contém dados válidos.");
      }

      this.chatMessage = response.choices[0].message.content;
      // Calcula o tempo necessário para exibir o texto
      const displayTime = this.displayTextWordByWord(this.chatMessage);

      // Define um atraso para iniciar a reprodução do áudio, baseado no tempo de exibição do texto
      setTimeout(() => {
        // Função que carrega e reproduz o áudio
        this.generateAudio();
      }, displayTime);

      // Opção de exibir a mensagem em um Snackbar imediatamente,
      //this.openSnackBar(this.chatMessage);

    } catch (error) {
      // Tratamento de erros
      this.errorText = "Falha ao obter resposta da API: " + (error as Error).message;
    } finally {
      // Sempre será executado após a tentativa ou captura de bloco
      this.isLoading = false;
    }
  }
 */

  async questionToOpenAI(question: string, selection: 'phrase' | 'text' | 'word') {
    this.isLoading = true;
    try {
      const headers = {
        "Authorization": `Bearer ${gpt4.gptApiKey}`,
        "Content-Type": "application/json",
      };

      let contentMessage = `repeat this ${selection}: ${question}`;
      if (selection === 'phrase') {
        contentMessage += ', and provide more sentences that contain the word simple and children';
        this.openSnackBar("Phrase");
      } else if (selection === 'text') {
        this.openSnackBar("Text");
        contentMessage += 'and provide stories using memory palace memorization technique, for children with the word.';
      } else { // 'word'
        this.openSnackBar("Word");
        contentMessage += ', ';
      }

      const response = await this.http.post<any>(gpt4.gptUrl, {
        messages: [{ role: 'user', content: contentMessage }],
        temperature: 0.0,
        max_tokens: 300,
        model: "gpt-4",
      }, { headers }).toPromise();

      if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message) {
        throw new Error("Resposta da API não contém dados válidos.");
      }

      this.chatMessage = response.choices[0].message.content;
      const displayTime = this.displayTextWordByWord(this.chatMessage);
      setTimeout(() => this.generateAudio(), displayTime);
    } catch (error) {
      this.errorText = "Falha ao obter resposta da API (OPEN IA): " + (error as Error).message;
      this.openSnackBar(this.errorText);
    } finally {
      this.isLoading = false;
    }
  }

  /* ==================SELECTION PHASE TEXT WORD==================== */
  onSelection(selection: 'phrase' | 'text' | 'word') {
    this.selectedChip = this.selectedChip === selection ? null : selection;
    this.openSnackBar(selection);
  }

  /* ==================WAVESURFER==================== */
  ngAfterViewInit(): void {
    this.isPlaying = true;
    this.waveform = WaveSurfer.create({
      container: this.waveformEl.nativeElement,
      /*  url: 'https://storage.googleapis.com/priming_text_wav/ABOVE.wav', */

      url: '../../assets/audio/PRIMING.wav',
      waveColor: '#d3d3d3',
      progressColor: 'rgb(0, 0, 0)',
      /*       waveColor: 'rgb(200, 0, 200)',
            progressColor: '#000000', */
      cursorColor: 'rgb(0, 0, 0)',
      cursorWidth: 5,
      minPxPerSec: 50,
      barWidth: 10,
      barRadius: 2,
      barGap: 2,
      autoScroll: true,
      autoCenter: true,
      interact: true,
      dragToSeek: true,
      mediaControls: true, //controles
      autoplay: true,
      fillParent: true,
    });

    this.waveform.on('audioprocess', () => {
      this.updateTextDisplayBasedOnAudio();
    });
  this.waveform.setVolume(0.1); // 10/100
  this.waveform.on('audioprocess', (currentTime) => this.updatePlaybackHint(currentTime));
  this.waveform.on('pause', () => this.hidePlaybackHint());
  this.waveform.on('finish', () => this.hidePlaybackHint());
  }

  events() {
    this.waveform.once('interaction', () => {
      this.waveform.play();
    })

    this.waveform.on('play', () => {
      this.isPlaying = true;
      this.openSnackBar("Play");
    })

    this.waveform.on('pause', () => {
      this.isPlaying = false;
      this.openSnackBar("Pause");
    })
  }

  /* ==================FUNCAO PARA PEGAR O ARRAY DE STRING==================== */
  getWordsArray(text: string): string[] {
    return text.split(' ');
  }

  /* ==================CARREGAR E DA PLAY AUDIO==================== */
  loadAndPlayAudio(audioUrl: string, text: string, onAudioFinish?: () => void): void {
    this.wordsArray = this.getWordsArray(text); // Divide o texto em palavras
    this.wordsDisplayed = 0; // Reseta o contador de palavras exibidas

    // Carrega o áudio a partir da URL fornecida
    this.waveform.load(audioUrl);

    // Quando o WaveSurfer estiver pronto, calcula a duração de cada palavra e inicia a reprodução
    this.waveform.on('ready', () => {
        const duration = this.waveform.getDuration(); // Obtém a duração total do áudio
        this.wordDuration = duration / this.wordsArray.length; // Calcula a duração de cada palavra
        this.waveform.play(); // Inicia a reprodução do áudio
        this.openSnackBar("Begin Play Wav");
    });

    // Adiciona um listener para o evento de término do áudio
    // Se um callback foi fornecido, ele será chamado ao terminar a reprodução
    this.waveform.on('finish', () => {
        if (onAudioFinish) {
            onAudioFinish(); // Chama o callback fornecido
        }
    });
}

/* ==================FULL TEXT==================== */
displayFullText(text: string): void {
  const displayElement = document.getElementById('textDisplay');
  if (displayElement) {
      displayElement.textContent = text;
      this.openSnackBar("Text: "+text);
  }
}

  /* ==================ATUALIZA O TEXTO BASEADO NO AUDIO==================== */
  updateTextDisplayBasedOnAudio(): void {
    // Verifica se a imagem já foi exibida. Se sim, não faz nada para evitar sobrepor a imagem.
    if (this.imageDisplayed) {
      return;
    }

    // Se a imagem ainda não foi exibida, continua com a lógica de atualizar o texto baseado no progresso do áudio.
    const currentTime = this.waveform.getCurrentTime(); // Obtém o tempo atual do áudio.
    const expectedWords = Math.floor(currentTime / this.wordDuration); // Calcula quantas palavras deveriam ter sido faladas até o momento.

    // Atualiza o displayElement para mostrar as palavras até o ponto esperado.
    const displayElement = document.getElementById('textDisplay');
    if (displayElement) {
      // Atualiza o texto no displayElement com as palavras correspondentes ao tempo atual do áudio.
      displayElement.textContent = this.wordsArray.slice(0, expectedWords).join(' ');
    }
  }

  /* ==================PLAY AUDIO TEXTO SICRONIZADO==================== */
  startAudioWithText(audioUrl: string, text: string) {
    this.loadAndPlayAudio(audioUrl, text);
    this.openSnackBar("Play Audio Sicrono: "+ text);
  }

  /* ==================PLAY AUDIO==================== */
  playAudio() {
    this.waveform.play();
    this.openSnackBar("waveform: Play");
  }

  /* ==================PAUSE AUDIO==================== */
  pauseAudio() {
    this.waveform.pause();
    this.openSnackBar("waveform: Pause");
  }

  /* ==================STOP AUDIO==================== */
  stopAudio() {
    this.waveform.stop();
    this.openSnackBar("waveform: Stop");
  }

  /* ==================CURRENT TIME==================== */
  getCurrentTime(): void {
    const currentTime = this.waveform.getCurrentTime();
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    this.currentTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    this.openSnackBar(this.currentTime);
  }

  /* ==================CALCULA PORCENTAGEM DE PROGRESSO==================== */
  calculateProgressPercentage(): void {
    const duration = this.waveform.getDuration();
    const currentTime = this.waveform.getCurrentTime();
    this.progressPercentage = (currentTime / duration) * 100;
    this.openSnackBar("Progress: " + this.progressPercentage);
  }

  /* ==================MOSTRO OS CONTROLES DO VOLUME==================== */
  toggleMediaControls(): void {
    this.mediaControlsEnabled = !this.mediaControlsEnabled;
    this.waveform.setOptions({ mediaControls: this.mediaControlsEnabled });
    this.mediaControlIcon = this.mediaControlsEnabled ? 'mat:sports_esports' : 'mat:cloud_download';
    this.openSnackBar("Progress: " + this.mediaControlIcon);
  }

  /* ==================VOZ ALEATORIA==================== */
  getRandomVoice(): string {
    const randomIndex = Math.floor(Math.random() * this.voices.length);
    this.openSnackBar("Voz: " + this.voices[randomIndex]);
    return this.voices[randomIndex];

  }

  /* ==================SNACK BAR==================== */
  openSnackBar(textDisplay: string) {
    const snackBarRef = this._snackBar.open(textDisplay, "Close", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 100,
    });

    snackBarRef.afterDismissed().subscribe(() => {
      //this.playSound('../../../../assets/audio/toc.wav');
      //this.openDialog(textDisplay);
    });
  }

   /* ==================ALARME==================== */
  playSound(soundUrl: string) {
    const audio = new Audio(soundUrl);
    audio.play().catch(error => console.error("Erro ao tocar o som:", error));
  }

  /* ==================AO SELECIONAR O TEXTO==================== */
  @HostListener('document:mouseup', ['$event'])
handleMouseUp(event: MouseEvent) {
  const selection = window.getSelection();
  if (this.isDialogOpen) {
    this.openSnackBar("Do not do anything if a dialog is open");
    return; // Do not do anything if a dialog is open
  }
  if (this.selectedChip && selection && selection.toString().trim() !== '') {
    this.selectedText = selection.toString();
    this.openSnackBar(`Added '${this.selectedChip}' as the selection type`);
    this.questionToOpenAI(this.selectedText, this.selectedChip);
  } else {
    this.openSnackBar("Please select an option (text, phrase, or word) before making a selection.");
  }
}


  /* ==================GERA AUDIO==================== */
   generateAudio(): void {
    // Verifica se já está gerando áudio para evitar duplicação
    if (this.isGeneratingAudio) return;

    // Indica que o processo de geração de áudio começou
    this.isGeneratingAudio = true;

    if (!this.chatMessage) {
      console.error('No chatMessage to generate audio from.');
      this.openSnackBar("No chatMessage to generate audio from.");
      // Restaura o estado para permitir novas gerações de áudio
      this.isGeneratingAudio = false;
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

    this.http.post(url, body, { headers, responseType: "blob" }).subscribe(
      response => {
        const audioBlob = new Blob([response], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Define as funções listener que serão usadas nos eventos 'ready' e 'finish'
        const onReady = () => {
          this.waveform.play();
        };

        const onFinish = () => {
          // Ações adicionais após a conclusão do áudio
          this.isGeneratingAudio = false;
          this.playSound('../../../../assets/audio/toc.wav');
          this.openDialog(this.chatMessage);
          this.openSnackBar(this.chatMessage);
          // Limpa os listeners após seu uso
          this.waveform.un('ready', onReady);
          this.waveform.un('finish', onFinish);
        };

        // Limpa quaisquer listeners anteriores (necessário se a função for chamada múltiplas vezes)
        this.waveform.un('ready', onReady);
        this.waveform.un('finish', onFinish);

        // Carrega o áudio no WaveSurfer e define os listeners
        this.waveform.load(audioUrl);
        this.waveform.on('ready', onReady);
        this.waveform.on('finish', onFinish);
      },
      error => {
        console.error("Error generating audio:", error);
        // Restaura o estado em caso de erro
        this.isGeneratingAudio = false;
      }
    );
  }

 /* ==================DISPLAY WORD BY WORD AND SHOW IMAGE==================== */
  displayTextWordByWord(text: string): number {
  const words = text.split(' ');
  const displayElement = document.getElementById('textDisplay');
  if (!displayElement) return 0; // Se o elemento não existir, retorna 0.

  let i = 0;
  displayElement.textContent = ''; // Inicializa o conteúdo do displayElement como vazio.

  const wordDisplayInterval = 900; // Intervalo em milissegundos
  const totalTime = words.length * wordDisplayInterval;

  const intervalId = setInterval(() => {
    if (i < words.length) {
      displayElement.innerText += words[i] + ' ';
      i++;
    } else {
      clearInterval(intervalId);
      // Após exibir todas as palavras, limpa o texto e insere a imagem.
      //displayElement.innerHTML = '<img src="/assets/img/logo/priming.png" alt="Priming Logo" style="max-width: 100%; height: auto;">';
      this.imageDisplayed = true; // Imagem exibida, atualize a flag
    }
  }, wordDisplayInterval);

  return totalTime;
}

  onVolumeChange(event: Event): void {
    // O evento é um Event genérico, então precisamos fazer um cast para acessar as propriedades específicas do slider
    const slider = event.target as HTMLInputElement;
    const newVolume = Number(slider.value); // Converte o valor para número, já que o valor de um input é sempre uma string
    if (!isNaN(newVolume)) { // Verifica se newVolume é um número válido
      const normalizedVolume = newVolume / 100; // Transforma o volume de 0-100 para 0-1
      this.waveform.setVolume(normalizedVolume); // Atualiza o volume do WaveSurfer
      this.openSnackBar("Update volume WaveSurfer."+normalizedVolume);
    }
  }

  onSpeedChange(event: Event): void {
    const slider = event.target as HTMLInputElement;
    const newSpeed = Number(slider.value) / 100; // Convertendo para uma escala de 0.5 a 2
    if (this.waveform && !isNaN(newSpeed)) {
      this.waveform.setPlaybackRate(newSpeed);
      this.openSnackBar("Speed Change."+newSpeed);
    }
  }

  updatePlaybackHint(currentTime: number) {
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const hintElement = document.getElementById('playback-hint');
    if (hintElement) {
        hintElement.textContent = `Tempo: ${formattedTime}`;
        hintElement.style.display = 'block';
    }
}

hidePlaybackHint() {
    const hintElement = document.getElementById('playback-hint');
    if (hintElement) {
        hintElement.style.display = 'none';
    }
}

analyzeText() {
  const doc = nlp(this.textNLP);
  // Análise básica
  this.pronouns = doc.pronouns().out('array');
  this.verbs = doc.verbs().out('array');
  this.nouns = doc.nouns().out('array');
  this.adjectives = doc.adjectives().out('array');
  this.adverbs = doc.adverbs().out('array');
  this.people = doc.people().out('array');
  this.places = doc.places().out('array');
  this.organizations = doc.organizations().out('array');
  //this.dates = doc.dates().out('array');
  //this.values = doc.values().out('array');
  // Funcionalidades adicionais
  //this.phrases = doc.phrases().out('array'); // Frases
  this.clauses = doc.clauses().out('array'); // Cláusulas
  //this.negations = doc.negations().out('array'); // Negativas
  this.questions = doc.questions().out('array'); // Perguntas
  //this.quotes = doc.quotes().out('array'); // Citações
  this.acronyms = doc.acronyms().out('array'); // Siglas
  this.emails = doc.emails().out('array'); // E-mails
  this.urls = doc.urls().out('array'); // URLs
  //this.emojis = doc.emojis().out('array'); // Emojis
  //this.mentions = doc.mentions().out('array'); // Menções (@usuario)
  //this.hashtags = doc.hashtags().out('array'); // Hashtags
  // Nota: Algumas dessas funcionalidades podem requerer plugins adicionais ou implementação específica.
}



//fim
}
