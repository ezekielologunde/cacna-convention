export type Hotel = {
  name: string;
  city: "Chambersburg, PA" | "Gettysburg, PA" | "Hagerstown, MD";
  phone: string;
  ratePerNight: number;
  bookingNote: string;
};

export const hotels: Hotel[] = [
  { name: "Comfort Inn Greencastle", city: "Chambersburg, PA", phone: "717-798-3578", ratePerNight: 139, bookingNote: "Online booking available" },
  { name: "La Quinta", city: "Chambersburg, PA", phone: "717-446-0770", ratePerNight: 139, bookingNote: "Call hotel directly" },
  { name: "Super 8 By Wyndham I-81", city: "Chambersburg, PA", phone: "717-263-6655", ratePerNight: 75, bookingNote: "Call hotel directly" },
  { name: "Holiday Inn Express", city: "Chambersburg, PA", phone: "717-709-9009", ratePerNight: 141, bookingNote: "Online booking available" },
  { name: "Holiday Inn Express", city: "Gettysburg, PA", phone: "717-420-2686", ratePerNight: 189, bookingNote: "Online booking available" },
  { name: "Sleep Inn & Suites", city: "Gettysburg, PA", phone: "717-398-2670", ratePerNight: 129, bookingNote: "Call hotel directly" },
  { name: "Aspire Hotel", city: "Gettysburg, PA", phone: "717-321-3311", ratePerNight: 139, bookingNote: "Online booking available" },
  { name: "Hampton Inn", city: "Gettysburg, PA", phone: "717-338-9121", ratePerNight: 205, bookingNote: "Call hotel directly" },
  { name: "Eisenhower Hotel & Conference Center", city: "Gettysburg, PA", phone: "717-334-2755", ratePerNight: 139, bookingNote: "Online booking available" },
  { name: "Hampton Inn", city: "Hagerstown, MD", phone: "240-420-1970", ratePerNight: 139, bookingNote: "Online booking available" },
];

export const hotelGroupCode = "Christ Apostolic Church CACNA";
