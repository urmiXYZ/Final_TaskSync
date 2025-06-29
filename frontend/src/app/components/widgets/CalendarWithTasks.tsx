'use client';

import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

type PersonalTask = {
  id: number;
  title: string;
  description?: string;
  dueDate: string; // 'YYYY-MM-DD'
  time?: string;
};

export default function PersonalTaskCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch tasks from backend
  async function fetchTasks() {
    try {
      const res = await fetch("http://localhost:3001/personal-tasks", {
  credentials: "include",
});

      if (!res.ok) throw new Error('Failed to load tasks');
      const data: PersonalTask[] = await res.json();
      setTasks(data);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onChangeHandler(
  value: Date | Date[] | null | [Date | null, Date | null]
) {
  if (Array.isArray(value)) {
    const firstDate = value.find((d) => d !== null) ?? null;
    setSelectedDate(firstDate);
  } else {
    setSelectedDate(value);
  }
}


  // Highlight days with tasks
  function tileClassName({ date, view }: { date: Date; view: string }) {
    if (view === 'month') {
      const hasTask = tasks.some((task) => isSameDay(parseISO(task.dueDate), date));
      return hasTask ? 'bg-blue-200 rounded-full' : '';
    }
    return '';
  }

const tasksForSelectedDate = selectedDate
  ? tasks.filter(task => task.dueDate === format(selectedDate, 'yyyy-MM-dd'))
  : [];


  // Add Task modal form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('');

  async function handleAddTask() {
    if (!title || !dueDate) {
      toast.error('Title and due date are required');
      return;
    }
    try {
  const res = await fetch('http://localhost:3001/personal-tasks', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description, dueDate, time }),
  });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add task');
      }
      toast.success('Task added!');
      setTitle('');
      setDescription('');
      setDueDate(format(new Date(), 'yyyy-MM-dd'));
      setTime('');
      setShowAddModal(false);
      fetchTasks();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[350px]">
        <button
          className="btn btn-primary mb-4 w-full"
          onClick={() => setShowAddModal(true)}
        >
          + Add Personal Task
        </button>

        <Calendar
  onChange={(value) => onChangeHandler(value)}
  value={selectedDate}
  tileClassName={tileClassName}
/>

      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 flex-1">
        <h2 className="text-lg font-semibold mb-2">
  Tasks for {format(selectedDate ?? new Date(), 'PPP')}
</h2>


        {tasksForSelectedDate.length === 0 ? (
          <p className="text-sm text-gray-500">No tasks scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {tasksForSelectedDate.map((task) => (
              <li key={task.id} className="p-3 border rounded-lg bg-gray-50">
                <div className="font-medium">{task.title}</div>
                {task.time && <div className="text-sm text-gray-500">{task.time}</div>}
                {task.description && (
                  <div className="text-sm mt-1 text-gray-600">{task.description}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Personal Task</h3>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Title</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Description</label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Due Date</label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Time (optional)</label>
              <input
                type="time"
                className="input input-bordered w-full"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="btn" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddTask}>
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
