import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import { HealthBuyPlanService } from "../../services/health-buyplan.service";
import { IRegUrlData } from "src/app/models/health-insu.Model";
import { ErrorHandleService } from "src/app/shared/services/error-handler.service";
import { FormControl, Validators } from "@angular/forms";
import { decrypt, encrypt } from "src/app/models/common-functions";
import { ActivatedRoute } from "@angular/router";
import { apiToken } from "src/app/models/constants";
import { errorLog } from "src/app/models/common.Model";
import { VehicleBuyPlanService } from "../../services/vehicle-buyplan.service";
import { ToastrService } from "ngx-toastr";
import { formatDate } from "@angular/common";
import { ApiResponse } from "src/app/models/api.model";

declare var Razorpay: any;

@Component({
  selector: "health-review-pay",
  templateUrl: "./review-pay.component.html",
  styleUrls: ["./review-pay.component.css"],
})
export class ReviewPayComponent implements OnInit, OnChanges, OnDestroy {
  private _subscriptions: any[] = [];

  @Input() data: any;
  @Output() onEdit = new EventEmitter<number>();
  showLoader = false;
  paymentUrl!: IProposalReponse;
  termAndCon = false;
  errMsg = "";
  ApplicationNo!: string;
  ApplicationNoOdp!: string;
  sessData: any;
  medicalHistoryClone: any[] = [];
  area: string = "";
  city: string = "";
  isCkycValidForNivabupa: boolean = true
  showTimer: boolean = false;
  displayNone: boolean = false;
  btnCkeckStauts: boolean = false;
  display!: string;
  successcode: string = "";
  UniqueId: any;
  constructor(
    private _healthBuyPlanService: HealthBuyPlanService,
    private _errorHandleService: ErrorHandleService,
    private _route: ActivatedRoute,
    private _VehicleSRV: VehicleBuyPlanService,
    private _toastService: ToastrService

  ) { }

  posMobileNo: any;
  errorLogDetails = {} as unknown as errorLog;


  ngOnInit() {

    this._route.paramMap.subscribe((p) => {
      const No: any = p.get("a_id");
      const Odp: any = p.get("odp");
      this.ApplicationNo = No;
      this.ApplicationNoOdp = Odp;
    });
    this.sessData = JSON.parse(sessionStorage.getItem("companyData")!);
    console.log("this.sessData", this.sessData);
    this.posMobileNo = decrypt(sessionStorage.getItem("posMob")!);
    console.log("testing" + this.data);

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.data);

