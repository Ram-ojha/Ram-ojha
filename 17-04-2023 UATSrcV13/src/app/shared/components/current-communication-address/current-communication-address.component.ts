import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ApplicationVehicleRegData } from 'src/app/models/bike-insu.Model';
import { PATTERN } from 'src/app/models/common';
import { ICity, IPincode, IState } from 'src/app/models/common.Model';
import { RequireMatch, RequireMatchCity, RequireMatchPincode } from 'src/app/pos-insurance/bike-insurance/buyplan/buyplan.component';
import { VehicleBuyPlanService } from 'src/app/pos-insurance/services/vehicle-buyplan.service';
import { postCurrentAddress } from 'src/app/models/constants'
@Component({
  selector: 'app-current-communication-address',
  templateUrl: './current-communication-address.component.html',
  styleUrls: ["./current-communication-address.component.css"]
})
export class CurrentCommunicationAddressComponent implements OnInit, AfterViewInit {
  currentAddressForm!: FormGroup;
  PopUp!: boolean;

  // @Input() filteredautoPincodeList:any
  @Input() filterList: any;
  @Input() isVisible: boolean = false;
  @Input() insuranceCateCode: number = 0;
  @Input() openBy!: string;
  @Input('getRTO') getRTO: any;
  @Input('postData') postData: any
  @Input('PlanData') PlanData: any
  @Output() closePopupClick = new EventEmitter<any>();
  selectedTab!: number;

  public stateList: IState[] = [];
  public filterStateList!: Observable<IState[]>;
  public cityList: ICity[] = [];
  public filterCityList: ICity[] = [];
  public pincodeList: IPincode[] = [];
  filteredCityList!: Observable<ICity[]>;
  searchState!: IState[];
  filteredautoPincodeList!: Observable<IPincode[] | undefined>;
  _subscriptions: any[] = [];

  errorLogDetails: any;
  filterState!: IState[];
  errMsg_add!: string;

  // closePopupClick: any;


  constructor(private _fb: FormBuilder, private _vehicleBuyPlanService: VehicleBuyPlanService, private http: HttpClient) {

  }

  ngOnInit() {

    this.currentAddressForm = this._fb.group({
      area: ["", [Validators.required, Validators.maxLength(30)]], // earlier 15
      pincode: [
        "",
        [
          Validators.required,
          Validators.maxLength(6),
          Validators.pattern(PATTERN.PINCODE),
        ],
      ],
      postalAdd: ["", [Validators.required, Validators.maxLength(30)]],
      state: ["", Validators.required],
      city: ["", Validators.required],
    });
    this.getData()
  }

  ngAfterViewInit(): void {
    this.getData()
  }

  private getData() {

    this._subscriptions.push(
      this._vehicleBuyPlanService.getPraposalMaster(this.PlanData.CompanyCode).subscribe(
        (result) => {

          console.log("=====--=-=-=-=-=->", result)
          if (result.successcode == "1") {

            this.stateList = result.data.State;
            // if(this.getRTO)
            // this.filterState = this.stateList.filter(m => {
            //   return m.StateShortDesc.toString() == this.getRTO.slice(0, 2)});

            this.filterStateList = this.currentAddressForm.controls[
              "state"
            ].valueChanges.pipe(
              startWith(""),
              map((state) => this._filterState(state))
            );
            this.cityList = result.data.City;
            this.filterStateList = this.currentAddressForm.controls[
              "state"
            ].valueChanges.pipe(
              startWith(""),
              map((state) => this._filterState(state)));
            this.filterStateList.subscribe(res => {
              console.log('flitrer state ', res)
              if (!res) return;
              this.filterState = res.filter(m => {
                return m.StateShortDesc.toString() // == this.getRTO.slice(0, 2)
              })

            });
            this.setStateValidator();
            this.setCityValidator();
            // this.insuCompanyList = result.data.Insurance_Company;

            this.filterCityList = [];
          }
        }
      )
    )
  }

  onSubmitAddress() {

    console.log(this.currentAddressForm)
    if (this.currentAddressForm.invalid) {
      this.errMsg_add = "Please fill all details correctly.";
      return false;
    }
    let rv = new ApplicationVehicleRegData();
    const add = this.currentAddressForm.value
    rv.ApplicationNo = this.postData.ApplicationNo
    rv.ApplicationNoOdp = this.postData.ApplicationNoOdp
    rv.PINCode = add.pincode;
    rv.PostalAdd = add.postalAdd;
    rv.Area = add.area;
    let stateData: any = this.stateList.find((x) => x.StateDesc == add.state);
    let cityData: any = this.cityList.find((x) => x.CityDesc == add.city);

    if (add.state) {
      rv.StateCode = stateData.StateCode;
      rv.StateDesc = stateData.StateDesc;
    }
    if (add.city) {
      rv.CityCode = cityData.CityCode;
      rv.CityDesc = cityData.CityDesc;
    }
    rv.InsuranceCompCode = this.PlanData.CompanyCode;
    rv.InsuranceCompDesc = this.PlanData.ProductName;
    console.log("dfsfds", rv)
    this.http.post(postCurrentAddress, rv).subscribe((res: any) => {
      console.log(res)

      if (res.successcode === '1') {
        this.closePopupClick.emit(false);
        return;
      }
      this.closePopupClick.emit(true)

    })
    return;
  }

