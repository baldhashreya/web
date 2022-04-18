import { Udashbord_repo } from "./udashbord.repository";
import { ServiceRequest } from "../models/servicerequest";
import { Users } from "../models/user";
import { ServiceRequestExtra } from "../models/servicerequestextra";
import { UserAddress } from "../models/useraddress";
import { UserRequest } from "../models/userrequest";
import { Rating } from "../models/rating";
import { FavoriteAndBlocked } from "../models/favoriteandblocked";

export class Udashbord_service{
    public constructor(private readonly Udashbord_repo: Udashbord_repo) {
        this.Udashbord_repo = Udashbord_repo;
    }

    public async showServiceRequest(id: number): Promise<ServiceRequest[]>{
        return this.Udashbord_repo.showServiceRequest(id);
    }

    public async userRequestByServiceid(id: number): Promise<UserRequest[]>{
        return this.Udashbord_repo.userRequestByServiceid(id);
    }

    public async rating(Cid: number,Hid: number): Promise<Rating | null>{
        return this.Udashbord_repo.rating(Cid, Hid);
    }

    public async findUserById(id: number): Promise<Users | null>{
        return this.Udashbord_repo.findUserById(id);
    }

    public async findServicebyUser(id: number): Promise<ServiceRequest | null>{
        return this.Udashbord_repo.findServicebyUser(id);
    }

    public async userRequest(id: number): Promise<UserRequest[]>{
        return this.Udashbord_repo.userRequest(id);
    }

    public async findServiceExtraById(id: number): Promise<ServiceRequestExtra | null>{
        return this.Udashbord_repo.findExtraServiceById(id);
    }

    public async getAddressById(id: number): Promise<UserAddress | null>{
        return this.Udashbord_repo.getAddressById(id);
    }

    public async showService(id: number): Promise<ServiceRequest[]>{
        return this.Udashbord_repo.showService(id);
    }

    public async ratingfromUser(id: number): Promise<Rating[]>{
        return this.Udashbord_repo.RatingFromUser(id);
    }

    public async userRequestById(id: number): Promise<UserRequest | null>{
        return this.Udashbord_repo.userRequestById(id);
    }

    public async Rating(Rating: Rating): Promise<Rating | null>{
        return this.Udashbord_repo.Rating(Rating);
    }
    

    public async updateUser(details: Users, id: number): Promise<[number,Users[]]>{
        return this.Udashbord_repo.updateDetails(details, id);
    }

    public async getAddressesById(id: number): Promise<UserAddress[]>{
        return this.Udashbord_repo.getAddressesById(id);
    }

    public async findUser(id: number): Promise<Users | null>{
        return this.Udashbord_repo.findUser(id);
    }

    public  async findServiceRequest(id : number): Promise<ServiceRequest | null>{
        return this.Udashbord_repo.findServiceRequest(id);
    }

    public async add_address(address: string, city: string, state: string, postelcode: string, phonenumber: string, email: string, userid: number ) : Promise<UserAddress>{
        return this.Udashbord_repo.add_address(address,city,state,postelcode,phonenumber,email,userid);
    }

    public async updateAddress(address: UserAddress, id: number): Promise<[number,UserAddress[]]>{
        return this.Udashbord_repo.updateAddress(address, id);
    }

    public async deleteAddress(id: number): Promise<number>{
        return this.Udashbord_repo.deleteAddress(id);
    }

    public async ratingfromCustomer(id: number): Promise<Rating[]>{
        return this.Udashbord_repo.RatingFromCustomer(id);
    }
 
    public async findfavourite(id: number): Promise<FavoriteAndBlocked[]>{
        return this.Udashbord_repo.findfavourite(id);
    }

    public async finduserByCustomerId(id: number): Promise<UserRequest[]>{
        return this.Udashbord_repo.finduserbycustomerid(id);
    }

    public checkfav(hid: number, uid: number): Promise<FavoriteAndBlocked | null>{
        return this.Udashbord_repo.checkfav(hid, uid);
    }

    public addfev(id: FavoriteAndBlocked): Promise<FavoriteAndBlocked | null>{
        return this.Udashbord_repo.addfav(id);
    }

    public async updateServicebyUser(id: number, servicerequest: ServiceRequest) :Promise<[number,ServiceRequest[]]>{
        return this.Udashbord_repo.updateServicebyUser(id, servicerequest);
    }

    public async findUserAddres(id: number): Promise<ServiceRequest | null>{
        return this.Udashbord_repo.findUserAddres(id);
    }

    public async findrating(id: number): Promise<Rating | null>{
       return this.Udashbord_repo.findrating(id);
    }

    public async finduserforreschedule(id: number): Promise<UserRequest[]>{
        return this.Udashbord_repo.finduserforreschedule(id);
    }
}