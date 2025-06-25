import { Injectable } from '@angular/core';
import { GlobalConstants, GlobalMethods } from 'src/app/app-shared';

@Injectable()
export class TrialBalanceModelService {
  companyList:any[]=[];
  projectList:any[]=[];
  officeBrachUnitList:any[]=[];
  officeBrachUnitRawList:any[]=[];
  trialBalanceList:any[]=[];
  tempTrialBalance:any;
  isSkippedControlLedger:any;
  isProjectModuleActive:boolean=false;
  isBranchModuleActive:boolean=false;
  totalTransactionalDebitVal:number=0;
  totalTransactionalCreditVal:number=0;
  totalTransactionalBalance:number=0;
  totalClosingBalanceDebit:number=0;
  totalClosingBalanceCredit:number=0;
  totalOpeningBalanceDebit:number=0;
  totalOpeningBalanceCredit:number=0;
  allLedgerList:any=[
    {sl:1,isShow:true,isSkip:false,type:'AccountNature',name:'Account Nature'},
    {sl:2,isShow:true,isSkip:false,type:'GroupLedger',name:'Group Ledger'},
    {sl:3,isShow:true,isSkip:false,type:'SubGroupLedger',name:'Sub Group Ledger'},
    {sl:4,isShow:true,isSkip:false,type:'ControlLedger',name:'Control Ledger'},
    {sl:5,isShow:true,isSkip:false,type:'Ledger',name:'Ledger'},
    
  ];
  maxDate:any;
  //{sl:6,isShow:true,isSkip:false,type:'SubLedger',name:'Sub Ledger'},
  searchParam:any={
    projectID:null,
    projectName:'',  
    orgID:null,
    orgName:'',
    companyID:0,
    company:'',    
    checkBoxList:[],
    fromDate:null,
    toDate:null
  };

  constructor() { }

  setNewSearch(){
    try {
      let ledgerList=this.isSkippedControlLedger?this.allLedgerList.filter(x=>x.sl!=4):this.allLedgerList;
      this.searchParam={
              projectID:null,
              projectName:'',
              orgID:null,
              orgName:'',
              companyID:GlobalConstants.userInfo.companyID,
              company:'', 
              checkBoxList:ledgerList,
              fromDate:null,
              toDate:null
            };
    } catch (error) {
      throw error;
    }
  }
  
  setDefaultTrialBalance(){
    try {      
       this.totalOpeningBalanceDebit=0;
       this.totalOpeningBalanceCredit=0;
       this.totalTransactionalDebitVal=0;
       this.totalTransactionalCreditVal=0;
       this.totalTransactionalBalance=0;
       this.totalClosingBalanceDebit=0;
       this.totalClosingBalanceCredit=0;
    } catch (error) {
      throw error;
    }
  }

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

