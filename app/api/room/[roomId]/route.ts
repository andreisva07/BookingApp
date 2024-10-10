import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "@/firebaseConfig";

// PATCH method to update a room
export async function PATCH(req: Request, { params }: { params: { roomId: string } }) {
    try {
        const body = await req.json();
        const { userId } = auth();

        if (!params.roomId) {
            return new NextResponse('Room Id is required', { status: 400 });
        }

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const roomRef = doc(db, 'rooms', params.roomId);
        await updateDoc(roomRef, body);

        const updatedRoom = await getDoc(roomRef);
        return NextResponse.json({ id: updatedRoom.id, ...updatedRoom.data() });
    } catch (error) {
        console.log('Error at /api/room/[roomId] PATCH', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { roomId: string } }) {
    try {
        const { userId } = auth();

        if (!params.roomId) {
            return new NextResponse('Room Id is required', { status: 400 });
        }

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const roomRef = doc(db, 'rooms', params.roomId);
        await deleteDoc(roomRef);

        return NextResponse.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.log('Error at /api/room/[roomId] DELETE', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
