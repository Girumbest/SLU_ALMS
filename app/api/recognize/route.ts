import { NextApiRequest, NextApiResponse } from 'next';
import * as faceapi from 'face-api.js';

// In a real app, you would store these in a database
const KNOWN_FACES: {
  name: string;
  descriptors: faceapi.LabeledFaceDescriptors;
}[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { descriptor }: { descriptor: number[] } = req.body;

    if (!descriptor || descriptor.length !== 128) {
      return res.status(400).json({ message: 'Invalid face descriptor' });
    }

    // Convert the descriptor to Float32Array
    const float32Descriptor = new Float32Array(descriptor);

    // Find the best match
    let bestMatch: { name: string; distance: number } | null = null;
    const threshold = 0.6; // Adjust this threshold based on your needs

    for (const knownFace of KNOWN_FACES) {
      for (const knownDescriptor of knownFace.descriptors.descriptors) {
        const distance = faceapi.euclideanDistance(float32Descriptor, knownDescriptor);
        
        if (distance < threshold && (!bestMatch || distance < bestMatch.distance)) {
          bestMatch = {
            name: knownFace.descriptors.label,
            distance,
          };
        }
      }
    }

    if (bestMatch) {
      return res.status(200).json(bestMatch);
    } else {
      return res.status(404).json({ message: 'No matching face found' });
    }
  } catch (error) {
    console.error('Error recognizing face:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}