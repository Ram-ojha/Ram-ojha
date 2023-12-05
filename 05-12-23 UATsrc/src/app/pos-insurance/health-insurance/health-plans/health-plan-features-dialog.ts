import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    animal: string;
    name: string;
}

export interface Task {
    heading: string;
    completed: boolean;
    subtasks?: Task[];
}

@Component({
    selector: 'dialog-overview-example-dialog',
    templateUrl: 'health-plan-features-dialog.html',
    styles: [`
        h1#mat-dialog-title-0 {
            border-bottom: solid 1px rgba(0, 0, 0, 0.6);
            color: rgba(0, 0, 0, 0.6);
            font-size: 15px;
            font-weight: 500;
        }
        .example-radio-group {
            display: flex;
            flex-direction: column;
            margin: 15px 0;
        }
        .example-radio-button {
            margin-left: 8px;
        }
        label#example-radio-group-label {
            font-size: 14px;
            margin-bottom: 0px;
        }
        .example-radio-group {
            display: flex;
            flex-direction: column;
            margin: 5px 0;
        }
        .example-section {
            margin: 12px 0;
        }
        .example-margin {
            margin: 0 12px;
        }
        ul {
            list-style-type: none;
            margin-top: 4px;
            padding-left: 8px;
        }
    `]
})
export class HealthPlanFeaturesDialog implements OnInit {

    favoriteSeason!: string;
    favoriteSeason2!: string;
    preExistingConditions: string[] = ['Covered after 2 years', 'Covered after 3 years', 'Covered after 4 years'];
    hospitalRoomEligibility: string[] = [
        'Atleast 2000/day or more',
        'Atleast 3000/day or more',
        'Atleast 4000/day or more',
        'Atleast 5000/day or more',
        'Atleast 6000/day or more',
        'Atleast 7000/day or more',
        'Atleast 10000/day or more',
        'Shared Room',
        'Private Room',
        'No Limits',
    ];
    featuresForm!: FormGroup;

    constructor(public dialogRef: MatDialogRef<HealthPlanFeaturesDialog>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private _fb: FormBuilder) { }

    ngOnInit() {
        this.featuresForm = this._fb.group({
            favoriteSeason: ["", Validators.required],
            favoriteSeason2: ["", [Validators.required]],
            subtask: ["", [Validators.required]],
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
    onOkClick() {
        console.log("this.featuresForm", this.featuresForm.value);
    }
    task: Task = {
        heading: 'Special Features',
        completed: false,
        subtasks: [
            { heading: 'Maternity cover', completed: false },
            { heading: 'Restoration Benefits', completed: false },
            { heading: 'No-CoPayments', completed: false }
        ]
    };

}