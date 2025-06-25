import { CommonModule, formatDate } from "@angular/common";
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  DoCheck,
  ElementRef,
  Input,
  KeyValueChanges,
  KeyValueDiffer,
  KeyValueDiffers,
  OnInit,
  QueryList,
  Renderer2,
  TemplateRef,
  ViewChild
} from "@angular/core";

import { PrimeTemplate } from "primeng/api";
import { DomHandler } from "primeng/dom";
import { InputText, InputTextModule } from "primeng/inputtext";
import { ObjectUtils } from "primeng/utils";
import { FixedIDs } from "src/app/app-shared/models/fixedIDs";
import { GlobalConstants, GlobalMethods, ProviderService } from "../..";
import { BaseComponent } from '../base/base.component';
import {
  ColumnType,
  ExportOption,
  ExportOptionInterface,
  GridOption,
  QueryData,
} from "../../models/common.model";
import { DynamicReportService } from "../../services/dynamic-report.service";
import { ColumnFilter, RowToggler, Table } from "../table/table";
import { FieldTitleService } from "src/app/core/services/field-title.service";
import { DataCacheService } from "../../services/data-cache.service";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { MultiSelect } from "../multiselect/multiselect";
import { PaginatorModule } from "primeng/paginator";
import { SelectModule } from "primeng/select";
import { Tooltip } from 'primeng/tooltip';

interface ITemplate {
  [key: string]: TemplateRef<PrimeTemplate>;
}

interface ISortingMetaData {
  field: string;
  order: number;
}

// Very important for solving NullInjectorError when passing 
// an ng-template in to a component which wraps a p-table Ex. when use ni-columnFilter
// Solved using this link https://github.com/primefaces/primeng/issues/7985
// The key to this working is the factory function. It should provide a class instance of a Table, 
// but it needs to be the correct instance that your component wrapped. So the factory function 
// requires your wrapper component as a dependency, and then just returns the ViewChild reference inside of it.
export function tableFactory(wrapper: NiTableComponent) {
  return wrapper.tableClass;
}

@Component({
  selector: "app-ni-table",
  templateUrl: "./ni-table.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: Table,// providing table class
      useFactory: tableFactory, // using new function
      deps: [NiTableComponent],// new function depends on your wrapper
    },
    DomHandler
  ],
  standalone:true,
  imports:[
    FormsModule,
    CommonModule,
    ButtonModule,
    ColumnFilter,
    DropdownModule,
    MultiSelect,
    InputTextModule,
    PaginatorModule,
    SelectModule,
    Table,
    Tooltip  
  ]
})
export class NiTableComponent extends BaseComponent implements OnInit, AfterViewInit, AfterViewChecked {
  
  generateContextColumn(columns: any){
    return columns;
  }
  generateContextNew(data: any, rowIndex: any, expanded: any): any {
    return { $implicit: data, rowIndex: rowIndex, expanded: expanded };
  }
  generateContext(item: any, rowIndex: any): any {
    return { $implicit: item, rowIndex: rowIndex };
  }
  
  grid: GridOption;
  http: any;
  isClearBtn :boolean = false;

  @Input()
  set gridOption(options: GridOption) {
    this.grid = options;
  }

  skeletonVariable: boolean = false;

  @ViewChild(InputText, { read: ElementRef }) inputDirective: any;
  @ViewChild("dt", { read: ElementRef }) dataTable: ElementRef;
  @ViewChild("dt", { read: Table }) tableClass: Table;

  @ContentChildren(PrimeTemplate) templates: QueryList<any>;
  templatesByKey: ITemplate = {};

  exportOption: ExportOptionInterface;
  cols: any[];
  products: any[] = [];
  spData: any;
  tempGridValue: any[] = [];
  rows: number = null;
  gridColumnKey:any;
  @Input('valueList') valueList: any[] = [];
  fieldTitleList: any = [];
  hasFrozenColumn:boolean=false;
  private differ: KeyValueDiffer<string, any>;
  private differForGrid: KeyValueDiffer<string, any>;
  private objDiffers: Array<KeyValueDiffer<any, any>>;

