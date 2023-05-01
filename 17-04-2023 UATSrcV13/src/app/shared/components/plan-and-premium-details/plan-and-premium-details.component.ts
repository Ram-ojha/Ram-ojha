import { Component, OnInit, Input, ViewChild, OnChanges } from "@angular/core";
import { NgxCaptureService } from "ngx-capture";
import { ApplicationVehicleData } from "src/app/models/common.Model";
import { QuotesSharingModalComponent } from "../quotes-sharing-modal/quotes-sharing-modal.component";

@Component({
  selector: "plan-and-premium-details",
  templateUrl: "./plan-and-premium-details.component.html",
  styleUrls: ["./plan-and-premium-details.component.css"],
})
export class PlanAndPremiumDetailsComponent implements OnInit, OnChanges {
  quotesDetailsForSharing: any;
  vData!: ApplicationVehicleData;

  @Input() data: any;
  @Input() dataForOriental: any;
  @Input() selectedIndex: any;
  @Input() plan: any;



  @ViewChild("screen", { static: true }) screen: any;
  @ViewChild("shareQuotesModal", { static: false }) shareQuotesModal!: QuotesSharingModalComponent;

  PopUp: boolean = false;
  popUp2: boolean = false;

  ngOnInit(): void {
    this.vData = JSON.parse(sessionStorage.getItem("VehicleData")!);

  }

  ngOnChanges() {

  }

  constructor(private screenCaptureService: NgxCaptureService) { }

  closeModal() {
    this.PopUp = false;

  }
  closeModalforOriental() {
    this.popUp2 = false;
  }
  async captureScreen() {

    try {
      const capturePromise = this.screenCaptureService.getImage(
        this.screen.nativeElement,
        true
      );

      capturePromise.subscribe((imgString: any) => {
        let convertedImageFile = imgString.replace("data:image/png;base64,", "");

        let policyType = this.vData["PreviousPolicyTypeDesc"]
          ? this.vData["PreviousPolicyTypeDesc"]
          : this.vData["SubCateDesc"];
        let motorDesc = this.plan.vehicleDesc;
        let regYear = this.plan.RegYear;
        this.quotesDetailsForSharing = {
          image: convertedImageFile,
          planDescription: `${motorDesc} ${regYear} ${policyType}`,
        };
      })
    }
    catch (err) {
      console.log("error occured");
      console.log({ err });
    }


    // let imgString = await capturePromise;
    // let convertedImageFile = this.convertBase64ToImage(imgString);


  }

  openDialog(): void {

    // const dialogRef = this.dialog.open(QuotesSharingModalComponent, {
    //   width: "250px",
    //   data: {},
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   console.log("The dialog was closed");
    // });
    this.captureScreen();
    this.shareQuotesModal.showModal = true;
  }
}
