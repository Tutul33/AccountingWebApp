import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FixedIDs, GlobalConstants } from 'src/app/app-shared';

@Injectable()
export class IncomeStatementModelService {
  searchFilterForm:UntypedFormGroup;
  companyList:any[]=[];
  projectList:any[]=[];
  officeBrachUnitList:any[]=[];
  officeBrachUnitRawList:any[]=[];
  incomeList:any[]=[];
  expenseList:any[]=[];
  profitLossList:any[]=[];
  financialYearList:any[]=[];
  isSkippedControlLedger:any;
  tempIncomeStatement:any;
  totalIncome:number=0;
  totalExpense:number=0;
  netProfitOrLoss:number=0;
  isProjectModuleActive:boolean=false;
  isBranchModuleActive:boolean=false;
  fieldTitle:any;
  maxDate:any;
  searchParam:any={
    projectID:null,
    projectName:'',  
    orgID:null,
    orgName:'',
    companyID:0,
    company:'', 
    financialYearID:null,  
    financialYear:'', 
    financialMaxDate:null, 
    dateFinYearRange:true,
    dateCustomRange:false,
    checkBoxList:[
      {sl:1,isShow:true,isSkip:false,type:'AccountNature',name:'Account Nature'},
      {sl:2,isShow:true,isSkip:false,type:'GroupLedger',name:'Group Ledger'},
      {sl:3,isShow:true,isSkip:false,type:'SubGroupLedger',name:'Sub Group Ledger'},
      {sl:4,isShow:true,isSkip:false,type:'ControlLedger',name:'Control Ledger'},
    ],
    fromDate:null,
    toDate:null,
    resultType:"1",
    currency:GlobalConstants.companyInfo.currency
  };

  constructor() { }

  prepareOrgList(res){
    try {
      let orgList = [
        {
          label: "-- Office --",
          value: "office",
          items: [],
        },
        {
          label: "-- Branch --",
          value: "branch",
          items: [],
        },
        {
          label: "-- Unit --",
          value: "unit",
          items: [],
        },
      ];
      res.forEach((item) => {
        if (item.value == "Office") {
          //3 Office
          let objOffice = orgList.find((x) => x.value == "office");
          if (objOffice) {
            objOffice.items.push(item);
          }
        } else if (item.value == "Branch") {
          //4 Branch
          let objBranch = orgList.find((x) => x.value == "branch");
          if (objBranch) {
            objBranch.items.push(item);
          }
        }
         else if (item.value == "Unit") {
          //4 Branch
          let objBranch = orgList.find((x) => x.value == "unit");
          if (objBranch) {
            objBranch.items.push(item);
          }
        }
      });
      this.officeBrachUnitList = orgList || [];     

    } catch (error) {
      throw error;
    }
  }
  
  getMax_And_LessThanMax(){
    try {

        // Filter the list where isShow is true
        const filteredList = this.searchParam.checkBoxList.filter(item => item.isShow);

        // Find the corresponding item with `sl = maxSl - 1` and `isShow = true`
        const smallFromMax = filteredList.length>1?filteredList[filteredList.length-2]:filteredList[filteredList.length-1];
        const max = filteredList[filteredList.length-1];
        // Return the result if found, otherwise return null
        return {
          smallFromMax:smallFromMax ? smallFromMax : null,
          max:max ? max : null
        };
    
    } catch (error) {
      throw error;
    }
  }
  
  prepareIncomeStatement(data){
    try {
      this.incomeList=[];
      this.expenseList=[];
      this.totalIncome=0;
      this.totalExpense=0;
      const incomeList=data.filter(x=>x.accountNatureCd==FixedIDs.accountingNature.Income);
      const expenseList=data.filter(x=>x.accountNatureCd==FixedIDs.accountingNature.Expenses);

      if(incomeList.length)
        this.prepareIncomeReportsList(incomeList);

      if(expenseList.length)
        this.prepareExpenseReportsList(expenseList);

      this.netProfitOrLoss=data.length?data[0].netProfitLoss:0;
      this.profitLossList=[];
      this.profitLossList.push({totalProfitLoss:this.netProfitOrLoss});
    } catch (error) {
      throw error;
    }
  }

