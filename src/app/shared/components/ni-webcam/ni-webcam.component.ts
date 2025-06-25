import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ni-webcam',
  templateUrl: './ni-webcam.component.html',
  styles: [
    `
      .snap-container {
        margin-top: 16px;
        margin-bottom: 16px;
        text-align: left;
      }

      .list-unstyled {
        list-style: none;
      }

      .list-unstyled li {
        display: inline-block;
        padding: 5px 10px;
        cursor: pointer;
      }

      .show {
        display: block;
      }
      .hide {
        display: none;
      }
    `,
  ],
  providers: [ModalService],
  standalone:true,
  imports:[CommonModule]
})
export class NiWebcamComponent implements OnInit, AfterViewInit {
  constructor(private modalService: ModalService) {}

  WIDTH = 480;
  HEIGHT = 360;

  @ViewChild('video')
  public video: ElementRef;

  @ViewChild('canvas')
  public canvas: ElementRef;

  captures: string[] = [];
  error: any;
  isCaptured: boolean;

  maxCapture = 5;
  base64Content = '';

  ngOnInit(): void {}

  async ngAfterViewInit() {
    await this.setupDevices();
  }

  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (stream) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
        } else {
          this.error = 'You have no output video device';
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  capture() {
    this.drawImageToCanvas(this.video.nativeElement);

    if (this.captures.length >= this.maxCapture) {
      this.captures.shift();
    }
    this.captures.push(this.canvas.nativeElement.toDataURL('image/png'));

    this.isCaptured = true;

    this.base64Content = this.canvas.nativeElement.toDataURL('image/png');
  }

  removeCurrent() {
    this.isCaptured = false;
  }

  setPhoto(idx: number) {
    this.isCaptured = true;
    const image = new Image();
    image.src = this.captures[idx];
    this.drawImageToCanvas(image);

    this.base64Content = this.captures[idx];
  }

  drawImageToCanvas(image: any) {
    this.canvas.nativeElement
      .getContext('2d')
      .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  }

  ok() {
    if (this.modalService.isModal) {
      const data: any = [];
      data.base64Content = this.base64Content;

      this.modalService.close(data);
    }
  }
}
