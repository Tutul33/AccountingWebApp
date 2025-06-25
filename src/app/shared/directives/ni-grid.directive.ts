import {
  AfterViewInit,
  Directive,
  ElementRef,
  Injector,
  Input,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { PrimeTemplate } from "primeng/api";
import { DataService } from "../services/data.service";

@Directive({
  selector: "[niGrid]",
  standalone:true
})
export class NiGridDirective implements OnInit, AfterViewInit {
  // @Input()
  // set niGrid(options: any) {
  //   this.niGrid = options;
  // }

  getTemplateFromDataSvc: TemplateRef<any>;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private vcr: ViewContainerRef,
    private dataSvc: DataService
  ) {}

  // private updateView() {
  //   // if (this.niGrid) {
  //   //   this.vcr.createEmbeddedView(this.templateRef);
  //   // } else {
  //   //   this.vcr.clear();
  //   // }
  // }

  ngOnInit() {
    // this.dataSvc.on("paginatorright").subscribe((response) => {
    //   if (response) {
    //     this.getTemplateFromDataSvc = response as TemplateRef<PrimeTemplate>;
    //   }
    // });
  }

  ngAfterViewInit() {
    let elm = this.elementRef;
    let render = this.renderer;
    let vc = this.vcr;
    // this.appendChild(paginator);
    this.updateView();    
  }

  appendChild(paginator) {
    this.dataSvc.on("paginatorright").subscribe((response) => {
      if (response) {
        this.getTemplateFromDataSvc = response as TemplateRef<PrimeTemplate>;
      }
    });
    this.renderer.appendChild(
      paginator,
      (this.getTemplateFromDataSvc as any).template
    );
  }

  updateView() {
    this.dataSvc.on("paginatorright").subscribe((response) => {
      if (response) {
        this.getTemplateFromDataSvc = response as TemplateRef<PrimeTemplate>;
      }
    });
    if (this.getTemplateFromDataSvc) {
      const embeddedViewRef = this.vcr.createEmbeddedView(
        (this.getTemplateFromDataSvc as any).template
      );
      // prevents change detection errors
      embeddedViewRef.detectChanges();
      embeddedViewRef.markForCheck();
    }
  }
}