  prepareIncomeReportsList(data){
    try {
      let showLedgerObj=this.getMax_And_LessThanMax();

      let showSubTotaLevel=showLedgerObj?.smallFromMax?.type;
      let showTopLevel=showLedgerObj?.max?.type;

      const showAccountNature=this.searchParam.checkBoxList[0].isShow;
      const showGroupLedger=this.searchParam.checkBoxList[1].isShow;
      const showSubGroupLedger=this.searchParam.checkBoxList[2].isShow;
      const showControlLedger=this.isSkippedControlLedger?false:this.searchParam.checkBoxList[3].isShow;
      // const isSkippedControlLedger=this.searchParam.checkBoxList[3].isSkip;

      const AccountNatureType=this.searchParam.checkBoxList[0].type;
      const GroupLedgerType=this.searchParam.checkBoxList[1].type;
      const SubGroupLedgerType=this.searchParam.checkBoxList[2].type;
      const ControlLedgerType=this.isSkippedControlLedger?'':this.searchParam.checkBoxList[3].type;

      this.incomeList=[];
      let accountsNatureData= data.reduce((unique, item) => {
        if (!unique.includes(item.accountsNature)) {
          unique.push(item.accountsNature);
        }
        return unique;
      }, []);
    
      let accountNatureCd='';

      accountsNatureData.forEach((accountsNature)=>{

        let accountsNatureList=data.filter(x=>x.accountsNature==accountsNature);

        const accountsNatureObj=accountsNatureList[0];
        accountNatureCd=accountsNatureObj.accountNatureCd;
        if(showAccountNature)
        {
          this.incomeList.push({
            accountNatureCd:accountNatureCd,
            ledgerName:accountsNatureObj.accountsNature,
            amount:showTopLevel==AccountNatureType?accountsNatureObj.totalAmountAN:null
           });
        }

        let groupLedgerData= accountsNatureList.reduce((unique, item) => {
          if (!unique.includes(item.groupLedger)) {
            unique.push(item.groupLedger);
          }
          return unique;
        }, []);

        groupLedgerData.forEach((groupLedger)=>{
          let groupLedgerList=accountsNatureList.filter(x=>x.groupLedger==groupLedger);

          const groupLedgerObj=groupLedgerList[0];
          if(showGroupLedger)
            {
          this.incomeList.push({
            accountNatureCd:accountNatureCd,
          ledgerName:groupLedgerObj.groupLedger,
          amount:showTopLevel==GroupLedgerType?groupLedgerObj.totalAmountGL:null
         });
        }

          let subGroupLedgerData= groupLedgerList.reduce((unique, item) => {
            if (!unique.includes(item.subGroupLedger)) {
              unique.push(item.subGroupLedger);
            }
            return unique;
          }, []);    
          
          subGroupLedgerData.forEach((subGroupLedger)=>{
            let subGroupLedgerList=groupLedgerList.filter(x=>x.subGroupLedger==subGroupLedger);
  
            const subGroupLedgerObj=subGroupLedgerList[0];
            if(showSubGroupLedger)
              {
            this.incomeList.push({
              accountNatureCd:accountNatureCd,
             ledgerName:subGroupLedgerObj.subGroupLedger,
             amount:showTopLevel==SubGroupLedgerType?subGroupLedgerObj.totalAmountSGL:null
            });
          }

            if(!this.isSkippedControlLedger){
              let controlLedgerData= subGroupLedgerList.reduce((unique, item) => {
                if (!unique.includes(item.controlLedger)) {
                  unique.push(item.controlLedger);
                }
                return unique;
              }, []);     
              
              if(controlLedgerData.length){
              controlLedgerData.forEach((controlLedger)=>{
                let controlLedgerList=subGroupLedgerList.filter(x=>x.controlLedger==controlLedger);
      
                const controlLedgerObj=controlLedgerList[0];
                if(showControlLedger)
                  {
                 this.incomeList.push({
                  accountNatureCd:accountNatureCd,
                  ledgerName:controlLedgerObj.controlLedger,
                  amount:showTopLevel==ControlLedgerType?controlLedgerObj.totalAmountCL:null
                 });
                }
                
                if(showSubTotaLevel==ControlLedgerType)
                  {
                 this.incomeList.push({
                  accountNatureCd:accountNatureCd,
                  ledgerName:"",
                  amount:controlLedgerObj.totalAmountCL,
                  isSubTotal:true
                 });
                }
              });
              }
             
            } else{
              
              if(showSubTotaLevel==ControlLedgerType){
              this.incomeList.push({
                accountNatureCd:accountNatureCd,
                ledgerName:"",
                amount:null,
                isSubTotal:true
               });
              }
            }
          
            // if(showSubTotaLevel==SubGroupLedgerType)
            //   {
            // this.incomeList.push({
            //   accountNatureCd:accountNatureCd,
            //  ledgerName:"",
            //  amount:showSubTotaLevel==SubGroupLedgerType?subGroupLedgerObj.totalAmountSGL:null,
            //  isSubTotal:true
            // });
            // }

          });

        //   if(showSubTotaLevel==GroupLedgerType)
        //     {
        //   this.incomeList.push({
        //     accountNatureCd:accountNatureCd,
        //   ledgerName:"",
        //   amount:groupLedgerObj.totalAmountGL,
        //   isSubTotal:true
        //  });
        // }

        });

        // if(showSubTotaLevel==AccountNatureType && showSubTotaLevel!=showTopLevel){
        //   this.incomeList.push({
        //     accountNatureCd:accountNatureCd,
        //     ledgerName:"",
        //     amount:accountsNatureObj.totalAmountAN,
        //     isSubTotal:true
        //    });
        // }
      });

      
      this.totalIncome=data.length?data[0].totalIncome:0;
      
      this.incomeList.push({
        accountNatureCd:accountNatureCd,
        ledgerName:this.fieldTitle['total'],
        amount:this.totalIncome,
        isSubTotal:true
       });
    } catch (error) {
      throw error;
    }
  }

