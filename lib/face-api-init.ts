// src/lib/face-api-init.ts (Client-side only)
import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadFaceAPIModels() {
  if (modelsLoaded) return;

  try {
    console.log('Loading client-side face-api.js models...');
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    modelsLoaded = true;
  } catch (err) {
    console.error('Client-side model loading failed:', err);
    throw err;
  }
}


export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}