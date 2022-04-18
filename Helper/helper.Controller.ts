import { NextFunction, Request, Response } from "express";
import { decrypt, encrypt, user_id } from "../User/encrypt";
import sendEmail from "../User/send-mail";
import { HelperService } from "./helperService";
import XlSX from "xlsx";

var extra = [
    {'id':'a',"name":"Clean cabinet interiors"},
    {'id':'b',"name":"Cleaning the refrigerator"},
    {'id':'c',"name":"Cleaning the oven"},
    {'id':'d',"name":"Washing and drying laundry"},
    {'id':'e',"name":"Cleaning windows"}
];

export class HelperController{
    public constructor(private readonly HelperService: HelperService) {
        this.HelperService = HelperService;
    }

    public new_Request = async (req: Request, res: Response): Promise<Response> => {
        const Hid = +user_id({ data: req.cookies.helperland });
        var code: string;
        var helperName: string;
        var hemail: string;
       return await this.HelperService
            .findServiceId(Hid)
            .then(async (userRequest) => {
                if(userRequest.length == 0){
                    await  this.HelperService
                        .findUser(Hid)
                        .then( (user) => {
                            if(user == null){
                                return res.status(404).json({ error: "Not Found" })
                            }
                            else{
                                if(user.Zipcode){
                                    code = user.Zipcode;
                                    helperName = user.FirstName + " " + user.LastName;
                                    hemail = user.email
                                } 
                                else{
                                    return res.status(404).json({ error: "Not Found" });
                                }  
                            }
                        })
                        .catch((err: Error) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                    return await this.HelperService
                        .findservicebycode(code)
                        .then(async (serviceRequest) => {
                            if(serviceRequest.length == 0){
                                return res.status(200).json({ message: "No ServiceRequest" });
                            }
                            else{
                                var Data:any = [];
                                for(var z in serviceRequest){
                                    const Cid = serviceRequest[z].UserId;
                                    var Address: string = "", name: string = "";
                                    await this.HelperService
                                        .findUser(Cid)
                                        .then((user) => {
                                            if(user){
                                                name = user.FirstName + " " + user.LastName;
                                            }
                                        })
                                        .catch((err: Error) => {
                                            console.log(err);
                                            return res.status(500).json({ error: "Error" })
                                        })
                                    await this.HelperService
                                        .getAddressById(serviceRequest[z].UserAddressId)
                                        .then((userAddress) => {
                                            if(userAddress){
                                                Address = userAddress.AddressLine1 + "," + userAddress.City + " " + userAddress.PostelCode
                                            }
                                        })
                                        .catch((err:Error)=>{
                                            console.log(err);
                                            return res.status(500).json({error:"Error"})
                                        })
                                        
                                    Data.push({
                                        "ServiceId": serviceRequest[z].ServiceId,
                                        "ServiceDate": serviceRequest[z].ServiceStartDate,
                                        "ServiceDuration": serviceRequest[z].ArrivalTime + " - " + serviceRequest[z].EndTime,
                                        "Customer Details": {
                                            "name": name,
                                            "Address": Address
                                        },
                                        "payment": serviceRequest[z].TotalCost,
                                    })
                                await this.HelperService
                                    .creatUserRequest(serviceRequest[z].ServiceId)
                                    .then(async (userRequest) => {
                                        if(userRequest == null){
                                            return res.status(404).json({ error: "Not Found" });
                                        }
                                        else{
                                           await userRequest.update({
                                                CustomerId: Cid,
                                                IsDeleted: false,
                                                Start: serviceRequest[z].ArrivalTime,
                                                End: serviceRequest[z].EndTime,
                                                Time: +(serviceRequest[z].ExtraHours) + (+serviceRequest[z].ServiceHours),
                                                email: hemail,
                                                HelperName: helperName,
                                                UserId: Hid 
                                            })
                                        }
                                    })
                                    .catch((err: Error) => {
                                        console.log(err);
                                        return res.status(500).json({ error: "Error" });
                                    })

                                }
                                return res.status(200).json({
                                    "Welcome!": helperName,
                                    Data,
                                    "Action": ["Details" , "Accept" ],
                                    "entries Total Record":Data.length
                                });

                            }
                        })
                        .catch((err: Error) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                }
                else{
                    var Data: any = [];
                    var helpername;
                    for(var z in userRequest){
                        helpername = userRequest[z].HelperName;
                        if(userRequest[z].IsAssign == null){
                            await this.HelperService
                            .findServiceRequestById(userRequest[z].ServiceId)
                            .then(async (serviceRequest) => {
                                if(serviceRequest == null){
                                    return res.status(404).json({error:"NotFound"});
                                }
                                const Cid = serviceRequest.UserId;
                                const Aid = serviceRequest.UserAddressId;
                                const Status = serviceRequest.Status;
                                var name,Address;
                                await this.HelperService
                                    .findUser(Cid)
                                    .then( (user) => {
                                        if(user == null){
                                            return res.status(404).json({ error: "Not Found" });
                                        }
                                        name = user.FirstName + " " + user.LastName;
                                    })
                                    .catch((err: Error) => {
                                        console.log(err);
                                        return res.status(500).json({ error: "Error" });
                                    })
                                await this.HelperService
                                    .getAddressById(Aid)
                                    .then( (userAddresss) => {
                                        if(userAddresss == null){
                                            return res.status(404).json({ error: "not found" })
                                        }
                                        Address = userAddresss.AddressLine1 + "," + userAddresss.City + " " + userAddresss.PostelCode;
                                    })
                                    .catch((err: Error) => {
                                        console.log(err);
                                        return res.status(500).json({ error: "Error" });
                                    });
                                    if(Status == 1){
                                        Data.push({
                                            "ServiceId": userRequest[z].ServiceId,
                                            "Service Date":{
                                                "Date": serviceRequest.ServiceStartDate,
                                                "Duration": serviceRequest.ArrivalTime + " - " + serviceRequest.EndTime
                                            },
                                            "Customer Details":{
                                                "name": name,
                                                "Address": Address
                                            },
                                            "Payment": serviceRequest.TotalCost,
                                        })
                                    }
                                
                            })
                            .catch((err: Error) => {
                                console.log(err);
                                return res.status(500).json({ error: "Error" });
                            })
                        }
                    }
                    return res.status(200).json({ 
                        "Wel-come": helpername,
                        Data,
                        "Action": ["Details" ,"Accept" ],
                        "entries Total Recode": Data.length
                    });
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
        
    }

    public Accept_Service = async (req: Request ,res: Response): Promise<Response | any> => {
        const Hid = +user_id({ data: req.cookies.helperland });
        const serviceId = req.params.id;
        await this.HelperService
            .findServiceRequestById(+serviceId)
            .then(async (serviceRequest) => {
                if(serviceRequest == null){
                    return res.status(404).json({ error: "Error" });
                }
                else if(serviceRequest.Status == 2){
                    return res.status(201).json({ mesage: "This Service Request is no more Avilable" });
                }
                else{
                    var d = serviceRequest.ServiceStartDate.split('-');
                    var date1 = new Date(+d[2],+d[1]-1,+d[0])
                    if(date1.getDate() < new Date().getDate() && date1.getMonth() <= new Date().getMonth() && date1.getFullYear() <= new Date().getFullYear()){
                        return res.status(201).json({ message: "You can not recive lese than today date"});
                    }
                    var date = serviceRequest.ServiceStartDate;
                    var A = serviceRequest.ArrivalTime.split(":");
                    var Arrival = A[1] == "30" ? +A[0]+0.5 : +A[0];
                    var E = serviceRequest.EndTime.split(":");
                    var EndTime = E[1] == "30" ? +E[0]+0.5 : +E[0];
                    await this.HelperService
                        .findServiceId(Hid)
                        .then(async (userRequest) => {
                            if(userRequest.length == 0){
                                return res.status(400).json({ error: "not Found" });
                            }
                            else{
                                var count = 0;
                                var c = 0;
                                for(var i in userRequest){
                                    if(userRequest[i].ServiceId != +serviceId){
                                        const id = userRequest[i].ServiceId;
                                        await this.HelperService
                                        .findServiceRequestById(id)
                                        .then( (request) => {
                                            if(request == null){
                                                return res.status(404).json({ error: "Not Found" })
                                            }
                                            else if(request.Status == 2){
                                                if(request.ServiceStartDate == date){
                                                    count++;
                                                    var a = request.ArrivalTime.split(":");
                                                    var arrival = a[1] == "30" ? +a[0]+0.5 : +a[0];
                                                    var e = request.EndTime.split(":");
                                                    var end = e[1] == "30" ? +e[0]+0.5 : +e[0];
                                                    if(arrival >= (EndTime+1) || (end+1) <= (Arrival)){
                                                        c++;
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
                                if(count == c){
                                    await this.HelperService
                                        .findUserRequestForAccept(+serviceId)
                                        .then( (urequest) => {
                                            if(urequest.length == 0){
                                                return res.status(404).json({ error: "Not Found" })
                                            }
                                            else{
                                                for(var z in urequest){
                                                    if(urequest[z].UserId == Hid){
                                                        const id = urequest[z].CustomerId;
                                                        urequest[z].update({ IsAssign : Hid })
                                                        serviceRequest.update({
                                                            Status: 2,
                                                            SPAcceptedDate: new Date()
                                                        });
                                                    }
                                                    else{
                                                        var email = urequest[z].email;
                                                        sendEmail(email, "Service Request", "Service Request Accept By Another Service Provider");
                                                        urequest[z].destroy();
                                                    }
                                                }
                                                return res.status(200).json({ message: "Accept Service Request" });
                                            }
                                        })
                                        .catch((err: Error) => {
                                            console.log(err);
                                            return res.status(500).json({ error: "Error" });
                                        })
                                }
                                else{
                                    return res.status(201).json({ message: "Another service request has already been  assigned which has time overlap with this service Request . you can not pick this one" })
                                }
                            }
                        })
                        .catch( (err: Error) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                }
            })
            .catch( (err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public Details = async (req: Request , res: Response): Promise<Response> => {
        const Hid = +user_id({ data: req.cookies.helperland });
        const id = req.params.id;
        return await this.HelperService
            .findServiceRequestById(+id)
            .then(async (serviceRequest) => {
                if(serviceRequest == null){
                    return res.status(404).json({ error: "error" });
                }
                else{
                    var Extra:any = [];
                    const sid = serviceRequest.id;
                    var compare;
                    await this.HelperService
                        .findUserRequest(serviceRequest.ServiceId)
                        .then((userRequest) => {
                            if(userRequest == null){
                                return res.status(404).json({ error: "Not Found" })
                            }
                            else if(userRequest.IsAssign == Hid && userRequest.IsDeleted == false){
                                compare = true;
                            }
                        })
                        .catch( (err: Error) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                    await this.HelperService
                        .ExtraHours(sid)
                        .then( (extraService) => {
                            if(extraService == null){
                                return res.status(404).json({ error: "error" });
                            }
                            else{
                                const eid = extraService.ServiceExtraId;
                                for(var i = 0; i < eid.length; i++){
                                    var service = extra.find((o: { id: string; }) =>o.id == eid[i]);
                                    if(service != undefined){
                                        Extra.push(service.name);
                                    }
                                }
                            }
                        })
                        .catch( (err: Error) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                    const Cid = serviceRequest.UserId;
                    const Aid = serviceRequest.UserAddressId;
                    var name,address;
                    await this.HelperService
                        .findUser(Cid)
                        .then( (user) => {
                            if(user == null){
                                return res.status(404).json({ error: "Not Found" })
                            }
                            name = user.FirstName + " " + user.LastName;
                        })
                        .catch( (err: Error) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                    await this.HelperService
                        .getAddressById(Aid)
                        .then((userAddress) => {
                            if(userAddress == null){
                                return res.status(404).json({ error: "Not Found" });
                            }
                            address = userAddress.AddressLine1 + " , "+ userAddress.City + userAddress.PostelCode;
                        })
                        .catch( (err: Error) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                        var action:any = [];
                        if(compare != true){
                            const Accept = "Accept";
                            action.push(Accept);
                        }
                        else{
                            var d = serviceRequest.ServiceStartDate.split("-");
                            var date = new Date(+d[2],(+d[1]-1),+d[0]);
                            if(date <= new Date()){
                                if(date < new Date()){
                                    const cancel = "Complete" ;
                                    action.push(cancel);
                                }
                                else{
                                    var time = (serviceRequest.EndTime.split(":"))[1] == "30" ? (+(serviceRequest.EndTime.split(":"))[0])+0.5 : (+(serviceRequest.EndTime.split(":"))[0]);
                                    var t = new Date().getHours();
                                    if(time <= t){
                                        const cancel = "Complete" ;
                                        action.push(cancel);
                                    }
                                    else{
                                        const cancel = "Cancel";
                                        action.push(cancel);
                                    }
                                }
                            }
                            else{
                                const cancel = "Cancel";
                                action.push(cancel);
                            }
                            // if(date.getDate() == new Date().getDate() && date.getMonth() == new Date().getMonth() && date.getFullYear() == new Date().getFullYear()){
                            //     var time = (serviceRequest.EndTime.split(":"))[1] == "30" ? (+(serviceRequest.EndTime.split(":"))[0])+0.5 : (+(serviceRequest.EndTime.split(":"))[0]);
                            //     var t = new Date().getHours();
                            //     if(time <= t){
                            //         const cancel = "Complete" ;
                            //         action.push(cancel);
                            //     }
                            //     else{
                            //         const cancel = "Cancel";
                            //         action.push(cancel);
                            //     }
                                 
                            // }
                            // else{
                            //     const cancel = "Cancel";
                            //     action.push(cancel);
                            // }
                            
                        }
                    var data = {
                        "ServiceDate": serviceRequest.ServiceStartDate,
                        "Duration": serviceRequest.ArrivalTime + " - "+serviceRequest.EndTime,
                        "Total Hrs": (serviceRequest.ExtraHours)+(serviceRequest.ServiceHours),
                        "ServiceId": serviceRequest.ServiceId,
                        "Extra Service": Extra,
                        "Total Payment": serviceRequest.TotalCost,
                        "Customer":{
                            "name": name,
                            "Address": address
                        },
                        "Comments": serviceRequest.HasPets == true ? "i have pets at home" : " i do not have pets at home"
                    }
                    if(serviceRequest.Status == 3){
                        return res.status(200).json({ data });
                    }
                    else{
                        return res.status(200).json({ data , action });
                    }
                }
            })
            .catch( (err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public up_comnig = async (req: Request , res: Response): Promise<Response> => {
        const Hid = +user_id({ data: req.cookies.helperland });
        return await this.HelperService
            .findServiceId(Hid)
            .then( async (userRequest) => {
                if(userRequest.length == 0){
                    return res.status(201).json({ message: "No Upcoming request" })
                }
                else{
                    var data = userRequest.filter(o => o.IsAssign == Hid && o.IsDeleted == false);
                    var Data:any = [];
                    var helprname = "WelCome, "+ data[0].HelperName;
                    for(var z = 0 ; z < data.length ; z++){
                        const Serviceid = data[z].ServiceId;
                        await this.HelperService
                            .findServiceRequestById(Serviceid)
                            .then( async ( serviceRequest ) => {
                                if(serviceRequest == null){
                                    return res.status(404).json({ error: "NotFound" })
                                }
                                else{
                                    if(serviceRequest.Status == 2){
                                        var name: string = "";
                                        var Address: string = "";
                                        await this.HelperService
                                            .findUser(data[z].CustomerId)
                                            .then( (user) => {
                                                if(user == null){
                                                    return res.status(404).json({ error: "Not Found" })
                                                }
                                                else{
                                                    name = user.FirstName + " " + user.LastName;
                                                }
                                            })
                                            .catch( (err: Error) => {
                                                console.log(err);
                                                return res.status(500).json({ error: "Error" });
                                            })
                                        await this.HelperService
                                            .getAddressById(serviceRequest.UserAddressId)
                                            .then( (userAddress) => {
                                                if(userAddress == null){
                                                    return res.status(404).json({ error: "Not Found" });
                                                }
                                                else{
                                                    Address = userAddress.AddressLine1 + " , " + userAddress.City + " " + userAddress.PostelCode;
                                                }
                                            })
                                            .catch( (err: Error) => {
                                                console.log(err);
                                                return res.status(500).json({ error: "Error" });
                                            })
                                            var action;
                                            var d = serviceRequest.ServiceStartDate.split("-");
                                            var date = new Date(+d[2],+d[1]-1,+d[0])
                                            if(date <= new Date()){
                    
                                                var t = serviceRequest.EndTime.split(":")[1] == "30" ? +(serviceRequest.EndTime.split(":")[0]) + 0.5 : +(serviceRequest.EndTime.split(":")[0]);
                                                if(date < new Date()){
                                                    action = "Complete" ;
                                                }
                                                else{
                                                    if(t<= new Date().getHours()){
                                                        action = "Complete" ;                                                    }
                                                    else{
                                                        action = "Cancle" ;
                                                    }
                                                }
                                            }
                                            else{
                                                
                                                action = "Cancle" ;
                                            }
                                            // if(date.getDate() <= new Date().getDate() && date.getMonth() <= new Date().getMonth() && date.getFullYear() == new Date().getFullYear() || date <= new Date()){
                                              
                                            //     var t = serviceRequest.EndTime.split(":")[1] == "30" ? +(serviceRequest.EndTime.split(":")[0]) + 0.5 : +(serviceRequest.EndTime.split(":")[0]);
                                            //     if(date.getDate() < new Date().getDate()){
                                            //         action = "Complete" ;
                                            //     }
                                            //     else{
                                            //         if(t<= new Date().getHours()){
                                            //             action = "Complete" ;                                                    }
                                            //         else{
                                            //             action = "Cancle" ;
                                            //         }
                                            //     }
                                                
    
                                            // }
                                            // else{
                                            //     action = "Cancle" ;
                                            // }
                                        Data.push({
                                            "ServiceId": data[z].ServiceId,
                                            "Service details": {
                                                "Service Date": serviceRequest.ServiceStartDate,
                                                "Duration": serviceRequest.ArrivalTime +" - "+ serviceRequest.EndTime
                                            },
                                            "Customer Details":{
                                                "name": name,
                                                "Address": Address
                                            },
                                            "Payment": serviceRequest.TotalCost,
                                            "Action": action
                                        })  
                                    }
                                    
                                }
                            })
                            .catch( (err: Error) => {
                                console.log(err);
                                return res.status(500).json({ error: "Error" });
                            })
                    }
                  
                    return res.status(200).json({
                        helprname,
                        Data,
                        "entries Total Recode": Data.length
                    });
                }
            })
            .catch( (err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public complete = async (req: Request , res: Response): Promise<Response> => {
        var id = req.params.id;
        return await this.HelperService
            .findServiceRequestById(+id)
            .then( (serviceRequest) => {
                if(serviceRequest == null){
                    return res.status(404).json({ error: "Not Found" })
                }
                else{
                    
                    if(serviceRequest.Status == 2){
                        var d = serviceRequest.ServiceStartDate.split("-");
                        var date = new Date(+d[2],+d[1]-1,+d[0]);
                        if(date <= new Date()){
                            var time = serviceRequest.EndTime.split(":")[1] == "30" ? (+serviceRequest.EndTime.split(":")[0])+0.5 : (serviceRequest.EndTime.split(":")[0]);
                            if(date < new Date()){
                                serviceRequest.update({ Status: 3 });
                                return res.status(200).json({ message: "Complete the Service" });  
                            }
                            else{
                                if(time <= new Date().getTime()){
                                    serviceRequest.update({ Status: 3 });
                                    return res.status(200).json({ message: "Complete the Service" });
                                }
                                else{
                                    return res.status(201).json({ message: "You can not Set the Complete this Service" })
                                }
                            }
                        }
                        else{
                            
                            return res.status(201).json({ message: "You can not Set the Complete this Service!" })
                        }
                        // if(date.getDate() <= new Date().getDate() && date.getMonth() <= new Date().getMonth() && date.getFullYear() <= new Date().getFullYear()){
                        //     var time = serviceRequest.EndTime.split(":")[1] == "30" ? (+serviceRequest.EndTime.split(":")[0])+0.5 : (serviceRequest.EndTime.split(":")[0]);
                        //     if(date.getDate() < new Date().getDate()){
                        //         serviceRequest.update({ Status: 3 });
                        //         return res.status(200).json({ message: "Complete the Service" });  
                        //     }
                        //     else{
                        //         if(time <= new Date().getTime()){
                        //             serviceRequest.update({ Status: 3 });
                        //             return res.status(200).json({ message: "Complete the Service" });
                        //         }
                        //         else{
                        //             return res.status(201).json({ message: "You can not Set the Complete this Service" })
                        //         }
                        //     }
                            
                        // }
                        // else{
                        //     return res.status(201).json({ message: "You can not Set the Complete this Service!" })
                        // }
                    }
                    else{
                        return res.status(201).json({ message: "You can not Set the Complete this Service!!" })
                    }
                    

                }
                
            })
            .catch( (err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public cancel = async (req: Request , res: Response): Promise<Response> => {
        const id = +req.params.id;
        return this.HelperService
            .findUserRequest(id)
            .then(async (userRequest) => {
                if(userRequest == null){
                    return res.status(404).json({ error: "Not Found" })
                }
                else{
                    const Cid = userRequest.CustomerId;
                    await userRequest.update({ IsDeleted: true });
                    await this.HelperService
                        .findUser(Cid)
                        .then( (user) => {
                            if(user == null){
                                return res.status(404).json({ error: "Not Found" })
                            }
                            else{
                                const email = user.email;
                                sendEmail(email, "Service Cancel", `Your Service Request ${id} has been cancel by the service Provider` );
                            }
                        })
                        .catch( (err: Error) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                    
                    return await this.HelperService
                        .findServiceRequestById(userRequest.ServiceId)
                        .then( (serviceRequest) => {
                            if(serviceRequest == null){
                                return res.status(404).json({ error: "Not Found" })
                            }
                            else if(serviceRequest.Status == 3){
                                return res.status(201).json({ error: "you can not cancel the service while completing service" });
                            }
                            else if(serviceRequest.Status == 1){
                                return res.status(201).json({ error: "You can not cancel the sarvice Request" })
                            }
                            else{
                                serviceRequest.update({ Status: 4 });
                                return res.status(200).json({ message: "cancle the Service request" });
                            }
                        })
                        .catch( (err: Error) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                }
            })
            .catch( (err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public Service_history = async (req: Request ,res: Response): Promise<Response> => {
        const Hid = user_id({ data: req.cookies.helperland });
        return await this.HelperService
            .findServiceId(+Hid)
            .then(async (userRequest) => {
                if(userRequest.length == 0){
                    return res.status(404).json({ message: "No Data" })
                }
                else{
                    var Data:any = [];
                    for(var i in userRequest){
                        var id, date: any, Stime, Etime, Aid: any;
                        await this.HelperService
                            .findServiceRequestById(userRequest[i].ServiceId)
                            .then( async (serviceRequest) => {
                                if(serviceRequest == null){
                                    return res.status(404).json({ error: "1Not Found" })
                                }
                                else if(serviceRequest.Status == 3){
                                    var name, Address;
                                    id = serviceRequest.ServiceId;
                                    date = serviceRequest.ServiceStartDate,
                                    Stime = serviceRequest.ArrivalTime,
                                    Etime = serviceRequest.EndTime
                                    Aid = serviceRequest.UserAddressId
                                        await this.HelperService
                                            .findUser(userRequest[i].CustomerId)
                                            .then( (user) => {
                                                if(user){
                                                    name = user.FirstName + " " + user.LastName
                                                }
                                                else{
                                                    return res.status(404).json({ error: "2Not Found" })
                                                }
                                            })
                                            .catch( (err: Error) => {
                                                console.log(err);
                                                return res.status(500).json({ error: "Error" });
                                            })
                                        await this.HelperService
                                            .getAddressById(Aid)
                                            .then( (userAddress) => {
                                                if(userAddress == null){
                                                    return res.status(404).json({ error: "3Not Found" })
                                                }
                                                else{
                                                    Address = userAddress.AddressLine1 + " , " + userAddress.City + " " + userAddress.PostelCode;
                                                }
                                            })
                                            .catch( (err: Error) => {
                                                console.log(err);
                                                return res.status(500).json({ error: "Error" });
                                            })
                                            Data.push({
                                                "ServiceId": id,
                                                "ServiceDate": date,
                                                "ServiceDuration": Stime +" - "+Etime,
                                                "CustomerName": name,
                                                "CustomerAddress": Address
                                            })

                                    }
                                })
                                .catch( (err: Error) => {
                                    console.log(err);
                                    return res.status(500).json({ error: "Error" });
                                })
                    }
                   
                    return res.status(200).json({ Data });
                }
            })
            .catch( (err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public export = async (req: Request, res: Response): Promise<Response> => {
        var service:any = {};
        const Hid = user_id({ data: req.cookies.helperland });
        return await this.HelperService
            .findServiceId(+Hid)
            .then(async (userRequest) => {
                if(userRequest.length == 0){
                    return res.status(404).json({ message: "No Data" })
                }
                else{
                    var Data:any = []
                    for(var i in userRequest){
                        var id,date:any,Stime,Etime,Aid:any;
                        await this.HelperService
                            .findServiceRequestById(userRequest[i].ServiceId)
                            .then( async (serviceRequest) => {
                                if(serviceRequest == null){
                                    return res.status(404).json({ error: "1Not Found" })
                                }
                                else if(serviceRequest.Status == 3){
                                    var name, Address;
                                    id = serviceRequest.ServiceId;
                                    date = serviceRequest.ServiceStartDate,
                                    Stime = serviceRequest.ArrivalTime,
                                    Etime = serviceRequest.EndTime
                                    Aid = serviceRequest.UserAddressId
                                        await this.HelperService
                                            .findUser(userRequest[i].CustomerId)
                                            .then((user)=>{
                                                if(user){
                                                    name = user.FirstName + " " + user.LastName
                                                }
                                                else{
                                                    return res.status(404).json({ error: "2Not Found" })
                                                }
                                            })
                                            .catch( (err: Error) => {
                                                console.log(err);
                                                return res.status(500).json({ error: "Error" });
                                            })
                                        await this.HelperService
                                            .getAddressById(Aid)
                                            .then( (userAddress) => {
                                                if(userAddress == null){
                                                    return res.status(404).json({ error: "3Not Found" })
                                                }
                                                else{
                                                    Address = userAddress.AddressLine1 + " , " + userAddress.City + " " + userAddress.PostelCode;
                                                }
                                            })
                                            .catch( (err: Error) => {
                                                console.log(err);
                                                return res.status(500).json({ error: "Error" });
                                            })
                                            Data.push({
                                                "ServiceId": id,
                                                "ServiceDate": date,
                                                "ServiceDuration": Stime +" - "+Etime,
                                                "CustomerName": name,
                                                "CustomerAddress": Address
                                            })

                                    }
                                })
                                .catch( (err: Error) => {
                                    console.log(err);
                                    return res.status(500).json({ error: "Error" });
                                })
                    }
                    
                    service = Data;
                    const worksheet = XlSX.utils.json_to_sheet(service);
                    const workbook = XlSX.utils.book_new();
                    XlSX.utils.book_append_sheet(workbook,worksheet,"ServiceHistory");
                    XlSX.write(workbook,{bookType:'xlsx',type:"buffer"});
                    XlSX.write(workbook,{bookType:"xlsx",type:"binary"});
                    XlSX.writeFile(workbook,"History.xlsx");
                    return res.json({ message: "Check Your File" });
                }
            })
            .catch( (err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
        
    }

    public rating = async (req: Request, res: Response): Promise<Response> => {
       const Hid = +user_id({ data: req.cookies.helperland });
       return await this.HelperService
        .ratingfromuser(Hid)
        .then( async (rating) => {
            if(rating.length == 0){
                return res.status(404).json({ message: "Not Rating" });
            }
            else{
                var Data: any = [];
                for(var i in rating){
                    const rate = (((+rating[i].OnTimeArrival)+(+rating[i].Friendlly)+(+rating[i].QualityOfService))/3).toFixed(2);
                    const Comments = rating[i].Comments;
                    const id = rating[i].UserRequestId;
                    await this.HelperService
                        .finduserRequest(id)
                        .then( async (userRequest) => {
                            if(userRequest == null){
                                return res.status(404).json({ error: "Not Found" });
                            }
                            else{
                                var name="";
                               await this.HelperService
                                    .findUser(userRequest.CustomerId)
                                    .then((user)=>{
                                        if(user == null){
                                            return res.status(404).json({ error: "Not Found" })
                                        }
                                        else{
                                            name = user.FirstName + " " + user.LastName;
                                        }
                                    })
                                    .catch( (err: Error) => {
                                        console.log(err);
                                        return res.status(500).json({ error: "Error" });
                                    })
                                await this.HelperService
                                    .findServiceRequestById(userRequest.ServiceId)
                                    .then((serviceRequest)=>{
                                        if(serviceRequest == null){
                                            return res.status(404).json({ error: "Not Found" })
                                        }
                                        else{
                                            Data.push({
                                                "ServiceId": userRequest.ServiceId,
                                                "name": name,
                                                "Service Date": serviceRequest.ServiceStartDate,
                                                "Duration": serviceRequest.ArrivalTime + " - " + serviceRequest.EndTime,
                                                "Ratings": rate,
                                                "Comments": Comments
                                            })
                                        }
                                    })
                                    .catch( (err: Error) => {
                                        console.log(err);
                                        return res.status(500).json({ error: "Error" });
                                    })
                            }
                        })
                        .catch( (err: Error) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                }
                return res.json({ Data });
            }
        })
        .catch( (err: Error) => {
            console.log(err);
            return res.status(500).json({ error: "Error" });
        })
    }

    public mysetting = async (req: Request, res: Response): Promise<Response> => {
        const Hid = +user_id({ data: req.cookies.helperland });
        return await this.HelperService
            .findUser(Hid)
            .then( async (user) => {
                if(user){
                    var street, House_number, postelcode, city
                   await this.HelperService
                        .check_address(Hid)
                        .then( (userAddress) => {
                            if(userAddress){
                                street = userAddress.AddressLine1.split(" ").length == 3 ? userAddress.AddressLine1.split(" ")[0] + userAddress.AddressLine1.split(" ")[1] : userAddress.AddressLine1.split(" ")[0];
                                House_number = userAddress.AddressLine1.split(" ").length == 3 ? userAddress.AddressLine1.split(" ")[2] : userAddress.AddressLine1.split(" ")[1];
                                postelcode = userAddress.PostelCode;
                                city = userAddress.City;
                            } 
                            else{
                                street = " ";
                                House_number = " ";
                                postelcode = " ";
                                city = " ";
                            }
                        })
                        .catch((err: Error) => {
                            console.log(err)
                            return res.status(500).json({ err: "Error" });
                        })
                       var Data = {
                            "FirstName": user.FirstName,
                            "LastName": user.LastName,
                            "email": user.email,
                            "MobileNumber": user.MobileNumber,
                            "Date_Of_Birth": user.Date_Of_Birth,
                            "NationalityId": user.NationalityId,
                            "Gender": user.Gender,
                            "User_Profile_Picture": user.User_Profile_Picture,
                            "street": street,
                            "House_number": House_number,
                            "PostelCode": postelcode,
                            "City": city
                        }
                    return res.status(200).json({ Data })
                }
                return res.status(404).json({ error: "Not Found" });
            })
            .catch((err: Error) => {
                console.log(err)
                return res.status(500).json({ err: "Error" });
            })
    }

    public mysetting_update = async (req: Request, res: Response): Promise<Response> => {
        const Hid = +user_id({ data: req.cookies.helperland });
        const City = req.body.City;
        const code = req.body.PostelCode;
        const email = req.body.email;
        req.body.Zipcode = req.body.PostelCode;
        await this.HelperService
            .findCity(City)
            .then(async (city) => {    
                if(city){
                    await this.HelperService
                        .findZipCode(code)
                        .then( async (zipcode) => {
                            if(zipcode == null){
                                await this.HelperService
                                    .createZipCode(code)
                                    .then( (postel_code) => {
                                        if(postel_code == null){
                                            return res.status(400).json({ error: "Not Found" })
                                        } 
                                        postel_code.update({ CityId: city.id })
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
                else{
                    await this.HelperService
                        .createCity(City)
                        .then( async (city) => {
                            await this.HelperService
                                .createZipCode(code)
                                .then( (zipcode) => {
                                    if(zipcode){
                                        zipcode.update({ CityId: city.id })
                                    }
                                })
                                .catch((err: Error) => {
                                    console.log(err)
                                    return res.status(500).json({ err: "Error" });
                                })
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
        return await this.HelperService
            .findUser(Hid)
            .then( (user) => {
                if(user == null){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    if(user.email == email){
                        return this.HelperService
                        .update_setting(req.body, Hid)
                        .then( async (user) => {
                            if(user){
                                req.body.AddressLine1 = req.body.street + " " + req.body.House_number;
                               return await this.HelperService
                                    .check_address(Hid)
                                    .then( async (address) => {
                                        if(address){
                                            return await this.HelperService
                                                .update_address(req.body, Hid)
                                                .then( (userAddress) => {
                                                    if(userAddress){
                                                        return res.status(200).json({ message: "Update" })
                                                    }
                                                    else{
                                                        return res.status(404).json({ error: "Not Found" })
                                                    }
                                                })
                                                .catch((err: Error) => {
                                                    console.log(err)
                                                    return res.status(500).json({ err: "Error" });
                                                })
                                        }
                                        else{
                                            var number: string, email: string;
                                            await this.HelperService
                                                .findUser(Hid)
                                                .then( (user) => {
                                                    if(user){
                                                        number = user.MobileNumber,
                                                        email = user.email
                                                    }
                                                })
                                                .catch((err: Error) => {
                                                    console.log(err)
                                                    return res.status(500).json({ err: "Error" });
                                                })
                                           return await  this.HelperService
                                                .add_address(req.body)
                                                .then( (userAddress) => {
                                                    if(userAddress){
                                                        userAddress.update({
                                                            UserId: Hid,
                                                            Mobile: number,
                                                            Email: email
                                                        })
                                                        return res.status(200).json({ message: "update" })
                                                    }
                                                    else{
                                                        return res.status(404).json({ error: "Not Found" })
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
                            return res.status(400).json({ error: 'Not Found' });
                        })
                        .catch((err: Error) => {
                            console.log(err)
                            return res.status(500).json({ err: "Error" });
                        })
                    }
                    else{
                        return res.status(500).json({ message: "You can not chnage the email" });
                    }
                }
            })
            .catch((err: Error) => {
                console.log(err)
                return res.status(500).json({ err: "Error" });
            })
       
    }

    public PassWord = async (req: Request , res: Response): Promise<Response> => {
        const id = user_id({ data: req.cookies.helperland });
        return this.HelperService
            .findUser(+id)
            .then( async (user) => {
                if(user == null){
                    return res.json(404).json({ error: "Not Found" });
                }
                else{
                    const pass: string = req.body.Password;
                    const compare = await decrypt(pass, user.Password);
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
            .catch((err: Error) => {
                console.log(err)
                return res.status(500).json({ err: "Error" });
            })
    }

    public block_customer_Page = async (req: Request, res: Response): Promise<Response> => {
        const Hid = +user_id({ data: req.cookies.helperland });
        return await this.HelperService
            .findServiceId(Hid)
            .then(async (userRequest) => {
                if(userRequest.length == 0){
                    return res.status(404).json({ error: "Not Found" });
                }
                else{
                    var Data:any = [];
                    for(var i in userRequest){
                        await this.HelperService
                            .findServiceRequestById(userRequest[i].ServiceId)
                            .then(async (serviceRequest) => {
                                if(serviceRequest){
                                    if(serviceRequest.Status == 3){
                                        var id = userRequest[i].CustomerId;
                                        var Data1 = Data.find((o: { id: number; }) => o.id == id);
                                        if(Data1 == undefined){
                                            var name = "";
                                            await this.HelperService
                                                .findUser(id)
                                                .then((user) => {
                                                    if(user){
                                                        name = user.FirstName + " " + user.LastName;
                                                    }
                                                })
                                                .catch((err: Error) => {
                                                    console.log(err)
                                                    return res.status(500).json({ err: "Error" });
                                                })
                                            await this.HelperService
                                                .findfav(Hid, id)
                                                .then((userFav) => {
                                                    if(userFav){
                                                        if(userFav.IsBlocked == true){
                                                            Data.push({
                                                                "name": name,
                                                                "id": id,
                                                                "Action": "Unblock"
                                                            })
                                                        }
                                                        else{
                                                            Data.push({
                                                                "name": name,
                                                                "id": id,
                                                                "Action": "block"
                                                            })
                                                        }
                                                        
                                                    }
                                                    else{
                                                        Data.push({
                                                            "name": name,
                                                            "id": id,
                                                            "Action": "block"
                                                        })
                                                    }
                                                })
                                                .catch((err: Error) => {
                                                    console.log(err)
                                                    return res.status(500).json({ err: "Error" });
                                                })
                                            
                                        }
                                    }
                                }
                            })
                            .catch((err: Error) => {
                                console.log(err)
                                return res.status(500).json({ err: "Error" });
                            }) 
                    }
                    return res.status(200).json({ Data });
                }
            })
            .catch((err: Error) => {
                console.log(err)
                return res.status(500).json({ err: "Error" });
            })
    }

    public block_customer = async (req: Request, res: Response): Promise<Response> => {
        const Hid = +user_id({ data: req.cookies.helperland });
        const Cid = req.params.id;
        return await this.HelperService
            .findfav(Hid, +Cid)
            .then(async (fav) => {
                if(fav == null){
                   return  await this.HelperService
                        .createfav(Hid, +Cid)
                        .then((fetch_fav) => {
                            if(fetch_fav){
                                fetch_fav.update({ IsBlocked: true })
                                return res.status(200).json({ message: "Update" });
                            }
                            return res.status(404).json({ error: "Not Found" });
                        })
                        .catch((err: Error) => {
                            console.log(err)
                            return res.status(500).json({ err: "Error" });
                        })
                }
                else{
                    fav.update({ IsBlocked: true });
                    return res.status(200).json({ message: "Update" }); 
                }
                
            })
            .catch((err: Error) => {
                console.log(err)
                return res.status(500).json({ err: "Error" });
            })
    }

    public Unblock_customer = async (req: Request, res: Response): Promise<Response> => {
        const Hid = +user_id({ data: req.cookies.helperland });
        const Cid = req.params.id;
        return await this.HelperService
            .findfav(Hid,+Cid)
            .then(async (fav) => {
                if(fav){
                    fav.update({ IsBlocked: false });
                    return res.status(200).json({ message: "Update" });
                }
                else{
                    await this.HelperService
                        .createfav(Hid, +Cid)
                        .then((fav) => {
                            if(fav == null){
                                return res.status(404).json({ error: "Not Found" });
                            }
                            else{
                                fav.update({IsBlocked:false});
                                return res.status(200).json({message:"Update"}); 
                            }
                        })
                        .catch((err: Error) => {
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                }
                return res.status(404).json({ error: "Not Found" });
            })
            .catch((err: Error) => {
                console.log(err)
                return res.status(500).json({ err: "Error" });
            })
    }

    public Verify = async (req: Request, res: Response, next: NextFunction) => {
        const id = +user_id({ data: req.cookies.helperland });
        this.HelperService
            .findUser(id)
            .then( (user) => {
                if(user == null){
                    return res.status(404).json({ message: "Not Found" })
                }
                else if(user.RoleId == 3){
                    next();
                }
                else{
                    return res.status(404).json({ message: "You can not access this page" });
                }
            })
            .catch((err: Error) => {
                console.log(err)
                return res.status(500).json({ err: "Error" });
            })
    }

}