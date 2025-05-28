import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-secondary-btn',
  templateUrl: './secondary-btn.component.html',
  styleUrls: ['./secondary-btn.component.scss']
})
export class SecondaryBtnComponent {
  @Input() content: any = '';
  @Output() onClick = new EventEmitter<any>();

  
  onClickButton(event: any) {
    this.onClick.emit(event);
  }
}
