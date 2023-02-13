import bookingRepository from '@/repositories/booking-repository';
import hotelsService from '@/services/hotels-service';
import roomsRepository from '@/repositories/rooms-repository'
import { notFoundError } from '@/errors';
import { Room } from '@prisma/client';

async function getBooking(userId: number) {
  const bookingExists = await bookingRepository.findBookingByUserId(userId);
  if (!bookingExists) {
    throw notFoundError();
  }
  const booking = await bookingRepository.getBooking(userId);

  return booking;
}

async function postBooking(userId: number, roomId: number) {
  await hotelsService.listHotels(userId);
  const room = await toCheckRoomExists(roomId);

  const bookingByUserId = await bookingRepository.getBookingByUserId(userId);

  if (bookingByUserId) {
    throw { name: 'Forbidden', message: 'Already exists booking' };
  }

  await toCheckCapacity(roomId, room);

  return await bookingRepository.bookRoom(roomId, userId);
}
async function updateBooking(userId: number, roomId: number, bookingId: number) {
  const bookingById = await bookingRepository.getBookingById(bookingId);

  if (!bookingById) {
    throw { name: 'Forbidden', message: 'No booking found' }; 
  }
  const room = await toCheckRoomExists(roomId);

  await toCheckCapacity(roomId, room);

  await bookingRepository.updateBooking(roomId, userId);

  return bookingById;
}

async function toCheckCapacity(roomId: number, room: Room) {
  const bookingsByRoomId = await bookingRepository.getBookingsByRoomId(roomId);

  const bookingsLength = bookingsByRoomId?.length;

  const roomCurrentCapacity = room?.capacity - bookingsLength;

  if (!roomCurrentCapacity) {
    throw { name: 'Forbidden', message: 'The room has reach full capacity' };
  }
}

async function toCheckRoomExists(roomId: number) {
  const room = await roomsRepository.findRoom(roomId);
  if (!room) {
    throw notFoundError();
  }
  return room;
}

const bookingService = {
  getBooking,
  postBooking,
  updateBooking,
};

export default bookingService;
