'use client';

import { useMemo, useState } from 'react';
import { useTermFlowStore } from '@/lib/store';

interface GraphViewProps {
  onSelectTask: (id: string) => void;
}

const NODE_WIDTH = 190;
const NODE_HEIGHT = 58;
const COLUMN_GAP = 90;
const ROW_GAP = 28;

export default function GraphView({ onSelectTask }: GraphViewProps) {
  const { tasks, activeProjectId, searchFilter, selectedTaskId } = useTermFlowStore();
  const [zoom, setZoom] = useState(1);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(selectedTaskId);

  const visibleTasks = useMemo(() => {
    // Include tasks in active project + their direct dependencies
    const baseTasks = tasks.filter((task) => task.projectId === activeProjectId);
    const dependencyIds = new Set(baseTasks.flatMap(t => t.dependencyIds || []));
    const allRelevant = new Set([...baseTasks.map(t => t.id), ...dependencyIds]);
    
    let filtered = tasks.filter(t => allRelevant.has(t.id));

    if (searchFilter) {
      const query = searchFilter.toLowerCase();
      filtered = filtered.filter((task) => [task.title, task.description, task.status, task.priority, ...task.labels]
        .some((value) => value.toLowerCase().includes(query)));
    }
    return filtered;
  }, [tasks, activeProjectId, searchFilter]);

  const layout = useMemo(() => {
    const taskIds = new Set(visibleTasks.map((task) => task.id));
    const depth = new Map<string, number>();
    const getDepth = (id: string, trail = new Set<string>()): number => {
      if (depth.has(id)) return depth.get(id)!;
      if (trail.has(id)) return 0;
      const task = visibleTasks.find((item) => item.id === id);
      const dependencies = task?.dependencyIds?.filter((dependencyId) => taskIds.has(dependencyId)) || [];
      const value = dependencies.length
        ? Math.min(4, Math.max(...dependencies.map((dependencyId) => getDepth(dependencyId, new Set(trail).add(id)))) + 1)
        : 0;
      depth.set(id, value);
      return value;
    };
    visibleTasks.forEach((task) => getDepth(task.id));
    const rows = new Map<number, typeof visibleTasks>();
    visibleTasks.forEach((task) => {
      const row = rows.get(depth.get(task.id) || 0) || [];
      row.push(task);
      rows.set(depth.get(task.id) || 0, row);
    });
    const positions = new Map<string, { x: number; y: number }>();
    [...rows.entries()].forEach(([column, row]) => row.forEach((task, index) => {
      positions.set(task.id, {
        x: column * (NODE_WIDTH + COLUMN_GAP),
        y: index * (NODE_HEIGHT + ROW_GAP)
      });
    }));
    const width = Math.max(1, ...[...positions.values()].map(({ x }) => x + NODE_WIDTH));
    const height = Math.max(1, ...[...positions.values()].map(({ y }) => y + NODE_HEIGHT));
    return { positions, width, height };
  }, [visibleTasks]);

  const connectedTaskIds = useMemo(() => {
    const targetId = focusTaskId || selectedTaskId || visibleTasks[0]?.id;
    if (!targetId) return new Set<string>();
    const targetSet = new Set<string>([targetId]);
    const queue = [targetId];
    while (queue.length) {
      const currentId = queue.shift()!;
      for (const task of visibleTasks) {
        if (!task.dependencyIds?.includes(currentId) && !task.id.includes(currentId)) continue;
        if (task.id === currentId) continue;
        if (!targetSet.has(task.id)) {
          targetSet.add(task.id);
          queue.push(task.id);
        }
      }
      for (const task of visibleTasks) {
        if (!task.dependencyIds || !task.dependencyIds.includes(currentId)) continue;
        if (!targetSet.has(task.id)) {
          targetSet.add(task.id);
          queue.push(task.id);
        }
      }
    }
    return targetSet;
  }, [focusTaskId, selectedTaskId, visibleTasks]);

  const edges = useMemo(() => visibleTasks.flatMap((task) =>
    (task.dependencyIds || [])
      .filter((id) => layout.positions.has(id) && layout.positions.has(task.id))
      .map((dependencyId) => ({
        from: layout.positions.get(dependencyId)!,
        to: layout.positions.get(task.id)!,
        dependencyId,
        taskId: task.id,
      }))
  ), [visibleTasks, layout.positions]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-[var(--accent-main)]">&gt; task-dependencies --local</h1>
          <p className="text-xs text-[var(--text-muted)]">Klik node untuk membuka detail task, atau fokus ke satu dependency chain.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setZoom((value) => Number(Math.max(0.7, value - 0.1).toFixed(1)))} className="terminal-button">−</button>
          <span className="min-w-12 text-center text-[10px] text-[var(--text-muted)]">{zoom.toFixed(1)}x</span>
          <button type="button" onClick={() => setZoom((value) => Number(Math.min(1.8, value + 0.1).toFixed(1)))} className="terminal-button">+</button>
          <button type="button" onClick={() => { setZoom(1); setFocusTaskId(selectedTaskId || visibleTasks[0]?.id || null); }} className="terminal-button">Fit</button>
        </div>
      </div>
      {visibleTasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border-main)] p-10 text-center text-xs text-[var(--text-muted)]">
          Belum ada task atau dependency pada project ini.
        </div>
      ) : isMobile ? (
        <div className="space-y-3 rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] p-3">
          {visibleTasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => { onSelectTask(task.id); setFocusTaskId(task.id); }}
              className={`w-full rounded border p-3 text-left text-xs transition ${task.id === (focusTaskId || selectedTaskId) ? 'border-[var(--accent-cyan)] bg-[var(--bg-muted)] text-[var(--text-bright)]' : 'border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-main)]'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{task.id}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{task.status}</span>
              </div>
              <div className="mt-2 truncate font-semibold">{task.title}</div>
              <div className="mt-2 text-[10px] text-[var(--text-muted)]">
                {task.dependencyIds?.length ? `${task.dependencyIds.length} dependency` : 'Tidak ada dependency'}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] p-3">
          <div className="relative" style={{ width: Math.max(layout.width * zoom + 32, 620), height: Math.max(layout.height * zoom + 32, 280) }}>
            <div className="absolute inset-0 overflow-hidden rounded-md bg-[var(--bg-app)]/40">
              <svg
                role="img"
                aria-label="Task dependency graph"
                viewBox={`0 0 ${layout.width} ${layout.height}`}
                className="h-full w-full"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              >
                <defs>
                  <marker id="graph-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill="var(--accent-cyan)" />
                  </marker>
                </defs>
                {edges.map(({ from, to, dependencyId, taskId }, index) => {
                  const startX = from.x + NODE_WIDTH;
                  const startY = from.y + NODE_HEIGHT / 2;
                  const endX = to.x;
                  const endY = to.y + NODE_HEIGHT / 2;
                  const bend = Math.max(30, (endX - startX) / 2);
                  const connected = connectedTaskIds.has(taskId) && connectedTaskIds.has(dependencyId);
                  return (
                    <path
                      key={`${from.x}-${from.y}-${to.x}-${to.y}-${index}`}
                      d={`M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`}
                      fill="none"
                      stroke={connected ? 'var(--accent-cyan)' : 'var(--border-main)'}
                      strokeOpacity={connected ? 0.9 : 0.45}
                      strokeWidth={connected ? 2.2 : 1.5}
                      markerEnd="url(#graph-arrow)"
                    />
                  );
                })}
                {visibleTasks.map((task) => {
                  const position = layout.positions.get(task.id)!;
                  const isFocused = task.id === (focusTaskId || selectedTaskId);
                  const isVisible = !focusTaskId || connectedTaskIds.has(task.id) || task.id === focusTaskId;
                  return (
                    <g
                      key={task.id}
                      transform={`translate(${position.x}, ${position.y})`}
                      role="button"
                      tabIndex={0}
                      aria-label={"Open task " + task.title}
                      onClick={() => { onSelectTask(task.id); setFocusTaskId(task.id); }}
                      className="cursor-pointer"
                      style={{ opacity: isVisible ? 1 : 0.35 }}
                    >
                      <rect
                        width={NODE_WIDTH}
                        height={NODE_HEIGHT}
                        rx="6"
                        fill={isFocused ? 'var(--bg-muted)' : 'var(--bg-app)'}
                        stroke={isFocused ? 'var(--accent-cyan)' : 'var(--border-main)'}
                        strokeWidth={isFocused ? 2 : 1.5}
                      />
                      <text x="12" y="23" fill="var(--text-bright)" fontSize="12" fontWeight="bold">{task.title.length > 25 ? `${task.title.slice(0, 24)}…` : task.title}</text>
                      <text x="12" y="43" fill="var(--text-muted)" fontSize="10">{task.id} · {task.status.replace('_', ' ')}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
