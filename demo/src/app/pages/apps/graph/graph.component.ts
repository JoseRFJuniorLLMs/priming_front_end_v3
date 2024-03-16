import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgxGraphModule } from '@swimlane/ngx-graph';

import { Edge, Node } from '@swimlane/ngx-graph';

@Component({
  selector: 'graph-component',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgxGraphModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent {
  nodes: Node[] = [];
  links: Edge[] = [];
  view: [number, number] = [800, 800];
  chartWidth = window.innerWidth;
  chartHeight = window.innerHeight;

}
