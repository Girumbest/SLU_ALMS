"use client";
import { useEffect, useRef, useState, useActionState, useTransition } from "react";
import { FaUser, FaPhone, FaEnvelope, FaLock, FaBriefcase, FaUniversity, FaUpload, FaDollarSign, FaCalendarAlt, FaAddressBook, FaWallet, FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";

import { createUser } from "../../actions";
import { UserFormState } from "../../types";
import "../../styles/EmployeeForm.css";
import toast from "react-hot-toast";

import SearchableDropdown from "@/components/SearchableDropdown";
import { generatePassword, generateUsername } from "@/utils/generate";
import { getDepartments } from "@/lib/db-ops";
import { loadFaceAPIModels, loadImageFromFile } from "@/lib/face-api-init";
import * as faceapi from 'face-api.js';
import { ClipLoader } from "react-spinners";
import CameraCapture from "@/components/CameraCapture";


const initialState: UserFormState = {}

export default function EmployeeRegisterForm({departments}: {departments: {name:string, id:string}[]}) {

  const [state, formAction] = useActionState(createUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

// use isPending instead of `useFormStatus().pending`
  const [isPending, startTransition] = useTransition();

  //Used for setting generated username(from fname & lname)
  const fnameRef = useRef<HTMLInputElement>(null);
  const lnameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  //for eye icon
  const [isHiddenPassword, setIsHiddenPassword] = useState(true);
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoSource, setPhotoSource] = useState<'upload' | 'camera'>('upload');
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null); // New state

  useEffect(()=>{
    console.log(state.errors)
    if(state.successMsg){
      toast.success(state.successMsg)
      // Request the form to reset once the action has completed
      formRef.current?.reset();
    }else if(state.errorMsg){
      toast.error(state.errorMsg)
    }
  },[state]);

  const imgRef = useRef<HTMLImageElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isDetectingFace, setIsDetectingFace] = useState(false);
  // useEffect(() => {
  //   async function loadModels() {
  //     try {
  //       await loadFaceAPIModels();
  //       console.log("Face API models loaded successfully on the client!");
  //       setModelsLoaded(true);
  //     } catch (error) {
  //       console.error("Failed to load Face API models:", error);
  //       toast.error("Failed to load Face API models. Please try again later.");
  //     }
  //   }

  //   loadModels();
  // }, []);
  useEffect(() => {
    async function loadModels() {
      try {
        // setStatus('Loading models...');
        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        // setStatus('Models loaded. Select two images to compare faces.');
      } catch (error) {
        console.error('Error loading models:', error);
        // setStatus('Error loading models. Check console for details.');
      }
    }

    loadModels();
  }, []);
  // const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) setPhotoPreview(URL.createObjectURL(file));
  // };
  //---------------------------------------

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setCapturedPhoto(file); // Store the File object
      setPhotoSource('upload');
    }
  };
  const [openCanvas, setOpenCanvas] = useState(false);
  const handleCapture = (blob: Blob) => {
    const file = new File([blob], "captured_photo.jpg", { type: "image/jpeg" }); // Create a File object
    setPhotoPreview(URL.createObjectURL(file));
    setCapturedPhoto(file); // Store the File object
    setPhotoSource('camera');
    setOpenCanvas(false); // Hide the canvas after capturing
  };
  
  const togglePhotoSource = () => {
    setPhotoSource(prevSource => (prevSource === 'upload' ? 'camera' : 'upload'));
    setPhotoPreview(null);
    setCapturedPhoto(null); // Clear the captured photo when toggling
  };
  //---------------------------------------

  const getFaceDescription = async (photographFile: File) => {
    let faceDescriptor: number[] | null = null;

    try {
      setIsDetectingFace(true);
      // Convert the File to an HTMLImageElement
      // const img = await loadImageFromFile(photographFile);
      console.log("started detecting...")
      // Detect faces in the image
      const detections = await faceapi
        .detectAllFaces(imgRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();
      console.log("finished detecting...")

      // Check if exactly one face is detected
      if (detections.length === 0) {
        toast.error("No face detected in the photograph. Please upload a photo with a visible face.");
        return null;
      }
      if (detections.length > 1) {
        toast.error("Multiple faces detected in the photograph. Please upload a photo with a single visible face.");
        return null;
      }

      // Get the face descriptor (convert Float32Array to regular array for storage)
      faceDescriptor = Array.from(detections[0].descriptor);
    } catch (error: any) {
      console.error("Face detection error:", error);
      let errorMessage = "An error occurred during face detection. Please try again with a different photograph.";
      if (error.message.includes("Failed to fetch")) { // Example of more specific error handling
        errorMessage = "Failed to load the image. Please check the image file and try again.";
      }
      toast.error(errorMessage);
      return null;
    } finally {
      setIsDetectingFace(false);
    }
  
    return faceDescriptor;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form reset
    const formData = new FormData(e.currentTarget);

    // Use the capturedPhoto state if available, otherwise get from input
    const photograph = capturedPhoto || formData.get('photograph');

    if (photograph instanceof File && photograph.size > 0) {
      const faceDescriptor = await getFaceDescription(photograph);
      if(faceDescriptor){
        formData.set('faceDescriptor', JSON.stringify(faceDescriptor));
        formData.set('photograph', photograph); // Ensure the File object is in formData
      }
      else{
        toast.error("Face detection failed. Please upload a photo with a clear, single face.");
        return;
      }
    } else {
      toast.error("Please provide a photograph.");
      return;
    }

    //If not selected set the file type to '' for zod validation / Normalize empty file inputs
    if(!(formData.get("cv") as File).size) formData.set("cv","")
    startTransition(async () => {
      console.log('Submitting...')
      await formAction(formData);
    });

  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-10 rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Employee Registration</h2>

      <form onSubmit={handleSubmit} ref={formRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Info Section */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1">Personal Information</h3>
        </div>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input ref={fnameRef} name="firstName" placeholder="First Name" className="input" required pattern="[a-zA-Z]+" title="Enter a valid name" onChange={e =>{ 
            // set username with the genarated one. 
            usernameRef.current!.value = generateUsername(e.target.value, lnameRef.current?.value)}}/>
          {state.errors?.firstName && <p className="text-red-500 text-sm error-message">{state.errors.firstName[0]}</p>}
        </div>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input ref={lnameRef} name="lastName" placeholder="Last Name" className="input" pattern="[a-zA-Z]+" title="Enter a valid name" required onChange={e =>{
            // set username with the genarated one. 
            usernameRef.current!.value = generateUsername(fnameRef.current?.value, e.target.value)}}/>
          {state.errors?.lastName && <p className="text-red-500 text-sm error-message">{state.errors.lastName [0]}</p>}
        </div>

        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input ref={usernameRef} name="username" placeholder="Username" className="input" pattern="[a-zA-Z0-9_]+" title="Enter valid username" required />
          {state.errors?.username && <p className="text-red-500 text-sm error-message">{state.errors.username [0]}</p>}
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input type={isHiddenPassword ? "password" : "text"} name="password" placeholder="Password" className="input" required onFocus={ e => e.target.value = generatePassword()}/>
          {isHiddenPassword ? <FaEye className="absolute right-3 text-gray-500 cursor-pointer" onClick={()=>setIsHiddenPassword(false)}/> : <FaEyeSlash className="absolute right-3 text-gray-500 cursor-pointer" onClick={()=>setIsHiddenPassword(true)}/>}
          {state.errors?.password && <p className="text-red-500 text-sm error-message">{state.errors.password [0]}</p>}
        </div>

        <div className="input-group">
          <FaPhone className="input-icon" />
          <input type="tel" name="phoneNumber" placeholder="Phone Number" className="input" />
          {state.errors?.phoneNumber && <p className="text-red-500 text-sm error-message">{state.errors.phoneNumber [0]}</p>}
        </div>

        <div className="input-group">
          <FaCalendarAlt className="input-icon" />
          <input type="date" name="dateOfBirth" className="input" title="Date of Birth" required />
          {state.errors?.dateOfBirth && <p className="text-red-500 text-sm error-message">{state.errors.dateOfBirth [0]}</p>}
        </div>

        {/*----------------*/}

        <div className="input-group">
          <FaAddressBook className="input-icon" />
          <input name="address" placeholder="Address" className="input" required />
          {state.errors?.address && <p className="text-red-500 text-sm error-message">{state.errors.address [0]}</p>}
        </div>
        
        <div className="input-group">
          <FaPhone className="input-icon" />
          <input name="emergencyContactPhone" placeholder="Emergency Contact Number" className="input" required />
          {state.errors?.emergencyContactPhone && <p className="text-red-500 text-sm error-message">{state.errors.emergencyContactPhone [0]}</p>}
        </div>
        {/*----------------*/}
        <div className="input-group">
        <select name="gender" className="input bg-white" required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {state.errors?.gender && <p className="text-red-500 text-sm !-bottom-10 error-message">{state.errors.gender [0]}</p>}
        </div>

        <div className="input-group">
        <select name="maritalStatus" className="input bg-white">
          <option value="">Marital Status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
        </select>
        {state.errors?.maritalStatus && <p className="text-red-500 text-sm !-bottom-14 error-message">{state.errors.maritalStatus [0]}</p>}
        </div>

        {/* Employment Info Section */}
        <div className="col-span-1 md:col-span-2 mt-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1">Employment Information</h3>
        </div>

        <div className="input-group">
          <FaBriefcase className="input-icon" />
          <input name="jobTitle" placeholder="Job Title" className="input" />
          {state.errors?.jobTitle && <p className="text-red-500 text-sm error-message">{state.errors.jobTitle [0]}</p>}
        </div>
        {/* ----------------- */}
        <div className="input-group">
          <FaCalendarAlt className="input-icon" />
          <input type="date" name="hireDate" className="input" required title="Hire Date"/>
          {state.errors?.hireDate && <p className="text-red-500 text-sm error-message">{state.errors.hireDate [0]}</p>}
        </div>
        <div className="input-group">
          <FaDollarSign className="input-icon" />
          <input type="number" name="salary" placeholder="Salary" className="input" required />
          {state.errors?.salary && <p className="text-red-500 text-sm error-message">{state.errors.salary [0]}</p>}
        </div>
        
        {/* ----------------- */}
        <div className="input-group">
        <select name="positionLevel" className="input bg-white">
          <option value="">Select Position Level</option>
          <option value="Junior">Junior</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>
        {state.errors?.positionLevel && <p className="text-red-500 text-sm !-bottom-10 error-message">{state.errors.positionLevel [0]}</p>}
        </div>
        <div className="input-group">
          <FaWallet className="input-icon" />
          <input name="directDepositInfo" placeholder="Direct Deposit Info" className="input" />
          {state.errors?.directDepositInfo && <p className="text-red-500 text-sm error-message">{state.errors.directDepositInfo [0]}</p>}
        </div>
        {/* <div className="input-group">
        <select name="department" className="input bg-white">
          <option value="">Select Department</option>
          <option value="HR">HR</option>
          <option value="Engineering">Engineering</option>
        </select>
        {state.errors?.department && <p className="text-red-500 text-sm !-bottom-10 error-message">{state.errors.department [0]}</p>}
        </div> */}
        <div className="relative">
        <SearchableDropdown options={departments} inputElementName={"department"} title={"Select Department"} />
        {state.errors?.department && <p className="text-red-500 text-sm absolute top-100p left-2.5">{state.errors.department [0]}</p>}
        </div>

      <div className="input-group">
        <select name="role" className="input bg-white">
          <option value="">Select Role</option>
          <option value="Employee">Employee</option>
          <option value="Supervisor">Supervisor</option>
        </select>
        {state.errors?.role && <p className="text-red-500 text-sm !-bottom-10 error-message">{state.errors.role [0]}</p>}
      </div>
        {/* <div className="input-group">
          <FaUniversity className="input-icon" />
          <input name="educationalLevel" placeholder="Education Level" className="input" />
        </div> */}
        <div className="input-group">
        <select name="educationalLevel" className="input bg-white">
          <option value="">Education Level</option>
          <option value="Diploma">Diploma</option>
          <option value="Bachelor">Bachelor</option>
          <option value="Master">Master</option>
          <option value="PhD">PhD</option>
        </select>
        {state.errors?.educationalLevel && <p className="text-red-500 text-sm !-bottom-10 error-message">{state.errors.educationalLevel [0]}</p>}
        </div>


        {/* Photograph Upload */}
        <div className="col-span-1 md:col-span-2">
          <label className="font-semibold text-gray-700 flex items-center">
            {photoSource === 'upload' ? (
              <>
                <FaUpload className="mr-2 text-blue-600" /> Upload Photograph:
              </>
            ) : (
              <>
                <FaCamera className="mr-2 text-blue-600" /> Take Photograph:
              </>
            )}
          </label>
          <button
            type="button"
            onClick={togglePhotoSource}
            className="col-span-1 bg-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm hover:bg-gray-400 transition"
          >
            {photoSource === 'upload' ? 'Use Camera' : 'Upload'}
          </button>
          {photoSource === 'upload' ? (
            <input
              type="file"
              disabled={!modelsLoaded}
              accept="image/*"
              name="photograph"
              onChange={handlePhotoChange}
              className="input mt-2 bg-white"
            />
          ) : (
            <CameraCapture onCapture={handleCapture} />
          )}
          {photoPreview && (
            <img
              src={photoPreview}
              ref={imgRef}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover mt-2"
            />
          )}
          {state.errors?.photograph && (
            <p className="text-red-500 text-sm error-message">
              {state.errors.photograph[0]}
            </p>
          )}
        </div>


        {/* CV Upload */}
        <div className="col-span-1 md:col-span-2">
          <label className="font-semibold text-gray-700 flex items-center">
            <FaUpload className="mr-2 text-blue-600" /> Upload CV (PDF):
          </label>
          <input type="file" accept="application/pdf" name="cv" className="input mt-2 bg-white" />
        </div>

        <button type="submit" disabled={isPending || isDetectingFace} className="col-span-1 md:col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center" >
          <ClipLoader color="#fff" loading={isPending || isDetectingFace} size={20} />
          <span className="ml-2">{isDetectingFace ? "Detecting Face..." : isPending ? "Submitting..." : "Submit"}</span>
        </button>

         {/* Success Message */}
         {/* {state.success && <p className="text-green-600 text-center col-span-2">{state.success}</p>} */}
      </form>
    </div>
  );
}
