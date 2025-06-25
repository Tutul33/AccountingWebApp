import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { AppMsgService } from './services/app-msg.service';
import { DefaultService } from './services/default.service';
import { ToastrService } from 'ngx-toastr';

// Third party module
import { TableModule } from "primeng/table";
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { NiTableModule } from './components/table/table';
import { PaginatorModule } from 'primeng/paginator';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { ChipModule } from 'primeng/chip';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TreeSelectModule } from 'primeng/treeselect';
import { DatePickerModule } from 'primeng/datepicker';


import { DialogService } from 'primeng/dynamicdialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { NiEditTextDirective } from './directives/ni-edit-text.directive';

import { TreeModule } from 'primeng/tree';
import { FileUploadModule } from 'primeng/fileupload';
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SideNavComponent } from './components/side-nav/side-nav.component';

import { NiLoadImageDirective } from './directives/ni-load-image.directive';
import { NiFileDownloadDirective } from './directives/ni-file-download.directive';

import { ConfirmOTPComponent,NiWebcamComponent } from './index';

import { AddChangeDirective } from './directives/add-change.directive';
import { ValidatorDirective } from './directives/validator.directive';
import { ImageGalleryComponent } from './components/image-gallery/image-gallery.component';
import { NiFileSingleViewComponent } from './components/ni-file-single-view.component';
import { NiFileSingleUploadComponent } from './components/ni-file-single-upload.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { NiMultipleFileViewComponent } from './components/ni-multiple-file-view/ni-multiple-file-view.component';
import { ArrayFilterPipe } from './pipes/array-filter.pipe';
import { NiBooleanPipe } from './pipes/ni-boolean.pipe';
import { NiSafeHtml } from './pipes/ni-safe-html.pipe';
import { NiSafeStyle } from './pipes/ni-safe-style.pipe';
import { DdPropertyBindingDirective } from './directives/dd-property-binding.directive';
import { ValidationMessageDirective } from './directives/validation-message.directive';

import { NiGridDirective } from './directives/ni-grid.directive';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { NiDbclickPreventDirective } from './directives/ni-dbclick-prevent.directive';
import { BaseComponent } from './components/base/base.component';
import { NiTableComponent } from './components/ni-table/ni-table.component';
import { NiIntegerDirective } from './directives/ni-integer.directive';
import { NiDecimalDirective } from './directives/ni-decimal.directive';
import { NiSelectDirective } from './directives/ni-select.directive';
import { NiSelectedTextDirective } from './directives/ni-selected-text.directive';
import { AddValidatorsDirective } from './directives/add-validators.directive';
import { NativeElementInjectorDirective } from './directives/native-element-injector.directive';
import { MultiSelectModule } from './components/multiselect/multiselect';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AutoCompleteModule } from './components/autocomplete/autocomplete';
import { BreadcrumbModule as PrimeNGBreadcrumbModule } from 'primeng/breadcrumb';

import { MenuModule } from 'primeng/menu';
import { AddressPickerComponent } from './components/address-picker/address-picker.component';
import { ListboxModule } from 'primeng/listbox';

import { PasswordModule } from 'primeng/password';
import { TabViewModule } from 'primeng/tabview';
import { EditorModule } from 'primeng/editor';
import { ColorPickerModule } from 'primeng/colorpicker';
import { CustomRowToggler } from '../shared/components/ni-table/ni-table.component';
import { CarouselModule } from 'primeng/carousel';

import { KeyboardComponent } from './components/keyboard/keyboard.component'; 
import { KeyboardService } from './services/keyboard.service'; 
import { OskInputDirective } from './directives/osk-input.directive'; 
import { KeyboardKeyDirective } from './directives/keyboard-key.directive'; 


import { NumericKeyboardComponent } from './components/numeric-keyboard/numeric-keyboard.component'; 
import { NumericKeyboardService } from './services/numeric-keyboard.service';
import { NumOskInputDirective } from './directives/num-osk-input.directive'; 
import { NumericKeyboardKeyDirective } from './directives/numeric-keyboard-key.directive'; 
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SelectSingleItemDirective } from './directives/selected-single-item.directive';
import { NiHideCutCopyPasteToasterDirective } from './directives/ni-hideCutCopyPasteToaster.directive';
import { OfflineComponent } from './components/offline/offline.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { AccordionModule } from 'primeng/accordion';
import { IsolateFormDirective } from './directives/ni-isolate-form.directive';
import { ShortAddressComponent } from './components/short-address/short-address.component';
import { AddressComponent } from './components/address/address.component';
import { OrganizationSearchComponent } from './components/organization-search/organization-search.component';
import { EmailSendComponent } from './components/email-send/email-send.component';
import { SelectModule } from 'primeng/select';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Tooltip } from 'primeng/tooltip';

