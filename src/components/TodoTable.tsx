"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
type Day = (typeof DAYS)[number];

export interface TodoItem {
  id: string;
  text: string;
  days: Record<Day, boolean>;
}

const STORAGE_KEY = "todolist-weekly";

function loadTodos(): TodoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TodoItem[];
    return parsed.map((t) => ({
      ...t,
      days: {
        일: t.days?.일 ?? false,
        월: t.days?.월 ?? false,
        화: t.days?.화 ?? false,
        수: t.days?.수 ?? false,
        목: t.days?.목 ?? false,
        금: t.days?.금 ?? false,
        토: t.days?.토 ?? false,
      },
    }));
  } catch {
    return [];
  }
}

function saveTodos(todos: TodoItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function TodoTable() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newText, setNewText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTodos(loadTodos());
  }, []);

  useEffect(() => {
    if (mounted) saveTodos(todos);
  }, [todos, mounted]);

  const addTodo = () => {
    const text = newText.trim();
    if (!text) return;
    setTodos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        days: { 일: false, 월: false, 화: false, 수: false, 목: false, 금: false, 토: false },
      },
    ]);
    setNewText("");
  };

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleDay = (id: string, day: Day) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, days: { ...t.days, [day]: !t.days[day] } } : t
      )
    );
  };

  const updateText = (id: string, text: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text } : t))
    );
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <div className="flex-shrink-0 p-3 space-y-3">
        <h1 className="text-lg font-bold truncate">주간 할일 리스트</h1>
        <div className="flex gap-2">
          <Input
            placeholder="새 할일 입력"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTodo();
              }
            }}
            className="flex-1 min-w-0 h-8 text-sm"
          />
          <Button onClick={addTodo} size="icon" className="h-8 w-8 shrink-0" title="추가">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden rounded-lg border mx-3 mb-3 max-w-full">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%] font-semibold px-2 py-1.5 text-xs">
                할 일
              </TableHead>
              {DAYS.map((day) => (
                <TableHead
                  key={day}
                  className="text-center w-[10%] font-semibold px-1 py-1.5 text-xs"
                >
                  {day}
                </TableHead>
              ))}
              <TableHead className="w-[6%] px-1 py-1.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={DAYS.length + 2}
                  className="h-16 text-center text-muted-foreground text-sm py-2"
                >
                  할일이 없습니다. 위 입력창에서 추가해보세요.
                </TableCell>
              </TableRow>
            ) : (
              todos.map((todo) => (
                <TableRow key={todo.id}>
                  <TableCell className="font-medium px-2 py-1 align-middle overflow-hidden break-words">
                    <textarea
                      value={todo.text}
                      onChange={(e) => updateText(todo.id, e.target.value)}
                      rows={3}
                      className="w-full min-w-0 text-sm border-0 bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 py-1 px-1 resize-none break-words overflow-hidden block"
                      style={{ wordBreak: "break-word" }}
                    />
                  </TableCell>
                  {DAYS.map((day) => (
                    <TableCell key={day} className="text-center align-middle px-1 py-1">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={todo.days[day]}
                          onCheckedChange={() => toggleDay(todo.id, day)}
                          aria-label={`${todo.text} - ${day}요일`}
                        />
                      </div>
                    </TableCell>
                  ))}
                  <TableCell className="align-middle px-1 py-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTodo(todo.id)}
                      className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                      aria-label="삭제"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
