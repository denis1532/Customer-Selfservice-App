public with sharing class DishOrderController {
	@AuraEnabled
    public static string makeOrder (Decimal totalPrice, String deliveryAddress) {
        Date orderDate = System.today();
        String status = 'Ordered';
        Item_Order__c order = new Item_Order__c (Total_Price__c = totalPrice,
                                           Delivery_Address__c = deliveryAddress,
                                           Delivery_Status__c = status,
                                           Order_Date__c = orderDate);
        insert order;
        return order.Id;
    }

    @AuraEnabled
    public static void addDishToOrder (String orderId,
                                       String dishId,
                                       String dishComment,
                                       Integer dishCount) {
    	Dish_Order__c dishOrder = new Dish_Order__c();
		dishOrder.Item_Order__c = orderId;
		dishOrder.Dish__c = dishId;
		dishOrder.Comment__c = dishComment;
		dishOrder.Dish_Count__c = dishCount;
		insert dishOrder;
	}

    @AuraEnabled (Cacheable = true)
    public static List<Item_Order__c> getOrders() {
        Id currentUser = UserInfo.getUserId();
        return [SELECT Id, Name, Order_Date__c, Delivery_Status__c, Total_Price__C, Delivery_Address__c, (SELECT Dish__r.Name FROM Dish_Orders__r)
                FROM Item_Order__c
                WHERE OwnerId = :currentUser
                ORDER BY Order_Date__c DESC];
    }
}
