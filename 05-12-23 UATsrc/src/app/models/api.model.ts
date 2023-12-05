export class ApiRequest {
    public action!: string;
    public data: any;
}

export class ApiResponse {
    public successcode!: string;
    public data: any;
    public msg!: string;
    public additionaldata: any;
}