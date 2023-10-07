import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { HostListener } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

type Image = Partial<{ url: string | null, link: string | null, caption: string | null, altText: string | null }>;

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
    captions: new FormControl<'overlay'|'under'>('under'),
    pixelate: new FormControl<boolean>(false),
    images: new FormArray([
      new FormGroup({
        url: new FormControl(""),
        link: new FormControl(""),
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
    return `
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
      align-items: stretch;
      text-align: center;
    ` + (this.form.value.captions === 'overlay' ? `
      text-shadow:
        0px 0px 2px black,
        0px 0px 2px black,
        0px 0px 2px black,
        0px 0px 2px black,
        0px 0px 2px black,
        0px 0px 2px black;
    ` : '');
  }

  get figureStyle() {
    return `
      width: calc(100% / ${this.form.value.imagesPerRow} - 4px);
      margin: 2px 2px;
      display: flex;
      flex-flow: column;
      text-decoration: none;
      position: relative;
      object-fit: 
    `;
  }

  get imageStyle() {
    return `
      ${this.form.value.pixelate ? 'image-rendering: pixelated;' : ''}
      width: 100%;
      height: 100%;
      margin: 0;
      object-fit: ${this.form.value.wideImages === 'crop' ? 'cover' : 'contain'};
    `;
  }

  get captionStyle() {
    // Have to declare some of these locally to override Cohost's default
    // styles.
    let fontMultiplier;
    switch (this.form.value.imagesPerRow) {
      case 1: fontMultiplier = 1; break;
      case 2: fontMultiplier = 0.54; break;
      default: fontMultiplier = 0.43;
    }
    fontMultiplier *= this.fontScale(this.form.value.fontSize ?? 3);
    return `
      font-size: calc(min(4.6vw, 170%) * ${fontMultiplier});
      line-height: 100%;
    ` + (this.form.value.captions === 'overlay' ? `
      color: white;
      position: absolute;
      bottom: 6%;
      left: 2%;
      right: 2%;
      display: block;
      pointer-events: none;
    ` : `
      margin-top: 0.2rem;
    `);
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

  link(image: Image): string {
    return (image.link == "" ? image.url : image.link) ?? "";
  }

  addImage(): void {
    this.form.controls.images.push(new FormGroup({
      url: new FormControl(""),
      link: new FormControl(""),
      caption: new FormControl(""),
      altText: new FormControl(""),
    }));
  }

  removeImage(i: number): void {
    this.form.controls.images.removeAt(i);
  }

  drop(event: CdkDragDrop<FormGroup>): void {
    moveItemInFormArray(this.form.controls.images, event.previousIndex, event.currentIndex);
  }

  @HostListener('window:beforeunload', ['$event'])
  confirmClose($event: BeforeUnloadEvent): void {
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
      .replace(/ class="ng-star-inserted"/g, '')
      // Cohost adds these automatically
      .replace(/ target="_blank" rel="noreferrer noopener"/g, '');
    await navigator.clipboard.writeText(html);
    this._snackBar.open("HTML copied!", undefined, { duration: 1000 });
  }
}

/**
 * Moves an item in a FormArray to another position.
 * @param formArray FormArray instance in which to move the item.
 * @param fromIndex Starting index of the item.
 * @param toIndex Index to which he item should be moved.
 */
export function moveItemInFormArray(formArray: FormArray, fromIndex: number, toIndex: number): void {
  const dir = toIndex > fromIndex ? 1 : -1;

  const from = fromIndex;
  const to = toIndex;

  const temp = formArray.at(from);
  for (let i = from; i * dir < to * dir; i = i + dir) {
    const current = formArray.at(i + dir);
    formArray.setControl(i, current);
  }
  formArray.setControl(to, temp);
}
