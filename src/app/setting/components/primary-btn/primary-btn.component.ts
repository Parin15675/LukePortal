import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-primary-btn',
  templateUrl: './primary-btn.component.html',
  styleUrls: ['./primary-btn.component.scss']
})

export class PrimaryBtnComponent {
  @Input() content: any = '';
  @Output() onClick = new EventEmitter<any>();

  
  onClickButton(event: any) {
    this.onClick.emit(event);
  }
}
