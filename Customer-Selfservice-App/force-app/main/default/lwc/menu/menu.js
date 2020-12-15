import { LightningElement, api, track, wire } from 'lwc';
import getDishes from '@salesforce/apex/DishController.getDishes';
import DISH_ORDER_MC from '@salesforce/messageChannel/DishCountUpdate__c';
import { publish, MessageContext } from 'lightning/messageService';

export default class Menu extends LightningElement {
    @track dishes;
    @track allDishesData;
    @track category;
    @track subcategory;
    @track displayedDishes;
    @track error;
    @track isOpenHistory = false;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.doInit();
    }

    doInit() {
        this.category = null;
        this.subcategory = null;
        this.loadDishes()
        .then(result => {
            this.allDishesData = result.map((dish) => ({
                ...dish,
                comment: '',
                count: 0
            }));
        })
        .then(() => {
            this.syncDishOrderData();
        })
        .then(() => {
            this.publishDishesData();
        })
        .catch(error => {
            this.error = error;
        });
    }

    loadDishes() {
        return getDishes({
            category: this.category,
            subcategory: this.subcategory
        })
        .then(result => {
            this.dishes = result;
            return result;
        })
        .catch(error => {
            this.error = error;
        });
    }

    handleUpdateDishData(event) {
        const id = event.detail.dishId;
        const comment = event.detail.dishComment;
        const count = event.detail.dishCount;
        this.allDishesData.forEach(dish => {
        if (dish.Id === id) {
            dish.comment = comment;
            dish.count = count;
        }
        });
        this.syncDishOrderData();
        this.publishDishesData();
    }

    handleSwitchCategories(event) {
        this.category = event.detail.category === 'All' ? null : event.detail.category;
        this.subcategory = event.detail.subcategory === 'All' ? null : event.detail.subcategory;
        this.loadDishes()
        .catch(error => {
            this.error = error;
            console.log(error);
        });
    }

    syncDishOrderData() {
        let result = [];
        this.dishes.forEach(dish => {
        result.push(this.allDishesData.find(dishData => dishData.Id === dish.Id));
        });
        this.dishes = result;
    }

    publishDishesData() {
        const message = {
        dishes: this.allDishesData,
        }
        publish(this.messageContext, DISH_ORDER_MC, message);
    }

    openOrderHistory() {
        this.isOpenHistory = true;
    }

    closeOrderHistory() {
        this.isOpenHistory = false;
    }

    @api
    resetOrderDetails() {
        this.doInit();
    }
}