  prepareTrialBalanceReportsListSubLedger(data){
    try {
      const { smallFromMax, max }=this.getMax_And_LessThanMax();

      const showSubTotaLevel = smallFromMax?.type;
      const showTopLevel = max?.type;

      const showAccountNature=this.searchParam.checkBoxList[0].isShow;
      const showGroupLedger=this.searchParam.checkBoxList[1].isShow;
      const showSubGroupLedger=this.searchParam.checkBoxList[2].isShow;
      const showControlLedger=this.isSkippedControlLedger?false:this.searchParam.checkBoxList[3].isShow;

      const showLedger=this.isSkippedControlLedger?this.searchParam.checkBoxList[3].isShow:this.searchParam.checkBoxList[4].isShow;
      const showSubLedgerDetail=this.isSkippedControlLedger?this.searchParam.checkBoxList[4].isShow:this.searchParam.checkBoxList[5].isShow;

      this.trialBalanceList=[];
      // let accountsNatureData= data.reduce((unique, item) => {
      //   if (!unique.includes(item.accountsNature)) {
      //     unique.push(item.accountsNature);
      //   }
      //   return unique;
      // }, []);
      const accountsNatureData = [...new Set(data.map(item => item.accountsNature))];
    
      accountsNatureData.forEach((accountsNature)=>{

        let accountsNatureList=data.filter(x=>x.accountsNature==accountsNature);

        const accountsNatureObj=accountsNatureList[0];
        if(showAccountNature)
        {
           this.pushToTrialBalanceList({
            ledgerName:accountsNatureObj.accountsNature,
            openingBalanceDebit:showTopLevel=="AccountNature"?accountsNatureObj.totalOpeningBalanceDebitAN:null,
            openingBalanceCredit:showTopLevel=="AccountNature"?accountsNatureObj.totalOpeningBalanceCreditAN:null,
            transactionalDebitVal:showTopLevel=="AccountNature"?accountsNatureObj.totalTransactionalDebitValAN:null,
            transactionalCreditVal:showTopLevel=="AccountNature"?accountsNatureObj.totalTransactionalCreditValAN:null, 
            transactionalBalance:showTopLevel=="AccountNature"?accountsNatureObj.totalTransactionalBalanceAN:null,
            closingBalanceDebit:showTopLevel=="AccountNature"?accountsNatureObj.totalClosingBalanceDebitAN:null,
            closingBalanceCredit:showTopLevel=="AccountNature"?accountsNatureObj.totalClosingBalanceCreditAN:null,
           });
        }

        const groupLedgerData = [...new Set(accountsNatureList.map(item => item.groupLedger))];

        groupLedgerData.forEach((groupLedger)=>{
          let groupLedgerList=accountsNatureList.filter(x=>x.groupLedger==groupLedger);

          const groupLedgerObj=groupLedgerList[0];
          if(showGroupLedger)
            {
         this.pushToTrialBalanceList({
          ledgerName:groupLedgerObj.groupLedger,
          openingBalanceDebit:showTopLevel=="GroupLedger"?groupLedgerObj.totalOpeningBalanceDebitGL:null,
          openingBalanceCredit:showTopLevel=="GroupLedger"?groupLedgerObj.totalOpeningBalanceCreditGL:null,
          transactionalDebitVal:showTopLevel=="GroupLedger"?groupLedgerObj.totalTransactionalDebitValGL:null,
          transactionalCreditVal:showTopLevel=="GroupLedger"?groupLedgerObj.totalTransactionalCreditValGL:null, 
          transactionalBalance:showTopLevel=="GroupLedger"?groupLedgerObj.totalTransactionalBalanceGL:null,
          closingBalanceDebit:showTopLevel=="GroupLedger"?groupLedgerObj.totalClosingBalanceDebitGL:null,
          closingBalanceCredit:showTopLevel=="GroupLedger"?groupLedgerObj.totalClosingBalanceCreditGL:null,
         });
        }

          const subGroupLedgerData = [...new Set(groupLedgerList.map(item => item.subGroupLedger))];    
          
          subGroupLedgerData.forEach((subGroupLedger)=>{
            let subGroupLedgerList=groupLedgerList.filter(x=>x.subGroupLedger==subGroupLedger);
  
            const subGroupLedgerObj=subGroupLedgerList[0];
            if(showSubGroupLedger)
              {
            this.pushToTrialBalanceList({
              ledgerName:subGroupLedgerObj.subGroupLedger,
              openingBalanceDebit:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalOpeningBalanceDebitSGL:null,
              openingBalanceCredit:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalOpeningBalanceCreditSGL:null,
              transactionalDebitVal:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalTransactionalDebitValSGL:null,
              transactionalCreditVal:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalTransactionalCreditValSGL:null, 
              transactionalBalance:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalTransactionalBalanceSGL:null,
              closingBalanceDebit:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalClosingBalanceDebitSGL:null,
              closingBalanceCredit:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalClosingBalanceCreditSGL:null,
             });
          }

            if(!this.isSkippedControlLedger){
              const controlLedgerData = [...new Set(subGroupLedgerList.map(item => item.controlLedger))];               
              
              if(controlLedgerData.length){
              controlLedgerData.forEach((controlLedger)=>{
                let controlLedgerList=subGroupLedgerList.filter(x=>x.controlLedger==controlLedger);
      
                const controlLedgerObj=controlLedgerList[0];
                if(showControlLedger)
                  {
                 this.pushToTrialBalanceList({
                  ledgerName:controlLedgerObj.controlLedger,
                  openingBalanceDebit:showTopLevel=="ControlLedger"?controlLedgerObj.totalOpeningBalanceDebitCL:null,
                  openingBalanceCredit:showTopLevel=="ControlLedger"?controlLedgerObj.totalOpeningBalanceCreditCL:null,
                  transactionalDebitVal:showTopLevel=="ControlLedger"?controlLedgerObj.totalTransactionalDebitValCL:null,
                  transactionalCreditVal:showTopLevel=="ControlLedger"?controlLedgerObj.totalTransactionalCreditValCL:null, 
                  transactionalBalance:showTopLevel=="ControlLedger"?controlLedgerObj.totalTransactionalBalanceCL:null,
                  closingBalanceDebit:showTopLevel=="ControlLedger"?controlLedgerObj.totalClosingBalanceDebitCL:null,
                  closingBalanceCredit:showTopLevel=="ControlLedger"?controlLedgerObj.totalClosingBalanceCreditCL:null,
                 });
                }
                //push ledger
                const ledgerList=controlLedgerList.filter(x=>x.controlLedger==controlLedger);
                const ledgerData = [...new Set(ledgerList.map(item => item.ledger))];
                ledgerData.forEach((ledger)=>{
                  const ledgerObj=ledgerList.find(x=>x.ledger==ledger);
                  if(showLedger)
                    { 
                       this.pushToTrialBalanceList({
                        ledgerName:ledgerObj.ledger,
                        openingBalanceDebit:ledgerObj.openingBalanceDebit,
                        openingBalanceCredit:ledgerObj.openingBalanceCredit,
                        transactionalDebitVal:ledgerObj.transactionalDebitVal,
                        transactionalCreditVal:ledgerObj.transactionalCreditVal, 
                        transactionalBalance:ledgerObj.transactionalBalance,
                        closingBalanceDebit:ledgerObj.closingBalanceDebit,
                        closingBalanceCredit:ledgerObj.closingBalanceCredit,
                        isSubTotal:false
                       });
                  }
                  if(showSubLedgerDetail){
                    const subLedgerDetailData = [...new Set(ledgerList.filter(x=>x.ledger==ledger).map(item => item.subLedgerDetailName).filter(name => name !== null && name !== undefined))];          
                    
                    if(subLedgerDetailData.length){
                      subLedgerDetailData.forEach((subLedgerDetailName)=>{                            
                        const subLedgerDetailObj=ledgerList.find(x=>x.ledger==ledger && x.subLedgerDetailName==subLedgerDetailName);
                        if(subLedgerDetailObj){
                          this.pushToTrialBalanceList({
                            ledgerName:subLedgerDetailObj.subLedgerDetailName,
                            openingBalanceDebit:subLedgerDetailObj.openingBalanceDebit,
                            openingBalanceCredit:subLedgerDetailObj.openingBalanceCredit,
                            transactionalDebitVal:subLedgerDetailObj.transactionalDebitVal,
                            transactionalCreditVal:subLedgerDetailObj.transactionalCreditVal, 
                            transactionalBalance:subLedgerDetailObj.transactionalBalance,
                            closingBalanceDebit:subLedgerDetailObj.closingBalanceDebit,
                            closingBalanceCredit:subLedgerDetailObj.closingBalanceCredit,
                            isSubTotal:false
                           });
                        }
                      });
                      if(showSubTotaLevel=='Ledger')
                        {
                       this.pushToTrialBalanceList({
                        ledgerName:"",
                        openingBalanceDebit:null,
                        openingBalanceCredit:null,
                        transactionalDebitVal:ledgerObj.totalTransactionalDebitValLG,
                        transactionalCreditVal:ledgerObj.totalTransactionalCreditValLG, 
                        transactionalBalance:ledgerObj.totalTransactionalBalanceLG,
                        closingBalanceDebit:ledgerObj.totalClosingBalanceDebitLG,
                        closingBalanceCredit:ledgerObj.totalClosingBalanceCreditLG,
                        isSubTotal:true
                       });
                      }
                    }

                  }else{
                    if(showSubTotaLevel=='ControlLedger')
                      {
                     this.pushToTrialBalanceList({
                      ledgerName:"",
                      openingBalanceDebit:null,
                      openingBalanceCredit:null,
                      transactionalDebitVal:controlLedgerObj.totalTransactionalDebitValCL,
                      transactionalCreditVal:controlLedgerObj.totalTransactionalCreditValCL, 
                      transactionalBalance:controlLedgerObj.totalTransactionalBalanceCL,
                      closingBalanceDebit:controlLedgerObj.totalClosingBalanceDebitCL,
                      closingBalanceCredit:controlLedgerObj.totalClosingBalanceCreditCL,
                      isSubTotal:true
                     });
                    }
                  }
                });

                
              });
              }
             
            } else{
              const ledgerList=subGroupLedgerList.filter(x=>x.subGroupLedger==subGroupLedgerObj.subGroupLedger);
              const ledgerData = [...new Set(ledgerList.map(item => item.ledger))];
              ledgerData.forEach((ledger)=>{
                const ledgerObj=ledgerList.find(x=>x.ledger==ledger);
                if(showLedger)
                  { 
                     this.pushToTrialBalanceList({
                      ledgerName:ledgerObj.ledger,
                      openingBalanceDebit:ledgerObj.openingBalanceDebit,
                      openingBalanceCredit:ledgerObj.openingBalanceCredit,
                      transactionalDebitVal:ledgerObj.transactionalDebitVal,
                      transactionalCreditVal:ledgerObj.transactionalCreditVal, 
                      transactionalBalance:ledgerObj.transactionalBalance,
                      closingBalanceDebit:ledgerObj.closingBalanceDebit,
                      closingBalanceCredit:ledgerObj.closingBalanceCredit,
                      isSubTotal:false
                     });
                }
                if(showSubLedgerDetail){
                  const subLedgerDetailData = [...new Set(ledgerList.filter(x=>x.ledger==ledger).map(item => item.subLedgerDetailName).filter(name => name !== null && name !== undefined))];          
                  
                  if(subLedgerDetailData.length){
                    subLedgerDetailData.forEach((subLedgerDetailName)=>{                            
                      const subLedgerDetailObj=ledgerList.find(x=>x.ledger==ledger && x.subLedgerDetailName==subLedgerDetailName);
                      if(subLedgerDetailObj){
                        this.pushToTrialBalanceList({
                          ledgerName:subLedgerDetailObj.subLedgerDetailName,
                          openingBalanceDebit:subLedgerDetailObj.openingBalanceDebit,
                          openingBalanceCredit:subLedgerDetailObj.openingBalanceCredit,
                          transactionalDebitVal:subLedgerDetailObj.transactionalDebitVal,
                          transactionalCreditVal:subLedgerDetailObj.transactionalCreditVal, 
                          transactionalBalance:subLedgerDetailObj.transactionalBalance,
                          closingBalanceDebit:subLedgerDetailObj.closingBalanceDebit,
                          closingBalanceCredit:subLedgerDetailObj.closingBalanceCredit,
                          isSubTotal:false
                         });
                      }
                    });
                    if(showSubTotaLevel=='Ledger')
                      {
                     this.pushToTrialBalanceList({
                      ledgerName:"",
                      openingBalanceDebit:null,
                      openingBalanceCredit:null,
                      transactionalDebitVal:ledgerObj.totalTransactionalDebitValLG,
                      transactionalCreditVal:ledgerObj.totalTransactionalCreditValLG, 
                      transactionalBalance:ledgerObj.totalTransactionalBalanceLG,
                      closingBalanceDebit:ledgerObj.totalClosingBalanceDebitLG,
                      closingBalanceCredit:ledgerObj.totalClosingBalanceCreditLG,
                      isSubTotal:true
                     });
                    }
                  }

                }else{
                  if(showSubTotaLevel=='ControlLedger')
                    {
                      this.pushToTrialBalanceList({
                        ledgerName:"",
                        openingBalanceDebit:null,
                        openingBalanceCredit:null,
                        transactionalDebitVal:null,
                        transactionalCreditVal:null, 
                        transactionalBalance:null,
                        closingBalanceDebit:null,
                        closingBalanceCredit:null,
                        isSubTotal:true
                       });
                  }
                }
              });


              // if(showLedger){               
              //   ledgerList.forEach((ledgerObj)=>{          
              //    this.pushToTrialBalanceList({
              //     ledgerName:ledgerObj.ledger,
              //     openingBalanceDebit:ledgerObj.openingBalanceDebit,
              //     openingBalanceCredit:ledgerObj.openingBalanceCredit,
              //     transactionalDebitVal:ledgerObj.transactionalDebitVal,
              //     transactionalCreditVal:ledgerObj.transactionalCreditVal, 
              //     transactionalBalance:ledgerObj.transactionalBalance,
              //     closingBalanceDebit:ledgerObj.closingBalanceDebit,
              //     closingBalanceCredit:ledgerObj.closingBalanceCredit,
              //     isSubTotal:false
              //    });
              // });
              // }

              // if(showSubTotaLevel=="ControlLedger"){
              //  this.pushToTrialBalanceList({
              //   ledgerName:"",
              //   openingBalanceDebit:null,
              //   openingBalanceCredit:null,
              //   transactionalDebitVal:null,
              //   transactionalCreditVal:null, 
              //   transactionalBalance:null,
              //   closingBalanceDebit:null,
              //   closingBalanceCredit:null,
              //   isSubTotal:true
              //  });
              // }
            }
          
            if(showSubTotaLevel=="SubGroupLedger")
              {
            this.pushToTrialBalanceList({
              ledgerName:"",
              openingBalanceDebit:null,
              openingBalanceCredit:null,
              transactionalDebitVal:showSubTotaLevel=='SubGroupLedger'?subGroupLedgerObj.totalTransactionalDebitValSGL:null,
              transactionalCreditVal:showSubTotaLevel=='SubGroupLedger'?subGroupLedgerObj.totalTransactionalCreditValSGL:null, 
              transactionalBalance:showSubTotaLevel=='SubGroupLedger'?subGroupLedgerObj.totalTransactionalBalanceSGL:null,
              closingBalanceDebit:showSubTotaLevel=='SubGroupLedger'?subGroupLedgerObj.totalClosingBalanceDebitSGL:null,
              closingBalanceCredit:showSubTotaLevel=='SubGroupLedger'?subGroupLedgerObj.totalClosingBalanceCreditSGL:null,
              isSubTotal:true
             });
          }

          });

          if(showSubTotaLevel=='GroupLedger')
            {
         this.pushToTrialBalanceList({
          ledgerName:"",
          openingBalanceDebit:null,
          openingBalanceCredit:null,
          transactionalDebitVal:groupLedgerObj.totalTransactionalDebitValGL,
          transactionalCreditVal:groupLedgerObj.totalTransactionalCreditValGL, 
          transactionalBalance:groupLedgerObj.totalTransactionalBalanceGL,
          closingBalanceDebit:groupLedgerObj.totalClosingBalanceDebitGL,
          closingBalanceCredit:groupLedgerObj.totalClosingBalanceCreditGL,
          isSubTotal:true
         });
        }

        });

        if(showSubTotaLevel=="AccountNature" && showSubTotaLevel!=showTopLevel){
          this.pushToTrialBalanceList({
            ledgerName:"",
            openingBalanceDebit:null,
            openingBalanceCredit:null,
            transactionalDebitVal:accountsNatureObj.totalTransactionalDebitValAN,
            transactionalCreditVal:accountsNatureObj.totalTransactionalCreditValAN, 
            transactionalBalance:accountsNatureObj.totalTransactionalBalanceAN,
            closingBalanceDebit:accountsNatureObj.totalClosingBalanceDebitAN,
            closingBalanceCredit:accountsNatureObj.totalClosingBalanceCreditAN,
            isSubTotal:true
           });
        }
      });

      this.totalTransactionalDebitVal=data.length?data[0].totalTransactionalDebitVal:0;
      this.totalTransactionalCreditVal=data.length?data[0].totalTransactionalCreditVal:0;
      this.totalTransactionalBalance=data.length?data[0].totalTransactionalBalance:0;
      this.totalClosingBalanceDebit=data.length?data[0].totalClosingBalanceDebit:0;
      this.totalClosingBalanceCredit=data.length?data[0].totalClosingBalanceCredit:0;
      this.totalOpeningBalanceDebit=data.length?data[0].totalOpeningBalanceDebit:0;
      this.totalOpeningBalanceCredit=data.length?data[0].totalOpeningBalanceCredit:0;
      
      this.pushToTrialBalanceList({
        ledgerName: "Total",
        openingBalanceDebit: this.totalOpeningBalanceDebit,
        openingBalanceCredit: this.totalOpeningBalanceCredit,
        transactionalDebitVal: this.totalTransactionalDebitVal,
        transactionalCreditVal: this.totalTransactionalCreditVal,
        transactionalBalance: this.totalTransactionalBalance,
        closingBalanceDebit: this.totalClosingBalanceDebit,
        closingBalanceCredit: this.totalClosingBalanceCredit,
        isSubTotal: true
      });

    } catch (error) {
      throw error;
    }
  }
  
