import { Task } from './store';

export function exportTasksToJSON(tasks: Task[]) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
  downloadFile(dataStr, `termflow-tasks-${new Date().toISOString().slice(0,10)}.json`);
}

export function exportTasksToMarkdown(tasks: Task[], projectName: string = 'TermFlow') {
  let md = `# ${projectName} - Task Export\n\n`;
  md += `Exported on: ${new Date().toLocaleString()}\n\n`;

  const statuses = ['todo', 'in_progress', 'review', 'done'] as const;
  const statusLabels = { todo: 'To Do', in_progress: 'In Progress', review: 'In Review', done: 'Done' };

  statuses.forEach(status => {
    const list = tasks.filter(t => t.status === status);
    md += `## ${statusLabels[status]} (${list.length})\n\n`;
    if (list.length === 0) {
      md += `*No tasks*\n\n`;
    } else {
      list.forEach(task => {
        const checkbox = task.status === 'done' ? '[x]' : '[ ]';
        md += `- ${checkbox} **${task.title}** (Priority: ${task.priority.toUpperCase()})\n`;
        if (task.description) {
          md += `  > ${task.description.replace(/\n/g, '\n  > ')}\n`;
        }
        if (task.assignee) md += `  - Assignee: @${task.assignee}\n`;
        if (task.dueDate) md += `  - Due Date: ${task.dueDate}\n`;
        if (task.labels.length > 0) md += `  - Tags: ${task.labels.map(l => `#${l}`).join(' ')}\n`;
        if (task.subtasks.length > 0) {
          md += `  - Subtasks:\n`;
          task.subtasks.forEach(st => {
            md += `    - [${st.completed ? 'x' : ' '}] ${st.title}\n`;
          });
        }
        md += `\n`;
      });
    }
  });

  const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
  downloadFile(dataStr, `termflow-tasks-${new Date().toISOString().slice(0,10)}.md`);
}

export function exportTasksToCSV(tasks: Task[]) {
  const headers = ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Tags', 'Subtasks Count', 'Created At'];
  const rows = tasks.map(t => [
    t.id,
    `"${t.title.replace(/"/g, '""')}"`,
    t.status,
    t.priority,
    t.assignee || '',
    t.dueDate || '',
    `"${t.labels.join(', ')}"`,
    `${t.subtasks.filter(s => s.completed).length}/${t.subtasks.length}`,
    t.createdAt
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
  downloadFile(dataStr, `termflow-tasks-${new Date().toISOString().slice(0,10)}.csv`);
}

function downloadFile(dataUri: string, filename: string) {
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataUri);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

