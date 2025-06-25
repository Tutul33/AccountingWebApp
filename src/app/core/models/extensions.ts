import { GlobalMethods } from "./javascriptMethods";

export {};

declare global {
  interface Date {
    getWeekNumber(weekstart): any;
    getDateRangeOfWeek(weekNo, weekstart): any;
    withoutTime(): any;
    getDayName(): any;
    getDayName(): any;
  }

  interface StringConstructor {
    format(): any;
  }

  interface Object {
    hasPKValue(pk): any;
    entityChange(entity, kepProperty): any;
    setInsertTag(): any;
    setModifyTag(): any;
    setDeleteTag(): any;
    resetTag(): any;
    isTagChanged(): any;
    isAdded(): any;
    isModified(): any;
    isDeleted(): any;
    convertServerObjToClientObj(srcObj): any;
  }

  interface Array<T> {
    entityPush(...args: any[]): any;
    entityPop(entity, pk?: any): any;
    entityReset(newObject, pkId): any;
    convertServerListToClientList(srcList): any;
    spliceObject(sourceToRemove): any;
    spliceObjectByID(id: number): any;
    arrayMove(element, delta,elementIndex?:number): any;
    swapArrayPosition(arr, old_index, new_index): any;
    convertBooleanToYesNo(property): any;
  }

  // interface NumberConstructor {
  //  formatCurrency(num: number): string;
  // }
}

// Date extension methods
Date.prototype.getWeekNumber = function (weekstart) {
  const target = new Date(this.valueOf());

  // Set default for weekstart and clamp to useful range
  if (weekstart === undefined) {
    weekstart = 1;
  }
  weekstart %= 7;

  // Replaced offset of (6) with (7 - weekstart)
  const dayNr = (this.getDay() + 7 - weekstart) % 7;
  target.setDate(target.getDate() - dayNr + 0); // 0 means friday

  const firstDay = target.valueOf();

  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }

  const val = 1 + Math.ceil((firstDay - target.valueOf()) / 604800000);
  return val;
};

Date.prototype.getDateRangeOfWeek = function (weekNo, weekstart) {
  const hostingDateObject = this;
  const firstDayOfWeek = hostingDateObject.getDay() - weekstart;

  hostingDateObject.setDate(hostingDateObject.getDate() - firstDayOfWeek);

  const currentWeekNo = hostingDateObject.getWeekNumber(weekstart);
  const weeksInTheFuture = weekNo - currentWeekNo;

  const clonedDate = new Date(GlobalMethods.deepClone(hostingDateObject));

  clonedDate.setDate(clonedDate.getDate() + 7 * weeksInTheFuture);

  if (hostingDateObject.getFullYear() === clonedDate.getFullYear()) {
    hostingDateObject.setDate(
      hostingDateObject.getDate() + 7 * weeksInTheFuture
    );
  }

  const rangeIsFrom =
    // tslint:disable-next-line: no-eval
    eval(hostingDateObject.getMonth() + 1) +
    "/" +
    hostingDateObject.getDate() +
    "/" +
    hostingDateObject.getFullYear();

  hostingDateObject.setDate(hostingDateObject.getDate() + 6);

  const rangeIsTo =
    // tslint:disable-next-line: no-eval
    eval(hostingDateObject.getMonth() + 1) +
    "/" +
    hostingDateObject.getDate() +
    "/" +
    hostingDateObject.getFullYear();

  return { startDate: rangeIsFrom, endDate: rangeIsTo };
};

Date.prototype.withoutTime = function () {
  const currentDate = new Date(this);
  currentDate.setHours(0, 0, 0, 0);
  return currentDate;
};

Date.prototype.getDayName = function () {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayNames[this.getDay()];
};

// String extension methods
String.format = function () {
  const args = arguments;
  return this.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] !== "undefined" ? args[number] : match;
  });
};

// Object extension methods
Object.defineProperty(Object.prototype, "hasPKValue", {
  value: function (pk) {
    if (typeof this[pk] !== "undefined") {
      if (this[pk] > 0) {
        return true;
      } else {
        return false;
      }
    }
    return undefined;
  },
  writable: true,
  configurable: true,
  enumerable: false,
});

Object.defineProperty(Object.prototype, "entityChange", {
  value: function (entity, kepProperty) {
    if (typeof this[kepProperty] !== "undefined") {
      if (this[kepProperty] !== entity[kepProperty]) {
        this[kepProperty] = entity[kepProperty];
        this["tag"] = 3;
      }
    } else {
      for (const key in entity) {
        if (this[key] !== entity[key]) {
          this[key] = entity[key];
          this["tag"] = 3;
        }
      }
    }
    return Object;
  },
});

Object.defineProperty(Object.prototype, "setInsertTag", {
  value: function () {
    if (typeof this.tag !== "undefined") {
      this.tag = 4;
      return this.tag;
    } else {
      return undefined;
    }
  },
  writable: true,
  configurable: true,
  enumerable: false,
});