  prepareTrialBalanceReportsList(data){
    try {
      let showLedgerObj=this.getMax_And_LessThanMax();

      let showSubTotaLevel=showLedgerObj?.smallFromMax?.type;
      let showTopLevel=showLedgerObj?.max?.type;

      const showAccountNature=this.searchParam.checkBoxList[0].isShow;
      const showGroupLedger=this.searchParam.checkBoxList[1].isShow;
      const showSubGroupLedger=this.searchParam.checkBoxList[2].isShow;
      const showControlLedger=this.isSkippedControlLedger?false:this.searchParam.checkBoxList[3].isShow;

      const showLedger=this.isSkippedControlLedger?this.searchParam.checkBoxList[3].isShow:this.searchParam.checkBoxList[4].isShow;

      this.trialBalanceList=[];
      let accountsNatureData= data.reduce((unique, item) => {
        if (!unique.includes(item.accountsNature)) {
          unique.push(item.accountsNature);
        }
        return unique;
      }, []);
    
      accountsNatureData.forEach((accountsNature)=>{

        let accountsNatureList=data.filter(x=>x.accountsNature==accountsNature);

        const accountsNatureObj=accountsNatureList[0];
        if(showAccountNature)
        {
           this.pushToTrialBalanceList({
            ledgerName:accountsNatureObj.accountsNature,
            openingBalanceDebit:showTopLevel=="AccountNature"?accountsNatureObj.totalOpeningBalanceDebitAN:null,
            openingBalanceCredit:showTopLevel=="AccountNature"?accountsNatureObj.totalOpeningBalanceCreditAN:null,
            transactionalDebitVal:showTopLevel=="AccountNature"?accountsNatureObj.totalTransactionalDebitValAN:null,
            transactionalCreditVal:showTopLevel=="AccountNature"?accountsNatureObj.totalTransactionalCreditValAN:null, 
            transactionalBalance:showTopLevel=="AccountNature"?accountsNatureObj.totalTransactionalBalanceAN:null,
            closingBalanceDebit:showTopLevel=="AccountNature"?accountsNatureObj.totalClosingBalanceDebitAN:null,
            closingBalanceCredit:showTopLevel=="AccountNature"?accountsNatureObj.totalClosingBalanceCreditAN:null,
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
         this.pushToTrialBalanceList({
          ledgerName:groupLedgerObj.groupLedger,
          openingBalanceDebit:showTopLevel=="GroupLedger"?groupLedgerObj.totalOpeningBalanceDebitGL:null,
          openingBalanceCredit:showTopLevel=="GroupLedger"?groupLedgerObj.totalOpeningBalanceCreditGL:null,
          transactionalDebitVal:showTopLevel=="GroupLedger"?groupLedgerObj.totalTransactionalDebitValGL:null,
          transactionalCreditVal:showTopLevel=="GroupLedger"?groupLedgerObj.totalTransactionalCreditValGL:null, 
          transactionalBalance:showTopLevel=="GroupLedger"?groupLedgerObj.totalTransactionalBalanceGL:null,
          closingBalanceDebit:showTopLevel=="GroupLedger"?groupLedgerObj.totalClosingBalanceDebitGL:null,
          closingBalanceCredit:showTopLevel=="GroupLedger"?groupLedgerObj.totalClosingBalanceCreditGL:null,
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
            this.pushToTrialBalanceList({
              ledgerName:subGroupLedgerObj.subGroupLedger,
              openingBalanceDebit:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalOpeningBalanceDebitSGL:null,
              openingBalanceCredit:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalOpeningBalanceCreditSGL:null,
              transactionalDebitVal:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalTransactionalDebitValSGL:null,
              transactionalCreditVal:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalTransactionalCreditValSGL:null, 
              transactionalBalance:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalTransactionalBalanceSGL:null,
              closingBalanceDebit:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalClosingBalanceDebitSGL:null,
              closingBalanceCredit:showTopLevel=="SubGroupLedger"?subGroupLedgerObj.totalClosingBalanceCreditSGL:null,
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
                 this.pushToTrialBalanceList({
                  ledgerName:controlLedgerObj.controlLedger,
                  openingBalanceDebit:showTopLevel=="ControlLedger"?controlLedgerObj.totalOpeningBalanceDebitCL:null,
                  openingBalanceCredit:showTopLevel=="ControlLedger"?controlLedgerObj.totalOpeningBalanceCreditCL:null,
                  transactionalDebitVal:showTopLevel=="ControlLedger"?controlLedgerObj.totalTransactionalDebitValCL:null,
                  transactionalCreditVal:showTopLevel=="ControlLedger"?controlLedgerObj.totalTransactionalCreditValCL:null, 
                  transactionalBalance:showTopLevel=="ControlLedger"?controlLedgerObj.totalTransactionalBalanceCL:null,
                  closingBalanceDebit:showTopLevel=="ControlLedger"?controlLedgerObj.totalClosingBalanceDebitCL:null,
                  closingBalanceCredit:showTopLevel=="ControlLedger"?controlLedgerObj.totalClosingBalanceCreditCL:null,
                 });
                }
                //push ledger
                if(showLedger)
                  {
                  const ledgerList=controlLedgerList.filter(x=>x.controlLedger==controlLedger);
                  
                  ledgerList.forEach((ledgerObj)=>{
                     this.pushToTrialBalanceList({
                      ledgerName:ledgerObj.ledger,
                      openingBalanceDebit:ledgerObj.openingBalanceDebit,
                      openingBalanceCredit:ledgerObj.openingBalanceCredit,
                      transactionalDebitVal:ledgerObj.transactionalDebitVal,
                      transactionalCreditVal:ledgerObj.transactionalCreditVal, 
                      transactionalBalance:ledgerObj.transactionalBalance,
                      closingBalanceDebit:ledgerObj.closingBalanceDebit,
                      closingBalanceCredit:ledgerObj.closingBalanceCredit,
                      isSubTotal:false
                     });
                  });
                }

                if(showSubTotaLevel=='ControlLedger')
                  {
                 this.pushToTrialBalanceList({
                  ledgerName:"",
                  openingBalanceDebit:null,
                  openingBalanceCredit:null,
                  transactionalDebitVal:controlLedgerObj.totalTransactionalDebitValCL,
                  transactionalCreditVal:controlLedgerObj.totalTransactionalCreditValCL, 
                  transactionalBalance:controlLedgerObj.totalTransactionalBalanceCL,
                  closingBalanceDebit:controlLedgerObj.totalClosingBalanceDebitCL,
                  closingBalanceCredit:controlLedgerObj.totalClosingBalanceCreditCL,
                  isSubTotal:true
                 });
                }
              });
              }
             
            } else{
              if(showLedger){
                const ledgerList=subGroupLedgerList.filter(x=>x.subGroupLedger==subGroupLedgerObj.subGroupLedger);
                ledgerList.forEach((ledgerObj)=>{          
                 this.pushToTrialBalanceList({
                  ledgerName:ledgerObj.ledger,
                  openingBalanceDebit:ledgerObj.openingBalanceDebit,
                  openingBalanceCredit:ledgerObj.openingBalanceCredit,
                  transactionalDebitVal:ledgerObj.transactionalDebitVal,
                  transactionalCreditVal:ledgerObj.transactionalCreditVal, 
                  transactionalBalance:ledgerObj.transactionalBalance,
                  closingBalanceDebit:ledgerObj.closingBalanceDebit,
                  closingBalanceCredit:ledgerObj.closingBalanceCredit,
                  isSubTotal:false
                 });
              });
              }
              if(showSubTotaLevel=="ControlLedger"){
               this.pushToTrialBalanceList({
                ledgerName:"",
                openingBalanceDebit:null,
                openingBalanceCredit:null,
                transactionalDebitVal:null,
                transactionalCreditVal:null, 
                transactionalBalance:null,
                closingBalanceDebit:null,
                closingBalanceCredit:null,
                isSubTotal:true
               });
              }
            }
          
            if(showSubTotaLevel=="SubGroupLedger")
              {
            this.pushToTrialBalanceList({
              ledgerName:"",
              openingBalanceDebit:null,
              openingBalanceCredit:null,
              transactionalDebitVal:showSubTotaLevel=='SubGroupLedger'?subGroupLedgerObj.totalTransactionalDebitValSGL:null,
              transactionalCreditVal:showSubTotaLevel=='SubGroupLedger'?subGroupLedgerObj.totalTransactionalCreditValSGL:null, 
              transactionalBalance:showSubTotaLevel=='SubGroupLedger'?subGroupLedgerObj.totalTransactionalBalanceSGL:null,
              closingBalanceDebit:showSubTotaLevel=='SubGroupLedger'?subGroupLedgerObj.totalClosingBalanceDebitSGL:null,
              closingBalanceCredit:showSubTotaLevel=='SubGroupLedger'?subGroupLedgerObj.totalClosingBalanceCreditSGL:null,
              isSubTotal:true
             });
          }

          });

          if(showSubTotaLevel=='GroupLedger')
            {
         this.pushToTrialBalanceList({
          ledgerName:"",
          openingBalanceDebit:null,
          openingBalanceCredit:null,
          transactionalDebitVal:groupLedgerObj.totalTransactionalDebitValGL,
          transactionalCreditVal:groupLedgerObj.totalTransactionalCreditValGL, 
          transactionalBalance:groupLedgerObj.totalTransactionalBalanceGL,
          closingBalanceDebit:groupLedgerObj.totalClosingBalanceDebitGL,
          closingBalanceCredit:groupLedgerObj.totalClosingBalanceCreditGL,
          isSubTotal:true
         });
        }

        });

        if(showSubTotaLevel=="AccountNature" && showSubTotaLevel!=showTopLevel){
          this.pushToTrialBalanceList({
            ledgerName:"",
            openingBalanceDebit:null,
            openingBalanceCredit:null,
            transactionalDebitVal:accountsNatureObj.totalTransactionalDebitValAN,
            transactionalCreditVal:accountsNatureObj.totalTransactionalCreditValAN, 
            transactionalBalance:accountsNatureObj.totalTransactionalBalanceAN,
            closingBalanceDebit:accountsNatureObj.totalClosingBalanceDebitAN,
            closingBalanceCredit:accountsNatureObj.totalClosingBalanceCreditAN,
            isSubTotal:true
           });
        }
      });

