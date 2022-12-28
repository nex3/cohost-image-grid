import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { HostListener } from '@angular/core';

type Image = Partial<{ url: string | null, caption: string | null, altText: string | null }>;

/** @title Form field appearance variants */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private changedSinceCopy = false;

  form = this._formBuilder.group({
    imagesPerRow: new FormControl(2, Validators.min(1)),
    attribution: new FormControl(true),
    fontSize: new FormControl(3, [Validators.min(1), Validators.max(5)]),
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

  constructor(private _formBuilder: FormBuilder, private _snackBar: MatSnackBar) {
    this.form.valueChanges.subscribe(() => this.changedSinceCopy = true);
  }

  private fontScale(value: number): number {
    return 3/16 * value ** 2 - 1/2 * value + 13/16;
  }

  get gridStyle() {
    let fontMultiplier;
    switch (this.form.value.imagesPerRow) {
      case 1: fontMultiplier = 1; break;
      case 2: fontMultiplier = 0.54; break;
      default: fontMultiplier = 0.43;
    }
    fontMultiplier *= this.fontScale(this.form.value.fontSize ?? 3);
    return `
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
      align-items: stretch;
      font-size: calc(min(4.6vw, 170%) * ${fontMultiplier});
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

  get figureStyle() {
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

  formatFontSize(self: AppComponent): (value: number) => string {
    return (value) => self.fontScale(value).toPrecision(2) + "x";
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

  @HostListener('window:beforeunload', ['$event'])
  confirmClose($event: BeforeUnloadEvent)   {
    if (this.changedSinceCopy) $event.returnValue = confirm();
  }

  async copyHtml(): Promise<void> {
    this.changedSinceCopy = true;
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
