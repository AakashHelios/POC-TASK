import { LightningElement,wire,api } from 'lwc';
import getPlans from '@salesforce/apex/PlanController.getPlans';
import getApplicationByEmail from '@salesforce/apex/PlanController.getApplicationByEmail';
import updateApplicationDetails from '@salesforce/apex/PlanController.updateApplicationDetails';
import getproducts from '@salesforce/apex/PlanController.getproducts';
import storeApplicationCatalog from '@salesforce/apex/PlanController.storeApplicationCatalog';
import storeProductCatalog from '@salesforce/apex/PlanController.storeProductCatalog';
import getLinkedProducts from '@salesforce/apex/PlanController.getLinkedProducts';
import updateApplicationStatus from '@salesforce/apex/PlanController.updateApplicationStatus';





export default class Customer extends LightningElement {
    

// Initialize disableNextButton as true initially
disableNextButton = true;

   plans ;
    showQuoteDetails=false;
    showcatalogs=true;
    showPlans = true;
    email;
    firstName;
    lastName;
    DOB;
    zipCode;
    showform= true;
    selectedProducts = [];



    @wire(getPlans)
    wiredPlans({ error, data }) {
        if (data) {
            console.log('data',data);
            this.plans = { data };
        } else if (error) {
            this.plans = { error: error.body.message };
        }
    }


    @wire(getproducts, { email: '$email' })
wiredProducts({ error, data }) {
    if (data) {
        this.products = { data };
    } else if (error) {
        this.products = { error: error.body.message };
    }
}



// Modify the handleBack2 method to update the product list




    handleClick() {
        this.showform = false;
        this.showPlans = false;

    }
    handleEmailChange(event) {
        this.email = event.target.value;
        if (this.email) {
            this.retrieveApplication();
        } else {
            this.firstName = null;
            this.lastName = null;
        }
        this.validateFields();
    }
    handleBack(){
        this.showPlans = true;
        this.showform=true;
    }

    async retrieveApplication() {
        try {
            const application = await getApplicationByEmail({ email: this.email });
            if (application) {
                this.firstName = application.First_Name__c;
                this.lastName = application.Last_Name__c;
                this.zipCode= application.Zip_Code__c;
                this.dob=application.Date_of_Birth__c;
                this.validateFields();
                
                
            } else {
                this.firstName = null;
                this.lastName = null;
                this.zipCode=null;
                this.dob=null;
                this.validateFields();
                
            }
        } catch (error) {
           
        }
    }

