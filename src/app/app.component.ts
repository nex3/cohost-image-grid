import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

type Image = Partial<{ url: string | null, caption: string | null, altText: string | null }>;

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

  get gridStyle() {
    const fontSize = 100 - 15 * this.form.value.imagesPerRow!;
    return `
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
      font-size: ${fontSize}%;
      line-height: 100%;
      text-shadow:
        0px 0px 2px black,
        0px 0px 2px black,
        0px 0px 2px black,
        0px 0px 2px black,
        0px 0px 2px black,
        0px 0px 2px black;
    `;
  }

  get imageStyle() {
    return `
      width: calc(100% / ${this.form.value.imagesPerRow} - 4px);
      margin: 0 2px;
      display: block;
      text-decoration: none;
      position: relative;
    `;
  }

  get validImages(): Array<Image> {
    return this.form.value.images!.filter(image => image.url);
  }

  captionText(image: Image): string|undefined {
    return image?.caption?.replace('\n', '<br>');
  }

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