  constructor(
    private dynamicReportSvc: DynamicReportService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private differs: KeyValueDiffers,
    private fieldSvc: FieldTitleService,
    protected providerSvc: ProviderService,
    private dataCacheSvc: DataCacheService
  ) { super(providerSvc);}

  ngOnInit(): void {
    this.pageNo = 1;
    this.differ = this.differs.find(this.valueList || []).create();

    this.exportOption = new ExportOption(this.grid.exportOption);
    this.spData = new QueryData({
      spParams: [],
      searchParams: [],
      ddlProperties: [],
      totalSectionInfo: [],
      pageNo: 0,
    });

    this.baseSetUp();
    //this.getReportInfo();
  }

  trackByFn(index: number, item: any) {
    return index;
  }

  ngAfterViewInit() {
    this.prepareTemplate();
    this.cdr.detectChanges();

    this.setColSpanForEmptyGrid();

    if (this.grid.isGlobalSearch && !this.grid.globalFilterFields.length) {
      this.setglobalFilterFields();
    }
    
  }

  prepareTemplate() {
    const templateArray = (this.templates as any)._results || [];
    if (templateArray.length) {
      for (let index = 0; index < templateArray.length; index++) {
        let currentTemplate: PrimeTemplate = templateArray[index];
        this.templatesByKey[currentTemplate.name] = currentTemplate.template;
      }
    }
  }
  
  ngAfterViewChecked() {
    if (this.differ) {
      const changes = this.differ.diff(this.valueList);
      if (changes) {
        this.listChanged(changes);
        this.cdr.detectChanges();
      }
    }
    
    // for language changed
    if(this.grid.languageCode == null || this.grid.languageCode != localStorage.getItem('languageCd')){
        let isApplyChange = false;
        setTimeout(()=>{
          this.dataCacheSvc.get('FieldTitleCache').subscribe({
            next: (res: any) => {
              if(this.grid.columns.length !=0 || !this.grid.isDynamicHeader){
                var lngObj = res.find(x=>x.languageKeyCode == this.grid.titleFieldKeyCode);
                if(lngObj != null){
                  this.grid.title = lngObj.value;
                }
              }
  
                if(this.grid.columns.length !=0){
                  this.grid.columns.forEach(x => {
                    if(x.fieldTitleKey == undefined){
                      x.fieldTitleKey = this.gridColumnKey.find(v=>v.header == x.header).fieldTitleKey;
                    }
                      var languageObj = res.find(y=>y.languageKeyCode == x.fieldTitleKey);
                      if(languageObj !=null){
                        if(x.header != languageObj.value)  
                          {                      
                            isApplyChange = true;
                            x.header = languageObj.value
                            
                          }
                      }
                  })
                }
  
                if(isApplyChange)
                  this.grid.languageCode = localStorage.getItem('languageCd');           
                  
                this.cdr.detectChanges();
            
            }
           });
        },150)

        //this block add for report which is dynamic header false
        if(!this.grid.isDynamicHeader){
          setTimeout(()=>{
            this.cdr.detectChanges();
          },150)

        }
      }

    if (this.grid.value) {
      let changeFalg = false;
      this.grid.value.forEach((item: any, index: number) => {
        const objDiffer = this.objDiffers[index];
        const objChanges = objDiffer.diff(item);
        if (objChanges) {
          objChanges.forEachChangedItem((record) => {
            if (!changeFalg) {
              this.setDataSource(this.grid.self, this.grid.dataSource, this.grid.value);
              this.valueList = this.grid.value;
              this.grid.value = this.grid.self ? this.grid.dataSource.split('.').reduce((o, i) => o[i], this.grid.self) : [];
              this.cdr.detectChanges();
              changeFalg = true;
            }
          });
        }
      });
    }

    if (this.grid.isReset) {
      this.resetSerchingFilter();
    }

    if (this.grid.filters && this.tableClass.filters != this.grid.filters) {
      this.tableClass.filters = this.grid.filters;
    }
    if(this.tableClass.first>0){//This IF block is added by Tutul Chakma
       if (this.grid.currentPageNo && this.tableClass.first != ((this.grid.currentPageNo - 1) * this.tableClass.rows)) {
         this.tableClass.first = ((this.grid.currentPageNo - 1) * this.tableClass.rows);
       }
    }
    // This code block is needed if and only if , the grid has row group. This Code block is added by Tutul Chakma
    if(this.grid.groupBy!=null){
      setTimeout(() => {
        this.groupTable();
      },1);
    }

  }

