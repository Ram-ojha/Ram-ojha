// -----------  classes   -------------

export class CarInfoModel {
    constructor(_CarBrandCode: number, _CarModelCode: number, _CarVariantCode: number, _FuelCode: number) {
        this.CarBrandCode = _CarBrandCode;
        this.CarModelCode = _CarModelCode;
        this.CarVariantCode = _CarVariantCode;
        this.FuelCode = _FuelCode;
    }
    CarBrandCode: number;
    CarBrandDesc!: string;
    CarModelCode: number;
    CarModelDesc!: string;
    CarVariantCode: number;
    CarVariantDesc!: string;
    RegistrationYearCode!: number;
    RegistrationYearDesc!: string;
    RegistrationDate!: string;

    FuelCode: number;
    FuelTypeDesc!: string;
    CubicCapacity!: number;
    SeatingCapacity!: number;
    VariantName!: string;
}


//  ---------------   public interface ----------- 
export interface ICarBrands {
    CarBrandCode: number;
    CarBrandDesc: string;
    InsuranceCateCode: number;
}
export interface ICarModels {
    CarModelCode: number;
    CarModelDesc: string;
}
export interface ICarVariants {
    CarVariantCode: number;
    CarVariantDesc: string;
    CubicCapacity: any
    SeatingCapacity: any
    VariantName: any
}

export class PolicyType {
    PolicyTypeCode!: number;
    PolicyTypeDesc!: string;
    PolicyTypeDescDetail!: string;
}
export interface IAddons {
    RecordNo: any;
    AddOnCodeDetail: string;
    AddOnCoverName: string;
    AddOnCoverTypeCode: number;
    AddOnCoverTypeName: string;
    value: any;
    Getvalue: string;
}
