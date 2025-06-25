import { Component, OnInit } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { TreeModule } from 'primeng/tree';
import { NiTableComponent } from 'src/app/shared/components/ni-table/ni-table.component';
import { FileOption, GridOption } from 'src/app/shared/models/common.model';

@Component({
  selector: 'app-template-page-report',
  templateUrl: './template-page-report.component.html',
  styles: [
  ],
  standalone:true,
  imports:[NiTableComponent,TreeModule,SelectModule]
})

export class templatePageReportComponent implements OnInit {
  skills: string[] = [];
  dropdownList: any = [];
  gridOption: GridOption;
  gridOptionAnother: GridOption;
  gridOptionHidesearch: GridOption;
  list:any = [];
  date:any = [];
  constructor() { }

  ngOnInit(): void {
    this.skills = ['JavaScript', 'Angular', 'React'];
    this.initGridOption();
    this.initGridOptionAnother();
    this.initGridOptionHidesearch();
    this.dropdownList.push({code:"1", value:'Value 1'});
  }

  initGridOption() {
    try {
      const gridObj = {
        title: "Table Title",
        dataSource: "list",
        isGlobalSearch: true,
        isDynamicHeader:false,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: "Head List"
        } as FileOption
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  initGridOptionAnother() {
    try {
      const gridObj = {
        dataSource: "list",
        isGlobalSearch: false,
        isDynamicHeader:false,
        paginator: true
      } as GridOption;
      this.gridOptionAnother = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  initGridOptionHidesearch() {
    try {
      const gridObj = {
        dataSource: "list",
        isGlobalSearch: false,
        isDynamicHeader:false
      } as GridOption;
      this.gridOptionHidesearch = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

}
