import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import jqueryLib from '@salesforce/resourceUrl/jqueryLib';
import saveBooking from '@salesforce/apex/AirlineCalendarController.saveBooking';
import getBookings from '@salesforce/apex/AirlineCalendarController.getBookings';
import {wire} from 'lwc';

export default class AirlineCalendar extends LightningElement {
    @track passengerName = '';
    @track departureDate = '';
    @track returnDate = '';
    @track bookings = [];
    @track isRecordSaved = false;
    isLibLoaded = false;
    todayDate = new Date().toISOString().split('T')[0];
    returnMinDate = this.todayDate;

    @wire(getBookings)
    wiredBookings({ error, data }) {
        if (data) {
            this.bookings = data;
            console.log('Fetched bookings:', this.bookings);
        } else if (error) {
            console.error('Error fetching bookings:', error);
        }
    }

    renderedCallback() {
    if (this.isLibLoaded) {
        return;
    }
    this.isLibLoaded = true;

    Promise.all([
        loadScript(this, jqueryLib + '/jquery.min.js')
    ])
    .then(() => {
        console.log('✅ jQuery loaded');
        this.initializeCalendar();
        
    })
    .catch(error => {
        console.error('❌ Error loading jQuery', error);
    });
}


    initializeCalendar() {
    const $ = window.jQuery;

    const depDateEl = this.template.querySelector('[data-id="departureDate"]');
    const retDateEl = this.template.querySelector('[data-id="returnDate"]');

    if (depDateEl && retDateEl) {
        $(depDateEl).addClass('custom-date-picker');
        $(retDateEl).addClass('custom-date-picker');
    }
    console.log('Initializing date pickers');
}


    handleNameChange(event) {
        this.passengerName = event.target.value;
         console.log('Passenger name:', this.passengerName);
    }

    handleDepartureChange(event) {
        this.departureDate = event.target.value;
         console.log('Departure date:', this.departureDate);
         this.returnMinDate = this.departureDate;
    }

    handleReturnChange(event) {
        this.returnDate = event.target.value;
         console.log('Return date:', this.returnDate);
    }

    handleSave() {
        const today = new Date().toISOString().split('T')[0];
        if (this.departureDate < today) {
            alert('⚠️ Departure date cannot be before today.');
            return;
        }
        if (this.returnDate < this.departureDate) {
            alert('⚠️ Return date cannot be before departure date.');
            return;
        }
        console.log('Saving booking:', this.passengerName, this.departureDate, this.returnDate)

        if (!this.passengerName || !this.departureDate || !this.returnDate) {
            alert('⚠️ Please fill in all fields before booking.');
            return;
        }
        
        saveBooking({ 
            name: this.passengerName, 
            departureDate: this.departureDate, 
            returnDate: this.returnDate 
        })
        .then(() => {
            this.isRecordSaved = true;
            alert(`✅ Booking confirmed for ${this.passengerName} from ${this.departureDate} to ${this.returnDate}`);
        })
        .catch(error => {
            console.error('Error saving booking:', error);
            alert('❌ Error saving booking. Please try again.');
        });
    }
}
