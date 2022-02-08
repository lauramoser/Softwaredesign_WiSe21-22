import { database, mainMenu } from "../main";
import { Article } from "./Article";
import { Customer } from "./Customer";
import { Order } from "./Order";

let prompts = require('prompts');

export class User {
    public username: string;
    public password: string;
    public role: boolean;
    public gender: string;

    constructor(username: string, password: string, role: boolean, gender: string) {
        this.username = username;
        this.password = password;
        this.gender = gender;
        this.role = role;
    }

    public async createOrder(): Promise<Order> {
        console.log("Please fill in all necessary data for the new Order");
        let response = await prompts({
            type: 'number',
            name: 'value',
            message: 'ID:',
        });
        let id = response.value;

        response = await prompts({
            type: 'date',
            name: 'value',
            message: 'Order date:',
        });
        let orderDate = response.value;

        response = await prompts({
            type: 'date',
            name: 'value',
            message: 'Delivery date:',  // TODO nicht ausgeben
        });
        let deliveryDate = response.value;

        response = await prompts({
            type: 'number',
            name: 'value',
            message: 'Order amount:',   // TODO nicht ausgeben
        });
        let orderAmount = response.value;

        if (!database.saveOrder(id, orderDate, deliveryDate, orderAmount)) {
            console.log("Create order failed");
            return this.createOrder();
        }
        console.log("You successfully created an order")
        await mainMenu();
    }

    public async searchOrder(askToEdit?: boolean): Promise<Order> {
        if (askToEdit == undefined)
        askToEdit = true;
        let returnOrder: Order = undefined;
        let choices: { title: string }[] = [];
        let allOrder: Order[] = await database.getAllOrder();
        allOrder.forEach(order => {
            choices.push({ title: order.id.toString() })
        });
        let response = await prompts({
            type: 'autocomplete',
            name: 'value',
            message: 'Enter your desired order',
            choices: choices,
        });
        let desiredOrderString: string = response.value;
        console.log(desiredOrderString);
        if (!isNaN(Number(desiredOrderString))) {
            console.log(Number(desiredOrderString));
            allOrder.forEach(order => {
                if (order.id == Number(desiredOrderString)) {
                    returnOrder = order;
                }
            });
        } else {
            console.log("ID not found");
            return await this.searchOrder(askToEdit);
        }
        if (askToEdit) {
            response = await prompts({
                type: 'select',
                name: 'value',
                message: 'What do you want to do with this order?',
                choices: [
                    { title: 'I want to edit the order', value: 0 },
                    { title: 'I want to go back to the main Menu', value: 1},
                ],
            });
            let select = response.value;
            if (select == 0) {
                returnOrder = await this.editOrder(returnOrder);
            }else 
                await mainMenu();
        }
        return returnOrder;
    }

