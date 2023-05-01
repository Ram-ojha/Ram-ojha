import { Component, OnDestroy, OnInit } from '@angular/core';
import { PosCertificateApiService } from '../services/pos-certificate-api.service';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
// import * as html2canvas from 'html2canvas';
import html2canvas from 'html2canvas';

export interface ICertificateData {
  AadharNumber: string;
  AgreementInd: string;
  CertificateDate: string;
  DocByte: string;
  LAddress: string;
  NameEnglish: string;
  PANNo: string;
  Title: string;
  UserCode: string;
  DocString: string;
}

@Component({
  selector: 'app-pos-certificate',
  templateUrl: './pos-certificate.component.html',
  styleUrls: ['./pos-certificate.component.css']
})
export class PosCertificateComponent implements OnInit, OnDestroy {
  private _subscriptions: any[] = [];
  constructor(private _msg: PosCertificateApiService, private _http: HttpClient) { }

  certificateData: ICertificateData | undefined;
  showLoader: boolean = true;
  step = 0;
  onResponseFirst: boolean = true;
  onResponseSecond: boolean = true;
  onResponsethird: boolean = true;
  onthirdtab: boolean = false;
  result: any;

  ngOnInit() {
    this._subscriptions.push(
      this._msg.GetPOSCertificate().subscribe((res) => {
        this.result = res.data;
        this.certificateData = res.data;
        this.showLoader = false;
        if (this.certificateData!.AgreementInd == '1') {
          this.step = 3;
          this.onthirdtab = true
        }
      }))
  }

  setStep(index: number) {
    this.step = index;
  }

  onNativeChangeFirst(e: any) {
    if (e.checked)
      return this.onResponseFirst = false;
    else return this.onResponseFirst = true;
  }

  onNativeChangeSecond(e: any) {
    if (e.checked)
      return this.onResponseSecond = false;
    else return this.onResponseSecond = true;
  }

  onNativeChangethird(e: any) {
    if (e.checked)
      return this.onResponsethird = false;
    else return this.onResponsethird = true;
  }

  onClick() {
    this.onthirdtab = true
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  onEnd() {
    this.showLoader = true;
    if (this.certificateData!.AgreementInd != '1') {
      this._subscriptions.push(
        this._msg.DownloadPOSCertificate().subscribe((res) => {
          console.log(res)
        }))
    }
    this.CreatePDFfromHTML()
  }

  CreatePDFfromHTML() {
    var data: any = document.getElementById('DivPDF');
    html2canvas(data).then((canvas: any) => {
      // Few necessary setting options
      var imgWidth = 208;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      var HTML_Width = $(".DivPDF").width();
      var HTML_Height = $(".DivPDF").height();
      if (HTML_Height == HTML_Height) {
        HTML_Height = 2840;
      }
      if (HTML_Width == HTML_Width) {
        HTML_Width = 3800;
      }
      const contentDataURL = canvas.toDataURL('image/png')
      let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
      var position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
      pdf.save('certificate.pdf'); // Generated PDF
      this.showLoader = false;
    });
  }
  ngOnDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }
}