  setDataSource = (object: any, path: string, value: any) => {
    const props = path.split('.');
    const prop = props.shift();
    if (props.length === 0) {
      object[prop] = value;
    } else {
      object[prop] = object[prop] ?? {};
      this.setDataSource(object[prop], props.join('.'), value)
    }
  }

  listChanged(changes: KeyValueChanges<string, any>) {
    let addedFlag = false;
    let removeFlag = false;
    let changeFlag = true;

    changes.forEachAddedItem((record) => {
      if (!addedFlag) {
        this.tempGridValue = this.valueList; // JSON.parse(JSON.stringify(this.valueList));
        addedFlag = true;
        changeFlag = false;

        setTimeout(() => {
          this.grid.value = this.valueList; // JSON.parse(JSON.stringify(this.valueList));
          this.cdr.detectChanges();
          this.groupByGrid();
        });
        this.assignGridValue();
      }
    });

    changes.forEachRemovedItem((record) => {
      if (!removeFlag) {
        this.tempGridValue = this.valueList //JSON.parse(JSON.stringify(this.valueList));
        removeFlag = true;
        changeFlag = false;
        setTimeout(() => {
          this.grid.value = this.valueList //JSON.parse(JSON.stringify(this.valueList));
          this.cdr.detectChanges();
          this.groupByGrid();
        });
        this.assignGridValue();
      }
    });

    changes.forEachChangedItem((record) => {
      if (changeFlag) {
        this.tempGridValue = JSON.parse(JSON.stringify(this.valueList));
        changeFlag = false;
        this.assignGridValue();
      }
    });
  }

  assignGridValue() {
    const value = this.inputDirective ? this.inputDirective.nativeElement?.value || '' : '';
    if (this.grid.isByDefaultSorted && this.grid.columns.length) {
      this.prepareSortingMetaData();
    }

    this.grid.value = this.grid.self ? this.grid.dataSource.split('.').reduce((o, i) => o[i], this.grid.self) : [];

    if (value) {
      this.globalSearchFromComponent(this.tableClass, value);
    }

    if (this.grid.value) {
      this.differForGrid = this.differs.find(this.grid.value).create();

      this.objDiffers = new Array<KeyValueDiffer<string, any>>();
      this.grid.value.forEach((item: any, index: number) => {
        this.objDiffers[index] = this.differs.find(item).create();
      });
    }
  }

  pageNo: number = 1;
  pageFunction(event: any) {
    const getPageNo = this.getPageNo(event);
    if (this.pageNo != getPageNo || this.rows != event.rows) {
      if (this.grid.getServerData) {
        this.getServerData(event);
        setTimeout(() => {
          this.groupByGrid();
        }, 150);
      } else {
        // It should be called after back end data received, If not then need to adjust group by method - TODO
        this.groupByGrid();
      }
      this.pageNo = getPageNo;
      this.grid.currentPageNo = this.pageNo;
      this.rows = GlobalMethods.jsonDeepCopy(event.rows);
    }
  }

  getPageNo(event: any) {
    return Math.floor(event.first / event.rows) + 1;
  }

  onLazyFunction(event: any) {
    if (event.isPage) {
      // this.groupByGrid();
    } else {
      // this.groupByGrid();
      // if(this.grid.filterFromServer) {
      //   this.filterFromServer(event);

      //   setTimeout(() => {
      //     this.groupByGrid();
      //   }, 50);
      // }
    }


    // this.groupByGrid();
  }

