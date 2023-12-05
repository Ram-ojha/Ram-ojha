import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { PosPolicyServicingComponent } from '../pos--/pos-policy-servicing.component';
import { PolicyServicingApiService } from '../services/pos-policy-servicing.service';

@Component({
  selector: 'app-pos-profile',
  templateUrl: './pos-profile.component.html',
  styleUrls: ['./pos-profile.component.css']
})
export class PosProfileComponent implements OnInit {
  ProfileForm!: FormGroup;
  profileDetails: any;

  constructor(private _service: PolicyServicingApiService, private fb: FormBuilder) { }
  profileImage!: string;
  ngOnInit() {
    this.PatchPOSProfileDetails();
    this.CreatePOSProfile();
  }

  CreatePOSProfile() {
    this.ProfileForm = this.fb.group({
      AadharNumber: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      EmailID1: ['', [Validators.required]],
      LAddress: ['', [Validators.required]],
      LPinCode: ['', [Validators.required]],
      MobileNo1: ['', [Validators.required]],
      NameEnglish: ['', [Validators.required]],
      PANNo: ['', [Validators.required]],
      PayoutAccountNo: ['', [Validators.required]],
      PayoutBeneficiaryName: ['', [Validators.required]],
      PayoutIFSCNo: ['', [Validators.required]],

    })
  }
  PatchPOSProfileDetails() {
    this._service.getPosProfileDetail().subscribe((response) => {
      this.profileDetails = response.data;
      if (this.profileDetails) {
        this.profileImage = this.profileDetails.DocString,
          this.ProfileForm.patchValue({
            AadharNumber: this.profileDetails.AadharNumber,
            DOB: this.profileDetails.DOB,
            EmailID1: this.profileDetails.EmailID1,
            LAddress: this.profileDetails.LAddress,
            LPinCode: this.profileDetails.LPinCode,
            MobileNo1: this.profileDetails.MobileNo1,
            NameEnglish: this.profileDetails.NameEnglish,
            PANNo: this.profileDetails.PANNo,
            PayoutAccountNo: this.profileDetails.PayoutAccountNo,
            PayoutBeneficiaryName: this.profileDetails.PayoutBeneficiaryName,
            PayoutIFSCNo: this.profileDetails.PayoutIFSCNo,
          })
      }
    });
  }

  OnSubmitPOSProfile() {
    console.log(this.ProfileForm.value);
  }
}
