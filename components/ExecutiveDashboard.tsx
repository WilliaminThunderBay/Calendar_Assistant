import React, { useMemo, useState } from 'react';
import { Task, ActivityLog } from '../types';
import { generateAdminOutput } from '../services/geminiService';

interface ExecutiveDashboardProps {
  tasks: Task[];
  activities: ActivityLog[];
  onOpenCalendar: () => void;
  onOpenAI: () => void;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  tasks,
  activities,
  onOpenCalendar,
  onOpenAI
}) => {
  const [aiOutput, setAiOutput] = useState(
    'Paste meeting notes, an email request or an office update, then run an AI productivity action.'
  );
  const [sourceText, setSourceText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = useMemo(
    () => tasks.filter(task => task.date === today),
    [tasks, today]
  );
  const priorityTasks = useMemo(
    () => tasks.filter(task => task.color === 'red' || task.note?.includes('urgent') || task.note?.includes('加班')).slice(0, 4),
    [tasks]
  );

  const officeRequests = [
    { label: 'Visitor coordination', status: 'Ready', detail: 'Guest list, arrival window, host and access notes' },
    { label: 'Vendor follow-up', status: '2 open', detail: 'Track quotes, delivery commitments and next action' },
    { label: 'Document preparation', status: '3 drafts', detail: 'Briefings, agendas and meeting follow-up drafts' },
    { label: 'Supply / facility requests', status: 'On track', detail: 'Centralized request log with owner and due date' }
  ];

  const actions = [
    {
      label: 'Generate executive brief',
      output: 'EXECUTIVE BRIEF\n• Today: 4 scheduled items, 2 priority follow-ups\n• Attention: one timing conflict needs confirmation\n• Decision needed: approve vendor option B before 2:00 PM\n• Next: send consolidated follow-up after the afternoon meeting.'
    },
    {
      label: 'Turn notes into minutes',
      output: 'MEETING MINUTES\nDecisions: proceed with the revised timeline.\nAction items: William - circulate updated schedule; Operations - confirm vendor availability.\nDue dates: confirmations by tomorrow, final brief by Friday.'
    },
    {
      label: 'Draft follow-up email',
      output: 'Subject: Follow-up and next steps\n\nHi team,\nThank you for today’s discussion. I’ve summarized the agreed actions and owners below. Please confirm any corrections by 3:00 PM so the final schedule can be circulated.'
    },
    {
      label: 'Summarize office requests',
      output: 'OFFICE REQUEST SUMMARY\n• 2 vendor items awaiting response\n• 1 visitor request requiring access confirmation\n• 3 documents in draft status\n• No overdue supply requests\nRecommended next step: consolidate open items into one 2:00 PM check-in.'
    }
  ];

  const metricCards = [
    { label: 'Today', value: todaysTasks.length || 4, detail: 'scheduled items' },
    { label: 'Priority', value: priorityTasks.length || 2, detail: 'follow-ups' },
    { label: 'Documents', value: 3, detail: 'drafts in progress' },
    { label: 'Office requests', value: 4, detail: 'active workstreams' }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 shadow-lg overflow-hidden relative">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-white/5 skew-x-[-16deg] translate-x-12" />
        <div className="relative max-w-3xl">
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Executive Operations Command Center
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            One place for priorities, schedules, follow-ups and AI-assisted admin work.
          </h2>
          <p className="text-slate-300 mt-3 text-sm md:text-base leading-6">
            A portfolio prototype showing how an Executive Assistant / Office Manager can combine structured operations with practical AI workflows.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={onOpenCalendar}
              className="px-4 py-2.5 bg-white text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-100 transition-colors"
            >
              Open calendar
            </button>
            <button
              type="button"
              onClick={onOpenAI}
              className="px-4 py-2.5 bg-indigo-500/20 border border-indigo-300/30 rounded-lg font-semibold text-sm hover:bg-indigo-500/30 transition-colors"
            >
              Open AI assistant
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map(card => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{card.label}</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.detail}</div>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-900">Today’s executive brief</h3>
              <p className="text-xs text-gray-500 mt-1">Priority information formatted for fast review.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Live workspace</span>
          </div>

          <div className="p-5 grid md:grid-cols-2 gap-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Priority follow-ups</div>
              <div className="space-y-3">
                {(priorityTasks.length ? priorityTasks : tasks.slice(0, 3)).map((task, index) => (
                  <div key={task.id || index} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{task.number || 'Priority item'}</div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.note || task.service || 'Confirm owner, timing and next action.'}</div>
                    </div>
                  </div>
                ))}
                {!tasks.length && (
                  <div className="p-4 rounded-xl bg-gray-50 text-sm text-gray-500">
                    Sample state: priority follow-ups are displayed here with owner, due time and next action.
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Recent activity</div>
              <div className="space-y-3">
                {activities.slice(0, 4).map((activity, index) => (
                  <div key={activity.id || index} className="flex gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{activity.action}</div>
                      <div className="text-xs text-gray-500">{activity.details}</div>
                    </div>
                  </div>
                ))}
                {!activities.length && (
                  <div className="text-sm text-gray-500">Operational activity and follow-up history appears here.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Office operations</h3>
            <p className="text-xs text-gray-500 mt-1">Lightweight control center for recurring admin work.</p>
          </div>
          <div className="divide-y divide-gray-100">
            {officeRequests.map(item => (
              <div key={item.label} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full whitespace-nowrap">{item.status}</span>
                </div>
                <p className="text-xs text-gray-500 leading-5 mt-1.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900">AI productivity studio</h3>
            <p className="text-xs text-gray-500 mt-1">Sample workflows for executive support, documentation and follow-through.</p>
          </div>
          <textarea
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            rows={5}
            placeholder="Paste meeting notes, an email request, visitor/vendor update, or any unstructured office information..."
            className="w-full resize-y rounded-xl border border-gray-200 p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 mb-3"
          />
          <div className="grid sm:grid-cols-2 gap-2.5">
            {actions.map(action => (
              <button
                type="button"
                key={action.label}
                disabled={isGenerating}
                onClick={() => runAIAction(action.key)}
                className="text-left p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-sm font-semibold text-gray-900">{action.label}</div>
                <div className="text-xs text-gray-500 mt-1">Run live Gemini workflow</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 text-slate-100 rounded-2xl shadow-sm p-5 min-h-[240px]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-bold">AI output preview</h3>
            <span className="text-[11px] text-slate-400 border border-slate-700 px-2 py-1 rounded-full">Portfolio sample</span>
          </div>
          <pre className="whitespace-pre-wrap text-xs md:text-sm leading-6 text-slate-300 font-sans">{aiOutput}</pre>
        </div>
      </section>
    </div>
  );
};

export default ExecutiveDashboard;
