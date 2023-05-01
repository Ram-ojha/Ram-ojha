import { AfterViewInit, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
@Component({
  selector: "app-index",
  templateUrl: "./index.component.html",
  styleUrls: ["./index.component.css", "../shared/loader/loader.css"],
})
export class IndexComponent {
  isContact = false;

  // <temporarily commented as there's no implementation for language change yet>

  // langList = [
  //   { value: "en", desc: "English" },
  //   // { value: 'fr', desc: 'French' },
  //   { value: "hi", desc: "Hindi" },
  // ];
  // currentLang: string;
  // fragment: string;
  // constructor(private route: ActivatedRoute) { }

  // ngOnInit() {
  //   this.route.fragment.subscribe((fragment) => {
  //     this.fragment = fragment;
  //   });
  //   console.log(location.hash);

  //   let url = window.location.pathname.split("/");
  //   if (url[1] === "hi") {
  //     this.currentLang = "hi";
  //   }
  //   if (url[1] === "" || url[1] === "home") {
  //     this.currentLang = "en";
  //   }
  //   //this.showLoader = false;
  //   //$(".loading").fadeOut('slow');
  //   var preLoader = $(".preloader");

  //   // ============================================
  //   // PreLoader On window Load
  //   // =============================================
  //   if (preLoader.length) {
  //     preLoader.addClass("loaderout");
  //   }
  //   $(window).on('popstate', function() {
  //     location.reload(true);
  //   });
  // }
  // ngAfterViewInit(): void {
  //   try {
  //     document.querySelector("#" + this.fragment).scrollIntoView();
  //   } catch (e) { }

  // }

  // public changeLang = (language: string) => {
  //   //console.log(language)
  //   if (language == "0" || language == "language") {
  //     return false;
  //   }
  //   if (language === "en") {
  //     window.location.href = "/hb/";
  //     // this.router.navigate([''], { relativeTo: this.route });
  //   }
  //   if (language === "hi") {
  //     window.location.href = "/hb/hi/";
  //     // this.router.navigate([language], { relativeTo:this.route });
  //   }
  // };

  // </ temporarily commented as there's no implementation for language change yet>

  // onLinkClick(elementId) {
  //   console.log(location.hash);
  //   console.log($("#" + elementId).offset());

  //   $("body,:not(#header)").animate(
  //     {
  //       scrollTop: $("#" + elementId).offset().top - $(window).height() / 5,
  //     },
  //     "slow"
  //   );
  // }

  // onAnchorClick() {
  //   this.route.fragment.subscribe((f) => {
  //     const element = document.querySelector("#" + f);
  //     if (element)
  //       element.scrollIntoView({ behavior: "smooth", block: "center" });
  //   });

  // }

  onClickCloseContact() {
    this.isContact = false;
  }
}
