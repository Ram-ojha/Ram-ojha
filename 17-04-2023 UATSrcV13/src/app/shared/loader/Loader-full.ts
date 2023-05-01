import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `
  <div class="preloader">
	    <div class="lds-ellipsis">
	        <span></span>
	        <span></span>
          <span></span>	    
          <span></span>
	    </div>
	</div>
  `,
  styles: [
    `
    .preloader {
      background-color: rgb(245 245 245 / 73%);
      bottom: 0;
      height: 100%;
      left: 0;
      position: fixed;
      right: 0;
      top: 0;
      width: 100%;
      z-index: 9999;
    }
    .lds-ellipsis {
      margin: 0 auto;
      position: relative;
      top: 50%;
      -moz-transform: translateY(-50%);
      -webkit-transform: translateY(-50%);
      transform: translateY(-50%);
      width: 64px;
      text-align: center;
      z-index: 9999;
    }
    .lds-ellipsis span {
      display: inline-block;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: #083b66;
      -webkit-animation: ball-pulse-sync 1s 0s infinite ease-in-out;
      animation: ball-pulse-sync 1s 0s infinite ease-in-out;
    }
    .lds-ellipsis span:nth-child(1) {
      -webkit-animation:ball-pulse-sync 1s -.14s infinite ease-in-out;
      animation:ball-pulse-sync 1s -.14s infinite ease-in-out
    }
    .lds-ellipsis span:nth-child(2) {
      -webkit-animation:ball-pulse-sync 1s -70ms infinite ease-in-out;
      animation:ball-pulse-sync 1s -70ms infinite ease-in-out
    }
    .lds-ellipsis span:nth-child(3) {
      -webkit-animation:ball-pulse-sync 1s -80ms infinite ease-in-out;
      animation:ball-pulse-sync 1s -80ms infinite ease-in-out
    }
 
    @-webkit-keyframes ball-pulse-sync {
      33% {
        -webkit-transform:translateY(10px);
        transform:translateY(10px)
    }
      66% {
        -webkit-transform:translateY(-10px);
        transform:translateY(-10px)
      }
      100% {
        -webkit-transform:translateY(0);
        transform:translateY(0)
      }
    }
    @keyframes ball-pulse-sync {
      33% {
        -webkit-transform:translateY(10px);
        transform:translateY(10px)
      }
      66% {
        -webkit-transform:translateY(-10px);
        transform:translateY(-10px)
      }
      100% {
        -webkit-transform:translateY(0);
        transform:translateY(0)
      }
    }
  `]
})

export class AppLoaderComponent { }