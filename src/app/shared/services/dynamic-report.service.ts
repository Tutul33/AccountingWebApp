import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { QueryData, FileOptions, ExportOptionInterface, ExportOption } from '../../shared/models/common.model';
import { NotoSansBengali } from 'src/assets/fonts/NotoSansBengali';

@Injectable({
  providedIn: 'root'
})
export class DynamicReportService {
  controllerName = 'DynamicReport';
  exportOption: ExportOptionInterface;
  reportInfo: any;
  gridColWidth: any = {};
  exportColumns: any[];

  constructor(private apiSvc: ApiService) { }

  getReportInfo(rptId: number) {
    // { 'moduleID': !rptID ? pageInfo.id : 'null', 'rptID': !rptID ? 'null' : rptID, 'userID': userInfo.userPKID }
    const moduleId = 100000852;
    const params = new HttpParams().set('moduleID', !rptId ? moduleId.toString() : '0')
      .set('rptID', !rptId ? '0' : rptId.toString())
      .set('userID', '0');

    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetReportInfo`, params)
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  exportExcel(dataSource) {
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(dataSource);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'products');
    });
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then(FileSaver => {
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    });
  }

  getReportData(spData: any) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetReportData`, spData, true)
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  exportPdfFunction(exportOptionParam: ExportOptionInterface, isNestedReport: boolean,isUnicodeSupported?:boolean,userName?:string) {
    this.exportOption = exportOptionParam;
    this.exportOption.title = this.exportOption.reportInfo ? this.exportOption.reportInfo.gridTitle : this.exportOption.title;
    this.exportOption.orientationType = this.exportOption.reportInfo ? this.exportOption.reportInfo.exportOrientationType : this.exportOption.orientationType;

    import('jspdf').then(jsPDF => {     
      import('jspdf-autotable').then(x => {
        const pageType: any = this.exportOption.orientationType === 1 ? 'l' : 'p';
        const doc = new jsPDF.default(pageType, 'pt', 'a4');

        if (!exportOptionParam.isDynamicReport) {
          this.prepareGridHeaderFromHtml();
        } else if (isNestedReport) {
          this.prepareGridHeaderForNestedChild();
        } else {
          this.prepareGridHeader();
        }

         let font={
          binaryData:'',
          fontName:'',
          fileName:'',
          fontStyle:'normal'
         } as any;   

         if(isUnicodeSupported){
          font= NotoSansBengali();
          doc.addFileToVFS(font.fileName, font.binaryData);
          doc.addFont(font.fileName, font.fontName, font.fontStyle);
          doc.setFont(font.fontName);            
         }
         else
         {
          font.fontName='helvetica';
          font.fontStyle='normal';
         }  

        // auto Table Configuration
        const autoTableOptions = {
          theme: 'plain',
          useCss: true,
          rowPageBreak: 'avoid',
          margin: {
            top: 42,
            right: 0,
            left:  35,
            bottom: 51
          },
         
          tableWidth: this.exportOption.orientationType === 1 ? 772 : 540,
          showHead: 'everyPage',
          columnStyles: this.gridColWidth,
          styles: {
            font: font.fontName, // 'helvetica'| 'times' | 'courier'
            fontSize: 8,
            overflow: 'linebreak', // 'linebreak' | 'ellipsize' | 'visible' | 'hidden' = 'normal'
            fillColor: 255,
            textColor: 0,
            lineColor: [0, 0, 0],
            lineWidth: .5, // 1px
            cellPadding: 1,
            rowPageBreak: 'auto', // always, auto, avoid
            valign: 'middle', // top, middle, bottom
            halign: 'left', // left, center, right
            cellWidth: 'auto', // 'auto', 'wrap' or a number
            fontStyle: 'normal', // normal, bold, italic, bolditalic
            useCss: true,
            minCellHeight: 13,
          },
          headStyles: {
            font: font.fontName,
            fontStyle: font.fontStyle, // normal, bold, italic, bolditalic
            fontSize: 8,
            fillColor: [244, 244, 244],
            textColor: 0, // Black
            halign: 'center', // 'center' or 'right'
            valign: 'middle', // top, middle, bottom
            minCellHeight: 13,
            cellPadding: 1,
            lineWidth: .5,
            lineColor: [0, 0, 0],
            borderColor: 0,
            useCss: true
          }
        };

        (doc as any).autoTable(this.exportColumns, this.exportOption.dataSource, autoTableOptions);

        this.headerFooterFormatting(doc, doc.getNumberOfPages(),userName);
        doc.setDocumentProperties({ title: this.exportOption.title });
        doc.save(this.exportOption.title + '.pdf');

      });
    });
  }

  private prepareGridHeaderFromHtml() {
    this.exportColumns = this.exportOption.columns
      .filter(x => x.isVisible === true)
      .map(col => ({ title: col.header, dataKey: col.field }));

    const thead = this.exportOption.tableNativeElement.querySelector("thead");
    const tHeadList = thead.querySelector("tr").children;
    this.findOutHeaderMapObj(tHeadList);
  }

