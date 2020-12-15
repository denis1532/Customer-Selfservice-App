import { subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import DISH_ORDER_MC from '@salesforce/messageChannel/DishCountUpdate__c';
import { LightningElement, api, wire, track } from 'lwc';
import makeOrder from '@salesforce/apex/DishOrderController.makeOrder';
import addDishToOrder from '@salesforce/apex/DishOrderController.addDishToOrder';

export default class CurrentOrder extends LightningElement {
    @wire(MessageContext) messageContext;
    @track subscription;
    @track dishes;
    @track isModalOpen;
    @track totalPrice;
    @track orderId;
    @track error;
    @track deliveryAddress;
    @track isDisabledAddress;

    connectedCallback() {
        this.resetOrderDetails();
    }

    resetOrderDetails() {
        this.deliveryAddress = '';
        this.isDelivery = false;
        this.isDisabledAddress = true;
        this.isModalOpen = false;
        this.dishes = [];
        this.updateTotalPrice();
        this.subscribeToMessageChannel();
    }

    switchIsDelivery() {
        this.isDelivery = !this.isDelivery;
        this.isDisabledAddress = !this.isDelivery;
    }

    addressChange(event) {
        this.deliveryAddress = event.target.value;
    }

    subscribeToMessageChannel() {
        this.subscription = subscribe(
        this.messageContext,
        DISH_ORDER_MC,
        (message) => this.handleMessage(message),
        { scope: APPLICATION_SCOPE }
        );
    }

    handleMessage(message) {
        this.dishes = message.dishes.filter(dish => dish.count > 0);
        this.updateTotalPrice();
    }

    updateTotalPrice() {
        this.totalPrice = this.dishes.reduce((sum, dish) => sum + dish.count * dish.Price__c, 0);
    }

    openModal() {
        this.isModalOpen = true;
    }

    handleCloseModal() {
        this.isModalOpen = false;
    }

    makeAnOrder() {
        if (!this.dishes.length) {
          return;
        }
        this.deliveryAddress = this.isDelivery ? this.deliveryAddress : null;
        makeOrder({
          totalPrice: this.totalPrice,
          deliveryAddress: this.deliveryAddress
        })
        .then(result => {
            return result;
        })
        .then(result => {
            this.dishes.forEach( dish => {
                addDishToOrder({
                    orderId: result,
                    dishId: dish.Id,
                    dishComment: dish.comment,
                    dishCount: dish.count
                })
                .catch(error => {
                    this.error = error;
                    console.log(JSON.stringify(error));
                });
            });
        })
        .catch(error => {
            this.error = error;
            console.log(JSON.stringify(error));
        });

        this.dispatchResetOrderDetails();
        this.resetOrderDetails();
    }

    dispatchResetOrderDetails() {
        const resetOrderDetails = new CustomEvent('resetorder');
        this.dispatchEvent(resetOrderDetails);
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }
}
