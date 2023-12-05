// -----------  classes   -------------

export class CVInfoModel {
    constructor(_CVBrandCode: number, _CVModelCode: number, _CVVariantCode: number, _FuelCode: number) {
        this.CvBrandCode = _CVBrandCode;
        this.CvModelCode = _CVModelCode;
        this.CvVariantCode = _CVVariantCode;
        this.FuelCode = _FuelCode;
    }
    RecordNoforCvVehicleType!: number;
    CvVehicleType!: string;
    VehicleTypeId!: number;
    VehicleTypeCarriageCode!: number;
    CvVehicleDesc!: string;
    VehicleTypeCarriageDesc!: string;
    CvBrandCode: number;
    CvBrandDesc!: string;
    CvModelCode: number;
    CvModelDesc!: string;
    CvVariantCode: number;
    CvVariantDesc!: string;
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
export interface ICVBrands {
    MakeCode: number;
    MakeDesc: string;
    VehicleType: string;
    VehicleTypeId: number;
    InsuranceCateCode: number;
}
export interface ICVModels {
    InsuranceCateCode: number;
    ModelCode: number;
    ModelDesc: string;
}
export interface ICVVariants {
    Capacity: any;
    VariantCode: number;
    VariantDesc: string;
    CarryingCapacity: number;
    CubicCapacity: number;
    VariantName: string;
}

export interface ICVVehicle {
    CVehicleTypeIcon: any;
    VehicleTypeId: any;
    RecordNo: number;
    CVehicleType: string;
    CVehicleDesc: string;
    VehicleTypeCarriageCode: number;
    VehicleTypeCarriageDesc: string;
}

export class PolicyType {
    PolicyTypeCode!: number;
    PolicyTypeDesc!: string;
    PolicyTypeDescDetail!: string;
}
export interface IAddons {
    RecordNo: number;
    AddOnCodeDetail: string;
    AddOnCoverName: string;
    AddOnCoverTypeCode: number;
    AddOnCoverTypeName: string;
    value: number;
    Getvalue: string;
}