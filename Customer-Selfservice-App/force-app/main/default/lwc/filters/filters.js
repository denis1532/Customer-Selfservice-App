import { LightningElement, api, wire , track } from 'lwc';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import DISH_OBJECT from '@salesforce/schema/Dish__c';

export default class Filters extends LightningElement {

    @track categoryValues = [];
    @track categoryOptions = [];
    @track subcategoryOptions = [];
    @track subcategoryValues = [];
    @track selectedCategory = 'All';
    @track selectedSubcategory = 'All';
    @track error;
    @track controlValues;

    @track isDisabledSubcategory = false;

    // GET OBJECT INFO
    @wire(getObjectInfo, { objectApiName: DISH_OBJECT })
    objectInfo;

    // GET PICKLIST VALUES
    @wire(getPicklistValuesByRecordType,
        { objectApiName: DISH_OBJECT, recordTypeId: '$objectInfo.data.defaultRecordTypeId'})
    categoryPicklistValues({ data, error }) {
        if (data) {
            this.error = null;

            // Making category label and value = all to see all the values
            let categoryOptions = [{label: 'All', value: 'All'}];
            this.selectedCategory = categoryOptions[0].value;
            data.picklistFieldValues.Category__c.values.forEach(category => {
                categoryOptions.push({
                label: category.label,
                value: category.value
                })
            });
            // Sending user-defined category label and value
            this.categoryValues = categoryOptions;

            // Making subcategory label and value = all to see all the values
            let subcategoryOptions = [{label: 'All', value: 'All'}];
            this.selectedSubcategory = subcategoryOptions[0].value;
            this.controlValues = data.picklistFieldValues.Subcategory__c.controllerValues;
            this.subcategoryOptions = data.picklistFieldValues.Subcategory__c.values;
            this.subcategoryOptions.forEach( subcategory => {
                subcategoryOptions.push({
                label: subcategory.label,
                value: subcategory.value
                })
            });
            // Sending user-defined subcategory label and value
            this.subcategoryValues = subcategoryOptions;

            // Making subcategory filter not available until category filter is not chosen
            this.isDisabledSubcategory = true;
        }

        if (error) {
            this.error = JSON.stringify(error);
        }
    }

    // Handling user's choice of category to give appropriate subcategory
    handleCategoryChange(event) {
        let subcategoryOptions = [{label: 'All', value: 'All'}];
        if (event.target.value === this.categoryValues[0].value) {
            this.selectedCategory = this.categoryValues[0].value;
            this.selectedSubcategory = subcategoryOptions[0].value;
            this.isDisabledSubcategory = true;
        } else {
            // Making subcategory field available for choice
            this.isDisabledSubcategory = false;
            this.selectedCategory = event.target.value;
            this.subcategoryOptions.forEach( subcategory => {
                if (subcategory.validFor[0] === this.controlValues[this.selectedCategory]) {
                    subcategoryOptions.push({
                        label: subcategory.label,
                        value: subcategory.value
                    });
                    this.selectedSubcategory = subcategoryOptions[0].value;
                    this.subcategoryValues = subcategoryOptions;
                }
            });
        }
        this.dispatchCategoryFiltersSwitchEvent();
    }

    handleSubcategoryChange(event) {
        this.selectedSubcategory = event.target.value;
        this.dispatchCategoryFiltersSwitchEvent();

    }

    dispatchCategoryFiltersSwitchEvent() {
        const switchCategoryFilters = new CustomEvent('switchcategories', {
        detail: {
            category: this.selectedCategory,
            subcategory: this.selectedSubcategory
        }
        });
        this.dispatchEvent(switchCategoryFilters);
    }
}
