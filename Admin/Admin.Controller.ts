import { AdminService } from "./Admin.Services";
import { Request, Response,NextFunction } from "express";
import { user_id } from "../User/encrypt";
import { fetchData } from "./Admin.data";
import XlSX from 'xlsx';
import sendEmail from "../User/send-mail";
type t = {
    SeriveId: number;
    Service_Date: Date;
    Customer_Name: string;
    Customer_Address: string;
    Duration: string;
    Service_Provider_Name: string;
    Grouse_Amount: number;
    Net_Amount: number;
    Discount: string;
    Status: string;
    Payment_Status: boolean;
    email: string;
    Zipcode: string;
    Rating : number;
    Avtar: string;
};

type u = {
    UserName : string;
    Date : string;
    UserType : string;
    Phone: string;
    Postelcode: string | undefined;
    Status: string | null;
    Action: string
}


export class AdminController{
    public constructor(private readonly AdminService: AdminService) {
        this.AdminService = AdminService;
    }

    public show = async (req: Request, res: Response): Promise<Response> => {
        const fetchdata = new fetchData();
        return fetchdata.fetch()
            .then((result: t[]) => {
                var length = result.length;
                var Data: any = [];
                var Action = "";
                for (var i = 0; i < length; i++) {
                    if (result[i].Status == "Request" || result[i].Status == "Accept" || result[i].Status == "incomplete") {
                        Action = "Edit&Schedule";
                    }
                    else {
                        Action = " ";
                    }
                    Data.push({
                        "ServiceId": result[i].SeriveId,
                        "Service Details": {
                            "Service_Date": result[i].Service_Date,
                            "Duration": result[i].Duration
                        },
                        "Customer Details": {
                            "Name": result[i].Customer_Name,
                            "Address": result[i].Customer_Address
                        },
                        "Service Provider": {
                            "Name": result[i].Service_Provider_Name,
                            "Avtar": result[i].Avtar,
                            "Rate": result[i].Rating
                        },
                        "Grouse Amount": result[i].Grouse_Amount,
                        "Net Amount": result[i].Net_Amount,
                        "Discount": result[i].Discount,
                        "Status": result[i].Status,
                        "Payment Status": result[i].Payment_Status,
                        "Action": Action
                    });
                }
                return res.status(200).json({ Data });
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            });
    }

    public read = async (req: Request, res: Response): Promise<Response> => {
        const fetchdata = new fetchData();
        return fetchdata.fetch()
            .then((result: t[]) => {
                if (req.body.ServiceId) {
                    result = result.filter(result => result.SeriveId == req.body.ServiceId);
                }
                if (req.body.email) {
                    result = result.filter(result => result.email == req.body.email);
                }
                if (req.body.postalcode) {
                    result = result.filter(result => result.Zipcode == req.body.postalcode);
                }
                if (req.body.customername) {
                    result = result.filter(result => result.Customer_Name == req.body.customername);
                }
                if (req.body.ServiceProvide) {
                    result = result.filter(result => result.Service_Provider_Name == req.body.ServiceProvide);
                }
                if (req.body.Status) {
                    result = result.filter(result => result.Status == req.body.Status);
                }
                if (req.body.paymentStatus) {
                    result = result.filter(result => result.Payment_Status == req.body.paymentStatus);
                }
                if (req.body.StartDate) {
                    result = result.filter(result => result.Service_Date >= req.body.StartDate);
                }
                if (req.body.Enddate) {
                    result = result.filter(result => result.Service_Date <= req.body.Enddate);
                }
                if (result.length == 0) {
                    return res.status(201).json({ message: "No Data Found" });
                }
                else {
                    var Data: any = [];
                    for (var i = 0; i < result.length; i++) {
                        Data.push({
                            "ServiceId": result[i].SeriveId,
                            "Service Details": {
                                "Service_Date": result[i].Service_Date,
                                "Duration": result[i].Duration
                            },
                            "Customer Details": {
                                "Name": result[i].Customer_Name,
                                "Address": result[i].Customer_Address
                            },
                            "Service Provider": {
                                "Name": result[i].Service_Provider_Name,
                                "Avtar": result[i].Avtar,
                                "Rate": result[i].Rating
                            },
                            "Grouse Amount": result[i].Grouse_Amount,
                            "Net Amount": result[i].Net_Amount,
                            "Discount": result[i].Discount,
                            "Status": result[i].Status,
                            "Payment Status": result[i].Payment_Status
                        });
                    }
                    return res.status(200).json({ Data });
                }

            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            });

    }

