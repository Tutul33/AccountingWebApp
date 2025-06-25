import { Injectable } from '@angular/core';
import { ColumnType, FixedIDs, GlobalConstants } from 'src/app/app-shared';

@Injectable()
export class ChartOfAccountReportModelService {
  chartOfAccountList:any[]=[];
  companyList:any[] = [];
  officeBranchList:any[] = [];
  projectList:any[] = [];
  isSkippedControlLedger:boolean = false;
  fieldTitle:any;
  keyValuePair:any;  
  isBranchModuleActive:boolean=false;
  isProjectModuleActive:boolean=false;
  gridAccountsNatureList:any[]=[];
  gridGroupLedgerList:any[]=[];
  gridSubGroupLedgerList:any[]=[];
  gridControlLedgerList:any[]=[];
  gridLedgerList:any[]=[];
  gridSubLedgerTypeNameList:any[]=[];
  gridNoteList:any[]=[];
  gridDepreciationRateList:any[]=[];
  gridParentAssetList:any[]=[];

  constructor() {
    
   }

  gridColumns(): ColumnType[] {
         try {
          if(this.isSkippedControlLedger)
          {
            return [
              { field: "accountsNature", header: this.fieldTitle['accountsnature'], isMultiselectFilter:true, dataList: this.gridAccountsNatureList, labelField: 'AccountsNature' },
              { field: "groupLedger", header: this.fieldTitle['groupledger'], isMultiselectFilter:true, dataList: this.gridGroupLedgerList, labelField: 'GroupLedger'  },
              { field: "subGroupLedger", header: this.fieldTitle['subgroupledger'], isMultiselectFilter:true, dataList: this.gridSubGroupLedgerList, labelField: 'SubGroupLedger'  },
              { field: "ledger", header: this.fieldTitle['ledger'], isMultiselectFilter:true, dataList: this.gridLedgerList, labelField: 'Ledger'  },
              { field: "subLedgerTypeName", header: this.fieldTitle['subledger'], isMultiselectFilter:true, dataList: this.gridSubLedgerTypeNameList, labelField: 'SubLedgerTypeName'  },
              { field: "note", header: this.fieldTitle['note'] , isMultiselectFilter:true, dataList: this.gridNoteList, labelField: 'Note' },
              { field: "depreciationRate", header: this.fieldTitle['depreciationrate'] },
              { field: "parentAsset", header: this.fieldTitle['parentasset'] },
            ];
          }else{
            return [
              { field: "accountsNature", header: this.fieldTitle['accountsnature'], isMultiselectFilter:true, dataList: this.gridAccountsNatureList, labelField: 'AccountsNature' },
              { field: "groupLedger", header: this.fieldTitle['groupledger'], isMultiselectFilter:true, dataList: this.gridGroupLedgerList, labelField: 'GroupLedger'  },
              { field: "subGroupLedger", header: this.fieldTitle['subgroupledger'], isMultiselectFilter:true, dataList: this.gridSubGroupLedgerList, labelField: 'SubGroupLedger'  },
              { field: "controlLedger", header: this.fieldTitle['controlledger'], isMultiselectFilter:true, dataList: this.gridControlLedgerList, labelField: 'ControlLedger'  },
              { field: "ledger", header: this.fieldTitle['ledger'], isMultiselectFilter:true, dataList: this.gridLedgerList, labelField: 'Ledger'  },
              { field: "subLedgerTypeName", header: this.fieldTitle['subledger'], isMultiselectFilter:true, dataList: this.gridSubLedgerTypeNameList, labelField: 'SubLedgerTypeName'  },
              { field: "note", header: this.fieldTitle['note'] , isMultiselectFilter:true, dataList: this.gridNoteList, labelField: 'Note' },
              { field: "depreciationRate", header: this.fieldTitle['depreciationrate'] },
              { field: "parentAsset", header: this.fieldTitle['parentasset'] },
            ];
          }
          
         } catch (error) {
          throw error;
         }
       }
  
       prepareDDLList(){
        try {
          var ddlProperties = [];
          ddlProperties.push("AccountsNature, AccountsNature");
          ddlProperties.push("GroupLedger, GroupLedger");
          ddlProperties.push("SubGroupLedger, SubGroupLedger");
          ddlProperties.push("ControlLedger, ControlLedger");
          ddlProperties.push("Ledger, Ledger");
          ddlProperties.push("SubLedgerTypeName, SubLedgerTypeName");
          ddlProperties.push("Note, Note");
          ddlProperties.push("DepreciationRate, DepreciationRate");
          ddlProperties.push("ParentAsset, ParentAsset");
          return ddlProperties;
        } catch (e) {
          throw e;
        }
      }     
      

