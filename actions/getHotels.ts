import { HotelWithRooms } from "@/components/hotel/AddHotelForm";
import { db } from "@/firebaseConfig";
import { Hotel, Room } from "@/utils/firestoreHelpers";
import { collection, query, where, getDocs, startAt, endAt, orderBy, QueryConstraint } from "firebase/firestore";

export const getHotels = async (searchParams: { title?: string; country?: string; state?: string; city?: string; }): Promise<HotelWithRooms[]> => {
  const hotelsRef = collection(db, "hotels");
  const conditions: QueryConstraint[] = [];

  // Modificare pentru a permite căutarea parțială pe titlu
  if (searchParams.title) {
    const searchTerm = searchParams.title;
    conditions.push(orderBy("title"));
    conditions.push(startAt(searchTerm));
    conditions.push(endAt(searchTerm + "\uf8ff"));  // Folosește endAt pentru a face matching parțial
  }

  if (searchParams.country) {
    conditions.push(where("country", "==", searchParams.country));
  }
  if (searchParams.state) {
    conditions.push(where("state", "==", searchParams.state));
  }
  if (searchParams.city) {
    conditions.push(where("city", "==", searchParams.city));
  }

  const hotelsQuery = query(hotelsRef, ...conditions);

  try {
    const querySnapshot = await getDocs(hotelsQuery);
    const hotelsWithRooms: HotelWithRooms[] = [];

    // Fetch pentru datele fiecarui hotel si camerelor asociate 
    for (const doc of querySnapshot.docs) {
      const hotelData = { id: doc.id, ...doc.data() } as Hotel;

      // Fetch pentru camerele hotelului curent
      const roomsRef = collection(db, "rooms");
      const roomsQuery = query(roomsRef, where("hotelId", "==", doc.id));
      const roomsSnapshot = await getDocs(roomsQuery);

      const rooms = roomsSnapshot.docs.map(roomDoc => {
        const roomData = roomDoc.data();
        return {
          id: roomDoc.id,
          title: roomData.title,
          description: roomData.description,
          image: roomData.image ?? "",
          roomPrice: roomData.roomPrice,
          breakFastPrice: roomData.breakFastPrice,
          bedCount: roomData.bedCount,
          guestCount: roomData.guestCount,
          bathRoomCount: roomData.bathRoomCount,
          kingBed: roomData.kingBed,
          queenBed: roomData.queenBed,
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
        ...hotelData,
        rooms,
      };

      hotelsWithRooms.push(hotelWithRooms);
    }

    return hotelsWithRooms;
  } catch (error) {
    console.error("Error fetching hotels:", error);
    throw new Error("Failed to fetch hotels.");
  }
};
