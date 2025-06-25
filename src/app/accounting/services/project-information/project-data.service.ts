import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Config } from '../../index';
import { ApiService } from 'src/app/shared/services/api.service';
import { ProjectDTO } from '../../models/project-information/project.model';

@Injectable()
export class ProjectDataService {

  controllerName = Config.url.accountingLocalUrl + "Project"; 

  constructor(private apiSvc: ApiService) { }

    saveSubLedger(projectDTO: ProjectDTO): Observable<any> {
      return this.apiSvc.save(`${this.controllerName}/Save`, projectDTO, true);
    }
  
    saveProjectUpload(spData: any,fileOption:any) 
    {
      return this.apiSvc
      .save(`${this.controllerName}/SaveProjectUpload`,fileOption, true)
      .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }
    remove(id: number): Observable<any> {
      return this.apiSvc
      .executeQuery(`${this.controllerName}/Delete`, { id: id})
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
    }
  
    getProjectList(spData : any){
      return this.apiSvc.executeQuery(this.controllerName + "/GetProjectList", { data: JSON.stringify(spData) })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }
}
