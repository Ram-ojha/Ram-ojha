import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { NgxCaptureService } from "ngx-capture";
import { ApplicationVehicleData } from "src/app/models/common.Model";
import { QuotesSharingModalComponent } from "../quotes-sharing-modal/quotes-sharing-modal.component";

@Component({
  selector: "car-plan-and-premium-details",
  templateUrl: "./car-plan-and-premium-details.component.html",
  styleUrls: ["./car-plan-and-premium-details.component.css"],
})
export class CarPlanAndPremiumDetailsComponent implements OnInit {
  quotesDetailsForSharing: any;
  savedCarData!: ApplicationVehicleData;
  public PopUp: boolean = false;

  @Input() data: any;
  @Input() SelectedAddons: any;
  @Input() plan: any;

  @ViewChild("screen", { static: true }) screen: any;
  @ViewChild("shareQuotesModal", { static: false }) shareQuotesModal!: QuotesSharingModalComponent;


  selectedIndex = 0;

  constructor(private screenCaptureService: NgxCaptureService) { }

  ngOnInit(): void {
    this.savedCarData = JSON.parse(sessionStorage.getItem("CarData")!);
  }
  closeModal() {
    this.PopUp = !this.PopUp;
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

  async captureScreen() {

    try {
      const capturePromise = this.screenCaptureService.getImage(
        this.screen.nativeElement,
        true
      );
      // let imgString = await capturePromise;
      // let convertedImageFile = this.convertBase64ToImage(imgString);
      capturePromise.subscribe((imgString: any) => {
        let convertedImageFile = imgString.replace("data:image/png;base64,", "");
        // let motorDesc = `${this.plan.RegYear} ${this.plan.engineSize ? this.plan.engineSize : ''} ${}`
        let motorDesc = this.plan.vehicleDesc;
        let regYear = this.plan.RegYear;
        let policyType = this.savedCarData["PreviousPolicyTypeDesc"]
          ? this.savedCarData["PreviousPolicyTypeDesc"]
          : this.savedCarData["SubCateDesc"];

        this.quotesDetailsForSharing = {
          image: convertedImageFile,
          planDescription: `${motorDesc} ${regYear} ${policyType}`,
        };
      })

    } catch (err) {
      console.log("error occured");
      console.log({ err });
    }
  }
}
