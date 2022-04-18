import { Udashbord_service } from "./Udashbord.services";
import {  NextFunction, Request, Response } from "express";
import { decrypt, encrypt, Token1, user_id } from "../User/encrypt";
import XlSX from "xlsx";
import sendEmail from "../User/send-mail";

var extra = [
    {'id': 'a', "name": "Clean cabinet interiors"},
    {'id': 'b', "name": "Cleaning the refrigerator"},
    {'id': 'c', "name": "Cleaning the oven"},
    {'id': 'd', "name": "Washing and drying laundry"},
    {'id': 'e', "name": "Cleaning windows"}
];

export class Udashbord{
    public constructor(private readonly Udashbord_service: Udashbord_service) {
        this.Udashbord_service = Udashbord_service;
    }

    public dashboard = async (req: Request, res: Response): Promise<Response> => {
        const CId = user_id({ data: req.cookies.helperland })
        return await this.Udashbord_service
            .showServiceRequest(CId)
            .then(async (serviceRequest) => {
                if(serviceRequest.length == 0){
                    return res.status(404).json({ error: "1Not Found" });
                }
                else{
                    var Details:any = [];
                    var profile;
                    var name:any ;
                    for(var z  in serviceRequest){
                        var Rating = 0;
                        if(serviceRequest[z].Status == 1 || serviceRequest[z].Status == 2){
                            const serviceId:number = +(serviceRequest[z].ServiceId);
                            if(serviceRequest[z].Status == 2){
                                await this.Udashbord_service
                                    .userRequestById(serviceId)
                                    .then(async (userRequest) => {
                                        if(userRequest == null){
                                            return res.status(404).json({ error: "2Not Found" });
                                        }
                                        else{
                                            
                                            await this.Udashbord_service
                                                .findUser(userRequest.IsAssign)
                                                .then((user) => {
                                                    profile = user?.User_Profile_Picture;
                                                    name = user?.FirstName + " " + user?.LastName;
                                                })
                                                .catch((err: Error)=>{
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Error" });
                                                })
                                            await this.Udashbord_service
                                                .ratingfromUser(userRequest.IsAssign)
                                                .then((rating) => {
                                                    if(rating.length == 0){
                                                        Rating = 0
                                                    }
                                                    else{
                                                        var e = 0
                                                        for(var i in rating){
                                                            e = e + (+rating[i].Ratings);
                                                        }
                                                        Rating = e/rating.length;
                                                    }
                                                })
                                                .catch((err: Error)=>{
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Error" });
                                                })
                                        }
                                    })
                                    .catch((err: Error)=>{
                                        console.log(err);
                                        return res.status(500).json({ error: "2Error" })
                                    })
                            }
                            else{
                                name = " ",
                                profile = " ",
                                Rating = 0
                            }
                            Details.push({
                                "ServiceId": serviceRequest[z].ServiceId,
                                "Service Date": serviceRequest[z].ServiceStartDate,
                                "Duration": serviceRequest[z].ArrivalTime +" - " + serviceRequest[z].EndTime,
                                "Service Provider": {
                                    "Service Provide name" : name,
                                    "Profile": profile == undefined ? "1" : profile,
                                    "Rating": Rating.toFixed(2)
                                },
                                "Payment": serviceRequest[z].TotalCost   
                            })
                        }                        
                    }
                    if(Details.length == 0){
                        return res.status(201).json({ message: "Not Service" });
                    }
                    var Action = [ "Reschedule" ,"Cancel" , "Details"]
                    return res.status(200).json({ Details , Action });
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "3Error" })
            })
    };

    public reSchedule = async (req: Request, res: Response): Promise<Response | any> => {
        const reschedule_id : number = parseInt(req.params.id);
        req.body.ServiceStartDate = req.body.date;
        return await this.Udashbord_service
            .findServicebyUser(reschedule_id)
            .then(async (request) => {
                if(request == null){
                    return res.status(404).json({ error: "Not Found"});
                }
                else if(request.Status == 4){
                    return res.status(201).json({ message: "You can not reschedule after cancle the service" });
                }
                else if(request.Status == 3){
                    return res.status(201).json({ message: "You can not reschedule after complete the service" });
                }
                else if(request.Status == 2){
                    var date = request.ServiceStartDate;
                    var A = ((req.body.ArrivalTime).split(":"))[1] == "30" ? +((req.body.ArrivalTime).split(":"))[0] + 0.5 : +((req.body.ArrivalTime).split(":"))[0] ;
                    var time = (request.ServiceHours) + (request.ExtraHours) + A;
                    var Sid = request.id;
                    return await this.Udashbord_service
                        .userRequestById(request.ServiceId)
                        .then(async (userRequest) => {
                            if(userRequest == null){
                                return res.status(404).json({ error: "Not Found" });
                            }
                            else{
                                const id = userRequest.IsAssign;
                                return await this.Udashbord_service
                                    .finduserforreschedule(id)
                                    .then(async (Userrequest) =>{
                                        if(Userrequest.length == 0){
                                            req.body.EndTime = ((time.toString()).split("."))[1] == '5' ? ((time.toString()).split("."))[0] + ":30" : ((time.toString()).split("."))[0] + ":00";
                                                return await this.Udashbord_service
                                                    .updateServicebyUser(+req.params.id,req.body)
                                                    .then((service) => {
                                                        if(service){
                                                            return res.status(200).json({ message: "Update" });
                                                        }
                                                    })
                                                    .catch((err: Error) => {
                                                        console.log(err);
                                                        return res.status(500).json({ error : "Error" });
                                                    })
                                        }
                                        else{
                                            var c = 0;
                                            var d = 0;
                                            for(var i in Userrequest){
                                                const id = Userrequest[i].ServiceId;
                                                await this.Udashbord_service
                                                    .findServicebyUser(id)
                                                    .then((serviceRequest)=>{
                                                        if(serviceRequest == null){
                                                            return res.status(404).json({ error : "Not Found" });
                                                        }
                                                        else{
                                                            if(serviceRequest.ServiceStartDate == date){
                                                                var a = (serviceRequest.ArrivalTime.split(":"))[1] == "30" ? +(serviceRequest.ArrivalTime.split(":"))[0]+ 0.5 : (serviceRequest.ArrivalTime.split(":"))[0];
                                                                var e = ((serviceRequest.EndTime).split(":"))[1] == "30" ? +((serviceRequest.EndTime).split(":"))[0] + 0.5 : +((serviceRequest.EndTime).split(":"))[0];
                                                                c++;
                                                                if(a >= (time+1) || e <= (A+1)){
                                                                    d++;
                                                                }
                                                            }
                                                        }
                                                    })
                                                    .catch((err: Error) => {
                                                        console.log(err);
                                                        return res.status(500).json({ error: "Error" });
                                                    })

                                            }
                                            if(c == d){
                                                req.body.EndTime = ((time.toString()).split("."))[1] == '5' ? ((time.toString()).split("."))[0] + ":30" : ((time.toString()).split("."))[0] + ":00";
                                                return await this.Udashbord_service
                                                    .updateServicebyUser(+req.params.id,req.body)
                                                    .then(async (service) => {
                                                        if(service){
                                                            await this.Udashbord_service
                                                                .userRequestById( reschedule_id )
                                                                .then((userrequest) =>{
                                                                    if(userrequest == null){
                                                                        return res.status(404).json({ error: "Not Found" });
                                                                    }
                                                                    else{
                                                                        userrequest.update({
                                                                            Start: req.body.ServiceStartDate,
                                                                            End: req.body.EndTime
                                                                        })
                                                                    }
                                                                })
                                                                .catch(( err: Error) => {
                                                                    console.log(err);
                                                                    return res.status(500).json({ error: "Error" })
                                                                })
                                                            return res.status(200).json({ message: "Update" });
                                                        }
                                                    })
                                                    .catch((err: Error) => {
                                                        console.log(err);
                                                        return res.status(500).json({ error : "Error" });
                                                    })
                                            }
                                            else{
                                                return res.status(201).json({ messge: "Another service request has been assigned to the service provider on  " + req.body.date});
                                            }
                                        }
                                    })
                                    .catch((err: Error) => {
                                        console.log(err);
                                        return res.status(500).json({ error: "Error" });
                                    })
                            }
                        })
                        .catch((err: Error ) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                }
                else if(request.Status == 1){
                    return await this.Udashbord_service
                    .updateServicebyUser(reschedule_id, req.body)
                    .then(async (serviceRequest) => {
                        if(serviceRequest){
                            return await this.Udashbord_service
                                .findServicebyUser(reschedule_id)
                                .then(async (service) => {
                                    if(service == null){
                                        return res.status(404).json({ error: "Not Found" })
                                    }
                                    const Time = (service.ServiceHours);
                                    const ExtraTime = (service.ExtraHours);
                                    const Arrival = ((service.ArrivalTime).split(':'))
                                    const total = ((Time+ExtraTime).toString()).split('.');
                                    var time:string ;
                                    if(Arrival[1] == "30"){
                                        if(total[1] == '5'){
                                            time = (((+Arrival[0])+(+total[0])+1).toString())+":00";
                                        }
                                        else{
                                            time = (((+Arrival[0])+(+total[0])).toString())+":30";
                                        }
                                    }
                                    else{
                                        if(total[1] == '5'){
                                            time = (((+Arrival[0])+(+total[0])).toString())+":30";
                                        }
                                        else{
                                            time = (((+Arrival[0])+(+total[0])).toString())+":00";
                                        } 
                                    }
                                    service.update({ EndTime: time });
                                    return await this.Udashbord_service
                                        .userRequestByServiceid(service.ServiceId)
                                        .then((user) => {
                                            if(user.length == 0){
                                                return res.status(401).json({ error: "Not Found" });
                                            }
                                            else{
                                                for(var i in user){
                                                    user[i].update({
                                                        Start: service.ArrivalTime,
                                                        End: service.EndTime,
                                                        Time: (service.ServiceHours) + (service.ExtraHours)
                                                    })
                                                    sendEmail(user[i].email, "ReSchedule", `Service Request ${user[i].ServiceId} has been rescheduled by customer. new date ${req.body.date} and time ${user[i].Start}`);
                                                }
                                                return res.status(200).json({ message: "Update" });
                                            }
                                        })
                                        .catch((err: Error)=>{
                                            console.log(err);
                                            return res.status(500).json({ error: "Error" })
                                        })
                                })
                                .catch((err: Error)=>{
                                    console.log(err);
                                    return res.status(500).json({ error: "Error" })
                                })
                            
                        }
                        return res.status(404).json({ error: "Not Found" });
                    })
                    .catch((err:Error)=>{
                        console.log(err);
                        return res.status(500).json({ error: "Error" })
                    })
                }
                else{
                    return res.status(404).json({ message: "Error" });
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
        
        
    }

    public CancelService = async (req: Request, res: Response): Promise<Response> => {
        const id = parseInt(req.params.id);
        return await this.Udashbord_service
            .userRequest(id)
            .then(async (user) => {
                if(user.length == 0){
                    return res.status(404).json({ error: "Not Found" });
                }
                const length = user.length;
                const j = user.find(o => o.IsAssign != null);
                if(j != undefined){
                    j.update({ IsDeleted: true });
                    sendEmail( j.email , "Cancele the Service", `Service Request ${id} has been cancelled by customer`)
                }
                else{
                    for(var i in user ){
                        user[i].update({ IsDeleted: true})
                        sendEmail(user[i].email, "Cancele the Service", `Service Request ${id} has been cancelled by customer`)
                    }  
                }
                await this.Udashbord_service
                    .findServicebyUser(id)
                    .then((user) => {
                        if(user == null){
                            return res.status(404).json({ error: "Not Found" });
                        }
                        else{
                            user.update({ Status: 4 }); 
                        }
                    })
                    .catch((err : Error)=>{
                        console.log((err));
                        return res.status(500).json({ error: "Error" });
                    })
                return res.status(200).json({ message: "Service Cancle" });
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public ServiceDetails = async (req: Request, res: Response): Promise<Response> => {
        const id = +(req.params.id);
        return await this.Udashbord_service
            .findServicebyUser(id)
            .then(async (service) => {
                if(service == null){
                    return res.status(404).json({ error: "NotFound" });
                }
                else{
                    var ExtraHours : string = "";
                    var ServiceDetails : Object = {};
                    var pet : string = "";
                    if(service.HasPets == true ){
                        pet = "I have pets";
                    }
                    else{
                        pet = "I don't have pets";
                    }
                    await this.Udashbord_service
                        .findServiceExtraById(service.id)
                        .then((service) => {
                            if(service == null){
                                return res.status(404).json({ error: "NotFound" });
                            }
                            else{
                                const id = service.ServiceExtraId;
                                for(var i = 0; i<id.length; i++){
                                    var j = extra.find(o => id[0] == o.id);
                                   if(j != undefined){
                                       ExtraHours += j.name +",";
                                    }

                                }
                            }
                        })
                        .catch((err: Error)=>{
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                        const useraddressId = service.UserAddressId;
                        await this.Udashbord_service
                        .getAddressById(useraddressId)
                        .then((Result) => {
                           if(Result == null){
                            return res.status(404).json({ error: "NotFound" });
                           }
                           else{
                            const serviceAddress = Result.AddressLine1;
                             ServiceDetails = {
                                "Date": service.ServiceStartDate,
                                "Duration": service.ArrivalTime + " - " + service.EndTime ,
                                "Duration_hours": (service.ServiceHours + service.ExtraHours),
                                "Service_id": service.ServiceId,
                                "Extra": ExtraHours,
                                "NetAmount": service.TotalCost,
                                "ServiceAddress": serviceAddress,
                                "Phone": Result.Mobile,
                                "Email": Result.Email,
                                "Would you like to tell your helper something?": pet
                            }

                           }
                        })
                        .catch((err: Error)=>{
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        });
                    var Action = ["Reschedule" , "Cancel"]
                    return res.status(200).json({ ServiceDetails , Action });
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public Service_History = async (req: Request, res: Response): Promise<Response> => {
        const Cid = +user_id({ data: req.cookies.helperland });
        return await this.Udashbord_service
            .showService(Cid)
            .then(async (service) => {
                if(service.length == 0){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    const length = service.length;
                    var ServiceHistory = [];
                    var j:number = -1;
                    var name:any = [];
                    var Rate:any = []
                    var k:number = -1;
                    for(var i = 0; i<length; i++){
                        if(service[i].Status == 1 || service[i].Status == 2){

                        }
                        else{ 
                            if(service[i].Status == 3){
                                const id = service[i].ServiceId;
                                await this.Udashbord_service
                                    .userRequestById(id)
                                    .then(async (userRequest) => {
                                        if(userRequest == null){
                                            return res.status(404).json({ error: "Not Found" });
                                        }
                                        else{
                                            const Hid = userRequest.IsAssign;
                                            const Cid = userRequest.CustomerId;
                                            name[++j] = userRequest.HelperName;
                                            await this.Udashbord_service
                                                .rating(Cid, Hid)
                                                .then((rate) => {
                                                    if(rate == null){
                                                        Rate[++k] = "0"
                                                    }
                                                    else{
                                                        Rate[++k] = rate.Ratings
                                                    }
                                                })
                                                .catch((err: Error) => {
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Error" })
                                                })
                                        }
                                    })
                                    .catch((err: Error)=>{
                                        console.log(err);
                                        return res.status(500).json({ error: "Error" })
                                    })
                            } 
                            else{
                                name[++j] = "";
                                Rate[++k] = 0;
                            }                           
                            
                            ServiceHistory.push({
                            "ServiceId": service[i].ServiceId,
                            "ServiceDate": service[i].ServiceStartDate,
                            "Duaration": service[i].ArrivalTime + " - " + service[i].EndTime,
                            "ServiceProvider": name[i],
                            "ServiceProvider Rating": Rate[i],
                            "Payment": service[i].TotalCost,
                            "Status": service[i].Status == 3 ? "Completed" : "Cancelled",
                            "RateUp": service[i].Status == 3 ? "RateUp" : " "
                            })
                        }
                    }
                    return res.status(200).json({  ServiceHistory });
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            });
    }

    public Export = async (req: Request , res: Response): Promise<Response> => { 
        var Service: any = {} ;
        const Cid = +user_id({ data: req.cookies.helperland });
        return await this.Udashbord_service
            .showService(Cid)
            .then(async (service) => {
                if(service.length == 0){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    var ServiceHistory = [];
                    for(var i in service ){
                        if(service[i].Status == 1 || service[i].Status == 2){
                        }
                        else{
                            var j:number = -1;
                            var name:any = [];
                            var Rate:any = []
                            var k:number = -1;
                            if(service[i].Status == 3){
                                const id = service[i].ServiceId;
                                await this.Udashbord_service
                                    .userRequestByServiceid(id)
                                    .then(async (userRequest) => {
                                        if(userRequest.length == 0){
                                            return res.status(404).json({ error: "Not Found" })
                                        }
                                        else{
                                            const Hid = userRequest[0].UserId;
                                            const Cid = userRequest[0].CustomerId;
                                            name[++j] = userRequest[0].HelperName;
                                            await this.Udashbord_service
                                                .rating(Cid, Hid)
                                                .then((Rating) => {
                                                    if(Rating == null){
                                                        Rate[++k] = 0;
                                                    }
                                                    else{
                                                        Rate[++k] = Rating.Ratings;
                                                        
                                                    }
                                                })
                                                .catch((err: Error)=>{
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Error" })
                                                })
                                        }
                                    })
                                    .catch((err: Error)=>{
                                        console.log(err);
                                        return res.status(500).json({ error: "Error" })
                                    })
                            } 
                            else{
                                name[++j] = "";
                                Rate[++k] = 0;
                            }                           
                            ServiceHistory.push({
                            "ServiceId": service[i].ServiceId,
                            "ServiceDate": service[i].ServiceStartDate,
                            "Duaration": service[i].ArrivalTime + " - " + service[i].EndTime,
                            "ServiceProvider": name[i],
                            "ServiceProvider Rating": Rate[i],
                            "Payment": service[i].TotalCost,
                            "Status": service[i].Status == 3 ? "Completed" : "Cancelled",
                            })
                        }
                    }
                   Service = ServiceHistory;
                    const worksheet = XlSX.utils.json_to_sheet(Service);
                    const workbook = XlSX.utils.book_new();
                    XlSX.utils.book_append_sheet(workbook,worksheet,"ServiceHistory");
                    XlSX.write(workbook,{bookType:'xlsx',type:"buffer"});
                    XlSX.write(workbook,{bookType:"xlsx",type:"binary"});
                    XlSX.writeFile(workbook,"History.xlsx");
                    return res.json({ message: "Check Your File" });
                    
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            });
        
    }

    public RateUp = async (req: Request , res: Response): Promise<Response> => {
        const Cid = +user_id({ data: req.cookies.helperland });
        const serviceId = req.params.id;
        return await this.Udashbord_service
            .findServicebyUser(+serviceId)
            .then(async (serviceRequest) => {
                if(serviceRequest == null){
                    return res.status(404).json({ error: "Not Found" });
                }
                else if(serviceRequest.Status != 3){
                    return res.status(404).json({ message: "You can not rate Helper right now" });
                }
                else{
                    return this.Udashbord_service
                        .userRequestById(serviceRequest.ServiceId)
                        .then(async (userRequest) => {
                            if(userRequest == null){
                                return res.status(404).json({ error: "Not Found" })
                            }
                            else{
                                if(Cid == userRequest.CustomerId){
                                    const id = userRequest.id;
                                    const Hid = userRequest.IsAssign;
                                    req.body.Ratings = (((+req.body.OnTimeArrival)+(+req.body.Friendlly)+(+req.body.QualityOfService))/3).toFixed(2);
                                    req.body.RatingFrom = Cid;
                                    req.body.RatingTo = Hid;
                                   return await this.Udashbord_service
                                        .findrating(id)
                                        .then(async (rate) => {
                                            if(rate == null){
                                               return await this.Udashbord_service
                                                    .Rating(req.body)
                                                    .then((rating) => {
                                                        if(rating == null){
                                                            return res.status(404).json({ error: "Not Found" })
                                                        }
                                                        else{
                                                            rating.update({ UserRequestId: id });
                                                            return res.status(200).json({ rating: rating.Ratings });
                                                        }
                                                    })
                                                    .catch((err: Error)=>{
                                                        console.log(err);
                                                        return res.status(500).json({ error: "Error" });
                                                    })
                                            }
                                            else{
                                                return res.status(201).json({ message: "You can Rate one time" });
                                            }
                                        })
                                        .catch((err: Error)=>{
                                            console.log(err);
                                            return res.status(500).json({ error: "Error" });
                                        })
                                }
                                else{
                                    return res.status(200).json({ message: "Something Is Wrong" });
                                }
                            }
                        })
                        .catch((err: Error)=>{
                            console.log(err)
                            return res.status(500).json({ error: "Error" });
                        })
                   
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    
    }

    public mysetting = async (req: Request, res: Response): Promise<Response> => {
        const id = user_id({ data: req.cookies.helperland });
        return this.Udashbord_service
            .findUserById(id)
            .then((user) => {
                if(user == null){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    const name = "Welcome "+ user.FirstName +" !";
                    const myDetails = {
                        "FirstName": user.FirstName,
                        "LastName": user.LastName,
                        "Email Address" : user.email,
                        "Mobile Number" : user.MobileNumber,
                        "Date Of Birth" : user.Date_Of_Birth,
                        "My Preferred Language" : user.LanguageId
                    }
                    const save = `Reset Details`
                    return res.status(200).json({ name, myDetails, save })
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public change_details = async (req: Request, res: Response): Promise<Response> => {
        const id = user_id({ data: req.cookies.helperland });
        if(req.body.MobileNumber != null){
            const number = req.body.MobileNumber;
           await this.Udashbord_service
                .getAddressesById(+id)
                .then((userAddress) => {
                    if(userAddress.length != 0){
                        for(var i=0; i<userAddress.length; i++){
                            if(userAddress[i].Mobile != number){
                                userAddress[i].update({ Mobile: number });
                            }
                        }
                    }

                })
                .catch((err: Error)=>{
                    console.log(err);
                    return res.status(500).json({error: "Error"})
                })
        }
        const email = req.body.email;
        return await  this.Udashbord_service
            .findUser(id)
            .then((user) => {
                if(user == null){
                    return res.status(404).json({ error: "NotFound" })
                }
                else if(user.email != email){
                    return res.status(201).json({ message: "User can not Edit Email" });
                }
                else{
                    return this.Udashbord_service
                        .updateUser(req.body, id)
                        .then(userupdate => {
                            if(userupdate){
                                return res.status(200).json({ message: "Update data" });
                            }
                            return res.status(404).json({ error: "NotFound" });
                        })
                        .catch((err: Error)=>{
                            console.log(err);
                            return res.status(500).json({ error: "Error"});
                        })
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
        
    }

    public set_defalut = async (req: Request, res: Response): Promise<Response> => {
        const Cid = +user_id({ data: req.cookies.helperland });
        const id = req.params.id;
      return await this.Udashbord_service
            .getAddressesById(Cid)
            .then( (userAddress) => {
                if(userAddress.length == 0){
                    return res.status(404).json({ error: "Not Found"})
                }
                else{
                    for(var i in userAddress ){
                        if(userAddress[i].id == +id){
                            userAddress[i].update({ IsDefault: true });
                        }
                        else{
                            userAddress[i].update({ IsDefault: false });
                        }
                    }
                    return res.status(200).json({ message: "Update" });
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ err: "Error" });
            })
    }

    public address = async (req: Request , res: Response): Promise<Response> => {
        const id = user_id({ data: req.cookies.helperland });
         return await this.Udashbord_service
            .getAddressesById(id)
            .then(address =>{
                if(address.length == 0){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    const data:Object = ["Edit" , "Add" , "Set_Defalt" ]
                    var addressData:any = [];
                    for(var i in address){
                        addressData.push({
                            "Address": address[i].AddressLine1 + "," + address[i].City +" " +address[i].PostelCode,
                            "id": address[i].id
                        }) 
                    }
                    return res.status(200).json({
                        addressData , data
                    })
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public add_user_address = async (req: Request, res: Response): Promise<Response> => {
        const id = user_id({ data: req.cookies.helperland })
        if(req.body.Mobile == null){
           await this.Udashbord_service
            .findUser(id)
            .then( (user) => {
                if(user == null){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    if(req.body.Mobile){
                        req.body.email = user.email;
                    }
                    else{
                        req.body.Mobile = user.MobileNumber;
                        req.body.Email = user.email;
                    }
                    
                    
                } 
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
        }
        return this.Udashbord_service
            .findServiceRequest(id)
            .then( (service) => {
                if(service == null){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    const address = req.body.Street_name + " " + req.body.House_number ;
                return this.Udashbord_service
                    .add_address(
                        address, 
                        req.body.City, 
                        req.body.State, 
                        service.ZipCode, 
                        req.body.Mobile, 
                        req.body.Email, 
                        id)
                    .then(address =>{
                        if(address == null){
                            return res.status(404).json({ error: "Not Found" });
                        }  
                        else{
                            return res.status(200).json({ "address": address.AddressLine1, "Phone Number": address.Mobile });
                        }
                    })
                    .catch((err: Error)=>{
                        console.log(err);
                        return res.status(500).json({ error: "Error" });
                    })
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public update_address = async (req: Request , res: Response): Promise<Response> => {
        const id = req.params.id;
        req.body.AddressLine1 = req.body.Street_name + " " + req.body.House_number;
        return this.Udashbord_service
            .updateAddress(req.body,+id)
            .then( (user) => {
                if(user){
                    return res.status(200).json({ user });
                }
                return res.status(401).json({ error: "Not Found" });
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public PassWord = async (req: Request , res: Response): Promise<Response> => {
        const id = user_id({ data: req.cookies.helperland });
        return this.Udashbord_service
            .findUser(+id)
            .then(async (user) => {
                if(user == null){
                    return res.json(404).json({ error: "Not Found" });
                }
                else{
                    const pass:string = req.body.Password;
                    const compare = await decrypt(pass , user.Password);
                    if(compare == false){
                        return res.status(400).json({ message: "Old Password Incorrect" })
                    }
                    else{
                        const newPass = await encrypt(req.body.NewPassword);
                        user.update({ Password: newPass });
                        return res.status(200).json({ message: "Update PassWord" });
                    }
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public Delete_address = async (req: Request , res: Response): Promise<Response> => {
        const id = req.params.id;
        return await this.Udashbord_service
            .findUserAddres(+id)
            .then(async (user) => {
                if(user){
                    if(user.Status == 1 || user.Status == 2){
                        return res.status(200).json({ message: `Your Address is Assign to ${user.ServiceId},so you can not delete` });
                    }  
                }
                return await this.Udashbord_service
                .deleteAddress(+id)
                .then( (id) => {
                    if(id > 0){
                        return res.status(200).json({ message: "Deleted Address" });
                    }
                    return res.status(404).json({ error: "Something is Wrong" });
                })
                .catch((err: Error)=>{
                    console.log(err);
                    return res.status(500).json({ error: "Error" });
                })

            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" })
            })
        
    }

    public favourite = async (req: Request, res: Response): Promise<Response> => {
        const id = user_id({ data: req.cookies.helperland });
        var Service:any = [];
        return await this.Udashbord_service
            .finduserByCustomerId(id)
            .then(async (userRequest) => {
                if(userRequest.length == 0){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    for(var i in userRequest){
                        var Hid = userRequest[i].IsAssign;
                        var serviceid = userRequest[i].ServiceId;
                        var k = Service.find( (o: { id: number; }) => o.id == Hid);
                        if(k == undefined){
                            await this.Udashbord_service
                                .findServicebyUser(serviceid)
                                .then(async (serviceRequest)=> {
                                    if(serviceRequest == null){
                                        return res.status(404).json({ error: "Not Found" }); 
                                    }
                                    else{
                                        if(serviceRequest.Status == 3){
                                            var count = 0;
                                            await this.Udashbord_service
                                                .checkfav(Hid, id)
                                                .then(async (fav) =>{
                                                    if(fav != null){
                                                        if(fav.IsBlocked == false || fav.IsBlocked == null){
                                                            count = 1;
                                                        }
                                                    }
                                                    else {
                                                        count = 1;
                                                    }
                                                })
                                                .catch((err: Error) => {
                                                    console.log(err);
                                                    return res.status(500).json({ error : "Error" })
                                                })
                                            if(count == 1){
                                                await this.Udashbord_service
                                                    .findUser(Hid)
                                                    .then(async (user) => {
                                                        if(user == null){
                                                            return res.status(404).json({ error: "Not Found" });
                                                        }
                                                        else{
                                                            await this.Udashbord_service
                                                                .checkfav(id, Hid)
                                                                .then(async (userfav) => {
                                                                    if(userfav == null){
                                                                        Service.push({
                                                                            "Name": user.FirstName + " " + user.LastName,
                                                                            "Avtar": user.User_Profile_Picture == null ? "1" : user.User_Profile_Picture,
                                                                            "Action": "Add To favourite",
                                                                            "Action1": "Add to Block",
                                                                            "id": Hid
                                                                        })
                                                                    }
                                                                    else{
                                                                        console.log(userfav)
                                                                        if(userfav.IsFavorite != true){
                                                                            if(userfav.IsBlocked == true){
                                                                                Service.push({
                                                                                    "Name": user.FirstName + " " + user.LastName,
                                                                                    "Avtar": user.User_Profile_Picture == null ? "1" : user.User_Profile_Picture,
                                                                                    "Action": "Add To favourite",
                                                                                    "Action1": "Add To Unblock",
                                                                                    "id": Hid
                                                                                }) 
                                                                            }
                                                                            else{
                                                                                Service.push({
                                                                                    "Name": user.FirstName + " " + user.LastName,
                                                                                    "Avtar": user.User_Profile_Picture == null ? "1" : user.User_Profile_Picture,
                                                                                    "Action": "Add To favourite",
                                                                                    "Action1": "Add To block",
                                                                                    "id": Hid
                                                                                })
                                                                            }
                                                                            
                                                                        }
                                                                        else{
                                                                            if(userfav.IsBlocked == true){
                                                                                Service.push({
                                                                                    "Name": user.FirstName + " " + user.LastName,
                                                                                    "Avtar": user.User_Profile_Picture == null ? "1" : user.User_Profile_Picture,
                                                                                    "Action": "Add To Unfavourite",
                                                                                    "Action1": "Add To Unblock",
                                                                                    "id": Hid
                                                                                }) 
                                                                            }
                                                                            else{
                                                                                Service.push({
                                                                                    "Name": user.FirstName + " " + user.LastName,
                                                                                    "Avtar": user.User_Profile_Picture == null ? "1" : user.User_Profile_Picture,
                                                                                    "Action": "Add To Unfavourite",
                                                                                    "Action1": "Add To block",
                                                                                    "id": Hid
                                                                                })
                                                                            }
                                                                        }
                                                                    }
                                                                })
                                                                .catch((err: Error) => {
                                                                    console.log(err);
                                                                    return res.status(500).json({ error: "Error" });
                                                                })
                                                        }
                                                    })
                                                    .catch((err: Error) => {
                                                        console.log( err );
                                                        return res.status(500).json({ error: "Error" });
                                                    })
                                            }
                                        }
                                    }
                                })
                                .catch((err: Error) => {
                                    console.log(err);
                                    return res.status(500).json({ error: "Error" });
                                })
                        }
                    }
                    return res.status(200).json({ Service });
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })

        
    }

    public Favourite = async (req: Request, res: Response): Promise<Response> => {
        const id = req.params.id;
        const Cid = +user_id({ data: req.cookies.helperland });
        req.body.UserId = Cid;
        req.body.TargetUserId = id;
        return this.Udashbord_service
            .checkfav(Cid, +id)
            .then(async (fav) => {
                if(fav == null){
                   return await this.Udashbord_service
                    .addfev(req.body)
                    .then((user) => {
                        if(user == null){
                            return res.status(404).json({ error: "Not Found" })
                        }
                        else{
                            user.update({ IsFavorite: true, IsBlocked: false });
                            return res.status(200).json({ message: "update" })
                        }
                    })
                    .catch((err: Error)=>{
                        console.log(err);
                        return res.status(500).json({ error: "Error" });
                    })
                }
                else{
                    fav.update({ IsFavorite: true });
                    return res.status(200).json({ message: "update" })
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
            
    }

    public UnFavourite = async (req: Request, res: Response): Promise<Response> => {
        const id = req.params.id;
        const Cid = +user_id({ data: req.cookies.helperland });
        return this.Udashbord_service
            .checkfav(Cid, +id)
            .then((fav) => {
                if(fav == null){
                    return res.status(404).json({ error: "Error" });
                }
                else{
                    fav.update({ IsFavorite: false });
                    return res.status(200).json({ message: "update" });
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public Block = async (req: Request, res: Response): Promise<Response> => {
        const id = +req.params.id;
        const Cid = +user_id({ data: req.cookies.helperland });
        req.body.UserId = Cid;
        req.body.TargetUserId = id;
        return await this.Udashbord_service
            .checkfav(Cid,id)
            .then(async(fav) => {
                if(fav == null){
                   return await this.Udashbord_service
                        .addfev(req.body)
                        .then((user) => {
                            if(user == null){
                                return res.status(404).json({ error: "Not Found" });
                            }
                            else{
                                user.update({ IsBlocked: true })
                                return res.status(200).json({ message: "Update" });
                            }
                        })
                        .catch((err: Error)=>{
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                }
                else{
                    fav.update({ IsBlocked: true });
                    return res.status(200).json({ message: "Update" });
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public unblock = async (req: Request, res: Response): Promise<Response> => {
        const id = +req.params.id;
        const Cid = +user_id({ data: req.cookies.helperland });
        return this.Udashbord_service
            .checkfav(Cid , id)
            .then((user) => {
                if(user == null){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    user.update({ IsBlocked: false })
                    return res.status(200).json({ message: "Update" });
                }
            })
            .catch((err: Error)=>{
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public verify = async (req: Request, res: Response, next: NextFunction) => {
        const id = +user_id({ data: req.cookies.helperland });
        this.Udashbord_service
            .findUser(id)
            .then((user) => {
                if(user?.RoleId == 2){
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

