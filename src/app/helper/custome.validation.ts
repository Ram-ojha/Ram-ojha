import { FormGroup } from "@angular/forms";

export function checkNum(){
    return function(myForm : FormGroup){
        let contact = myForm.controls.contact;

        if(contact.errors && !contact.errors.numErr)
        {
            return;
        }
        if(isNaN(contact.value))
        {
            contact.setErrors({ numErr : true });
        }
        else{
            contact.setErrors(null);
        }
    }
}

export function checkLength(){
    return function(myForm : FormGroup){
        let contact = myForm.controls.contact;
        if (contact.errors && !contact.errors.lengthErr) {
            return;
        }
        if (contact.value.length < 10) {
            contact.setErrors({ lengthErr: true });
        }
        else {
            contact.setErrors(null);
        }
    }
}

export function checkPass(){
    return function(myForm : FormGroup){
        let pass = myForm.controls.password;
        let repass = myForm.controls.re_password;

        if(repass.errors && !repass.errors.passErr)
        {
            return;
        }

        if(pass.value != repass.value)
        {
            repass.setErrors({ passErr : true })
        }
        else{
            repass.setErrors(null);
        }


    }
}