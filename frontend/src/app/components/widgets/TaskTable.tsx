'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useDrag } from 'react-dnd';
import { useRef } from 'react';

type Task = {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  time?: string;
};


interface TaskTableProps {
  tasks: Task[];
  onRemoveTasks: (taskIds: number[]) => void;
}

export default function TaskTable({ tasks, onRemoveTasks }: TaskTableProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

useEffect(() => {
  const savedIds = Cookies.get('selectedTaskIds');
  if (savedIds) {
    setSelectedTaskIds(JSON.parse(savedIds));
  }
}, []);

useEffect(() => {
  if (selectedTaskIds.length > 0) {
    Cookies.set('selectedTaskIds', JSON.stringify(selectedTaskIds), { expires: 7 });
  } else {
    Cookies.remove('selectedTaskIds');
  }
}, [selectedTaskIds]);

function DraggableRow({
  task,
  isSelected,
  toggleTask,
}: {
  task: Task;
  isSelected: boolean;
  toggleTask: (id: number) => void;
}) {
  const rowRef = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  drag(rowRef); 

  return (
    <tr
      ref={rowRef}
      className={`${isSelected ? 'bg-blue-100' : ''} ${isDragging ? 'opacity-50' : ''}`}
      style={{ transition: 'background-color 0.3s ease' }}
    >
      <th>
        <label>
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={isSelected}
            onChange={() => toggleTask(task.id)}
          />
        </label>
      </th>
      <td>{task.title}</td>
      <td>{task.description ?? '-'}</td>
      <td>{task.dueDate}</td>
      <td>{task.time ?? '-'}</td>
    </tr>
  );
}



function toggleAll() {
  if (tasks.length === 0) return;
  if (selectedTaskIds.length === tasks.length) {
    setSelectedTaskIds([]);
  } else {
    setSelectedTaskIds(tasks.map((task) => task.id));
  }
}

  function handleRemoveDoneTasks() {
  onRemoveTasks(selectedTaskIds);
  setSelectedTaskIds([]);  
}

function toggleTask(id: number) {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
    );
  }
  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">Tasks</h3>
        <button
          onClick={handleRemoveDoneTasks}
          className="btn btn-sm bg-blue-600 text-white hover:bg-blue-800"
        >
          Remove Done Tasks
        </button>
      </div>

      <table className="table w-full">
        <thead>
          <tr>
            <th>
              <label>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={selectedTaskIds.length === tasks.length}
                  onChange={toggleAll}
                />
              </label>
            </th>
            <th className="text-blue-700 dark:text-blue-300">Title</th>
            <th className="text-blue-700 dark:text-blue-300">Description</th>
            <th className="text-blue-700 dark:text-blue-300">Due Date</th>
            <th className="text-blue-700 dark:text-blue-300">Time</th>
          </tr>
        </thead>

        <tbody>
  {tasks.length === 0 ? (
    <tr>
      <td colSpan={6} className="text-center py-4">
        No tasks found.
      </td>
    </tr>
  ) : (
    tasks.map((task) => (
      <DraggableRow
        key={task.id}
        task={task}
        isSelected={selectedTaskIds.includes(task.id)}
        toggleTask={toggleTask}
      />
    ))
  )}
</tbody>


        <tfoot>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Time</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
