import { environment } from "src/environments/environment";
import * as CryptoJS from "crypto-js";

export const convertToMydate = (inputFormat: string | Date): string => {
  function pad(s: string | number) {
    return s < 10 ? "0" + s : s;
  }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join("/");
};
export const convertToDateFormat = (inputFormat: string | Date): string => {
  function pad(s: string | number) {
    return s < 10 ? "0" + s : s;
  }
  var d = new Date(inputFormat);
  return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join("/");
};

// Encryption and decryption functions
export const encrypt = (value: string): string => {
  return CryptoJS.AES.encrypt(value, environment.secretKey.trim()).toString();
};

//code add by pranay start
export const encryption = (value: any): any => {
  // console.log("encryption value",value);
  return CryptoJS.AES.encrypt(value, environment.secretKey.trim()).toString();
  //  return CryptoJS.lib.WordArray.random(value)
  // .toString('hex') 
  // .slice(0, length); //, environment.secretKey.trim()).toString(); 
};
//code add by pranay ended
export const decrypt = (textToDecrypt: string) => {
  return CryptoJS.AES.decrypt(
    textToDecrypt,
    environment.secretKey.trim()
  ).toString(CryptoJS.enc.Utf8);
};
// Encryption and decryption functions end

// minimum and maximum date
export const setMinDays = (days: number): Date | undefined => {
  if (days != 0) {
    const dt = new Date();
    return new Date(+dt.getFullYear(), +dt.getMonth(), +dt.getDate() - days);
  }
  return;
};
export const setMaxDays = (days: number): Date | undefined => {
  if (days != 0) {
    const dt = new Date();
    return new Date(+dt.getFullYear(), +dt.getMonth(), +dt.getDate() + days);
  }
  return;
};
export const setMinDate = (year: number, month = 0, date = 0): Date | undefined => {
  //  
  if (year != 0) {
    const dt = new Date();
    return new Date(
      +dt.getFullYear() - year,
      +dt.getMonth() - month++,
      +dt.getDate() - date
    );
  }
  return;
};
export const setMinDateForNomineee = (year: number, month = 0, date = 0): Date => {

  const dt = new Date();
  return new Date(
    +dt.getFullYear() - year,
    +dt.getMonth() - month++,
    +dt.getDate() - date
  );

}
export const setMaxDate = (year: number, month = 0, date = 0): Date | any => {
  //  
  if (year != 0) {
    const dt = new Date();
    return new Date(
      +dt.getFullYear() + year,
      +dt.getMonth() + month++,
      +dt.getDate() + date
    );
  }
};
export const setMaxRegDate = (year: number, month = 0, date = 0): Date | undefined => {

  // console.log(year,)
  if (year != 0) {
    const dt = new Date();
    return new Date(
      +dt.getFullYear(),
      +dt.getMonth(),
      +dt.getDate()
    );
  }
  return;
};
export const setMinDateCurent = (year: number, month = 0, date = 0): Date => {
  const dt = new Date();
  //return new Date((+dt.getFullYear()) - year, (0), (1));
  return new Date(
    +dt.getFullYear() - (year + 1),
    +dt.getMonth() - month++,
    +dt.getDate() - date
  );
};
export const setMaxDateCurent = (year: number, month = 0, date = 0): Date => {
  const dt = new Date();
  // return new Date((+dt.getFullYear()) - year, (11), (31));
  return new Date(
    +dt.getFullYear() - year,
    +dt.getMonth() - (year != 0 ? month++ : 3),
    +dt.getDate() - date
  );
};

// end date

//#region algo for validating aadhar number
// multiplication table d
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// permutation table p
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

// inverse table inv
const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
export const isValidAadhaar = (array: string): boolean => {
  var c = 0;
  var invertedArray = invArray(array);

  for (var i = 0; i < invertedArray.length; i++) {
    c = d[c][p[i % 8][invertedArray[i]]];
  }

  return c === 0;
};
// converts string or number to an array and inverts it
function invArray(array: any) {
  if (Object.prototype.toString.call(array) === "[object Number]") {
    array = String(array);
  }

  if (Object.prototype.toString.call(array) === "[object String]") {
    array = array.split("").map(Number);
  }

  return array.reverse();
}

// generates checksum
function generate(array: any) {
  var c = 0;
  var invertedArray = invArray(array);

  for (var i = 0; i < invertedArray.length; i++) {
    c = d[c][p[(i + 1) % 8][invertedArray[i]]];
  }

  return inv[c];
}

export const calculatePercent = (totalAmount: number, amount: number) => {
  let calculatedPercent = (amount / totalAmount) * 100;
  return calculatedPercent < 1 ? 0 : calculatedPercent;
};

//#endregion
