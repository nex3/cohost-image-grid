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
    let fontSize;
    switch (this.form.value.imagesPerRow) {
      case 1: fontSize = 140; break;
      case 2: fontSize = 75; break;
      case 3: fontSize = 60; break;
      case 4: fontSize = 42; break;
      default: fontSize = 30;
    }
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
      .replace(/ _ng[a-z0-9-]+=""/g, '');
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([html], { type: "text/plain" }),
      })
    ]);

    this._snackBar.open("HTML copied!", undefined, { duration: 1000 });
  }
}
