import express from "express";
import { AdminController } from "../Admin/Admin.Controller";
import { AdminService } from "../Admin/Admin.Services";
import { AdminRepository } from "../Admin/Admin.repo";
import { verifyToken } from "../User/encrypt";
const router: express.Router = express.Router();
import { Edit, Id, Servicerequest, User} from '../Admin/Admin.model';


const repo: AdminRepository = new AdminRepository();
const service: AdminService = new AdminService(repo);
const controller: AdminController = new AdminController(service);

/**
 * @swagger
 * definitions:
 *  service:
 *   type: object
 *   properties:
 *    ServiceId:
 *     type: integer
 *     description: ServiceId
 *     example: 1001
 *    email:
 *     type: string
 *     description: email of user
 *     example: 'shreyabaldha0@gmail.com'
 *    postalcode:
 *     type: string
 *     description: postelcode of user
 *     example: '360405'
 *    customername:
 *     type: string
 *     description: username
 *     example: 'shreya baldha'
 *    ServiceProvide:
 *     type: string
 *     description: Service Provider
 *     example: 'brinsu baldha'
 *    Status:
 *     type: string
 *     description: Status of Service
 *     example: 'cancle'
 *    paymentStatus:
 *     type: boolean
 *     description: paymentStatus
 *     example: false
 *    StartDate:
 *     type: string
 *     description: StartDate
 *     example: '12-03-2022'
 *    Enddate:
 *     type: string
 *     description: EndDate
 *     example: '12-03-2022'
 *  EditAdmin:
 *   type: object
 *   properties:
 *    ServiceStartDate:
 *     type: string
 *     description: ServiceStartDate
 *     example: '12-03-2022'
 *    ArrivalTime:
 *     type: string
 *     description: "Arrival Time"
 *     example: '10:30'
 *    SStreet_name:
 *     type: string
 *     description: 'Street_name'
 *     example: 'Bhakti nagar'
 *    SHouse_number:
 *     type: string
 *     description: 'Houser_number'
 *     example: 'S-10'
 *    SCity:
 *     type: string
 *     description: 'City'
 *     example: 'Rajkot'
 *    SPostelCode: 
 *     type: string
 *     description: 'PostelCode'
 *     example: '360405'
 *    Street_name:
 *     type: string
 *     description: 'Street_name'
 *     example: 'Bhakti nagar'
 *    House_number:
 *     type: string
 *     description: 'Houser_number'
 *     example: 'S-10'
 *    City:
 *     type: string
 *     description: 'City'
 *     example: 'Rajkot'
 *    PostleCode: 
 *     type: string
 *     description: 'PostelCode'
 *     example: '360405'
 *  user: 
 *   type: object
 *   properties:
 *    UserName:
 *     type: string
 *     description: 'user name'
 *     example: 'shreya baldha'
 *    UserType:
 *     type: string
 *     description: 'UserType'
 *     example: 'Customer'
 *    Phone:
 *     type: string
 *     description: 'Phone'
 *     example: '7487989043'
 *    Postelcode:
 *     type: string
 *     description: 'PostelCode'
 *     example: '360405'
 *    email:
 *     type: string
 *     description: 'email'
 *     example: 'shreyabaldha0@gmail.com'
 *    fromdate:
 *     type: string
 *     description: 'fromdate'
 *     example: '17-02-2022'
 *    todate:
 *     type: string
 *     description: 'todate'
 *     example: '17-02-2022'
 *  RefundCalculate:
 *   type: object
 *   properties:
 *    Percentage: 
 *     type: string
 *     description: 'percentege'
 *     example: '25%'
 *  Refund:
 *   type: object
 *   properties:
 *    Percentage: 
 *     type: string
 *     description: 'percentege'
 *     example: '25%' 
 *    calculate:
 *     type: string
 *     description: 'Refund Amount'
 *     example: '20.25' 
 */

/**
 * @swagger
 * /trainee2021/admin/service-requests:
 *   get:
 *    summary: All Service Request
 *    description: All Service Request
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */

router.get('/service-requests', verifyToken, controller.verify, controller.show);