      // this.totalTransactionalDebitVal=data.reduce((total,item)=>total+(+item.transactionalDebitVal),0);
      // this.totalTransactionalCreditVal=data.reduce((total,item)=>total+(+item.transactionalCreditVal),0);
      // this.totalTransactionalBalance=data.reduce((total,item)=>total+(+item.transactionalBalance),0);
      // this.totalClosingBalanceDebit=data.reduce((total,item)=>total+(+item.closingBalanceDebit),0);
      // this.totalClosingBalanceCredit=data.reduce((total,item)=>total+(+item.closingBalanceCredit),0);

      this.totalTransactionalDebitVal=data.length?data[0].totalTransactionalDebitVal:0;
      this.totalTransactionalCreditVal=data.length?data[0].totalTransactionalCreditVal:0;
      this.totalTransactionalBalance=data.length?data[0].totalTransactionalBalance:0;
      this.totalClosingBalanceDebit=data.length?data[0].totalClosingBalanceDebit:0;
      this.totalClosingBalanceCredit=data.length?data[0].totalClosingBalanceCredit:0;
      this.totalOpeningBalanceDebit=data.length?data[0].totalOpeningBalanceDebit:0;
      this.totalOpeningBalanceCredit=data.length?data[0].totalOpeningBalanceCredit:0;
      
