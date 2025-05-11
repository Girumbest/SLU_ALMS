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
    const { name, descriptors }: { name: string; descriptors: number[][] } = req.body;

    if (!name || !descriptors || descriptors.length === 0) {
      return res.status(400).json({ message: 'Name and descriptors are required' });
    }

    // Convert descriptors to Float32Array
    const float32Descriptors = descriptors.map(desc => new Float32Array(desc));

    // Check if the name already exists
    const existingIndex = KNOWN_FACES.findIndex(face => face.descriptors.label === name);
    
    if (existingIndex >= 0) {
      // Update existing descriptors
      KNOWN_FACES[existingIndex].descriptors.descriptors = float32Descriptors;
    } else {
      // Add new face
      KNOWN_FACES.push({
        name,
        descriptors: new faceapi.LabeledFaceDescriptors(name, float32Descriptors),
      });
    }

    return res.status(200).json({ message: 'Face added successfully' });
  } catch (error) {
    console.error('Error adding face:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}