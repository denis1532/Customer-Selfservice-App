public with sharing class DishController {
	@AuraEnabled (Cacheable = true)
    public static List<Dish__c> getDishes (String category, String subcategory) {
        List<Dish__c> dishes;
        if (category == null) {
            dishes = [SELECT Id, Name, Price__c, Description__c, Category__c, Subcategory__c
                      FROM Dish__c];
        } else if (subcategory == null) {
            dishes = [SELECT Id, Name, Price__c, Description__c, Category__c, Subcategory__c
                      FROM Dish__c
                      WHERE Category__c = :category];
        } else {
            dishes = [SELECT Id, Name, Price__c, Description__c, Category__c, Subcategory__c
                      FROM Dish__c
                      WHERE Category__c = :category
                      AND Subcategory__c = :subcategory];
        }

        return dishes;
    }
}