    validateFields() {
        // Check if email, zipCode, and dob are not empty/null
        this.disableNextButton = !(this.email && this.zipCode && this.dob);

        if (this.dob) {
            const dobDate = new Date(this.dob);
            const today = new Date();
            const eighteenYearsAgo = new Date();
            eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    
            // Compare the entered date of birth with today's date minus 18 years
            if (dobDate > eighteenYearsAgo) {
                // If the person is less than 18 years old, disable the Next button
                this.disableNextButton = true;
            }
        }
    } 
    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.updateApplication();

    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
       this.updateApplication();
    }
    handlezipCode(event){
        this.zipCode = event.target.value;

        this.updateApplication();
        this.validateFields();
    }
    handleDob(event){
        this.dob = event.target.value;
        this.updateApplication();
        this.validateFields();
    }
    async updateApplication() {
        try {
            const applicationId = await updateApplicationDetails({
                email: this.email,
                firstName: this.firstName,
                lastName: this.lastName,
                zipCode: this.zipCode,
                dob: this.dob
            });
    
            if (applicationId) {
                this.applicationId = applicationId; // Store the Application ID
                console.log('Application ID:', this.applicationId);
                console.log('Record updated/created successfully!');
            } else {
                console.log('Error updating/creating record.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    
    
selectedProductId = null; 

handleCheckboxChange(event) {
    const clickedProductId = event.currentTarget.dataset.productId;

    if (this.selectedProductId !== clickedProductId) {
       
        const previousSelectedCheckbox = this.template.querySelector(`input[data-product-id="${this.selectedProductId}"]`);
        if (previousSelectedCheckbox) {
            previousSelectedCheckbox.checked = false;
        }

      
        event.currentTarget.checked = true;
        this.selectedProductId = clickedProductId;
        
    } else {
        
        event.currentTarget.checked = false;
        this.selectedProductId = null;
    }
}




    NextApplication(event){
        //this.showPlans=true;
        this.showform = true;
        this.showcatalogs=false;
        
        this.updateApplication();
    }

    
    handleBack2() {
        this.showcatalogs = false;
        this.showQuoteDetails = false;
    
        if (this.email) {
            this.showform = true;
    
            // Fetch products based on the email
            getproducts({ email: this.email })
                .then(result => {
                    if (result ) {
                        // Update the products list with the newly fetched data
                        this.products = { data: result};
                        // Perform any additional handling or UI updates
                    } else if (result && result.error) {
                        // Handle errors if necessary
                    }
                })
                .catch(error => {
                    // Handle errors here
                });
        }
    }
    
    
    

        handlecatalogsBack(){
            this.showform=false;
            this.showcatalogs=true;

        }
        
    
       
        

        async handleGetQuote() {
          
            this.showcatalogs = true;
           
            this.forproductCatalog();
            this.showQuoteDetails = true;
          
            try {
                const linkedProducts = await this.fetchLinkedProducts(this.email);
                console.log('linkedProducts:', linkedProducts.length); 
        
                if (linkedProducts && linkedProducts.length > 0) {
                    this.selectedProducts = linkedProducts;
                   
                    console.log('selectedProducts Linked Products:', this.selectedProducts);
                } else {
                    console.error('No linked products found');
                }
            } catch (error) {
                console.error('Error fetching linked products:', error);
            }
        }



        
async fetchLinkedProducts(email) {
    await this.forapplicationCatalog();
    try {
        const result = await getLinkedProducts({ email });
        
        console.log('fetchLinkedProducts result:', result);
        return result;
      
    } catch (error) {
        console.error('Error during data fetch:', error);
        throw error;
    }

}


async forapplicationCatalog() {
    try {
        if (this.products && this.products.data && this.selectedProductId) {
            const selectedProduct = this.products.data.find(product => product.Id === this.selectedProductId);
           console.log('forapplicationCatalog selectedProduct',selectedProduct);
            const result = await storeApplicationCatalog({
                applicationId: this.applicationId,
                selectedProductId: this.selectedProductId,
                selectedName:selectedProduct.Name,
            });

            if (result) {
                console.log('Application catalog stored successfully!');
            } else {
                console.log('Error storing application catalog.');
            }
        } else {
            console.error('Products data or selected product ID not available.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async forproductCatalog() {
    try {
        if (this.products && this.products.data && this.selectedProductId) {
            // Find the selected product from the products data
            const selectedProduct = this.products.data.find(product => product.Id === this.selectedProductId);

            console.log('selectedProduct',selectedProduct);
            console.log('selectedProduct.name',selectedProduct.Name);
            console.log('selectedProduct.Description',selectedProduct.ProductCode);

            if (selectedProduct && selectedProduct.Name ) {
                const result = await storeProductCatalog({
                    selectedProductId: this.selectedProductId,
                    productProductCode: selectedProduct.ProductCode,
                    productpricebook:selectedProduct.PriceBook,
                    productName: selectedProduct.Name,
                    productDescription:selectedProduct.Description,
                   
                });

                if (result) {
                    console.log('Product catalog stored successfully!');
                    console.log(' this.selectedProductId', this.selectedProductId, ' selectedProduct.Name',selectedProduct.Name);
                } else {
                    console.error('Error storing product catalog.');
                }
            } 
        } else {
            console.error('Products data or selected product ID not available.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


handleSubmit(){
 console.log('button is clicked');
this.handleUpdateStatus()
}
handleUpdateStatus() {
    updateApplicationStatus({ applicationId: this.applicationId, newStatus: 'Quote requested' })
        .then(result => {
            console.log('handle submit application id',this.applicationId);
            console.log('Application status updated successfully: ', result);
            
        })
        .catch(error => {
            // Handle error
            console.error('Error updating application status: ', error);
            // Optionally, you can display an error message to the user
        });
}


}
