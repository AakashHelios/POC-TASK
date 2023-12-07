import getPlanProduct from '@salesforce/apex/deltadentalinsController.getPlanProduct';
import getPlans from '@salesforce/apex/deltadentalinsController.getPlans';
import getactivePlans from '@salesforce/apex/deltadentalinsController.getactivePlans';
import deltalogo from '@salesforce/resourceUrl/deltalogo';
import updateApplicationDetails from '@salesforce/apex/deltadentalinsController.updateApplicationDetails';

import icon1 from '@salesforce/resourceUrl/icon1';
import icon2 from '@salesforce/resourceUrl/icon2';
import icon3 from '@salesforce/resourceUrl/icon3';
import icon4 from '@salesforce/resourceUrl/icon4';
import static1 from '@salesforce/resourceUrl/static1';
import static2 from '@salesforce/resourceUrl/static2';
import static3 from '@salesforce/resourceUrl/static3';
import static4 from '@salesforce/resourceUrl/static4';
import { LightningElement, track, wire } from 'lwc';

export default class Deltadentalins extends LightningElement {
    @track numPeople = 1;
    @track futureDate;
    @track numberOfPlans;
    @track yearfuturedate;
    @track PlanProduct;
    @track showMailingAddress = false;
    plans ;
    BuyPlan=false;
    plansdetail= false;
    plansOption;
    plans=true;
    showform= false;
    shownumber=false;
    planOption=false;
    selectedPlanDetails = {};
    storedBirthDate = ''; 
    storedZipCode = ''; 
    Phvalue='cell';

    get genderoptions() {
        return [
            { label: 'Male', value: 'male' },
            { label: 'Female ', value: 'female' },
          
        ];
    }
  
   


    @wire(getPlans)
    wiredPlans({ error, data }) {
        if (data) {
            console.log('data',data);
            this.plans = { data };
        } else if (error) {
            this.plans = { error: error.body.message };
        }
    }
    @wire(getactivePlans)
    wiredPlansoptions({ error, data }) {
        if (data) {
            console.log('data',data);
            this.plansOption = { data };
        } else if (error) {
            this.plans = { error: error.body.message };
        }
    }
    @wire(getPlanProduct)
wiredPlanProduct({ error, data }) {
    if (data) {
        console.log('data', data);
        this.PlanProduct = { data };
    } else if (error) {
        this.PlanProduct = { error: error.body.message };
    }
}


connectedCallback() {
    const today = new Date();
    const futureMonth = today.getMonth() + 1; // Adding 1 to get next month
    const futureYear = today.getFullYear() + (futureMonth === 12 ? 1 : 0); // Increment year if next month is January
    const dateInFuture = new Date(futureYear, futureMonth % 12, 1); // Creating date object for the 1st day of the next month

    // Format the date (e.g., "Dec 1, 2023")
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDate = dateInFuture.toLocaleDateString('en-US', options);

    this.futureDate = formattedDate;
    this.calculateOneYearFromFutureDate(); 
}

calculateOneYearFromFutureDate() {
    const futureDate = new Date(this.futureDate);
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    // Format the calculated date (e.g., "Dec 1, 2024")
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDate = futureDate.toLocaleDateString('en-US', options);

    this.yearfuturedate = formattedDate;
}
firstback() {
    console.log('firstback clicked');
   
    

    
    // Redirect the current page to the desired URL
    window.location.href = 'https://hws3-dev-ed.develop.my.site.com/CP/s/';
}


secondback(){
    this.planOption=false;
    this.showform = true;
    console.log('storedBirthDate',this.storedBirthDate,'storedZipCode',this.storedZipCode);
}
thirdback(){
    this.plansdetail = false;
    this.planOption=true;
}
backfour(){
    this.BuyPlan=false;
    this.plansdetail = true;
}

get static1(){
    return static1;
}
get static4(){
    return static4;
}

get static2(){
    return static2;
}

get static3(){
    return static3;
}

    get deltalogo() {
        return deltalogo;
    }

    get icon1(){
        return icon1;
    }
    get icon2(){
        return icon2;
    }
    get icon3(){
        return icon3;
    }
    get icon4(){
        return icon4;
    }

    handleShopplans(){
        this.plans=false;
        this.showform= true;

    } 
  

    addNumber() {
        this.shownumber = true;
        this.numPeople++;
    }

    subtractNumber() {
        this.shownumber = false;
        if (this.numPeople > 1) {
            this.numPeople--;
        }
    }
    handleShopPlan(){
       
        const numberOfPlans = this.PlanProduct.data.length;
        console.log('Number of plans:', numberOfPlans);
        this.numberplan=numberOfPlans;
        
        this.showform= false;
        this.planOption=true;

        
    }
    handlePlandetails(){
        this.showform= false;
        this.planOption=false;
        this.plansdetail=true;
    }
    handlePlandetails(event) {
        const selectedPlanId = event.target.dataset.planId; 
        console.log('selectedPlanId',selectedPlanId);
            this.selectedplanproductid=selectedPlanId;
    
        const selectedPlan = this.PlanProduct.data.find(plan => plan.Id === selectedPlanId);
        console.log('selectedPlan',selectedPlan);
        if (selectedPlan) {
            this.selectedPlanDetails = {
                name: selectedPlan.Plan__r.Name,
                pname:selectedPlan.Name,
                description:selectedPlan.description__c,
                unitPrice: selectedPlan.Unit_Price__c,
                enrollmentFee: selectedPlan.Enrollment_fee__c
            };
            console.log('selectedPlanDetails',this.selectedPlanDetails);
            this.firstpayment=2*(selectedPlan.Unit_Price__c);
            this.totalpayment=(this.firstpayment+selectedPlan.Enrollment_fee__c);
            this.amount=(this.numPeople*selectedPlan.Unit_Price__c);
         
        }
    
        this.showform = false;
        this.planOption = false;
        this.plansdetail = true;
    }
    handleBuyPlan(){
        this.plansdetail = false;
        this.BuyPlan=true;
    }
   
    firstname(event){
        this.firstname=event.target.value;
    }
    middlename(event){
        this.middlename=event.target.value;
    }
    lastname(event){
        this.lastname=event.target.value;
    }
    handlegenderChange(event){
        this.gender=event.target.value;
    }
     handleDob(event) {
       
        this.storedBirthDate = event.target.value;
    }
    handleEmail(event){
        this.email=event.target.value;
    }

    handleZipCode(event) {
        
        this.storedZipCode = event.target.value;
    }

    handlePhoneNumberChange(event){
        this.Phvalue= event.detail.value;
    }


    createappplication(){
        console.log('-----------------',this.selectedplanproductid);
        updateApplicationDetails({ 
            email:this.email,
            firstName:this.firstname,
            lastName:this.lastname,
            dob:this.storedBirthDate, 
            zipCode:this.storedZipCode,
            gender:this.gender,
            selectedplanid:this.selectedplanproductid
            
            
           })  .then((result) => {
            let invoiceId = result; 
            console.log('invoiceId', invoiceId);
            let vfPageUrl = '/apex/detlapdf?id=' + invoiceId; 
            window.open(vfPageUrl, '_blank');
            console.log(result);
        })
        .catch((error) => {
          
            console.log(error);
           
        });
            
            
    }


    

    handlesubmit(){
        console.log("submit clicked");
        this.createappplication();
        
    }


    handleCheckbox(event) {
        this.showMailingAddress=true;
        //this.showMailingAddress = !event.target.checked;
    }

    

    



}