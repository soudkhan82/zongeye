"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ActionItem } from "@/interfaces";
import { getAllActions } from "@/app/actions/tasks";
import { Badge } from "@/components/ui/badge";

export default function TasksPage() {
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getAllActions();
      setTasks(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <p className="text-sm text-gray-500">Loading tasks…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Link href="/tasks/Dashboard">
          <Button>Goto Dashboard</Button>
        </Link>
      </div>

      {tasks.length === 0 && (
        <div className="border rounded-md p-6 text-center text-gray-600">
          No tasks found.
        </div>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="border p-4 rounded-md shadow bg-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  <Link
                    href={`/tasks/detail/${task.id}`}
                    className="hover:underline"
                  >
                    {task.title}
                  </Link>
                </h2>
                <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
                  {/* <Badge variant="secondary">{task.status}</Badge> */}
                  {task.status && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold
        ${
          task.status.toLowerCase() === "closed"
            ? "bg-green-100 text-green-700"
            : task.status.toLowerCase() === "open"
            ? "bg-blue-100 text-blue-700"
            : task.status.toLowerCase() === "in-progress"
            ? "bg-orange-100 text-orange-700"
            : "bg-gray-100 text-gray-700"
        }`}
                    >
                      {task.status}
                    </span>
                  )}

                  {task.region && (
                    <Badge variant="outline">Region: {task.region}</Badge>
                  )}
                  {task.ActionType && (
                    <Badge variant="outline">Type: {task.ActionType}</Badge>
                  )}
                  {task.target_timeline && (
                    <span>
                      Target: <strong>{task.target_timeline}</strong>
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="mt-2 text-gray-700">{task.description}</p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  Created:{" "}
                  {task.created_at
                    ? new Date(task.created_at).toLocaleString()
                    : "-"}
                </p>
                {task.image && (
                  <img
                    src={task.image}
                    alt={task.title ?? "task image"}
                    className="mt-3 w-full max-h-64 object-cover rounded-md border"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/tasks/detail/${task.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button>Details</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