/**
 * @swagger
 * /trainee2021/admin/service-requests:
 *  post:
 *   summary: All Service Request
 *   description: All Service Request
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/definitions/service'
 *   responses:
 *    200:
 *     description: sucess
 *    500:
 *     description: failure
 */

router.post('/service-requests', verifyToken, Servicerequest, controller.verify, controller.read);

/**
 * @swagger
 * /trainee2021/admin/service-requests/Edit_Schedule/{id}:
 *   get:
 *    summary: Edit_Schedule
 *    description: Edit_Schedule
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *        type: integer
 *       required: true
 *       description: Numeric ID of the Serviceid
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */

router.get('/service-requests/Edit_Schedule/:id', verifyToken, Id, controller.verify, controller.Edit);

/**
 * @swagger
 * /trainee2021/admin/service-requests/Edit_Schedule/{id}:
 *   put:
 *    summary: Edit_Schedule Edit
 *    description: Edit_Schedule Edit
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *        type: integer
 *        required: true
 *        description: Numeric ID of the Serviceid
 *    requestBody:
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/definitions/EditAdmin'
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */


router.put('/service-requests/Edit_Schedule/:id', verifyToken, Id, Edit, controller.verify, controller.Edit_data);

/**
 * @swagger
 * /trainee2021/admin/service-requests/cancle/{id}:
 *  get:
 *    summary: user Active
 *    description: user Active
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *        type: integer
 *        required: true
 *        description: Numeric ID of the userid
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */

router.get('/service-requests/cancle/:id',verifyToken , controller.verify , controller.cancle);

/**
 * @swagger
 * /trainee2021/admin/user:
 *   get:
 *    summary: user management
 *    description: user management
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */
 
router.get('/user', verifyToken, User, controller.verify, controller.user_managmnet);

/**
 * @swagger
 * /trainee2021/admin/user:
 *   post:
 *    summary: user filter
 *    description: user filter
 *    requestBody:
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/definitions/user'
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */

router.post('/user', verifyToken, controller.verify, controller.user_managment_filter)

/**
 * @swagger
 * /trainee2021/admin/user/export:
 *   get:
 *    summary: user management export 
 *    description: user management export
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */

router.get('/user/export', verifyToken, controller.verify, controller.export);

/**
 * @swagger
 * /trainee2021/admin/user/active/{id}:
 *  get:
 *    summary: user Active
 *    description: user Active
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *        type: integer
 *        required: true
 *        description: Numeric ID of the userid
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */

router.get('/user/active/:id', verifyToken, Id, controller.verify, controller.Active);

/**
 * @swagger
 * /trainee2021/admin/user/deactive/{id}:
 *   get:
 *    summary: user deActive
 *    description: user deActive
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: integer
 *         required: true
 *         description: Numeric ID of the userid
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */

router.get('/user/deactive/:id', verifyToken, Id, controller.verify, controller.Deactive);

/**
 * @swagger
 * /trainee2021/admin/refund/{id}:
 *   get:
 *    summary: Refund
 *    description: Refund
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: integer
 *         required: true
 *         description: Numeric ID of the ServiceId
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */

router.get('/refund/:id', verifyToken, controller.verify, controller.refund);

/**
 * @swagger
 * /trainee2021/admin/refund/calculate/{id}:
 *   post:
 *    summary: Refund calculate
 *    description: Refund calculate
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: integer
 *         required: true
 *         description: Numeric ID of the ServiceId
 *    requestBody:
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/definitions/RefundCalculate'
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */

router.post('/refund/calculate/:id', verifyToken, controller.verify, controller.calculateRefund);

/**
 * @swagger
 * /trainee2021/admin/refund/{id}:
 *   post:
 *    summary: Refund 
 *    description: Refund
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: integer
 *         required: true
 *         description: Numeric ID of the ServiceId
 *    requestBody:
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/definitions/Refund'
 *    responses:
 *     200:
 *      description: sucess
 *     500:
 *      description: failure
 */

router.post('/refund/:id', verifyToken, controller.verify, controller.refundDone);
router.post('/signup', controller.signUp);


export = router;