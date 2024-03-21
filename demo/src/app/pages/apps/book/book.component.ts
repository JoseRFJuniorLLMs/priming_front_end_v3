import { CommonModule } from '@angular/common';
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

interface Ebook {
  title: string;
  author: string;
  path: string;
  cover: string;
  pageCount: number;
}


@Component({

  selector: 'book',
  templateUrl: 'book.html',
  styleUrls: ['book.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatBadgeModule, MatCardModule,
    MatIconModule, MatSelectModule,
    FormsModule, MatTooltipModule, CommonModule]

})

export class BookComponent implements OnInit, AfterViewInit {

  ebooks: Ebook[] = [];

  /* ==================VIEWCHILD==================== */
  @ViewChild('waveform', { static: false }) waveformEl!: ElementRef<any>;

  /* ==================VARIAVEIS==================== */
  private waveform!: WaveSurfer;
  private isGeneratingAudio: boolean = false;
  public isPlaying: boolean = false;
  public currentPageText: string = '';

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
  files: any[] = [];

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadEbooks();
    window.addEventListener('resize', this.resizeListener);
/*     window.addEventListener('resize', () => {
      this.rendition.resize(window.innerWidth, window.innerHeight);
    }); */

    setTimeout(() => {
      this.generateAudio(this.currentPageText);
    }, 1000);

  }

  ngOnDestroy(): void {
    // Limpando o listener de eventos ao destruir o componente
    window.removeEventListener('resize', this.resizeListener);
  }

  private resizeListener = (): void => {
    if (this.rendition) {
      this.rendition.resize(window.innerWidth, window.innerHeight);
    }
  };

  loadEbooks() {
    this.http.get<Ebook[]>('../../assets/epub/ebooks.json').subscribe(data => {
      this.ebooks = data;
    });
  }

/*   async initializeBook() {
    try {
      this.book = ePub("../../assets/epub/Alice.epub");
      await this.book.ready;
      this.rendition = this.book.renderTo("area-de-exibicao", {
        width: window.innerWidth,
        height: window.innerHeight,
        spread: 'always' // Pode ajustar conforme a necessidade
      });
      await this.book.locations.generate(1024);
      this.totalPages = this.book.locations.length();
      this.rendition.display().then(() => {
        this.updateCurrentPageTextAndLocation();
      });
      this.rendition.on('relocated', (location: any) => {
        this.updateCurrentPageTextAndLocation();
      });
    } catch (error) {
      console.error("Error loading or rendering book: ", error);
    }
  }
 */

  async initializeBook(filePath: string) {
    try {
      this.book = ePub(filePath);
      await this.book.ready;
      this.rendition = this.book.renderTo("area-de-exibicao", {
        width: window.innerWidth,
        height: window.innerHeight,
        spread: 'always'
      });
      await this.book.locations.generate(1024);
      this.totalPages = this.book.locations.length();
      this.rendition.display().then(() => {
        this.updateCurrentPageTextAndLocation();
      });
      this.rendition.on('relocated', (location: any) => {
        this.updateCurrentPageTextAndLocation();
      });
    } catch (error) {
      console.error("Error loading or rendering book: ", error);
    }
  }


  async selectEbook(ebook: Ebook) {
    console.log("Caminho do eBook selecionado:", ebook.path);
    this.initializeBook(ebook.path);
    try {
      // Inicializa o ePub com o caminho do arquivo do ebook selecionado
      this.book = ePub(ebook.path);

      // Aguarda até que o livro esteja pronto para ser processado
      await this.book.ready;

      // Configura o local de renderização para o livro e define opções como largura, altura e spread
      this.rendition = this.book.renderTo("area-de-exibicao", {
        width: window.innerWidth,
        height: window.innerHeight,
        spread: 'always'
      });

      // Gera as localizações do livro (necessário para navegação, por exemplo)
      await this.book.locations.generate(1024);

      // Atualiza o total de páginas com base nas localizações geradas
      this.totalPages = this.book.locations.length();

      // Reinicia a contagem da página atual para o novo livro
      this.currentPage = 1;

      // Exibe o livro começando do início
      this.rendition.display().then(() => {
        // Chamada para atualizar texto e localização da página atual após o livro ser exibido
        this.updateCurrentPageTextAndLocation();
      });

      // Adiciona um ouvinte para atualizações de localização (quando o usuário navega pelo livro)
      this.rendition.on('relocated', (location: any) => {
        // Chamada para atualizar texto e localização da página atual quando há navegação
        this.updateCurrentPageTextAndLocation();
      });
    } catch (error) {
      console.error("Erro ao carregar ou renderizar o livro: ", error);
    }
  }

  //updateCurrentPage
  updateCurrentPage() {
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation && currentLocation.start && currentLocation.start.cfi) {
      const pageIndex = this.book.locations.locationFromCfi(currentLocation.start.cfi);
      this.currentPage = pageIndex + 1; // ePub.js pode usar índices base 0, então adicione 1 para ter base 1
      console.log(`Current page: ${this.currentPage} / ${this.totalPages}`);
      this.openSnackBar(`Current page: ${this.currentPage} / ${this.totalPages}`);
    } else {
      console.log("Não foi possível determinar a localização atual.");
    }
  }

   //updateCurrentPage 2
  // Assumindo que você tenha acesso ao iframe ou ao conteúdo do DOM que o epubjs gera
public async captureCurrentPageText() {
  let currentPageText = '';
  // Tente obter o iframe ou o elemento que contém o texto da página atual
  const contentDocument = document.querySelector('iframe')?.contentDocument || document;

  // Captura todo o texto dentro do elemento identificado
  currentPageText = contentDocument.body?.innerText || '';

  //console.log('Texto da página atual:', currentPageText);
  return currentPageText.trim();
}