    public Edit = async (req:Request, res:Response): Promise<Response> => {
        var id = req.params.id;
        return this.AdminService
            .findServiceRequestById(+id)
            .then(async (serviceRequest) => {
                if(serviceRequest == null){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    if(serviceRequest.Status == 1 || serviceRequest.Status == 2 || serviceRequest.Status == null){
                        var SStreet_name = " ", SHouse_number = " ", SPostelCode = " " , SCity = " ";
                        var IStreet_name = " ", IHouse_number = " ", IPostelCode = " " , ICity = " "; 
                        await this.AdminService
                            .findaddress(serviceRequest.UserId)
                            .then((userAddress) => {
                                if(userAddress == null){
                                    return res.status(404).json({ error: "Not Found" })
                                }
                                else{
                                    
                                    var a1 = userAddress.AddressLine1.split(" ");
                                    if(a1.length == 2){
                                        SStreet_name = a1[0];
                                        SHouse_number = a1[1]
                                    }
                                    else{
                                        SStreet_name = a1[0] + " " + a1[1];
                                        SHouse_number = a1[2]
                                    }
                                    SPostelCode = userAddress.PostelCode;
                                    SCity = userAddress.City;
                                }
                            })
                            .catch((err: Error) => {
                                console.log(err)
                                return res.status(500).json({ err: "Error" });
                            })
                        await this.AdminService
                            .getAddress(serviceRequest.UserAddressId)
                            .then((useraddress) => {
                                if(useraddress == null){
                                    return res.status(404).json({ error: "Not Found" })
                                }
                                else{
                                    var a1 = useraddress.AddressLine1.split(" ");
                                    if(a1.length == 3){
                                        IStreet_name = a1[0] + " " + a1[1];
                                        IHouse_number = a1[2]
                                    }
                                    else{
                                        IStreet_name = a1[0];
                                        IHouse_number = a1[1]
                                    }
                                    ICity = useraddress.City;
                                    IPostelCode = useraddress.PostelCode;
                                }
                            })
                            .catch((err: Error) => {
                                console.log(err)
                                return res.status(500).json({ err: "Error" });
                            })
                        var Data:any = {};
                        Data = {
                            "Date": serviceRequest.ServiceStartDate,
                            "Arrival Time": serviceRequest.ArrivalTime,
                            "Service Address":{
                                "Street name": SStreet_name,
                                "House number": SHouse_number,
                                "Postel code": SPostelCode,
                                "City": SCity
                            },
                            "Invoice Address":{
                                "Street name": IStreet_name,
                                "House number": IHouse_number,
                                "Postel Code": IPostelCode,
                                "City": ICity
                            }
                        }
                        return res.status(200).json({ Data });
                    }
                    else if(serviceRequest.Status == 3){
                        return res.status(201).json({ message: "You Can not Reschedule after complete the service" });
                    }
                    else{
                        return res.status(201).json({ message: "You Can not Reschedule after cancle the service" });
                    }
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" })
            })

    }

    public Edit_data = async (req:Request, res:Response): Promise<Response> => {
        const id = req.params.id;
        var d = 0;
        return this.AdminService
            .findServiceRequestById(+id)
            .then(async (serviceRequest)=>{
                if(serviceRequest == null){
                    return res.status(404).json({ error : " Not Found" });
                }
                else if(serviceRequest.Status == 4){
                    return res.status(201).json({ message: "You can not edit after cancle the service" });
                }
                else if(serviceRequest.Status == 3){
                    return res.status(201).json({message : " You can not edit after complete the service" });
                }
                else{
                    var count = 0;
                    const hours = serviceRequest.ServiceHours + serviceRequest.ExtraHours;
                    const Arrival = ((req.body.ArrivalTime).split(":"))[1] == "30" ? +((req.body.ArrivalTime).split(":"))[0] + 0.5 : +((req.body.ArrivalTime).split(":"))[0];
                    const end = hours + Arrival;
                    req.body.EndTime = ((end.toString()).split('.'))[1] == "5" ? ((end.toString()).split('.'))[0] + ":30" : ((end.toString()).split('.'))[0] + ":00";
                    if(serviceRequest.Status == 1){
                        serviceRequest.update({
                            ServiceStartDate: req.body.ServiceStartDate,
                            ArrivalTime: req.body.ArrivalTime,
                            EndTime: req.body.EndTime
                        });
                        count = 1;
                    }
                    else{
                        await this.AdminService
                            .userRequest(serviceRequest.ServiceId)
                            .then(async (userRequest) => {
                                if(userRequest == null){
                                    return res.status(404).json({ error: "Not Found" });
                                }
                                else{
                                    const Hid = userRequest.IsAssign;
                                    await this.AdminService
                                        .findhelper(Hid)
                                        .then(async (helper) => {
                                            if(helper.length == 0){
                                                serviceRequest.update({
                                                    ServiceStartDate: req.body.ServiceStartDate,
                                                    ArrivalTime: req.body.ArrivalTime,
                                                    EndTime: req.body.EndTime
                                                });
                                                count = 1;
                                            }
                                            else{
                                                var c = 0;
                                                var d = 0;
                                                for(var i in helper){
                                                    var serviceid = helper[i].ServiceId;
                                                    if(serviceid != +req.params.id){
                                                       await this.AdminService
                                                        .findServiceRequestById(serviceid)
                                                        .then(async (service) => {
                                                            if(service){
                                                                if(service.ServiceStartDate == req.body.ServiceStartDate){
                                                                    var a = service.ArrivalTime.split(":")[1] == "30" ? +(service.ArrivalTime.split(":")[0]) + 0.5 : +(service.ArrivalTime.split(":")[0]);
                                                                    var e = service.EndTime.split(":")[1] == "30" ? +(service.EndTime.split(":")[0]) + 0.5 : +(service.EndTime.split(":"))[0];
                                                                    var Arrival = req.body.ArrivalTime.split(":")[1] == "30" ? +(req.body.ArrivalTime.split(":")[0]) + 0.5 : +(req.body.ArrivalTime.split(":")[0]);
                                                                    var End = req.body.EndTime.split(":")[1] == "30" ? +(req.body.EndTime.split(":")[0]) + 0.5 : +(req.body.EndTime.split(":")[0]);
                                                                    c++;
                                                                    if(Arrival >= (e+1) || (End+1) <= a){
                                                                        d++;
                                                                    }
                                                                }
                                                            }
                                                        })
                                                        .catch((err: Error) => {
                                                            console.log(err)
                                                            return res.status(500).json({ err: "Error" });
                                                        })

                                                    }
                                                }
                                                if(c == d){
                                                    count = 1;
                                                }
                                            }
                                        })
                                        .catch((err: Error) => {
                                            console.log(err)
                                            return res.status(500).json({ err: "Error" });
                                        })
                                }
                            })
                            .catch((err: Error) => {
                                console.log(err)
                                return res.status(500).json({ err: "Error" });
                            })
                    }
                    if(count == 1){
                        const AddressId = serviceRequest.UserAddressId;
                        await this.AdminService
                            .getAddress(AddressId)
                            .then(async (userAddress) =>{
                                if(userAddress == null){
                                    return res.status(401).json({ error : "Not Found" });
                                }
                                else{
                                    const Address = req.body.Street_name + " " + req.body.House_number;
                                    userAddress.update({
                                        AddressLine1: Address,
                                        City : req.body.City,
                                        PostelCode: req.body.PostelCode
                                    })
                                }
                            })
                            .catch((err: Error) => {
                                console.log(err)
                                return res.status(500).json({ err: "Error" });
                            })
                        await this.AdminService
                            .findaddress(serviceRequest.UserId)
                            .then((address) => {
                                if(address == null){
                                    return res.status(401).json({ error : "Not Found" });
                                }
                                else{
                                    const Address = req.body.SStreet_name + " " + req.body.SHouse_number ;
                                    address.update({
                                        AddressLine1: Address,
                                        City : req.body.SCity,
                                        PostelCode: req.body.SPostelCode
                                    }) 
                                }
                            })
                            .catch((err: Error) => {
                                console.log(err);
                                return res.status(500).json({ error : "Error"});
                            })
                        await this.AdminService
                            .findUserRequest(serviceRequest.ServiceId)
                            .then(async(userRequest) => {
                                if(userRequest.length == 0){
                                    return res.status(404).json({ error: "Not Found" });
                                }
                                else{
                                    await this.AdminService
                                        .findUser(userRequest[0].CustomerId)
                                        .then((user) => {
                                            if(user == null){
                                                return res.status(404).json({ error: "Not Found" });
                                            }
                                            else{
                                                sendEmail(user.email,"Service Reschedule","Admin Reschedule Your Service");
                                            }
                                        })
                                        .catch(( err: Error ) => {
                                            console.log(err);
                                            return res.status(500).json({ error: "Error" });
                                        })

                                    for(var i in userRequest){
                                        sendEmail(userRequest[i].email,"Reschedule Service",`SeviceRequest ${serviceRequest.ServiceId} is Reschedule , Kindly check !`);
                                    }
                                    

                                }
                            })
                            .catch((err: Error) => {
                                console.log(err)
                                return res.status(500).json({ err: "Error" });
                            })
                        return res.status(200).json({ message: "Update"});
                    }
                    else{
                        return res.status(201).json({ message: "Another Service Asssign , You can not Edit the time And Date" });
                    }
                   
                }

            })
            .catch((err: Error) => {
                console.log(err)
                return res.status(500).json({ err: "Error" });
            })

        
            
    }

    public cancle = async (req: Request , res: Response): Promise<Response> =>{
        const ServiceId = +req.params.id;
        return this.AdminService
            .findServiceRequestById( ServiceId )
            .then(async (ServiceRequest) => {
                if(ServiceRequest == null){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    if(ServiceRequest.Status == 1 || ServiceRequest.Status == 2){
                        ServiceRequest.update({
                            Status : 4
                        });
                        await this.AdminService
                            .findUserRequest(ServiceId)
                            .then((userRequest) => {
                                if(userRequest == null){
                                    return res.status(404).json({ error: "Not Found" });
                                }
                                else{
                                    this.AdminService
                                        .findUser( userRequest[0].CustomerId)
                                        .then((user) => {
                                            if(user == null){
                                                return res.status(404).json({ error: "Not Found" });
                                            }
                                            else{
                                                sendEmail(user.email,"Cancle Service",`Admin is Cancle the ${+req.params.id} Service`);
                                            }
                                        })
                                        .catch((err: Error) => {
                                            console.log(err);
                                            return res.status(500).json({ Error: "Error" });
                                        })
                                    for(var i in userRequest){
                                        sendEmail(userRequest[i].email,"Cancle the Service",`Admin is Cancle the ${+req.params.id} Service`);
                                    }
                                }
                            })
                            .catch((err: Error) => {
                                console.log(err);
                                return res.status(500).json({ error: "Error" });
                            })
                        return res.status(200).json({ message: "Update" });

                    }
                    else{
                        return res.status(201).json({ message: "Can not Cancle the Service After Complete or Cancle" });
                    }
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public user_managmnet  = async (req: Request, res: Response): Promise<Response> => {
        const user = new fetchData();
        return await user.user()
            .then((User: u[]) => {
                if (User) {
                    var Data:any = []
                    for(var i in User){
                        Data.push({
                            "UserName": User[i].UserName,
                            "Date Of Registration": User[i].Date,
                            "User Type": User[i].UserType,
                            "Phone": User[i].Phone,
                            "Postel Code": User[i].Postelcode,
                            "Status": User[i].Status,
                            "Action": User[i].Action
                        })
                    }
                    return res.status(200).json({ Data });
                }
                else {
                    return res.status(404).json({ message: "Not Found" });
                }
            })
            .catch((err: Error) => {
                console.log(err)
                return res.status(500).json({ err: "Error" });
            })
    }

    public export = async (req: Request, res:Response): Promise<Response> =>{
        const user = new fetchData();
        return await user.user()
            .then((User: u[]) => {
                if (User) {
                    var Data:any = []
                    for(var i in User){
                        Data.push({
                            "UserName": User[i].UserName,
                            "Date Of Registration": User[i].Date,
                            "User Type": User[i].UserType,
                            "Phone": User[i].Phone,
                            "Postel Code": User[i].Postelcode,
                            "Status": User[i].Status,
                            
                        })
                    }
                    const worksheet = XlSX.utils.json_to_sheet(Data);
                    const workbook = XlSX.utils.book_new();
                    XlSX.utils.book_append_sheet(workbook,worksheet,"ServiceHistory");
                    XlSX.write(workbook,{bookType:'xlsx',type:"buffer"});
                    XlSX.write(workbook,{bookType:"xlsx",type:"binary"});
                    XlSX.writeFile(workbook,"data.xlsx");
                    return res.status(200).json({ message: "Check Your File" });
                }
                else {
                    return res.status(404).json({ message: "Not Found" });
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            });
    }

    public user_managment_filter = async (req: Request, res: Response): Promise<Response> =>{
        const fetchdata = new fetchData();
        return await fetchdata
            .user()
            .then((user) =>{
                if(user){
                    var Data:any = [];
                    console.log(req.body)
                    if(req.body.UserName){
                        user = user.filter(user => user.UserName == req.body.UserName)
                    }
                    if(req.body.UserType){
                        user = user.filter(user => user.UserType == req.body.UserType)
                    }
                    if(req.body.Phone){
                        user = user.filter(user => user.Phone == req.body.Phone);
                    }
                    if(req.body.Postelcode){
                        user = user.filter(user => user.Postelcode == req.body.Postelcode)
                    }
                    if(req.body.email){
                        user = user.filter(user => user.Email == req.body.email)
                    }
                    if(req.body.fromdate){
                        user = user.filter(user => user.Date >= req.body.fromdate);
                    }
                    if(req.body.todate){
                        user = user.filter(user => user.Date <= req.body.todate);
                    }
                    if(user.length == 0){
                        return res.status(201).json({ message: "No Data" });
                    }
                    else{
                        for(var i=0; i<user.length; i++){
                            Data.push({
                                "UserName": user[i].UserName,
                                "DateOfRegistration": user[i].Date,
                                "UserType": user[i].UserType,
                                "Phone": user[i].Phone,
                                "PostelCode": user[i].Postelcode,
                                "Status": user[i].Status,
                                "Action": user[i].Action
                            })
                        }
                        return res.status(200).json({ Data });
                    }
                    
                }
                else{
                    return res.status(404).json({ error: "Not Found"});
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public Active = async (req: Request, res: Response): Promise<Response> => {
        const id = req.params.id;
        return await this.AdminService
            .findUser(+id)
            .then((user) => {
                if(user == null){
                    return res.status(404).json({ message: "Not Found" });
                }
                else{
                    user.update({ Status: 1});
                    return res.status(200).json({ message: "Active" });
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public Deactive = async (req: Request, res: Response): Promise<Response> => {
        const id = req.params.id;
        return await this.AdminService
            .findUser(+id)
            .then((user) => {
                if(user == null){
                    return res.status(404).json({ message: "Not Found" });
                }
                else{
                    user.update({ Status: 0});
                    return res.status(200).json({ message: "Deactive" });
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public refund = async(req: Request, res: Response): Promise<Response> =>{
        const id = +req.params.id;
        return this.AdminService
            .findServiceRequestById(id)
            .then((ServiceRequest) => {
                if(ServiceRequest == null){
                    return res.status(404).json({ error : "Not Found" });
                }
                else{
                    if(ServiceRequest.Status == 4 && ServiceRequest.PaymentDone == true){
                        var Data = {
                            "Paid Amount": ServiceRequest.TotalCost,
                            "Refund Amount": ServiceRequest.RefundedAmount == null ? 0 : ServiceRequest.RefundedAmount,
                            "Percentage": ["10%","20%","25%","30%","40%","50%","60%","75%"]
                        }
                        return res.status(200).json({ Data });
                    }
                    else{
                        return res.status(201).json({ message: "You can not Refund the payment" })
                    }
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error : "Error" });
            })
    }

    public calculateRefund = async(req: Request, res: Response): Promise<Response> => {
        const id = +req.params.id;
        return await this.AdminService
            .findServiceRequestById(id)
            .then((serviceRequest) => {
                if(serviceRequest == null){
                    return res.status(404).json({ error: "Error" })
                }
                else{
                    if(serviceRequest.Status == 4 && serviceRequest.PaymentDone == true && serviceRequest.RefundedAmount == null){
                        var p = req.body.Percentage.split("%");
                        var calculate = (serviceRequest.TotalCost*(+p[0]))/100;
                        return res.status(200).json({ calculate });
                    }
                    else { 
                        return res.status(201).json({ message: "You Cannot Refund"});
                    }
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error : "Error" });
            })
    }

    public refundDone = async(req: Request, res: Response): Promise<Response> => {
        const id = +req.params.id;
        return await this.AdminService
            .findServiceRequestById(id)
            .then((serviceRequest) => {
                if(serviceRequest == null){
                    return res.status(404).json({ error: "Error" })
                }
                else{
                    if(serviceRequest.Status == 4 && serviceRequest.PaymentDone == true && serviceRequest.RefundedAmount == null){
                        var p = req.body.Percentage.split("%");
                        var calculate = (serviceRequest.TotalCost*(+p[0]))/100;
                        console.log(calculate);
                        console.log(req.body.calculate);
                        if(calculate == +req.body.calculate){
                            serviceRequest.update({
                                RefundedAmount: calculate 
                            })
                            return res.status(200).json({ message: "Done"});
                        }
                        else{
                            return res.status(201).json({ message: "Something is Wrong" });
                        }
                        
                    }
                    else { 
                        return res.status(201).json({ message: "You Cannot Refund"});
                    }
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error : "Error" });
            })
    }

    public signUp = async (req: Request, res: Response): Promise<Response> => {
        return this.AdminService
            .createAdmin(req.body)
            .then((admin) => {
                if(admin){
                    return res.status(200).json({ admin });
                }
                return res.status(404).json({ error: "Not found" });
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public verify = async (req: Request, res: Response, next: NextFunction) => {
        const id = +user_id({ data: req.cookies.helperland });
        this.AdminService
            .findUser(id)
            .then((user) => {
                if(user?.RoleId == 1){
                    next();
                }
                else{
                    return res.status(404).json({ message: "You can not access this page" });
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" })
            })
    }
}


