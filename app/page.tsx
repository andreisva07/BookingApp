import { getHotels } from "@/actions/getHotels";
import { HotelWithRooms } from "@/components/hotel/AddHotelForm";
import HotelList from "@/components/hotel/HotelList";
import { Button } from "@/components/ui/button";

interface HomeProps {
  searchParams: {
    title?: string;
    country?: string;
    state?: string;
    city?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const hotels: HotelWithRooms[] | null = await getHotels(searchParams);

  if (!hotels || hotels.length === 0) {
    return <div>No hotels found . . .</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">Available Hotels</h2>
      <HotelList hotels={hotels} />
    </div>
  );
}
