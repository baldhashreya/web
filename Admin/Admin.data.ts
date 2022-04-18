
import { Users } from '../models/user';
import { AdminRepository } from './Admin.repo';
import {AdminService} from './Admin.Services';
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
    Action: string;
    Email: string;
}

export class fetchData {
    
    public fetch = async():(Promise<t[]>)=>{
       const repo = new AdminRepository();
       const service = new AdminService(repo);
       return await service.fetchAll()
        .then(async(Result)=>{
            var Data:any = [];
            if(Result.length == 0){
                Data = [];
                return Data;
            }
            else{
                for(var z=0; z<Result.length; z++){
                    var name = " ",useraddress="",email = " ",status = " ", helperName = " ",Avtar = "1",rating = 0;
                    await service.findUser(Result[z].UserId)
                        .then((user)=>{
                            if(user){
                                name = user.FirstName + " "+ user.LastName;
                                email = user.email
                            }
                        })
                        .catch((err:Error)=>{
                            console.log(err);
                            return "Error";
                        })
                    await service.getAddress(Result[z].UserAddressId)
                        .then((userAddress)=>{
                            if(userAddress){
                                useraddress = userAddress.AddressLine1
                            }
                        })
                        .catch((err:Error)=>{
                            console.log(err);
                            return "Error";
                        })
                    if(Result[z].Status == 1 || Result[z].Status == 4){
                        helperName = " ",
                        Avtar = "0",
                        rating = 0
                    }
                    else{
                        await service.userRequest(Result[z].ServiceId)
                            .then(async(userRequest)=>{
                                if(userRequest){
                                    helperName = userRequest.HelperName;
                                    const Cid = userRequest.CustomerId;
                                    const Hid = userRequest.IsAssign; 
                                    await service.findUser(Hid)
                                        .then((user)=>{
                                            if(user){
                                                Avtar = user.User_Profile_Picture == undefined ? "1" : user.User_Profile_Picture;
                                            }
                                        })
                                        .catch((err:Error)=>{
                                            console.log(err);
                                        })
                                    await service.rating(Hid)
                                        .then((rate)=>{
                                            if(rate.length == 0){
                                                rating = 0; 
                                            }
                                            else{
                                                var e = 0;
                                                for(var i=0; i<rate.length; i++){
                                                    e  = e + (+rate[i].Ratings);
                                                }
                                                rating = (e/rate.length);
                                            }
                                        })
                                        .catch((err:Error)=>{
                                            console.log(err);
                                        })
                                }
                            })
                            .catch((err:Error)=>{
                                console.log(err);
                            })
                    }
                    var status = "";
                    switch(Result[z].Status){
                        case 1:     status = "Pending"
                                    break;
                        case 2:     status = "Assign"
                                    break;
                        case 3:     status = "Complete"
                                    break;
                        case 4:     status = "Cancle"
                                    break;
                        default:    status = "New"
                                    break;
                    }
                    Data.push({
                    "SeriveId" : Result[z].ServiceId,
                    "Service_Date": Result[z].ServiceStartDate,
                    "Duration": Result[z].ArrivalTime + " - " + Result[z].EndTime,
                    "Zipcode": Result[z].ZipCode,
                    "Customer_Name": name,
                    "Customer_Address": useraddress,
                    "email": email,
                    "Status": status,
                    "Service_Provider_Name": helperName,
                    "Avtar": Avtar,
                    "Rating": rating.toFixed(2),
                    "Discount": Result[z].Discount == null ? "0%" : Result[z].Discount,
                    "Grouse_Amount": Result[z].SubTotal,
                    "Net_Amount": Result[z].TotalCost,
                    "Payment_Status": Result[z].PaymentDone == null ? false : Result[z].PaymentDone
                    })
                }
                return Data;
            }
        })
        .catch((error)=>{
            console.log(error);
            return "Error";
        })
    }

    public user = async() :(Promise<u[]>) =>{
        const repo = new AdminRepository();
        const service = new AdminService(repo);
        return await service
        .findAlluser()
        .then( (user: Users[]) => {
            var Data:any = [];
            if(user){
                for(var i in user){
                    var d = user[i].createdAt;
                    var role ;
                    switch(user[i].RoleId){
                        case 1 : role = "Admin"
                                 break;
                        case 2 : role = "Customer"
                                 break;
                        case 3 : role = "ServiceProvider"
                                 break; 
                    }
                    Data.push({
                        "UserName": user[i].FirstName + " " + user[i].LastName,
                        "Date": d.getDate()+"-"+d.getMonth()+"-"+d.getFullYear(),
                        "UserType": role,
                        "Phone": user[i].MobileNumber,
                        "Postelcode": user[i].Zipcode == null ? " " : user[i].Zipcode,
                        "Status": user[i].Status == 1 ? "Active" : "DeActive",
                        "Action": user[i].Status == 1 ? "Deactive:"+user[i].id : "Active:"+user[i].id,
                        "Email": user[i].email
                    }) 
                      
                }
                return Data;
            }
            else{
                Data = [];
                return Data;
            }
            
        })
        .catch((err:Error)=>{
            console.log(err);
            
        })
    }
}