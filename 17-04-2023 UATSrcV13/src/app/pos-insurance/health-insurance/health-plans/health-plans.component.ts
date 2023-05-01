import { errorLog, InsuranceCompany } from "./../../../models/common.Model";
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  ApplicationVehiclePlan,
  IApplicationVehiclePlan,
} from "src/app/models/bike-insu.Model";
import { HealthBuyPlanService } from "../../services/health-buyplan.service";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import {
  IHealthInsPlanUrlsResponse,
  IPlansHealth,
} from "src/app/models/health-insu.Model";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { HealthPlanFeaturesDialog } from "./health-plan-features-dialog";
import { decrypt, encrypt } from "src/app/models/common-functions";
import { Covers } from "src/app/models/common";
import { QuotesSharingModalComponent } from "src/app/shared/components/quotes-sharing-modal/quotes-sharing-modal.component";
import { NgxCaptureService } from "ngx-capture";
import { ApiResponse } from "src/app/models/api.model";
import { Subscription } from "rxjs";

interface Pokemon {
  value: string;
  viewValue: string;
}

// interface PokemonGroup {
//   disabled?: boolean;
//   name: string;
//   pokemon: Pokemon[];
// }

@Component({
  templateUrl: "./health-plans.component.html",
  styleUrls: ["./health-plans.component.css"],
  encapsulation: ViewEncapsulation.Emulated, //Emulated, None, ShadowDom
})
export class HealthPlansComponent implements OnInit, OnDestroy {
  @ViewChild("shareQuotesModal", { static: false }) shareQuotesModal!: QuotesSharingModalComponent;
  @ViewChild("screen", { static: true }) screen: any;

  private _subscriptions: any[] = [];
  // new dilshad
  showLoader = false;
  postData: IApplicationVehiclePlan = new ApplicationVehiclePlan();
  planApiurls: IHealthInsPlanUrlsResponse[] = [];
  planResponse: any = [];
  filteredData: any = [];
  planLoader = false;

  companies = new FormControl(new Array("Insurer"));
  insurersList: InsuranceCompany[] = [];
  coverList = Covers;

  FeatureCate: any = [];
  FeatureSubCate: any = [];
  SpecialFeatureRow: any = [];
  completed!: boolean;
  Premium: any;
  FilterHoldPlan: any = [];
  premiumList: any = [];
  FeaturesCount: number = 1;
  healthQuotes: any = [];
  RemainingCompanies: any = [];
  RemainCompanies: any = [];
  ReCompanies: any = [];
  RemainCompaniesAdd: any = [];
  plansNotMatchingFeatures: any = [];
  //ProductPremium: number = 0;
  // premiumList = [
  //   { Value: '300,500', Text: 'Rs 300 - Rs 500' },
  //   { Value: '500,600', Text: 'Rs 500 - Rs 600' },
  //   { Value: '600,1000', Text: 'Rs 600 - Rs 1000' },
  //   { Value: '1000,1500', Text: 'Rs 1000 - Rs 1500' },
  //   { Value: '1500,2500', Text: 'Rs 1500 - Rs 2500' },
  //   { Value: '2500,7000', Text: 'Rs 2500 +' },
  // ];

