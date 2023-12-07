public without sharing class PlanController {
    
    
    //it is showing plan object records
    @AuraEnabled(cacheable=true)
    public static List<Plan__c> getPlans() {
        return [SELECT Id, Name, Description__c FROM Plan__c];
    }
    
    //it is showing application records that have exists email
    @AuraEnabled(cacheable=true)
    public static Application__c getApplicationByEmail(String email) {
        try {
            return [SELECT Id, Name, First_Name__c, Last_Name__c, Email_Address__c, Zip_Code__c, Date_of_Birth__c FROM Application__c WHERE Email_Address__c = :email LIMIT 1];
        } catch (Exception e) {
            return null;
        }
    }
    
    @AuraEnabled
    public static String updateApplicationDetails(
        String email, 
        String firstName, 
        String lastName,
        Date dob, 
        String zipCode
    ) {
        try {
            Application__c[] applications = [SELECT Id, First_Name__c, Last_Name__c, Zip_Code__c, Date_of_Birth__c FROM Application__c WHERE Email_Address__c = :email LIMIT 1];
            
            if (applications.isEmpty()) {
                // Create a new Application record if no record exists with the given email
                Application__c newApplication = new Application__c(
                    Email_Address__c = email,
                    First_Name__c = firstName,
                    Last_Name__c = lastName,
                    Zip_Code__c = zipCode,
                    Date_of_Birth__c = dob
                );
                
                insert newApplication;
                return newApplication.Id; // Return the ID of the newly created record
            } else {
                // Update the existing Application record
                Application__c application = applications[0];
                application.First_Name__c = firstName;
                application.Last_Name__c = lastName;
                application.Zip_Code__c = zipCode;
                application.Date_of_Birth__c = dob;
                
                update application;
                return application.Id; // Return the ID of the updated record
            }
        } catch (Exception e) {
            return null; // Return null in case of any exceptions
        }
    }
    
    
    
    @AuraEnabled(cacheable=true)
    public static List<Product2> getproducts(String email) {
        try {
            // Query all products
            List<Product2> allProducts = [SELECT Name, Id, Description, ProductCode FROM Product2];
            
            // Query the IDs of products quoted by the user based on the email
            List<Id> quotedProductIds = new List<Id>();
            for (application_catalog__c appCatalog : [SELECT Product__c FROM application_catalog__c WHERE Application__r.Email_Address__c = :email]) {
                quotedProductIds.add(appCatalog.Product__c);
            }
            
            // Filter out the quoted products from the list of all products
            List<Product2> filteredProducts = new List<Product2>();
            for (Product2 product : allProducts) {
                if (!quotedProductIds.contains(product.Id)) {
                    filteredProducts.add(product);
                }
            }
            
            return filteredProducts;
        } catch (Exception e) {
            return null; 
        }
    }
    
    
    
    
    
    
    
    @AuraEnabled
    public static Boolean storeApplicationCatalog(String applicationId, String selectedProductId,String selectedName) {
        Boolean success = false;
        
        try {
            // Check if a similar record already exists based on Application and Product IDs
            List<application_catalog__c> existingEntries = [SELECT Id,Application__c,Product__c FROM application_catalog__c WHERE Application__c = :applicationId AND Product__c = :selectedProductId LIMIT 1];
            if (existingEntries.isEmpty()) {
                // Create a new record for application_catalog_
                application_catalog__c newCatalogEntry = new application_catalog__c();
                newCatalogEntry.Application__c = applicationId; 
                newCatalogEntry.Product__c = selectedProductId;
                newCatalogEntry.Name=selectedName;
                
                
                // Insert the new record
                insert newCatalogEntry;
                
                System.debug('newCatalogEntry'+newCatalogEntry);
                success = true;
            }else{
                // Record already exists, perform update
                application_catalog__c appcat= existingEntries[0];
                appcat.Application__c=applicationId;
                appcat.Product__c=selectedProductId;
                
                update appcat;
                
                
            }
        } catch (Exception e) {
            // Handle any exceptions or errors
            success = false;
            System.debug('Error: ' + e.getMessage());
        }
        
        return success;
    }
    @AuraEnabled
    public static Boolean storeProductCatalog(
        String selectedProductId,
        String productProductCode,
        String productPriceBook,
        String productName,
        String productDescription
    ) {
        Boolean success = false;
        
        try {
            // Check if a similar record already exists based on Product ID
            List<Product_Catalog__c> existingEntries = [
                SELECT Id, Product__c, Description__c, Price_Book__c
                FROM Product_Catalog__c
                WHERE Product__c = :selectedProductId
                LIMIT 1
            ];
            
            if (existingEntries.isEmpty()) {
                Product_Catalog__c newProductCatalogEntry = new Product_Catalog__c(
                    Product__c = selectedProductId,
                    Product_Code__c = productProductCode,
                    Price_Book__c = productPriceBook,
                    Name = productName,
                    Description__c = productDescription
                );
                
                insert newProductCatalogEntry;
                System.debug('New Product Catalog Entry: ' + newProductCatalogEntry);
                success = true;
            } else {
                Product_Catalog__c procat = existingEntries[0];
                procat.Description__c = productDescription;
                procat.Price_Book__c = productPriceBook;
                // No need to set selectedProductId again as it remains unchanged in an update operation
                
                update procat;
                System.debug('Updated Product Catalog Entry: ' + procat);
                success = true;
            }
        } catch (Exception e) {
            success = false;
            System.debug('Error: ' + e.getMessage());
        }
        
        return success;
    }
    
    @AuraEnabled
    public static List<Product2> getLinkedProducts(String email) {
        try {
            List<application_catalog__c> linkedApplicationCatalogs = [
                SELECT Product__r.Name, Product__r.Description ,product__r.ProductCode
                FROM application_catalog__c
                WHERE Application__r.Email_Address__c = :email
            ];
            
            List<Product2> linkedProducts = new List<Product2>();
            for (application_catalog__c catalog : linkedApplicationCatalogs) {
                if (catalog.Product__r != null) {
                    linkedProducts.add(new Product2(
                        Name = catalog.Product__r.Name,
                        Description = catalog.Product__r.Description,
                        ProductCode=catalog.product__r.ProductCode
                        
                    ));
                }
            }
            
            return linkedProducts;
        } catch (QueryException qe) {
            
            System.debug('Query Exception: ' + qe.getMessage());
        } catch (Exception e) {
            
            System.debug('Exception: ' + e.getMessage());
        }
        
        return new List<Product2>(); 
    }
    
    //////
    @AuraEnabled
    public static void updateApplicationStatus(Id applicationId, String newStatus) {
        try {
            Application__c appToUpdate = [SELECT Id, Status__c FROM Application__c WHERE Id = :applicationId LIMIT 1];
            
            if (appToUpdate != null) {
                
                appToUpdate.Status__c = newStatus;
                
                
                update appToUpdate;
                emailsender(applicationId);
            } else {
                
                System.debug('Application record not found');
            }
        } catch (Exception e) {
            
            System.debug('Error updating status: ' + e.getMessage());
        }
        
        
        
        
        
    }
    public static void emailsender(Id applicationId) {
        try {
            Application__c application = [SELECT Id, Name, Status__c, First_Name__c, Last_Name__c, Email_Address__c FROM Application__c WHERE Id = :applicationId LIMIT 1];
            
            if (application.Email_Address__c != null) {
                // Retrieve linked products for the application
                List<application_catalog__c> linkedApplicationCatalogs = [
                    SELECT Product__r.Name, Product__r.Description,Product__r.ProductCode
                    FROM application_catalog__c
                    WHERE Application__c = :applicationId
                ];
                
                // Compose the email body with the product details
                String emailBody = 'Hello ' + application.First_Name__c + ' ' + application.Last_Name__c + ',\n\n';
                emailBody += 'Here are the details of your linked products:\n\n';
                
                for (application_catalog__c catalog : linkedApplicationCatalogs) {
                    if (catalog.Product__r != null) {
                        emailBody += 'Product Name: ' + catalog.Product__r.Name + '\n';
                        emailBody += 'ProductCode: ' + catalog.Product__r.ProductCode + '\n\n';
                        
                    }
                }
                
                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                mail.setToAddresses(new List<String>{application.Email_Address__c});
                mail.setSubject('Your Linked Product Details');
                mail.setPlainTextBody(emailBody);
                
                Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{mail});
            }
        } catch (Exception e) {
            System.debug('Error sending email: ' + e.getMessage());
        }
    }
    
    
    
    
    
    
}