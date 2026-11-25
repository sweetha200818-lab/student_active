import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  Plus,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import type {
  AttendanceStatus,
  Student,
  Submission,
  TaskItem,
  TaskType,
  Teacher,
} from '../types/portal';
import {
  getNextRollNumber,
  getSubmissionsForTeacherTask,
  getTasksForTeacher,
  splitStudentsByTaskCompletion,
} from '../utils/portalLogic';
import { HomeworkPhoto } from './HomeworkPhoto';
import type { TeacherTab } from './PortalHeader';
import {
  AddStudentModal,
  CreateTaskModal,
  ReviewGradeModal,
  SendMessageModal,
} from './TeacherModals';

interface TeacherPortalProps {
  teacher: Teacher;
  activeTab: TeacherTab;
  students: Student[];
  tasks: TaskItem[];
  submissions: Submission[];
  onCreateTask: (input: {
    title: string;
    type: TaskType;
    description: string;
    dueDate: string;
  }) => { ok: true } | { ok: false; error: string };
  onSaveGrade: (input: {
    submissionId: string;
    marks: number;
    feedback: string;
  }) => { ok: true } | { ok: false; error: string };
  onSendMessage: (input: {
    rollNumber: number;
    text: string;
  }) => { ok: true } | { ok: false; error: string };
  onAddStudent: (input: {
    name: string;
    attendance: AttendanceStatus;
  }) => { ok: true; newStudent: Student } | { ok: false; error: string };
  onToggleAttendance: (rollNumber: number) => void;
}