// getCurrentPageText
public async getCurrentPageText(): Promise<void> {
  if (!this.rendition) {
    console.error('A renderização (rendition) não está disponível.');
    this.openSnackBar('A renderização (rendition) não está disponível.');
    return;
  }

  try {
    // Tentativa de focar apenas no conteúdo visível
    let visibleContentText = '';
    const visibleContents = this.rendition.getContents(); // Assumindo que isso retorna todos os conteúdos carregados

    // Idealmente, filtrar os conteúdos visíveis baseando-se em algum critério ou estado (isso pode precisar de ajuste)
    visibleContents.forEach((content: { document: any; contentDocument: any; }) => {
      // Acessando diretamente o DOM do conteúdo
      const doc = content.document || content.contentDocument;
      if (doc && doc.body) {
        // Aqui, você poderia tentar aplicar alguma lógica para determinar se o conteúdo é realmente visível
        // Esta é uma simplificação; a lógica real pode precisar ser mais complexa
        visibleContentText += doc.body.innerText || '';
      }
    });

    this.currentPageText = visibleContentText.trim();
    //console.log('Texto da página atual:', this.currentPageText);
  } catch (error) {
    console.error('Erro ao tentar obter o texto da página atual:', error);
  }
}

  // updateAndGenerateAudio
  async updateAndGenerateAudio() {
    // Chamada para atualizar o texto da página atual diretamente.
    await this.getCurrentPageText();

    // Verifica a propriedade 'currentPageText' diretamente após a atualização.
    //console.log('Texto atualizado para geração de áudio:', this.currentPageText);

    if (this.currentPageText) {
      this.generateAudio(this.currentPageText);
    } else {
      console.log('Nenhum texto disponível para gerar áudio.');
    }
  }

  //toggleLayout
  toggleLayout() {
    return () => {
      this.rendition.spread = (this.rendition.spread === "none") ? "always" : "none";
      this.rendition.display();
    };
  }

  nextPage() {
    this.rendition.next();
  }

  prevPage() {
    this.rendition.prev();
  }

  zoomIn() {
    this.rendition.themes.fontSize('120%');
  }

  zoomOut() {
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
  /* async questionToOpenAI(question: string) {
    this.isLoading = true;
    try {
      const headers = new HttpHeaders({
        "Authorization": `Bearer ${gpt4.gptApiKey}`,
        "Content-Type": "application/json"
      });

      const response: ResponseData | undefined = await this.http.post<ResponseData>(gpt4.gptUrl, {
        messages: [{ role: 'user', content: "repeat this tex:" + question }],
        //messages: [{ role: 'user', content: "repeat this word:" + question }],
        temperature: 0.0,//0.5
        max_tokens: 100,//4000
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
      this.openSnackBar("questionTo OpenAI«««" + this.chatMessage);

    } catch (error) {
      // Tratamento de erros
      this.openSnackBar("Falha ao obter resposta da API: " + (error as Error).message);
      this.errorText = "Falha ao obter resposta da API: " + (error as Error).message;

    } finally {
      // Sempre será executado após a tentativa ou captura de bloco
      this.isLoading = false;
    }
  }
 */
  //fim IA

  //countPages
  async countPages(): Promise<number> {
    const numberOfPages = await this.book.locations.length;
    this.openSnackBar("countPages:" + numberOfPages);
    return numberOfPages;
  }

  //getCurrentPage
  getCurrentPage(): number {
    const currentPageIndex = this.book && this.book.navigation && this.book.navigation.indexOf(this.book.currentLocation);
    this.openSnackBar("countPages:" + currentPageIndex + 1);
    return currentPageIndex + 1;
  }

  // Muda o tipo de visualizacao.
  changeRenderOption(option: string) {
    let flowValue: string | null = null;
    let width: string | null = null;
    let height: string | null = null;

    switch (option) {
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

  /* ==================updateCurrentPageTextAndLocation==================== */
  async updateCurrentPageTextAndLocation() {
    // Simplesmente chama getCurrentPageText para atualizar o texto da página atual.
    await this.getCurrentPageText();
    console.log("Texto da página atual:", this.currentPageText);

    // Atualiza a localização atual (número da página e total de páginas)
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation && currentLocation.start && currentLocation.start.cfi) {
      // Encontrar o índice do CFI atual nas localizações geradas
      const pageIndex = this.book.locations.locationFromCfi(currentLocation.start.cfi);
      if (pageIndex !== undefined) {
        this.currentPage = pageIndex + 1; // ePub.js pode usar índices base 0, então adicione 1 para ter base 1
        console.log(`Página atual: ${this.currentPage} / ${this.totalPages}`);
        this.openSnackBar(`Página atual: ${this.currentPage} / ${this.totalPages}`);
      } else {
        console.log("CFI atual não encontrado nas localizações.");
      }
    } else {
      console.log("Não foi possível determinar a localização atual.");
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
      mediaControls: true, //controles
      height: 50,
      waveColor: '#d3d3d3',
      progressColor: 'rgb(0, 0, 0)',
      cursorColor: 'rgb(0, 0, 0)',
      cursorWidth: 6,
      barGap: 3,
      barWidth: 2,
      barHeight: 3,
      barRadius: 10,
      autoScroll: true,
      autoCenter: true,
      interact: true,
      dragToSeek: true,
      fillParent: true,
      autoplay: false,
      minPxPerSec: 50
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


}//fim
