import { LightningElement, api, track } from 'lwc';

export default class OrderDetails extends LightningElement {
    @api dishes;
    @api totalPrice;

    closeModal() {
        const closeModalEvent = new CustomEvent('closemodalevent');
        this.dispatchEvent(closeModalEvent);
    }
}