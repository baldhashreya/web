import { BookService } from "./book.services";
import {  NextFunction, Request,Response } from "express";
import {  user_id } from "../User/encrypt";
import sendEmail from "../User/send-mail";

var Discount_list = [
    {'value':'H-20',"id":0.8},
    {'value':'H-25',"id":0.75},
    {'value':'H-30',"id":0.3},
    {'value':'H-40',"id":0.6},
    {'value':'H-50',"id":0.5}
]
var extra = [
    {'id':'a',"name":"Clean cabinet interiors"},
    {'id':'b',"name":"Cleaning the refrigerator"},
    {'id':'c',"name":"Cleaning the oven"},
    {'id':'d',"name":"Washing and drying laundry"},
    {'id':'e',"name":"Cleaning windows"}
];

export class BookController{
    public constructor(private readonly BookService: BookService) {
        this.BookService = BookService;
    }

    public ckeckAvailability = async (req: Request, res: Response): Promise<Response> => {
        const Cid = +user_id({ data: req.cookies.helperland });
        return this.BookService
            .findpostelcode(req.body.postelcode)
            .then(async (postelcode) => {
                if(postelcode == null){
                    return res.status(201).json({ message: "We are not providing service in this area. We'll notify you if any helper would start working near your area" });
                }
                else{
                   return await this.BookService
                        .checkPostelCode(req.body.postelcode)
                        .then( async (user) => {
                            if(user.length == 0){
                                return res.status(404).json({ error: "Not Found" });
                            }
                            else{
                                var count = 0;
                                for(var z in user){
                                    if(user[z].id != Cid){
                                        var Hid = user[z].id;
                                        await this.BookService
                                            .findfav(Cid, Hid)
                                            .then(async (userfav) =>{
                                                var s = 0;
                                               if(userfav){
                                                   if(userfav.IsBlocked == true){
                                                     s = 1;
                                                    }
                                                }
                                                if(s == 0){
                                                    await this.BookService
                                                        .findfav(Hid,Cid)
                                                        .then((fav)=>{
                                                            if(fav != null){
                                                                if(fav.IsBlocked == true){
                                                                }
                                                                else{
                                                                    count ++;
                                                                }
                                                            }
                                                            else{
                                                                count ++;
                                                            }
                                                        })
                                                        .catch((err: Error)=>{
                                                            console.log(err);
                                                            return res.status(500).json({ error: "Error" })
                                                        })
                                                }
                                            })
                                            .catch( (err: Error) => {
                                                console.log(err);
                                                return res.status(500).json({ error: "Error" })
                                            })
                                        
                                    }
                                }
                                if(count>0){
                                    return this.BookService
                                        .createServiceRequest(req.body.postelcode)
                                        .then(async (serviceRequest) => {
                                            if(serviceRequest){
                                                await serviceRequest.update({ ServiceId: ((1000)+(+serviceRequest.id))});
                                                return res.status(200).json({ "link" : `${process.env.BASE_URL}/trainee2021/book-service/plan/${serviceRequest.ServiceId}` })
                                            }
                                            return res.status(404).json({ error: "Not Found" })
                                        })
                                        .catch((err: Error)=>{
                                            console.log(err);
                                            return res.status(500).json({ error: "Error" });
                                        })
                                    
                                }
                                else{
                                    return res.status(201).json({ message: "We are not providing service in this area. We'll notify you if any helper would start working near your area" });
                                }
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
    
    public Schedule_Plan = async (req: Request, res: Response): Promise<Response> => {
        const id = +(req.params.id)
        const userid = user_id({ data: req.cookies.helperland });
        const length: number = (req.body.ExtraHours).length;
        const Service = (req.body.ExtraHours).reduce((a: any, b: any) => (a[b] = '30 min', a ), {} );
        req.body.CreateDate = new Date();
        var Extra = req.body.ExtraHours;
        var extrahour = "";
        for(var i in Extra){
            var j = Extra[i];
            var d = extra.find( o => o.name == j);
            if(d != undefined){
                extrahour += d.id;
            } 
        }
        req.body.ExtraHours = (length/2);
        const total = parseFloat(req.body.ServiceHours) + parseFloat(req.body.ExtraHours);
        const subtotalpayment = total*18;
        var  totalpayment = 0;
          
        if(req.body.Discount != null){
            var Discount =((((req.body.Discount).split("-"))[1]))+"%";
            var dis = (+((Discount.split("%"))[0]))/100 * subtotalpayment;
            totalpayment = subtotalpayment - dis;
            console.log(Discount);
            req.body.Discount = Discount;
        }
        else{
            totalpayment = subtotalpayment;
            req.body.Discount = " ";
        }

        var  bill = {
            "Date": req.body.ServiceStartDate,
            "Arrival Time": req.body.ArrivalTime,
            "Basic": req.body.ServiceHours + "  hours",
            "Benifits": Service,
            "totalhours ": total + "  hours",
            "SubTotal": subtotalpayment,
            "Discount": req.body.Discount,
            "TotalPayment": totalpayment,
            "follow_this_link": `${process.env.BASE_URL}/trainee2021/book-service/details/${id}`
        };
        const Time = (req.body.ServiceHours);
        const ExtraTime = (req.body.ExtraHours);
        const Arrival = ((req.body.ArrivalTime).split(':'))
        const Total = ((Time+ExtraTime).toString()).split('.');
        var time: string ;
        if(Arrival[1] == "30"){
            if(Total[1] == '5'){
                time = (((+Arrival[0])+(+Total[0])+1).toString())+":00";
            }
            else{
                time = (((+Arrival[0])+(+Total[0])).toString())+":30";
            }
        }
        else{
            if(Total[1] == '5'){
                time = (((+Arrival[0])+(+Total[0])).toString())+":30";
            }
            else{
                time = (((+Arrival[0])+(+Total[0])).toString())+":00";
            } 
        }                
        return await this.BookService
            .findServiceRequest(id)
            .then(async (service) => {
                if(service) {
                  return await this.BookService
                    .updateServiceRequest(req.body,service.id)
                    .then(async (result) => {
                        if(result == null){
                            return res.status(201).json({ error: "Not Found" });
                        }
                        else{
                            await service.update({
                                SubTotal: subtotalpayment,
                                TotalCost: totalpayment,
                                UserId: userid,
                                Discount: req.body.Discount,
                                EndTime: time
                            });
                            await this.BookService
                                .updateExtraService(extrahour,service.id)
                                .then((result) => {
                                    if(result == null){
                                        return res.status(401).json({ message: "Not Found" });
                                    }
                                })
                                .catch((err: Error) => {
                                    console.log(err);
                                    return res.status(500).json({ error: "Error from update Extra Service" });
                                });
                            return res.status(200).json({ bill });
                        }
                    })
                    .catch((err: Error) => {
                        console.log(err);
                        return res.status(500).json({ error: "Error from Schedule SAVE" });
                    })
                }
                return res.status(404).json({ message: "Not Found" });
                
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error from Schedule" });
            }); 
    }

    public Address_details = async (req: Request, res: Response): Promise<Response> => {
        const id = req.params.id;
        const Id = +(user_id({ data: req.cookies.helperland }));
        return this.BookService
            .getAddressesById(Id)
            .then( (address) => {
               if(address.length == 0){
                   return res.status(200).json({ message: "no data availble","link":`${process.env.BASE_URL}/trainee2021/book-service/add_address/${id}`});
               }
               else{
                    var d:any = [];
                    for(var i in address){
                        d.push({
                            Address: address[i].AddressLine1 + "," + address[i].City + " " + address[i].PostelCode,
                            id: address[i].id
                        })
                    }
                   return res.status(200).json({
                        data: d, 
                        choose : `enter id above one to use as default address and follow the link : ${process.env.BASE_URL}/trainee2021/book-service/set_address/${id}/Enter id:`, 
                        addaddress: `${process.env.BASE_URL}/trainee2021/book-service/add_address/${id}`
                    });
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public set_address = async (req: Request, res: Response): Promise<Response> => {
        const token = req.params.token;
        const id = +(req.params.id);
        const userId = user_id({ data: req.cookies.helperland });
        return await this.BookService
            .getAddressById(id)
            .then(async (result) => {
                if(result == null){
                    return res.status(401).json({ error: "Not Found" });
                }
                else{
                    result.update({ UserId: parseInt(userId) });
                    await this.BookService
                    .findServiceRequest(+(token))
                    .then((user) => {
                        if(user == null){
                            return res.status(401).json({ error: "Not Found" });
                        }
                        else{
                            user.update({ UserAddressId: result.id });
                        }
                    })
                    .catch((err: Error) => {
                        console.log(err);
                        return res.status(500).json({ error: "Error" });
                    })
                    const link = `${process.env.BASE_URL}/trainee2021/book-service/set-fev/${token}`;
                    return res.status(200).json({ link });
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error from set address" });
            })
    }

    public set_fav = async (req: Request, res: Response): Promise<Response> => {
        const token = req.params.id;
        const CId = user_id({ data: req.cookies.helperland })
        return this.BookService
            .fetch_favorite(CId)
            .then(async (user) => {
                if(user.length == 0){
                    return res.status(200).json({ Payment: `${process.env.BASE_URL}/trainee2021/book-service/payment/${token}` })
                }
                else{
                    var data:any = [];
                    for(var i in user){
                        const Hid = user[i].TargetUserId;
                        if(user[i].IsFavorite == true && user[i].IsBlocked != true ){
                            await this.BookService
                                .findfav(Hid, CId)
                                .then(async (fav) => {
                                    if(fav == null){
                                        await this.BookService
                                                .findUser(Hid)
                                                .then((user) => {
                                                    if(user == null){
                                                        return res.status(401).json({error: "Not FOund" });
                                                        
                                                    }
                                                    else { 
                                                        const name = user.FirstName + " "+user.LastName;
                                                        const Data = {
                                                            "service Provider": name,
                                                            "Accept Service Provider": `${process.env.BASE_URL}/trainee2021/book-service/set-fev/${user.id}/${token}` ,
                                                            "Else Payment": `${process.env.BASE_URL}/trainee2021/book-service/payment/${token}`
                                                        }
                                                        data.push(Data) ; 
                                                    }
                                                })
                                                .catch((err: Error) => {
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Error" });
                                                })
                                    }
                                    else{
                                        if(fav.IsBlocked == true){

                                        }
                                        else{
                                            await this.BookService
                                                .findUser(Hid)
                                                .then((user) => {
                                                    if(user == null){
                                                        return res.status(401).json({ error: "Not Found" });  
                                                    }
                                                    else { 
                                                        const name = user.FirstName + " "+user.LastName;
                                                        const Data = {
                                                            "service Provider": name,
                                                            "Accept Service Provider": `${process.env.BASE_URL}/trainee2021/book-service/set-fev/${user.id}/${token}`,
                                                            "Else Payment": `${process.env.BASE_URL}/trainee2021/book-service/payment/${token}`
                                                        }
                                                        data.push(Data) ; 
                                                    }
                                                })
                                                .catch((err: Error) => {
                                                    console.log(err);
                                                    return res.status(500).json({ error: "Error" });
                                                })
                                        }
                                    }
                                })
                                .catch((err: Error) => {
                                    console.log(err);
                                    return res.status(500).json({ error: "Error" })
                                })
                            
                        }
                        
                    }
                    if(data.length == 0){
                        return res.status(200).json({ "Payment": `${process.env.BASE_URL}/trainee2021/book-service/payment/${token}` })
                    }
                    else{
                        return res.status(200).json({ data }); 
                    }
                  
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })

    }

    public set_helper = async (req: Request, res: Response): Promise<Response> => {
        const token = req.params.token;
        const id = req.params.id;
        const Cid = user_id({ data: req.cookies.helperland });
        var name: string = "",email: string = "";
       return this.BookService
            .fetch_favorite(Cid)
            .then(async (fav) => {
                if(fav.length == 0){
                    return res.status(404).json({ error: "Not Found" })
                }
                else{
                    var d = fav.filter(o => o.TargetUserId == +id);
                    if(d != undefined){
                        await this.BookService
                            .findUser(+id)
                            .then((user) => {
                                if(user == null){
                                    return res.status(404).json({ error: "Not Found" })
                                }
                                else{
                                    name = user.FirstName + " " + user.LastName;
                                    email = user.email
                                }
                            })
                            .catch((err: Error) => {
                                console.log(err);
                                return res.status(500).json({ error: "Error" })
                            })
                        return this.BookService
                            .UserRequest(+token , +id, name, email)
                            .then((UserRequest) => {
                                if(UserRequest){
                                   UserRequest.update({ CustomerId: Cid })
                                    return res.status(200).json({"link": `${process.env.BASE_URL}/trainee2021/book-service/payment/${token}`})
                                }
                                return res.status(404).json({ error: "Not Found" })
                            })
                            .catch((err: Error) => {
                                console.log(err);
                                return res.status(500).json({ error: "Error" });
                            })
                    }
                    else{
                        return res.status(404).json({ error: "Not Found" });
                    }
                }
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" })
            })
        
    }

    public add_address = async (req: Request, res: Response): Promise<Response> => {
        const id = +(req.params.id);
        const userId = user_id({ data: req.cookies.helperland });
        return this.BookService
            .findServiceRequest(id)
            .then(async (service) => {
                if(service == null){
                    return res.status(404).json({ error: "NotFound" });
                }
                else{
                    const address = req.body.Street_name + " " + req.body.House_number;
                    if(req.body.Mobile == null || req.body.email == null){
                        await this.BookService
                         .findUser(+userId)
                         .then((user) => {
                             if(user == null){
                                return res.status(404).json({ error: "NotFound" });
                             }
                            else{
                                if(req.body.Mobile == null){
                                    req.body.Mobile = user.MobileNumber;
                                }
                                req.body.email = user.email;  
                            } 
                             
                         })
                         .catch((err: Error)=>{
                             console.log(err);
                             return res.status(500).json({ error: "Error" });
                         })
                    }
                    return await this.BookService
                    .add_address(address, req.body.City, req.body.State, service.ZipCode, req.body.Mobile, req.body.email, userId)
                    .then(address => {
                        if(address){
                            address.update({ IsDefault: true})
                            return res.json({
                                "address": address.AddressLine1,
                                "Phone Number": address.Mobile,
                                "follow": `${process.env.BASE_URL}/trainee2021/book-service/details/${id}`
                            });
                            
                        }  
                        return res.status(404).json({ error: "NotFound" });
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

    public payment = async (req: Request, res: Response): Promise<Response> => {
        const id  = parseInt(req.params.id);
        const Cid = +user_id({ data: req.cookies.helperland });
        return await this.BookService
            .findUserRequest(id)
            .then(async (userRequest) => {
                if(userRequest) {
                    await this.BookService
                        .findServiceRequest(id)
                        .then( (serviceRequest) => {
                            if(serviceRequest == null){
                                return res.status(404).json({ error: "Not Found" })
                            }
                            else{
                                serviceRequest.update({
                                    Status: 1,
                                    PaymentDone: true
                                });
                                userRequest.update({
                                    Start: serviceRequest.ArrivalTime,
                                    End: serviceRequest.EndTime,
                                    Time: (serviceRequest.ExtraHours + serviceRequest.ServiceHours)
                                });
                            }
                        })
                        .catch((err: Error)=>{
                            console.log(err);
                            return res.status(500).json({ error: "Error" });
                        })
                    sendEmail(userRequest.email, "New Service Request", `A Service Request ${id} has been directly assigned you` )
                    return res.status(200).json({ ServiceId: id })
                }
                else{
                    return await this.BookService
                    .findServiceRequest(id)
                    .then( (serviceRequest) => {
                        if(serviceRequest == null){
                            return res.status(404).json({ error: "Not Found" })
                        }
                        else{
                            serviceRequest.update({
                                Status: 1,
                                PaymentDone: true
                            });
                            const code = serviceRequest.ZipCode;
                            return this.BookService
                                .checkPostelCode(code)
                                .then(async (user) => {
                                    if(user.length == 0){
                                        return res.status(404).json({ error: "Not Found" })
                                    }
                                    else{
                                        var count = 0;
                                        for(var i in user ){
                                            if(user[i].RoleId == 3){
                                                const name = user[i].FirstName + " " + user[i].LastName;
                                                const Hid = user[i].id;
                                                const email = user[i].email;
                                                await this.BookService
                                                    .findfav(Cid, Hid)
                                                    .then(async (userfav) =>{
                                                        var s = 0;
                                                        if(userfav){
                                                            if(userfav.IsBlocked == true){
                                                                s = 1;
                                                            }
                                                        }
                                                        if(s == 0){
                                                            await this.BookService
                                                                .findfav(Hid, Cid)
                                                                .then(async (fav) => {
                                                                    if(fav){
                                                                        if(fav.IsBlocked == false){
                                                                            await this.BookService
                                                                                .UserRequest(+(req.params.id),Hid,name,email)
                                                                                .then(async (request) => {
                                                                                    if(request) {
                                                                                        count = count + 1;
                                                                                        request.update({
                                                                                            Start: serviceRequest.ArrivalTime,
                                                                                            End: serviceRequest.EndTime,
                                                                                            CustomerId: Cid,
                                                                                            Time: serviceRequest.ExtraHours+serviceRequest.ServiceHours
                                                                                        })
                                                                                        sendEmail(request.email, "New Service is Arrive", `new Service ${request.ServiceId} has been arrive` );  
                                                                                    }
                                                                                })
                                                                                .catch((err: Error)=>{
                                                                                    console.log(err);
                                                                                    return res.status(500).json({ error: "Error" })
                                                                                })
                                                                        }
                                                                    }
                                                                    else{
                                                                        count = 1;
                                                                        await this.BookService
                                                                            .UserRequest(+(req.params.id), Hid, name, email)
                                                                            .then(async (request) => {
                                                                                if(request){
                                                                                    count = count + 1;
                                                                                    request.update({
                                                                                        Start: serviceRequest.ArrivalTime,
                                                                                        End: serviceRequest.EndTime,
                                                                                        CustomerId: Cid,
                                                                                        Time: serviceRequest.ExtraHours+serviceRequest.ServiceHours
                                                                                    })
                                                                                    sendEmail(request.email, "New Service is Arrive" , `new Service ${request.ServiceId} has been arrive` );
                                                                                    
                                                                                }
                                                                            })
                                                                            .catch((err: Error) => {
                                                                                console.log(err);
                                                                                return res.status(500).json({ error: "Error" })
                                                                            })
                                                                    }
                                                                })
                                                                .catch((err: Error) => {
                                                                    console.log(err);
                                                                    return res.status(500).json({ error: "Error" })
                                                                })
                                                        }
                                                    })
                                                    .catch((err: Error) => {
                                                        console.log(err);
                                                        return res.status(500).json({ error: "Error" });
                                                    })
                                                
                                            }
                                        }
                                        if(count > 0){
                                            return res.status(200).json({message: `ServiceId: ${serviceRequest.ServiceId}`})
                                        }
                                        else{
                                            return res.status(404).json({message: "Not Found" });
                                        }
                                        
                                    }
                                })
                                .catch((err: Error) => {
                                    console.log(err);
                                    return res.status(500).json({ error: "Error" })
                                })
                        }
                    })
                    .catch((err: Error) => {
                        console.log(err);
                        return res.status(500).json({ error: "Error" });
                    })
                }
               
                
            })
            .catch((err: Error) => {
                console.log(err);
                return res.status(500).json({ error: "Error" });
            })
    }

    public verify = async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined> => {
        const id = +user_id({ data: req.cookies.helperland });
        return this.BookService
            .findUser(id)
            .then((user) => {
                    if (user?.RoleId == 1 || user?.RoleId == 2) {
                        next();
                    }
                    else {
                        return res.status(404).json({ message: "You can not access this page" });
                    }
                })
            .catch( (err: Error) => {
                    console.log(err);
                    return res.status(500).json({ error: "Error" });
                })
    }

}

