public with sharing class AirlineCalendarController {
    @AuraEnabled
    public static void saveBooking(String name, Date departureDate, Date returnDate) {
        Airline_Booking__c booking = new Airline_Booking__c(
            Passenger_Name__c = name,
            Departure_Date__c = departureDate,
            Return_Date__c = returnDate
        );
        insert booking;
    }

    @AuraEnabled(cacheable=true)
    public static List<Airline_Booking__c> getBookings() {
        return [
            SELECT Passenger_Name__c, Departure_Date__c, Return_Date__c 
            FROM Airline_Booking__c
            ORDER BY CreatedDate DESC
            LIMIT 5
        ];
    }

}
