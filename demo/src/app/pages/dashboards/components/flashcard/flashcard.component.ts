import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { animate, style, transition, trigger } from '@angular/animations';
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

  ],
  animations: [
    trigger('fade', [
      transition('void => *', [ // void => * é usado para animações de entrada
        style({ opacity: 0 }), // começa com opacidade 0
        animate(1000, style({ opacity: 1 })) // anima até opacidade 1 em 1 segundo
      ]),
      transition('* => void', [ // * => void é usado para animações de saída
        animate(1000, style({ opacity: 0 })) // anima até opacidade 0 em 1 segundo
      ])
    ])
  ]
})

export class FlashcardComponent implements AfterViewInit {

  words: string[] = [
    'Red', 'Blue', 'Yellow', 'Green', 'Black', 'White', 'Gray', 'Orange', 'Purple', 'Pink', 'Brown', 'Cyan', 'Magenta',
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
    'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty',
    'one hundred', 'two hundred', 'three hundred', 'four hundred', 'five hundred', 'six hundred', 'seven hundred', 'eight hundred',
    'nine hundred', 'thousand', 'million', 'billion', 'trillion',
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
    'Sofa', 'Table', 'Chair', 'Bed', 'Lamp', 'Desk', 'Dresser', 'Bookshelf', 'Coffee Table', 'Nightstand', 'Mirror', 'Rug', 'Television', 'Clock',
    'Pillow', 'Blanket', 'Fridge', 'Oven', 'Microwave', 'Toaster', 'Blender', 'Washing Machine', 'Dryer', 'Dishwasher', 'Vacuum Cleaner', 'Iron', 'Fan', 'Heater', 'Curtains', 'Trash Can',
    'Passport', 'Ticket', 'Suitcase', 'Backpack', 'Map', 'Hotel', 'Flight', 'Airport', 'Destination', 'Itinerary', 'Tourist', 'Guidebook', 'Reservation', 'Currency', 'Visa',
    'Sunglasses', 'Camera', 'Beach', 'Mountain', 'City', 'Country', 'Adventure', 'Explore', 'Souvenir', 'Transportation', 'Schedule', 'Landmark', 'Culture', 'Cuisine', 'Traveler',
    'Mom', 'Dad', 'Yes', 'No', 'Please', 'Thank you', 'Sorry', 'Hello', 'Goodbye', 'Friend', 'Play', 'Toy', 'Game', 'Ball',
    'Dog', 'Cat', 'School', 'Book', 'Read', 'Write', 'Color', 'Draw', 'Paint', 'Sing', 'Dance', 'Jump', 'Run',
    'Candy', 'Cookie', 'Cake', 'Juice', 'Milk', 'Water', 'Bed', 'Sleep', 'Bath', 'Brush', 'Happy', 'Sad', 'Scared',
    'Love', 'Hug', 'Kiss', 'Birthday', 'Party', 'Park', 'Bike', 'Slide', 'Swing', 'Swim', 'Fish', 'Bear', 'Doll', 'Car',
    'Truck', 'Bus', 'Plane', 'Train', 'Sun', 'Moon', 'Star', 'Sky', 'Cloud', 'Rain', 'Snow', 'Tree', 'Flower', 'Grass',
    'Rock', 'Sand', 'Sea', 'River', 'Mountain', 'Forest', 'Animal', 'Bird', 'Chicken', 'Duck', 'Horse', 'Cow', 'Pig',
    'Sheep', 'Elephant', 'Lion', 'Tiger', 'Monkey', 'Zoo', 'Playground', 'Slide', 'Swing', 'Climber', 'Ball', 'Bat',
    'Soccer', 'Football', 'Basketball', 'Baseball', 'Tennis', 'Golf', 'Ice cream', 'Chocolate', 'Pizza', 'Burger', 'Sandwich',
    'Salad', 'Fruit', 'Apple', 'Banana', 'Orange', 'Strawberry', 'Cherry', 'Grape', 'Lemon', 'Melon', 'Peach', 'Pear',
    'Pineapple', 'Tomato', 'Vegetable', 'Carrot', 'Potato', 'Onion', 'Lettuce', 'Cucumber', 'Peas', 'Corn', 'Bean', 'Rice',
    'Pasta', 'Bread', 'Cheese', 'Egg', 'Meat', 'Chicken', 'Fish', 'Juice', 'Water', 'Milk', 'Tea', 'Coffee', 'Soda', 'Story',
    'Book', 'Movie', 'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he',
    'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
    'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
    'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also'
  ];

  currentWordIndex = 0;

  @ViewChild('waveformContainer') waveformContainer!: ElementRef;

  private wavesurfer!: WaveSurfer;
  isPlaying = false;

  errorText = "";
  isLoading = false;

  autoChangeInterval: any;
  autoChangeEnabled: boolean = false;

  rotateWord = false;


  ngAfterViewInit(): void {
    this.initWaveSurfer();
  }

  private initWaveSurfer(): void {
    this.wavesurfer = WaveSurfer.create({
      container: this.waveformContainer.nativeElement,
      waveColor: '#ff4e00',
      progressColor: '#e60a6d',
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
      //this.textToSpeechService.speak(this.chatMessage); // Legenda do Chrome
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

    // Método para mostrar a próxima palavra no flashcard
    showNextWord(): void {
      this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
    }

    toggleAutoChange(): void {
      this.autoChangeEnabled = !this.autoChangeEnabled;
      if (this.autoChangeEnabled) {
        // Iniciar a mudança automática das palavras a cada 3 segundos
        this.autoChangeInterval = setInterval(() => {
          this.showNextWord();
        }, 3000);
      } else {
        // Parar a mudança automática das palavras
        clearInterval(this.autoChangeInterval);
      }
    }


}// fim
