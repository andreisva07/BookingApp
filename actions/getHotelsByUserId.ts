import { HotelWithRooms } from "@/components/hotel/AddHotelForm"; // Ensure Room is imported if needed
import { db } from "@/firebaseConfig";
import { Room } from "@/utils/firestoreHelpers";
import { auth } from "@clerk/nextjs/server";
import { collection, query, where, getDocs } from "firebase/firestore";

export const getHotelsByUserId = async (): Promise<HotelWithRooms[]> => {
    try {
        const { userId } = auth();

        if (!userId) {
            throw new Error('Unauthorized');
        }

        const hotelsRef = collection(db, "hotels");

        const q = query(hotelsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const hotelPromises: Promise<HotelWithRooms>[] = querySnapshot.docs.map(async (doc) => {
            const data = doc.data();


            const rooms: Room[] = await getRoomsByHotelId(doc.id);

            return {
                id: doc.id,
                userId: data.userId,
                title: data.title,
                description: data.description,
                image: data.image,
                country: data.country,
                state: data.state,
                city: data.city,
                locationDescription: data.locationDescription,
                gym: data.gym,
                spa: data.spa,
                bar: data.bar,
                laundry: data.laundry,
                restaurant: data.restaurant,
                shopping: data.shopping,
                freeParking: data.freeParking,
                bikeRental: data.bikeRental,
                freeWifi: data.freeWifi,
                movieNights: data.movieNights,
                swimmingPool: data.swimmingPool,
                coffeeShop: data.coffeeShop,
                addedAt: data.addedAt ? data.addedAt.toDate().toISOString() : null,
                updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
                rooms: rooms || [] 
            } as HotelWithRooms;
        });

        const hotels: HotelWithRooms[] = await Promise.all(hotelPromises);

        return hotels;
    } catch (error: any) {
        console.error("Error fetching hotels:", error); 
        throw new Error(error);
    }
};
const getRoomsByHotelId = async (hotelId: string): Promise<Room[]> => {
    const roomsRef = collection(db, "rooms");
    const q = query(roomsRef, where("hotelId", "==", hotelId));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return [];
    }

    const rooms: Room[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            description: data.description,
            image: data.image,
            roomPrice: data.roomPrice,
            breakFastPrice: data.breakFastPrice || undefined, // Use undefined if not provided
            bedCount: data.bedCount,
            guestCount: data.guestCount,
            bathRoomCount: data.bathRoomCount,
            kingBed: data.kingBed || undefined,
            queenBed: data.queenBed || undefined,
            roomService: data.roomService || false, // Default to false if not provided
            TV: data.TV || false,
            balcony: data.balcony || false,
            freeWifi: data.freeWifi || false,
            cityView: data.cityView || false,
            oceanView: data.oceanView || false,
            forestView: data.forestView || false,
            mountView: data.mountView || false,
            airCondition: data.airCondition || false,
            soundProofed: data.soundProofed || false,
            hotelId: data.hotelId,
        } as Room;
    });


    return rooms;
};

