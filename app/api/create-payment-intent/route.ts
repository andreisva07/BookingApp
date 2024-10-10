import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/firebaseConfig";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
    const user = await currentUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { booking, payment_intent_id } = body;

    if (!booking || !booking.totalPrice || !booking.hotelId || !booking.roomId) {
        return new NextResponse("Invalid booking data", { status: 400 });
    }

    const bookingData = {
        ...booking,
        userName: user.firstName,
        userEmail: user.emailAddresses[0].emailAddress,
        userId: user.id,
        currency: booking.currency || "usd",
        paymentIntentId: payment_intent_id,
    };

    try {
        let foundBooking;

        if (payment_intent_id) {
            const bookingRef = doc(db, 'bookings', payment_intent_id);
            foundBooking = await getDoc(bookingRef);

            if (foundBooking.exists() && foundBooking.data().userId === user.id) {
                const current_intent = await stripe.paymentIntents.retrieve(payment_intent_id);
                if (current_intent) {
                    const update_intent = await stripe.paymentIntents.update(payment_intent_id, {
                        amount: booking.totalPrice * 100,
                    });

                    await updateDoc(bookingRef, bookingData);
                    return NextResponse.json({ paymentIntent: update_intent });
                }
            }
        } else {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: booking.totalPrice * 100,
                currency: booking.currency || "usd",
                automatic_payment_methods: { enabled: true },
            });

            bookingData.paymentIntentId = paymentIntent.id;

            await setDoc(doc(db, 'bookings', paymentIntent.id), bookingData);

            return NextResponse.json({ paymentIntent });
        }
    } catch (error: any) {
        console.error('Error creating payment intent or booking:', error.message);
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
