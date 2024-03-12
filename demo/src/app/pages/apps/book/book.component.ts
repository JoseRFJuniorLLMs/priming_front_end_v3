import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import ePub from 'epubjs';
import WaveSurfer from 'wavesurfer.js';
import gpt4 from '../../../../../gpt4.json';

// Interface para descrever a estrutura da resposta da API
interface ResponseData {
  choices?: { message: { content: string } }[];
}

@Component({

  selector: 'book',
  templateUrl: 'book.html',
  styleUrls: ['book.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatBadgeModule, MatCardModule, MatIconModule, MatSelectModule, FormsModule, MatTooltipModule]

})

export class BookComponent implements OnInit, AfterViewInit {

  /* ==================VIEWCHILD==================== */
  @ViewChild('waveform', { static: false }) waveformEl!: ElementRef<any>;

  /* ==================VARIAVEIS==================== */
  private waveform!: WaveSurfer;
  private isGeneratingAudio: boolean = false;
  public isPlaying: boolean = false;
  public currentPageText: string = '';

  //bookText: string = 'To Leon Werth I apologize to the children for dedicating this book to a grown-up. I have a good excuse: this grown-up is the best friend I have in the world. I have another good excuse: this grown-up can understand everything, even childrens books. I have a third good excuse: this grown-up lives in France where he is hungry and cold. He needs to be comforted. If all these excuses are not enough, I will then dedicate this book to the child who became that grown-up. All grown-ups were first children. (But few of them remember it.) So I correct my dedication:  To Leon Werth when he was a little boy.';

  book: any;
  rendition: any;
  selectedText: string = '';
  totalPages: number = 0;
  currentPage: number = 0;
  durationInSeconds = 130;

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  isLoading = false;
  chatMessage: any;
  errorText = '';
  imageDisplayed: boolean = false;
  wordDuration: number = 0;
  wordsArray: string[] = [];
  selectedLayoutOption = 'paginated';

  voices: string[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

  constructor(private http: HttpClient, private _snackBar: MatSnackBar,) {}

  ngOnInit() {
    this.initializeBook();

    setTimeout(() => {
      this.generateAudio(this.currentPageText);
    }, 1000); // Ajuste o tempo conforme necessário
  }

  //initializeBook
  async initializeBook() {
    try {
      this.book = ePub("../../assets/epub/TheLittlePrince.epub");
      await this.book.ready;
      this.rendition = this.book.renderTo("area-de-exibicao");

      await this.book.locations.generate(1024); // Gera localizações CFI para cada 1024 caracteres.

      this.totalPages = this.book.locations.length(); // Atualiza o total de páginas.

      // Exibe o conteúdo inicial e atualiza a página corrente.
      this.rendition.display().then(() => this.updateCurrentPage());

      // Adicionando um ouvinte para o evento 'relocated'.
      this.rendition.on('relocated', (location: any) => {
        this.updateCurrentPage();
      });
    } catch (error) {
      console.error("Error loading or rendering book: ", error);
    }
  }

  //updateCurrentPage
  updateCurrentPage() {
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation && currentLocation.start && currentLocation.start.cfi) {
        // Encontrar o índice do CFI atual nas localizações geradas
        const pageIndex = this.book.locations.locationFromCfi(currentLocation.start.cfi);
        this.currentPage = pageIndex + 1; // ePub.js pode usar índices base 0, então adicione 1 para ter base 1
        console.log(`Página Atual: ${this.currentPage} / ${this.totalPages}`);
        this.openSnackBar(`Página Atual: ${this.currentPage} / ${this.totalPages}`);
    } else {
        console.log("Não foi possível determinar a localização atual.");
    }
}



// Assumindo que esta função é chamada dentro do evento `relocated`
async getCurrentPageText(): Promise<string> {
  if (!this.rendition) {
    console.log("Rendition is not available.");
    return '';
  }

  const location = this.rendition.currentLocation();
  if (!location || !location.start || !location.start.cfi) {
    console.log("No location displayed or CFI is not available.");
    return '';
  }

  const range = await this.book.getRange(location.start.cfi);
  if (!range) {
    console.error("Error getting range:");
    return '';
  }

  return range.toString().trim();
}


//toggleLayout
  toggleLayout() {
    return () => {
      this.rendition.spread = (this.rendition.spread === "none") ? "always" : "none";
      this.rendition.display();
      this.openSnackBar(this.rendition.display());
    };
  }

  nextPage() {
    this.openSnackBar("nextPage"+this.rendition.next().length);
    this.rendition.next();
  }

  prevPage() {
    this.openSnackBar("prevPage"+this.rendition.prev().length);
    this.rendition.prev();
  }

  zoomIn() {
    this.openSnackBar("zoomIn");
    this.rendition.themes.fontSize('120%');
  }

  zoomOut() {
    this.openSnackBar("zoomOut");
    this.rendition.themes.fontSize('100%');
  }

  clearSelection() {
    this.selectedText = '';
  }

  copySelectedText() {
    this.openSnackBar("copySelectedText");
    navigator.clipboard.writeText(this.selectedText);
  }

/*questionTo OpenAI CONSOME API DA OPEN IA, recebe question, retorna messages */
async questionToOpenAI(question: string) {
    this.isLoading = true;
    try {
      const headers = new HttpHeaders({
        "Authorization": `Bearer ${gpt4.gptApiKey}`,
        "Content-Type": "application/json"
      });

      const response: ResponseData | undefined = await this.http.post<ResponseData>(gpt4.gptUrl, {
        messages: [{ role: 'user', content: "repeat this tex:" + question}],
        //messages: [{ role: 'user', content: "repeat this word:" + question }],
        temperature: 0.0,//0.5
        max_tokens: 1000,//4000
        model: "gpt-4",
      }, { headers }).toPromise();
      if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message) {
        this.openSnackBar("Resposta da API não contém dados válidos.");
        throw new Error("Resposta da API não contém dados válidos.");
      }

      this.chatMessage = response.choices[0].message.content;
      // Calcula o tempo necessário para exibir o texto
      const currentPageText = await this.getCurrentPageText();
      // Define um atraso para iniciar a reprodução do áudio, baseado no tempo de exibição do texto
      setTimeout(() => {
        // Função que carrega e reproduz o áudio
        this.generateAudio(currentPageText);
      });

      // Opção de exibir a mensagem em um Snackbar imediatamente,
      this.openSnackBar("questionTo OpenAI«««"+this.chatMessage);

    } catch (error) {
      // Tratamento de erros
      this.openSnackBar("Falha ao obter resposta da API: " + (error as Error).message);
      this.errorText = "Falha ao obter resposta da API: " + (error as Error).message;

    } finally {
      // Sempre será executado após a tentativa ou captura de bloco
      this.isLoading = false;
    }
  }

//fim IA

  //countPages
  async countPages(): Promise<number> {
    const numberOfPages = await this.book.locations.length;
    this.openSnackBar("countPages:"+numberOfPages);
    return numberOfPages;
  }

  //getCurrentPage
  getCurrentPage(): number {
    const currentPageIndex = this.book && this.book.navigation && this.book.navigation.indexOf(this.book.currentLocation);
    this.openSnackBar("countPages:"+ currentPageIndex + 1);
    return currentPageIndex + 1;
  }

  // Muda o tipo de visualizacao.
  changeRenderOption(option: string) {
    let flowValue: string | null = null;
    let width: string | null = null;
    let height: string | null = null;

    switch(option) {
      case 'default':
        this.openSnackBar("Default");
        // Possivelmente, manter padrões ou aplicar configurações específicas
        break;
      case 'continuous':
        this.openSnackBar("Continuous");
        flowValue = 'scrolled-doc'; // ou 'scrolled' dependendo da versão do epub.js
        break;
      case 'paginated':
        this.openSnackBar("Paginated");
        flowValue = 'paginated';
        width = '900px';
        height = '600px';
        break;
      case 'auto':
        this.openSnackBar("Auto");
        // Definir lógica para 'auto', se aplicável
        break;
    }

    if (flowValue) {
      this.openSnackBar("flowValue");
      this.rendition.flow(flowValue);
    }

    if (width && height) {
      this.openSnackBar("height");
      this.rendition.resize(width, height);
    }

    // Re-renderizar o conteúdo no ponto atual
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation) {
      this.openSnackBar(currentLocation.stringify(currentLocation(currentLocation)));
      this.rendition.display(currentLocation.start.cfi);
    }
  }

  /* ==================SNACK BAR==================== */
  openSnackBar(textDisplay: string) {
    const snackBarRef = this._snackBar.open(textDisplay, "Close", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 100,
    });
  }


  /* ==================GERA AUDIO==================== */
  generateAudio(text: string): void {
    // Verifica se já está gerando áudio para evitar duplicação
    if (this.isGeneratingAudio) return;

    this.isGeneratingAudio = true;

    // Verifica se o texto foi fornecido
    if (!text) {
      console.error('No text provided to generate audio from.');
      this.openSnackBar("No text provided to generate audio from.");
      this.isGeneratingAudio = false;
      return;
    }

    // Define a chave API e a URL da API
    const openAIKey = gpt4.gptApiKey;
    const url = "https://api.openai.com/v1/audio/speech";

    // Configura o corpo da requisição
    const body = JSON.stringify({
      model: "tts-1-hd",
      voice: this.getRandomVoice(),
      input: text
      //"model": "tts-1-hd",//tts-1-hd, tts-1
      //"voice": "alloy",//voices: string[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      //"input": this.bookText
    });

    // Configura os cabeçalhos da requisição
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${openAIKey}`,
      "Content-Type": "application/json"
    });

    // Faz a requisição POST para gerar o áudio
    this.http.post(url, body, { headers, responseType: "blob" }).subscribe(
      response => {
        // Cria uma URL a partir do Blob de áudio recebido
        const audioBlob = new Blob([response], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        this.openSnackBar("Faz a requisição POST para gerar o áudio");
        // Carrega o áudio no WaveSurfer e configura eventos para reprodução
        this.waveform.load(audioUrl);
        this.waveform.on('ready', () => {
          this.waveform.play();
          this.openSnackBar(" this.waveform.play();");
        });

        this.waveform.on('finish', () => {
          // Restaura o estado ao terminar de reproduzir o áudio
          this.isGeneratingAudio = false;
        });
      },
      error => {
        // Trata erros na requisição
        console.error("Error generating audio:", error);
        this.openSnackBar("Error generating audio");
        this.isGeneratingAudio = false;
      }
    );
  }

  /* ==================WAVESURFER==================== */
  ngAfterViewInit(): void {
    this.isPlaying = true;
    this.waveform = WaveSurfer.create({
      container: this.waveformEl.nativeElement,
      /*  url: 'https://storage.googleapis.com/priming_text_wav/ABOVE.wav', */

     // url: '../../assets/audio/ABOVE.wav',
      waveColor: '#d3d3d3',
      progressColor: 'rgb(0, 0, 0)',
      /*       waveColor: 'rgb(200, 0, 200)',
            progressColor: '#000000', */
      cursorColor: 'rgb(0, 0, 0)',
      cursorWidth: 1,
      minPxPerSec: 10,
      barWidth: 1,
      barRadius: 1,
      barGap: 1,
      autoScroll: true,
      autoCenter: true,
      interact: true,
      dragToSeek: true,
      mediaControls: true, //controles
      autoplay: true,
      fillParent: true,
      height: 50,
    });

    this.waveform.on('audioprocess', () => {

    });
  this.waveform.setVolume(0.1); // 10/100
  this.waveform.on('audioprocess', (currentTime) => this.updatePlaybackHint(currentTime));
  this.waveform.on('pause', () => this.hidePlaybackHint());
  this.waveform.on('finish', () => this.hidePlaybackHint());

  setTimeout(() => {
    this.generateAudio(this.currentPageText);
  }, 1000);

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

  /* ==================UPDATE CURRENT TIME==================== */
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

   /* ==================UPDATE PLAY BACK HINT==================== */
  hidePlaybackHint() {
  const hintElement = document.getElementById('playback-hint');
  if (hintElement) {
      hintElement.style.display = 'none';
  }
}

  /* ==================VOZ ALEATORIA==================== */
  getRandomVoice(): string {
    const randomIndex = Math.floor(Math.random() * this.voices.length);
    this.openSnackBar("Voz: " + this.voices[randomIndex]);
    return this.voices[randomIndex];

  }

/* ==================AO SELECIONAR O TEXTO==================== */

}//fim
