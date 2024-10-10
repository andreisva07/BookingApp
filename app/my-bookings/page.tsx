import { getBookingsByHotelOwnerId } from "@/actions/getBookingsByHotelOwnerId";
import { getBookingsByUserId } from "@/actions/getBookingsByUserId";
import MyBookingClient from "@/components/booking/MyBookingsClient";
import {
  getRoomData,
  getHotelData,
  Booking,
  Room,
  Hotel,
} from "@/utils/firestoreHelpers";

const MyBookings = async () => {
  const bookingsFromVisitors = await getBookingsByHotelOwnerId();
  const bookingsIHaveMade = await getBookingsByUserId();

  const enrichBookings = async (
    bookings: Booking[]
  ): Promise<(Booking & { Room: Room | null; Hotel: Hotel | null })[]> => {
    return Promise.all(
      bookings.map(async (booking) => {
        const room = await getRoomData(booking.roomId);
        const hotel = await getHotelData(booking.hotelId);
        return { ...booking, Room: room, Hotel: hotel };
      })
    );
  };

  const enrichedBookingsFromVisitors = bookingsFromVisitors
    ? await enrichBookings(bookingsFromVisitors)
    : null;
  const enrichedBookingsIHaveMade = bookingsIHaveMade
    ? await enrichBookings(bookingsIHaveMade)
    : null;

  if (!enrichedBookingsFromVisitors || !enrichedBookingsIHaveMade)
    return <div>No bookings found</div>;

  return (
    <div className="flex flex-col gap-10">
      {!!enrichedBookingsIHaveMade?.length && (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-6 mt-2">
            Here are bookings you have made
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {enrichedBookingsIHaveMade.map((booking) => (
              <MyBookingClient key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}
      {!!enrichedBookingsFromVisitors?.length && (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-6 mt-2">
            Here are bookings visitors have made on your properties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {enrichedBookingsFromVisitors.map((booking) => (
              <MyBookingClient key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
