"use client";

import { HotelWithRooms } from "./AddHotelForm";
import useLocation from "@/hooks/useLocation";
import Image from "next/image";
import AmenityItem from "../AmentyItem";
import {
  Car,
  Clapperboard,
  Dumbbell,
  MapPin,
  ShoppingBasket,
  Utensils,
  Wine,
} from "lucide-react";
import { FaSpa, FaSwimmer } from "react-icons/fa";
import { MdDryCleaning } from "react-icons/md";
import RoomCard from "../room/RoomCard";
import { Booking, Room } from "@/utils/firestoreHelpers";

const HotelDetailsClient = ({
  hotel,
  bookings,
}: {
  hotel: HotelWithRooms;
  bookings?: Booking[];
}) => {
  const { getCountryByCode, getStateByCode } = useLocation();
  const country = getCountryByCode(hotel.country);
  const state = getStateByCode(hotel.country, hotel.state ?? "");
  return (
    <div className="flex flex-col gap-6 pb-2">
      <div className="aspect-square overflow-hidden relative w-full h-[200px] md:h-[400px] rounded-lg">
        <Image
          fill
          src={hotel.image}
          alt={hotel.title}
          className="object-cover"
        />
      </div>
      <div>
        <h3 className="font-semibold text-xl md:text-3xl">{hotel.title}</h3>
        <div className="font-semibold mt-4">
          <AmenityItem>
            <MapPin className="h-4 w-4" /> {country?.name},{state?.name},
            {hotel.city}{" "}
          </AmenityItem>
        </div>
        <h3 className="font-semibold text-lg mt-4 mb-2">Location Details</h3>
        <p className="text-pretty/90 mb-2">{hotel.locationDescription}</p>
        <h3 className="font-semibold text-lg mt-4 mb-2">About this hotel</h3>
        <p className="text-pretty/90 mb-2">{hotel.description}</p>
        <h3 className="font-semibold text-lg mt-4 mb-2">Popular Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 content-start text-sm">
          {hotel.swimmingPool && (
            <AmenityItem>
              <FaSwimmer size={20} />
              Pool
            </AmenityItem>
          )}
          {hotel.gym && (
            <AmenityItem>
              <Dumbbell className="w-4 h-4" />
              Gym
            </AmenityItem>
          )}
          {hotel.spa && (
            <AmenityItem>
              <FaSpa size={20} />
              Spa
            </AmenityItem>
          )}
          {hotel.bar && (
            <AmenityItem>
              <Wine className="w-4 h-4" />
              Bar
            </AmenityItem>
          )}
          {hotel.laundry && (
            <AmenityItem>
              <MdDryCleaning size={20} />
              Laundry Facilities
            </AmenityItem>
          )}
          {hotel.restaurant && (
            <AmenityItem>
              <Utensils className="w-4 h-4" />
              Restaurant
            </AmenityItem>
          )}
          {hotel.shopping && (
            <AmenityItem>
              <ShoppingBasket className="w-4 h-4" />
              Shopping
            </AmenityItem>
          )}
          {hotel.freeParking && (
            <AmenityItem>
              <Car className="w-4 h-4" />
              Free Parking
            </AmenityItem>
          )}
          {hotel.movieNights && (
            <AmenityItem>
              <Clapperboard className="w-4 h-4" />
              Movie Nights
            </AmenityItem>
          )}
          {hotel.coffeeShop && (
            <AmenityItem>
              <Wine className="w-4 h-4" />
              Coffee Shop
            </AmenityItem>
          )}
        </div>
      </div>
      <div>
        {!!hotel.rooms.length && (
          <div>
            <h3 className="text-lg font-semibold my-4">Hotel Rooms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {hotel.rooms.map((room: Room) => {
                return (
                  <RoomCard
                    hotel={hotel}
                    room={room}
                    key={room.id}
                    bookings={bookings}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelDetailsClient;