Object.defineProperty(Object.prototype, "setModifyTag", {
  value: function () {
    if (typeof this.tag !== "undefined" && (this.tag === 0 || this.tag === 2)) {
      this.tag = 3;
      return this.tag;
    } else {
      return undefined;
    }
  },
  writable: true,
  configurable: true,
  enumerable: false,
});

Object.defineProperty(Object.prototype, "setDeleteTag", {
  value: function () {
    if (typeof this.tag !== "undefined") {
      this.tag = 2;
      return this.tag;
    } else {
      return undefined;
    }
  },
  writable: true,
  configurable: true,
  enumerable: false,
});

Object.defineProperty(Object.prototype, "resetTag", {
  value: function () {
    if (typeof this.tag !== "undefined") {
      this.tag = 0;
      return this.tag;
    } else {
      return undefined;
    }
  },
  writable: true,
  configurable: true,
  enumerable: false,
});

Object.defineProperty(Object.prototype, "isTagChanged", {
  value: function () {
    if (typeof this.tag !== "undefined") {
      if (this.tag === 0) {
        return false;
      } else {
        return true;
      }
    }
    return undefined;
  },
  writable: true,
  configurable: true,
  enumerable: false,
});

Object.defineProperty(Object.prototype, "isAdded", {
  value: function () {
    if (typeof this.tag !== "undefined") {
      if (this.tag === 4) {
        return true;
      } else {
        return false;
      }
    }
    return undefined;
  },
  writable: true,
  configurable: true,
  enumerable: false,
});

Object.defineProperty(Object.prototype, "isModified", {
  value: function () {
    if (typeof this.tag !== "undefined") {
      if (this.tag === 3) {
        return true;
      } else {
        return false;
      }
    }
    return undefined;
  },
  writable: true,
  configurable: true,
  enumerable: false,
});

Object.defineProperty(Object.prototype, "isDeleted", {
  value: function () {
    if (typeof this.tag !== "undefined") {
      if (this.tag === 2) {
        return true;
      } else {
        return false;
      }
    }
    return undefined;
  },
  writable: true,
  configurable: true,
  enumerable: false,
});

Object.defineProperty(Object.prototype, "convertServerObjToClientObj", {
  value: function (srcObj) {
    try {
      const destObj = this;

      Object.getOwnPropertyNames(srcObj).forEach(function (val, idx, array) {
        if (Object.prototype.toString.call(srcObj[val]) === "[object Array]") {
          if (typeof destObj[val] !== "undefined") {
            // Child List
            if (destObj[val].length > 0) {
              // Extra Child with deleted tag (2) in Client Obj's ChildList will be removed
              for (let i = destObj[val].length - 1; i > -1; i--) {
                if (destObj[val][i].isDeleted()) {
                  destObj[val].splice(i, 1);
                }
              }
            }

            if (srcObj[val].length > 0) {
              // Extra Child with deleted tag (2) in Client Obj's ChildList will be removed
              for (let k = srcObj[val].length - 1; k > -1; k--) {
                if (srcObj[val][k].isDeleted()) {
                  srcObj[val].splice(k, 1);
                }
              }
            }

            if (destObj[val].length === srcObj[val].length) {
              // Equal no of rows in both side's childLists
              for (let j = 0; j < srcObj[val].length; j++) {
                // Must Remain Data in exact sequence in both Src and Dest's ChildList
                destObj[val][j] = destObj[val][j].convertServerObjToClientObj(
                  srcObj[val][j]
                );
              }
            }
          }
        } else if (
          Object.prototype.toString.call(srcObj[val]) === "[object Object]"
        ) {
          destObj[val] = destObj[val].convertServerObjToClientObj(srcObj[val]);
        } else {
          destObj[val] = srcObj[val];
        }
      });
      return destObj;
    } catch (e) {
      throw e;
    }
  },
});

// Array extension methods
Array.prototype.entityPush = function (entity: any, pk?: string, index?: number) {
  pk = typeof pk === "undefined" ? "id" : pk;

  if (typeof entity[pk] === "undefined") {
    return;
  }

  if (entity[pk] === 0 && entity.tag === 0) {
    // New Insert
    entity.tag = 4;

    if (this.length === 0) {
      entity[pk] = 1;
    } else {
      const _pk = Math.max.apply(
        Math,
        this.map(function (o) {
          return o[pk];
        })
      );
      entity[pk] = _pk + 1;
    }

    if (typeof index === "undefined" || index === null) {
      this.push(entity);
    } else {
      this.splice(index, 0, entity);
    }
    return;
  } else if (entity[pk] !== 0 && entity.tag === 0) {
    // Get From Server and Modify
    if (!index) {
      this.push(entity);
    } else {
      this.splice(index, 0, entity);
    }
    return;
  }
};

