import {Component} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';

/** @title Form field appearance variants */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  imagesPerRowControl = new FormControl(2, Validators.min(1));
  urlControl = new FormControl("");
  captionControl = new FormControl("");
  altTextControl = new FormControl("");
  form = this._formBuilder.group({
    imagesPerRow: this.imagesPerRowControl,
    url: this.urlControl,
    caption: this.captionControl,
    altText: this.altTextControl,
  });

  constructor(private _formBuilder: FormBuilder) {}
}
