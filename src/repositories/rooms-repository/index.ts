import { prisma } from '@/config';

async function findRoom(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
}

const roomsRepository = {
  findRoom,
};

export default roomsRepository;
