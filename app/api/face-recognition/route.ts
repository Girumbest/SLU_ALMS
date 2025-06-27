// app/api/face-recognition/route.ts
import { NextResponse } from 'next/server';
import { FaceMatcher, LabeledFaceDescriptors } from 'face-api.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { registerAttendanceByEmployee } from '@/features/hr-admin/actions';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session){// || session.user?.role !== "Employee") {
      return NextResponse.json(
        { 
          matched: false,
          distance: 0,
          message: "Unauthorized",
          user: null
        },
        { status: 401 }
      );
    }

    // Get employee data including face descriptor
    const employee = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: { 
        faceDescriptor: true,
        firstName: true,
        id: true
      },
    });

    if (!employee?.faceDescriptor) {
      return NextResponse.json(
        { 
          matched: false,
          distance: 0,
          message: "No face descriptor registered for this user",
          user: null
        },
        { status: 400 }
      );
    }

    // Parse request body
    const { descriptor } = await request.json();
    if (!descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json(
        { 
          matched: false,
          distance: 0,
          message: "Invalid face descriptor format",
          user: null
        },
        { status: 400 }
      );
    }

    // Convert stored descriptor to Float32Array
    const storedDescriptor = new Float32Array(employee.faceDescriptor);
    const inputDescriptor = new Float32Array(descriptor);

    // Create labeled face descriptors (required by FaceMatcher)
    const labeledDescriptors = new LabeledFaceDescriptors(
      session.user.id,
      [storedDescriptor]
    );

    // Create face matcher with the employee's descriptor
    const faceMatcher = new FaceMatcher([labeledDescriptors]);
    const bestMatch = faceMatcher.findBestMatch(inputDescriptor);
    const matched = bestMatch.distance < 0.5; // Adjust threshold as needed

    if (!matched) {
      return NextResponse.json(
        { 
          matched: false,
          distance: bestMatch.distance,
          message: "Face not recognized",
          user: null
        },
        { status: 200 }
      );
    }

    // Register attendance if matched
    const markAttendance = await registerAttendanceByEmployee(Number(session.user.id));
    console.log("attendance: ", markAttendance)
    const attendanceResult = {status: markAttendance.successMsg? "success" : "error", message: markAttendance?.errorMsg || "Attendance registered"}//await registerAttendanceByEmployee(session.user.id);

    // const attendanceResult = await registerAttendance(session.user.id, new Date());
    if (attendanceResult.status !== "success") {
      return NextResponse.json(
        { 
          matched: false,
          distance: bestMatch.distance,
          message: attendanceResult.message || "Failed to register attendance",
          user: null
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        matched: true,
        distance: bestMatch.distance,
        message: "Face recognized and attendance registered",
        user: {
          id: employee.id,
          name: employee.firstName
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Face recognition error:', error);
    return NextResponse.json(
      { 
        matched: false,
        distance: 0,
        message: 'Internal server error',
        user: null
      },
      { status: 500 }
    );
  }
}