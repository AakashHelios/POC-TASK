public without sharing class ApplicationDetailsController {
    public List<Application__c> applicationDetails { get; set; }
    public List<Plans_Product__c> relatedProducts { get; set; }

    public ApplicationDetailsController() {
        // Fetch Application Details (replace 'applicationId' with your record Id)
        applicationDetails = [SELECT Id, First_Name__c, Last_Name__c, Gender__c, Zip_Code__c, Date_of_Birth__c FROM Application__c LIMIT 1];

        // Fetch Related Products for the Application
        relatedProducts = [SELECT Id, Name, Unit_Price__c, Enrollment_fee__c, Plan__r.Name, Description__c FROM Plans_Product__c];
    }
}