      this.pushToTrialBalanceList({
        ledgerName: "Total",
        openingBalanceDebit: this.totalOpeningBalanceDebit,
        openingBalanceCredit: this.totalOpeningBalanceCredit,
        transactionalDebitVal: this.totalTransactionalDebitVal,
        transactionalCreditVal: this.totalTransactionalCreditVal,
        transactionalBalance: this.totalTransactionalBalance,
        closingBalanceDebit: this.totalClosingBalanceDebit,
        closingBalanceCredit: this.totalClosingBalanceCredit,
        isSubTotal: true
      });

    } catch (error) {
      throw error;
    }
  }

  private pushToTrialBalanceList(data) {
    try {
      this.trialBalanceList.push(data);
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
      const concatenatedAcctNames = this.searchParam.checkBoxList.filter(x=>x.isShow).map(item => item.name).join(', ');
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
          key: "CompanyName",
          value: this.searchParam.company || ''
        },
        {
          key: "ReportName",
          value: 'Trial Balance'
        },
        {
          key: "OrgBranchProject",
          value: OrgBranchProject || ''
        },
        {
          key: "CompanyShortAddress",
          value: this.tempTrialBalance[0].companyShortAddress
        }
        ,
        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        },
        {
          key: "AccountNames",
          value: concatenatedAcctNames
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
        
      ];
      
      return columns;
    } catch (e) {
      throw e;
    }
  }
  
}