      prepareGridDDLList(data:any){
        try {
        this.gridAccountsNatureList = data[0];
        this.gridGroupLedgerList = data[1];
        this.gridSubGroupLedgerList = data[2];
        this.gridControlLedgerList = data[3];
        this.gridLedgerList = data[4];
        this.gridSubLedgerTypeNameList = data[5];
        this.gridNoteList = data[6];
        this.gridDepreciationRateList = data[7];
        this.gridParentAssetList = data[8];
        } catch (e) {
          throw e;
        }
      }

      prepareChartOfAccountReportsList(data:any){
        try {
          if(this.isSkippedControlLedger){
            let exceptControlLedger = data.map(({ controlLedger, ...rest }) => rest);
            this.chartOfAccountList = exceptControlLedger;
          }else{
            this.chartOfAccountList = data;
          }
         
        } catch (error) {
          throw error;
        }
       }      

      prepareSearchParams(filters: any[]){
        try {
          let searchParams = [];
         
          let accountsNature = filters["accountsNature"][0].value;
          let groupLedger = filters["groupLedger"][0].value;
          let subGroupLedger = filters["subGroupLedger"][0].value;
          let controlLedger = filters["controlLedger"][0].value;
          let ledger = filters["ledger"][0].value;
          let subLedgerTypeName = filters["subLedgerTypeName"][0].value;
          let note = filters["note"][0].value;

          if(accountsNature)searchParams.push(this.keyValuePair("accountsNature", accountsNature || null));
          if(groupLedger)searchParams.push(this.keyValuePair("groupLedger", groupLedger || null));
          if(subGroupLedger)searchParams.push(this.keyValuePair("subGroupLedger", subGroupLedger || null));
          if(controlLedger)searchParams.push(this.keyValuePair("controlLedger", controlLedger || null));
          if(ledger)searchParams.push(this.keyValuePair("ledger", ledger || null));
          if(subLedgerTypeName)searchParams.push(this.keyValuePair("subLedgerTypeName", subLedgerTypeName || null));
          if(note)searchParams.push(this.keyValuePair("note", note || null));
    
          return searchParams;
        } catch (e) {
          throw e;
        }
      }

      prepareReportHeaderList() {
       try {
        if(this.isSkippedControlLedger)
          {
        return [
          { field: "accountsNature", header: this.fieldTitle['accountsnature'] },
          { field: "groupLedger", header: this.fieldTitle['groupledger'] },
          { field: "subGroupLedger", header: this.fieldTitle['subgroupledger'] },
          { field: "ledger", header: this.fieldTitle['ledger'] },
          { field: "subLedgerTypeName", header: this.fieldTitle['subledger'] },
          { field: "note", header: this.fieldTitle['note'] },
          { field: "depreciationRate", header: this.fieldTitle['depreciationrate'] },
          { field: "parentAsset", header: this.fieldTitle['parentasset'] }
       ];
      }else{
        return [
          { field: "accountsNature", header: this.fieldTitle['accountsnature'] },
          { field: "groupLedger", header: this.fieldTitle['groupledger'] },
          { field: "subGroupLedger", header: this.fieldTitle['subgroupledger'] },
          { field: "controlLedger", header: this.fieldTitle['controlledger'] },
          { field: "ledger", header: this.fieldTitle['ledger'] },
          { field: "subLedgerTypeName", header: this.fieldTitle['subledger'] },
          { field: "note", header: this.fieldTitle['note'] },
          { field: "depreciationRate", header: this.fieldTitle['depreciationrate'] },
          { field: "parentAsset", header: this.fieldTitle['parentasset'] }
       ];
      }
       
       } catch (error) {
        throw error;
       }
      }

      prepareOfficeBranchUnit(data: any) {
          try {
            let categories = [
              {
                label: "-- Office --",
                value: "Office",
                items: [],
              },
              {
                label: "-- Branch --",
                value: "Branch",
                items: [],
              },
      
              {
                label: "-- Unit --",
                value: "Unit",
                items: [],
              }
            ];
      
            data.forEach((item) => {
              if (item.organizationElementID == FixedIDs.orgType.Office) {// office
                let catObj = categories.find((x) => x.value == "Office");
                if (catObj) {
                  catObj.items.push(item);
                }
              } else if (item.organizationElementID == FixedIDs.orgType.Branch) {// Branch
                let catObj = categories.find((x) => x.value == "Branch");
                if (catObj) {
                  catObj.items.push(item);
                }
              }
              else if (item.organizationElementID == FixedIDs.orgType.Unit) {// Unit
                let catObj = categories.find((x) => x.value == "Unit");
                if (catObj) {
                  catObj.items.push(item);
                }
              }
            });
            return categories;
          } catch (error) {
            throw error;
          }
        }

        prepareChartOfAccountReportsExportData(data:any){
          try {
            if(this.isSkippedControlLedger){
              return data.map(({ controlLedger, ...rest }) => rest);
            }else{
              return data;
            }
           
          } catch (error) {
            throw error;
          }
         }   
}
