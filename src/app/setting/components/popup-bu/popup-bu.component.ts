import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-bu',
  templateUrl: './popup-bu.component.html',
  styleUrls: ['./popup-bu.component.scss']
})
export class PopupBuComponent {
  readonly dialogRef = inject(MatDialogRef<PopupBuComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  constructor(){
    console.log(this.data);
    
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
