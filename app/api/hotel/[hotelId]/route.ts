import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { doc, updateDoc, deleteDoc, getDoc, query, collection, getDocs, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Room } from "@/utils/firestoreHelpers";
import { HotelWithRooms } from "@/components/hotel/AddHotelForm";

export async function PATCH(req: Request, { params }: { params: { hotelId: string } }) {
    try {
        const body = await req.json();
        const { userId } = auth();

        if (!params.hotelId) {
            return new NextResponse('Hotel Id is required', { status: 400 });
        }

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const hotelRef = doc(db, 'hotels', params.hotelId);
        await updateDoc(hotelRef, {
            title: body.title,
            description: body.description,
            image: body.image,
        });

        const roomQuery = query(collection(db, 'rooms'), where('hotelId', '==', params.hotelId));
        const roomDocs = await getDocs(roomQuery);
        const roomUpdates = body.rooms || [];

        const roomUpdatesPromises = roomDocs.docs.map(async (roomDoc) => {
            const roomId = roomDoc.id;
            const updatedRoomData = roomUpdates.find((room: Room) => room.id === roomId);

            if (updatedRoomData) {
                await updateDoc(doc(db, 'rooms', roomId), {
                    ...updatedRoomData,
                });
            }
        });

        await Promise.all(roomUpdatesPromises);

        const updatedHotelSnapshot = await getDoc(hotelRef);

        if (!updatedHotelSnapshot.exists()) {
            return new NextResponse('Hotel not found', { status: 404 });
        }

        const updatedHotelData = updatedHotelSnapshot.data();

        const updatedRooms: Room[] = roomDocs.docs.map(roomDoc => {
            const roomData = roomDoc.data();
            return {
                id: roomDoc.id,
                title: roomData.title,
                description: roomData.description,
                image: roomData.image ?? "",
                roomPrice: roomData.roomPrice,
                breakFastPrice: roomData.breakFastPrice ?? 0,
                bedCount: roomData.bedCount,
                guestCount: roomData.guestCount,
                bathRoomCount: roomData.bathRoomCount,
                kingBed: roomData.kingBed ?? false,
                queenBed: roomData.queenBed ?? false,
                roomService: roomData.roomService ?? false,
                TV: roomData.TV ?? false,
                balcony: roomData.balcony ?? false,
                freeWifi: roomData.freeWifi ?? false,
                cityView: roomData.cityView ?? false,
                oceanView: roomData.oceanView ?? false,
                forestView: roomData.forestView ?? false,
                mountView: roomData.mountView ?? false,
                airCondition: roomData.airCondition ?? false,
                soundProofed: roomData.soundProofed ?? false,
                hotelId: roomData.hotelId,
            } as Room;
        });

        const hotelWithRooms: HotelWithRooms = {
            id: updatedHotelSnapshot.id,
            userId: updatedHotelData.userId,
            title: updatedHotelData.title,
            description: updatedHotelData.description,
            image: updatedHotelData.image,
            country: updatedHotelData.country,
            locationDescription: updatedHotelData.locationDescription,
            addedAt: updatedHotelData.addedAt,
            updatedAt: updatedHotelData.updatedAt,
            rooms: updatedRooms,
        };

        return NextResponse.json(hotelWithRooms);
    } catch (error) {
        console.error('Error at /api/hotel/[hotelId] PATCH', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}


export async function DELETE(req: Request, { params }: { params: { hotelId: string } }) {
    try {
        const { userId } = auth();

        if (!params.hotelId) {
            return new NextResponse('Hotel Id is required', { status: 400 });
        }

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const hotelRef = doc(db, 'hotels', params.hotelId);
        const hotelSnapshot = await getDoc(hotelRef);
        const hotelData = hotelSnapshot.data();

        await deleteDoc(hotelRef);

        return NextResponse.json({ message: 'Hotel deleted successfully', hotel: { id: hotelSnapshot.id, ...hotelData } });
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
