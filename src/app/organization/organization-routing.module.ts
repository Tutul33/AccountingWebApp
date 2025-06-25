import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ChangeIndustrialTypeComponent,
  OrgStructureComponent,
  OrgStructureListComponent,
  ReportingOrganizationStructureComponent,
  ReportingOrgByDesigComponent,
  StructureElementsComponent,
  ORGHeadDesignationComponent,
  OrgReportMappingComponent,
  OrganizationReportingPersonComponent,
  CompanyInformationRootComponent
} from './index';

const routes: Routes = [
  { path: 'change-industrial-type', component: ChangeIndustrialTypeComponent },
  { path: 'org-structure', component: OrgStructureComponent },
  { path: 'structure-elements', component: StructureElementsComponent },
  { path: 'org-structure-list', component: OrgStructureListComponent },
  { path: 'reporting-org-structure', component: ReportingOrganizationStructureComponent },
  { path: 'reporting-org-by-desig', component: ReportingOrgByDesigComponent },
  { path: 'org-head-designation', component: ORGHeadDesignationComponent },
  { path: 'org-report-mapping', component: OrgReportMappingComponent },
  { path: 'company-information', component: CompanyInformationRootComponent },
  { path: 'org-reporting-person', component: OrganizationReportingPersonComponent },
 ];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationRoutingModule { }
