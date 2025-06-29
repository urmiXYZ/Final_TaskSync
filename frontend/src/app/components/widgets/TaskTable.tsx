import React, { useState } from 'react';

type Task = {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  time?: string;
};

interface TaskTableProps {
  tasks: Task[];
}

export default function TaskTable({ tasks }: TaskTableProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

  function toggleTask(id: number) {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map((task) => task.id));
    }
  }

  return (
    <div className="overflow-x-auto">
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
    <th>Title</th>
    <th>Description</th>
    <th>Due Date</th>
    <th>Time</th>
  </tr>
</thead>

        <tbody>
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4">
                No tasks found.
              </td>
            </tr>
          )}
          {tasks.map(({ id, title, description, dueDate, time }) => (
            <tr
              key={id}
              className={selectedTaskIds.includes(id) ? 'bg-blue-100' : ''}
              style={{ transition: 'background-color 0.3s ease' }}
            >
              <th>
                <label>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selectedTaskIds.includes(id)}
                    onChange={() => toggleTask(id)}
                  />
                </label>
              </th>
              <td>{title}</td>
              <td>{description ?? '-'}</td>
              <td>{dueDate}</td>
              <td>{time ?? '-'}</td>
            </tr>
          ))}
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
