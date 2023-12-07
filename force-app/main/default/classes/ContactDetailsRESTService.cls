@RestResource(urlMapping='/getContactDetails/*')
global with sharing class ContactDetailsRESTService {
    @HttpGet
    global static Contact getContactDetails() {
        RestRequest req = RestContext.request;
        String email = req.params.get('email');

        Application__c app = [SELECT Id, First_Name__c, Last_Name__c FROM Application__c WHERE Email_Address__c = :email LIMIT 1];

        Contact contact = new Contact();
        contact.FirstName = app.First_Name__c;
        contact.LastName = app.Last_Name__c;

        return contact;
    }
}