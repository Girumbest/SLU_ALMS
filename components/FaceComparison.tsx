"use client";
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function FaceComparison() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [result, setResult] = useState<{ isMatch: boolean; distance: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Load models to begin');
  const img1Ref = useRef<HTMLImageElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);

  // Load models on component mount
  useEffect(() => {
    async function loadModels() {
      try {
        setStatus('Loading models...');
        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        setStatus('Models loaded. Select two images to compare faces.');
      } catch (error) {
        console.error('Error loading models:', error);
        setStatus('Error loading models. Check console for details.');
      }
    }

    loadModels();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImage: (value: string | null) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const compareFaces = async () => {
    if (!img1Ref.current || !img2Ref.current || !modelsLoaded) return;

    setLoading(true);
    setStatus('Processing images...');

    try {
      // Detect faces and get descriptors
      const detections1 = await faceapi
        .detectAllFaces(img1Ref.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const detections2 = await faceapi
        .detectAllFaces(img2Ref.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections1.length === 0 || detections2.length === 0) {
        setStatus('Could not detect faces in one or both images');
        setResult(null);
        return;
      }

      // Compare the first face from each image
      const distance = faceapi.euclideanDistance(
        detections1[0].descriptor,
        detections2[0].descriptor
      );

      const isMatch = distance < 0.6; // Threshold for match
      setResult({ isMatch, distance });
      setStatus(isMatch ? 'Faces match!' : 'Faces do not match');
    } catch (error) {
      console.error('Error comparing faces:', error);
      setStatus('Error comparing faces. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Face Comparison</h1>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2 text-center">{status}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Image 1</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setImage1)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              disabled={!modelsLoaded || loading}
            />
            {image1 && (
              <div className="mt-2 relative">
                <img
                  ref={img1Ref}
                  src={image1}
                  alt="First face"
                  className="w-full h-auto rounded border border-gray-200"
                  crossOrigin="anonymous"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Image 2</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setImage2)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              disabled={!modelsLoaded || loading}
            />
            {image2 && (
              <div className="mt-2 relative">
                <img
                  ref={img2Ref}
                  src={image2}
                  alt="Second face"
                  className="w-full h-auto rounded border border-gray-200"
                  crossOrigin="anonymous"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={compareFaces}
            disabled={!image1 || !image2 || !modelsLoaded || loading}
            className={`px-4 py-2 rounded-md text-white font-medium
              ${(!image1 || !image2 || !modelsLoaded || loading)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Processing...' : 'Compare Faces'}
          </button>
        </div>

        {result && (
          <div className={`mt-6 p-4 rounded-md ${result.isMatch ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`font-medium ${result.isMatch ? 'text-green-800' : 'text-red-800'}`}>
              {result.isMatch ? '✅ Faces match!' : '❌ Faces do not match'}
            </p>
            <p className="text-sm mt-1">
              Distance: {result.distance.toFixed(4)} (threshold: 0.6)
            </p>
            <p className="text-xs mt-2">
              Lower distance means more similar faces. Values below 0.6 are considered a match.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}