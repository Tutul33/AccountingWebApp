import { Injectable, Type } from '@angular/core';
import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NIDialogService {
  constructor(private dialogService: DialogService) {}

  currentDialogRef: DynamicDialogRef | null = null;

  open(
    componentType: Type<any>,
    config: DynamicDialogConfig
  ): DynamicDialogRef {
    let currentDialogComponent: DynamicDialogComponent | undefined;
    if (this.currentDialogRef) {
      currentDialogComponent = this.dialogService.dialogComponentRefMap.get(
        this.currentDialogRef
      )?.instance;
      currentDialogComponent?.unbindGlobalListeners();
    }

    const lastDialogRef = this.currentDialogRef;
    const dialogRef = this.dialogService.open(componentType, config);
    this.currentDialogRef = dialogRef;

    dialogRef.onDestroy.pipe(first()).subscribe(() => {
      // reinitialize the first modal
      if (currentDialogComponent) {
        currentDialogComponent.moveOnTop(); // we need this for properly Esc button handler
        currentDialogComponent.bindGlobalListeners(); // bind tab/esc buttons listeners
        currentDialogComponent.focus(); // apply [autofocus] if any
      }

      this.currentDialogRef = lastDialogRef;
    });

    return dialogRef;
  }
}