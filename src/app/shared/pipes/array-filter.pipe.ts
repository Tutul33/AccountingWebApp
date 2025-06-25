import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayFilter',
  pure: false,
  standalone:true
})
export class ArrayFilterPipe implements PipeTransform {
  transform(values: any, ...args: any[]): any {
    if(values.length > 0)
      {
        const filterObj = args[0];
        return values.filter(function(item) {
          for (var key in filterObj) {
            if (item[key] === undefined || item[key] != filterObj[key])
              return false;
          }
          return true;
        });
      }
      return values;
  }
}
