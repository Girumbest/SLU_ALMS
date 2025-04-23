import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCross, FaTimesCircle } from "react-icons/fa";

interface DateRangePickerProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  style?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onDateRangeChange, style }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const togglePicker = () => {
    setIsPickerVisible(!isPickerVisible);
  };

  // Update the main input value whenever startDate or endDate changes
  const getDisplayValue = () => {
    if (!startDate ) return "All";
    return `${startDate} - ${endDate}`;
  };

  // Invoke the callback whenever startDate or endDate changes
  // useEffect(() => {
  //   onDateRangeChange(startDate, endDate);
  // }, [startDate, endDate, onDateRangeChange]);

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          type="text"
          ref={inputRef}
          value={getDisplayValue()} // Use value instead of defaultValue
          onClick={togglePicker}
          readOnly // Make the input read-only to prevent manual text input
          className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
        />
        {!(startDate || endDate) ?
        <FaChevronDown
          className="input-icon absolute right-2 text-gray-500 cursor-pointer w-2.5 h-2.5"
          onClick={togglePicker}
        />
        : <FaTimesCircle 
        className="input-icon absolute right-2 text-gray-500 cursor-pointer w-4 h-4"
        onClick={e => {setStartDate(""); setEndDate(""); onDateRangeChange("", "")}}
        />}
      </div>
      {isPickerVisible && (
        <div className={`absolute z-10 mt-2 w-65 right-0 rounded-md bg-white shadow-lg ${style}`}>
          <div className="p-4">
            <div className="flex justify-between">
              <input
                type="date"
                value={startDate} // Use value instead of defaultValue
                onChange={(e) => {setStartDate(e.target.value); onDateRangeChange(e.target.value, endDate);}}
                className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <span className="mx-2">to</span>
              <input
                type="date"
                value={endDate} // Use value instead of defaultValue
                onChange={(e) => {setEndDate(e.target.value); onDateRangeChange(startDate, e.target.value)}}
                className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;