  isGroupByCalledFromFilter: boolean = false;
  tempFilterValue: any = [];

  filterFunction(event: any) {
    if (this.grid.filterFromServer) {
      this.filterFromServer(event);
    }

    if (event.isFilterdValueExist) {
      this.groupByGrid();
      this.tempFilterValue = JSON.parse(JSON.stringify(event.originalfilteredValue));
    } else {
      if (this.tempFilterValue.length) {
        this.groupByGrid();
        this.tempFilterValue = [];
      }
    }
  }

  addTdElement() {
    this.skeletonVariable = true;
    const tbody = this.dataTable.nativeElement.querySelector("tbody").children;
    const colArr = this.grid.groupBy.split(",");
    let colStartIndex = Number(colArr[0].trim());
    let colLastIndex = Number(colArr[colArr.length - 1].trim());

    for (let j = colStartIndex; j <= colLastIndex; j++) {
      for (let i = 0; i < tbody.length; i++) {
        const currentTr = tbody[i].children;

        let currentRowSpan = this.getRowSpanAttributes(currentTr[j]) || 1;
        if (currentRowSpan > 1) {
          this.renderer.setAttribute(currentTr[j], "rowspan", "1");
          for (let m = 1; m < currentRowSpan; m++) {
            const nextTrIndex = (i + m);
            let row = tbody[nextTrIndex];
            let tdList = tbody[nextTrIndex].children;
            let cloneNode = currentTr[j].cloneNode(true);
            this.renderer.insertBefore(row, cloneNode, tdList[j]);
          }
        }
      }
    }
  }

  groupByGrid(isPage?: boolean) {
    if (this.grid.groupBy != null) {
      isPage = isPage ? true : false;
      if (!isPage) {
        this.addTdElement();
      }
      setTimeout(() => {
        this.groupTable();
      });
    }
  }

  resetSerchingFilter() {
    this.inputDirective.nativeElement.value = '';
    this.globalSearchAfterReset(this.tableClass, '');
    this.grid.isReset = false;
  }

  globalSearchAfterReset(dt: any, value: any) {
    dt.filterGlobal(value, "contains");
  }

  groupTable() {
    const tbody = this.dataTable.nativeElement.querySelector("tbody").children;
    const colArr = this.grid.groupBy.split(",");
    let j = Number(colArr[0].trim());
    let colLastIndex = Number(colArr[colArr.length - 1].trim());

    for (j = 0; j <= colLastIndex; j++) {
      let i = 0;
      let lastMatchingRow = tbody[i].children;
      for (i = 1; i < tbody.length; i++) {
        const currentTr = tbody[i].children;

        if (this.ifAllValueMatch(lastMatchingRow, currentTr, j)) {
          const prevRowSpanVal = this.getRowSpanAttributes(lastMatchingRow[j]);
          this.renderer.setAttribute(lastMatchingRow[j], "rowspan", `${prevRowSpanVal + 1}`);
          this.renderer.removeChild(currentTr, currentTr[j]);
        } else {
          lastMatchingRow = currentTr;
        }
      }
    }
    this.skeletonVariable = false;
  }

  ifAllValueMatch(lastMatchTr: any, currentTr: any, currentColumn: number) {
    let matched = true;
    for (let colIndex = 0; colIndex <= currentColumn; colIndex++) {
      let prevVal = this.getTdValue(lastMatchTr, colIndex);
      let currentVal = this.getTdValue(currentTr, colIndex);
      if (prevVal !== currentVal) {
        matched = false;
      }
    }
    return matched;
  }

  getRowSpanAttributes(prevTd: any) {
    return prevTd?.rowSpan ? prevTd.rowSpan : 1;
  }

  getTdValue(tr: any, tdIndex: number) {
    return tr[tdIndex] ? tr[tdIndex].outerText.trim() : null;
  }

