'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear } from 'date-fns';
import HeatMap from './HeatMap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

interface StudySession {
  time: number;
  description?: string;
}

interface StudyData {
  [date: string]: StudySession[];
}

export default function StudyTimeTracker() {
  const [studyData, setStudyData] = useState<StudyData>({});
  const [studyTime, setStudyTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const savedData = localStorage.getItem('studyData');
    if (savedData) {
      setStudyData(JSON.parse(savedData));
    }
  }, []);

  const saveStudyTime = () => {
    const time = parseFloat(studyTime);
    if (isNaN(time) || time <= 0) return;

    const dateString = selectedDate
      ? format(selectedDate, 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');
    const newData = {
      ...studyData,
      [dateString]: [...(studyData[dateString] || []), { time, description }],
    };
    setStudyData(newData);
    localStorage.setItem('studyData', JSON.stringify(newData));
    setStudyTime('');
    setDescription('');
  };

  const calculateTotalTime = (start: Date, end: Date) => {
    return Object.entries(studyData).reduce((total, [date, sessions]) => {
      const currentDate = new Date(date);
      if (currentDate >= start && currentDate <= end) {
        return total + sessions.reduce((sum, session) => sum + session.time, 0);
      }
      return total;
    }, 0);
  };

  const today = new Date();
  const weeklyTotal = calculateTotalTime(startOfWeek(today), endOfWeek(today));
  const monthlyTotal = calculateTotalTime(startOfMonth(today), endOfMonth(today));
  const yearlyTotal = calculateTotalTime(startOfYear(today), endOfYear(today));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Study Time Tracker</h1>
      <Card>
        <CardHeader>
          <CardTitle>Log Your Study Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="study-time">Study Time (hours)</Label>
              <Input
                id="study-time"
                type="number"
                placeholder="Enter study time"
                value={studyTime}
                onChange={(e) => setStudyTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="What did you study?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <Button onClick={saveStudyTime}>Log Time</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Study Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value="weekly">
              <p>Total study time this week: {weeklyTotal.toFixed(2)} hours</p>
            </TabsContent>
            <TabsContent value="monthly">
              <p>Total study time this month: {monthlyTotal.toFixed(2)} hours</p>
            </TabsContent>
            <TabsContent value="yearly">
              <p>Total study time this year: {yearlyTotal.toFixed(2)} hours</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Study Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <HeatMap data={studyData} />
        </CardContent>
      </Card>
    </div>
  );
}