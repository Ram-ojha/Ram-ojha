import { IList, IYesNoInd } from "./common.Model";
import { EIdentity } from "./insurance.enum";

// ---------- ALL Patterns object -----------
//Old passport regex used /^[A-PR-WYa-pr-wy]{1}[1-9]\\d\\s?\\d{4}[1-9]$/
export const PATTERN = {
  EMAIL:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  VEHICLENO:
    /^[A-Za-z][A-Za-z][-][0-9][0-9][-][A-Za-z][A-Za-z][-][0-9][0-9][0-9][0-9]$/,
  MOBILENO: /^[6-9][0-9]{9}$/,
  PINCODE: /^[1-9][0-9]{5}$/,
  GSTIN:
    /^([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-7]{1})\s([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}\s[1-9a-zA-Z]{1}\s[zZ]{1}\s[0-9a-zA-Z]{1})$/,
  AADHAAR: /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/,
  PAN: /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/,
  DATE: /^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/,
  // CHESIS NO
  BIKECHESISNO:
    /^([a-zA-z]){2}[0-9]{1}([a-zA-z]){1}[0-9]{2}([a-zA-z]){2}[0-9]{1}([a-zA-Z]){2}[0-9]{5}$/,
  CARCHESISNO:
    /^([a-zA-Z]){2}[0-9]{1}([a-zA-Z]){4}[0-9]{1}([a-zA-Z]){3}[0-9]{6}$/,
  ALPHANUMERIC: /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/,
  PASSWORD: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,13}$/,
  WHITESPACE: /^[^\s]+(\s+[^\s]+)*$/,
  AREA: /^([a-zA-z0-9/\\''(),-\s]{2,255})$/,
  PASSPORT: /^[A-PR-WYa-pr-wy]{1}[0-9]{6}[1-9]{1}$/, //^[A-Z]{1}-[0-9]{7}$
  VOTERID: /^([a-zA-Z]){3}([0-9]){7}?$/,
  DRIVINGLICENCE: /^(([A-Z]{2}[0-9]{2})()|([A-Z]{2}-[0-9]{2}))((19|20)[0-9][0-9])[0-9]{7}$/,
  ADDRESSPATTERN: /^(?![,.\\-])[0-9a-zA-Z\s\-\,\.]+$/,
  CKYC: /^[0-9]{14}/,
  NAREGA: /^[A-Z]{2}-\d{2}-\d{3}-\d{3}-\d{3}\u002F\d{1,3}$/,
  NPR: /^[a-zA-Z0-9]{20}/,
  ITGI: /^[a-zA-Z0-9]{20}/,
  ALLREGEX: /^[a-zA-z0-9/\\''(),-\s]{20}/
};
///^(([A-Z]{2}[0-9]{2})()|([A-Z]{2}-[0-9]{2}))((19|20)[0-9][0-9])[0-9]{7}$/,
// ---------- ALL mask object -----------
export const MASKS = {
  VEHICLENO: {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /[A-Z,a-z]/,
      /[A-Z,a-z]/,
      "-",
      /[0-9]/,
      /[0-9]/,
      "-",
      /[A-Z,a-z]/,
      /[A-Z,a-z]/,
      "-",
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
    ],
  },
  AADHAAR: {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /[2-9]/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
    ],
  },
  PAN: {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /[A-Za-z]/,
      /[A-Za-z]/,
      /[A-Za-z]/,
      /[A-Za-z]/,
      /[A-Za-z]/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /[A-Za-z]/,
    ],
  },
  GSTIN: {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /\d/,
      /\d/,
      " ",
      /[A-Za-z]/,
      /[A-Za-z]/,
      /[A-Za-z]/,
      /[A-Za-z]/,
      /[A-Za-z]/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /[A-Za-z]/,
      " ",
      /[0-9A-Za-z]/,
      " ",
      /[Z,z]/,
      " ",
      /[0-9A-Za-z]/,
    ],
  },
  DATE: {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /[0-3]/,
      /[0-9]/,
      "/",
      /[0,1]/,
      /[0-9]/,
      "/",
      /[1,2]/,
      /[0,1,9]/,
      /[0-9]/,
      /[0-9]/,
    ],
  },
  KYCID: {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /^[a-zA-Z0-9 ]+$/,
      /^[a-zA-Z0-9 ]+$/,
      /^[a-zA-Z0-9 ]+$/,
      /^[a-zA-Z0-9 ]+$/,
      /^[a-zA-Z0-9 ]+$/,
      /^[a-zA-Z0-9 ]+$/,
      /^[a-zA-Z0-9 ]+$/,
      /^[a-zA-Z0-9 ]+$/,
      /^[a-zA-Z0-9 ]+$/,
      /^[a-zA-Z0-9 ]+$/
    ],
  },
  VOTERID: {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /[a-zA-Z]/,
      /[a-zA-Z]/,
      /[a-zA-Z]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
    ],
  },
  DRIVINGLICENSE: { ///^(([A-Z]{2}[0-9]{2})()|([A-Z]{2}-[0-9]{2}))((19|20)[0-9][0-9])[0-9]{7}$/
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /[a-zA-Z]/,
      /[a-zA-Z]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
    ],
  },///^[A-PR-WYa-pr-wy][1-9]\\d\\s?\\d{4}[1-9]$/,
  PASSPORT: {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /[A-PR-WYa-pr-wy]/,
      /[1-9]/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /[1-9]/,
    ],
  },
  CKYC: {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      /\d/,
    ],
  },
  NAREGACARD: { ///^[A-Z]{2}-\d{2}-\d{3}-\d{3}-\d{3}\/\\d{3}$/
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /[a-zA-Z]/,
      /[a-zA-Z]/,
      "-",
      /\d/,
      /\d/,
      "-",
      /\d/,
      /\d/,
      /\d/,
      "-",
      /\d/,
      /\d/,
      /\d/,
      "-",
      /\d/,
      /\d/,
      /\d/,
      "/",
      /\d/,
      /\d/,
      /\d/,
    ],
  },
  NPR: {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
    ],
  },
  ITGI: {
    guide: false,
    keepCharPositions: false,
    showMask: true,
    mask: [
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,
      /[a-zA-Z0-9]/,

    ],
  },
};

