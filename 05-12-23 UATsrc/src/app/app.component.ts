import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { AutofocusDirective } from "./shared/directives/autofocus.directive";
import { AuthService } from "./shared/services/auth.service";
import { LoadingService } from "./shared/services/loading.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit, AfterContentChecked {
  title = "bima";
  constructor(private authService: AuthService, public loadingService: LoadingService, private changeDetector: ChangeDetectorRef) {

  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges()
  }

  ngOnInit() {
    // Auto logout functionality

    const tokenInfo = sessionStorage.getItem("tokenInfo");
    if (tokenInfo) {
      let parsedToken = JSON.parse(tokenInfo);
      let expirationDuration: number =
        new Date(parsedToken[".expires"]).getTime() - new Date().getTime();
      this.authService.autoLogout(expirationDuration);
      console.log(expirationDuration);
    }
  }
}
