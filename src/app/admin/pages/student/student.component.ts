import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {

  allStudent = [
    {
      name : "rohit",
      age : 25,
      city : "indore",
      fee : 5000,
      gender : "male"
    },
    {
      name : "amar",
      age : 21,
      city : "indore",
      fee : 4000,
      gender : "male"
    },
    {
      name : "nidhi",
      age : 23,
      city : "mumbai",
      fee : 7500,
      gender : "female"
    },
    {
      name : "gaurav",
      age : 27,
      city : "pune",
      fee : 5000,
      gender : "male"
    },
    {
      name : "jaya",
      age : 28,
      city : "mumbai",
      fee : 4800,
      gender : "female"
    },
    {
      name : "ram",
      age : 23,
      city : "guna",
      fee : 7800,
      gender : "male"
    },
    {
      name : "ankit",
      age : 28,
      city : "mumbai",
      fee : 6800,
      gender : "male"
    },
    {
      name : "vinita",
      age : 22,
      city : "pune",
      fee : 10000,
      gender : "female"
    },
    {
      name : "nikhil",
      age : 25,
      city : "pune",
      fee : 9000,
      gender : "male"
    }
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