export function TeacherPortal({
  teacher,
  activeTab,
  students,
  tasks,
  submissions,
  onCreateTask,
  onSaveGrade,
  onSendMessage,
  onAddStudent,
  onToggleAttendance,
}: TeacherPortalProps) {
  // Strictly isolated to this teacher's subject
  const subjectTasks = useMemo(
    () => getTasksForTeacher(tasks, teacher.subject),
    [tasks, teacher.subject]
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    subjectTasks[0]?.id ?? ''
  );

  const activeTask =
    subjectTasks.find((t) => t.id === selectedTaskId) ?? subjectTasks[0] ?? null;

  const [completedQuery, setCompletedQuery] = useState('');
  const [incompleteQuery, setIncompleteQuery] = useState('');
  const [rosterQuery, setRosterQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | AttendanceStatus>('ALL');

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [reviewingEntry, setReviewingEntry] = useState<{
    student: Student;
    submission: Submission;
  } | null>(null);
  const [messagingStudent, setMessagingStudent] = useState<Student | null>(null);
  const [statusNotice, setStatusNotice] = useState('');

  const taskSubmissions = useMemo(() => {
    if (!activeTask) return [];
    return getSubmissionsForTeacherTask(
      submissions,
      tasks,
      activeTask.id,
      teacher.subject
    );
  }, [activeTask, submissions, tasks, teacher.subject]);

  const { completed, incomplete } = useMemo(() => {
    if (!activeTask) return { completed: [], incomplete: [] };
    return splitStudentsByTaskCompletion(students, taskSubmissions, activeTask.id);
  }, [activeTask, students, taskSubmissions]);

  const filteredCompleted = useMemo(() => {
    const q = completedQuery.trim().toLowerCase();
    if (!q) return completed;
    return completed.filter(
      ({ student }) =>
        student.name.toLowerCase().includes(q) ||
        String(student.rollNumber).includes(q)
    );
  }, [completed, completedQuery]);

  const filteredIncomplete = useMemo(() => {
    const q = incompleteQuery.trim().toLowerCase();
    if (!q) return incomplete;
    return incomplete.filter(
      ({ student }) =>
        student.name.toLowerCase().includes(q) ||
        String(student.rollNumber).includes(q)
    );
  }, [incomplete, incompleteQuery]);

  const presentCount = useMemo(
    () => students.filter((s) => s.attendance === 'PRESENT').length,
    [students]
  );
  const absentCount = students.length - presentCount;

  const filteredRoster = useMemo(() => {
    const q = rosterQuery.trim().toLowerCase();
    return students.filter((s) => {
      if (attendanceFilter !== 'ALL' && s.attendance !== attendanceFilter) {
        return false;
      }
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) || String(s.rollNumber).includes(q)
      );
    });
  }, [students, rosterQuery, attendanceFilter]);

  const nextRollNumber = getNextRollNumber(students);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {statusNotice && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 px-4 py-3 bg-white border border-sky-300 rounded-xl text-sm text-sky-900 shadow-xs"
        >
          <span>{statusNotice}</span>
          <button
            type="button"
            onClick={() => setStatusNotice('')}
            aria-label="Dismiss notification"
            className="text-slate-500 hover:text-slate-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTab === 'tasks' ? (
        <div className="space-y-6">
          {/* Subject Header & Create Action */}
          <section className="bg-white border border-sky-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-sky-700">
                {teacher.subject} Department
              </p>
              <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                {teacher.subject} Assignments &amp; Events
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Viewing {teacher.subject} tasks and student submissions only.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateTaskModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Create Assignment / Event</span>
            </button>
          </section>

          {/* Subject Task Selector */}
          {subjectTasks.length === 0 ? (
            <div className="bg-white border border-sky-200 rounded-2xl p-10 text-center">
              <p className="text-sm text-slate-600">
                No {teacher.subject} assignments or events created yet.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3" role="tablist" aria-label={`${teacher.subject} tasks`}>
                {subjectTasks.map((task) => {
                  const isActive = activeTask?.id === task.id;
                  return (
                    <button
                      key={task.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`px-4 py-3 text-left rounded-xl border transition-colors min-w-[220px] ${
                        isActive
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-900 border-sky-200 hover:bg-sky-50'
                      }`}
                    >
                      <div
                        className={`text-xs font-medium ${
                          isActive ? 'text-sky-100' : 'text-sky-700'
                        }`}
                      >
                        {task.subject} · {task.type} · Due {task.dueDate}
                      </div>
                      <div className="text-sm font-bold mt-1 truncate max-w-[280px]">
                        {task.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeTask && (
                <section className="bg-white border border-sky-200 rounded-2xl p-6 shadow-xs space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-sky-100">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-sky-700">
                          {activeTask.subject}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{activeTask.type}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">
                          Due {activeTask.dueDate}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mt-1">
                        {activeTask.title}
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        {activeTask.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-center">
                        <div className="text-xs text-slate-600 font-medium">
                          Completed
                        </div>
                        <div className="text-xl font-bold text-sky-700 font-mono-tabular">
                          {completed.length}
                        </div>
                      </div>
                      <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-xs text-slate-600 font-medium">
                          Incomplete
                        </div>
                        <div className="text-xl font-bold text-slate-900 font-mono-tabular">
                          {incomplete.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Two-List Tracker */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Completed Students List */}
                    <div className="border border-sky-200 rounded-xl bg-sky-50/30 p-4 flex flex-col">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-sky-600" aria-hidden="true" />
                          <h3 className="text-base font-bold text-slate-900">
                            Completed Students ({completed.length})
                          </h3>
                        </div>
                      </div>

                      <div className="relative mb-3">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                        <input
                          type="search"
                          value={completedQuery}
                          onChange={(e) => setCompletedQuery(e.target.value)}
                          placeholder="Search completed by name or roll..."
                          aria-label="Search completed students"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                        {filteredCompleted.length === 0 ? (
                          <p className="text-sm text-slate-500 py-6 text-center bg-white rounded-lg border border-sky-100">
                            No completed submissions yet.
                          </p>
                        ) : (
                          filteredCompleted.map(({ student, submission }) => (
                            <div
                              key={student.rollNumber}
                              className="bg-white border border-sky-200 rounded-xl p-3.5 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReviewingEntry({ student, submission })
                                  }
                                  className="shrink-0 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-sky-500"
                                  aria-label={`View photo from Roll ${student.rollNumber} ${student.name}`}
                                >
                                  <HomeworkPhoto
                                    src={submission.photoUrl}
                                    alt={`${student.name} submission thumbnail`}
                                    className="w-14 h-14"
                                  />
                                </button>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 truncate">
                                    <span className="truncate">{student.name}</span>
                                    <span className="text-xs font-mono-tabular text-sky-700 shrink-0">
                                      Roll {student.rollNumber}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 font-mono-tabular mt-0.5">
                                    Submitted {new Date(submission.submittedAt).toLocaleString()}
                                  </div>
                                  <div className="text-xs font-semibold mt-1 font-mono-tabular">
                                    {submission.marks !== null ? (
                                      <span className="text-sky-700">
                                        Marks: {submission.marks} / 100
                                      </span>
                                    ) : (
                                      <span className="text-slate-600">
                                        Pending Review
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                aria-label={`Review and grade Roll ${student.rollNumber} ${student.name}`}
                                onClick={() =>
                                  setReviewingEntry({ student, submission })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Review &amp; Grade</span>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Incomplete Students List */}
                    <div className="border border-sky-200 rounded-xl bg-white p-4 flex flex-col">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-slate-500" aria-hidden="true" />
                          <h3 className="text-base font-bold text-slate-900">
                            Incomplete Students ({incomplete.length})
                          </h3>
                        </div>
                      </div>

                      <div className="relative mb-3">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                        <input
                          type="search"
                          value={incompleteQuery}
                          onChange={(e) => setIncompleteQuery(e.target.value)}
                          placeholder="Search incomplete by name or roll..."
                          aria-label="Search incomplete students"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-sky-50/40 border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                        {filteredIncomplete.length === 0 ? (
                          <p className="text-sm text-slate-500 py-6 text-center bg-sky-50/40 rounded-lg border border-sky-100">
                            All students have completed this task.
                          </p>
                        ) : (
                          filteredIncomplete.map(({ student, submission }) => (
                            <div
                              key={student.rollNumber}
                              className="bg-sky-50/30 border border-sky-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                  <span className="font-mono-tabular text-sky-700 shrink-0">
                                    Roll {student.rollNumber}
                                  </span>
                                  <span className="truncate">{student.name}</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {student.attendance}
                                  {submission ? ' · Marked Incomplete' : ' · Not Submitted'}
                                </div>
                              </div>

                              <button
                                type="button"
                                aria-label={`Send message to Roll ${student.rollNumber} ${student.name}`}
                                onClick={() => setMessagingStudent(student)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-white hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                              >
                                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Send Message</span>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      ) : (
        /* Students & Attendance Tab */
        <div className="space-y-6">
          {/* 3 Summary Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-sky-200 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-medium text-slate-600">Total Students</div>
              <div className="text-3xl font-bold text-slate-900 mt-1 font-mono-tabular">
                {students.length}
              </div>
            </div>
            <div className="bg-white border border-sky-200 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-medium text-slate-600">Present Today</div>
              <div className="text-3xl font-bold text-sky-700 mt-1 font-mono-tabular">
                {presentCount}
              </div>
            </div>
            <div className="bg-white border border-sky-200 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-medium text-slate-600">Absent Today</div>
              <div className="text-3xl font-bold text-slate-900 mt-1 font-mono-tabular">
                {absentCount}
              </div>
            </div>
          </section>

          {/* Roster Controls & Table */}
          <section className="bg-white border border-sky-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Students &amp; Attendance Roster
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Roll 1 to {students.length}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddStudentModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                <span>Add Student</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={rosterQuery}
                  onChange={(e) => setRosterQuery(e.target.value)}
                  placeholder="Search student by name or roll number..."
                  aria-label="Search student roster"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-sky-50/40 border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-lg border border-sky-200" role="group" aria-label="Filter by attendance">
                {(['ALL', 'PRESENT', 'ABSENT'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setAttendanceFilter(status)}
                    aria-pressed={attendanceFilter === status}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      attendanceFilter === status
                        ? 'bg-white text-sky-700 shadow-xs border border-sky-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status === 'ALL' ? 'All' : status === 'PRESENT' ? 'Present' : 'Absent'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto border border-sky-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sky-50 border-b border-sky-200 text-xs font-semibold text-slate-700">
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 text-sm">
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No students match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map((student) => (
                      <tr
                        key={student.rollNumber}
                        className="hover:bg-sky-50/40 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-mono-tabular font-semibold text-sky-800">
                          {student.rollNumber}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">
                          {student.name}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`text-xs font-bold ${
                              student.attendance === 'PRESENT'
                                ? 'text-sky-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {student.attendance}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              aria-label={`Toggle attendance for Roll ${student.rollNumber} ${student.name}`}
                              onClick={() => onToggleAttendance(student.rollNumber)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-lg transition-colors whitespace-nowrap"
                            >
                              {student.attendance === 'PRESENT'
                                ? 'Mark Absent'
                                : 'Mark Present'}
                            </button>
                            <button
                              type="button"
                              aria-label={`Message Roll ${student.rollNumber} ${student.name}`}
                              onClick={() => setMessagingStudent(student)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Message</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {showCreateTaskModal && (
        <CreateTaskModal
          teacher={teacher}
          onClose={() => setShowCreateTaskModal(false)}
          onCreate={(input) => {
            const res = onCreateTask(input);
            if (res.ok) {
              setStatusNotice(
                `Created ${teacher.subject} ${input.type}: ${input.title}.`
              );
            }
            return res;
          }}
        />
      )}

      {reviewingEntry && activeTask && (
        <ReviewGradeModal
          student={reviewingEntry.student}
          task={activeTask}
          submission={reviewingEntry.submission}
          onClose={() => setReviewingEntry(null)}
          onSaveGrade={(input) => {
            const res = onSaveGrade(input);
            if (res.ok) {
              setStatusNotice(
                `Saved ${input.marks}/100 for Roll ${reviewingEntry.student.rollNumber} (${reviewingEntry.student.name}) in ${teacher.subject}.`
              );
            }
            return res;
          }}
        />
      )}

      {messagingStudent && (
        <SendMessageModal
          student={messagingStudent}
          teacher={teacher}
          taskTitle={activeTask?.title}
          onClose={() => setMessagingStudent(null)}
          onSend={(input) => {
            const res = onSendMessage(input);
            if (res.ok) {
              setStatusNotice(
                `Message sent to Roll Number ${input.rollNumber} (${messagingStudent.name}).`
              );
            }
            return res;
          }}
        />
      )}

      {showAddStudentModal && (
        <AddStudentModal
          nextRollNumber={nextRollNumber}
          onClose={() => setShowAddStudentModal(false)}
          onAdd={(input) => {
            const res = onAddStudent(input);
            if (res.ok) {
              setStatusNotice(
                `Added Roll ${res.newStudent.rollNumber} · ${res.newStudent.name} (${res.newStudent.attendance}).`
              );
              return { ok: true };
            }
            return res;
          }}
        />
      )}
    </main>
  );
}