  prepareExpenseReportsList(data){
    try {
      let showLedgerObj=this.getMax_And_LessThanMax();

      let showSubTotaLevel=showLedgerObj?.smallFromMax?.type;
      let showTopLevel=showLedgerObj?.max?.type;

      const showAccountNature=this.searchParam.checkBoxList[0].isShow;
      const showGroupLedger=this.searchParam.checkBoxList[1].isShow;
      const showSubGroupLedger=this.searchParam.checkBoxList[2].isShow;

      const showControlLedger=this.isSkippedControlLedger?false:this.searchParam.checkBoxList[3].isShow;
      //const isSkippedControlLedger=this.searchParam.checkBoxList[3].isSkip;
      const AccountNatureType=this.searchParam.checkBoxList[0].type;
      const GroupLedgerType=this.searchParam.checkBoxList[1].type;
      const SubGroupLedgerType=this.searchParam.checkBoxList[2].type;

      const ControlLedgerType=this.isSkippedControlLedger?'':this.searchParam.checkBoxList[3].type;

      this.expenseList=[];
      let accountsNatureData= data.reduce((unique, item) => {
        if (!unique.includes(item.accountsNature)) {
          unique.push(item.accountsNature);
        }
        return unique;
      }, []);
      
      let accountNatureCd='';
      accountsNatureData.forEach((accountsNature)=>{

        let accountsNatureList=data.filter(x=>x.accountsNature==accountsNature);

        const accountsNatureObj=accountsNatureList[0];
        accountNatureCd=accountsNatureObj.accountNatureCd;
        if(showAccountNature)
        {
          this.expenseList.push({
            accountNatureCd:accountNatureCd,
            ledgerName:accountsNatureObj.accountsNature,
            amount:showTopLevel==AccountNatureType?accountsNatureObj.totalAmountAN:null
           });
        }

        let groupLedgerData= accountsNatureList.reduce((unique, item) => {
          if (!unique.includes(item.groupLedger)) {
            unique.push(item.groupLedger);
          }
          return unique;
        }, []);

        groupLedgerData.forEach((groupLedger)=>{
          let groupLedgerList=accountsNatureList.filter(x=>x.groupLedger==groupLedger);

          const groupLedgerObj=groupLedgerList[0];
          if(showGroupLedger)
            {
          this.expenseList.push({
            accountNatureCd:accountNatureCd,
          ledgerName:groupLedgerObj.groupLedger,
          amount:showTopLevel==GroupLedgerType?groupLedgerObj.totalAmountGL:null
         });
        }

          let subGroupLedgerData= groupLedgerList.reduce((unique, item) => {
            if (!unique.includes(item.subGroupLedger)) {
              unique.push(item.subGroupLedger);
            }
            return unique;
          }, []);    
          
          subGroupLedgerData.forEach((subGroupLedger)=>{
            let subGroupLedgerList=groupLedgerList.filter(x=>x.subGroupLedger==subGroupLedger);
  
            const subGroupLedgerObj=subGroupLedgerList[0];
            if(showSubGroupLedger)
              {
            this.expenseList.push({
              accountNatureCd:accountNatureCd,
             ledgerName:subGroupLedgerObj.subGroupLedger,
             amount:showTopLevel==SubGroupLedgerType?subGroupLedgerObj.totalAmountSGL:null
            });
          }

            if(!this.isSkippedControlLedger){
              let controlLedgerData= subGroupLedgerList.reduce((unique, item) => {
                if (!unique.includes(item.controlLedger)) {
                  unique.push(item.controlLedger);
                }
                return unique;
              }, []);     
              
              if(controlLedgerData.length){
              controlLedgerData.forEach((controlLedger)=>{
                let controlLedgerList=subGroupLedgerList.filter(x=>x.controlLedger==controlLedger);
      
                const controlLedgerObj=controlLedgerList[0];
                if(showControlLedger)
                  {
                 this.expenseList.push({
                  accountNatureCd:accountNatureCd,
                  ledgerName:controlLedgerObj.controlLedger,
                  amount:showTopLevel==ControlLedgerType?controlLedgerObj.totalAmountCL:null
                 });
                }
                
                if(showSubTotaLevel==ControlLedgerType)
                  {
                 this.expenseList.push({
                  accountNatureCd:accountNatureCd,
                  ledgerName:"",
                  amount:controlLedgerObj.totalAmountCL,
                  isSubTotal:true
                 });
                }
              });
              }
             
            } else{
              
              if(showSubTotaLevel==ControlLedgerType){
              this.expenseList.push({
                accountNatureCd:accountNatureCd,
                ledgerName:"",
                amount:null,
                isSubTotal:true
               });
              }
            }
          
            // if(showSubTotaLevel==SubGroupLedgerType)
            //   {
            // this.expenseList.push({
            //   accountNatureCd:accountNatureCd,
            //  ledgerName:"",
            //  amount:showSubTotaLevel==SubGroupLedgerType?subGroupLedgerObj.totalAmountSGL:null,
            //  isSubTotal:true
            // });
            // }

          });

        //   if(showSubTotaLevel==GroupLedgerType)
        //     {
        //   this.expenseList.push({
        //     accountNatureCd:accountNatureCd,
        //   ledgerName:"",
        //   amount:groupLedgerObj.totalAmountGL,
        //   isSubTotal:true
        //  });
        // }

        });

        // if(showSubTotaLevel==AccountNatureType && showSubTotaLevel!=showTopLevel){
        //   this.expenseList.push({
        //     accountNatureCd:accountNatureCd,
        //     ledgerName:"",
        //     amount:accountsNatureObj.totalAmountAN,
        //     isSubTotal:true
        //    });
        // }
      });

      this.totalExpense=data.length?data[0].totalExpense:0;
      this.expenseList.push({
        accountNatureCd:accountNatureCd,
        ledgerName:this.fieldTitle['total'],
        amount:this.totalExpense,
        isSubTotal:true
       });
    } catch (error) {
      throw error;
    }
  }

