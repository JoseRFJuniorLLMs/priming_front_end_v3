import {
  MatBottomSheetModule,
  MatBottomSheetRef
} from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';

import { DialogModule } from '@angular/cdk/dialog';
import {
  CdkDrag,
  CdkDropList
} from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';

import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { take } from 'rxjs/operators';

import ePub from 'epubjs';
import hljs from 'highlight.js';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { CommonModule } from '@angular/common';
import screenfull from 'screenfull';

@Component({
  selector: 'vex-share-bottom-book',
  templateUrl: './share-bottom-book.component.html',
  styleUrls: ['./share-bottom-book.component.scss'],
  standalone: true,
  imports: [
    MatListModule,
    RouterLink,
    MatIconModule,
    MatBottomSheetModule,
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    ReactiveFormsModule,
    PdfViewerModule,
    MatButtonModule,
    CdkDrag,
    CdkDropList,
    DialogModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatTooltipModule,
    TextFieldModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    CommonModule
    ]
})
export class ShareBottomBookComponent implements OnInit {
  book: any;
  rendition: any;
  selectedText: string = '';
  highlighted: boolean = false;

  title = 'gpt4-example';
  response: any;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ShareBottomBookComponent>,
    private _ngZone: NgZone,

  ) {}

  @ViewChild('autosize') autosize!: CdkTextareaAutosize;


  close() {
    this._bottomSheetRef.dismiss();
  }


  async ngOnInit() {
    try {
      screenfull.request();
      this.book = ePub("../../assets/file.epub");
      await this.book.ready;
      this.rendition = this.book.renderTo("area-de-exibicao");
      this.rendition.display();

      // Lógica para destacar o texto selecionado
      this.rendition.on('selection', (selection: any) => {
        console.log('Selection event fired @@@@@@');
        this.selectedText = selection.text;
        this.highlighted = true;

        const elements = document.querySelectorAll('.ePubSelection');
        Array.from(elements).forEach(element => {
          hljs.highlightElement(element as HTMLElement);
        });
      });
    } catch (error) {
      console.error("Error loading or rendering book: ", error);
    }
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

  // Destaca quando você clica fora da seleção
  clearSelection() {
    this.selectedText = '';
    this.highlighted = false;
  }

  // Exemplo de ação ao copiar texto
  copySelectedText() {
    navigator.clipboard.writeText(this.selectedText);
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }
}