  get af() {
    return this.currentAddressForm;
  }
  closePopup() {
    this.selectedTab = 0;
    this.onSubmitAddress()
    if (this.currentAddressForm.valid) {
      const AddressForm = this.currentAddressForm.value;

      this.closePopupClick.emit(false);
    } else {
      this.closePopupClick.emit(true);
    }
  }

  async onChangeStateInput() {

    if (
      this.stateList.find(
        (state) => state.StateDesc === this.currentAddressForm.value.state
      )
    )
      this.onChangeState();
  }
  async onChangeState() {

    // const stateCode = this.currentAddressForm.get('state').value ? this.currentAddressForm.get('state').value.split(',')[0] : 0;
    //   this.filterCityList = stateCode ? this.cityList.filter((city: ICity) => city.StateCode == stateCode) : [];
    const sts = this.currentAddressForm.get("state")!.value; //st.name
    this.currentAddressForm.get("city")!.reset();
    this.searchState = sts
      ? this.stateList.filter((st: IState) => st.StateDesc == sts)
      : [];
    let stateCode: any;
    const stateCo = this.searchState.find((e) => {
      stateCode = e.StateCode;
    });
    this.filterCityList = stateCode
      ? this.cityList.filter((city: ICity) => city.StateCode == stateCode)
      : [];
    this.currentAddressForm.controls["city"].reset();
    this.filteredCityList = this.currentAddressForm.controls["city"].valueChanges.pipe(
      startWith(""),
      map((city) => this._filterCity(city))
    );
  }
  // onChangeCityInput() {
  //   setTimeout(() => {
  //     if (
  //       !this.cityList.find(
  //         (city) => city.CityDesc === this.currentAddressForm.value.city
  //       )
  //     ) {
  //       this.currentAddressForm.patchValue({
  //         city: "",
  //       });
  //     }
  //   }, 1000);
  // }

  onChangeCityInput() {
    if (
      this.cityList.find(
        (City) => City.CityDesc === this.currentAddressForm.value.city
      )
    ) {

      this.onChangeCity();
    }
  }
  async onChangeCity() {


    let cts = this.currentAddressForm.get("city")!.value;
    let city: ICity | undefined = this.cityList.find(
      (City) => City.CityDesc === cts
    )
    this.currentAddressForm.get("pincode")!.reset();
    // this.showLoader = true;
    this._subscriptions.push(
      this._vehicleBuyPlanService.GetPincode(cts, city!.StateDesc).subscribe((result) => {

        // this.showLoader = false;
        this.pincodeList = result.data;
        this.setPincodeValidator();
        this.filteredautoPincodeList = this.currentAddressForm.controls[
          "pincode"
        ].valueChanges.pipe(
          startWith(""),
          map((pincode) => this._filterPincode(pincode))
        );
      })
    );
  }
  async onChangePinCodeInput() {
    // setTimeout(() => {
    //   if (
    //     !this.pincodeList.find(
    //       (pincode) => pincode.Pincode === this.currentAddressForm.value.pincode
    //     )
    //   ) {
    //     this.currentAddressForm.patchValue({
    //       pincode: "",
    //     });
    //   }
    // }, 1000);
  }
  async onChangePincode() {
    const pin = this.currentAddressForm.get("pincode")!.value;
  }


  private _filterState(value: string): IState[] {
    const filterBy = value ? value.toLowerCase() : value;
    // if (filterBy)
    return this.stateList.filter(
      (row) => row.StateDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterCity(value: string): ICity[] {
    const filterBy = value ? value.toLowerCase() : value;
    // if (filterBy)
    return this.filterCityList.filter(
      (row) => row.CityDesc.toLowerCase().indexOf(filterBy) === 0
    );
  }
  private _filterPincode(value: string): IPincode[] | undefined {
    const filterBy = value;

    if (filterBy !== null && this.pincodeList !== null) {
      return this.pincodeList.filter(
        (option) => option.Pincode.toString().trim().indexOf(filterBy) === 0
      );
    } else {
      return undefined
    }

  }

  setStateValidator() {
    this.af
      .get("state")!
      .setValidators([Validators.required, RequireMatch(this.stateList)]);
    this.af.get("state")!.updateValueAndValidity();
  }

  setCityValidator() {
    this.af
      .get("city")!
      .setValidators([Validators.required, RequireMatchCity(this.cityList)]);
    this.af.get("city")!.updateValueAndValidity();
  }


  setPincodeValidator() {
    this.af
      .get("pincode")!
      .setValidators([
        Validators.required,
        RequireMatchPincode(this.pincodeList),
      ]);
    this.af.get("pincode")!.updateValueAndValidity();
  }

  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