  ledgerList:any=[
    {sl:1,isShow:true,isSkip:false,type:'AccountNature',name:'Account Nature'},
    {sl:2,isShow:true,isSkip:false,type:'GroupLedger',name:'Group Ledger'},
    {sl:3,isShow:true,isSkip:false,type:'SubGroupLedger',name:'Sub Group Ledger'},
    {sl:4,isShow:true,isSkip:false,type:'ControlLedger',name:'Control Ledger'},
  ];
  
  setNewSearch(){ 
    try {
        const ledgerList=this.isSkippedControlLedger?this.ledgerList.filter(x=>x.sl!=4):this.ledgerList;
         this.searchParam = {
             companyID : GlobalConstants.userInfo.companyID,
             company: GlobalConstants.userInfo.company,
             projectID:null,
             projectName:'',  
             orgID:null,
             orgName:'',
             financialYearID:null,
             financialYear:"",   
             financialMaxDate:null,
             checkBoxList:ledgerList,
             dateFinYearRange:true,
             dateCustomRange:false,
             fromDate:null,
             toDate:null,
             resultType:"1",
             currency:GlobalConstants.companyInfo.currency
           };
          
         this.setDefaultExpenseList();
         this.setDefaultIncomeList();
         this.setDefaultNetProfitLossList();
    } catch (error) {
      throw error;
    }  
  }

