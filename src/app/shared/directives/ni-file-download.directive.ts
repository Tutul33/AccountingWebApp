import { AfterViewInit, Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[niFileDownload]',
  standalone:true
})
export class NiFileDownloadDirective implements AfterViewInit {
  @Input('niFileDownload') filePath: any;

  constructor() { }

  @HostListener('click') onClick() {
    window.open(this.filePath, '_blank', '');
  }

  ngAfterViewInit(): void {
  }

}
