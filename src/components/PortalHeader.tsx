import { BookOpen, LogOut } from 'lucide-react';
import type { Student, Teacher } from '../types/portal';

export type TeacherTab = 'tasks' | 'students';

interface PortalHeaderProps {
  mode: 'student' | 'teacher';
  student?: Student;
  teacher?: Teacher;
  teacherTab?: TeacherTab;
  onChangeTeacherTab?: (tab: TeacherTab) => void;
  onLogout: () => void;
}

export function PortalHeader({
  mode,
  student,
  teacher,
  teacherTab = 'tasks',
  onChangeTeacherTab,
  onLogout,
}: PortalHeaderProps) {
  return (
    <header className="bg-white border-b border-sky-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 md:gap-8">
        <div className="flex items-center gap-2.5 min-w-0 shrink">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 truncate whitespace-nowrap">
            School Task &amp; Attendance Portal
          </span>
        </div>

        {mode === 'teacher' && onChangeTeacherTab ? (
          <nav
            className="hidden md:flex items-center gap-1 bg-sky-50 p-1 rounded-lg border border-sky-200 shrink-0"
            aria-label="Teacher sections"
          >
            <button
              type="button"
              onClick={() => onChangeTeacherTab('tasks')}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                teacherTab === 'tasks'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assignments &amp; Events
            </button>
            <button
              type="button"
              onClick={() => onChangeTeacherTab('students')}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                teacherTab === 'students'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Students &amp; Attendance
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center text-sm font-medium text-sky-700 whitespace-nowrap shrink-0">
            Student Workspace
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {mode === 'student' && student && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-700 whitespace-nowrap">
              <span className="font-semibold text-slate-900">{student.name}</span>
              <span aria-hidden="true" className="text-sky-300">·</span>
              <span className="font-mono-tabular text-sky-700">Roll {student.rollNumber}</span>
            </div>
          )}
          {mode === 'teacher' && teacher && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-700 whitespace-nowrap">
              <span className="font-semibold text-slate-900">{teacher.name}</span>
              <span aria-hidden="true" className="text-sky-300">·</span>
              <span className="text-sky-700 font-medium">{teacher.subject}</span>
            </div>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {mode === 'teacher' && onChangeTeacherTab && (
        <nav
          className="md:hidden px-4 pb-3 flex items-center gap-2"
          aria-label="Mobile teacher sections"
        >
          <button
            type="button"
            onClick={() => onChangeTeacherTab('tasks')}
            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
              teacherTab === 'tasks'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-sky-50 text-slate-700 border-sky-200'
            }`}
          >
            Assignments &amp; Events
          </button>
          <button
            type="button"
            onClick={() => onChangeTeacherTab('students')}
            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
              teacherTab === 'students'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-sky-50 text-slate-700 border-sky-200'
            }`}
          >
            Students &amp; Attendance
          </button>
        </nav>
      )}
    </header>
  );
}