Array.prototype.entityPop = function (entity, pk?: any) {
  pk = typeof pk === "undefined" ? "id" : pk;

  if (typeof entity[pk] === "undefined") {
    return;
  }

  if (entity[pk] !== 0) {
    if (entity.tag === 4) {
      // Delete After Insert
      for (let index = 0; index < this.length; index++) {
        if (this[index][pk] === entity[pk]) {
          this.splice(index, 1);
          break;
        }
      }
    } else if (entity.tag === 0 || entity.tag === 3) {
      // Get Form Server then (Delete Or Delete after Edit)
      entity.tag = 2;
    }
  }
};

Array.prototype.entityReset = function (newObject, pkId) {
  try {
    if (newObject !== undefined) {
      const pk = "id";
      pkId = pkId === undefined ? newObject[pk] : pkId;

      // if object tag is 0 and new object id is  0 then system consider that such object is in insert mode
      let oldObject = null;

      if (newObject[pk] === 0 && newObject["tag"] === 0) {
        // New Insert
        oldObject = this.find((x) => {
          return x[pk] === pkId;
        });

        if (oldObject !== null) {
          const index = this.indexOf(oldObject);

          newObject[pk] = oldObject[pk];
          newObject["tag"] = 4;

          this[index] = {};
          this[index] = GlobalMethods.deepClone(newObject);
        }
      } else if (
        newObject[pk] !== 0 &&
        newObject["tag"] === 0 &&
        newObject["isDirty"] === false
      ) {
        // no change occured
        // do nothing
        return;
      } else if (
        newObject[pk] !== 0 &&
        newObject["tag"] === 3 &&
        newObject["isDirty"] === true
      ) {
        // Get From Server and Modify
        oldObject = this.find((x) => {
          return x[pk] === pkId;
        });

        if (oldObject !== null) {
          newObject = {};
          newObject = GlobalMethods.deepClone(oldObject);
        }
      }
    }
  } catch (e) {
    throw e;
  }
};

Array.prototype.convertServerListToClientList = function (srcList) {
  try {
    const destList = this;

    if (Object.prototype.toString.call(srcList) === "[object Array]") {
      if (destList.length > 0) {
        // Extra Child with deleted tag (2) in Client Obj's ChildList will be removed
        for (let i = destList.length - 1; i > -1; i--) {
          if (destList[i].isDeleted()) {
            destList.splice(i, 1);
          }
        }
      }
      if (srcList.length > 0) {
        // Extra Child with deleted tag (2) in Client Obj's ChildList will be removed
        for (let k = srcList.length - 1; k > -1; k--) {
          if (srcList[k].isDeleted()) {
            srcList.splice(k, 1);
          }
        }
      }
      if (destList.length === srcList.length) {
        // Equal no of rows in both side's childLists
        for (let j = 0; j < srcList.length; j++) {
          // Must Remain Data in exact sequence in both Src and Dest's ChildList
          destList[j] = destList[j].convertServerObjToClientObj(srcList[j]);
        }
      }
    }
    return destList;
  } catch (e) {
    throw e;
  }
};

Array.prototype.spliceObject = function (sourceToRemove) {
  // Remove the deleted entry from list
  const index = this.indexOf(sourceToRemove);
  if (index !== -1) {
    // Make sure the value exists
    this.splice(index, 1);
  }
  return index;
};

Array.prototype.spliceObjectByID = function (id: number) {
  // Remove the deleted entry from list
  const index = this.map((x) => {
    return x.id;
  }).indexOf(id);
  if (index !== -1) {
    // Make sure the value exists
    this.splice(index, 1);
  }
  return index;
};

// array move
// move up move(array, element, -1);
// move down move(array, element, 1);
Array.prototype.arrayMove = function (element, delta,elementIndex?:number) {
  const index =elementIndex??this.indexOf(element);
  const newIndex = index + delta;
  if (newIndex < 0 || newIndex === this.length) {
    return;
  } // Already at the top or bottom.
  const indexes = [index, newIndex].sort((a, b) => {
    return a - b;
  }); // Sort the indixes

  // Replace from lowest index, two elements, reverting the order
  this.splice(indexes[0], 2, this[indexes[1]], this[indexes[0]]);
  return;
};

Array.prototype.swapArrayPosition = function (arr, old_index, new_index) {
  let destList = this;
  if (!arr || !old_index || !new_index) {
    return arr;
  }

  if (Object.prototype.toString.call(arr) === "[object Array]") {
    if (new_index >= arr.length) {
      let k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    destList = arr;
  }
  return destList;
};

// converting boolean(isActive) to Yes/No text for data list while exporting pdf/xl
Array.prototype.convertBooleanToYesNo = function (property) {
  property = property ? property : "isActive";
  if (this.length !== 0 && typeof this[0][property] === "undefined") {
    return this;
  }

  const self = GlobalMethods.deepClone<any>(this);
  for (let i = 0; i < self.length; i++) {
    self[i][property] = self[i][property] === true ? "Yes" : "No";
  }
  return self;
};
