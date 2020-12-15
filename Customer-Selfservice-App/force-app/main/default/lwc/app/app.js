import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {

    @track isOpenSuccessModal;

    connectedCallback() {
        this.isOpenSuccessModal = false
    }

    resetOrderDetails() {
        this.template.querySelector('c-menu').resetOrderDetails();
        this.isOpenSuccessModal = true;
        setTimeout(() => {
        this.isOpenSuccessModal = false;
        }, 1800);
    }
}