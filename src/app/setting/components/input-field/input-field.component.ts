import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss']
})
export class InputFieldComponent {
  @Input() label: any;
  @Input() value: any;
  @Output() valueChange = new EventEmitter<string>();
  @Input() inputType?: string; // Add inputType property
  form?: FormGroup;
  valueInput = new FormControl('');
  constructor(private fb: FormBuilder) {
    this.initForm();
  }
  initForm() {
    this.form = this.fb.group({
      inputField: [this.value, Validators.required],

    });
  }
  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    console.log('Input Element:', inputElement);
    console.log('Input Value:', inputElement.value);
    this.valueChange.emit(inputElement.value);
  }
}
