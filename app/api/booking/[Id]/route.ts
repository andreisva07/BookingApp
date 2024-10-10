import { doc, updateDoc, deleteDoc, getDocs, query, where, collection, getDoc } from "firebase/firestore"; // Firestore functions
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/firebaseConfig";
import { Booking, getRoomData } from "@/utils/firestoreHelpers";

export async function PATCH(req: Request, { params }: { params: { Id: string } }) {
    try {
        const { userId } = auth();

        if (!params.Id) {
            return new NextResponse('Payment Intent Id is required', { status: 400 });
        }

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const bookingRef = doc(db, 'bookings', params.Id);
        await updateDoc(bookingRef, { paymentStatus: true });

        const updatedBooking = await getDoc(bookingRef);
        if (!updatedBooking.exists()) {
            return new NextResponse('Booking not found', { status: 404 });
        }

        return NextResponse.json({ id: updatedBooking.id, ...updatedBooking.data() });
    } catch (error) {
        console.log('Error at /api/booking/Id PATCH', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { Id: string } }) {
    try {
        const { userId } = auth();

        if (!params.Id) {
            return new NextResponse('Booking Id is required', { status: 400 });
        }

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const bookingRef = doc(db, 'bookings', params.Id);
        await deleteDoc(bookingRef);

        return NextResponse.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.log('Error at /api/booking/Id DELETE', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
export async function GET(req: Request, { params }: { params: { Id: string } }) {
    try {
        const { userId } = auth();

        if (!params.Id) {
            return new NextResponse('Room Id is required', { status: 400 });
        }

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const bookingsRef = query(
            collection(db, 'bookings'),
            where('roomId', '==', params.Id)
        );

        const bookingSnapshot = await getDocs(bookingsRef);
        const bookings = bookingSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Booking[];

        const bookingsWithRoomData = await Promise.all(
            bookings.map(async (booking) => {
                const roomData = await getRoomData(booking.roomId);
                return {
                    ...booking,
                    room: roomData,
                };
            })
        );

        const filteredBookings = bookingsWithRoomData.filter(booking => {
            if (booking.paymentStatus === true && booking.room) {
                const endDate = booking.endDate as Date;
                return endDate > yesterday;
            }
            return false;
        });

        return NextResponse.json(filteredBookings);
    } catch (error) {
        console.log('Error at /api/booking/Id GET', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