  prepareSortingMetaData() {
    this.grid.multipleSortingMetaData = [];
    if ((this.grid.groupBy != null || this.grid.sortWithoutGroup != null) && this.grid.columns.length) {
      const colArr = this.grid.groupBy != null ? this.grid.groupBy.split(",") : this.grid.sortWithoutGroup.split(",");
      let j = Number(colArr[0].trim());
      let colLastIndex = colArr.length > 1 ? Number(colArr[colArr.length - 1].trim()) : j;

      if (j == colLastIndex) {
        const metaInterface = {} as ISortingMetaData;
        metaInterface.field = this.grid.columns[j].field;
        metaInterface.order = 1;
        this.grid.multipleSortingMetaData.push(metaInterface);
      } else {
        for (let i = j; i <= colLastIndex; i++) {
          let metaInterface = {} as ISortingMetaData;
          metaInterface.field = this.grid.columns[i].field;
          metaInterface.order = 1;
          this.grid.multipleSortingMetaData.push(metaInterface);
        }
      }
    } else {
      // When columns not provided and we want sort by provided sorting meta data then must assign sortMetaDataWithoutGroup: [{field: 'name', order: 1/-1}]
      // Mostly used for dynamically generated header and want group by
      if (this.grid.sortMetaDataWithoutGroup.length) {
        this.grid.multipleSortingMetaData = this.grid.sortMetaDataWithoutGroup;
      }
    }
  }

  baseSetUp() {
    
    this.rows = GlobalMethods.jsonDeepCopy(this.grid.rows);
    const copyColumns = this.grid.columns || [];
    const tempColumns = Object.assign([], copyColumns);
    this.grid.columns = [];
    this.dataCacheSvc.get('FieldTitleCache').subscribe({
          next: (res: any) => {
            this.gridColumnKey =[];
            for (let i = 0; i < tempColumns.length; i++) {
              const item = new ColumnType(tempColumns[i]);
              if (item.field == "" || item.header == "") {
                item.isVisible = false;
              }
              var lgkeyCode = res.find(x=>x.value == item.header);
              if(lgkeyCode)
              item.fieldTitleKey = lgkeyCode.languageKeyCode;
              this.grid.columns.push(item);
          }
          this.gridColumnKey = GlobalMethods.jsonDeepCopy(this.grid.columns);// for language changed
          
          if(this.grid.title != ''){
            var lgkeyCode = res.find(x=>x.value == this.grid.title);
            this.grid.titleFieldKeyCode = lgkeyCode.languageKeyCode;
          }
        }
    });

    this.grid.languageCode = localStorage.getItem('languageCd');
      
  }
    // if(this.grid.columns.length > 0){
    //   let isFilter = this.grid.columns.find((x)=>x.isSearchFilter === true || x.isMultiselectFilter === true);
    //   this.isClearBtn = isFilter ? true :false;
    // }
    // if(this.grid.self.spData.ddlProperties.length > 0){
    //   this.isClearBtn =true;
    // }

    // let res=this.tableClass.hasFilter();

  

  setglobalFilterFields() {
    for (let i = 0; i < this.grid.columns.length; i++) {
      const col = this.grid.columns[i];
      if (col.field != "" && col.header != "") {
        this.grid.globalFilterFields.push(col.field);
      }
    }
  }

  setColSpanForEmptyGrid() {
    const thead = this.dataTable.nativeElement.querySelector("thead");
    this.grid.colspanForEmpty = thead.querySelector("tr")?.children?.length || 3;
  }

  refreshEvent() {
    this.grid.refreshEvent.call(this.grid.self, true);
    setTimeout(() => {
      this.groupByGrid();
    }, 150);
  }

  getServerData(event: any) {
    this.grid.getServerData.call(this.grid.self, event, false);
  }

  filterFromServer(event: any) {
    setTimeout(() => {
      let filtersData = this.tableClass.filters;

      //this.grid.currentPageNo = 1;
      this.pageFunction({'first':0, 'rows': 10}); // This is page 1 event data 

      this.grid.filterFromServer.call(this.grid.self, event, filtersData);

      setTimeout(() => {
        this.groupByGrid();
      }, 150);

    }, 50);
  }

