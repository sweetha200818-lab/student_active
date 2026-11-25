import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  Mail,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { SAMPLE_MATHS_PHOTO, SAMPLE_SCIENCE_PHOTO } from '../data/seedData';
import type {
  Student,
  StudentMessage,
  Submission,
  SubmissionStatus,
  Subject,
  TaskItem,
} from '../types/portal';
import { SUBJECTS } from '../utils/portalLogic';
import { HomeworkPhoto } from './HomeworkPhoto';

interface StudentPortalProps {
  student: Student;
  tasks: TaskItem[];
  submissions: Submission[];
  messages: StudentMessage[];
  onSubmitWork: (input: {
    task: TaskItem;
    status: SubmissionStatus;
    photoUrl: string;
    note: string;
  }) => { ok: true } | { ok: false; error: string };
  onMarkMessageRead: (messageId: string) => void;
}

export function StudentPortal({
  student,
  tasks,
  submissions,
  messages,
  onSubmitWork,
  onMarkMessageRead,
}: StudentPortalProps) {
  const [subjectFilter, setSubjectFilter] = useState<'All' | Subject>('All');
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [statusChoice, setStatusChoice] = useState<SubmissionStatus>('Completed');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [feedbackBanner, setFeedbackBanner] = useState<string>('');

  const studentMessages = messages.filter((m) => m.rollNumber === student.rollNumber);
  const unreadMessages = studentMessages.filter((m) => !m.read);

  const studentSubmissionMap = new Map<string, Submission>();
  for (const sub of submissions) {
    if (sub.rollNumber === student.rollNumber) {
      studentSubmissionMap.set(sub.taskId, sub);
    }
  }

  const completedCount = tasks.filter(
    (t) => studentSubmissionMap.get(t.id)?.status === 'Completed'
  ).length;

  const filteredTasks =
    subjectFilter === 'All'
      ? tasks
      : tasks.filter((t) => t.subject === subjectFilter);

  const openSubmitModal = (task: TaskItem) => {
    const existing = studentSubmissionMap.get(task.id);
    setActiveTask(task);
    setStatusChoice(existing?.status ?? 'Completed');
    setPhotoUrl(existing?.photoUrl ?? '');
    setNote(existing?.note ?? '');
    setFormError('');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAttachSamplePhoto = () => {
    if (!activeTask) return;
    const sample =
      activeTask.subject === 'Science' ? SAMPLE_SCIENCE_PHOTO : SAMPLE_MATHS_PHOTO;
    setPhotoUrl(sample);
    setFormError('');
  };

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;

    const result = onSubmitWork({
      task: activeTask,
      status: statusChoice,
      photoUrl,
      note,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setFeedbackBanner(
      `${activeTask.subject} (${activeTask.title}) saved as ${statusChoice}.`
    );
    setActiveTask(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Student Profile & Attendance Card */}
      <section className="bg-white border border-sky-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-sky-700 font-mono-tabular">
              Roll {student.rollNumber}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
              {student.name}
            </h1>
          </div>

          <div
            className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${
              student.attendance === 'PRESENT'
                ? 'bg-sky-50 border-sky-300 text-sky-900'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {student.attendance === 'PRESENT' ? (
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" aria-hidden="true" />
            ) : (
              <XCircle className="w-5 h-5 text-slate-500 shrink-0" aria-hidden="true" />
            )}
            <div>
              <div className="text-xs text-slate-500 font-medium">
                Today&apos;s Attendance
              </div>
              <div className="text-sm font-bold tracking-wide">
                {student.attendance}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Summary Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-sky-100">
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100">
            <div className="text-xs font-medium text-slate-600">Assigned Tasks</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono-tabular">
              {tasks.length}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100">
            <div className="text-xs font-medium text-slate-600">Completed</div>
            <div className="text-2xl font-bold text-sky-700 mt-1 font-mono-tabular">
              {completedCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100">
            <div className="text-xs font-medium text-slate-600">Teacher Messages</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono-tabular">
              {unreadMessages.length}
            </div>
          </div>
        </div>
      </section>

      {feedbackBanner && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 px-4 py-3 bg-white border border-sky-300 rounded-xl text-sm text-sky-900 shadow-xs"
        >
          <span>{feedbackBanner}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner('')}
            aria-label="Dismiss notification"
            className="text-slate-500 hover:text-slate-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages from Subject Teachers */}
      <section aria-labelledby="messages-heading" className="bg-white border border-sky-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-sky-600" aria-hidden="true" />
            <h2 id="messages-heading" className="text-lg font-bold text-slate-900">
              Messages for Roll {student.rollNumber}
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500 font-mono-tabular">
            {studentMessages.length} total
          </span>
        </div>

        {studentMessages.length === 0 ? (
          <p className="text-sm text-slate-500 py-3">
            No messages from teachers yet.
          </p>
        ) : (
          <div className="space-y-3">
            {studentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  msg.read
                    ? 'bg-white border-sky-100'
                    : 'bg-sky-50/70 border-sky-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-sky-800">
                      {msg.fromTeacherName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">
                      {new Date(msg.sentAt).toLocaleString()}
                    </span>
                    {!msg.read && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-sky-700">New</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-800">{msg.text}</p>
                </div>
                {!msg.read && (
                  <button
                    type="button"
                    onClick={() => onMarkMessageRead(msg.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-white hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Assignments & Events */}
      <section aria-labelledby="student-tasks-heading" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 id="student-tasks-heading" className="text-xl font-bold text-slate-900">
            Homework &amp; Events
          </h2>

          <div
            className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-sky-200"
            role="tablist"
            aria-label="Filter tasks by subject"
          >
            {(['All', ...SUBJECTS] as const).map((subj) => {
              const active = subj === subjectFilter;
              return (
                <button
                  key={subj}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSubjectFilter(subj)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
                  }`}
                >
                  {subj === 'All' ? 'All Subjects' : subj}
                </button>
              );
            })}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-sky-200 rounded-2xl p-8 text-center text-sm text-slate-500">
            No homework or events found for {subjectFilter}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTasks.map((task) => {
              const sub = studentSubmissionMap.get(task.id);
              const isCompleted = sub?.status === 'Completed';

              return (
                <article
                  key={task.id}
                  className="bg-white border border-sky-200 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sky-700">
                          {task.subject}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{task.type}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">Due {task.dueDate}</span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isCompleted ? 'text-sky-700' : 'text-slate-600'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>{sub ? sub.status : 'Incomplete'}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {task.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {task.description}
                    </p>

                    {sub?.photoUrl && (
                      <div className="pt-2">
                        <HomeworkPhoto
                          src={sub.photoUrl}
                          alt={`${task.title} submission`}
                          className="w-full h-36"
                        />
                      </div>
                    )}

                    {sub && sub.marks !== null && (
                      <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sm">
                        <div className="font-semibold text-sky-900 font-mono-tabular">
                          Marks: {sub.marks} / 100
                        </div>
                        {sub.feedback && (
                          <p className="text-slate-700 mt-1 text-xs">
                            {task.subject} Teacher Remarks: {sub.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-sky-100 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      Graded by {task.subject} Teacher
                    </span>
                    <button
                      type="button"
                      aria-label={`${sub ? 'Update submission' : 'Upload and submit'} for ${task.subject} ${task.title}`}
                      onClick={() => openSubmitModal(task)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <Camera className="w-4 h-4" aria-hidden="true" />
                      <span>{sub ? 'Update Submission' : 'Upload & Submit'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Homework Photo Upload & Status Modal */}
      {activeTask && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-modal-title"
        >
          <div className="bg-white border border-sky-200 rounded-2xl max-w-lg w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold text-sky-700">
                  {activeTask.subject} · {activeTask.type}
                </p>
                <h2 id="submit-modal-title" className="text-xl font-bold text-slate-900 mt-0.5">
                  {activeTask.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTask(null)}
                aria-label="Close submission modal"
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-sky-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notebook Photo
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleAttachSamplePhoto}
                    className="px-3.5 py-2 bg-white hover:bg-sky-50 text-slate-700 border border-sky-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    Attach Sample Notebook Photo
                  </button>
                </div>

                {photoUrl && (
                  <div className="mt-3">
                    <HomeworkPhoto
                      src={photoUrl}
                      alt="Homework upload preview"
                      className="w-full h-48"
                    />
                  </div>
                )}
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(['Completed', 'Incomplete'] as const).map((status) => {
                    const active = statusChoice === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setStatusChoice(status);
                          setFormError('');
                        }}
                        aria-pressed={active}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors ${
                          active
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="student-submission-note"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Note for {activeTask.subject} Teacher (Optional)
                </label>
                <textarea
                  id="student-submission-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write a short note..."
                  className="w-full px-3.5 py-2 text-sm border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {formError && (
                <p role="alert" className="text-sm text-red-600 font-medium">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
