import { LightningElement, api, wire, track} from 'lwc';

export default class DishTile extends LightningElement {
    @api dishId;
    @api dishName;
    @api dishPrice;
    @api dishDescription;
    @api dishComment;
    @api dishCount;

    @track commentTemp;
    @track isCommentModalOpen;

    decreaseCount() {
        if (this.dishCount < 0) {
            this.dishCount = 0;
            this.dispatchDishData();
        } else if (this.dishCount > 0) {
            this.dishCount--;
            this.dispatchDishData();
        }
    }

    increaseCount() {
        if (this.dishCount < 0) {
            this.dishCount = 1;
            this.dispatchDishData();
        } else {
            this.dishCount++;
            this.dispatchDishData();
        }
    }

    changeComment(event) {
        this.dishComment = event.target.value;
    }

    confirmComment() {
        this.isCommentModalOpen = false;
        this.dispatchDishData();
    }

    openCommentModal() {
        this.commentTemp = this.dishComment;
        this.isCommentModalOpen = true;
    }

    closeCommentModal() {
        this.dishComment = this.commentTemp;
        this.isCommentModalOpen = false;
    }

    dispatchDishData() {
        const updateDishData = new CustomEvent('updatedishdata', {
        detail: {
            dishId: this.dishId,
            dishComment: this.dishComment,
            dishCount: this.dishCount
        }
        });
        this.dispatchEvent(updateDishData);
    }
}