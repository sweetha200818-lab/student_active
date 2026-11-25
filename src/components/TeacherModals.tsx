import { useState, type FormEvent } from 'react';
import { Send, UserPlus, X } from 'lucide-react';
import type {
  AttendanceStatus,
  Student,
  Submission,
  TaskItem,
  TaskType,
  Teacher,
} from '../types/portal';
import { HomeworkPhoto } from './HomeworkPhoto';

interface CreateTaskModalProps {
  teacher: Teacher;
  onClose: () => void;
  onCreate: (input: {
    title: string;
    type: TaskType;
    description: string;
    dueDate: string;
  }) => { ok: true } | { ok: false; error: string };
}

export function CreateTaskModal({ teacher, onClose, onCreate }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('Assignment');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-11-28');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = onCreate({ title, type, description, dueDate });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
    >
      <div className="bg-white border border-sky-200 rounded-2xl max-w-lg w-full p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-sky-700">{teacher.subject}</p>
            <h2 id="create-task-title" className="text-xl font-bold text-slate-900 mt-0.5">
              Create {teacher.subject} Assignment or Event
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create task modal"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-sky-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Type</span>
            <div className="grid grid-cols-2 gap-2.5">
              {(['Assignment', 'Event'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setType(item)}
                  aria-pressed={type === item}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                    type === item
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="task-title-input" className="block text-sm font-medium text-slate-700 mb-1.5">
              Title
            </label>
            <input
              id="task-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder={`Enter ${teacher.subject} title`}
              className="w-full px-3.5 py-2 text-sm border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label htmlFor="task-due-input" className="block text-sm font-medium text-slate-700 mb-1.5">
              Due Date
            </label>
            <input
              id="task-due-input"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2 text-sm border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono-tabular"
            />
          </div>

          <div>
            <label htmlFor="task-desc-input" className="block text-sm font-medium text-slate-700 mb-1.5">
              Instructions
            </label>
            <textarea
              id="task-desc-input"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError('');
              }}
              placeholder="Write clear instructions for students..."
              className="w-full px-3.5 py-2 text-sm border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 font-medium">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-sky-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
            >
              Publish {teacher.subject} {type}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ReviewGradeModalProps {
  student: Student;
  task: TaskItem;
  submission: Submission;
  onClose: () => void;
  onSaveGrade: (input: {
    submissionId: string;
    marks: number;
    feedback: string;
  }) => { ok: true } | { ok: false; error: string };
}

export function ReviewGradeModal({
  student,
  task,
  submission,
  onClose,
  onSaveGrade,
}: ReviewGradeModalProps) {
  const [marksInput, setMarksInput] = useState<string>(
    submission.marks !== null ? String(submission.marks) : ''
  );
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? '');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!marksInput.trim()) {
      setError('Please enter marks from 0 to 100.');
      return;
    }
    const marks = Number(marksInput);
    const res = onSaveGrade({
      submissionId: submission.id,
      marks,
      feedback,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-grade-title"
    >
      <div className="bg-white border border-sky-200 rounded-2xl max-w-xl w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-sky-700">
              {task.subject} · Roll {student.rollNumber}
            </p>
            <h2 id="review-grade-title" className="text-xl font-bold text-slate-900 mt-0.5">
              Review &amp; Grade · {student.name}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">{task.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review and grade modal"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-sky-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">
              Uploaded Notebook Photo
            </p>
            <HomeworkPhoto
              src={submission.photoUrl}
              alt={`${student.name} Roll ${student.rollNumber} homework`}
              className="w-full h-64"
            />
          </div>

          {submission.note && (
            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Student Note: </span>
              {submission.note}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-sky-100">
            <div>
              <label htmlFor="grade-marks-input" className="block text-sm font-medium text-slate-700 mb-1.5">
                Marks (0 to 100)
              </label>
              <input
                id="grade-marks-input"
                type="number"
                min={0}
                max={100}
                value={marksInput}
                onChange={(e) => {
                  setMarksInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter marks (e.g. 92)"
                className="w-full px-3.5 py-2 text-sm border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono-tabular"
              />
            </div>

            <div>
              <label htmlFor="grade-feedback-input" className="block text-sm font-medium text-slate-700 mb-1.5">
                Teacher Remarks
              </label>
              <textarea
                id="grade-feedback-input"
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={`Write ${task.subject} remarks for ${student.name}...`}
                className="w-full px-3.5 py-2 text-sm border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 font-medium">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
              >
                Save Grade
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface SendMessageModalProps {
  student: Student;
  teacher: Teacher;
  taskTitle?: string;
  onClose: () => void;
  onSend: (input: {
    rollNumber: number;
    text: string;
  }) => { ok: true } | { ok: false; error: string };
}

export function SendMessageModal({
  student,
  teacher,
  taskTitle,
  onClose,
  onSend,
}: SendMessageModalProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const quickTemplates = [
    taskTitle
      ? `Please complete ${teacher.subject} (${taskTitle}) and upload your notebook photo today.`
      : `Please complete your ${teacher.subject} homework today.`,
    `Reminder for Roll ${student.rollNumber}: Submit your ${teacher.subject} notebook page.`,
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = onSend({ rollNumber: student.rollNumber, text });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-message-title"
    >
      <div className="bg-white border border-sky-200 rounded-2xl max-w-lg w-full p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-sky-700">
              {teacher.subject} Teacher Message Box
            </p>
            <h2 id="send-message-title" className="text-xl font-bold text-slate-900 mt-0.5">
              Send Message to Roll Number {student.rollNumber}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">{student.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close send message modal"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-sky-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="block text-xs font-medium text-slate-500 mb-2">
              Quick Fill
            </span>
            <div className="flex flex-col gap-2">
              {quickTemplates.map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => {
                    setText(tpl);
                    if (error) setError('');
                  }}
                  className="text-left px-3 py-2 text-xs text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="message-box-textarea" className="block text-sm font-medium text-slate-700 mb-1.5">
              Message
            </label>
            <textarea
              id="message-box-textarea"
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError('');
              }}
              placeholder={`Write message for Roll Number ${student.rollNumber}...`}
              className="w-full px-3.5 py-2 text-sm border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 font-medium">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-sky-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddStudentModalProps {
  nextRollNumber: number;
  onClose: () => void;
  onAdd: (input: {
    name: string;
    attendance: AttendanceStatus;
  }) => { ok: true } | { ok: false; error: string };
}

export function AddStudentModal({ nextRollNumber, onClose, onAdd }: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState<AttendanceStatus>('PRESENT');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = onAdd({ name, attendance });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-student-title"
    >
      <div className="bg-white border border-sky-200 rounded-2xl max-w-md w-full p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4" aria-hidden="true" />
            </div>
            <h2 id="add-student-title" className="text-xl font-bold text-slate-900">
              Add Student
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add student modal"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-sky-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auto-roll-display" className="block text-sm font-medium text-slate-700 mb-1.5">
              Roll Number
            </label>
            <input
              id="auto-roll-display"
              type="text"
              readOnly
              value={String(nextRollNumber)}
              aria-label="Auto Roll Number"
              className="w-full px-3.5 py-2.5 text-sm bg-sky-50 border border-sky-200 rounded-lg text-sky-900 font-semibold font-mono-tabular focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="new-student-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Student Name
            </label>
            <input
              id="new-student-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter student full name"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1.5">
              Attendance
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {(['PRESENT', 'ABSENT'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setAttendance(status)}
                  aria-pressed={attendance === status}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                    attendance === status
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 font-medium">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-sky-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
            >
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
