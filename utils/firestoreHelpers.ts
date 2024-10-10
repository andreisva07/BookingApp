
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export interface Room {
    id: string;
    title: string;
    description: string;
    image: string;
    roomPrice: number;
    breakFastPrice?: number;
    bedCount: number;
    guestCount: number;
    bathRoomCount: number;
    kingBed?: number;
    queenBed?: number;
    roomService?: boolean;
    TV?: boolean;
    balcony?: boolean; 
    freeWifi?: boolean; 
    cityView?: boolean; 
    oceanView?: boolean; 
    forestView?: boolean; 
    mountView?: boolean; 
    airCondition?: boolean; 
    soundProofed?: boolean; 
    hotelId?: string
}
export interface Hotel {
    id: string;
    userId: string;
    title: string;
    description: string;
    image: string;
    country: string; 
    state?: string;
    city?: string; 
    locationDescription: string; 
    gym?: boolean; 
    spa?: boolean; 
    bar?: boolean; 
    laundry?: boolean; 
    restaurant?: boolean; 
    shopping?: boolean; 
    freeParking?: boolean; 
    bikeRental?: boolean; 
    freeWifi?: boolean; 
    movieNights?: boolean; 
    swimmingPool?: boolean;
    coffeeShop?: boolean; 
    addedAt: Date; 
    updatedAt: Date; 
    rooms?: Room[];
    bookings?: Booking[]; 
}


export interface Booking {
    id: string;
    roomId: string;
    hotelId: string;
    userId: string;
    userName: string;
    userEmail: string;
    hotelOwnerId: string;
    startDate: Date;
    endDate: Date;
    breakFastIncluded: boolean;
    currency: string;
    totalPrice: number;
    paymentStatus?: boolean;
    paymentIntentId?: string;
    bookedAt: Date;
    Room?: Room | null;
    Hotel?: Hotel | null;
}

export async function getRoomData(roomId: string): Promise<Room | null> {
    const roomDocRef = doc(db, "rooms", roomId);
    const roomSnapshot = await getDoc(roomDocRef);
    return roomSnapshot.exists() ? { id: roomId, ...roomSnapshot.data() } as Room : null;
}

export async function getHotelData(hotelId: string): Promise<Hotel | null> {
    const hotelDocRef = doc(db, "hotels", hotelId);
    const hotelSnapshot = await getDoc(hotelDocRef);
    return hotelSnapshot.exists() ? { id: hotelId, ...hotelSnapshot.data() } as Hotel : null;
}

export async function getBookingData(bookingId: string): Promise<{ booking: Booking | null; hotel: Hotel | null; room: Room | null; } | null> {
    const bookingDocRef = doc(db, "bookings", bookingId);
    const bookingSnapshot = await getDoc(bookingDocRef);

    if (bookingSnapshot.exists()) {
        const bookingData = bookingSnapshot.data() as Booking;
        const hotelData = await getHotelData(bookingData.hotelId);
        const roomData = await getRoomData(bookingData.roomId);

        return {
            booking: {
                ...bookingData,
                id: bookingSnapshot.id,
            },
            hotel: hotelData,
            room: roomData,
        };
    } else {
        return null;
    }
}
