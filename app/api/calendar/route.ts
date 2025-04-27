import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, EventType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user?.role !== 'HRAdmin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const events = await prisma.calendar.findMany();
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Error fetching events' });
    }
  } else if (req.method === 'POST') {
    const { eventName, eventDate, isRecurring, eventType, description } = req.body;
    try {
      const newEvent = await prisma.calendar.create({
        data: {
          eventName,
          eventDate: new Date(eventDate),
          isRecurring,
          eventType,
          description,
        },
      });
      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Error creating event' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
