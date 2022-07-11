import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

/** @title Form field appearance variants */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  form = this._formBuilder.group({
    imagesPerRow: new FormControl(2, Validators.min(1)),
    images: new FormArray([
      new FormGroup({
        url: new FormControl(""),
        caption: new FormControl(""),
        altText: new FormControl(""),
      }),
    ]),
  });

  constructor(private _formBuilder: FormBuilder) { }

  addImage() {
    this.form.controls.images.push(new FormGroup({
      url: new FormControl(""),
      caption: new FormControl(""),
      altText: new FormControl(""),
    }));
  }

  removeImage(i: number) {
    this.form.controls.images.removeAt(i);
  }
}