@NgModule({  
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,  
    DatePickerModule,  
    PanelModule,
    DialogModule,
    DropdownModule,
    SelectModule,
    MultiSelectModule,
    SliderModule,
    TableModule,
    NiTableModule,
    PaginatorModule,
    CalendarModule,
    ButtonModule,
    ChipModule,
    OrganizationChartModule,
    TreeSelectModule,
    DynamicDialogModule,
    InputTextModule,
    TextareaModule,
    FileUploadModule,
    SidebarModule,
    TreeModule,
    PanelMenuModule,
    GalleriaModule,
    InputSwitchModule,
    AutoCompleteModule,    
    PrimeNGBreadcrumbModule,
    MenuModule,
    ListboxModule,   
    PasswordModule,
    TabViewModule,
    EditorModule,
    ColorPickerModule,
    CarouselModule,
    ProgressSpinnerModule,
    GoogleMapsModule,
    AccordionModule,
    NiEditTextDirective,    
    SideNavComponent,
    ValidatorDirective,
    AddChangeDirective,
    FileUploadComponent,
    ImageGalleryComponent,
    NiLoadImageDirective,
    NiFileDownloadDirective,
    NiFileSingleUploadComponent,
    NiFileSingleViewComponent,
    NiWebcamComponent,
    NiMultipleFileViewComponent,
    ArrayFilterPipe,
    NiBooleanPipe,
    NiSafeHtml,
    NiSafeStyle,
    DdPropertyBindingDirective,
    ValidationMessageDirective,
    NativeElementInjectorDirective,
    NiGridDirective,
    ConfirmModalComponent,
    NiDbclickPreventDirective,
    BaseComponent, 
    NiTableComponent,
    NiIntegerDirective,
    NiDecimalDirective,
    NiSelectDirective,
    IsolateFormDirective,
    NiSelectedTextDirective,
    AddValidatorsDirective,    
    AddressPickerComponent,
    ConfirmOTPComponent,
    CustomRowToggler,
    KeyboardComponent, 
    OskInputDirective, 
    KeyboardKeyDirective,
    NumericKeyboardComponent,
    NumOskInputDirective,
    NumericKeyboardKeyDirective,
    SpinnerComponent,
    SelectSingleItemDirective,
    NiHideCutCopyPasteToasterDirective,
    OfflineComponent,
    ShortAddressComponent,
    AddressComponent,
    OrganizationSearchComponent,
    EmailSendComponent,
    TabsModule,
    Tooltip
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    DatePickerModule,
    PanelModule,
    DialogModule,
    DropdownModule,
    SelectModule,
    MultiSelectModule,
    SliderModule,
    TableModule,
    NiTableModule,
    PaginatorModule,
    CalendarModule,
    AutoCompleteModule,
    ButtonModule,
    ChipModule,
    OrganizationChartModule,
    TreeSelectModule,
    DynamicDialogModule,
    InputTextModule,
    TextareaModule,
    NiEditTextDirective,    
    FileUploadModule,
    SidebarModule,
    PanelMenuModule,
    GalleriaModule,
    SideNavComponent,
    AddChangeDirective,
    ValidatorDirective,
    FileUploadComponent,
    ImageGalleryComponent,
    NiLoadImageDirective,
    NiFileDownloadDirective,
    NiFileSingleUploadComponent,
    NiFileSingleViewComponent,
    NiWebcamComponent,
    NiMultipleFileViewComponent,
    ArrayFilterPipe,
    NiBooleanPipe,
    NiSafeHtml,
    NiSafeStyle,
    DdPropertyBindingDirective,
    TreeModule,
    ValidationMessageDirective,
    NativeElementInjectorDirective,
    NiGridDirective,
    NiDbclickPreventDirective,
    BaseComponent,
    NiTableComponent,
    NiIntegerDirective,
    NiDecimalDirective,
    NiSelectDirective,
    IsolateFormDirective,
    NiSelectedTextDirective,
    AddValidatorsDirective,
    InputSwitchModule,
    PrimeNGBreadcrumbModule,
    MenuModule,
    AddressPickerComponent,
    ListboxModule,
    ConfirmOTPComponent,
    PasswordModule,
    TabViewModule,
    EditorModule,
    ColorPickerModule,
    CustomRowToggler,
    CarouselModule,
    KeyboardComponent, 
    OskInputDirective, 
    KeyboardKeyDirective,
    NumericKeyboardComponent,
    NumOskInputDirective,
    NumericKeyboardKeyDirective,
    SelectSingleItemDirective,
    SpinnerComponent,
    NiHideCutCopyPasteToasterDirective,
    OfflineComponent,
    GoogleMapsModule,
    AccordionModule,
    ShortAddressComponent, 
    AddressComponent,
    OrganizationSearchComponent,
    TabsModule,
    Tooltip
  ],
  providers: [
      ToastrService,
      DefaultService, 
      AppMsgService,
      DialogService,
      KeyboardService,
      NumericKeyboardService,
      AddValidatorsDirective
    ],
})
export class SharedModule { }
