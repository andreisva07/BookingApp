import { HotelWithRooms } from "@/components/hotel/AddHotelForm";
import { db } from "@/firebaseConfig";
import { Room } from "@/utils/firestoreHelpers";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

export const getHotelById = async (hotelId: string): Promise<HotelWithRooms | null> => {
    try {
        const hotelRef = doc(db, "hotels", hotelId);
        const hotelSnap = await getDoc(hotelRef);

        if (!hotelSnap.exists()) {
            return null;
        }

        const data = hotelSnap.data();

        const roomsRef = collection(db, "rooms");
        const roomQuery = query(roomsRef, where("hotelId", "==", hotelId));
        const roomsSnap = await getDocs(roomQuery);

        if (roomsSnap.empty) {
            console.log(`No rooms found for hotel ID: ${hotelId}`);
        } else {
            console.log(`Found ${roomsSnap.size} rooms for hotel ID: ${hotelId}`);
        }

        // Map the fetched rooms
        const rooms: Room[] = roomsSnap.docs.map((doc) => {
            const roomData = doc.data();
            return {
                id: doc.id,
                title: roomData.title,
                description: roomData.description,
                image: roomData.image || "",
                roomPrice: roomData.roomPrice,
                breakFastPrice: roomData.breakFastPrice || 0,
                bedCount: roomData.bedCount,
                guestCount: roomData.guestCount,
                bathRoomCount: roomData.bathRoomCount,
                kingBed: roomData.kingBed || false,
                queenBed: roomData.queenBed || false,
                roomService: roomData.roomService || false,
                TV: roomData.TV || false,
                balcony: roomData.balcony || false,
                freeWifi: roomData.freeWifi || false,
                cityView: roomData.cityView || false,
                oceanView: roomData.oceanView || false,
                forestView: roomData.forestView || false,
                mountView: roomData.mountView || false,
                airCondition: roomData.airCondition || false,
                soundProofed: roomData.soundProofed || false,
                hotelId: roomData.hotelId,
            } as Room;
        });

        return {
            id: hotelSnap.id,
            userId: data?.userId ?? "",
            title: data?.title ?? "Untitled",
            description: data?.description ?? "",
            locationDescription: data?.locationDescription ?? "",
            image: data?.image ?? "",
            country: data?.country ?? "",
            state: data?.state ?? "", 
            city: data?.city ?? "", 
            swimmingPool: data?.swimmingPool ?? false, 
            gym: data?.gym ?? false, 
            spa: data?.spa ?? false, 
            bar: data?.bar ?? false, 
            laundry: data?.laundry ?? false, 
            restaurant: data?.restaurant ?? false, 
            shopping: data?.shopping ?? false, 
            freeParking: data?.freeParking ?? false,
            movieNights: data?.movieNights ?? false,
            coffeeShop: data?.coffeeShop ?? false,
            rooms: rooms || [],
        } as HotelWithRooms;
    } catch (error: any) {
        console.error("Error fetching hotel:", error);
        throw new Error(error);
    }
};