  clear(table: any) {
    table.clear();
  }

  globalSearch(dt: any, event: any) {
    const value = (<HTMLInputElement>event.target).value;
    dt.filterGlobal(value, "contains");
    this.addTdElement();
  }

  globalSearchFromComponent(dt: any, value: any) {
    dt.filterGlobal(value, "contains");
  }

  globalSearchCustom(value: any) {
    if (value) {
      this.grid.value = this.filteredDataSource(value);
    } else {
      this.grid.value = this.tempGridValue;
    }
    this.groupByGrid();
  }

  filteredDataSource(query: any) {
    const dataSource = JSON.parse(JSON.stringify(this.tempGridValue));
    let filteredData: any[] = [];

    if (this.grid.globalFilterFields.length) {
      for (let i = 0; i < dataSource.length; i++) {
        let item = dataSource[i];
        for (let j = 0; j < this.grid.globalFilterFields.length; j++) {
          const field = this.grid.globalFilterFields[j];
          const val = item[field].toString() || '';
          if (val.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
            filteredData.push(item);
            break;
          }
        }
      }
    }

    return filteredData.length ? filteredData : dataSource;
  }

  exportExcelReport() {
    if (this.grid.exportOption.exportDataEvent) {
      this.grid.exportOption.exportDataEvent.call(this.grid.self, this).subscribe({
        next: (data: any) => {
          const exportDataList = data.values;
          this.exportCSVReport(exportDataList, data.columns)
        },
        error: (res: any) => { throw res; }
      });
    } else {
      this.tableClass.exportCSV(null, this.exportOption.title);
    }
  }

  public exportCSVReport(values: any, column?: any[]) {
    let data: any = values;
    let csv = '';
    let columns = column;
    let csvSeparator = ',';

    //headers
    for (let i = 0; i < columns.length; i++) {
      let column = columns[i];
      if (column.exportable !== false && column.field) {
        csv += '"' + (column.header || column.field) + '"';

        if (i < (columns.length - 1)) {
          csv += csvSeparator;
        }
      }
    }

    //set yes/no
    if (columns.length > 0) {
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        columns.forEach(x => {
          if (x.isBoolean) {
            if (typeof element[x.field] === 'string') {
              element[x.field] = element[x.field] == 'Yes' ? 'Yes' : 'No'
            } else {
              element[x.field] = element[x.field] == true ? 'Yes' : 'No'
            }
          }
        })
      }
    };


    //body
    data.forEach((record: any, i: number) => {
      csv += '\n';
      for (let i = 0; i < columns.length; i++) {
        let column = columns[i];
        if (column.exportable !== false && column.field) {
          let cellData = ObjectUtils.resolveFieldData(record, column.field);

          if (cellData != null) {
            cellData = String(cellData).replace(/"/g, '""');
          }
          else
            cellData = '';

          csv += '"' + cellData + '"';

          if (i < (columns.length - 1)) {
            csv += csvSeparator;
          }
        }
      }
    });

    let blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    // Modified by mozahid
    if ((<any>window.navigator).msSaveOrOpenBlob) {
      (<any>navigator).msSaveOrOpenBlob(blob, this.exportOption.title + '.csv');
    }
    else {
      let link = document.createElement("a");
      link.style.display = 'none';
      document.body.appendChild(link);
      if (link.download !== undefined) {
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', this.exportOption.title + '.csv');
        link.click();
      }
      else {
        csv = 'data:text/csv;charset=utf-8,' + csv;
        window.open(encodeURI(csv));
      }
      document.body.removeChild(link);
    }
  }

