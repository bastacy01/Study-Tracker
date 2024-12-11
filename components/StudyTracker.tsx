'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, isWithinInterval } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MoonIcon, SunIcon, BookOpenIcon, BarChartIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import HeatMap from './HeatMap';

interface StudySession {
  time: number;
  description: string;
}

interface StudyData {
  [date: string]: StudySession[];
}

export default function GoonTracker() {
  const [studyData, setStudyData] = useState<StudyData>({});
  const [studyTime, setStudyTime] = useState('');
  const [timeUnit, setTimeUnit] = useState('minutes');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [statisticsPeriod, setStatisticsPeriod] = useState('day');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const savedData = localStorage.getItem('studyData');
    if (savedData) {
      setStudyData(JSON.parse(savedData));
    }
  }, []);

  const saveStudyTime = () => {
    const time = parseFloat(studyTime);
    if (isNaN(time) || time <= 0) return;

    const timeInHours = timeUnit === 'minutes' ? time / 60 : time;

    const dateString = selectedDate
      ? format(selectedDate, 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');
    const newData = {
      ...studyData,
      [dateString]: [...(studyData[dateString] || []), { time: timeInHours, description }],
    };
    setStudyData(newData);
    localStorage.setItem('studyData', JSON.stringify(newData));
    setStudyTime('');
    setDescription('');
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  const formatStudyTime = (time: number) => {
    if (time < 1) {
      return `${Math.round(time * 60)} minutes`;
    }
    return `${time.toFixed(2)} hours`;
  };

  const getSessionsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return studyData[dateString] || [];
  };

  const calculateTotalTime = (start: Date, end: Date) => {
    let total = 0;
    Object.entries(studyData).forEach(([dateStr, sessions]) => {
      const currentDate = new Date(dateStr);
      if (isWithinInterval(currentDate, { start, end })) {
        total += sessions.reduce((sum, session) => sum + session.time, 0);
      }
    });
    return total;
  };

  const getTotalStudyTime = () => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    switch (statisticsPeriod) {
      case 'day':
        return calculateTotalTime(startOfToday, endOfToday);
      case 'week': {
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        return calculateTotalTime(weekStart, weekEnd);
      }
      case 'month': {
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        return calculateTotalTime(monthStart, monthEnd);
      }
      case 'year': {
        const yearStart = startOfYear(today);
        const yearEnd = endOfYear(today);
        return calculateTotalTime(yearStart, yearEnd);
      }
      default:
        return 0;
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Study Tracker</h1>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <SunIcon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Study Time Log</CardTitle>
          <p className="text-muted-foreground">Track your daily study time and visualize your progress</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="log">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="log">
                <BookOpenIcon className="mr-2 h-4 w-4" />
                Log Time
              </TabsTrigger>
              <TabsTrigger value="statistics">
                <BarChartIcon className="mr-2 h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>
            <TabsContent value="log">
              <div className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-4 order-1 md:order-none">
                    <div>
                      <Label htmlFor="study-time">Study Time</Label>
                      <div className="flex">
                        <Input
                          id="study-time"
                          type="number"
                          placeholder="Enter study time"
                          value={studyTime}
                          onChange={(e) => setStudyTime(e.target.value)}
                          className="rounded-r-none w-full"
                        />
                        <Select value={timeUnit} onValueChange={setTimeUnit}>
                          <SelectTrigger className="w-[110px] rounded-l-none">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Add a description of your study session"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={saveStudyTime} className="w-full">Log Time</Button>
                  </div>
                  <div className="order-2 md:order-none flex flex-col items-center">
                    <Label className="self-start md:self-auto">Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">
                    Study Sessions on {selectedDate ? formatDate(selectedDate) : 'No date selected'}
                  </h3>
                  {getSessionsForSelectedDate().map((session, index) => (
                    <div key={index} className="bg-secondary p-3 rounded-lg mb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Session {index + 1}</span>
                        <span className="font-bold">{formatStudyTime(session.time)}</span>
                      </div>
                      {session.description && (
                        <p className="text-muted-foreground mt-1">{session.description}</p>
                      )}
                    </div>
                  ))}
                  {getSessionsForSelectedDate().length === 0 && (
                    <p className="text-muted-foreground">No study sessions logged for this date.</p>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="statistics">
              <div className="mt-4 space-y-6">
                <div>
                  <Label>Total Study Time</Label>
                  <Tabs value={statisticsPeriod} onValueChange={setStatisticsPeriod} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="day">Day</TabsTrigger>
                      <TabsTrigger value="week">Week</TabsTrigger>
                      <TabsTrigger value="month">Month</TabsTrigger>
                      <TabsTrigger value="year">Year</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="text-2xl font-bold mt-2">{formatStudyTime(getTotalStudyTime())}</p>
                </div>
                <div>
                  <Label>Study Heat Map</Label>
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="min-w-[800px]">
                      <HeatMap data={studyData} />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}