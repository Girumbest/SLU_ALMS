import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user?.role !== 'HRAdmin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  const eventId = parseInt(id as string);

  if (req.method === 'PUT') {
    const { eventName, eventDate, isRecurring, eventType, description } = req.body;
    try {
      const updatedEvent = await prisma.calendar.update({
        where: { id: eventId },
        data: {
          eventName,
          eventDate: new Date(eventDate),
          isRecurring,
          eventType,
          description,
        },
      });
      res.status(200).json(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Error updating event' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.calendar.delete({
        where: { id: eventId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Error deleting event' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