  exportPdf(nativEl: any) {
    if (this.grid.exportOption.exportDataEvent) {
      let filtersData = this.tableClass.filters;
      this.grid.exportOption.exportDataEvent.call(this.grid.self, this).subscribe({
        next: (data: any) => {
          const exportDataList = JSON.parse(JSON.stringify(data.values));
          this.invokePdfService(nativEl, exportDataList, data.columns);
        },
        error: (res: any) => { throw res; }
      });
    } else {
      this.baseSetUp();

      let dataList = [];
      let filter = this.tableClass.hasFilter();
      if (filter) {
        const values = JSON.parse(JSON.stringify(this.grid.value));
        dataList = this.tableClass.filterForReport(values);
      } else {
        dataList = JSON.parse(JSON.stringify(this.grid.value));
      }
      // this.gettingDataForReport(nativEl);
      // if (dataList && dataList.length) {
      //   this.invokePdfService(nativEl, dataList);
      // }
      this.invokePdfService(nativEl, dataList);
    }
  }

  invokePdfService(nativEl: any, values: any, columns?: any[]) {
    this.exportOption.columns = columns && columns.length ? this.prepareDynamicColumn(columns) : this.grid.columns || [];
    const isNestedReport = columns && columns.length ? true : false;
    this.processData(values, this.exportOption.columns);
    this.exportOption.tableNativeElement = nativEl;
    this.exportOption.dataSource = values;
    
    this.dynamicReportSvc.exportPdfFunction(this.exportOption, isNestedReport,true,GlobalConstants.userInfo.userName);//this.grid.exportOption.isUnicodeSupported
  }

  prepareDynamicColumn(columns: any) {
    const dynamicTempColumn = [];
    const tempColumns = JSON.parse(JSON.stringify(columns));
    for (let i = 0; i < tempColumns.length; i++) {
      const item = new ColumnType(tempColumns[i]);

      if (item.field == "" || item.header == "") {
        item.isVisible = false;
      }
      dynamicTempColumn.push(item);
    }
    return dynamicTempColumn;
  }

  processData(data: any, columns: any[]) {
    if (data.length > 0) {
      let convertedColumns = [];
      for (let index = 0; index < columns.length; index++) {
        const element = columns[index];
        let obj: any = {};
        if (element.isBoolean || element.isDate) {
          obj.field = element.field;
          obj.isBoolean = element.isBoolean;
          obj.isDate = element.isDate;
          convertedColumns.push(obj);
        }
      }

      if (convertedColumns.length > 0) {
        for (let index = 0; index < data.length; index++) {
          const element = data[index];
          convertedColumns.forEach(x => {
            if (typeof element[x.field] === 'string') {
              element[x.field] = element[x.field] == 'Yes' ? 'Yes' : 'No'
           }else{
              element[x.field] = element[x.field] == true ? 'Yes' : 'No'
           }

            if (x.isDate) {
              element[x.field] = formatDate(element[x.field], FixedIDs.fixedIDs.format.dateFormat, "en");
            }
          })
        }
      };
    }
  }

  gettingDataForReport(nativEl) {
    this.dynamicReportSvc.getReportData(this.spData).subscribe({
      next: (res: any) => {
        const val = res[0];
        this.invokePdfService(nativEl, val);
      },
      error: () => { },
      complete: () => { },
    });
  }

  // getReportInfo() {
  //   const rptId = 100000001;
  //   this.dynamicReportSvc.getReportInfo(rptId).subscribe({
  //     next: (res: any) => {
  //       const reportInfo = res[0];
  //       this.exportOption.reportInfo = reportInfo;
  //       this.spData.spName = reportInfo.sp;
  //       // if (this.reportInfo.isUserCache) {
  //       //   this.spData.userID = userInfo.empPKID;
  //       // }
  //       // this.spData.userID = userInfo.empPKID;
  //     },
  //     error: () => {},
  //     complete: () => {},
  //   });
  // }
}

@Directive({
  selector: '[pRowTogglerCustom]',
  providers: [{
    provide: Table,// providing table class
    useFactory: tableFactory, // using new function
    deps: [NiTableComponent],// new function depends on your wrapper
  },]
})
export class CustomRowToggler extends RowToggler {
  constructor(public dt: Table) {
    super(dt);
  }
}