  private findOutHeaderMapObj(tHeadList) {
    let totalWidth = 0;
    const obj = {};

    for (let i = 0; i < tHeadList.length; i++) { // Loop through th list to find width of column
      const currentColumnName = tHeadList[i].innerText.trim();
      const columnFlagWithField = this.checkColumnShowOrNot(currentColumnName);

      if (columnFlagWithField.flag) { // Check column name not empty and permit to show
        const styleAttribute = tHeadList[i].attributes['style'] || null;
        if (styleAttribute != null) { // Check current th column's style exist or not
          const styleAttrValues = styleAttribute.value.split(';').find(e => e.includes('width')) || '';
          if (styleAttrValues !== '') {
            const findNumber = styleAttrValues.trim().match(/\d+/g);
            if (findNumber) {
              const val = findNumber[0];
              totalWidth += Number(val);
              obj[columnFlagWithField.field] = Number(val);
            } else {
              obj[columnFlagWithField.field] = 'auto';
            }
          }
        }
      }
    }

    this.dividedAvailWidthAsPercentage(obj, totalWidth);
  }

  private checkColumnShowOrNot(columnName) {
    const flagWithData = { flag: false, field: '' };
    const colItem = this.exportOption.columns.find(col => col.header === columnName && col.isVisible);
    if (colItem) {
      flagWithData.flag = true;
      flagWithData.field = colItem.field;
    }
    return flagWithData;
  }

  private dividedAvailWidthAsPercentage(headerObj: any, totalWidth: number) {
    this.gridColWidth = {};
    const availWidth = this.exportOption.orientationType === 1 ? 772 : 540;
    const sorteddWidth = 100 - totalWidth;

    if (sorteddWidth > 0) {
      Object.keys(headerObj).forEach(key => {
        if (typeof headerObj[key] !== 'string') {
          const unit = ((headerObj[key] * sorteddWidth) / totalWidth);
          headerObj[key] = (availWidth * (unit + headerObj[key]) * .01);
        } else {
          headerObj[key] = 'wrap';
        }
      });
    } else if (totalWidth === 100) {
      Object.keys(headerObj).forEach(key => {
        if (typeof headerObj[key] !== 'string') {
          headerObj[key] = (availWidth * headerObj[key] * .01);
        }
      });
    } else {
      Object.keys(headerObj).forEach(key => {
        headerObj[key] = 'wrap';
      });
    }

    this.gridColWidthFunction(headerObj);
  }

  private gridColWidthFunction(headerObj: any) {
    const headerObjKeyArray = Object.keys(headerObj) || [];
    if (headerObjKeyArray.length) {
      headerObjKeyArray.forEach(key => {
        this.gridColWidth[key] = { cellWidth: headerObj[key] };
      });
    }
  }

  private prepareGridHeaderForNestedChild() {
    if (!this.exportOption.reportInfo) { return; }
    this.exportColumns = this.exportOption.columns.filter(x => x.isVisible === true).map(col => ({ title: col.header, dataKey: col.field }));

    let totalWidth = 0;
    const obj = {};

    for (let i = 0, len = this.exportOption.columns.length; i < len; i++) {
      const tempData = this.exportOption.columns[i];
      if (tempData.isVisible) {
        if (tempData.style) {
          const styleAttrValues = tempData.style.split(';').find((e: any) => e.includes('width')) || '';
          if (styleAttrValues !== '') {
            const findNumber = styleAttrValues.trim().match(/\d+/g);
            if (findNumber) {
              const val = findNumber[0];
              totalWidth += Number(val);
              obj[tempData.field] = Number(val);
            } else {
              obj[tempData.field] = 'auto';
            }
          } else {
            obj[tempData.field] = 'auto';
          }
        } else {
          obj[tempData.field] = 'auto';
        }
      }
    }

    this.dividedAvailWidthAsPercentage(obj, totalWidth);
  }

  private prepareGridHeader() {
    if (!this.exportOption.reportInfo) { return; }

    let totalWidth = 0;
    const obj = {};

    for (let i = 0, len = this.exportOption.reportInfo.rptColDTOList.length; i < len; i++) {
      const tempData = this.exportOption.reportInfo.rptColDTOList[i];
      if (tempData.isVisible) {
        if (tempData.displayTitle) {
          totalWidth += Number(tempData.columnSize);
          obj[tempData.field] = Number(tempData.columnSize);
        }
      }
    }

    this.exportColumns = this.exportOption.reportInfo.rptColDTOList
      .filter((item: any) => item.isVisible === true)
      .map((col: any) => ({ title: col.header, dataKey: col.field }));

    this.dividedAvailWidthAsPercentage(obj, totalWidth);
  }

  private headerFooterFormatting(doc, totalPages,userName) {
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      if (i === 1) {
        this.header(doc, this.exportOption.title);
      }
      this.footer(doc, i, totalPages,userName);
    }
  }

  private header(doc, title) {
    doc.setFontSize(17);
    doc.text(title, 35, 32);
  }

  // private footer(doc, pageNumber, totalPages) {
  //   const str = 'Page ' + pageNumber + ' of ' + totalPages;
  //   doc.setFontSize(7);
  //   doc.text(str, doc.internal.pageSize.width - 58, doc.internal.pageSize.height - 30); // (string, Left Margin, bottom Margin)
  // }

  private footer(doc, pageNumber, totalPages,userName) {
    doc.setFontSize(7);
    // Get current date & time
    const formattedDate = new Date().toLocaleString();
  
    // Date & Time (Left Side)
    doc.text('Printed:'+formattedDate, 10, doc.internal.pageSize.height - 30); // Adjust `10` for left alignment
    doc.text('Printed By:'+userName, 10, doc.internal.pageSize.height - 20);

    // Page Number (Right Side)
    const str = `Page ${pageNumber} of ${totalPages}`;
    doc.text(str, doc.internal.pageSize.width - 58, doc.internal.pageSize.height - 30);
    }

}
