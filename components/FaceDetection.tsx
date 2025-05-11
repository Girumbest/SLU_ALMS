"use client"
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

type FaceDescriptor = number[];
type RecognitionResult = {
  name: string;
  distance: number;
};

export default function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [detectionActive, setDetectionActive] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);

  // Load models and start camera
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        setIsModelLoading(false);
        startCamera();
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const toggleFaceDetection = () => {
    if (detectionActive) {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }
    } else {
      detectionInterval.current = setInterval(detectFaces, 1000); // Check every second
    }
    setDetectionActive(!detectionActive);
  };

  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current || isModelLoading) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.width, height: video.height };

    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    // Clear previous drawings
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Draw detections
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

    if (detections.length > 0) {
      // Send the first face descriptor to the server for recognition
      const descriptor = detections[0].descriptor;
      console.log('Sending descriptor to server:', descriptor);
      alert("got descriptor line 101")
      recognizeFace(descriptor);
    } else {
      setRecognitionResult(null);
    }
  };

  const recognizeFace = async (descriptor: FaceDescriptor) => {
    try {
      const response = await axios.post('/api/recognize', { descriptor });
      setRecognitionResult(response.data);
    } catch (error) {
      console.error('Error recognizing face:', error);
      setRecognitionResult(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Face Recognition System</h1>
      
      <div className="relative mb-4">
        <video
          ref={videoRef}
          width="640"
          height="480"
          autoPlay
          muted
          playsInline
          className="rounded-lg shadow-lg"
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          className="absolute top-0 left-0 rounded-lg"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={toggleFaceDetection}
          disabled={isModelLoading}
          className={`px-4 py-2 rounded-lg font-medium ${
            detectionActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${isModelLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isModelLoading
            ? 'Loading Models...'
            : detectionActive
            ? 'Stop Detection'
            : 'Start Detection'}
        </button>
      </div>

      {recognitionResult && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Recognition Result</h2>
          <p className="text-gray-700">
            <span className="font-medium">Name:</span> {recognitionResult.name}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Confidence:</span>{' '}
            {(1 - recognitionResult.distance).toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
}