  setDefaultIncomeList(){
    try {
      this.incomeList=[];
      this.incomeList.push({
        ledgerName:this.fieldTitle['total'],
        amount:0,
        isSubTotal:true
       });
    } catch (error) {
      throw error;
    }
  }

  setDefaultExpenseList(){
    try {
      this.expenseList=[];
      this.expenseList.push({
        ledgerName:this.fieldTitle['total'],
        amount:0,
        isSubTotal:true
       });
    } catch (error) {
      throw error;
    }
  }

  setDefaultNetProfitLossList(){
    try {
      this.profitLossList=[];
      this.profitLossList.push({
        totalProfitLoss:0
       });
    } catch (error) {
      throw error;
    }
  }

  prepareDateRange(){
    try {
      const financialYear =this.financialYearList.find(x=>x.id==this.searchParam.financialYearID);
      
      if(financialYear){
        this.searchParam.fromDate=new Date(financialYear.fromDate);
        this.searchParam.toDate=new Date(financialYear.toDate);          
        this.searchParam.financialMaxDate = new Date(financialYear.toDate);  
       }
    } catch (error) {
      throw error;
    }
  }

  formatDate(date) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).replace(/ /g, '-'); // Replaces spaces with hyphens
  }
  
  getRptParameter() {
    try {
      let OrgBranchProject='';
      if(this.searchParam.orgID)
       {
        OrgBranchProject=this.officeBrachUnitRawList.find(x=>x.id==this.searchParam.orgID)?.name;
       }

      if(this.searchParam.projectID)
        OrgBranchProject=this.projectList.find(x=>x.id==this.searchParam.projectID)?.name;

      if(this.searchParam.orgID && this.searchParam.projectID){
        OrgBranchProject=this.officeBrachUnitRawList.find(x=>x.id==this.searchParam.orgID)?.name+'\n'+this.projectList.find(x=>x.id==this.searchParam.projectID)?.name;
      }
      const concatenatedAcctNames = this.searchParam.checkBoxList.filter(x=>this.isSkippedControlLedger?x.type='ControlLedger':true && x.isShow).map(item => item.name).join(', ');
      let dateRange ='';
      if(this.searchParam.fromDate && this.searchParam.toDate){
        dateRange= `${this.formatDate(this.searchParam.fromDate)} - ${this.formatDate(this.searchParam.toDate)}`; 
      }else if(this.searchParam.dateRange[0]){
        dateRange= `${this.formatDate(this.searchParam.fromDate)} - ${this.formatDate(this.searchParam.toDate)}`; 
      }else{
        dateRange='';
      }
      var params = [
        {
          key: "CompanyLogoUrl",
          value: GlobalConstants.companyInfo.companyLogoUrl,
        },
        {
          key: "Currency",
          value: GlobalConstants.companyInfo.currency
        },
        {
          key: "CompanyName",
          value: this.searchParam.company || ''
        },
        {
          key: "CompanyShortAddress",
          value: this.tempIncomeStatement[0].companyShortAddress
        },
        {
          key: "ReportName",
          value: 'Income Statement'
        },
        {
          key: "OrgBranchProject",
          value: OrgBranchProject || ''
        },
        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        },
        {
          key: "AccountNames",
          value: concatenatedAcctNames.length?'('+concatenatedAcctNames+')':''
        },
        {
          key: "DateRange",
          value: dateRange
        }
      ];
      return params;
    } catch (e) {
      throw e;
    }
  }

  getColumnHeader() {
    try {
      var columns = [
        { key: 'LedgerName', value: 'Particulars' },
        { key: 'Amount', value: 'Amount (BDT)' }
      ];      
      return columns;
    } catch (e) {
      throw e;
    }
  }
}
