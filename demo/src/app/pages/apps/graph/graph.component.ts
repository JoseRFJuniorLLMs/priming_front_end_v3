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
  nodes: Node[] = [
    { id: 'prime1', label: 'Doctor' }, { id: 'target1', label: 'Hospital' },
    { id: 'prime2', label: 'Ocean' }, { id: 'target2', label: 'Fish' },
    { id: 'prime3', label: 'Book' }, { id: 'target3', label: 'Reading' },
    { id: 'prime4', label: 'Cold' }, { id: 'target4', label: 'Winter' },
    { id: 'prime5', label: 'Hot' }, { id: 'target5', label: 'Summer' },
    { id: 'prime6', label: 'Rain' }, { id: 'target6', label: 'Umbrella' },
    { id: 'prime7', label: 'Music' }, { id: 'target7', label: 'Dance' },
    { id: 'prime8', label: 'Sleep' }, { id: 'target8', label: 'Dream' },
    { id: 'prime9', label: 'Flower' }, { id: 'target9', label: 'Bee' },
    { id: 'prime10', label: 'Coffee' }, { id: 'target10', label: 'Morning' },
    { id: 'prime11', label: 'Moon' }, { id: 'target11', label: 'Night' },
    { id: 'prime12', label: 'Sun' }, { id: 'target12', label: 'Day' },
    { id: 'prime13', label: 'Star' }, { id: 'target13', label: 'Sky' },
    { id: 'prime14', label: 'Tree' }, { id: 'target14', label: 'Forest' },
    { id: 'prime15', label: 'Bird' }, { id: 'target15', label: 'Fly' },
  ];
  links: Edge[] = [
    { id: 'link1', source: 'prime1', target: 'target1', label: 'related to' },
    { id: 'link2', source: 'prime2', target: 'target2', label: 'related to' },
    { id: 'link3', source: 'prime3', target: 'target3', label: 'related to' },
    { id: 'link4', source: 'prime4', target: 'target4', label: 'related to' },
    { id: 'link5', source: 'prime5', target: 'target5', label: 'related to' },
    { id: 'link6', source: 'prime6', target: 'target6', label: 'related to' },
    { id: 'link7', source: 'prime7', target: 'target7', label: 'related to' },
    { id: 'link8', source: 'prime8', target: 'target8', label: 'related to' },
    { id: 'link9', source: 'prime9', target: 'target9', label: 'related to' },
    { id: 'link10', source: 'prime10', target: 'target10', label: 'related to' },
    { id: 'link11', source: 'prime11', target: 'target11', label: 'related to' },
    { id: 'link12', source: 'prime12', target: 'target12', label: 'related to' },
    { id: 'link13', source: 'prime13', target: 'target13', label: 'related to' },
    { id: 'link14', source: 'prime14', target: 'target14', label: 'related to' },
    { id: 'link15', source: 'prime15', target: 'target15', label: 'related to' },
  ];

  // Define o tamanho da visualização do gráfico
  view: [number, number] = [800, 600];
}
