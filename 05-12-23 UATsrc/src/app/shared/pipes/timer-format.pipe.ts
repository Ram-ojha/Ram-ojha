import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timerformat'
})
export class TimerFormatPipe implements PipeTransform {

    transform(value: number): string {
        const minutes: number = Math.floor(value / 60);
        var hours = Math.floor(value / 3600);
        // var minutes = Math.floor((seconds - (hours * 3600)) / 60);
        return ('00' + hours).slice(-2) + ':' + ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
    }
}