import { Observable } from 'rxjs';
import { Component, ElementRef, HostListener, Inject, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';


import { sampleCustomers } from './customers';
import { Product } from './model';
import { EditService } from './edit.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  public view: Observable<GridDataResult>;
  public gridState: State = {
      sort: [],
      skip: 0,
      take: 10
  };
  public formGroup: FormGroup;

  private editService: EditService;
  private editedRowIndex: number;

  constructor(@Inject(EditService) editServiceFactory: any) {
      this.editService = editServiceFactory();
  }

  public ngOnInit(): void {
      this.view = this.editService.pipe(map(data => process(data, this.gridState)));

      this.editService.read();
  }

  public onStateChange(state: State) {
      this.gridState = state;

      this.editService.read();
  }

  public addHandler({sender}) {
      this.closeEditor(sender);

      this.formGroup = new FormGroup({
          'ProductID': new FormControl(),
          'ProductName': new FormControl('', Validators.required),
          'UnitPrice': new FormControl(0),
          'UnitsInStock': new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,3}')])),
          'Discontinued': new FormControl(false)
      });

      sender.addRow(this.formGroup);
  }

  public editHandler({sender, rowIndex, dataItem}) {
      this.closeEditor(sender);

      this.formGroup = new FormGroup({
          'ProductID': new FormControl(dataItem.ProductID),
          'ProductName': new FormControl(dataItem.ProductName, Validators.required),
          'UnitPrice': new FormControl(dataItem.UnitPrice),
          'UnitsInStock': new FormControl(
                  dataItem.UnitsInStock,
                  Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,3}')])),
          'Discontinued': new FormControl(dataItem.Discontinued)
      });

      this.editedRowIndex = rowIndex;

      sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({sender, rowIndex}) {
      this.closeEditor(sender, rowIndex);
  }

  public saveHandler({sender, rowIndex, formGroup, isNew}) {
      const product: Product = formGroup.value;

      this.editService.save(product, isNew);

      sender.closeRow(rowIndex);
  }

  public removeHandler({dataItem}) {
      this.editService.remove(dataItem);
  }

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
      grid.closeRow(rowIndex);
      this.editedRowIndex = undefined;
      this.formGroup = undefined;
  }



  //   public toggleText = 'Show';
  //   public show = false;

  //   @ViewChild('anchor') public anchor: ElementRef;
  //   @ViewChild('popup', { read: ElementRef }) public popup: ElementRef;

  //   @HostListener('keydown', ['$event'])
  //   public keydown(event: any): void {
  //       if (event.keyCode === 27) {
  //           this.toggle(false);
  //       }
  //   }

  //   @HostListener('document:click', ['$event'])
  //   public documentClick(event: any): void {
  //       if (!this.contains(event.target)) {
  //         this.toggle(false);
  //       }
  //   }

  //   public toggle(show?: boolean): void {
  //       this.show = show !== undefined ? show : !this.show;
  //       this.toggleText = this.show ? 'Hide' : 'Show';
  //   }

  //   private contains(target: any): boolean {
  //       return this.anchor.nativeElement.contains(target) ||
  //           (this.popup ? this.popup.nativeElement.contains(target) : false);
  //   }

  // public gridData: any[] = sampleCustomers;

  // public columns: string[] = [
  //   'CompanyName', 'ContactName', 'ContactTitle'
  // ];

  // public hiddenColumns: string[] = [];

  // public isHidden(columnName: string): boolean {
  //   return this.hiddenColumns.indexOf(columnName) > -1;
  // }

  // public isDisabled(columnName: string): boolean {
  //   return this.columns.length - this.hiddenColumns.length === 1 && !this.isHidden(columnName);
  // }

  // public hideColumn(columnName: string): void {
  //   const hiddenColumns = this.hiddenColumns;

  //   if (!this.isHidden(columnName)) {
  //     hiddenColumns.push(columnName);
  //   } else {
  //     hiddenColumns.splice(hiddenColumns.indexOf(columnName), 1);
  //   }
  // }
}
