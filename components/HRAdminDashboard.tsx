"use client"
import React, { useEffect, useState } from 'react';
import { FaUsers, FaBuilding, FaClock, FaCheckCircle, FaTimesCircle, FaList } from 'react-icons/fa';
import { getDashboardSummary } from '@/features/hr-admin/actions';
import { PropagateLoader } from 'react-spinners';

interface DashboardSummary {
  totalEmployees: number;
  totalDepartments: number;
  pendingLeaveRequests: number;
  approvedLeaveRequests: number;
  rejectedLeaveRequests: number;
  totalLeaveTypes: number;
}

const HRAdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PropagateLoader color="#2563eb" size={20} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-8">
        Error: {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-gray-500 text-center mt-8">
        No data available.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">HR Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Employees"
          value={summary.totalEmployees}
          icon={FaUsers}
          color="bg-blue-500"
        />
        <DashboardCard
          title="Total Departments"
          value={summary.totalDepartments}
          icon={FaBuilding}
          color="bg-green-500"
        />
        <DashboardCard
          title="Pending Leave Requests"
          value={summary.pendingLeaveRequests}
          icon={FaClock}
          color="bg-yellow-500"
        />
        <DashboardCard
          title="Approved Leave Requests"
          value={summary.approvedLeaveRequests}
          icon={FaCheckCircle}
          color="bg-indigo-500"
        />
        <DashboardCard
          title="Rejected Leave Requests"
          value={summary.rejectedLeaveRequests}
          icon={FaTimesCircle}
          color="bg-red-500"
        />
        <DashboardCard
          title="Total Leave Types"
          value={summary.totalLeaveTypes}
          icon={FaList}
          color="bg-purple-500"
        />
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
  const Icon = icon;
  return (
    <div className={`${color} text-white rounded-lg shadow-md p-6 flex items-center`}>
      <div className="mr-4">
        <Icon size={32} />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
    </div>
  );
};

export default HRAdminDashboard;
