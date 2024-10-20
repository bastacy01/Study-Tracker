"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

interface HeatMapProps {
  data: { [date: string]: { time: number; description?: string }[] };
}

const HeatMap: React.FC<HeatMapProps> = ({ data }) => {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getColor = (value: number) => {
    const currentTheme = theme === 'system' ? systemTheme : theme
    const colors = currentTheme === 'dark' 
      ? ['#1f2937', '#0e4429', '#006d32', '#26a641', '#39d353']
      : ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    if (value === 0) return colors[0];
    if (value <= 1) return colors[1];
    if (value <= 2) return colors[2];
    if (value <= 4) return colors[3];
    return colors[4];
  };

  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 1);
  startDate.setDate(startDate.getDate() + 1);

  const days = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const weekDays = ['Mon', '', 'Wed', '', 'Fri', ''];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (!mounted) {
    return null;
  }

  return (
    <div className="inline-block">
      <div className="flex mb-2">
        <div className="w-8"></div>
        <div className="flex-1 flex justify-between text-xs text-gray-500">
          {months.map((month, i) => (
            <div key={i} style={{width: `${100 / 12}%`}}>{month}</div>
          ))}
        </div>
      </div>
      <div className="flex">
        <div className="flex flex-col justify-between text-xs text-gray-500 mr-2">
          {weekDays.map((day, i) => (
            <div key={i} className="h-[17px]">{day}</div>
          ))}
        </div>
        <div className="inline-grid grid-cols-[repeat(53,1fr)] gap-1">
          {days.map((day, index) => {
            const dateString = day.toISOString().split('T')[0];
            const sessions = data[dateString] || [];
            const totalValue = sessions.reduce((total, session) => total + session.time, 0);
            return (
              <div
                key={index}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getColor(totalValue) }}
                title={`${dateString}: ${totalValue.toFixed(2)} hours`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeatMap;