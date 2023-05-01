import { IGender, IFamilyMembers, ICoverageList } from './health-insu.Model';
import { IState, ICity, IInsuranceCompany, IList } from './common.Model';

//  ---------------   public classes -----------

export class BikeInfoModel {
    constructor(_BikeBrandCode: number, _BikeModelCode: number, _BikeVariantCode: number) {
        this.BikeBrandCode = _BikeBrandCode;
        this.BikeModelCode = _BikeModelCode;
        this.BikeVariantCode = _BikeVariantCode;
    }
    BikeBrandCode: number;
    BikeBrandDesc!: string;
    BikeModelCode: number;
    BikeModelDesc!: string;
    BikeVariantCode: number;
    BikeVariantDesc!: string;
    RegistrationYearCode!: number;
    RegistrationYearDesc!: string;
    CubicCapacity!: number;
    SeatingCapacity!: number;
    VehicleFuelDesc!: string;
    VehicleFuelCode!: number;

}

export interface IRegistrationVehicleData {
    ApplicationNo: number;
    ApplicationNoOdp: number;
    VechileOwnerName: string
    GenderCode: number;
    GenderDesc: string;
    GenderCodeDesc: string;
    DOB: string;
    MobileNo: number;
    EmailID: string
    NomineeName: string
    NomineeDOB: string;
    RelationshipCode: number;
    RelationshipDesc: string
    PINCode: number;
    PostalAdd: string
    StateCode: number;
    StateDesc: string
    CityCode: number;
    CityDesc: string
    PreviousPolicyExpDate: string;
    PreviousPolicyInsurerCode: number;
    PreviousPolicyInsurerDesc: string
    PreviousPolicyNo: string
    // ClaimInPastYearCode: number;
    // ClaimInPastYearDesc: string
    PreviousNCBCode: number;
    PreviousNCBDesc: string
    VechileRegNo: string
    VechileRegDate: string;
    VechileEngineNo: string
    VechileChassisNo: string
    MortgageInd: boolean;
    MortgageIndDesc: string
    MortgageLBankName: string
    MortgageBankAddress: string
    InsuranceCompCode: number;
    InsuranceCompDesc: string
    IDVAmount: number;
    InsurancePolicyCode: number;
    InsurancePolicyDesc: string
    ZeroDepreciationCode: number;
    ZeroDepreciationDesc: string
    PolicyTenure: number;
    PersonalAccidentCoverInd: boolean;
    PersonalAccidentCoverDesc: string
    ComprehensiveThirdPartyCode: number;
    ComprehensiveThirdPartyDesc: string
    PolicyPremiumAmount: number;
    CGSTPolicyPremiumAmount: number;
    SGSTPolicyPremiumAmount: number;
    IGSTPolicyPremiumAmount: number;
    TotalGSTPremiumAmount: number;
    PolicyPremiumGSTRate: number;
    GSTApplicableCode: number;
    GSTApplicableDesc: string
    OwnerGSTNo: string
    PoicyTotalAmount: number;
    // change car
    VehicleAsCompany: string;
    Married: string;
}
export class RegistrationVehicleData implements IRegistrationVehicleData {
    public ApplicationNo!: number;
    public ApplicationNoOdp!: number;
    public VechileOwnerName!: string;
    public GenderCode!: number;
    public GenderDesc!: string;
    public GenderCodeDesc!: string;
    public DOB!: string;
    public MobileNo!: number;
    public EmailID!: string;
    public NomineeName!: string;
    public NomineeDOB!: string;
    public RelationshipCode!: number;
    public RelationshipDesc!: string;
    public PINCode!: number;
    public PostalAdd!: string;
    public StateCode!: number;
    public StateDesc!: string;
    public CityCode!: number;
    public CityDesc!: string;
    public PreviousPolicyExpDate!: string;
    public PreviousPolicyInsurerCode!: number;
    public PreviousPolicyInsurerDesc!: string;
    public PreviousPolicyNo!: string;
    public ClaimInPastYearCode!: number;
    public ClaimInPastYearDesc!: string;
    public PreviousNCBCode!: number;
    public PreviousNCBDesc!: string;
    public VechileRegNo!: string;
    public VechileRegDate!: string;
    public VechileEngineNo!: string;
    public VechileChassisNo!: string;
    public MortgageInd!: boolean;
    public MortgageIndDesc!: string;
    public MortgageLBankName!: string;
    public MortgageBankAddress!: string;
    public InsuranceCompCode!: number;
    public InsuranceCompDesc!: string;
    public IDVAmount!: number;
    public InsurancePolicyCode!: number;
    public InsurancePolicyDesc!: string;
    public ZeroDepreciationCode!: number;
    public ZeroDepreciationDesc!: string;
    public PolicyTenure!: number;
    public PersonalAccidentCoverInd!: boolean;
    public PersonalAccidentCoverDesc!: string;
    public ComprehensiveThirdPartyCode!: number;
    public ComprehensiveThirdPartyDesc!: string;
    public PolicyPremiumAmount!: number;
    public CGSTPolicyPremiumAmount!: number;
    public SGSTPolicyPremiumAmount!: number;
    public IGSTPolicyPremiumAmount!: number;
    public TotalGSTPremiumAmount!: number;
    public PolicyPremiumGSTRate!: number;
    public GSTApplicableCode!: number;
    public GSTApplicableDesc!: string;
    public OwnerGSTNo!: string;
    public PoicyTotalAmount!: number;

    /// need for car
    public VehicleAsCompany!: string;
    public Married!: string;
}
export interface IApplicationVehiclePlan {
    ApplicationNo: number;
    ApplicationNoOdp: number;
    ClaimPrvPolicyCode: number;
    ClaimPrvPolicyDesc: string;
    CompTPODCode: number;
    CompTPODDesc: string;
    IDVValue: number;
    PrvNCBValue: number;
    PrvNCBDesc: string;
    ZeroDepCode: number;
    ZeroDepDesc: string;
    PACoverCode: number;
    PACoverDesc: string;
    MultiYrCode: number;
    MultiYrDesc: string;
    InsurancePlanCode: number;
    InsurancePlanDesc: string;
    DownloadAmount: number;
    DownloadLoading: number;
    Owner_Driver_PA_Cover_Other_Value: number

}
export class ApplicationVehiclePlan implements IApplicationVehiclePlan {
    public ApplicationNo!: number;
    public ApplicationNoOdp!: number;
    public ClaimPrvPolicyCode!: number;
    public ClaimPrvPolicyDesc!: string;
    public CompTPODCode!: number;
    public CompTPODDesc!: string;
    public CoverageList!: ICoverageList[];
    public IDVValue!: number;
    public PrvNCBValue!: number;
    public PrvNCBDesc!: string;
    public ZeroDepCode!: number;
    public ZeroDepDesc!: string;
    public PACoverCode!: number;
    public PACoverDesc!: string;
    public TPPDCoverCode!: number;
    public TPPDCoverDesc!: string;
    public MultiYrCode!: number;
    public MultiYrDesc!: string;
    public InsurancePlanCode!: number;
    public InsurancePlanDesc!: string;
    public DownloadAmount!: number;
    public DownloadLoading!: number;
    public Owner_Driver_PA_Cover_Other_Value!: any;




}

//  ---------------   public erface -----------
export interface IBikeBrands {
    BikeBrandCode: number;
    BikeBrandDesc: string;
    InsuranceCateCode: number;
}
export interface IBikeModels {
    BikeModelCode: number;
    BikeModelDesc: string;
}
export interface IBikeVariants {
    BikeVariantCode: number;
    BikeVariantDesc: string;
    CubicCapacity: string;
    SeatingCapacity: string;
    FuelType: string;
    FuelTypeCode: string;
}
export interface IVehiclePraposal {
    Gender: IGender[];
    Family_Member: IFamilyMembers[];
    State: IState[];
    City: ICity[];
    Insurance_Company: IInsuranceCompany[];
}
export interface IFilterVehiclePlan {
    isTPPD: boolean;
    isComprehensive: boolean;
    isTp: any;
    isOd: string;
    idvType: number;
    previousNcb: any;
    currentNcb: any;
    zeroDp: boolean;
    paCover: boolean;
    Owner_Driver_PA_Cover_Other_Value: number | null;
    isMultiYear: IList;
    idvValue: number;
    vehicleNo: string;
    rto: string;
    vehicleDesc: string;
    RegYear: string;
    engineSize: string;
    ClaimPrvPolicyDesc: string;
    PolicyExpiryDate: Date | null;
    PrvPolicyExCode: number;
    SubCateCode: number;
    isOdOnly: boolean;
    SubCateDesc: string;
    tppdCover: boolean,
}
export interface IRenewVehicleQuato {
    InsuranceCateCode: number;
    SubCateCode: number;
    SubCateDesc: string;
    VehicleBrandDesc: string;
    VehicleModelDesc: string;
    VehicleVarientDesc: string;
    VehicleRegistrationYrDesc: string;
    VehicleRTODesc: string;
    VehicleNo: string;
    Description: string;
    EngineSize: string;
    RegistrationDate: string;
    OwnerName: string;
    Location: string;
    ClaimPrvPolicyCode: number;
    ClaimPrvPolicyDesc: string;
    PrvPolicyExCode: number;
    VehicleExpiryCode: number;
    PreviousNCB: string;
    CurrentNCB: string;
    PreviousPolicyTypeCode: number;
    PreviousPolicyTypeDesc: string;
    PreviousPolicyExpiryDate: Date;
}
export interface INewVehicleQuato { }
export interface IVehiclePlanFilter {
    PlanId: number;
    ApplicationNo: number;
    ApplicationNoOdp: number;
    CompTPODCode: number;
    CompTPODDesc: string;
    IDVValue: number;
    ClaimPrvPolicyCode: number;
    ClaimPrvPolicyDesc: string;
    PrvNCBValue: number;
    PrvNCBDesc: string;
    ZeroDepCode: number;
    ZeroDepDesc: string;
    PACoverCode: number;
    PACoverDesc: string;
    TPPDCoverCode: number;
    TPPDCoverDesc: string;
    MultiYrCode: number;
    MultiYrDesc: string;
    InsurancePlanCode: number;
    InsurancePlanDesc: string;
}
export interface IApplicationVehicleRegData {
    ApplicationNo: number
    ApplicationNoOdp: number
    VechileOwnerName: string
    VehicleOwnerLastName: string
    GenderCode: number
    GenderCodeDesc: string
    CoverageList: ICoverageList[];
    DOB: string
    MobileNo: number
    EmailID: string
    NomineeName: string
    // NomineeAge: number
    NomineeDOB: string
    RelationshipCode: number
    RelationshipDesc: string
    PINCode: number
    PostalAdd: string
    StateCode: number
    StateDesc: string
    CityCode: number
    CityDesc: string

    SBI_State_Code: string;
    SBI_State_Name: string;
    SBI_District_Code: number;
    SBI_District_Name: string;
    SBI_City_Code: number;
    SBI_City_Name: string;

    PreviousPolicyExpDate: string
    PreviousPolicyInsurerCode: number
    PreviousPolicyInsurerDesc: string
    PreviousPolicyNo: number

    PreviousPolicyInsurerODCode: number
    PreviousPolicyInsurerODDesc: string
    PreviousPolicyODNo: number



    RegistrationDate: string
    // ClaimInPastYearCode: number
    // ClaimInPastYearDesc: string
    PreviousNCBCode: number
    PreviousNCBDesc: string
    VechileRegNo: string
    VechileRegDate: string
    VechileEngineNo: number
    VechileChassisNo: number

    IsPUC: boolean;
    MortgageInd: string
    MortgageIndDesc: string
    MortgageLBankName: string
    MortgageBankAddress: string
    MortgageLBankCode: number;
    InsuranceCompCode: number
    InsuranceCompDesc: string
    IDVAmount: number
    InsurancePolicyCode: number
    InsurancePolicyDesc: string
    ZeroDepreciationCode: number
    ZeroDepreciationDesc: string
    PolicyTenure: string
    PersonalAccidentCoverInd: number
    PersonalAccidentCoverDesc: string
    Owner_Driver_PA_Cover_Other_Value: number

    ComprehensiveThirdPartyCode: number
    ComprehensiveThirdPartyDesc: string
    PolicyPremiumAmount: number
    CGSTPolicyPremiumAmount: number
    SGSTPolicyPremiumAmount: number
    IGSTPolicyPremiumAmount: number
    TotalGSTPremiumAmount: number
    PolicyPremiumGSTRate: number
    GSTApplicableCode: number
    GSTApplicableDesc: string
    OwnerGSTNo: number
    PoicyTotalAmount: number
    DiscountAmount: number;
    DiscountLoading: number;
    // temp
    VehicleAsCompany: string;
    GenderDesc: string;
    Married: string;
    ThirdPartyPolicyInceptionDate: string;
    ThirdPartyPolicyExpiryDate: string;
    PreviousPolicyStartDate: string;
    Area: string;
    Salutation: string;
    PrvPolicyRememberCode: number;
    PrvPolicyRememberDesc: string;
}
export class ApplicationVehicleRegData implements IApplicationVehicleRegData {
    public ApplicationNo!: number;
    public ApplicationNoOdp!: number;
    public VechileOwnerName!: string;
    public VehicleOwnerLastName!: string;
    public GenderCode!: number;
    public GenderCodeDesc!: string;
    public CoverageList!: ICoverageList[];
    public DOB!: string;
    public MobileNo!: number;
    public EmailID!: string;
    public NomineeName!: string;
    // public NomineeAge: number
    public NomineeDOB!: string;
    public RelationshipCode!: number;
    public RelationshipDesc!: string;
    public RegistrationDate!: string;
    public PINCode!: number;
    public PostalAdd!: string;
    public StateCode!: number;
    public StateDesc!: string;
    public CityCode!: number;
    public CityDesc!: string;

    public SBI_State_Code!: string;
    public SBI_State_Name!: string;
    public SBI_District_Code!: number;
    public SBI_District_Name!: string;
    public SBI_City_Code!: number;
    public SBI_City_Name!: string;

    public PreviousPolicyExpDate!: string;
    public PreviousPolicyInsurerCode!: number;
    public PreviousPolicyInsurerDesc!: string;
    public PreviousPolicyNo!: number;

    public PreviousPolicyODNo!: number;
    public PreviousPolicyInsurerODCode!: number;
    public PreviousPolicyInsurerODDesc!: string;
    // public ClaimInPastYearCode: number
    // public ClaimInPastYearDesc: string
    public PreviousNCBCode!: number;
    public PreviousNCBDesc!: string;
    public VechileRegNo!: string;
    public VechileRegDate!: string;
    public VechileEngineNo!: number;
    public VechileChassisNo!: number;

    public IsPUC!: boolean;
    public MortgageInd!: string;
    public MortgageIndDesc!: string;
    public MortgageLBankName!: string;
    public MortgageBankAddress!: string;
    public MortgageLBankCode!: number;
    public InsuranceCompCode!: number;
    public InsuranceCompDesc!: string;
    public IDVAmount!: number;
    public InsurancePolicyCode!: number;
    public InsurancePolicyDesc!: string;
    public ZeroDepreciationCode!: number;
    public ZeroDepreciationDesc!: string;
    public PolicyTenure!: string;
    public PersonalAccidentCoverInd!: number;
    public PersonalAccidentCoverDesc!: string;
    public Owner_Driver_PA_Cover_Other_Value!: number;

    public ComprehensiveThirdPartyCode!: number;
    public ComprehensiveThirdPartyDesc!: string;
    public PolicyPremiumAmount!: number;
    public CGSTPolicyPremiumAmount!: number;
    public SGSTPolicyPremiumAmount!: number;
    public IGSTPolicyPremiumAmount!: number;
    public TotalGSTPremiumAmount!: number;
    public PolicyPremiumGSTRate!: number;
    public GSTApplicableCode!: number;
    public GSTApplicableDesc!: string;
    public OwnerGSTNo!: number;
    public PoicyTotalAmount!: number;
    // temp
    public VehicleAsCompany!: string;
    public GenderDesc!: string;
    public Married!: string;
    public ThirdPartyPolicyInceptionDate!: string;
    public ThirdPartyPolicyExpiryDate!: string;
    public PreviousPolicyStartDate!: string;
    public Area!: string;
    public Salutation!: string;
    public DiscountAmount!: number;
    public DiscountLoading!: number;
    public GSTAmount?: string;

    public PrvPolicyRememberCode!: number;
    public PrvPolicyRememberDesc!: string;
    public CKYCNumber?: string;
    RegistrationNo: any;
    RegistrationNoOdp: any;
}
