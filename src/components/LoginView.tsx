import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  GraduationCap,
  UserCheck,
} from 'lucide-react';
import type { Student, Subject, Teacher } from '../types/portal';
import {
  SUBJECTS,
  authenticateStudent,
  authenticateTeacher,
} from '../utils/portalLogic';

interface LoginViewProps {
  students: Student[];
  teachers: Teacher[];
  onLoginStudent: (rollNumber: number) => void;
  onLoginTeacher: (teacherId: string) => void;
}

type LoginStep = 'welcome' | 'student' | 'teacher';

export function LoginView({
  students,
  teachers,
  onLoginStudent,
  onLoginTeacher,
}: LoginViewProps) {
  const [step, setStep] = useState<LoginStep>('welcome');

  // Student Login state (Username + Password only)
  const [studentUsername, setStudentUsername] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState<string>('');
  const [studentError, setStudentError] = useState<string>('');

  // Teacher Login state (Username + Password, synced with Subject selection)
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Maths');
  const [teacherUsername, setTeacherUsername] = useState<string>('maths.teacher');
  const [teacherPassword, setTeacherPassword] = useState<string>('');
  const [teacherError, setTeacherError] = useState<string>('');

  const handleStudentSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = authenticateStudent(students, studentUsername, studentPassword);
    if (!res.ok) {
      setStudentError(res.error);
      return;
    }
    setStudentError('');
    onLoginStudent(res.student.rollNumber);
  };

  const handleSelectTeacherSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setTeacherUsername(`${subject.toLowerCase()}.teacher`);
    if (teacherError) setTeacherError('');
  };

  const handleTeacherSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = authenticateTeacher(teachers, teacherUsername, teacherPassword);
    if (!res.ok) {
      setTeacherError(res.error);
      return;
    }
    setTeacherError('');
    onLoginTeacher(res.teacher.id);
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white mb-4 shadow-xs">
            <BookOpen className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {step === 'welcome'
              ? 'Welcome to Login'
              : step === 'student'
              ? 'Student Login'
              : 'Teacher Login'}
          </h1>
          <p className="mt-2 text-base text-slate-600">
            School Task &amp; Attendance Portal
          </p>
        </div>

        {step === 'welcome' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <button
              type="button"
              onClick={() => {
                setStudentError('');
                setStep('student');
              }}
              className="bg-white hover:bg-sky-50/70 border border-sky-200 hover:border-sky-400 rounded-2xl p-8 text-left flex flex-col justify-between gap-6 shadow-xs transition-colors group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Student</h2>
                  <p className="text-sm text-slate-600 mt-1.5">
                    Access homework, upload notebook photos, view attendance and teacher messages.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 group-hover:text-sky-800">
                <span>Open Student Login</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setTeacherError('');
                setStep('teacher');
              }}
              className="bg-white hover:bg-sky-50/70 border border-sky-200 hover:border-sky-400 rounded-2xl p-8 text-left flex flex-col justify-between gap-6 shadow-xs transition-colors group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Teacher</h2>
                  <p className="text-sm text-slate-600 mt-1.5">
                    Manage subject assignments, review submissions, grade marks, and track attendance.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 group-hover:text-sky-800">
                <span>Open Teacher Login</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </button>
          </div>
        )}

        {step === 'student' && (
          <section
            aria-labelledby="student-login-heading"
            className="max-w-lg mx-auto bg-white border border-sky-200 rounded-2xl p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="student-login-heading"
                    className="text-xl font-bold text-slate-900"
                  >
                    Student
                  </h2>
                  <p className="text-sm text-slate-600">
                    Enter your username and password
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Back</span>
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="student-username-input"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Username
                </label>
                <input
                  id="student-username-input"
                  type="text"
                  value={studentUsername}
                  onChange={(e) => {
                    setStudentUsername(e.target.value);
                    if (studentError) setStudentError('');
                  }}
                  placeholder={`Roll Number (1 to ${students.length}) or Name`}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label
                  htmlFor="student-password-input"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="student-password-input"
                  type="password"
                  value={studentPassword}
                  onChange={(e) => {
                    setStudentPassword(e.target.value);
                    if (studentError) setStudentError('');
                  }}
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {studentError && (
                <p role="alert" className="text-sm text-red-600 font-medium">
                  {studentError}
                </p>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </section>
        )}

        {step === 'teacher' && (
          <section
            aria-labelledby="teacher-login-heading"
            className="max-w-lg mx-auto bg-white border border-sky-200 rounded-2xl p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="teacher-login-heading"
                    className="text-xl font-bold text-slate-900"
                  >
                    Teacher
                  </h2>
                  <p className="text-sm text-slate-600">
                    Enter your username and password
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Back</span>
              </button>
            </div>

            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">
                  Subject
                </span>
                <div
                  className="grid grid-cols-3 sm:grid-cols-5 gap-2"
                  role="group"
                  aria-label="Select teacher subject"
                >
                  {SUBJECTS.map((subject) => {
                    const active = subject === selectedSubject;
                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSelectTeacherSubject(subject)}
                        aria-pressed={active}
                        className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-sky-50 text-slate-700 border-sky-200 hover:bg-sky-100'
                        }`}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="teacher-username-input"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Username
                </label>
                <input
                  id="teacher-username-input"
                  type="text"
                  value={teacherUsername}
                  onChange={(e) => {
                    setTeacherUsername(e.target.value);
                    if (teacherError) setTeacherError('');
                  }}
                  placeholder="Enter teacher username (e.g. maths.teacher)"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label
                  htmlFor="teacher-password-input"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="teacher-password-input"
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => {
                    setTeacherPassword(e.target.value);
                    if (teacherError) setTeacherError('');
                  }}
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {teacherError && (
                <p role="alert" className="text-sm text-red-600 font-medium">
                  {teacherError}
                </p>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
