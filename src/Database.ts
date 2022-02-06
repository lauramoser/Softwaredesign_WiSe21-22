import * as Mongo from "mongodb";
import {User} from "./classes/User"
import {Admin} from "./classes/Admin";
import {Article} from "./classes/Article";
import { Customer } from "./classes/Customer";
import { Order } from "./classes/Order";

export class Database {

    private readonly dbName: string = "ERCM-System";
    private mongoClient!: Mongo.MongoClient;
    private dbCustomer!: Mongo.Collection;
    private dbUser!: Mongo.Collection;
    private dbArticle!: Mongo.Collection;
    private dbOrder!: Mongo.Collection;

    private readonly dbCustomerCollectionName: string = "Customer";
    private readonly dbUserCollectionName: string = "User";
    private readonly dbArticleCollectionName: string = "Article";
    private readonly dbOrderCollectionName: string = "Order";

    public async connect(): Promise<boolean> {
        const uri: string = "mongodb+srv://MyMongoDBUser:Studium2019@gis-ist-geil.zqrzt.mongodb.net/ERCM-System?retryWrites=true&w=majority";
        this.mongoClient = new Mongo.MongoClient(uri, {});
        await this.mongoClient.connect();
        this.dbCustomer = this.mongoClient.db(this.dbName).collection(this.dbCustomerCollectionName);
        this.dbUser = this.mongoClient.db(this.dbName).collection(this.dbUserCollectionName);
        this.dbArticle = this.mongoClient.db(this.dbName).collection(this.dbArticleCollectionName);
        this.dbOrder = this.mongoClient.db(this.dbName).collection(this.dbOrderCollectionName);
        console.log("Database connection", this.dbCustomer != undefined);
        return this.dbCustomer != undefined;
    }

    public async checkUser(username: string, password?: string): Promise<User> {
        let userdb: User;
        let user: User;
        if (password)
            userdb = <User><unknown>await this.dbUser.findOne({ $and: [{ username: username }, { password: password }] }); 
        else
            userdb = <User><unknown>await this.dbUser.findOne({ username: username });

        if (userdb) {
            user = new User(userdb.username, userdb.password, userdb.role, userdb.gender);

        }
        return user;
    }

    public async saveUser(username: string, password: string, gender: string, role: boolean): Promise<User> {
        let userdb: User = <User><unknown>await this.dbUser.insertOne({ username: username, password: password, gender: gender, role: role });
        let user: User = undefined;
        if (userdb) {
            // Neuer User erzeugen und Werte umspeichern damit alle Werte die nur in der Datenbank vorhanden sind auch gespeichert werden
            // (z.B. nicht nur username und passwort sondern auch Profilbild (bisher nur in der DB))
            // und alle Methoden aufrufbar sind (nur bei dem Nutzer aus der DB kann man nicht user.methode() aufrufen)
            user = new User(userdb.username, userdb.password, userdb.role, userdb.gender);
        }
        return user;
    }

    public async saveArticle(id:number, description:string, dateOfMarketLaunch:Date, price:number, standardDeliveryTime:number, minimumOrderSize:number, maximumOrderSize:number, discountOrderSize:number, associatedDiscount:number): Promise<Article> {
        let articledb: Article = <Article><unknown>await this.dbArticle.insertOne({ id:id, description:description, dateOfMarketLaunch:dateOfMarketLaunch, price:price, standardDeliveryTime:standardDeliveryTime, minimumOrderSize:minimumOrderSize, maximumOrderSize:maximumOrderSize, discountOrderSize:discountOrderSize, associatedDiscount:associatedDiscount});
        let article: Article = undefined;
        if (articledb) {
            article = new Article(articledb.id, articledb.description, articledb.dateOfMarketLaunch, articledb.price, articledb.standardDeliveryTime, articledb.minimumOrderSize, articledb.maximumOrderSize, articledb.discountOrderSize, articledb.associatedDiscount);
        }
        return article;
    }

    public async saveCustomer(id:number, name:string, address:string, customerDiscount:number): Promise<Customer> {
        let customerdb: Customer = <Customer><unknown>await this.dbCustomer.insertOne({id:id, name:name, address:address, customerDiscount:customerDiscount})
        let customer: Customer = undefined;
        if (customerdb) {
            customer = new Customer(customerdb.id, customerdb.name, customerdb.address, customerdb.customerDiscount);
        }
        return customer;
    }

    public async saveOrder(id:number, orderDate:Date, deliveryDate:Date, orderAmount:number): Promise<Order>{
        let orderdb: Order = <Order><unknown>await this.dbOrder.insertOne({id:id, orderDate:orderDate, deliveryDate:deliveryDate, orderAmount:orderAmount})
        let order: Order = undefined;
        if (orderdb) {
            order = new Order(orderdb.id, orderdb.orderDate, orderdb.deliveryDate, orderdb.orderAmount);
        }
        return order;
    }

    public async changeUser(username: string, user: User): Promise<boolean> {
        let successfull: Mongo.ModifyResult<Mongo.Document> = await this.dbUser.findOneAndReplace({ username: username }, user);
        if (successfull)
            return true;
        return false;
    }
}