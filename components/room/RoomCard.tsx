"use client";

import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Image from "next/image";
import AmenityItem from "../AmentyItem";
import {
  AirVent,
  Bath,
  Bed,
  BedDouble,
  Castle,
  Divide,
  Home,
  Loader2,
  MountainSnow,
  Pencil,
  Plus,
  Ship,
  Trash,
  Trees,
  Tv,
  Users,
  UtensilsCrossed,
  VolumeX,
  Wand2,
  Wifi,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import AddRoomForm from "./AddRoomForm";
import { setSourceMapsEnabled } from "process";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { DatePickerWithRange } from "./DateRangePicker";
import { DateRange } from "react-day-picker";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { useAuth } from "@clerk/nextjs";
import useBookRoom from "@/hooks/useBookRoom";
import { db } from "@/firebaseConfig";
import { Hotel, Room, Booking } from "@/utils/firestoreHelpers";

interface RoomCardProps {
  hotel?: Hotel & {
    rooms: Room[];
  };
  room: Room;
  bookings?: Booking[];
}

const RoomCard = ({ hotel, room, bookings = [] }: RoomCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const [bookingIsLoading, setBookingIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { setRoomData, paymentIntentId, setClientSecret, setPaymentIntentId } =
    useBookRoom();
  const isHotelDetailsPage = pathname.includes("hotel-details");
  const [totalPrice, setTotalPrice] = useState(room.roomPrice);
  const [date, setDate] = useState<DateRange | undefined>();
  const [includeBreakFast, setIncludeBreakFast] = useState(false);
  const [days, setDays] = useState(1);
  const { userId } = useAuth();
  const isBookRoom = pathname.includes("book-room");

  useEffect(() => {
    if (date && date.from && date.to) {
      const dayCount = differenceInCalendarDays(date.to, date.from);
      setDays(dayCount);

      if (dayCount && room.roomPrice) {
        if (includeBreakFast && room.breakFastPrice) {
          setTotalPrice(
            dayCount * room.roomPrice + dayCount * room.breakFastPrice
          );
        } else {
          setTotalPrice(dayCount * room.roomPrice);
        }
      } else {
        setTotalPrice(room.roomPrice);
      }
    }
  }, [date, room.roomPrice, includeBreakFast]);

  const disabledDates = useMemo(() => {
    let dates: Date[] = [];

    console.log("Current bookings:", bookings);

    const roomBookings = bookings.filter(
      (booking) => booking.roomId == room.id && booking.paymentStatus
    );

    roomBookings.forEach((booking) => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);

      console.log(`Processing booking from ${startDate} to ${endDate}`);

      const range = eachDayOfInterval({
        start: startDate,
        end: endDate,
      });

      dates = [...dates, ...range];
    });

    console.log("Disabled Dates:", dates);
    return dates;
  }, [bookings, room.id]);

  const handleDialogueOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleRoomDelete = async (room: Room) => {
    setIsLoading(true);
    const imageKey = room.image.substring(room.image.lastIndexOf("/") + 1);

    try {
      await axios.post("/api/uploadthing/delete", { imageKey });

      await deleteDoc(doc(db, "rooms", room.id));

      router.refresh();
      toast({
        variant: "success",
        description: "Room Deleted!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookRoom = async () => {
    if (!userId) {
      return toast({
        variant: "destructive",
        description: "Oops! Make sure you are logged in.",
      });
    }

    if (!hotel?.userId) {
      return toast({
        variant: "destructive",
        description: "Something went wrong, refresh the page and try again!",
      });
    }

    if (date?.from && date?.to) {
      const newStartDate = new Date(date.from);
      const newEndDate = new Date(date.to);

      const hasOverlap = bookings.some((booking) => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);

        return (
          (newStartDate >= bookingStart && newStartDate <= bookingEnd) ||
          (newEndDate >= bookingStart && newEndDate <= bookingEnd) ||
          (newStartDate <= bookingStart && newEndDate >= bookingEnd)
        );
      });

      if (hasOverlap) {
        return toast({
          variant: "destructive",
          description:
            "The selected dates are already booked. Please choose another date.",
        });
      }

      setBookingIsLoading(true);
      const bookingRoomData = {
        room,
        totalPrice,
        breakFastIncluded: includeBreakFast,
        startDate: date.from,
        endDate: date.to,
      };
      setRoomData(bookingRoomData);

      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking: {
            hotelOwnerId: hotel.userId,
            hotelId: hotel.id,
            roomId: room.id,
            startDate: date.from,
            endDate: date.to,
            breakFastIncluded: includeBreakFast,
            totalPrice: totalPrice,
          },
          payment_intent_id: paymentIntentId,
        }),
      })
        .then((res) => {
          setBookingIsLoading(false);
          if (res.status === 401) {
            return router.push("/login");
          }
          return res.json();
        })
        .then((data) => {
          setClientSecret(data.paymentIntent.client_secret);
          setPaymentIntentId(data.paymentIntent.id);
          router.push("/book-room");
        })
        .catch((error) => {
          console.log("Error:", error);
          toast({
            variant: "destructive",
            description: `ERROR! ${error.message}`,
          });
        });
    } else {
      toast({
        variant: "destructive",
        description: "Oops! Select Date",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{room.title}</CardTitle>
        <CardDescription>{room.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="aspect-square overflow-hidden relative h-[200px] rounded-lg">
          <Image
            fill
            src={room.image}
            alt={room.title}
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 content-start text-sm">
          <AmenityItem>
            <Bed className="h-4 w-4" />
            {room.bedCount} Bed{"(s)"}
          </AmenityItem>
          <AmenityItem>
            <Users className="h-4 w-4" />
            {room.guestCount} Guest{"(s)"}
          </AmenityItem>
          <AmenityItem>
            <Bath className="h-4 w-4" />
            {room.bathRoomCount} Bathroom{"(s)"}
          </AmenityItem>
          {!!room.kingBed && (
            <AmenityItem>
              <BedDouble className="h-4 w-4" />
              {room.kingBed} King Bed{"(s)"}
            </AmenityItem>
          )}
          {!!room.queenBed && (
            <AmenityItem>
              <Bed className="h-4 w-4" />
              {room.queenBed} Queen Bed{"(s)"}
            </AmenityItem>
          )}
          {room.roomService && (
            <AmenityItem>
              <UtensilsCrossed className="h-4 w-4" />
              Room Service
            </AmenityItem>
          )}
          {room.TV && (
            <AmenityItem>
              <Tv className="h-4 w-4" />
              TV
            </AmenityItem>
          )}
          {room.balcony && (
            <AmenityItem>
              <Home className="h-4 w-4" />
              balcony
            </AmenityItem>
          )}
          {room.freeWifi && (
            <AmenityItem>
              <Wifi className="h-4 w-4" />
              Free Wifi
            </AmenityItem>
          )}
          {room.cityView && (
            <AmenityItem>
              <Castle className="h-4 w-4" />
              City View
            </AmenityItem>
          )}
          {room.oceanView && (
            <AmenityItem>
              <Ship className="h-4 w-4" />
              Ocean View
            </AmenityItem>
          )}
          {room.forestView && (
            <AmenityItem>
              <Trees className="h-4 w-4" />
              Forest View
            </AmenityItem>
          )}
          {room.mountView && (
            <AmenityItem>
              <MountainSnow className="h-4 w-4" />
              Mountain View
            </AmenityItem>
          )}
          {room.airCondition && (
            <AmenityItem>
              <AirVent className="h-4 w-4" />
              Air Condition
            </AmenityItem>
          )}
          {room.soundProofed && (
            <AmenityItem>
              <VolumeX className="h-4 w-4" />
              Sound Proofed
            </AmenityItem>
          )}
        </div>
        <Separator />
        <div className="felx gap-4 justify-between">
          <div>
            room Price: <span className="font-bold">${room.roomPrice}</span>
            <span className="text-xs"> /24hrs</span>
          </div>
          {!!room.breakFastPrice && (
            <div>
              Breakfast Price:{" "}
              <span className="font-bold">${room.breakFastPrice}</span>
            </div>
          )}
        </div>
        <Separator />
      </CardContent>

      {!isBookRoom && (
        <CardFooter>
          {isHotelDetailsPage ? (
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-2">
                  Select days yhat you will spend in this room
                </div>
                <DatePickerWithRange
                  date={date}
                  setDate={setDate}
                  disabledDates={disabledDates}
                />
              </div>
              {(room.breakFastPrice ?? 0) > 0 && (
                <div>
                  <div className="mb-2">
                    Do you want to be served breakfast each day
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="breakFast"
                      onCheckedChange={(value) => setIncludeBreakFast(!!value)}
                    />
                    <label htmlFor="breakFast" className="text-sm">
                      Include Breakfast
                    </label>
                  </div>
                </div>
              )}
              <div>
                Total Price: <span className="font-bold">${totalPrice}</span>{" "}
                for <span className="font-bold">{days} Days</span>
              </div>
              <Button
                onClick={() => handleBookRoom()}
                disabled={bookingIsLoading}
                type="button"
              >
                {bookingIsLoading ? (
                  <Loader2 className="mr-2 h-4 w-4" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {bookingIsLoading ? "Loading...." : "Book Room"}
              </Button>
            </div>
          ) : (
            <div className="flex w-full justify-between">
              <Button
                disabled={isLoading}
                type="button"
                variant="ghost"
                onClick={() => handleRoomDelete(room)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" /> Deleting ...
                  </>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" /> Detele
                  </>
                )}
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                  <Button
                    type="button"
                    variant="outline"
                    className="max-w-[150px]"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Update Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[900px] w-[90%]">
                  <DialogHeader className="px-2">
                    <DialogTitle>Update Room</DialogTitle>
                    <DialogDescription>
                      Make changes to this room.
                    </DialogDescription>
                  </DialogHeader>
                  <AddRoomForm
                    hotel={hotel}
                    room={room}
                    handleDialogueOpen={handleDialogueOpen}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default RoomCard;
