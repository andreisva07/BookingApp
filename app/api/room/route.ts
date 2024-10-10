import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId } = auth();

        if (!userId) {
            console.error("Unauthorized access attempt");
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { hotelId } = body;
        if (!hotelId) {
            return new NextResponse('Hotel ID is required', { status: 400 });
        }

        const roomRef = doc(db, 'rooms', `${userId}-${Date.now()}`);
        const roomData = {
            ...body,
            userId,
            createdAt: new Date(),
        };

        await setDoc(roomRef, roomData);

        const hotelRef = doc(db, 'hotels', hotelId);
        await updateDoc(hotelRef, {
            rooms: arrayUnion(roomRef.id), 
        });

        return NextResponse.json({ id: roomRef.id, ...roomData });
    } catch (error) {
        console.error('Error at /api/room POST', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}