  // pokemonGroups: PokemonGroup[] = [
  //   {
  //     name: 'Grass',
  //     pokemon: [
  //       { value: 'bulbasaur-0', viewValue: 'Bulbasaur' },
  //       { value: 'oddish-1', viewValue: 'Oddish' },
  //       { value: 'bellsprout-2', viewValue: 'Bellsprout' }
  //     ]
  //   },
  //   {
  //     name: 'Water',
  //     pokemon: [
  //       { value: 'squirtle-3', viewValue: 'Squirtle' },
  //       { value: 'psyduck-4', viewValue: 'Psyduck' },
  //       { value: 'horsea-5', viewValue: 'Horsea' }
  //     ]
  //   },
  //   {
  //     name: 'Fire',
  //     disabled: true,
  //     pokemon: [
  //       { value: 'charmander-6', viewValue: 'Charmander' },
  //       { value: 'vulpix-7', viewValue: 'Vulpix' },
  //       { value: 'flareon-8', viewValue: 'Flareon' }
  //     ]
  //   },
  //   {
  //     name: 'Psychic',
  //     pokemon: [
  //       { value: 'mew-9', viewValue: 'Mew' },
  //       { value: 'mewtwo-10', viewValue: 'Mewtwo' },
  //     ]
  //   }
  // ];
  animal!: string;
  responseCount: number = 0;
  planFilter = { sumInsured: 500000, Tanure: 1, premium: 0 };
  disableFilter: boolean = true;
  FeaturesDialog: string = "none";
  // QuotationNo1: any;
  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _healthBuyPlanService: HealthBuyPlanService,
    private _errorHandleService: ErrorHandleService,
    private _dialog: MatDialog,
    private screenCaptureService: NgxCaptureService
  ) { }

  posMobileNo: any;
  errorLogDetails = {} as unknown as errorLog;
  errors: errorLog[] = [];
  ApplicationNo: any;
  ngOnInit() {
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    this._subscriptions.push(
      this._route.paramMap.subscribe((p) => {
        const No: any = p.get("a_id");
        const Odp: any = p.get("odp");
        this.postData.ApplicationNo = Number(decrypt(No));
        this.postData.ApplicationNoOdp = Number(decrypt(Odp));
        this.getData(
          this.postData.ApplicationNo,
          this.postData.ApplicationNoOdp
        );
      })
    );
    this.healthQuotes = JSON.parse(
      decrypt(sessionStorage.getItem("healthQuotes")!)
    );
    console.log(this.healthQuotes);
  }

  filterPremium() {
    if (this.planFilter.premium == 1) {
      this.filteredData = this.filteredData.sort((a: any, b: any) =>
        Number(a.Premium) > Number(b.Premium) ? 1 : -1
      );
    } else if (this.planFilter.premium == 2) {
      this.filteredData = this.filteredData.sort((a: any, b: any) =>
        Number(a.Premium) > Number(b.Premium) ? -1 : 1
      );
    } else {
      this.getData(this.postData.ApplicationNo, this.postData.ApplicationNoOdp);
    }
  }

  filterPolicyPeriod() {
    //nirmal code
    this.SpecialFeatureRow = [];
    this.planFilter.premium = 0;
    this.companies.setValue("");
    this.Premium = "";
    this.getData(this.postData.ApplicationNo, this.postData.ApplicationNoOdp);
  }

  onChangeCover() {
    this.GetDropdownFilterData(
      this.postData.ApplicationNo,
      this.postData.ApplicationNoOdp
    );
  }

  private GetDropdownFilterData(id: number, idOdp: number) {
    this.showLoader = true;
    this._subscriptions.push(
      this._healthBuyPlanService.getApplicationVehiclePlan(id, idOdp).subscribe(
        (result) => {
          this.showLoader = false;
          console.log(result);
          if (result.successcode == "1" && result.data) {
            // this.planLoader = false
            this.planApiurls = result.data.ProductUrl;
            this.displayAllplans(result.data.ProductUrl);
          } else {

            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
            this.errorLogDetails.CompanyName = '';
            this.errorLogDetails.ControllerName = 'Health'
            this.errorLogDetails.MethodName = 'GetHealthQuotationUrl'
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log(res);
              });

          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      )
    );
  }

  //#region for fetching plan details and for other data from server
  private getData(id: number, idOdp: number) {
    this.showLoader = true;
    this._subscriptions.push(
      this._healthBuyPlanService.getApplicationVehiclePlan(id, idOdp).subscribe(
        (result) => {
          this.showLoader = false;
          console.log(result);
          if (result.successcode == "1" && result.data) {

            // this.planLoader = false
            this.planApiurls = result.data.ProductUrl;
            // this.displayAllplans(result.data.ProductUrl);
            this.insurersList = result.data.InsuranceCompany;
            this.FeatureCate = result.data.FeatureCate;
            this.FeatureSubCate = result.data.FeatureSubCate;
            this.premiumList = result.data.PremiumList;
            this.displayAllplans(result.data.ProductUrl);
            // if (this.SpecialFeatureRow.length > 0) {
            //   this.okclose();
            // }
            console.log(this.FeatureSubCate);
          } else {


            this.errorLogDetails.UserCode = this.posMobileNo;
            this.errorLogDetails.ApplicationNo = this.postData.ApplicationNo;
            this.errorLogDetails.CompanyName = '';
            this.errorLogDetails.ControllerName = 'Health'
            this.errorLogDetails.MethodName = 'GetHealthQuotationUrl'
            this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
            this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
            this._errorHandleService
              .sendErrorLog(this.errorLogDetails)
              .subscribe((res: any) => {
                console.log(res);
              });

          }
        },
        (err: any) => {
          this.showLoader = false;
          this._errorHandleService.handleError(err);
        }
      )
    );
  }

  //#region for all plans
  private displayAllplans(data: IHealthInsPlanUrlsResponse[]) {
    this.planResponse = [];
    this.filteredData = [];
    this.plansNotMatchingFeatures = [];
    this.responseCount = 0;
    //nirmal code
    this.SpecialFeatureRow = [];
    this.planFilter.premium = 0;
    this.companies.setValue("");
    this.Premium = "";

    for (let i = 0; i < data.length; i++) {


      if (data[i].APIMethod != null) this.fetchPlan(data[i], i);

      else this.responseCount++;
    }
  }
  private fetchPlan(row: IHealthInsPlanUrlsResponse, i: number): any {
    // console.log(row);
    const pid = row.Partnerid;
    this.showLoader = true;
    this.planLoader = false;
    this.disableFilter = true;
    this._subscriptions.push(
      this._healthBuyPlanService
        .getInsuranceCompanyPlan(
          row,
          this.planFilter.sumInsured,
          this.planFilter.Tanure
        )
        .subscribe(
          (result: ApiResponse | any) => {
            console.log(result);
            // if (result.data && result.data.CompanyCode == "15") this.QuotationNo1 = result.data.QuotationNo1 ;


            this.showLoader = false;
            this.responseCount++;
            if (result.successcode == "0" || result.successcode == null) {
              let response = {
                UserCode: this.posMobileNo,
                ApplicationNo: this.postData.ApplicationNo,
                CompanyName: row.APIMethod.split("/")[0],
                ControllerName: row.APIMethod.split("/")[0],
                MethodName: row.APIMethod.split("/")[1],
                ErrorCode: result.successcode,
                ErrorDesc: result.msg,
              }
              this.errors.push(response)

            }
            if (result.successcode == "1" && result.data != null) {
              this.showLoader = false;
              const si = Covers.find(
                (cover) => cover.id == Number(this.planFilter.sumInsured)
              );
              if (si) result.data.SumInsured = si.value;
              this.planResponse.push(result.data);
              this.filteredData = this.planResponse;
              console.log(this.filteredData);
            }
            console.log(
              "this.planApiurls.length v/s responseCount",
              this.planApiurls.length,
              this.responseCount
            );

            if (this.planApiurls.length == this.responseCount) {
              this.planLoader = true;
              this.disableFilter = false;
              this._errorHandleService
                .sendErrorLog(this.errors)
                .subscribe((res: any) => {
                  console.log(res);
                });
              let newArray = JSON.parse(JSON.stringify(this.insurersList));
              this.insurersList = [];
              for (let index = 0; index < newArray.length; index++) {
                for (let k = 0; k < this.filteredData.length; k++) {
                  if (
                    newArray[index].CompanyCode ==
                    this.filteredData[k].CompanyCode
                  ) {
                    this.insurersList.push(newArray[index]);
                  }
                }
              }

              this.insurersList = this.insurersList.filter((item, pos) => {
                return this.insurersList.indexOf(item) == pos;
              });
            }
            console.log("testing", this.planResponse);
          },
          () => {
            this.showLoader = false;
          }
        )
    );
  }

  openDialog(): void {
    // $("#FeaturesDialog").css("display", "block");
    this.FeaturesDialog = "block";
  }

  closeDialog() {

    // $("#FeaturesDialog").css("display", "none");
    this.FeaturesDialog = "none";
    this.filteredData = [];
    this.SpecialFeatureRow = [];
    this.filteredData = this.planResponse;
    this.MultipalFilterProduct();
  }

  // nirmal code add
  SpecialFeatureChk(
    FeatureCategoryDesc: any,
    FeatureCategoryCode: Number,
    FeatureSubCategoryCode: Number,
    FeatureInd: boolean
  ) {
    let SpecialFeatureValue = this.SpecialFeatureRow.filter(
      (m: any) => m.FeatureSubCategoryCode == FeatureSubCategoryCode
    );
    if (SpecialFeatureValue.length > 0) {
      this.SpecialFeatureRow.splice(
        this.SpecialFeatureRow.findIndex(
          (x: any) => x.FeatureSubCategoryCode == FeatureSubCategoryCode
        ),
        1
      );
    } else {
      this.SpecialFeatureRow.push({
        FeatureCategoryDesc: FeatureCategoryDesc,
        FeatureCategoryCode: FeatureCategoryCode,
        FeatureSubCategoryCode: FeatureSubCategoryCode,
        FeatureInd: FeatureInd,
      });
    }
    console.log(this.SpecialFeatureRow);
  }

  // nirmal code add
  SpecialFeatureRadio(
    FeatureCategoryDesc: any,
    FeatureCategoryCode: Number,
    FeatureSubCategoryCode: Number,
    FeatureInd: boolean
  ) {
    let SpecialFeatureValue = this.SpecialFeatureRow.filter(
      (m: any) => m.FeatureCategoryDesc == FeatureCategoryDesc
    );
    if (SpecialFeatureValue.length > 0) {
      this.SpecialFeatureRow.splice(
        this.SpecialFeatureRow.findIndex(
          (x: any) => x.FeatureCategoryDesc == FeatureCategoryDesc
        ),
        1
      );
      this.SpecialFeatureRow.push({
        FeatureCategoryDesc: FeatureCategoryDesc,
        FeatureCategoryCode: FeatureCategoryCode,
        FeatureSubCategoryCode: FeatureSubCategoryCode,
        FeatureInd: FeatureInd,
      });
    } else {
      this.SpecialFeatureRow.push({
        FeatureCategoryDesc: FeatureCategoryDesc,
        FeatureCategoryCode: FeatureCategoryCode,
        FeatureSubCategoryCode: FeatureSubCategoryCode,
        FeatureInd: FeatureInd,
      });
    }
    console.log(this.SpecialFeatureRow);
  }

  onClickBuyplan(plan: IPlansHealth) {
    // console.log("plan", plan);

    const data = JSON.stringify(plan);
    sessionStorage.setItem("companyData", `${data}`);

    if (plan.CompanyCode == "8") {
      // buyplan-godigit
      this._router.navigate([
        `/health-insurance/buyplan-godigit/`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
        encrypt(plan.CompanyCode),
        encrypt(plan.ProductCode),

        encrypt(`${this.planFilter.sumInsured}`),
        encrypt(plan.Premium),
        encrypt(`${this.planFilter.Tanure}`),
      ]);
    } else if (plan.CompanyCode == "9") {
      // buyplan-tataAig
      this._router.navigate([
        `/health-insurance/buyplan-tataAig/`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
        encrypt(plan.CompanyCode),
        encrypt(plan.ProductCode),
        encrypt(`${this.planFilter.sumInsured}`),
        encrypt(plan.Premium),
        encrypt(`${this.planFilter.Tanure}`),
      ]);
    } else if (
      plan.CompanyCode == "11"
    ) {
      // plan.CompanyCode == "7"
      const p_id = plan.PartnerId;
      // buyplan-reliance or sbi respectively
      this._router.navigate([
        `/health-insurance/buyplan-company/`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
        encrypt(plan.CompanyCode),
        encrypt(plan.ProductCode),
        encrypt(`${this.planFilter.sumInsured}`),
        // encrypt(plan.),

        encrypt(plan.Premium),
        encrypt(`${this.planFilter.Tanure}`),
      ]);
    }
    else if (plan.CompanyCode == "14") {
      const p_id = plan.PartnerId;
      // hdfc-ergo 
      sessionStorage.setItem("planFilter", JSON.stringify(this.planFilter))
      this._router.navigate([
        `/bike-insurance/CkycDetails`,
        this.postData.ApplicationNo,
        this.postData.ApplicationNoOdp,
      ]);
    }
    else if (plan.CompanyCode == "3") {
      // Star
      this._router.navigate([
        `/health-insurance/buyplan-star/`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
        encrypt(plan.CompanyCode),
        encrypt(plan.ProductCode),
        encrypt(`${this.planFilter.sumInsured}`),
        encrypt(plan.Premium),
        encrypt(`${this.planFilter.Tanure}`),
      ]);
    } else if (plan.CompanyCode == "10") {
      // National
      this._router.navigate([
        `/health-insurance/buyplan-national/`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
        encrypt(plan.CompanyCode),
        encrypt(plan.ProductCode),
        encrypt(`${this.planFilter.sumInsured}`),
        encrypt(plan.Premium),
        encrypt(`${this.planFilter.Tanure}`),
      ]);
    } else if (plan.CompanyCode == "7") {
      // Nationals sbi
      this._router.navigate([
        `/health-insurance/buyplan-sbi/`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
        encrypt(plan.CompanyCode),
        encrypt(plan.ProductCode),
        encrypt(`${this.planFilter.sumInsured}`),
        encrypt(plan.Premium),
        encrypt(`${this.planFilter.Tanure}`),
      ]);
    } else if (plan.CompanyCode == '15') {
      //Oriental
      this._router.navigate([
        `/health-insurance/buyplan-oriental/`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
        encrypt(plan.CompanyCode),
        encrypt(plan.ProductCode),
        encrypt(`${this.planFilter.sumInsured}`),
        encrypt(plan.Premium),
        encrypt(`${this.planFilter.Tanure}`),
        encrypt(plan.QuotationNo1)
      ])
    }
    else {
      this._router.navigate([
        `/health-insurance/buyplan/`,
        encrypt(`${this.postData.ApplicationNo}`),
        encrypt(`${this.postData.ApplicationNoOdp}`),
        encrypt(plan.CompanyCode),
        encrypt(plan.ProductCode),
        encrypt(`${this.planFilter.sumInsured}`),
        encrypt(plan.Premium),
        encrypt(`${this.planFilter.Tanure}`),

      ]);
    }
  }

  MultipalFilterProduct() {
    this.showLoader = true;
    // $("#FeaturesDialog").css("display", "none");
    this.FeaturesDialog = "none";
    // only filter Insurers
    if (
      this.SpecialFeatureRow.length == 0 &&
      this.Premium == 0 &&
      this.companies.value.length != 0
    ) {

      this.filteredData = [];
      for (let i = 0; i < this.planResponse.length; i++) {
        for (let j = 0; j < this.companies.value.length; j++) {
          if (this.planResponse[i].CompanyCode == this.companies.value[j]) {
            this.filteredData.push(this.planResponse[i]);
            this.showLoader = false;
          } else {
            this.showLoader = false;
          }
        }
      }

      this.plansNotMatchingFeatures = [];
      for (let i = 0; i < this.planResponse.length; i++) {
        let plan = this.filteredData.filter(
          (f: any) => f.ProductCode == this.planResponse[i].ProductCode
        );
        if (plan.length == 0) {
          this.plansNotMatchingFeatures.push(this.planResponse[i]);
        }
      }
    }
    // only filter Features
    else if (
      this.SpecialFeatureRow.length != 0 &&
      this.Premium == 0 &&
      this.companies.value.length == 0
    ) {
      this.filteredData = [];
      // $("#FeaturesDialog").css("display", "none");
      this.FeaturesDialog = "none";
      for (let i = 0; i < this.planResponse.length; i++) {
        let companystutas = "Yes";
        for (let s = 0; s < this.SpecialFeatureRow.length; s++) {
          if (this.planResponse[i].HealthFeaturesList != null) {
            let FilterChk = this.planResponse[i].HealthFeaturesList.filter(
              (m: any) =>
                m.FeatureCategoryCode ==
                this.SpecialFeatureRow[s].FeatureCategoryCode &&
                m.FeatureSubCategoryCode ==
                this.SpecialFeatureRow[s].FeatureSubCategoryCode &&
                m.FeatureInd == false
            );
            if (FilterChk.length != 0) {
              companystutas = "No";
            }
          }
        }
        if (
          companystutas == "Yes" &&
          this.planResponse[i].HealthFeaturesList != null
        ) {
          this.filteredData.push(this.planResponse[i]);
        } else {
        }
      }

      this.plansNotMatchingFeatures = [];
      for (let i = 0; i < this.planResponse.length; i++) {
        let plan = this.filteredData.filter(
          (f: any) => f.ProductCode == this.planResponse[i].ProductCode
        );
        if (plan.length == 0) {
          this.plansNotMatchingFeatures.push(this.planResponse[i]);
        }
      }
    }
    // only filter Policy Period
    else if (
      this.SpecialFeatureRow.length == 0 &&
      this.Premium != 0 &&
      this.companies.value.length == 0
    ) {
      this.filteredData = [];
      if (this.Premium != undefined) {
        var Amount = this.Premium.split(",");
        this.filteredData = this.planResponse.filter(
          (m: any) =>
            m.Premium >= Number(Amount[0]) && m.Premium <= Number(Amount[1])
        );
      } else {
        this.filteredData = this.planResponse;
      }

      this.plansNotMatchingFeatures = [];
      for (let i = 0; i < this.planResponse.length; i++) {
        let plan = this.filteredData.filter(
          (f: any) => f.ProductCode == this.planResponse[i].ProductCode
        );
        if (plan.length == 0) {
          this.plansNotMatchingFeatures.push(this.planResponse[i]);
        }
      }
    }

    // only filter Insurers & Premium
    else if (
      this.SpecialFeatureRow.length == 0 &&
      this.Premium != 0 &&
      this.companies.value.length != 0
    ) {

      this.filteredData = [];
      this.FilterHoldPlan = [];
      for (let i = 0; i < this.planResponse.length; i++) {
        for (let j = 0; j < this.companies.value.length; j++) {
          if (this.planResponse[i].CompanyCode == this.companies.value[j]) {
            this.FilterHoldPlan.push(this.planResponse[i]);
          }
        }
      }
      if (this.Premium != undefined) {

        var Amount = this.Premium.split(",");
        this.filteredData = this.FilterHoldPlan.filter(
          (m: any) =>
            m.Premium >= Number(Amount[0]) && m.Premium <= Number(Amount[1])
        );
      }

      this.plansNotMatchingFeatures = [];
      for (let i = 0; i < this.planResponse.length; i++) {
        let plan = this.filteredData.filter(
          (f: any) => f.ProductCode == this.planResponse[i].ProductCode
        );
        if (plan.length == 0) {
          this.plansNotMatchingFeatures.push(this.planResponse[i]);
        }
      }
    }

    // only filter Insurers & Premium & Feature
    else if (
      this.SpecialFeatureRow.length != 0 &&
      this.Premium != 0 &&
      this.companies.value.length != 0
    ) {
      //alert("dgdg dfgdfgf")
      this.filteredData = [];
      this.FilterHoldPlan = [];
      for (let i = 0; i < this.planResponse.length; i++) {
        for (let j = 0; j < this.companies.value.length; j++) {
          if (this.planResponse[i].CompanyCode == this.companies.value[j]) {
            this.FilterHoldPlan.push(this.planResponse[i]);
          }
        }
      }
      if (this.Premium != undefined) {
        var Amount = this.Premium.split(",");
        this.FilterHoldPlan = this.FilterHoldPlan.filter(
          (m: any) =>
            m.Premium >= Number(Amount[0]) && m.Premium <= Number(Amount[1])
        );
      }
      for (let i = 0; i < this.FilterHoldPlan.length; i++) {
        let companystutas = "Yes";
        for (let s = 0; s < this.SpecialFeatureRow.length; s++) {
          if (this.FilterHoldPlan[i].HealthFeaturesList != null) {
            let FilterChk = this.FilterHoldPlan[i].HealthFeaturesList.filter(
              (m: any) =>
                m.FeatureCategoryCode ==
                this.SpecialFeatureRow[s].FeatureCategoryCode &&
                m.FeatureSubCategoryCode ==
                this.SpecialFeatureRow[s].FeatureSubCategoryCode &&
                m.FeatureInd == false
            );
            if (FilterChk.length != 0) {
              companystutas = "No";
            }
          }
        }
        if (
          companystutas == "Yes" &&
          this.FilterHoldPlan[i].HealthFeaturesList != null
        ) {
          this.filteredData.push(this.FilterHoldPlan[i]);
        }
      }

      this.plansNotMatchingFeatures = [];
      for (let i = 0; i < this.planResponse.length; i++) {
        let plan = this.filteredData.filter(
          (f: any) => f.ProductCode == this.planResponse[i].ProductCode
        );
        if (plan.length == 0) {
          this.plansNotMatchingFeatures.push(this.planResponse[i]);
        }
      }
    }

    // only filter Premium & Feature
    else if (
      this.SpecialFeatureRow.length != 0 &&
      this.Premium != 0 &&
      this.companies.value.length == 0
    ) {
      //alert('only filter Premium & Feature');
      this.filteredData = [];
      this.FilterHoldPlan = [];
      if (this.Premium != undefined) {
        var Amount = this.Premium.split(",");
        this.FilterHoldPlan = this.planResponse.filter(
          (m: any) =>
            m.Premium >= Number(Amount[0]) && m.Premium <= Number(Amount[1])
        );
      }
      for (let i = 0; i < this.FilterHoldPlan.length; i++) {
        let companystutas = "Yes";
        for (let s = 0; s < this.SpecialFeatureRow.length; s++) {
          if (this.FilterHoldPlan[i].HealthFeaturesList != null) {
            let FilterChk = this.FilterHoldPlan[i].HealthFeaturesList.filter(
              (m: any) =>
                m.FeatureCategoryCode ==
                this.SpecialFeatureRow[s].FeatureCategoryCode &&
                m.FeatureSubCategoryCode ==
                this.SpecialFeatureRow[s].FeatureSubCategoryCode &&
                m.FeatureInd == false
            );
            if (FilterChk.length != 0) {
              companystutas = "No";
            }
          }
        }
        if (
          companystutas == "Yes" &&
          this.FilterHoldPlan[i].HealthFeaturesList != null
        ) {
          this.filteredData.push(this.FilterHoldPlan[i]);
        }
      }

      this.plansNotMatchingFeatures = [];
      for (let i = 0; i < this.planResponse.length; i++) {
        let plan = this.filteredData.filter(
          (f: any) => f.ProductCode == this.planResponse[i].ProductCode
        );
        if (plan.length == 0) {
          this.plansNotMatchingFeatures.push(this.planResponse[i]);
        }
      }
    }

    // only filter Insurers  & Feature
    else if (
      this.SpecialFeatureRow.length != 0 &&
      this.Premium == 0 &&
      this.companies.value.length != 0
    ) {
      //alert("only filter Insurers  & Feature")
      this.filteredData = [];
      this.FilterHoldPlan = [];
      for (let i = 0; i < this.planResponse.length; i++) {
        for (let j = 0; j < this.companies.value.length; j++) {
          if (this.planResponse[i].CompanyCode == this.companies.value[j]) {
            this.FilterHoldPlan.push(this.planResponse[i]);
          }
        }
      }
      for (let i = 0; i < this.FilterHoldPlan.length; i++) {
        let companystutas = "Yes";
        for (let s = 0; s < this.SpecialFeatureRow.length; s++) {
          if (this.FilterHoldPlan[i].HealthFeaturesList != null) {
            let FilterChk = this.FilterHoldPlan[i].HealthFeaturesList.filter(
              (m: any) =>
                m.FeatureCategoryCode ==
                this.SpecialFeatureRow[s].FeatureCategoryCode &&
                m.FeatureSubCategoryCode ==
                this.SpecialFeatureRow[s].FeatureSubCategoryCode &&
                m.FeatureInd == false
            );
            if (FilterChk.length != 0) {
              companystutas = "No";
            }
          }
        }
        if (
          companystutas == "Yes" &&
          this.FilterHoldPlan[i].HealthFeaturesList != null
        ) {
          this.filteredData.push(this.FilterHoldPlan[i]);
        }
      }

      this.plansNotMatchingFeatures = [];
      for (let i = 0; i < this.planResponse.length; i++) {
        let plan = this.filteredData.filter(
          (f: any) => f.ProductCode == this.planResponse[i].ProductCode
        );
        if (plan.length == 0) {
          this.plansNotMatchingFeatures.push(this.planResponse[i]);
        }
      }
    } else {
      this.filteredData = this.planResponse;
      this.plansNotMatchingFeatures = [];
    }
    this.showLoader = false;
  }
  isChecked = (subcat: number): boolean =>
    this.SpecialFeatureRow.find((f: any) => f.FeatureSubCategoryCode === subcat)
      ? true
      : false;

  getFeatureSubCategoryDesc(featureSubCategoryCode: any) {
    let subCategoryObject = this.FeatureSubCate.find(
      (feature: any) => feature.FeatureSubCategoryCode == featureSubCategoryCode
    );

    return subCategoryObject.FeatureSubCategoryDesc;
  }

  edit_Member() {
    sessionStorage.setItem("edit_Member", "1");
    this._router.navigate(["/pos/health-insurance"]);
  }

  openQuoteSharingForm() {

    this.shareQuotesModal.showModal = true;
    this.captureScreen();
  }

  quotesDetailsForSharing: any;
  capturedImage: any;
  async captureScreen() {

    try {
      const capturePromise = this.screenCaptureService.getImage(
        this.screen.nativeElement,
        true
      );
      let imgString = await capturePromise;
      // let convertedImageFile = this.convertBase64ToImage(imgString);
      capturePromise.subscribe((imgString: any) => {
        let convertedImageFile = imgString.replace("data:image/png;base64,", "");

        this.quotesDetailsForSharing = {
          image: convertedImageFile,
          planDescription:
            this.healthQuotes.healthInsuranceMembers.length > 1
              ? "Floater Health Plan"
              : "Individual Health Plan",
        };
      })

    } catch (err) {
      console.log("error occured");
      console.log({ err });
    }
  }

  ngOnDestroy() {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
