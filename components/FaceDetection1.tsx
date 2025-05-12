// components/FaceRecognition.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

type FaceDescriptor = Float32Array;
type FaceMatchResult = {
  user?: {
    id: string;
    name: string;
  };
  distance: number;
  matched: boolean;
};

export default function FaceRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recognitionStatus, setRecognitionStatus] = useState<string>('Loading models...');
  const [recognizedUser, setRecognizedUser] = useState<{name: string} | null>(null);
  const [recognitionComplete, setRecognitionComplete] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to send face descriptor to server
  const compareFaceDescriptor = async (descriptor: FaceDescriptor): Promise<FaceMatchResult> => {
    try {
      const response = await fetch('/api/face-recognition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ descriptor: Array.from(descriptor) }),
      });

      if (!response.ok) {
        throw new Error('Face recognition API error');
      }

      return await response.json();
    } catch (error) {
      console.error('Error comparing face:', error);
      return { distance: 0, matched: false };
    }
  };

  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setRecognitionComplete(true);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const loadModels = async () => {
      try {
        setRecognitionStatus('Loading face detection models...');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        
        setRecognitionStatus('Starting camera...');
        await startVideo();
      } catch (error) {
        console.error('Error loading models:', error);
        setRecognitionStatus('Error loading models');
      }
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setRecognitionStatus('Camera access denied');
      }
    };

    const onPlay = async () => {
      if (!videoRef.current || !canvasRef.current || recognitionComplete) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.width;
      canvas.height = video.height;

      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);

      let lastSentTime = 0;

      intervalId = setInterval(async () => {
        try {
          // Detect faces with landmarks and descriptors
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceDescriptors();

          if (detections.length > 0) {
            setRecognitionStatus('Face detected');
            
            // Get the first face's descriptor
            const currentDescriptor = detections[0].descriptor;
            
            // Only send to server every 2 seconds
            const now = Date.now();
            if (now - lastSentTime > 2000) {
              lastSentTime = now;
              const matchResult = await compareFaceDescriptor(currentDescriptor);
              
              if (matchResult.matched && matchResult.user) {
                setRecognizedUser({ name: matchResult.user.name });
                stopVideoStream(); // Stop stream on successful recognition
                clearInterval(intervalId);
                return;
              } else {
                setRecognizedUser(null);
              }
            }
          } else {
            setRecognitionStatus('No face detected');
            setRecognizedUser(null);
          }

          // Draw detections if not complete
          if (!recognitionComplete) {
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const context = canvas.getContext('2d');
            if (context) {
              context.clearRect(0, 0, canvas.width, canvas.height);
              faceapi.draw.drawDetections(canvas, resizedDetections);
              faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            }
          }
        } catch (error) {
          console.error('Detection error:', error);
        }
      }, 100);
    };

    if (!recognitionComplete) {
      loadModels();
    }

    const video = videoRef.current;
    if (video && !recognitionComplete) {
      video.addEventListener('play', onPlay);
    }

    return () => {
      clearInterval(intervalId);
      if (video) {
        video.removeEventListener('play', onPlay);
      }
      stopVideoStream();
    };
  }, [recognitionComplete]);

  if (recognitionComplete && recognizedUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h2>
          <p className="text-xl text-gray-600 mb-6">Hello, {recognizedUser.name}</p>
          <p className="text-gray-500">Face recognition successful</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="relative w-full max-w-3xl">
        {!recognitionComplete && (
          <>
            <video 
              ref={videoRef} 
              width={720} 
              height={560} 
              autoPlay 
              muted 
              playsInline
              className="w-full rounded-lg shadow-lg"
            />
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full rounded-lg"
            />
          </>
        )}

        <div className="mt-6 p-4 bg-white rounded-lg shadow-md w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-2">Recognition Status</h2>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              recognizedUser ? 'bg-green-500' : 
              recognitionStatus.includes('detected') ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>
            <p>{recognitionStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}