    public async editOrder(pOrder?: Order): Promise<Order> {
        let order: Order;
        if (pOrder) {
            pOrder = order;
        } else {
            order = await this.searchOrder(false);
        }
        console.log(order)
        let response = await prompts({
            type: 'select',
            name: 'value',
            message: 'What would you like to change in this order?',
            choices: [
                { title: 'Order date', value: 0 },
                { title: 'Delivery date', value: 1 },
                { title: 'Order amount', value: 2 },
            ],
        });
        let select = response.value;
        if (select == 0) {
            console.log("Order date: " + order.orderDate)
            response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new order date:',
            });
            let newOrderDate: Date = response.value; //TODO aus string datum erstellen
            let newOrder: Order = new Order(order.id, newOrderDate, order.deliveryDate, order.orderAmount);
            newOrder = await database.changeOrder(order, newOrder);
        } else if (select == 1) {
            console.log("Delivery date: " + order.deliveryDate)
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new delivery date:',
            });
            let newDeliveryDate: Date = response.value; //TODO aus string datum erstellen
            let newOrder: Order = new Order(order.id, order.orderDate, newDeliveryDate, order.orderAmount);
            newOrder = await database.changeOrder(order, newOrder);
        } else if (select == 2) {
            console.log("Order date: " + order.orderAmount)
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new order amount:',
            });
            let newOrderAmount: number = response.value; //TODO aus string number erstellen
            let newOrder: Order = new Order(order.id, order.orderDate, order.deliveryDate, newOrderAmount);
            newOrder = await database.changeOrder(order, newOrder);
        } 
        console.log("You successfully edited this order");
        await mainMenu();
    }

    public async createCustomer(): Promise<Customer> {
        console.log("Please fill in all necessary data for the new customer");
        let response = await prompts({
            type: 'number',
            name: 'value',
            message: 'ID:',
        });
        let id = response.value;

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Name:',
        });
        let name = response.value;

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'address:',
        });
        let address = response.value;

        response = await prompts({
            type: 'number',
            name: 'value',
            message: 'Customer Discount:',
        });
        let customerDiscount = response.value;

        if (!database.saveCustomer(id, name, address, customerDiscount)) {
            console.log("Create article failed");
            return this.createCustomer();
        }
        console.log("You successfully created a customer")
        await mainMenu();
    }

    public async searchCustomer(askToEdit?: boolean): Promise<Customer> {
        if (askToEdit == undefined)
            askToEdit = true;
        let returnCustomer: Customer = undefined;
        let response = await prompts({
            type: 'select',
            name: 'value',
            message: 'Do you want to search for the Customer by ID or by name?',
            choices: [
                { title: 'by ID', value: 0 },
                { title: 'by name', value: 1 },
            ],
        });
        let select = response.value;
        if (select == 1) {
            let choices: { title: string }[] = [];
            let allCustomer: Customer[] = await database.getAllCustomer();
            allCustomer.forEach(customer => {
                choices.push({ title: customer.name });
            });
            response = await prompts({
                type: 'autocomplete',
                name: 'value',
                message: 'Enter your desired customer',
                choices: choices,
            });
            let desiredCustomer = response.value;
            allCustomer.forEach(customer => {
                if (customer.name == desiredCustomer) {
                    returnCustomer = customer;
                }
            });
            if (returnCustomer == undefined) {
                console.log("Name not found");
                return await this.searchCustomer(askToEdit);
            }
        }
        else {
            let choices: { title: string }[] = [];
            let allCustomer: Customer[] = await database.getAllCustomer();
            allCustomer.forEach(customer => {
                choices.push({ title: customer.id.toString() })
            });
            response = await prompts({
                type: 'autocomplete',
                name: 'value',
                message: 'Enter your desired customer',
                choices: choices,
            });
            let desiredCustomerString: string = response.value;
            console.log(desiredCustomerString);
            if (!isNaN(Number(desiredCustomerString))) {
                console.log(Number(desiredCustomerString));
                allCustomer.forEach(customer => {
                    if (customer.id == Number(desiredCustomerString)) {
                        returnCustomer = customer;
                    }
                });
            } else {
                console.log("ID not found");
                return await this.searchCustomer(askToEdit);
            }
        }
        console.log(returnCustomer);
        if (askToEdit) {
            response = await prompts({
                type: 'select',
                name: 'value',
                message: 'What do you want to do with this customer?',
                choices: [
                    { title: 'I want to edit the customer', value: 0 },
                    { title: 'I want to make an order', value: 1 },
                    { title: 'I want to view the customer statistics ', value: 2},
                    { title: 'I want to go back to the main Menu', value: 3},
                ],
            });
            let select = response.value;
            if (select == 0) {
                returnCustomer = await this.editCustomer(returnCustomer);
            }else if (select == 1){
                await this.createOrder();
            }else if (select == 2){
                await this.statisticCustomer();
            }else if (select == 3){
                await mainMenu();
            }
        }
        return returnCustomer;
    }

    public async editCustomer(pCustomer?: Customer): Promise<Customer> {
        let customer: Customer;
        console.log(customer)
        if (pCustomer) {
            pCustomer = customer;
        } else {
            customer = await this.searchCustomer(false);
        }
        let response = await prompts({
            type: 'select',
            name: 'value',
            message: 'What would you like to change for this customer?',
            choices: [
                { title: 'Name', value: 0 },
                { title: 'Address', value: 1 },
                { title: 'Customer discount', value: 2 },
            ],
        });
        let select = response.value;
        if (select == 0) {
            console.log("Name: " + customer.name);
            response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new name:',
            });
            let newName: string = response.value; 
            let newCustomer: Customer = new Customer(customer.id, newName, customer.address, customer.customerDiscount);
            newCustomer = await database.changeCustomer(customer, newCustomer);
        } else if (select == 1) {
            console.log("Address: " + customer.address);
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new address:',
            });
            let newAddress: string = response.value; 
            let newCustomer: Customer = new Customer(customer.id, customer.name, newAddress, customer.customerDiscount);
            newCustomer = await database.changeCustomer(customer, newCustomer);
        } else if (select == 2) {
            console.log("Customer discount: " + customer.customerDiscount)
            let response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Enter the new customer discount:',
            });
            let newCustomerDiscount: number = response.value; //TODO aus string number erstellen
            let newCustomer: Customer = new Customer(customer.id, customer.name, customer.address, newCustomerDiscount);
            newCustomer = await database.changeCustomer(customer, newCustomer);
        } 
        console.log("You successfully edited this customer");
        await mainMenu();
    }

    public async statisticCustomer(): Promise<void> {

    }

    public async searchArticle(askToEdit?: boolean): Promise<Article> {
        if (askToEdit == undefined)
            askToEdit = true;
        let returnArticle: Article = undefined;
        let response = await prompts({
            type: 'select',
            name: 'value',
            message: 'Do you want to search for the article by ID or by description?',
            choices: [
                { title: 'by ID', value: 0 },
                { title: 'by description', value: 1 },
            ],
        });
        let select = response.value;
        if (select == 1) {
            let choices: { title: string }[] = [];
            let allArticle: Article[] = await database.getAllArticle();
            allArticle.forEach(article => {
                choices.push({ title: article.description });
            });
            response = await prompts({
                type: 'autocomplete',
                name: 'value',
                message: 'Enter your desired article',
                choices: choices,
            });
            let desiredArticle = response.value;
            allArticle.forEach(article => {
                if (article.description == desiredArticle) {
                    returnArticle = article;
                }
            });
            if (returnArticle == undefined) {
                console.log("Description not found");
                return await this.searchArticle(askToEdit);
            }
        }
        else {
            let choices: { title: string }[] = [];
            let allArticle: Article[] = await database.getAllArticle();
            allArticle.forEach(article => {
                choices.push({ title: article.id.toString() })
            });
            response = await prompts({
                type: 'autocomplete',
                name: 'value',
                message: 'Enter your desired article',
                choices: choices,
            });
            let desiredArticleString: string = response.value;
            console.log(desiredArticleString);
            if (!isNaN(Number(desiredArticleString))) {
                console.log(Number(desiredArticleString));
                allArticle.forEach(article => {
                    if (article.id == Number(desiredArticleString)) {
                        returnArticle = article;
                    }
                });
            } else {
                console.log("ID not found");
                return await this.searchArticle(askToEdit);
            }
        }
        console.log(returnArticle);
        if (askToEdit) {
            response = await prompts({
                type: 'select',
                name: 'value',
                message: 'What do you want to do with this article?',
                choices: [
                    { title: 'I want to edit the article', value: 0 },
                    { title: 'I want to make an order', value: 1 },
                    { title: 'I want to view the article statistics ', value: 2},
                    { title: 'I want to go back to the main Menu', value: 3},
                ],
            });
            let select = response.value;
            if (select == 0) {
                returnArticle = await this.editArticle(returnArticle);
            }else if (select == 1){
                await this.createOrder();
            }else if (select == 2){
                await this.statisticArticle(returnArticle);
            }else if (select == 3){
                await mainMenu();
            }             
        }
        return returnArticle;
    }

    public async editArticle(pArticle?: Article): Promise<Article> {
        let article: Article;
        console.log(article)
        if (pArticle) {
            pArticle = article;
        } else {
            article = await this.searchArticle(false);
        }
        let response = await prompts({
            type: 'select',
            name: 'value',
            message: 'What would you like to change in this article?',
            choices: [
                { title: 'Description', value: 0 },
                { title: 'Date of market launch', value: 1 },
                { title: 'Price', value: 2 },
                { title: 'Standard delivery time', value: 3 },
                { title: 'Minimum order size', value: 4 },
                { title: 'Maximum order size', value: 5 },
                { title: 'Discount order size', value: 6 },
                { title: 'Associated discount', value: 7 },
            ],
        });
        let select = response.value;
        if (select == 0) {
            console.log("Description: " + article.description)
            response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new description:',
            });
            let newDescription: string = response.value;
            let newArticle: Article = new Article(article.id, newDescription, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
            newArticle = await database.changeArticle(article, newArticle);
        } else if (select == 1) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new date of market launch:',
            });
            let newDateOfMarketLaunch: Date = response.value; //TODO aus string datum erstellen
            let newArticle: Article = new Article(article.id, article.description, newDateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
            newArticle = await database.changeArticle(article, newArticle);
        } else if (select == 2) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Price:',
            });
            let newPrice: number = response.value; //TODO aus string number erstellen
            let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, newPrice, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
            newArticle = await database.changeArticle(article, newArticle)
        } else if (select == 3) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Standard delivery time:',
            });
            let newStandardDeliveryTime: number = response.value; //TODO aus string number erstellen
            let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, newStandardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
            newArticle = await database.changeArticle(article, newArticle)
        } else if (select == 4) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Minimum order size:',
            });
            let newMinimumOrderSize: number = response.value; //TODO aus string number erstellen
            let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, newMinimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
            newArticle = await database.changeArticle(article, newArticle)
        } else if (select == 5) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Maximum order size:',
            });
            let newMaximumOrderSize: number = response.value; //TODO aus string number erstellen
            let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, newMaximumOrderSize, article.discountOrderSize, article.associatedDiscount);
            newArticle = await database.changeArticle(article, newArticle)
        } else if (select == 6) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Discount order size:',
            });
            let newDiscountOrderSize: number = response.value; //TODO aus string number erstellen
            let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, newDiscountOrderSize, article.associatedDiscount);
            newArticle = await database.changeArticle(article, newArticle)
        } else if (select == 7) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Associated discount:',
            });
            let newAssociatedDiscount: number = response.value; //TODO aus string number erstellen
            let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, newAssociatedDiscount);
            newArticle = await database.changeArticle(article, newArticle)
        }
        console.log("You successfully edited this article");
        await mainMenu();
    }

    public async statisticArticle(article: Article): Promise<void>{

    }
}



