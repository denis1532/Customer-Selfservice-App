import { LightningElement, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import getOrders from '@salesforce/apex/DishOrderController.getOrders';
import ITEM_ORDER_OBJECT from '@salesforce/schema/Item_Order__c';
import STATUS_FIELD from '@salesforce/schema/Item_Order__c.Delivery_Status__c';

export default class Orders extends LightningElement {
    @track orders;
    @track filteredOrders;
    @track isModalOpen;
    @track error;
    @track columns = [
        { label: 'Total Price', fieldName: 'Total_Price__c', type: 'currency' },
        { label: 'Order Data', fieldName: 'Order_Date__c', type: 'date' },
        { label: 'Delivery Address', fieldName: 'Delivery_Address__c', type: 'text' },
        { label: 'Delivery Status', fieldName: 'Delivery_Status__c', type: 'text' },
    ];
    @track statusOptions = [];
    @track dateOptions=[];

    @track totalPricesSum = 0;

    @wire(getObjectInfo, {objectApiName: ITEM_ORDER_OBJECT })
        orderInfo;

    @wire(getPicklistValues, {recordTypeId: '$orderInfo.data.defaultRecordTypeId', fieldApiName: STATUS_FIELD })
        statusFieldInfo({ data, error }) {
            if (data){
                this.statusOptions = [...data.values];
                this.statusOptions.push({label: 'All', value: 'All'});
            }
        }

    status = 'All';
    orderDate = 'All';

    isModalOpen = false;

    connectedCallback() {
        this.loadOrders();
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.dispatchCloseModal();
    }

    loadOrders() {
        return getOrders()
        .then(result => {
            this.orders = result;
            this.filteredOrders = result;
            this.getDateOptions(result);
            this.getDishOptions(result);
            this.calculateTotalPrice();
        })
        .catch(error => {
            this.error = error;
        });
    }

    filterOrders() {
        this.filteredOrders = this.orders;

        if(this.status != 'All') {
            this.filteredOrders = this.filteredOrders.filter((order) => {
                return order.Delivery_Status__c == this.status;
            })
        }

        if(this.orderDate != 'All') {
            this.filteredOrders = this.filteredOrders.filter((order) => {
                return order.Order_Date__c == this.orderDate;
            })
        }
    }

    handleStatusChange(event) {
        this.status = event.detail.value;
        this.filterOrders();
        this.calculateTotalPrice();
    }

    handleDateChange(event) {
        this.orderDate = event.detail.value;
        this.filterOrders();
        this.calculateTotalPrice();
    }

    getDateOptions(result){
        this.dateOptions = [{label:'All', value:'All'}];
        const setOfDate = new Set();
        result.forEach(element => {
            let date = element.Order_Date__c;
            setOfDate.add(date);
        });

        setOfDate.forEach(element => {
            this.dateOptions.push({value: element , label: element});
        });
    }


    calculateTotalPrice(){
        this.totalPricesSum = 0;

        this.filteredOrders.forEach((order) => {
            this.totalPricesSum += order.Total_Price__c;
        });
    }

    dispatchCloseModal() {
        this.status = 'All';
        this.orderDate = 'All';
        // this.orderDish = 'All';
        const event = new CustomEvent('closemodal');
        this.dispatchEvent(event);
        this.getOrders();
    }
}
