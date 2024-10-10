import { db } from "@/firebaseConfig";
import { auth } from "@clerk/nextjs/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Booking } from "@/utils/firestoreHelpers";

export const getBookingsByUserId = async (): Promise<Booking[] | null> => {
    try {
        const { userId } = auth();

        if (!userId) {
            throw new Error('Unauthorized');
        }

        const bookingsRef = collection(db, "bookings");

        const bookingsQuery = query(
            bookingsRef,
            where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(bookingsQuery);

        const bookings: Booking[] = querySnapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                roomId: data.roomId || '',
                hotelId: data.hotelId || '',
                userId: data.userId || userId,
                userName: data.userName || '',
                userEmail: data.userEmail || '',
                hotelOwnerId: data.hotelOwnerId || '',
                startDate: data.startDate as Date,
                endDate: data.endDate as Date,
                bookedAt: data.bookedAt as Date,
                breakFastIncluded: data.breakFastIncluded ?? false,
                currency: data.currency || 'USD',
                totalPrice: data.totalPrice ?? 0,
                paymentIntentId: data.paymentIntentId || '',
                paymentStatus: data.paymentStatus ?? false,
            } as Booking;
        });

        if (bookings.length === 0) return null;

        return bookings;
    } catch (error: any) {
        console.log(error);
        throw new Error(error);
    }
};
