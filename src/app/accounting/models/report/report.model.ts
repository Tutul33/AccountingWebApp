import { 
  GlobalConstants,
  ValidatingObjectFormat 
} from "../..";

export function receiptsAndPaymentsValidation(): any {
    return {
      receiptsAndPaymentsModelValidation: {
           companyID: {
                required: GlobalConstants.validationMsg.companyname
            },
            fromDate: {
                required: GlobalConstants.validationMsg.fromdate
            },
            toDate: {
              required: GlobalConstants.validationMsg.todate
          },
            resultType:{
              required: GlobalConstants.validationMsg.resulttype
            }
        } as ValidatingObjectFormat,
    }
}
export function balanceSheetValidation(): any {
  return {
    balanceSheetModelValidation: {
         companyID: {
              required: GlobalConstants.validationMsg.companyname
          },
          financialYearID: {
            required: GlobalConstants.validationMsg.financialyear
          },
          fromDate: {
            required: GlobalConstants.validationMsg.fromdate
          },
          toDate: {
            required: GlobalConstants.validationMsg.todate
          },
          dateAsOn: {
              required: GlobalConstants.validationMsg.dateason
          },
          resultType:{
            required: GlobalConstants.validationMsg.resulttype
          }
      } as ValidatingObjectFormat,
  }
}
export function trialBalanceValidation(): any {
  return {
    trialBalanceModelValidation: {
         companyID: {
              required: "Please provide Compnay Name."
          },
          dateRange: {
            required: "Please provide Date Range."
          },
      } as ValidatingObjectFormat,
  }
}
export function incomestatementValidation(): any {
  return {
    incomestatementModelValidation: {
         companyID: {
              required: "Please provide Compnay Name."
          },
          financialYearID: {
            required: "Please provide Financial Year."
          },
          dateRange: {
              required: "Please provide Date Range."
          }
      } as ValidatingObjectFormat,
  }
}
export function noteLedgerValidation(): any {
  return {
    noteLedgerModelValidation: {
         companyID: {
              required: GlobalConstants.validationMsg.companyname
          },
          financialYearID: {
            required: GlobalConstants.validationMsg.financialyear
          },
          date: {
              required: GlobalConstants.validationMsg.date
          }
      } as ValidatingObjectFormat,
  }
}
export function fixedAssetsScheduleValidation(): any {
  return {
    fixedAssetsScheduleModelValidation: {
         companyID: {
              required: GlobalConstants.validationMsg.companyname
          },
          financialYearID: {
            required: GlobalConstants.validationMsg.financialyear
          },
          date: {
              required: GlobalConstants.validationMsg.date
          }
      } as ValidatingObjectFormat,
  }
}

export function groupLedgerValidation(): any {
  return {
    groupLedgerModelValidation: {
      companyID: {
        required: GlobalConstants.validationMsg.companyname,
      },
      groupLedgerID: {
        required: GlobalConstants.validationMsg.groupname,
        //required: 'Group ledger name is required!',
      },
      fromDate: {
        required: GlobalConstants.validationMsg.fromDate,
      },
      toDate: {
        required: GlobalConstants.validationMsg.toDate,
      }
    } as ValidatingObjectFormat,
  };
}

export function subGroupLedgerValidation(): any {
  return {
    subGroupLedgerModelValidation: {
      companyID: {
        required: GlobalConstants.validationMsg.companyname,
      },
      subLedgerTypeID: {
        required: GlobalConstants.validationMsg.subledgertype,
        //required: 'Sub Ledger type is required!',
      },
      ledgerID: {
        required: GlobalConstants.validationMsg.ledger,
        //required: 'Ledger name is required!',
      },
      fromDate: {
        required: GlobalConstants.validationMsg.fromdate,
      },
      toDate: {
        required: GlobalConstants.validationMsg.todate,
      }
    } as ValidatingObjectFormat,
  };
}

export function ledgerValidation(): any {
  return {
    ledgerModelValidation: {
      companyID: {
        required: GlobalConstants.validationMsg.companyname,
      },
      ledgerID: {
        required: GlobalConstants.validationMsg.ledger,
        //required: 'Ledger name is required!',
      },
      fromDate: {
        required: GlobalConstants.validationMsg.fromdate,
      },
      toDate: {
        required: GlobalConstants.validationMsg.todate,
      }
    } as ValidatingObjectFormat,
  };
}

export function dayBookValidation(): any {
  return {
    dayBookModelValidation: {
         companyID: {
              required: GlobalConstants.validationMsg.companyname
          },
          // orgID: {
          //   required: GlobalConstants.validationMsg.org
          // },
          financialYearID: {
            required: GlobalConstants.validationMsg.financialyear
          },
          fromDate: {
              required: GlobalConstants.validationMsg.fromDate
          },
          toDate: {
              required: GlobalConstants.validationMsg.toDate
          }
      } as ValidatingObjectFormat,
  }
}

export function cashFlowStatementValidation(): any {
    return {
      cashFlowStatementValidationModelValidation: {
           companyID: {
                required: GlobalConstants.validationMsg.companyname
            },
            fromDate: {
                required: GlobalConstants.validationMsg.fromdate
            },
            toDate: {
              required: GlobalConstants.validationMsg.todate
          }
        } as ValidatingObjectFormat,
    }
}
