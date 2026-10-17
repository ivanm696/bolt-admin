import { Component, Input } from '@angular/core';

@Component({
  selector: 'hello',
  standalone: false,
  template: `<h1>Hello {{ name }}!</h1>`,
  styles: [`h1 { font-family: Lato, sans-serif; }`],
})
export class HelloComponent {
  @Input() name = '';
}