    console.log(changes);
    this.modifyingDataBeforeReview(this.data);
    this.sortInsuredMembers();
    this.refactoringMedicalHistory();
  }

  modifyingDataBeforeReview(data: any) {
    if (data) {
      if (typeof data.address.AddArea != "string") {
        if (data.companyCode === "3") this.area = data.address.AddArea.areaName;
        else if (
          data.companyCode === "11" ||
          data.companyCode === "7" ||
          data.companyCode === "14"
        )
          this.area = data.address.AddArea.AreaDesc;
        else this.area = data.address.AddArea;
      } else this.area = data.address.AddArea;
      if (typeof data.address.city != "string") {
        if (data.companyCode === "3") this.city = data.address.city.city_name;
        else if (
          data.companyCode === "11" ||
          data.companyCode === "7" ||
          data.companyCode === "14"
        )
          this.city = data.address.CityDesc;
        else this.city = data.address.city;
      } else this.city = data.address.city;
    }
  }

  sortInsuredMembers() {
    if (this.data && this.data.members) {
      this.data.members.sort((a: any, b: any) =>
        a.FamilyMemberDesc.localeCompare(b.FamilyMemberDesc)
      );
    }
  }

  // refactoringMedicalHistory() {
  //
  //   // sorting for not having to encounter the repeated questionID inside the loop below
  //   this.medicalHistoryClone = [];
  //   console.log("------------------", this.data);
  //   if (this.data) {
  //     let medicalDetails = this.data.questionData;
  //     medicalDetails.sort(function (a, b) {
  //       return a.QuestionID - b.QuestionID;
  //     });
  //     let currentQuestionId: number;
  //     for (let question of medicalDetails) {
  //       if (question.QuestionID == currentQuestionId) continue; //continue loop for repeated id
  //       currentQuestionId = question.QuestionID;
  //       let allQuestionsWithGivenId = medicalDetails.filter(
  //         (que) => que.QuestionID === question.QuestionID
  //       );

  //       let membersLeft = [];
  //       this.data.memberDetails.forEach((member) => {
  //         let memberFound = allQuestionsWithGivenId.find(
  //           (que) => que.FamilyMemberDesc === member.FamilyMemberDesc
  //         );
  //         if (!memberFound) {
  //           membersLeft.push({
  //             ...question,
  //             QuestionValue: "N/A",
  //             FamilyMemberDesc: member.FamilyMemberDesc,
  //           });
  //         }
  //       });
  //       console.log(membersLeft);
  //       let finalMemberArray = [...allQuestionsWithGivenId, ...membersLeft];
  //       finalMemberArray.sort((a, b) =>
  //         a.FamilyMemberDesc.localeCompare(b.FamilyMemberDesc)
  //       );
  //       // console.log(allQuestionsWithGivenId);

  //       this.medicalHistoryClone.push({
  //         QuestionDesc: question.QuestionDesc,
  //         members: finalMemberArray,
  //         IsParent: question.IsParent,
  //       });
  //     }
  //   }
  // }
  countDowntimer(minute: number) {
    // let minute = 1;
    this.showTimer = true;
    let seconds: number = minute * 60;
    let textSec: any = "0";
    let statSec: number = 60;

    const prefix = minute < 10 ? "0" : "";

    const timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) {
        textSec = "0" + statSec;
      } else textSec = statSec;
      var hours = Math.floor(seconds / 3600);
      var minutes = Math.floor((seconds - (hours * 3600)) / 60);
      // var seconds = sec_num - (hours * 3600) - (minutes * 60);
      const prefixMin = minutes < 10 ? "0" : "";
      const prefixHour = hours < 10 ? "0" : "";
      this.display = `${prefixMin}${minutes}m : ${textSec}s`;
      // if (seconds == 30) {
      //   this.changetored = true;
      // }
      if (seconds == 0) {
        console.log("finished");
        this.displayNone = true;
        this.showTimer = false;
        clearInterval(timer);
      }
    }, 1000);
  }


  ValidateCkyc() {
    let ApplicationNo = decrypt(this.ApplicationNo)
    console.log(this.data);
    if (this.sessData.CompanyCode == "17") {
      const ckycData = {
        ApplicationNo: ApplicationNo,
        CompanyCode: this.sessData.CompanyCode,
        DocumentNo: this.data.address.IdentityNo
      }

      this._subscriptions.push(
        this._VehicleSRV.NivabupaValidateCKYC(ckycData).subscribe((result: any) => {
          if (result.successcode === "1" && result.data.KYCStatus === "Success") {
            window.open(result.data.ManualCkycUrl);
            this.UniqueId = result.data
            this.successcode = '2'
            // this.isCkycValidForNivabupa = false
          } else {
            this.successcode = '3'
            this._toastService.warning(result.msg, 'Validation Failed!');
          }
        })
      )
    }

  }

  CkycStatusCheck() {
    if (this.sessData.CompanyCode == "17") {
      let ApplicationNo = decrypt(this.ApplicationNo)
      let UniqueId = this.UniqueId.UniqueId
      this._subscriptions.push(
        this._VehicleSRV.NivabupaValidateCkucStatusCHeck(ApplicationNo, UniqueId).subscribe((result: any) => {
          debugger
          if (result.successcode === "1") {
            this._toastService.success(result.msg, 'Validation Success!');
            this.successcode = '1'
            console.log(this.successcode);
          } else {
            this.successcode = '3'
            this._toastService.warning(result.msg, 'Validation Failed!');
          }
        })
      )
    }
  }
  refactoringMedicalHistory() {

    this.medicalHistoryClone = [];
    let currentQuestionId: number = 0;

    console.log("------------------", this.data);
    if (this.data) {
      let medicalDetails = this.data.questionData;
      // sorting for not having to encounter the repeated questionID inside the loop below
      medicalDetails.sort(function (a: any, b: any) {
        return a.QuestionID - b.QuestionID;
      });

      for (let question of medicalDetails) {
        if (question.QuestionID == currentQuestionId) continue; //continue loop for repeated id
        currentQuestionId = question.QuestionID;

        // All member objects for a given question
        let allQuestionsWithGivenId = medicalDetails.filter(
          (que: any) => que.QuestionID === question.QuestionID
        );

        // Finding member that aren't in the list and assigning them N/A
        let membersLeft: any[] = [];
        this.data.memberDetails.forEach((member: any) => {
          let memberFound = allQuestionsWithGivenId.find(
            (que: any) => que.FamilyMemberDesc === member.FamilyMemberDesc
          );
          if (!memberFound) {
            membersLeft.push({
              ...question,
              // QuestionValue: "N/A",
              QuestionValue: "No",
              FamilyMemberDesc: member.FamilyMemberDesc,
            });
          }
        });

        // final member array having all members with respective QuestionValue
        let finalMemberArray = [...allQuestionsWithGivenId, ...membersLeft];
        finalMemberArray.sort((a, b) =>
          a.FamilyMemberDesc.localeCompare(b.FamilyMemberDesc)
        );

        this.creatingQueTreeToShow(question, finalMemberArray);
      }
    }
  }

  creatingQueTreeToShow(question: any, finalMemberArray: any[]) {
    // checking if the current question is child or parent

    let parentOfThisQuestion;
    parentOfThisQuestion = this.medicalHistoryClone.find(
      (que) => question.ParentID === que.QuestionID
    );

    if (parentOfThisQuestion) {
      // current question's parent found at first level
      parentOfThisQuestion.children.push({
        ...question,
        members: finalMemberArray,
        children: [],
      });
    } else {
      // searching inside second level...
      let found: boolean | undefined;
      this.medicalHistoryClone.forEach((ques) => {
        let parentFound = ques.children.find(
          (chilQue: any) => question.ParentID === chilQue.QuestionID
        );
        if (parentFound) {
          // current question's parent found at the second level
          parentFound.children.push({
            ...question,
            members: finalMemberArray,
            children: [],
          });
          found = true;
        }
      });
      if (!found) {
        // current question is itself a parent
        this.medicalHistoryClone.push({
          ...question,
          members: finalMemberArray,
          children: [],
        });
      }
    }

    console.log(this.medicalHistoryClone);
  }

  onClickEdit(tab: number) {
    this.termAndCon = false;
    this.onEdit.emit(tab);
  }

  onClickPay(): any {

    if (!this.termAndCon) {
      this.errMsg = "Pease accept our term and policies after reading it.";
      return false;
    }
    console.log(this.data.StopCompanyInd);
    if (this.data.StopCompanyInd == 1) {
      ($("#exampleModalCenter") as any).modal("show");
      return false;
    }
    //return false;
    const body: IRegUrlData = this.data.regUrlData;
    console.log("-------><>,>", body)
    this.showLoader = true;
    this._healthBuyPlanService.getHealthProposerNo(body).subscribe(
      (result) => {
        debugger
        //this.showLoader = false;
        if (result.successcode == "1") {
          // 
          console.log(result.data);

          //this.paymentUrl = result.data;
          // console.log('cgdfgdfgdfgg dfgdfgdfg' + ProductCode);

          //this._errorHandleService._toastService.success(result.msg)

          if (this.sessData.CompanyCode === "1") {
            let proposalNuber = encrypt(result.data[0].ProposalNumber);
            let ApplicationNo = encrypt(String(result.data[0].ApplicationNo));
            let RegistrationNo = encrypt(String(result.data[0].RegistrationNo));

            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));
            // nirmal code add
            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);

            let param = {
              ApplicationNo: result.data[0].ApplicationNo,
              proposalNum: result.data[0].ProposalNumber,
              ProposalPremium: result.data[0].ProposalPremium,
              RegistrationNo: result.data[0].RegistrationNo,
              returnURL: result.data[0].ResponseURL,
            };
            this.postFormReligare(result.data[0].PaymentURL, param, "");
          } else if (this.sessData.CompanyCode === "2") {
            let proposalNuber = encrypt(result.data.ProposalNumber);
            let ApplicationNo = encrypt(String(result.data.ApplicationNo));
            let RegistrationNo = encrypt(String(result.data.RegistrationNo));
            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));
            // nirmal code add
            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);

            let OtherParams = result.data.OtherParams.split("|");
            let param = {
              TransactionID: result.data.RegistrationNo,
              PaymentOption: OtherParams[0],
              ResponseURL: result.data.ResponseURL,
              ProposalNumber: result.data.ProposalNumber,
              PremiumAmount: result.data.ProposalPremium,
              UserIdentifier: OtherParams[6],
              UserId: OtherParams[1],
              FirstName: OtherParams[2],
              LastName: OtherParams[3],
              Mobile: OtherParams[4],
              Email: OtherParams[5],
              CheckSum: result.additionaldata,
            };
            this.postFormFuture(result.data.PaymentURL, param, "");
          } else if (this.sessData.CompanyCode === "3") {
            console.log(result.data.PaymentURL);
            let proposalNuber = encrypt(result.data.ProposalNumber);
            let ApplicationNo = encrypt(String(result.data.ApplicationNo));
            let RegistrationNo = encrypt(String(result.data.RegistrationNo));
            let payurl = encrypt(String(result.data.PaymentURL));
            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));
            // nirmal code add
            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);
            sessionStorage.setItem("url", payurl);

            window.location.href = result.data.PaymentURL;
          } else if (this.sessData.CompanyCode === "6") {
            console.log(result.data.PaymentURL);
            let proposalNuber = encrypt(result.data.ProposalNumber);
            let ApplicationNo = encrypt(String(result.data.ApplicationNo));
            let RegistrationNo = encrypt(String(result.data.RegistrationNo));
            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));
            // nirmal code add
            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);

            window.location.href = result.data.PaymentURL;
          } else if (this.sessData.CompanyCode === "8") {
            console.log(result.data.PaymentURL);
            let proposalNuber = encrypt(result.data.ProposalNumber);
            let ApplicationNo = encrypt(String(result.data.ApplicationNo));
            let RegistrationNo = encrypt(String(result.data.RegistrationNo));
            let payurl = encrypt(String(result.data.PaymentURL));
            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));
            // nirmal code add
            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);
            sessionStorage.setItem("url", payurl);

            window.location.href = result.data.PaymentURL;
          } else if (this.sessData.CompanyCode === "9") {
            let proposalNuber = encrypt(result.data[0].ProposalNumber);
            let ApplicationNo = encrypt(String(result.data[0].ApplicationNo));
            let RegistrationNo = encrypt(String(result.data[0].RegistrationNo));

            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));
            // nirmal code add
            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);

            let param = {
              proposal_no: result.data[0].ProposalNumber,
              src: "TP",
            };
            this.postFormTataAIG(result.data[0].PaymentURL, param, "");
          } else if (this.sessData.CompanyCode === "10") {

            console.log(result.data.PaymentURL);
            let proposalNuber = encrypt(result.data.ProposalNumber);
            let ApplicationNo = encrypt(String(result.data.ApplicationNo));
            let RegistrationNo = encrypt(String(result.data.RegistrationNo));
            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));
            // nirmal code add
            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);

            console.log("payment", result.data.PaymentURL);
            // payment redirect
            window.location.href = result.data.PaymentURL;
          } else if (this.sessData.CompanyCode === "11") {

            console.log(result.data[0].PaymentURL);
            let proposalNuber = encrypt(result.data[0].ProposalNumber);
            let ApplicationNo = encrypt(String(result.data[0].ApplicationNo));
            let RegistrationNo = encrypt(String(result.data[0].RegistrationNo));
            // nirmal code add
            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));

            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);
            window.location.href = result.data[0].PaymentURL;
          } else if (this.sessData.CompanyCode === "4") {

            let proposalNuber = encrypt(result.data[0].ProposalNumber);
            let ApplicationNo = encrypt(String(result.data[0].ApplicationNo));
            let RegistrationNo = encrypt(String(result.data[0].RegistrationNo));
            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));
            let payurl = encrypt(String(result.data[0].PaymentURL));

            // nirmal code add
            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);
            sessionStorage.setItem("url", payurl);

            let OtherParams = result.data[0]["OtherParams"].split("|");

            let param = {
              ptnrTransactionLogId: OtherParams[0],
              orderNo: OtherParams[1],
              traceNo: OtherParams[2],
            };
            this.postFormIffcoTokio(result.data[0].PaymentURL, param, "");
          } else if (this.sessData.CompanyCode === "7") {
            //SBI
            this.showLoader = false;
            let proposalNuber = encrypt(result.data[0].ProposalNumber);
            let ApplicationNo = encrypt(String(result.data[0].ApplicationNo));
            let RegistrationNo = encrypt(String(result.data[0].RegistrationNo));
            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));
            // nirmal code add
            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);

            this.paymentSBI(result);
          } else if (this.sessData.CompanyCode === "14") {
            // HDFC-ergo
            this.showLoader = false;

            let proposalNuber = encrypt(result.data.ProposalNumber);
            let ApplicationNo = encrypt(String(result.data.ApplicationNo));
            let RegistrationNo = encrypt(String(result.data.RegistrationNo));
            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));
            console.log(PartnerId);
            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);

            let OtherParams = result.data.OtherParams;
            let param = {
              Trnsno: result.data.PaymentReqKey,
              Amt: result.data.ProposalPremium,
              Appid: result.data.QuotationNo1,
              Subid: result.data.QuotationNo2,
              Surl: result.data.ResponseURL,
              Furl: result.data.ResponseURL,

              Src: "POST",
              Chksum: result.data.OtherParams,
            };
            // return;
            this.postForHdfc(result.data.PaymentURL, param, "");
          } else if (this.sessData.CompanyCode === "12") {
            console.log(result.data.PaymentURL);
            let proposalNuber = encrypt(result.data.ProposalNumber);
            let ApplicationNo = encrypt(String(result.data.ApplicationNo));
            let RegistrationNo = encrypt(String(result.data.RegistrationNo));
            let PartnerId = encrypt(String(body.PartnerId));
            let ProductCode = encrypt(String(body.ProductCode));
            let payurl = encrypt(String(result.data.PaymentURL));
            // nirmal code add
            sessionStorage.setItem("PId", PartnerId);
            sessionStorage.setItem("PCode", ProductCode);

            sessionStorage.setItem("proposalNo", proposalNuber);
            sessionStorage.setItem("appNo", ApplicationNo);
            sessionStorage.setItem("regNo", RegistrationNo);
            sessionStorage.setItem("url", payurl);

            window.location.href = result.data.PaymentURL;
            // let param = { 'proposalNum': this.paymentUrl.ProposalNumber, 'returnURL': this.paymentUrl.ResponseURL }
            // this.postFormReligare(this.paymentUrl.PaymentURL, param, '')
          } else //code added for niva bupa by dilshad on 2-7-2022
            if (this.sessData.CompanyCode === "17") {
              const proposalNuber = encrypt(result.data[0].ProposalNumber);
              const ApplicationNo = encrypt(String(result.data[0].ApplicationNo));
              const RegistrationNo = encrypt(String(result.data[0].RegistrationNo));
              let PartnerId = encrypt(String(body.PartnerId));
              let ProductCode = encrypt(String(body.ProductCode));
              const payurl = encrypt(String(result.data[0].PaymentURL));

              sessionStorage.setItem("PId", PartnerId);
              sessionStorage.setItem("PCode", ProductCode);

              sessionStorage.setItem("proposalNo", proposalNuber);
              sessionStorage.setItem("appNo", ApplicationNo);
              sessionStorage.setItem("regNo", RegistrationNo);
              sessionStorage.setItem("url", payurl);

              window.location.href = result.data[0].PaymentURL;
            }
            else if (this.sessData.CompanyCode === "18") {
              debugger
              let proposalNuber = encrypt(result.data.ProposalNumber);
              let ApplicationNo = encrypt(String(result.data.ApplicationNo));
              let RegistrationNo = encrypt(String(result.data.RegistrationNo));

              let PartnerId = encrypt(String(body.PartnerId));
              let ProductCode = encrypt(String(body.ProductCode));
              sessionStorage.setItem("PId", PartnerId);
              sessionStorage.setItem("PCode", ProductCode);

              sessionStorage.setItem("proposalNo", proposalNuber);
              sessionStorage.setItem("appNo", ApplicationNo);
              sessionStorage.setItem("regNo", RegistrationNo);

              let param = {
                // ProposalNumber: result.data.ProposalNumber,
                msg: result.data.OtherParams,
                // premium:result.data.ProposalPremium,
                // QuotationNo1:result.data.QuotationNo1,
                // QuotationNo2:result.data.QuotationNo2,
                // returnUrl:result.data.ResponseURL
              };
              this.postFormRoyalSundram(result.data.PaymentURL, param, "");
            }
        } else {
          this.errorLogDetails.UserCode = this.posMobileNo;
          this.errorLogDetails.ApplicationNo = decrypt(this.ApplicationNo);
          this.errorLogDetails.CompanyName = body.APIMethod.split("/")[0]
          this.errorLogDetails.ControllerName = body.APIMethod.split("/")[0]
          this.errorLogDetails.MethodName = body.APIMethod.split("/")[1];
          this.errorLogDetails.ErrorCode = result.successcode ? result.successcode : "0";
          this.errorLogDetails.ErrorDesc = result.msg ? result.msg : "Something went wrong.";
          this._errorHandleService
            .sendErrorLog(this.errorLogDetails)
            .subscribe((res: any) => {
              console.log(res);
            });

          this._errorHandleService._toastService.error(result.msg);
          this.showLoader = false;
          //console.error('HB server error : ' + result.msg)
        }
      },
      (err) => {
        this.showLoader = false;
        this._errorHandleService.handleError(err);
      }
    );
  }
  private postFormReligare(
    path: string,
    params: { [x: string]: string; proposalNum: string; returnURL: string },
    method: string
  ) {
    method = method || "post";

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("name", "PAYMENTFORM");

    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  }

  private postFormFuture(
    path: string,
    params: any,
    method: string
  ) {
    method = method || "post";

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("name", "form1");
    form.setAttribute("id", "form1");

    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "text");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  }


  // private postFormRoyalSundram(
  //   path: string,
  //   params: any,
  //   method: string
  // ) {
  //   debugger
  //   method = method || "post";

  //   var form = document.createElement("form");
  //   form.setAttribute("method", method);
  //   form.setAttribute("action",path);//https://www.billdesk.com/pgidsk/PGIMerchantPayment"
  //   form.setAttribute("enctype", "application/x-www-form-urlencoded");

  //   form.setAttribute("name", "PostForm");
  //   form.setAttribute("id","PostForm")

  //   for (var key in params) {
  //   if (params.hasOwnProperty(key)) {
  //   var hiddenField = document.createElement("input");
  //   hiddenField.setAttribute("type", "hidden");
  //   hiddenField.setAttribute("name", key);

  //  // hiddenField.setAttribute("value", "ROYLSUNGEN|ORD000001066|NA|2.00|NA|NA|NA|INR|NA|R|roylsungen|NA|NA|F|RSAIIHPC086247|12345|RSAI|NB|NA|NA|NA|https://www.royalsundaram.net/web/dtctest/lifeline/thankyou?new_System=Yes&callingApp=lifeline|1775074920");
  //  hiddenField.setAttribute("value", params[key]);

  //   form.appendChild(hiddenField);
  //   }
  //   }

  //   document.body.appendChild(form);
  //   console.log(form)
  //   form.submit();
  // }

  private postFormRoyalSundram(
    path: string,
    params: any,
    method: string
  ) {
    console.log(path, params, method);

    method = method || "post";

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);//"https://www.billdesk.com/pgidsk/PGIMerchantPayment"
    form.setAttribute("enctype", "application/x-www-form-urlencoded");

    form.setAttribute("name", "PAYMENTFORM");

    // for (var key in params) {
    // if (params.hasOwnProperty(key)) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "msg");

    // hiddenField.setAttribute("value", "ROYLSUNGEN|ORD000001066|NA|2.00|NA|NA|NA|INR|NA|R|roylsungen|NA|NA|F|RSAIIHPC086247|12345|RSAI|NB|NA|NA|NA|https://www.royalsundaram.net/web/dtctest/lifeline/thankyou?new_System=Yes&callingApp=lifeline|1775074920");
    hiddenField.setAttribute("value", params.msg);

    form.appendChild(hiddenField);
    // }
    // }

    document.body.appendChild(form);
    console.log(form);

    form.submit();
  }
  private postFormTataAIG(
    path: string,
    params: any,
    method: string
  ) {
    method = method || "post";

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("name", "PAYMENTFORM");

    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  }
  private postForHdfc(
    path: string,
    params: any,
    method: string
  ) {
    method = method || "post";

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("name", "form1");
    form.setAttribute("id", "form1");

    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "text");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  }
  private postFormIffcoTokio(path: string, params: any, method: string) {
    method = method || "post";

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("name", "PAYMENTFORM");

    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  }

  AllPlan() {
    ($("#exampleModalCenter") as any).modal("hide");
    window.history.back();
  }

  paymentSBI(result: ApiResponse) {

    var options = {
      key: "rzp_test_TNM7NAj5tr8DiY", // Enter the Key ID generated from the Dashboard
      amount: result.data[0].ProposalPremium * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "SBIGeneral",
      description: "M2W",
      // image: result.data[0].CompanyLogo,
      order_id: result.data[0].ProposalNumber, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      // callback_url: result.data[0].ResponseURL+"?",

      handler: function (response: any) {

        const payId = response.razorpay_payment_id;
        const orId = response.razorpay_order_id;
        const sig = response.razorpay_signature;

        window.location.href =
          result.data[0].ResponseURL +
          `?razorpay_payment_id=${payId}&razorpay_order_id=${orId}&razorpay_signature=${sig}`;
        // this._vehicleBuyPlanService.GetSbiResponseCheckForSuccess(response).subscribe(res=> console.log(res));
      },

      // prefill: {
      //   name:
      //     result.data[0].VechileOwnerName + result.data[0].VehicleOwnerLastName,
      //   email: result.data[0].EmailID,
      //   contact: result.data[0].MobileNo,
      // },

      notes: {
        address: "Razorpay Corporate Office",
        merchant_order_id: "",
        // quote_number: result.data[0].QuoteID,
        quote_number: result.data[0].QuotationNo1,
        sbig_partner_id: "RazorPay",
      },
      theme: {
        color: "#3399cc",
      },
    };
    var rzp1 = new Razorpay(options);
    rzp1.on("payment.failed", function (response: any) {
      console.log({ response });
      const payId = response.razorpay_payment_id;
      const orId = response.razorpay_order_id;
      const sig = response.razorpay_signature;

      // window.location.href =
      //   result.data[0].ResponseURL +
      //   `?razorpay_payment_id=${payId}&razorpay_order_id=${orId}`;
    });
    rzp1.open();
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
export interface IProposalReponse {
  ApplicationNo: number;
  RegistrationNo: number;
  ProposalNumber: string;
  ProposalPremium: number;
  PaymentURL: string;
  ResponseURL: string;
}

//[{"QuestionID":1,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":1,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":3,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":3,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":6,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":6,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":8,"FamilyMemberCode":1,"QuestionValue":"Yes","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":8,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":9,"FamilyMemberCode":1,"QuestionValue":"02/03/2021","RecordNo":1314},{"QuestionID":10,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":10,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":12,"FamilyMemberCode":1,"QuestionValue":"Yes","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":12,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":13,"FamilyMemberCode":1,"QuestionValue":"29/03/2021","RecordNo":1314},{"QuestionID":14,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":14,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":16,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":16,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":18,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":18,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":20,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":20,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":22,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":22,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":23,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":23,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":24,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":24,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":25,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":25,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":26,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":26,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":27,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":27,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":30,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":30,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":32,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":32,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":34,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":34,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":36,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":36,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":38,"FamilyMemberCode":1,"QuestionValue":"No","RecordNo":1314,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0},{"QuestionID":38,"FamilyMemberCode":2,"QuestionValue":"No","RecordNo":1315,"MedicalLoadingInd":0,"MedicalLoadingPercentage":0,"MedicalLoadingAmt":0}]
