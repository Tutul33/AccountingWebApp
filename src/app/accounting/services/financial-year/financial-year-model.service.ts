import { Injectable } from '@angular/core';
import { UtilityService } from '../../index';
import { FixedIDs, GlobalConstants, GlobalMethods } from 'src/app/shared';
import { FinancialYearDTO } from '../../models/financial-year/financial-year';

@Injectable()
export class FinancialYearModelService {

  financialYearDTO: FinancialYearDTO;
  tempFinancialYearDTO: FinancialYearDTO;
  financialYearList: any = [];
  financialYearDDList: any = [];
  financialYearFromDateDDList: any = [];
  financialYearToDateDDList: any = [];
  financialYearStatusDDList: any = [];
  yearList: any = [];
  toYearList: any = [];
  monthList: any = [];
  toMonthList: any = [];
  dateList: any = [];
  isFromDateDisabled: boolean = false;
  isFromMonthDisabled: boolean = false;

  closeFinancialYearId: number = 0;
  reopenFinancialYearId: number = 0;
  openFinancialYearList: any = [];
  closeFinancialYearList: any = [];

  isResetModalShow: boolean = false;
  isCloseModalShow: boolean = false;


  yearData = [
    { id: 5, shortYear: 22, year: 2022, yearDays: 365, status: -1 },
    { id: 6, shortYear: 23, year: 2023, yearDays: 365, status: -1 },
    { id: 7, shortYear: 24, year: 2024, yearDays: 366, status: 0 },
    { id: 8, shortYear: 25, year: 2025, yearDays: 365, status: 1 },
    { id: 9, shortYear: 26, year: 2026, yearDays: 365, status: 1 },
    { id: 10, shortYear: 27, year: 2027, yearDays: 365, status: 1 },
    { id: 11, shortYear: 28, year: 2028, yearDays: 366, status: 1 }
  ];

  monthShortNames: { [key: string]: string } = {
    January: "Jan",
    February: "Feb",
    March: "Mar",
    April: "Apr",
    May: "May",
    June: "Jun",
    July: "Jul",
    August: "Aug",
    September: "Sep",
    October: "Oct",
    November: "Nov",
    December: "Dec"
  };

  constructor(private utilitySvc: UtilityService) { }

  prepareData() {
    try {
      if (this.financialYearList.length > 0) {
        this.financialYearDTO.fromMonthID = this.financialYearList[0].toMonthID + 1;
        
        if(this.financialYearDTO.fromMonthID == 13)
        {
          this.financialYearDTO.fromMonthID = 1;
          let month = GlobalConstants.months.find(x=> x.code == this.financialYearDTO.fromMonthID).fullName;

          this.financialYearDTO.fromMonth = month;

          this.financialYearDTO.fromYearID = this.financialYearList[0].year + 1; 
          this.financialYearDTO.fromYear = this.financialYearList[0].year + 1; 
        }
        else
        {
          let month = GlobalConstants.months.find(x=> x.code == this.financialYearDTO.fromMonthID).fullName;

          this.financialYearDTO.fromMonth = month;
  
          this.financialYearDTO.fromYearID = this.financialYearList[0].year; 
          this.financialYearDTO.fromYear = this.financialYearList[0].year; 
        }

        this.isFromDateDisabled = true;
        this.isFromMonthDisabled = true;
      }
      else
      {
        this.isFromDateDisabled = false;
        this.isFromMonthDisabled = false;
      }
    } catch (error) {
      throw error;
    }
  }

  prepareEditForm(entity: any) {
    try {
      if(entity.status == FixedIDs.FinancialYearStatus.Closed || this.financialYearList.length == 1) // Enable or disable From Year for very first financial year.
      {
        this.isFromDateDisabled = false;
        this.isFromMonthDisabled = false;
      }
      else
      {
        this.isFromDateDisabled = true;
        this.isFromMonthDisabled = true;
      }

      this.financialYearDTO = new FinancialYearDTO();
      this.tempFinancialYearDTO = new FinancialYearDTO();

      this.financialYearDTO = GlobalMethods.jsonDeepCopy(entity);
      this.tempFinancialYearDTO = GlobalMethods.jsonDeepCopy(entity);
    } catch (e) {
      throw e;
    }
  }

  checkOverlap(entity: FinancialYearDTO) {
    try {
      let isOverlap = false;
      if(this.financialYearList.length > 0)
      {
        if(entity.id != this.financialYearList[0].id)
        {
          let data = this.financialYearList.find(x => x.id == entity.id);
          if(data)
          {
            if(data.fromYearID != entity.fromYearID || data.fromMonthID != entity.fromMonthID || data.toYearID != entity.toYearID || data.toMonthID != entity.toMonthID)
            {
              isOverlap = true;
            }
          }
        }
      }    
      return isOverlap;
    }
    catch (e) {
      throw e;
    }
  }

  checkDuplicate(entity: FinancialYearDTO) {
    try {
      let isDuplicate;
      
      if(entity.id == 0)
      {
        isDuplicate = this.utilitySvc.checkDuplicateEntry(this.financialYearList, entity, 'name');
      }

      if (!isDuplicate) return false;
      else return true;
    }
    catch (e) {
      throw e;
    }
  }


  deleteCollection(entity: any) {
    try {
      this.utilitySvc.deleteCollection(this.financialYearList, entity);
    } catch (e) {
      throw e;
    }
  }


  prepareFinancialYearCloseData() {
    try {
      if (this.financialYearList.length >= 1) { 

        // Manage close financial year action button
        this.openFinancialYearList = this.financialYearList.filter(entity => (entity.status == FixedIDs.FinancialYearStatus.Open || entity.status == FixedIDs.FinancialYearStatus.PartiallyOpen));
        if(this.openFinancialYearList.length >= 1)
        {
          this.closeFinancialYearId = this.openFinancialYearList[this.openFinancialYearList.length - 1].id;
        }
        else
        {
          this.closeFinancialYearId = 0;
        }

        // Manage reopen financial year action button
        this.closeFinancialYearList = this.financialYearList.filter(entity => entity.status == FixedIDs.FinancialYearStatus.Closed);
        
        if(this.closeFinancialYearList.length > 1)
        {
          this.reopenFinancialYearId = this.closeFinancialYearList[0].id;
        }
        else
        {
          this.reopenFinancialYearId = 0;
        }
      }
    } catch (error) {
      throw error;
    }
  }
}
