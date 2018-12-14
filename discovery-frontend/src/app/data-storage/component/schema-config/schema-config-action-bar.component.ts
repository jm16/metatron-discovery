/*
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { AbstractComponent } from '../../../common/component/abstract.component';
import { Component, ElementRef, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Field, FieldRole, LogicalType } from '../../../domain/datasource/datasource';

@Component({
  selector: 'schema-config-action-bar',
  templateUrl: 'schema-config-action-bar.component.html'
})
export class SchemaConfigActionBarComponent extends AbstractComponent {

  // timestamp field
  @Input('timestampField')
  private _timestampField: Field;
  // timestamp type
  @Input('timestampType')
  private _timestampType: string;
  // origin logical type list
  private _originLogicalTypeList: any[] = [
    {
      label: this.translateService.instant('msg.storage.ui.list.string'),
      icon: 'ddp-icon-type-ab',
      value: LogicalType.STRING,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.boolean'),
      icon: 'ddp-icon-type-tf',
      value: LogicalType.BOOLEAN,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.integer'),
      icon: 'ddp-icon-type-int',
      value: LogicalType.INTEGER,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.double'),
      icon: 'ddp-icon-type-float',
      value: LogicalType.DOUBLE,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.date'),
      icon: 'ddp-icon-type-calen',
      value: LogicalType.TIMESTAMP,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.lnt'),
      icon: 'ddp-icon-type-latitude',
      value: LogicalType.LNT,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.lng'),
      icon: 'ddp-icon-type-longitude',
      value: LogicalType.LNG,
      role: FieldRole.DIMENSION
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.integer'),
      icon: 'ddp-icon-type-int',
      value: LogicalType.INTEGER,
      role: FieldRole.MEASURE
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.double'),
      icon: 'ddp-icon-type-float',
      value: LogicalType.DOUBLE,
      role: FieldRole.MEASURE
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.geo.point'),
      icon: 'ddp-icon-type-point',
      value: LogicalType.GEO_POINT,
      role: FieldRole.DIMENSION,
      derived: true
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.geo.line'),
      icon: 'ddp-icon-type-line',
      value: LogicalType.GEO_LINE,
      role: FieldRole.DIMENSION,
      derived: true
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.geo.polygon'),
      icon: 'ddp-icon-type-polygon',
      value: LogicalType.GEO_POLYGON,
      role: FieldRole.DIMENSION,
      derived: true
    },
    {
      label: this.translateService.instant('msg.storage.ui.list.expression'),
      icon: 'ddp-icon-type-expression',
      value: LogicalType.USER_DEFINED,
      role: FieldRole.DIMENSION,
      derived: true
    }
  ];
  // origin action type list
  private _originActionTypeList = [
    { label: this.translateService.instant('msg.storage.ui.list.type'), value: 'CHANGE' },
    { label: this.translateService.instant('msg.storage.ui.list.del'), value: 'DELETE' },
  ];
  // origin role type list
  private _originRoleTypeList = [
    { label: this.translateService.instant('msg.storage.ui.list.dimension'), value: FieldRole.DIMENSION },
    { label: this.translateService.instant('msg.storage.ui.list.measure'), value: FieldRole.MEASURE }
  ];

  // checked field list
  public checkedFieldList: Field[] = [];

  // action type list
  public actionTypeList: any[] = [];
  // selected action type list
  public selectedActionType: any;
  // action type list show / hide flag
  public actionTypeListShowFlag: boolean;
  // role type list
  public roleTypeList: any[] = [];
  public selectedRoleType: any;
  // role type list show / hide flag
  public roleTypeListShowFlag: boolean;
  // logical type list
  public logicalTypeList: any[] = [];
  public selectedLogicalType: any;
  // logical type list show / hide flag
  public logicalTypeListShowFlag: boolean;
  // show flag
  public showFlag: boolean;

  // changed timestamp
  @Output()
  public changedTimestamp: EventEmitter<any> = new EventEmitter();
  // changed timestamp list
  @Output()
  public changedTimestampList: EventEmitter<any> = new EventEmitter();

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    // UI init
    this._initView();
  }

  /**
   * Init
   * @param {Field[]} fieldList
   */
  public init(fieldList: Field[]): void {
    // set field list
    this.checkedFieldList = fieldList;
    // set show flag
    this.showFlag = this.checkedFieldList.length !== 0;
    // if show
    if (this.showFlag) {
      // set action type list
      this._setActionTypeList();
      // init selected action type
      this._initSelectedActionType();
      // set role type list
      this._setRoleTypeList();
      // init selected role type
      this._initSelectedRoleType();
      // set logical type list
      this._setLogicalTypeList(this.selectedRoleType.value);
      // init selected logical type
      this._initSelectedLogicalType();
    } else {
      this._initView();
    }
  }

  /**
   * 체크 해제
   */
  public onClickUnSelected(): void {
    this.checkedFieldList.forEach(field => field.checked = false);
    // close
    this.showFlag = false;
    // UI init
    this._initView();
  }

  public onClickAction(): void {
    let changedTimestamp: boolean;
    // if DELETE action
    if ('DELETE' === this.selectedActionType.value) {
      this.checkedFieldList.forEach((field) => {
        // if field logical type TIMESTAMP
        if (LogicalType.TIMESTAMP === field.logicalType) {
          // set changed timestamp flag
          changedTimestamp = true;
        }
        // checked FALSE
        field.checked = false;
        // remove field
        field.unloaded = true;
      });
    } else if ('CHANGE' === this.selectedActionType.value) {  // if CHANGE action
      this.changedTimestampList.emit(this.checkedFieldList.reduce((acc, field) => {
        // if different role type
        if (this.selectedRoleType.value !== field.role) {
          // change role in field
          field.role = this.selectedRoleType.value;
        }
        // if different logical type
        if (this.selectedLogicalType.value !== field.logicalType) {
          // field logical type is TIMESTAMP
          if (LogicalType.TIMESTAMP === field.logicalType) {
            // set changed timestamp flag
            changedTimestamp = true;
          } else if (LogicalType.TIMESTAMP === this.selectedLogicalType.value) {  // if change type is TIMESTAMP
            // set changed timestamp flag
            changedTimestamp = true;
            // push timestamp field
            acc.push(field);
          }
          // change logical type in field
          field.logicalType = this.selectedLogicalType.value;
        }
        // checked FALSE
        field.checked = false;
        // return
        return acc;
      }, []));
    }
    //
    changedTimestamp && this.changedTimestamp.emit();
    // close
    this.showFlag = false;
    // UI init
    this._initView();
  }

  /**
   * Selected action type change event
   * @param type
   */
  public onChangeActionType(type: any): void {
    if (type.value !== this.selectedActionType.value) {
      this.selectedActionType = type;
      // is CHANGE action type
      if (type.value === 'CHANGE') {
        // set logical type list
        this._setLogicalTypeList(type.value);
        // init selected logical type
        this._initSelectedLogicalType();
      }
    }
  }

  /**
   * Selected role type change event
   * @param type
   */
  public onChangeRoleType(type: any): void {
    if (type.value !== this.selectedRoleType.value) {
      // set selected role type
      this.selectedRoleType = type;
      // set logical type list
      this._setLogicalTypeList(type.value);
      // init selected logical type
      this._initSelectedLogicalType();
    }
  }

  /**
   * Selected logical type change event
   * @param type
   */
  public onChangeLogicalType(type: any): void {
    if (type.value !== this.selectedLogicalType.value) {
      this.selectedLogicalType = type;
    }
  }

  /**
   * UI init
   * @private
   */
  private _initView(): void {
    // init action type list
    this.actionTypeList = this._originActionTypeList;
    // init selected action type
    this.selectedActionType = null;
    // init role type list
    this.roleTypeList = this._originRoleTypeList;
    // init selected role type
    this.selectedRoleType = null;
    // init selected logical type
    this.selectedLogicalType = null;
  }

  /**
   * Set action type list
   * @private
   */
  private _setActionTypeList(): void {
    // if exist derived field
    if (this.checkedFieldList.some(field => field.derived)) {
      // only action type delete
      this.actionTypeList = this._originActionTypeList.filter(type => type.value === 'DELETE');
    } else {
      this.actionTypeList = this._originActionTypeList;
    }
  }

  /**
   * Set role type list
   * @private
   */
  private _setRoleTypeList(): void {
    // if exist selected TIMESTAMP field
    if (this.checkedFieldList.some(field => this._timestampType === 'FIELD' && field === this._timestampField)) {
      this.roleTypeList = this._originRoleTypeList.filter(type => FieldRole.DIMENSION === type.value);
    } else {
      this.roleTypeList = this._originRoleTypeList;
    }
  }

  /**
   * Set logical type list
   * @param {FieldRole} type
   * @private
   */
  private _setLogicalTypeList(type: FieldRole): void {
    if (FieldRole.DIMENSION === type) {
      // if exist selected TIMESTAMP field
      if (this.checkedFieldList.some(field => this._timestampType === 'FIELD' && field === this._timestampField)) {
        this.logicalTypeList = this._originLogicalTypeList.filter(type => LogicalType.TIMESTAMP === type.value);
      } else if (this.checkedFieldList.every(field => field.type === LogicalType.STRING.toString())) { // if all checked field list type are STRING
        this.logicalTypeList = this._originLogicalTypeList.filter(type => FieldRole.DIMENSION === type.role && LogicalType.USER_DEFINED !== type.value);
      } else {
        this.logicalTypeList = this._originLogicalTypeList.filter(type => FieldRole.DIMENSION === type.role && !type.derived);
      }
    } else if (FieldRole.MEASURE === type) {
      this.logicalTypeList = this._originLogicalTypeList.filter(type => type.role === FieldRole.MEASURE);
    }
  }

  /**
   * Init selected action type
   * @private
   */
  private _initSelectedActionType(): void {
    // if not exist selected action type OR not exist selected action type in action type list
    if (!this.selectedActionType || this.actionTypeList.every(type => type !== this.selectedActionType)) {
      // set action type
      this.selectedActionType =  this.actionTypeList[0];
    }
  }

  /**
   * Init selected role type
   * @private
   */
  private _initSelectedRoleType(): void {
    // if not exist selected role type OR not exist selected role type in role type list
    if (!this.selectedRoleType || this.roleTypeList.every(type => type !== this.selectedRoleType)) {
      // set role type
      this.selectedRoleType = this.roleTypeList[0];
    }
  }

  /**
   * Init selected logical type
   * @private
   */
  private _initSelectedLogicalType(): void {
    // if not exist selected logical type OR not exist selected logical type in logical type list
    if (!this.selectedLogicalType || this.logicalTypeList.every(type => type !== this.selectedLogicalType)) {
      // set logical type
      this.selectedLogicalType = this.logicalTypeList[0];
    }
  }
}
