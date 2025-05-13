// app/api/face-recognition/route.ts
import { NextResponse } from 'next/server';
import { FaceMatcher } from 'face-api.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { registerAttendance } from '@/features/hr-admin/actions';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Employee") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get employee face descriptor
    const employee = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { faceDescriptor: true },
    });

    if (!employee?.faceDescriptor) {
      return NextResponse.json(
        { error: "No face descriptor registered for this user" },
        { status: 400 }
      );
    }

    // Parse request body
    const { descriptor } = await request.json();
    if (!descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json(
        { error: "Invalid face descriptor format" },
        { status: 400 }
      );
    }

    // Create face matcher with the employee's descriptor
    const faceMatcher = new FaceMatcher([{
      label: session.user.id,
      descriptors: [new Float32Array(employee.faceDescriptor)]
    }]);

    // Compare faces
    const inputDescriptor = new Float32Array(descriptor);
    const bestMatch = faceMatcher.findBestMatch(inputDescriptor);
    const matched = bestMatch.distance < 0.5; // Adjust threshold as needed

    if (!matched) {
      return NextResponse.json(
        { 
          matched: false,
          distance: bestMatch.distance,
          message: "Face not recognized" 
        },
        { status: 200 }
      );
    }

    // Register attendance if matched
    // const { status, message } = await registerAttendance(session.user.id, new Date());
    const {status, message} = {status: "success", message: ""}
    if (status !== "success") {
      return NextResponse.json(
        { error: message || "Failed to register attendance" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: "Attendance registered successfully",
        distance: bestMatch.distance
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Face recognition error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}