//#region all common data lists

export const yesNoList: IYesNoInd[] = [
  { value: "1", viewValue: "Yes" },
  { value: "0", viewValue: "No" },
];
export const NCBList: IList[] = [
  { id: 1, value: "0" },
  { id: 2, value: "20" },
  { id: 3, value: "25" },
  { id: 4, value: "35" },
  { id: 5, value: "45" },
  { id: 6, value: "50" },
];
export const PlanYearList: IList[] = [
  { id: 1, value: "1 Year" },
  { id: 2, value: "2 Years" },
  { id: 3, value: "3 Years" },
  { id: 4, value: "4 Years" },
  { id: 5, value: "5 Years" },
];
export const RenewBikePlanYearList: IList[] = [
  { id: 1, value: "1 Year" },
  { id: 2, value: "2 Years" },
  { id: 3, value: "3 Years" },
];
export const Salutation: IList[] = [
  { id: 1, value: "Mr" },
  { id: 2, value: "M/s" },
  { id: 3, value: "Mrs" },
  { id: 4, value: "Miss" },
];
export const Feets: IList[] = [
  { id: 1, value: "1 feet" },
  { id: 2, value: "2 feet" },
  { id: 3, value: "3 feet" },
  { id: 4, value: "4 feet" },
  { id: 5, value: "5 feet" },
  { id: 6, value: "6 feet" },
  { id: 7, value: "7 feet" },
  { id: 8, value: "8 feet" },
  { id: 9, value: "9 feet" },
];
export const Inches: IList[] = [
  { id: 1, value: "1 inch" },
  { id: 2, value: "2 inch" },
  { id: 3, value: "3 inch" },
  { id: 4, value: "4 inch" },
  { id: 5, value: "5 inch" },
  { id: 6, value: "6 inch" },
  { id: 7, value: "7 inch" },
  { id: 8, value: "8 inch" },
  { id: 9, value: "9 inch" },
  { id: 10, value: "10 inch" },
  { id: 11, value: "11 inch" },
];


export const CkycSBIDocID: { docId: any, docDesc: any }[] = [
  { docId: 1, docDesc: "PAN Card" },
  { docId: 2, docDesc: "Passport" },
  { docId: 3, docDesc: "Ration ID" },
  { docId: 4, docDesc: "Voter ID" },
  { docId: 5, docDesc: "GOV UID" },
  { docId: 6, docDesc: "Driving License" },
  { docId: 7, docDesc: "Aadhar" },
  { docId: null, docDesc: "CKYC Identifier" }

]
// export const Identities: IYesNoInd[] = [
//   { value: '0', viewValue: EIdentity[EIdentity.PAN] },
//   {
//     value: '1',
//     viewValue: EIdentity[EIdentity.AADHAAR],
//   },
//   { value: '2', viewValue: EIdentity[EIdentity.GSTIN] },
// ];

// by dilshad sir
export const Identities: IYesNoInd[] = [
  { value: EIdentity[EIdentity.PAN], viewValue: EIdentity[EIdentity.PAN] },
  {
    value: EIdentity[EIdentity.AADHAAR],
    viewValue: EIdentity[EIdentity.AADHAAR],
  },
  { value: EIdentity[EIdentity.GSTIN], viewValue: EIdentity[EIdentity.GSTIN] },
];
// by dilshad sir end

export const Covers: IList[] = [
  { id: 100000, value: "1 Lakh" },
  { id: 200000, value: "2 Lakh" },
  { id: 300000, value: "3 Lakh" },
  { id: 400000, value: "4 Lakh" },
  { id: 500000, value: "5 Lakh" },
];

//#endregion
