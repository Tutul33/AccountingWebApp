import { Injectable } from "@angular/core";
@Injectable()
export class CashFlowStatmentModelService {
  companyList: any[] = [];
  officeBranchList: any[] = [];
  projectList: any[] = [];
  isRefresh: boolean = true;
  constructor() { }

  prepareOrgList(res) {
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
      return orgList;
    } catch (error) {
      throw error;
    }
  }

  prepareData(input: any[]): any[] {
    const output: any[] = [];
    const groupMap = new Map<string, Map<string, any[]>>();
    for (const item of input) {
      if (!groupMap.has(item.groupName)) {
        groupMap.set(item.groupName, new Map());
      }
      const nameMap = groupMap.get(item.groupName)!;

      if (!nameMap.has(item.name)) {
        nameMap.set(item.name, []);
      }
      nameMap.get(item.name)!.push(item);
    }

    for (const [groupName, names] of groupMap) {
      output.push({ particular: groupName, amount: null });

      for (const [name, entries] of names) {
        if (entries[0].sln == 0) {
          output.push({ particular: `    ${name}`, amount: entries[0].amount });
        } else {
          output.push({ particular: `    ${name}`, amount: null });

        }

        for (const entry of entries) {
          if (entry.sln != 0) {
            output.push({ particular: `       ${entry.ledger}`, amount: Number(entry.amount).toFixed(2), ledger: entry.ledger });
          }
        }
      }
    }

    return output;
  }

}
