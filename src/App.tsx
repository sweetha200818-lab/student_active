/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { LoginView } from './components/LoginView';
import { PortalHeader, type TeacherTab } from './components/PortalHeader';
import { StudentPortal } from './components/StudentPortal';
import { TeacherPortal } from './components/TeacherPortal';
import { createInitialPortalData } from './data/seedData';
import type {
  ActiveSession,
  AttendanceStatus,
  PortalData,
  SubmissionStatus,
  TaskItem,
  TaskType,
} from './types/portal';
import {
  addStudentRecord,
  createStudentMessageRecord,
  createTaskRecord,
  findStudentByRoll,
  gradeSubmissionRecord,
  submitStudentWork,
} from './utils/portalLogic';

const DATA_STORAGE_KEY = 'school_portal_data_v1';
const SESSION_STORAGE_KEY = 'school_portal_session_v1';

function loadInitialData(): PortalData {
  try {
    const raw = window.localStorage.getItem(DATA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PortalData;
      if (
        parsed &&
        Array.isArray(parsed.students) &&
        Array.isArray(parsed.teachers) &&
        Array.isArray(parsed.tasks) &&
        Array.isArray(parsed.submissions) &&
        Array.isArray(parsed.messages)
      ) {
        return parsed;
      }
    }
  } catch {
    // Fall back to fresh deterministic seed data
  }
  return createInitialPortalData();
}

function loadInitialSession(): ActiveSession {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return { role: 'teacher', teacherId: 'teacher-maths' };
    }
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ActiveSession;
    }
  } catch {
    // Ignore storage read issues
  }
  return null;
}

export default function App() {
  const [data, setData] = useState<PortalData>(() => loadInitialData());
  const [session, setSession] = useState<ActiveSession>(() => loadInitialSession());
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('tasks');

  useEffect(() => {
    try {
      window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota errors
    }
  }, [data]);

  useEffect(() => {
    try {
      if (session) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [session]);

  const activeStudent =
    session?.role === 'student'
      ? findStudentByRoll(data.students, session.rollNumber)
      : undefined;

  const activeTeacher =
    session?.role === 'teacher'
      ? data.teachers.find((t) => t.id === session.teacherId)
      : undefined;

  const handleLoginStudent = (rollNumber: number) => {
    setSession({ role: 'student', rollNumber });
  };

  const handleLoginTeacher = (teacherId: string) => {
    setTeacherTab('tasks');
    setSession({ role: 'teacher', teacherId });
  };

  const handleLogout = () => {
    setSession(null);
  };

  if (!session || (session.role === 'student' && !activeStudent) || (session.role === 'teacher' && !activeTeacher)) {
    return (
      <LoginView
        students={data.students}
        teachers={data.teachers}
        onLoginStudent={handleLoginStudent}
        onLoginTeacher={handleLoginTeacher}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-slate-900">
      <PortalHeader
        mode={session.role}
        student={activeStudent}
        teacher={activeTeacher}
        teacherTab={teacherTab}
        onChangeTeacherTab={setTeacherTab}
        onLogout={handleLogout}
      />

      {session.role === 'student' && activeStudent && (
        <StudentPortal
          student={activeStudent}
          tasks={data.tasks}
          submissions={data.submissions}
          messages={data.messages}
          onSubmitWork={(input: {
            task: TaskItem;
            status: SubmissionStatus;
            photoUrl: string;
            note: string;
          }) => {
            const res = submitStudentWork(data.submissions, {
              ...input,
              rollNumber: activeStudent.rollNumber,
            });
            if (!res.ok) return { ok: false, error: res.error };
            setData((prev) => ({ ...prev, submissions: res.submissions }));
            return { ok: true };
          }}
          onMarkMessageRead={(messageId) => {
            setData((prev) => ({
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === messageId ? { ...m, read: true } : m
              ),
            }));
          }}
        />
      )}

      {session.role === 'teacher' && activeTeacher && (
        <TeacherPortal
          key={activeTeacher.id}
          teacher={activeTeacher}
          activeTab={teacherTab}
          students={data.students}
          tasks={data.tasks}
          submissions={data.submissions}
          onCreateTask={(input: {
            title: string;
            type: TaskType;
            description: string;
            dueDate: string;
          }) => {
            const res = createTaskRecord(data.tasks, {
              ...input,
              subject: activeTeacher.subject,
              teacherId: activeTeacher.id,
            });
            if (!res.ok) return { ok: false, error: res.error };
            setData((prev) => ({ ...prev, tasks: res.tasks }));
            return { ok: true };
          }}
          onSaveGrade={(input) => {
            const res = gradeSubmissionRecord(data.submissions, {
              ...input,
              teacher: activeTeacher,
            });
            if (!res.ok) return { ok: false, error: res.error };
            setData((prev) => ({ ...prev, submissions: res.submissions }));
            return { ok: true };
          }}
          onSendMessage={(input) => {
            const res = createStudentMessageRecord(data.messages, {
              ...input,
              teacher: activeTeacher,
            });
            if (!res.ok) return { ok: false, error: res.error };
            setData((prev) => ({ ...prev, messages: res.messages }));
            return { ok: true };
          }}
          onAddStudent={(input: { name: string; attendance: AttendanceStatus }) => {
            const res = addStudentRecord(data.students, input);
            if (!res.ok) return { ok: false, error: res.error };
            setData((prev) => ({ ...prev, students: res.students }));
            return { ok: true, newStudent: res.newStudent };
          }}
          onToggleAttendance={(rollNumber) => {
            setData((prev) => ({
              ...prev,
              students: prev.students.map((s) =>
                s.rollNumber === rollNumber
                  ? {
                      ...s,
                      attendance:
                        s.attendance === 'PRESENT' ? 'ABSENT' : 'PRESENT',
                    }
                  : s
              ),
            }));
          }}
        />
      )}
    </div>
  );
}
