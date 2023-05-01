import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customRoundUp'
})
export class CustomRoundUpPipe implements PipeTransform {
    constructor() { }
    transform(value: any): any {
        // let decimals = value - Math.floor(value);
        // let decPart = (value + "").split(".")[1];
        // let indevalueedValue = String(decPart).split('')[0];
        let finalAmount = Math.round(value);
        // if (Number(indevalueedValue) >= 5) finalAmount = ((value + 1) - decimals);
        // else finalAmount = value - decimals;
        return finalAmount;
    }
}