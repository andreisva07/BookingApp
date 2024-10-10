import { db } from "@/firebaseConfig";
import { Booking } from "@/utils/firestoreHelpers";
import { collection, getDocs, query, where } from "firebase/firestore";

export const getBookings = async (hotelId: string): Promise<Booking[]> => {
    try {
        const bookingsRef = collection(db, "bookings");

        const bookingsQuery = query(
            bookingsRef,
            where("hotelId", "==", hotelId)
        );

        const querySnapshot = await getDocs(bookingsQuery);

        const bookings: Booking[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log("Booking data:", data); 

            if (
                data.roomId &&
                data.userId &&
                data.startDate &&
                data.endDate &&
                data.paymentIntentId &&
                data.breakFastIncluded !== undefined &&
                data.totalPrice !== undefined
            ) {
                return {
                    id: doc.id,
                    roomId: data.roomId,
                    hotelId: data.hotelId,
                    userId: data.userId,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    bookedAt: new Date(data.bookedAt),
                    breakFastIncluded: data.breakFastIncluded,
                    totalPrice: data.totalPrice,
                    paymentStatus: data.paymentStatus || "Pending",
                } as Booking; 
            } else {
                console.warn(`Missing required fields in booking document: ${doc.id}`, data);
                return null;
            }
        }).filter((booking): booking is Booking => booking !== null);

        return bookings; 
    } catch (error: any) {
        console.error("Error fetching bookings:", error.message || error); 
        throw new Error("Failed to fetch bookings."); 
    }
};
