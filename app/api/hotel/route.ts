import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId } = auth();

        if (!userId) {
            console.error("Unauthorized access attempt");
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const hotelRef = doc(db, 'hotels', `${userId}-${Date.now()}`);
        const hotelData = {
            ...body,
            userId,
            createdAt: new Date(),
        };

        await setDoc(hotelRef, hotelData);

        return NextResponse.json({ id: hotelRef.id, ...hotelData });
    } catch (error) {
        console.error('Error at /api/hotel POST', error);

        return new NextResponse('Internal Server Error', { status: 500 });
    }
}