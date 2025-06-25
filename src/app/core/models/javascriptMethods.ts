import { AbstractControl } from '@angular/forms';
import { GlobalConstants, } from 'src/app/app-shared/models/javascriptVariables';
import * as clone from 'clone';
import { FixedIDs } from '../../app-shared/models/fixedIDs';
import { TreeNode } from 'primeng/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export class GlobalMethods {
  static ONE_TO_NINETEEN = [
    'ONE',
    'TWO',
    'THREE',
    'FOUR',
    'FIVE',
    'SIX',
    'SEVEN',
    'EIGHT',
    'NINE',
    'TEN',
    'ELEVEN',
    'TWELVE',
    'THIRTEEN',
    'FOURTEEN',
    'FIFTEEN',
    'SIXTEEN',
    'SEVENTEEN',
    'EIGHTEEN',
    'NINETEEN',
  ];

  static TENS = [
    'TEN',
    'TWENTY',
    'THIRTY',
    'FORTY',
    'FIFTY',
    'SIXTY',
    'SEVENTY',
    'EIGHTY',
    'NINETY',
  ];

  //static SCALES = ['THOUSAND', 'MILLION', 'BILLION', 'TRILLION'];
  static SCALES = ["THOUSAND", "LAC", "CRORE", "BILLION"];

  /*static getFormControl(form: AbstractControl, key: any) {
    return form.get(key);
  }*/

  static deepClone<T>(value): T {
    return clone<T>(value);
  }

  static priceInWord(amount, mainCurr, fractionCurr) {
    const values = amount.toString().split('.');

    const mainPart = GlobalMethods.chunk(Number(values[0]))
      .map(GlobalMethods.inEnglish)
      .map(GlobalMethods.appendScale)
      .filter(GlobalMethods.isTruthy)
      .reverse()
      .join(' ');
    let fractionPart = null;
    if (values.length > 1) {
      fractionPart = GlobalMethods.chunk(Number(values[1]))
        .map(GlobalMethods.inEnglish)
        .map(GlobalMethods.appendScale)
        .filter(GlobalMethods.isTruthy)
        .reverse()
        .join(' ');
    }
    // GlobalMethods.chunk(Number(values[1]))
    //   .map(GlobalMethods.inEnglish)
    //   .map(GlobalMethods.appendScale)
    //   .filter(GlobalMethods.isTruthy)
    //   .reverse()
    //   .join(' ');

    let inWord = '';

    inWord += mainPart ? mainPart + ' ' + mainCurr : '';
    inWord += mainPart && Number(values[1]) ? ' AND ' : '';
    inWord += Number(values[1])
      ? fractionPart + ' ' + fractionCurr + ' ONLY'
      : ' ONLY';
    return inWord;
  }

  // helper static for use with Array.filter
  static isTruthy(item) {
    return !!item;
  }
  // convert a number into "chunks" of 0-999
  static chunk(number) {
    const thousands = [];

    thousands.push(number % 1000);
    number = Math.floor(number / 1000);

    while (number > 0) {
      thousands.push(number % 100);
      number = Math.floor(number / 100);
    }


    // while (number > 0) {
    //   thousands.push(number % 1000);
    //   number = Math.floor(number / 1000);
    // }

    return thousands;
  }

  // translate a number from 1-999 into English
  static inEnglish(number) {
    let hundreds: any;
    let tens: any;
    let ones: any;
    const words = [];

    if (number < 20) {
      return GlobalMethods.ONE_TO_NINETEEN[Math.floor(number - 1)]; // may be undefined
    }

    if (number < 100) {
      ones = number % 10;
      tens = number / 10 || 0; // equivalent to Math.floor(number / 10)

      words.push(GlobalMethods.TENS[Math.floor(tens - 1)]);
      words.push(GlobalMethods.inEnglish(ones));

      return words.filter(GlobalMethods.isTruthy).join(' ');
    }

    hundreds = number / 100 || 0;
    words.push(GlobalMethods.inEnglish(hundreds));
    words.push('HUNDRED');
    words.push(GlobalMethods.inEnglish(number % 100));

    return words.filter(GlobalMethods.isTruthy).join(' ');
  }

  // append the word for a scale. Made for use with Array.map
  static appendScale(chunk, exp) {
    let scale;
    if (!chunk) {
      return null;
    }
    scale = GlobalMethods.SCALES[Math.floor(exp - 1)];
    return [chunk, scale].filter(GlobalMethods.isTruthy).join(' ');
  }

  // combines time with given date object
  /*static combineDateTime(date, time) {
    try {
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
      );
    } catch (e) {
      throw e;
    }
  }*/

  // First, checks if it isn't implemented yet.
  /*static formatString(content: string, argument: any) {
    for (let i = 0; i < argument.length; i++) {
      const replacement = '{' + i + '}';
      content = content.replace(replacement, argument[i]);
    }
    return content;
  }*/
  /*static toBangla(str) {
    // check if the `str` is not string
    if (!isNaN(str)) {
      // if not string make it string forcefully
      str = String(str);
    }

    // start try catch block
    try {
      // keep the bangla numbers to an array
      const convert = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      // now split the provided string into array by each character
      const splitArray = str.split('');
      // declare a empty string
      let newString = '';
      // run a loop upto the length of the string array
      for (let i = 0; i < splitArray.length; i++) {
        // check if current array element if not number
        if (isNaN(splitArray[i])) {
          // if not number then place it as it is
          newString += splitArray[i];
        } else {
          // if number then get same numbered element from the bangla array
          newString += convert[splitArray[i]];
        }
      }
      // return the newly converted number
      return newString;
    } catch (err) {
      // if any error occured while convertion return the original string
      return str;
    }
    // by default return original number/string
    return str;
  }*/

  static timeTick = function () {

    return new Date().getTime().toString() + Math.random();
  };

  static generateKeyValuePair(key, value, operator?) {
    return {
      key: key,
      value: value,
      logicalOperator: !operator ? '' : '%' + operator,
    };
  }

  static createKeyValuePair(key, value, operator) {
    return {
      key: key,
      value: value,
      logicalOperator: !operator ? '' : '%' + operator,
    };
  }

  static createDateRange(fromDate, toDate, separator?, forSql?) {
    const fromDateString = fromDate
      ? GlobalMethods.convertDateToServerDateString(fromDate, void 0, forSql)
      : fromDate;
    const toDateString = toDate
      ? GlobalMethods.convertDateToServerDateString(toDate, void 0, forSql)
      : toDate;
    return fromDateString && toDateString
      ? fromDateString + (!separator ? '#***#**#**' : separator) + toDateString
      : '';
  }

  /*static convertDateToDateString(input, joinChar) {
    function add(s) {
      return s < 10 ? '0' + s : s;
    }
    if (input instanceof Date) {
      return [
        add(input.getDate()),
        add(input.getMonth() + 1),
        input.getFullYear(),
      ].join(!joinChar ? '/' : joinChar);
    } else {
      throw new Error('Invalid Date!!');
    }
  }*/

  static convertDateToServerDateString(input, joinChar, forSql) {
    if (input instanceof Date) {
      if (!forSql) {
        return (
          add(input.getMonth() + 1) +
          (joinChar || '/') +
          add(input.getDate()) +
          (joinChar || '/') +
          add(input.getFullYear())
        ).toString();
      } else {
        return (
          add(input.getFullYear()) +
          (joinChar || '/') +
          add(input.getMonth() + 1) +
          (joinChar || '/') +
          add(input.getDate())
        ).toString();
      }
    } else {
      throw new Error('Invalid Date!!');
    }
    function add(s) {
      return s < 10 ? '0' + s : s;
    }
  }

  static convertToNumberFormat(value, language, minimumFractionDigits, maximumFractionDigits) {
    return new Intl.NumberFormat(language, {
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits
    }).format(value);
  }


  // return this format "03/08/2023 04:15:49 PM"
  static convertDateTimeToServerDateString(str) {
    const datetime = new Date(str);
    const year = datetime.getFullYear();
    const month = datetime.getMonth() + 1;
    const day = datetime.getDate();
    const hour = datetime.getHours();
    const minute = datetime.getMinutes();
    const second = datetime.getSeconds();
    return datetime.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '');

  }

  /*static convertDateStringsToDates(input) {
    // Ignore things that aren't objects.
    if (typeof input !== 'object') {
      return input;
    }

    for (const key in input) {
      if (!input.hasOwnProperty(key)) {
        continue;
      }

      const value = input[key];
      let match;
      // Check for string properties which look like dates.
      if (
        typeof value === 'string' &&
        value.length >= 10 &&
        (match = value.match(
          /^(19|2\d)\d{2}([- \\.])(0\d|1[0-2])\2(0\d|[12]\d|3[01])(?:T(\d{2}):(\d{2}):(\d{2})(\.\d{1,})?(Z|([\-+])(\d{2}):(\d{2}))?)?$/
        ))
      ) {
        const milliseconds = Date.parse(match[0]);
        if (!isNaN(milliseconds)) {
          input[key] = new Date(milliseconds);
        }
      } else if (typeof value === 'object') {
        // Recurse into object
        GlobalMethods.convertDateStringsToDates(value);
      }
    }
  }*/

  static mergeDateAndTime(date: Date, t: string) {
    var time = t.match(/(\d+)(?::(\d\d))?\s*(P?)/);
    let hours = 0;
    if (time[3]) {
      if (parseInt(time[1]) == 12) {
        hours = 12;
      } else {
        hours = parseInt(time[1]) + 12;
      }
    } else {
      if (parseInt(time[1]) == 12) {
        hours = 0;
      } else {
        hours = parseInt(time[1]);
      }
    }
    date.setHours(hours);
    date.setMinutes(parseInt(time[2]) || 0);
    return date;
  }

  // get year,mont,days between to date
  /*static getYMD(from, to) {
    let years = 0,
      months = 0,
      days = 0;

    // Years
    years = to.getFullYear() - from.getFullYear();
    if (from.getMonth() > to.getMonth()) {
      years = years - 1;
    }
    // Months
    if (from.getDate() > to.getDate()) {
      if (from.getMonth() > to.getMonth()) {
        months = 11 - (from.getMonth() - to.getMonth());
      } else {
        months = to.getMonth() - from.getMonth();
      }
    } else {
      if (from.getMonth() > to.getMonth()) {
        months = 12 - (from.getMonth() - to.getMonth());
      } else {
        months = to.getMonth() - from.getMonth();
      }
    }
    // Days
    if (from.getDate() > to.getDate()) {
      const mesant = GlobalMethods.dayssInmonths(
        to.setMonth(to.getMonth() - 1)
      );
      days = mesant - from.getDate() + to.getDate();
    } else {
      days = to.getDate() - from.getDate();
    }

    return { years: years, months: months, days: days };
  }*/
  // return only days between two date
  static getDays(toDate, fromDate, isNegetiveAllowed) {
    // let days = Math.round((fromDate - toDate) / (1000 * 60 * 60 * 24));
    // let days = Math.round((toDate - fromDate) / (1000 * 60 * 60 * 24));
    return Math.round((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
  }
  /*static dayssInmonths(date) {
    date = new Date(date);
    return 32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate();
  }*/

  /*static formatAMPMfromDate(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours < 10 ? '0' + hours : hours;

    minutes = minutes < 10 && minutes !== '00' ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }*/

  /*static formatAMPMfromTime(time) {
    let strTime = '';
    if (time) {
      time = time.trim();
      if (time) {
        let hours = time.split(':')[0];
        let minutes = time.split(':')[1];

        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hours = hours < 10 ? '0' + hours : hours;

        minutes = minutes < 10 && minutes !== '00' ? minutes : minutes;
        strTime = hours + ':' + minutes + ' ' + ampm;
      }
    }
    return strTime;
  }*/

  /*static dateToString(_date, _delimiter) {
    _delimiter = _delimiter || '/';
    let dd = _date.getDate();
    let mm = _date.getMonth() + 1; // January is 0!

    const yyyy = _date.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    return dd + _delimiter + mm + _delimiter + yyyy;
  }*/

  /*static dateDiffInMilliSec(endDate, startDate) {
    const datediff = endDate.getTime() - startDate.getTime();
    return datediff;
  }*/

  /*static dateDiffInDays(bigDate, smallDate) {
    const millDay = 86400000;
    bigDate.setHours(0);
    bigDate.setMinutes(0);
    bigDate.setSeconds(0);
    bigDate.setMilliseconds(0);
    smallDate.setHours(0);
    smallDate.setMinutes(0);
    smallDate.setSeconds(0);
    smallDate.setMilliseconds(0);
    const datediff = bigDate.getTime() - smallDate.getTime();
    const days = parseInt((datediff / millDay).toString(), 10);
    return days;
  }*/

  static stringToDate(_date, _format, _delimiter) {
    const formatLowerCase = _format.toLowerCase();
    const formatItems = formatLowerCase.split(_delimiter);
    const dateItems = _date.split(_delimiter);
    const monthIndex = formatItems.indexOf('mm');
    const dayIndex = formatItems.indexOf('dd');
    const yearIndex = formatItems.indexOf('yyyy');
    let month = parseInt(dateItems[monthIndex], 10);
    month -= 1;
    const formatedDate = new Date(
      dateItems[yearIndex],
      month,
      dateItems[dayIndex]
    );
    return formatedDate;
  }

  /*static searchParams(defaultData) {
    defaultData = defaultData || {};
    return {
      buyer: defaultData.buyer || null,
      season: defaultData.season || null,
      order: defaultData.order || null,
      quot: defaultData.quot || null,
      style: defaultData.style || null,
      fromDate: defaultData.fromDate || null,
      toDate: defaultData.toDate || null,
      pageNo: defaultData.pageNo || 1,
      pageDataCount: defaultData.pageDataCount || 10,
      locationID: defaultData.locationID || 0,
      userID: defaultData.userID || 0
    }
  }*/

  static codeGenProperty(defaultData?: any) {
    defaultData = defaultData || {};
    return {
      item: defaultData.item || null,
      itemShortName: defaultData.itemShortName || null,
      itemType: defaultData.itemType || null,
      itemTypeShortName: defaultData.itemTypeShortName || null,
      supplierShortName: defaultData.supplierShortName || null,
      orgShortName: defaultData.orgShortName || null,
      voucherTypeShortName: defaultData.voucherTypeShortName || null,
      FullYear: defaultData.FullYear || null,
      Year: defaultData.Year || null,
      Month: defaultData.Month || null,
      MonthNo: defaultData.MonthNo || null,
      Day: defaultData.Day || null,
      DayNoInMonth: defaultData.DayNoInMonth || null,
      currentUser: defaultData.currentUser || null,
      Text: defaultData.Text || null,
      ParentLedgerCode: defaultData.ParentLedgerCode || null,
    }
  }

  // set user information
  static setLoginInfo(user) {
    GlobalConstants.userInfo.locationID = user.locationID ? user.locationID : 1;
    GlobalConstants.userInfo.userPKID = user.userPKID;
    GlobalConstants.userInfo.userName = user.userName;
    GlobalConstants.userInfo.userID = user.userID;
    GlobalConstants.userInfo.companyID = user.companyID;
    GlobalConstants.userInfo.company = user.companyName || user.company;
    GlobalConstants.userInfo.empPKID = user.empPKID;
    GlobalConstants.userInfo.employeeID = user.employeeID;
    GlobalConstants.userInfo.password = user.password ? user.password : '';
    GlobalConstants.userInfo.orgID = user.orgID;
    GlobalConstants.userInfo.userTypeID = user.userTypeID;
    GlobalConstants.userInfo.token = user.token;
    GlobalConstants.userInfo.email = user.email;
    GlobalConstants.userInfo.rootOrgID = user.rootOrgID;
    GlobalConstants.userInfo.rootOrgName = user.rootOrgName;
    GlobalConstants.userInfo.rootOrgElementCode = user.rootOrgElementCode;
    GlobalConstants.userInfo.rootOrgAddress = user.rootOrgAddress;
    GlobalConstants.userInfo.rootOrgMobile = user.rootOrgMobile;
    GlobalConstants.userInfo.email = user.email;
    GlobalConstants.userInfo.languageCode = user.languageCode;
    GlobalConstants.userInfo.userUniqueNo = Number(Math.floor(Math.random() * (100000 - 1 + 1)) + 1); //user.userPKID// + '.' + Math.floor(Math.random() * (100000 - 1 + 1) ) + 1;


  }

  // clear User Information
  static clearUserInformation() {
    GlobalConstants.userInfo.locationID = null;
    GlobalConstants.userInfo.userPKID = null;
    GlobalConstants.userInfo.userName = null;
    GlobalConstants.userInfo.companyID = null;
    GlobalConstants.userInfo.company = null;
    GlobalConstants.userInfo.empPKID = null;
    GlobalConstants.userInfo.employeeID = null;
    GlobalConstants.userInfo.password = null;
    GlobalConstants.userInfo.orgID = null;
    GlobalConstants.userInfo.userTypeID = null;
    GlobalConstants.userInfo.token = null;
    GlobalConstants.userInfo.email = null;
    GlobalConstants.userInfo.rootOrgID = 0;
    GlobalConstants.userInfo.rootOrgName = null;
    GlobalConstants.userInfo.rootOrgElementCode = 0;
    GlobalConstants.userInfo.rootOrgAddress = null;
    GlobalConstants.userInfo.rootOrgMobile = null;
    GlobalConstants.userInfo.userUniqueNo = 0;
    GlobalConstants.userInfo.languageCode = null;
  }

  static setCompanyInfo(data: any) {
    GlobalConstants.companyInfo.companyID = data.companyID;
    GlobalConstants.companyInfo.companyName = data.companyName;
    GlobalConstants.companyInfo.companyAddress = data.companyAddress;
    GlobalConstants.companyInfo.companyEmail = data.companyEmail;
    GlobalConstants.companyInfo.companyWebSiteAdd = data.companyWebSiteAdd;
  }

  // set customer information
  /*static setCustomerInfo(customer:any) {
    GlobalConstants.customerInfo.id = customer.id;
    GlobalConstants.customerInfo.mobileNo = customer.mobileNo;
    GlobalConstants.customerInfo.altMobileNo = customer.altMobileNo;
    GlobalConstants.customerInfo.email = customer.email;
    GlobalConstants.customerInfo.name = customer.name;
    GlobalConstants.customerInfo.dOB = customer.dOB;
    GlobalConstants.customerInfo.genderCd = customer.genderCd;
    GlobalConstants.customerInfo.profilePicFileName = customer.profilePicFileName;
    GlobalConstants.customerInfo.memberID = customer.memberID;
  }*/
  // clear customer Information
  /*static clearCustomerInformation() {
    GlobalConstants.customerInfo.id = null;
    GlobalConstants.customerInfo.mobileNo = null;
    GlobalConstants.customerInfo.altMobileNo = null;
    GlobalConstants.customerInfo.email = null;
    GlobalConstants.customerInfo.name = null;
    GlobalConstants.customerInfo.dOB = null;
    GlobalConstants.customerInfo.genderCd = null;
    GlobalConstants.customerInfo.profilePicFileName = null;
    GlobalConstants.customerInfo.memberID = null;
  }*/

  /*static QueryData(defaultData) {
    defaultData = defaultData || {};
    const qryObject: any = {};
    qryObject.userID = defaultData.userID || null;
    qryObject.pageDataCount = defaultData.pageDataCount || 10; // for instant bug fix of grid page size
    qryObject.queryEvent = defaultData.queryEvent || '';
    qryObject.pageNo =
      defaultData.pageNo === 0
        ? 0
        : defaultData.pageNo
          ? defaultData.pageNo
          : 1; // if page no equal to 0 then system returns all data
    qryObject.spParams = defaultData.spParams || [];
    qryObject.spName = defaultData.spName || null;
    qryObject.ddlProperties = defaultData.ddlProperties || [];
    qryObject.searchParams = defaultData.searchParams || [];
    qryObject.isRefresh = defaultData.isRefresh || true;
    qryObject.criteriaList = defaultData.criteriaList || [];
    qryObject.totalSectionInfo = defaultData.totalSectionInfo || [];
    qryObject.cacheTimeOut = defaultData.cacheTimeOut || null;
    qryObject.onDemandCash = defaultData.onDemandCash || false; // It is used for dynamic report
    return qryObject;
  }*/

  /*static emailInfo(defaultData) {
    defaultData = defaultData || {};
    const emailObj: any = {};

    emailObj.fromAddress = defaultData.fromAddress || null;
    emailObj.to = defaultData.to || null;
    emailObj.cC = defaultData.cC || [];
    emailObj.bCC = defaultData.bCC || [];
    emailObj.body = defaultData.body || null;
    emailObj.subject = defaultData.subject || null;
    emailObj.userToken = defaultData.userToken || null;
    emailObj.displayName = defaultData.displayName || null;
    emailObj.emailTemplate = defaultData.emailTemplate || null;
    emailObj.locale = defaultData.locale || null;
    emailObj.files = defaultData.files || [];
    emailObj.refObject = defaultData.refObject || null;
    emailObj.isCanceled = defaultData.isCanceled || null;
    emailObj.isError = defaultData.isError || null;
    emailObj.error = defaultData.error || null;
    return emailObj;
  }*/

  /*static reportConfiguration(defaultData) {
    defaultData = defaultData || {};
    const reportConfigObj: any = {};
    reportConfigObj.reportName = defaultData.reportName || null;
    reportConfigObj.userID = defaultData.userID || null;
    reportConfigObj.data = defaultData.data || [];
    reportConfigObj.dataColumns = defaultData.dataColumns || [];
    reportConfigObj.reportType = defaultData.reportType || null;
    reportConfigObj.engineType = defaultData.engineType || null;
    reportConfigObj.detailRowNo = defaultData.detailRowNo || 0;
    reportConfigObj.params = defaultData.params || null;
    reportConfigObj.barcode = defaultData.barcode || null;
    reportConfigObj.isOnlyLabelChange = defaultData.isOnlyLabelChange || false;
    reportConfigObj.increaseFontSizeBy = defaultData.increaseFontSizeBy || 0;
    reportConfigObj.fontSize = defaultData.fontSize || null;
    reportConfigObj.detailSectionHeaderHeight =
      defaultData.detailSectionHeaderHeight || null;
    reportConfigObj.detailSectionRowHeight =
      defaultData.detailSectionRowHeight || null;
    return reportConfigObj;
  }*/

  // Ronding Methods
  // Fixed-The amount is truncated to two decimal places. For example, 14.238 the figure will be truncated to 14.23.
  ///////////////////////////////////////////////// FIX/////////////////////////////
  static getFixedValue(value) {
    if (value) {
      const valueArray = value.toString().split('.');
      let subPart = '';
      if (valueArray.length > 1) {
        if (valueArray[1].toString().length > 1) {
          subPart = valueArray[1].toString().substr(0, 2);
        } else {
          subPart = valueArray[1].toString().substr(0, 1);
        }
      }
      const newValue = parseInt(value, 10);
      const finalVal = subPart === '' ? newValue : newValue + '.' + subPart;
      return parseFloat(finalVal.toString());
    } else {
      return value;
    }
  }
  // Quarter to Half-Round the amount of total leave entitlement to the nearest quarter
  // day of leave. For example, if total leave is 14.25 then it will round to the nearest half
  // 14.50, if the total leave is 14.23 then it will round off to the nearest half which is
  // 14.00, and 14.50 will remain as 14.50.
  ///////////////////////////////////////////////// QTH/////////////////////////////
  /*static getQuarterToHalfValue(value) {
    if (value) {
      const newValue = parseFloat(value);
      const newFixedValue = parseInt(value, 10);
      const quaterValue = parseFloat(newFixedValue.toString() + '.25');
      const halfValue = parseFloat(newFixedValue.toString() + '.50');
      const oneThirdValue = parseFloat(newFixedValue.toString() + '.75');
      if (newValue >= oneThirdValue) {
        return parseFloat((newFixedValue + 1).toString());
      } else if (newValue >= quaterValue || newValue > halfValue) {
        // convert quater
        return parseFloat((newFixedValue + 0.5).toString());
      } else {
        return newFixedValue;
      }
    } else {
      return value;
    }
  }*/
  // Half-Round up total entitlement to the nearest half day of leave. For example, if
  // total leave is 13.23 then it will round to the nearest half 13.50, 13.51 will be rounded
  // to 14.00.
  ///////////////////////////////////////////////// HF/////////////////////////////
  /*static getHalfRoundValue(value) {
    if (value) {
      const newValue = parseFloat(value);
      const newFixedValue = parseInt(value, 10);
      const halfValue = parseFloat(newFixedValue.toString() + '.50');
      //  && newValue < halfValue
      if (newFixedValue !== value && newValue > halfValue) {
        // convert quater
        return parseFloat(newFixedValue.toString()) + 1;
      } else if (newFixedValue !== value && newValue < halfValue) {
        // convert quater
        return parseFloat(newFixedValue.toString() + '.50');
      } else {
        return value;
      }
    } else {
      return value;
    }
  }*/
  // Round to two decimal-Will round to two decimal points. For example, 13.531 will
  // be rounded to 13.53, and 13.535 will be rounded to 13.54.
  ///////////////////////////////////////////////// RTD/////////////////////////////
  /*static getRoundToTwoDecimalValue(value) {
    if (value) {
      const newValue = parseFloat(value);
      return Math.round(newValue * 100) / 100;
    } else {
      return value;
    }
  }*/
  // Round to whole-Will round to nearest whole number. For example, 13.23 will
  // round to 13.00, 13.50 will round to 14.00, and 13.51 will round to 14.00.
  ///////////////////////////////////////////////// RTW/////////////////////////////
  /*static getRoundToWholeValue(value) {
    if (value) {
      const newValue = parseFloat(value);
      return Math.round(newValue);
    } else {
      return value;
    }
  }*/
  // Used to convert decimal value with managing scale
  ///////////////////////////////////////////////// RTW/////////////////////////////
  static convertToDecimal(value, scale) {
    if (scale && value) {
      const newValue = parseFloat(value).toFixed(scale);
      return newValue;
    } else {
      if (value) {
        return Number(value);
      } else {
        return value;
      }
    }
  }

  // Used to convert decimal value with managing scale and without round
  /*static convertToDecimalWithoutRound(value, scale) {
    if (scale && value) {
      const re = new RegExp('^-?\\d+(?:\.\\d{0,' + (scale || -1) + '})?');
      const newValue = value.toString().match(re)[0];
      return Number(newValue);
    } else {
      if (value) {
        return Number(value);
      } else {
        return value;
      }
    }
  }*/

  // check null or Undefined
  static isUndefinedOrNull(val) {
    if (val) {
      return true;
    } else {
      return false;
    }
  }

  /*static pad(str, max) {
    str = str.toString();
    return str.length < max ? GlobalMethods.pad('0' + str, max) : str;
  }*/

  /*static generateCommaDelimitedString(source, propertyArray) {
    const values = [];
    for (let j = 0, jLen = propertyArray.length; j < jLen; j++) {
      const value = propertyArray[j];
      if (!GlobalMethods.isUndefinedOrNull(source[value])) {
        values.push(source[value]);
      }
    }
    return values.join(', ');
  }*/

  /*static convertToJSON(data) {
    return JSON.stringify(data);
  }*/

  /*static getList(data, values) {
    const list = [];
    if (values) {
      for (let i = 0; i < values.length; i++) {
        for (const name in data) {
          if (values[i] === data[name]) {
            list.push({ value: data[name], text: name });
            break;
          }
        }
      }
    } else {
      for (const field in data) {
        if (data.hasOwnProperty(field)) {
          list.push({ value: data[field], text: field });
        }
      }
    }
    return list;
  }*/

  // takes an array as input and returns the last item
  static getLastItem(array) {
    try {
      if (Array.isArray(array)) {
        return array[array.length - 1];
      }
    } catch (e) {
      throw e;
    }
  }

  /*static getDatesRangeArray(startDate, endDate, interval, day) {
    interval = interval || 1;

    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const retVal = [];
    const from = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const to = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    while (from <= to) {
      const dt = new Date(from);

      if (day && day !== dayNames[dt.getDay()]) {
        from.setDate(from.getDate() + interval);
        continue;
      }

      retVal.push(dt);
      from.setDate(from.getDate() + interval);
    }

    return retVal;
  }*/

  /*static parseISOLocal(s) {
    const b = s.split(/\D/);
    return new Date(b[0], b[1] - 1, b[2], b[3], b[4], b[5]);
  }*/

  /*static countCertainDays(days, d0, d1) {
    const ndays = 1 + Math.round((d1 - d0) / (24 * 3600 * 1000));
    const sum = function (a, b) {
      return a + Math.floor((ndays + ((d0.getDay() + 6 - b) % 7)) / 7);
    };
    return days.reduce(sum, 0);
  }*/

  /* guide line **************************************
  Created by Rasel Ahmed
      dataList contain all item, return deserved item from dataList,
       let searchParams = [
                      { searchVal: vm.searchCriteria.supplier, property: "supplierName" },
                      { searchVal: vm.searchCriteria.suppliershortname, property: "supplierShortName" }
                  ];

      here searchVal contain serarch property value and property : dataList item Property thate match searchValue

  */
  static getItemSearchByValue(items: any, searchParams: any, logicalOperator?: any) {
    // try {
    const logicalOptr =
      typeof logicalOperator === 'undefined' ? '&&' : logicalOperator;
    const dataList = [...items];

    for (let k = 0; k < dataList.length; k++) {
      for (let n = 0; n < searchParams.length; n++) {
        if (dataList[k][searchParams[n].property] == null) {
          dataList[k][searchParams[n].property] = '';
        }
      }
    }

    let evalText = null;
    let isFirstSearchProperty = false;

    for (let i = 0; i < searchParams.length; i++) {
      if (searchParams[i].searchVal) {
        if (Number.isInteger(searchParams[i].searchVal)) {
          const textValue = searchParams[i].searchVal;
          if (!isFirstSearchProperty) {
            evalText = 'if(item.' + searchParams[i].property + '==' + textValue;
            isFirstSearchProperty = true;
          } else {
            evalText =
              evalText +
              ' ' +
              logicalOptr +
              ' item.' +
              searchParams[i].property +
              '==' +
              textValue;
          }
        } else {
          const text = `'${searchParams[i].searchVal.toLowerCase()}'`;
          if (!isFirstSearchProperty) {
            evalText =
              'if(item.' +
              searchParams[i].property +
              '.toLowerCase().indexOf(' +
              text +
              ') >= 0';
            isFirstSearchProperty = true;
          } else {
            evalText =
              evalText +
              ' ' +
              logicalOptr +
              ' item.' +
              searchParams[i].property +
              '.toLowerCase().indexOf(' +
              text +
              ') >= 0';
          }
        }
      }
    }

    if (isFirstSearchProperty) {
      const tempItemList = [];
      const text1 = '){tempItemList.push(item);}';
      evalText = evalText + text1;

      dataList.forEach((item): any => {
        eval(evalText);
      });

      return tempItemList;
    } else {
      return dataList;
    }
  }

  static uomWiseSum(dataSet, uomProp, amountProps) {
    try {
      if (!Array.isArray(dataSet)) {
        throw Error('Array expected but got ' + typeof dataSet);
      }

      if (typeof uomProp !== 'string') {
        throw Error('String expected but got ' + typeof uomProp);
      }

      if (!Array.isArray(amountProps)) {
        throw Error('Array expected but got ' + typeof dataSet);
      }

      const dict = {};
      dataSet.forEach(function (item) {
        if (!dict[item[uomProp]]) {
          dict[item[uomProp]] = {};
          amountProps.forEach(function (amountProp) {
            dict[item[uomProp]][amountProp] = item[amountProp] || 0;
          });
        } else {
          amountProps.forEach(function (amountProp) {
            dict[item[uomProp]][amountProp] += item[amountProp] || 0;
          });
        }
      });
      const result = {};
      amountProps.forEach(function (amountProp) {
        let str = '';
        Object.keys(dict).forEach(function (key) {
          str += dict[key][amountProp] + ' ' + key + ', ';
        });
        result[amountProp] = str.substring(0, str.length - 2);
      });
      return result;
    } catch (e) {
      throw e;
    }
  }

  /*static packingUnitSum(
    dataList,
    groupByProperty,
    unitNameProperty,
    uomValue,
    uomValue2
  ) {
    try {
      const uniquePackList = [];
      //
      // STEP -1 :  finding Unique UOM List
      dataList.forEach(function (value) {
        let isExists = null;
        isExists = uniquePackList.filter(function (ob, i) {
          return ob.uomID === value[groupByProperty];
        });
        if (!isExists || isExists.length === 0) {
          uniquePackList.push({
            uomID: value[groupByProperty],
            uomName: value[unitNameProperty],
            totalQty: 0,
            totalItemQty: 0,
          });
        }
      });
      //
      // STEP -2 : UOM Wise Finding SUM
      for (let i = 0; i < uniquePackList.length; i++) {
        const eachUom = uniquePackList[i];
        dataList.forEach(function (value) {
          if (value[groupByProperty] === eachUom.uomID) {
            eachUom.totalQty = eachUom.totalQty + value[uomValue];
          }
          eachUom.totalItemQty = eachUom.totalItemQty + value[uomValue2];
        });
      }
      //
      // STEP 3 : Making String
      let uomString1 = '';
      let uomString2 = '';
      for (let j = 0; j < uniquePackList.length; j++) {
        uomString1 =
          uomString1 +
          ' ' +
          uniquePackList[j].totalQty +
          ' ' +
          uniquePackList[j].uomName;
        uomString2 =
          uomString2 +
          ' ' +
          uniquePackList[j].totalItemQty +
          ' ' +
          uniquePackList[j].uomName;
      }
      return {
        totalQty: uomString1,
        totalItemQty: uomString2,
      };
    } catch (e) {
      throw e;
    }
  }*/

  // For Sticky Table Header
  static getTableOverflowStyle() {
    try {

      // 80 if height:<800 , 90 if height:>800
      // style = "{'max-height': '90vh', 'overflow-x': 'auto'}"; // if consider height as percentage

      let style = "";
      let scrHeight = window.screen.height;
      let body = document.body;
      let html = document.documentElement;

      let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

      if (scrHeight <= 800)
        style = "{'max-height': '" + (height - 85) + "px', 'overflow-x': 'auto'}";
      else
        style = "{'max-height': '" + (height - 100) + "px', 'overflow-x': 'auto'}";

      return style;
    } catch (e) {
      throw e;
    }
  }

  static generateDynamicReportHTMLTxt(headerList) {
    try {
      let htmlString = '<table ni-grid="gridOptions" class="table table-striped table-hover   white-space-normal">\n'
        + '<thead>\n'
        + '<tr>\n';

      for (let i = 0; i < headerList.length; i++) {
        let entity = headerList[i];
        htmlString += !entity.isFixed ? '' : '<th style="width:' + entity.colSize.width + ';" title="{{::longft.' + entity.displayTitle.split('.')[1] + '}}">{{::' + entity.displayTitle + '}}</th>\n';
      }

      htmlString += '</tr>\n'
        + '</thead>\n'
        + '<tbody>\n'
        + '<tr data-ng-repeat="entity in entityList">\n';
      for (let i = 0; i < headerList.length; i++) {
        let head = headerList[i];
        htmlString += !head.isFixed ? '' : '<td style="width:' + head.colSize.width + ';" ni-title="{{entity.' + (head.cellTooltip || head.field) + '}}">{{::entity.' + head.field + '}}</td>\n';
      }
      htmlString += '</tr>\n'
        + '</tbody>\n'
        + '</table>';

      return htmlString;
    } catch (e) {
      throw e;
    }
  }

  //set menu information to pageInfo
  static setPageInfo(selectedMenu: any) {
    try {
      GlobalConstants.pageInfo.id = selectedMenu.id;
      GlobalConstants.pageInfo.locationID = selectedMenu.locationID;
      GlobalConstants.pageInfo.applicationID = selectedMenu.applicationID;
      GlobalConstants.pageInfo.parentID = selectedMenu.parentID;
      GlobalConstants.pageInfo.moduleName = selectedMenu.moduleName;
      GlobalConstants.pageInfo.pageTitle = selectedMenu.pageTitle;
      GlobalConstants.pageInfo.serialNo = selectedMenu.serialNo;
      GlobalConstants.pageInfo.pageType = selectedMenu.pageType;
      GlobalConstants.pageInfo.imageName = selectedMenu.imageName;
      GlobalConstants.pageInfo.uRL = selectedMenu.uRL;
      GlobalConstants.pageInfo.isPageOrMenu = selectedMenu.isPageOrMenu;
      GlobalConstants.pageInfo.items = selectedMenu?.items || [];

      if (GlobalConstants.pageInfo.pageType && GlobalConstants.pageInfo.pageType === FixedIDs.pageType.ReportPage) {
        GlobalConstants.pageInfo.action = selectedMenu.action + '_' + selectedMenu.id;
      } else {
        GlobalConstants.pageInfo.action = selectedMenu.action;
      }

      GlobalConstants.pageInfo.projectFileName = selectedMenu.projectFileName;
      GlobalConstants.pageInfo.add = selectedMenu.add;//== 1 ? $rootScope.fixedIDs.permitAction.Add : 0;
      GlobalConstants.pageInfo.edit = selectedMenu.edit;//== 1 ? $rootScope.fixedIDs.permitAction.Edit : 0;
      GlobalConstants.pageInfo.delete = selectedMenu.delete;// == 1 ? $rootScope.fixedIDs.permitAction.Delete : 0; 
      GlobalConstants.pageInfo.preview = selectedMenu.preview;//== 1 ? $rootScope.fixedIDs.permitAction.Preview : 0;
      GlobalConstants.pageInfo.print = selectedMenu.print;//== 1 ? $rootScope.fixedIDs.permitAction.Print : 0;
      GlobalConstants.pageInfo.cancel = selectedMenu.cancel;// == 1 ? $rootScope.fixedIDs.permitAction.Cancel : 0;
      GlobalConstants.pageInfo.standby = selectedMenu.standBy;// == 1 ? $rootScope.fixedIDs.permitAction.Standby : 0;
      GlobalConstants.pageInfo.approve = selectedMenu.approve;//== 1 ? $rootScope.fixedIDs.permitAction.Approve : 0;
      GlobalConstants.pageInfo.editTime = selectedMenu.editTime;//== 1 ? $rootScope.fixedIDs.permitAction.Print : 0;
      GlobalConstants.pageInfo.deleteTime = selectedMenu.deleteTime;//== 1 ? $rootScope.fixedIDs.permitAction.Print : 0;

      GlobalConstants.pageInfo.breadcrumbs = GlobalMethods.deepClone(selectedMenu.breadcrumbs);
    } catch (e) {
      throw e;
    }
  }

  static clearPageInfo() {

    GlobalConstants.pageInfo.id = null;
    GlobalConstants.pageInfo.locationID = null;
    GlobalConstants.pageInfo.applicationID = null;
    GlobalConstants.pageInfo.parentID = null;
    GlobalConstants.pageInfo.moduleName = null;
    GlobalConstants.pageInfo.pageTitle = null;
    GlobalConstants.pageInfo.serialNo = null;
    GlobalConstants.pageInfo.pageType = null;
    GlobalConstants.pageInfo.imageName = null;
    GlobalConstants.pageInfo.uRL = null;
    GlobalConstants.pageInfo.isPageOrMenu = null;
    GlobalConstants.pageInfo.items = [];
    GlobalConstants.pageInfo.action = null;
    GlobalConstants.pageInfo.projectFileName = null;
    GlobalConstants.pageInfo.add = null;
    GlobalConstants.pageInfo.edit = null;
    GlobalConstants.pageInfo.delete = null;
    GlobalConstants.pageInfo.preview = null;
    GlobalConstants.pageInfo.print = null;
    GlobalConstants.pageInfo.cancel = null;
    GlobalConstants.pageInfo.standby = null;
    GlobalConstants.pageInfo.approve = null;
    GlobalConstants.pageInfo.editTime = null;
    GlobalConstants.pageInfo.deleteTime = null;
    GlobalConstants.pageInfo.breadcrumbs = [];

  }

  // json deep copy
  static jsonDeepCopy(list) {
    return JSON.parse(JSON.stringify(list));
  }



  /************* Sales Price DI/DE Calculation Method  **************/
  static vatDI(salesPriceDI: number, vatPrcnt: number) {
    return salesPriceDI - (100 * salesPriceDI / (100 + vatPrcnt));
  }

  static sdDI(salesPriceDI: number, vat: number, sdPrcnt: number) {
    return (salesPriceDI - vat) - (100 * (salesPriceDI - vat)) / (100 + sdPrcnt);
  }

  static vatDE(salesPriceDE: number, sd: number, vatPrcnt: number) {
    return ((salesPriceDE + sd) * vatPrcnt) / 100;
  }

  static sdDE(salesPriceDE: number, sdPrcnt: number) {
    return (salesPriceDE * sdPrcnt) / 100;
  }


  /*static getDistance(lat1:number,lat2:number, lon1:number, lon2:number)
    {
      // The math module contains a function
      // named toRadians which converts from
      // degrees to radians.
      lon1 =  lon1 * Math.PI / 180;
      lon2 = lon2 * Math.PI / 180;
      lat1 = lat1 * Math.PI / 180;
      lat2 = lat2 * Math.PI / 180;

      // Haversine formula
      let dlon = lon2 - lon1;
      let dlat = lat2 - lat1;
      let a = Math.pow(Math.sin(dlat / 2), 2)
      + Math.cos(lat1) * Math.cos(lat2)
      * Math.pow(Math.sin(dlon / 2),2);

      let c = 2 * Math.asin(Math.sqrt(a));

      // Radius of earth in kilometers. Use 6371
      // for miles. Use 3956
      let r = 6371;

      // calculate the result
      return(c * r);
    }*/

  static groupBy(list: any[], key) {
    return list.reduce(function (entity, x) {
      (entity[x[key]] = entity[x[key]] || []).push(x);
      return entity;
    }, {});
  };

  static setCookie(cname: string, cvalue: any, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  static getCookie(cname: string) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  static parseHTMLToPlainText(elementHtml: any) {
    const tmp = document.createElement("div");
    tmp.innerHTML = elementHtml;
    return tmp.textContent || tmp.innerText || "";
  }
  static filterUniqueItemsByProperty(array, property) {
    try {
      const uniqueMap = new Map();
      array.forEach(item => {
        uniqueMap.set(item[property], item);
      });
      return Array.from(uniqueMap.values());
    } catch (error) {
      throw error;
    }
  }

  // let testNumber = "";
  //       var numbersB = {
  //           '০': 0,
  //           '১': 1,
  //           '২': 2,
  //           '৩': 3,
  //           '৪': 4,
  //           '৫': 5,
  //           '৬': 6,
  //           '৭': 7,
  //           '৮': 8,
  //           '৯': 9
  //       };

  static replaceNumbersB2E(input: any) {
    var numbersB = {
      '০': 0,
      '১': 1,
      '২': 2,
      '৩': 3,
      '৪': 4,
      '৫': 5,
      '৬': 6,
      '৭': 7,
      '৮': 8,
      '৯': 9
    };
    var output = [];
    for (var i = 0; i < input.length; ++i) {
      if (numbersB.hasOwnProperty(input[i])) {
        output.push(numbersB[input[i]]);
      } else {
        output.push(input[i]);
      }
    }
    return output.join('');
  }

  static replaceNumbersE2B(input: any) {
    var output = [];
    var numbersE = {
      0: '০',
      1: '১',
      2: '২',
      3: '৩',
      4: '৪',
      5: '৫',
      6: '৬',
      7: '৭',
      8: '৮',
      9: '৯'
    };
    for (var i = 0; i < input.length; ++i) {
      if (numbersE.hasOwnProperty(input[i])) {
        output.push(numbersE[input[i]]);
      } else {
        output.push(input[i]);
      }
    }
    return output.join('');
  }

  // static isLanguageChange : boolean = false;
  static isLanguageLoad: boolean = false;

  static parseJwt(token: any) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  };

  static prepareTreeData(arr, parentID) {
    try {
      const master: any[] = [];
      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        val.label = val.label;
        if (val.parentID == parentID) {
          const children = this.prepareTreeData(arr, val.key);
          if (children.length) {
            val.children = children;
          }
          master.push(val);
        }
      }
      return master;
    } catch (error) {
      throw error;
    }
  }
  // Method to get node level
  static getNodeLevel(node: TreeNode, tree: TreeNode[], level: number = 0): number | null {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i] === node) {
        return level;
      }
      if (tree[i].children && tree[i].children.length > 0) {
        const childLevel = this.getNodeLevel(node, tree[i].children, level + 1);
        if (childLevel !== null) {
          return childLevel;
        }
      }
    }
    return null;
  }

  // Recursive method to get max depth of a node
  static getMaxDepthOfNode(node: TreeNode): number {
    if (!node.children || node.children.length === 0) {
      return 0; // A leaf node has depth 0
    }

    let maxDepth = 0;
    for (let i = 0; i < node.children.length; i++) {
      const childDepth = this.getMaxDepthOfNode(node.children[i]);
      if (childDepth > maxDepth) {
        maxDepth = childDepth;
      }
    }

    return maxDepth + 1; // Add 1 for the current node level
  }

  // Function to get the selected node with children limited to the specified level
  static getNodeWithLimitedChildLevel(selectedNode: TreeNode, maxLevel: number, currentLevel: number = 0): TreeNode {
    // Clone the node to avoid mutating the original tree
    const newNode: TreeNode = { ...selectedNode, children: [] };

    // If the current level is less than the maximum allowed level, process the children
    if (currentLevel < maxLevel && selectedNode.children && selectedNode.children.length > 0) {
      newNode.children = selectedNode.children.map(child =>
        this.getNodeWithLimitedChildLevel(child, maxLevel, currentLevel + 1)
      );
    }

    return newNode;
  }

  // Function to find a node by key (recursive)
  static findNodeByKey(treeNodes: TreeNode[], key: string): TreeNode | null {
    for (let node of treeNodes) {
      if (node.key === key) {
        return node; // Found the node with the matching key
      }

      if (node.children && node.children.length > 0) {
        const found = this.findNodeByKey(node.children, key);
        if (found) {
          return found; // Found the node in the child nodes
        }
      }
    }
    return null; // Node with the key was not found
  }

  static exportPdf(element: any, name: string) {
    if (element) {
      html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(name);
      });
    }
  }

  static computeTreeLevels(data: any[]) {
    const levels: { [id: number]: number } = {};

    // Create a dictionary for quick lookup of nodes by id
    const nodeMap = new Map(data.map(node => [node.id, node]));

    function getLevel(nodeId: number): number {
      // If already calculated, return the level
      if (levels[nodeId] != null) {
        return levels[nodeId];
      }

      // Find the node by its id
      const node = nodeMap.get(nodeId);
      if (!node) return -1; // If node doesn't exist, return invalid level

      // If it's a root node (no parent), its level is 0
      if (node.parentID == null) {
        levels[nodeId] = 0;
        return 0;
      }

      // Otherwise, the level is parent's level + 1
      const parentLevel = getLevel(node.parentID);
      const nodeLevel = parentLevel + 1;
      levels[nodeId] = nodeLevel;
      return nodeLevel;
    }

    // Iterate through all nodes to ensure levels are computed
    data.forEach(node => getLevel(node.id));

    // Add the calculated levels to the original data
    return data.map(node => ({
      ...node,
      level: levels[node.id] // Attach the computed level
    }));
  }

}
