import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    attribution: new FormControl(true),
    wideImages: new FormControl<'shrink'|'crop'>('crop'),
    images: new FormArray([
      new FormGroup({
        url: new FormControl(""),
        caption: new FormControl(""),
        altText: new FormControl(""),
      }),
    ]),
  });

  @ViewChild('contentInner') private wrapper!: ElementRef<HTMLElement>;

  constructor(private _formBuilder: FormBuilder, private _snackBar: MatSnackBar) { }

  get gridStyle() {
    let fontMultiplier;
    switch (this.form.value.imagesPerRow) {
      case 1: fontMultiplier = 1; break;
      case 2: fontMultiplier = 0.54; break;
      case 3: fontMultiplier = 0.43; break;
      case 4: fontMultiplier = 0.30; break;
      default: fontMultiplier = 0.21;
    }
    return `
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
      align-items: stretch;
      object-fit: 
      font-size: min(${140 * fontMultiplier}%, ${3.73 * fontMultiplier}vw);
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

  get linkStyle() {
    return `
      width: calc(100% / ${this.form.value.imagesPerRow} - 4px);
      margin: 2px 2px;
      display: block;
      text-decoration: none;
      position: relative;
      object-fit: 
    `;
  }

  get imageStyle() {
    return `
      width: 100%;
      height: 100%;
      margin: 0;
      object-fit: ${this.form.value.wideImages === 'crop' ? 'cover' : 'contain'};
    `;
  }

  get validImages(): Array<Image> {
    return this.form.value.images!.filter(image => image.url);
  }

  captionText(image: Image): string | undefined {
    return image?.caption?.replace('\n', '<br>');
  }

  addImage(): void {
    this.form.controls.images.push(new FormGroup({
      url: new FormControl(""),
      caption: new FormControl(""),
      altText: new FormControl(""),
    }));
  }

  removeImage(i: number): void {
    this.form.controls.images.removeAt(i);
  }

  async copyHtml(): Promise<void> {
    const html = this.wrapper.nativeElement.innerHTML
      // Angular adds a bunch of comments that we don't need.
      .replace(/<!--(.|\n)*?-->/mg, '')
      // Magic Angular attributes.
      .replace(/ _ng[a-z0-9-]+=""/g, '')
      // Angular-injected class.
      .replace(/ class="ng-star-inserted"/g, '');
    await navigator.clipboard.writeText(html);
    this._snackBar.open("HTML copied!", undefined, { duration: 1000 });
  }
}
