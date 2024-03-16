import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Contact } from '../../interfaces/contact.interface';

@Component({
  selector: 'vex-contacts-card',
  templateUrl: './contacts-card.component.html',
  styleUrls: ['./contacts-card.component.scss'],
  standalone: true,
  imports: [MatRippleModule, MatIconModule, MatButtonModule, NgIf]
})
export class ContactsCardComponent implements OnInit {
  @Input({ required: true }) contact!: Contact;
  @Output() openContact = new EventEmitter<Contact['id']>();
  @Output() toggleStar = new EventEmitter<Contact['id']>();

  constructor() {}

  ngOnInit() {}

  emitToggleStar(event: MouseEvent, contactId: Contact['id']) {
    event.stopPropagation();
    this.toggleStar.emit(contactId);
  }
}
