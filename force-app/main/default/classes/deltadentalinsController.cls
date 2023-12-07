public without sharing class deltadentalinsController {
   public List<Application__c> updateApplicationDetails { get; set; }
 
    public String applicationId { get; set; }
    
    public deltadentalinsController() {
    this.applicationId = ApexPages.currentPage().getParameters().get('id');
    System.debug('applicationId ' + this.applicationId);
    
    if (this.applicationId != null) {
        // Fetch details based on the provided applicationId
        updateApplicationDetails = [SELECT Id, Email_Address__c, First_Name__c, Last_Name__c, Gender__c, Zip_Code__c, Date_of_Birth__c,
                                    Plans_Product__c, Plans_Product__r.Name ,Plans_Product__r.Description__c,Plans_Product__r.Enrollment_fee__c,
                                    Plans_Product__r.Unit_Price__c FROM Application__c  WHERE Id = :this.applicationId LIMIT 1];
     System.debug('updateApplicationDetails'+updateApplicationDetails);
        
    }
}
    


    
    
    
    
    @AuraEnabled(cacheable=true)
    
    public static List<Plan__c> getPlans() {
        System.debug('query run');
        return [SELECT Id, Name, Subtitle__c, Type__c, Description__c FROM Plan__c];
        
        
    }
    @AuraEnabled(cacheable=true)
    public static List<Plan__c> getactivePlans() {
        System.debug('query run');
        return [SELECT Id, Name,Active__c , Subtitle__c, Type__c, Description__c FROM Plan__c WHERE Active__c =true];
        
        
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Plans_Product__c> getPlanProduct() {
        System.debug('query run');
        return [SELECT Id, Name, Unit_Price__c, Enrollment_fee__c, Plan__r.Name, Description__c FROM Plans_Product__c ];
        
        
    }
    @AuraEnabled
    public static String updateApplicationDetails(
        String email, 
        String firstName, 
        String lastName,
        Date dob, 
        String zipCode,
        String gender,
        Id selectedplanid
    ) {
         Id applicationId;
        Application__c existingApplication;
        try {
            existingApplication = [SELECT Id,Email_Address__c, First_Name__c, Last_Name__c, Gender__c, Zip_Code__c, Date_of_Birth__c,Plans_Product__c FROM Application__c WHERE Email_Address__c = :email LIMIT 1];
        } catch (QueryException e) {
            existingApplication = null; 
        }
        
        if(existingApplication != null) {
            existingApplication.First_Name__c = firstName;
            existingApplication.Last_Name__c = lastName;
            existingApplication.Zip_Code__c = zipCode;
            existingApplication.Gender__c = gender;
            existingApplication.Date_of_Birth__c = dob;
            existingApplication.Plans_Product__c=selectedplanid;
            
            update existingApplication;
             applicationId = existingApplication.Id;
            
            return existingApplication.Id;
        } else {
            Application__c newApplication = new Application__c(
                Email_Address__c = email,
                First_Name__c = firstName,
                Last_Name__c = lastName,
                Zip_Code__c = zipCode,
                Gender__c = gender,
                Date_of_Birth__c = dob,
                Plans_Product__c=selectedplanid
            );
            
            insert newApplication;
            applicationId = newApplication.Id;
            return newApplication.Id; 
        }
    }
    
    @AuraEnabled
    @Future(callout=true)
    public static void createAttachment(id accId){
        Account acc=[select Id,name,owner.name,owner.email from Account where id=:accId];
        
        Date currDate = Date.today();
        String formattedDate = currDate.format();//prints "2023-02-16"
        
       
        PageReference pageRef = Page.detlapdf; 
        pageRef.getParameters().put('accid', accId);
        Id accountId = accId;
        
        System.debug('Account Id for Content --'+accId);
        try {
            Blob pdfContent = pageRef.getContent();
            System.debug('  Blob pdfContent '+pageRef.getContent());
            
            
            ContentVersion cv = new ContentVersion();
            cv.Title = 'Invoice-' + formattedDate + '.pdf'; // Set the file name
            cv.PathOnClient = 'Invoice-' + formattedDate + '.pdf'; // Set the file path
            cv.VersionData = pdfContent; // Set the file content
            
            
            insert cv;
            
            System.debug('cv.id'+cv.id);
            

           
        } catch (Exception e) {
            System.debug('Error generating PDF or sending email: ' + e.getMessage());
        }        
    }
    
    
    
    
}