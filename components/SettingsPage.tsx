"use client"
import { getSettings, saveSettings } from '@/features/hr-admin/actions';
import { Setting } from '@/features/hr-admin/types';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ClipLoader, PropagateLoader } from 'react-spinners';


const Settings = () => {

   const [settings, setSettings] = useState<Setting[]>([]);
   const [dataLoading, setDataLoading] = useState<boolean>(true);
   const [loading, setLoading] = useState<boolean>(false);

useEffect(() => {
  getSettings().then((data) => {
    // Find the attendance_time setting
    const attendanceTimeSetting = data.settings?.find(
      (setting) => setting.key === 'attendance_time'
    );
    // Filter out all other settings except attendance_time
    const otherSettings = data.settings?.filter(
      (setting) => setting.key !== 'attendance_time'
    ) as Setting[];
    // Combine them with attendance_time first
    const reorderedSettings = attendanceTimeSetting
      ? [attendanceTimeSetting, ...otherSettings]
      : [...otherSettings]; // fallback in case attendance_time doesn't exist

    setSettings(reorderedSettings as Setting[]);
    setDataLoading(false);
  });
}, []);

  const handleToggle = (key: string) => {
    setSettings((prevSettings) =>
      prevSettings.map((setting) =>
        setting.key === key ? { ...setting, value: setting.value === 'true' ? 'false' : 'true' } : setting
      )
    );
    // In a real app, you would also send the updated setting to your backend.
  };

  const handleTimeChange = (key:string, timeType:string, timeOfDay:string, value) => {
    setSettings((prevSettings) =>
      prevSettings.map((setting) => {
        if (setting.key === key) {
          const newValue = {
            ...JSON.parse(setting.value),
            [timeType]: {
              ...JSON.parse(setting.value)[timeType],
              [timeOfDay]: value,
            },
          };
          return { ...setting, value: JSON.stringify(newValue)};
        }
        return setting;
      })
    );
    // In a real app, you would also send the updated setting to your backend.
  };

  const handleSave = async () => {
    setLoading(true);
    
    const response = await saveSettings(settings);
    if (response?.successMsg) {
      toast.success(response?.successMsg);
    } else {
      toast.success(response?.errorMsg);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="text-center">
        <PropagateLoader 
            loading={dataLoading}
            color="#2563eb"
            cssOverride={{
            display: 'block',
            margin: '0 auto',
            }} 
        />   
        </div>
      {settings.map((setting) => (
        <div key={setting.key} className="mb-4 p-4 border rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">{setting.key}</h2>
              <p className="text-gray-600">{setting.description}</p>
            </div>
            {setting.type === 'BOOLEAN' && (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  checked={setting.value === 'true'}
                  onChange={() => handleToggle(setting.key)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            )}
          </div>
          {setting.type === 'JSON' && setting.key === 'attendance_time' && (
            <div className="mt-4">
              <h3 className="font-semibold">Check-in Times</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Morning:
                  </label>
                  <input
                    type="time"
                    value={JSON.parse(setting.value).check_in.morning}//{setting.value.check_in.morning}
                    onChange={(e) =>
                      handleTimeChange(
                        setting.key,
                        'check_in',
                        'morning',
                        e.target.value
                      )
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Afternoon:
                  </label>
                  <input
                    type="time"
                    value={JSON.parse(setting.value).check_in.afternoon}//{setting.value.check_in.afternoon}
                    onChange={(e) =>
                      handleTimeChange(
                        setting.key,
                        'check_in',
                        'afternoon',
                        e.target.value
                      )
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
              <h3 className="font-semibold mt-4">Check-out Times</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Morning:
                  </label>
                  <input
                    type="time"
                    value={JSON.parse(setting.value).check_out.morning}//{setting.value.check_out.morning}
                    onChange={(e) =>
                      handleTimeChange(
                        setting.key,
                        'check_out',
                        'morning',
                        e.target.value
                      )
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Afternoon:
                  </label>
                  <input
                    type="time"
                    value={JSON.parse(setting.value).check_out.afternoon}//{setting.value.check_out.afternoon}
                    onChange={(e) =>
                      handleTimeChange(
                        setting.key,
                        'check_out',
                        'afternoon',
                        e.target.value
                      )
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {!dataLoading &&
      <button 
        onClick={() => handleSave()}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            {!loading && "Save Settings"}
            <ClipLoader 
            loading={loading}
            color="#fff"
            cssOverride={{
                display: 'block',
                margin: '0 auto',
            }}
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
            />
      </button>
        }
    </div>
  );
};

export default Settings;
