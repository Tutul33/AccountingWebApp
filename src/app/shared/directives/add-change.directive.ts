import {
  Directive,
  DoCheck,
  Input,
  KeyValueChanges,
  KeyValueDiffer,
  KeyValueDiffers,
  OnInit,
} from '@angular/core';
import { FixedIDs } from '../../app-shared/models/fixedIDs';

@Directive({
  selector: '[objWatcher]',
  standalone:true
})
export class AddChangeDirective implements DoCheck, OnInit {
  @Input('objWatcher') objWatche: any;
  @Input('parent') parent: any;
  arrayDiffer: any;

  private customerDiffer: KeyValueDiffer<string, any>;

  constructor(private kvDiffers: KeyValueDiffers) {}

  ngOnInit() {
    this.customerDiffer = this.kvDiffers.find(this.objWatche).create();
  }

  customerChanged(changes: KeyValueChanges<string, any>) {
    changes.forEachChangedItem((record) => {
      if (this.objWatche && this.objWatche.tag == FixedIDs.objectState.detached) {
        this.objWatche.tag = this.objWatche.tag === FixedIDs.objectState.detached && this.objWatche.id !== 0 ? FixedIDs.objectState.modified : this.objWatche.tag;

        if (this.parent && this.parent.tag == FixedIDs.objectState.detached) {
          this.parent.tag = this.objWatche.tag == FixedIDs.objectState.modified ? FixedIDs.objectState.modified : this.parent.tag;
        }
      }      
    });
  }

  ngDoCheck(): void {
    const changes = this.customerDiffer.diff(this.objWatche);
    if (changes) {
      this.customerChanged(changes);
    }
  }
}
