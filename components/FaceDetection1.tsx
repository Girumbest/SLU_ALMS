"use client";

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceRecognitionProps {
  onSuccess: (userId: string) => void;
  onClose: () => void;
}

type FaceMatchResult = {
  user?: {
    id: string;
    name: string;
  };
  distance: number;
  matched: boolean;
};

export default function FaceRecognition({ onSuccess, onClose }: FaceRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recognitionStatus, setRecognitionStatus] = useState<string>('Loading models...');
  const [isRecognized, setIsRecognized] = useState(false);
  const [recognizedUser, setRecognizedUser] = useState<{id: string, name: string} | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to send face descriptor to server
  const compareFaceDescriptor = async (descriptor: Float32Array): Promise<FaceMatchResult> => {
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

      const data = await response.json();
      return data;
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
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const loadModels = async () => {
      try {
        setRecognitionStatus('Loading face detection models...');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setRecognitionStatus('Starting camera...');
        await startVideo();
      } catch (error) {
        console.error('Error loading models:', error);
        setRecognitionStatus('Error loading models');
      }
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 720, height: 560 } 
        });
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
      if (!videoRef.current || !canvasRef.current || isRecognized) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      let lastSentTime = 0;

      intervalId = setInterval(async () => {
        try {
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceDescriptors();

          if (detections.length > 0) {
            setRecognitionStatus('Face detected - verifying...');
            
            const currentDescriptor = detections[0].descriptor;
            const now = Date.now();
            
            if (now - lastSentTime > 2000) {
              lastSentTime = now;
              const matchResult = await compareFaceDescriptor(currentDescriptor);
              
              if (matchResult.matched && matchResult.user) {
                setRecognizedUser(matchResult.user);
                setIsRecognized(true);
                stopVideoStream();
                clearInterval(intervalId);
                onSuccess(matchResult.user.id);
                return;
              } else {
                setRecognitionStatus('Face not recognized');
              }
            }
          } else {
            setRecognitionStatus('No face detected');
          }

          // Draw detections if not recognized
          if (!isRecognized) {
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

    loadModels();

    const video = videoRef.current;
    if (video) {
      video.addEventListener('play', onPlay);
    }

    return () => {
      clearInterval(intervalId);
      if (video) {
        video.removeEventListener('play', onPlay);
      }
      stopVideoStream();
    };
  }, [isRecognized, onSuccess]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Face Recognition</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          {!isRecognized ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas 
                ref={canvasRef} 
                className="absolute top-0 left-0 w-full h-full"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-1">Successfully Recognized</h3>
              {recognizedUser && (
                <p className="text-gray-600">Welcome, {recognizedUser.name}</p>
              )}
              <button
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isRecognized ? 'bg-green-500' : 
              recognitionStatus.includes('detected') ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>
            <p className="text-sm">{recognitionStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}