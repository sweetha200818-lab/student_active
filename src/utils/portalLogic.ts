import type {
  AttendanceStatus,
  Student,
  StudentMessage,
  Submission,
  SubmissionStatus,
  Subject,
  TaskItem,
  TaskType,
  Teacher,
} from '../types/portal';

export const SUBJECTS: Subject[] = ['Tamil', 'English', 'Maths', 'Science', 'Social'];

export const TEACHERS: Teacher[] = [
  { id: 'teacher-tamil', name: 'Ms. Kavitha R', subject: 'Tamil' },
  { id: 'teacher-english', name: 'Mr. Arun Kumar', subject: 'English' },
  { id: 'teacher-maths', name: 'Mrs. Meenakshi S', subject: 'Maths' },
  { id: 'teacher-science', name: 'Dr. Rajesh V', subject: 'Science' },
  { id: 'teacher-social', name: 'Mr. Suresh Babu', subject: 'Social' },
];

const FIRST_NAMES = [
  'Aarav', 'Priya', 'Diya', 'Vikram', 'Ananya', 'Rohan', 'Sneha', 'Karthik', 'Meera', 'Aditya',
  'Nandini', 'Siddharth', 'Kavya', 'Pranav', 'Divya', 'Harish', 'Shruti', 'Arjun', 'Lakshmi', 'Nikhil',
  'Pooja', 'Varun', 'Roshni', 'Deepak', 'Aishwarya', 'Kiran', 'Swathi', 'Manoj', 'Keerthana', 'Surya',
  'Bhavana', 'Gowtham', 'Nithya', 'Vignesh', 'Pavithra', 'Naveen', 'Sangeetha', 'Ashwin', 'Janani', 'Tarun',
  'Harini', 'Bala', 'Ramya', 'Dinesh', 'Shalini', 'Muthu', 'Lavanya', 'Santhosh', 'Revathi', 'Yuvaraj',
];

const LAST_NAMES = [
  'Sharma', 'Venkatesh', 'Nair', 'Patel', 'Iyer', 'Krishnan', 'Rajan', 'Menon', 'Subramanian', 'Sundaram',
  'Balaji', 'Natarajan', 'Murugan', 'Kalyan', 'Prasad', 'Verma', 'Reddy', 'Gopal', 'Raman', 'Chandra',
];

export function createInitialStudents(): Student[] {
  const students: Student[] = [
    { rollNumber: 1, name: 'Aarav Sharma', attendance: 'PRESENT' },
    { rollNumber: 2, name: 'Priya Venkatesh', attendance: 'ABSENT' },
  ];

  for (let roll = 3; roll <= 100; roll++) {
    const first = FIRST_NAMES[(roll - 1) % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor((roll - 1) / 5) % LAST_NAMES.length];
    // Deterministic realistic attendance: ~88% present, ~12% absent
    const attendance: AttendanceStatus = roll % 9 === 0 ? 'ABSENT' : 'PRESENT';
    students.push({
      rollNumber: roll,
      name: `${first} ${last}`,
      attendance,
    });
  }

  return students;
}

export function getNextRollNumber(students: Student[]): number {
  if (students.length === 0) {
    return 1;
  }
  const maxRoll = students.reduce((max, s) => Math.max(max, s.rollNumber), 0);
  return maxRoll + 1;
}

export function addStudentRecord(
  students: Student[],
  input: { name: string; attendance: AttendanceStatus }
): { ok: true; students: Student[]; newStudent: Student } | { ok: false; error: string } {
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    return { ok: false, error: 'Student name is required.' };
  }
  if (trimmedName.length < 2) {
    return { ok: false, error: 'Student name must be at least 2 characters.' };
  }

  const nextRoll = getNextRollNumber(students);
  const newStudent: Student = {
    rollNumber: nextRoll,
    name: trimmedName,
    attendance: input.attendance,
  };

  return {
    ok: true,
    students: [...students, newStudent],
    newStudent,
  };
}

export function findStudentByRoll(students: Student[], rollNumber: number): Student | undefined {
  return students.find((s) => s.rollNumber === rollNumber);
}

export function getTasksForTeacher(tasks: TaskItem[], teacherSubject: Subject): TaskItem[] {
  return tasks.filter((task) => task.subject === teacherSubject);
}

export function canTeacherAccessTask(task: TaskItem | undefined, teacherSubject: Subject): boolean {
  if (!task) return false;
  return task.subject === teacherSubject;
}

export function getSubmissionsForTeacherTask(
  submissions: Submission[],
  tasks: TaskItem[],
  taskId: string,
  teacherSubject: Subject
): Submission[] {
  const task = tasks.find((t) => t.id === taskId);
  if (!canTeacherAccessTask(task, teacherSubject)) {
    return [];
  }
  return submissions.filter((sub) => sub.taskId === taskId && sub.subject === teacherSubject);
}

export interface CompletedStudentEntry {
  student: Student;
  submission: Submission;
}

export interface IncompleteStudentEntry {
  student: Student;
  submission: Submission | null;
}

export function splitStudentsByTaskCompletion(
  students: Student[],
  submissions: Submission[],
  taskId: string
): {
  completed: CompletedStudentEntry[];
  incomplete: IncompleteStudentEntry[];
} {
  const submissionByRoll = new Map<number, Submission>();
  for (const sub of submissions) {
    if (sub.taskId === taskId) {
      submissionByRoll.set(sub.rollNumber, sub);
    }
  }

  const completed: CompletedStudentEntry[] = [];
  const incomplete: IncompleteStudentEntry[] = [];

  for (const student of students) {
    const sub = submissionByRoll.get(student.rollNumber) ?? null;
    if (sub && sub.status === 'Completed') {
      completed.push({ student, submission: sub });
    } else {
      incomplete.push({ student, submission: sub });
    }
  }

  completed.sort((a, b) => b.submission.submittedAt.localeCompare(a.submission.submittedAt));
  incomplete.sort((a, b) => a.student.rollNumber - b.student.rollNumber);

  return { completed, incomplete };
}

export function createTaskRecord(
  tasks: TaskItem[],
  input: {
    title: string;
    subject: Subject;
    type: TaskType;
    description: string;
    dueDate: string;
    teacherId: string;
    nowIso?: string;
  }
): { ok: true; tasks: TaskItem[]; newTask: TaskItem } | { ok: false; error: string } {
  const title = input.title.trim();
  const description = input.description.trim();
  const dueDate = input.dueDate.trim();

  if (!title) {
    return { ok: false, error: 'Title is required.' };
  }
  if (!description) {
    return { ok: false, error: 'Instructions are required.' };
  }
  if (!dueDate) {
    return { ok: false, error: 'Due date is required.' };
  }

  const nowIso = input.nowIso ?? new Date().toISOString();
  const newTask: TaskItem = {
    id: `task-${input.subject.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    subject: input.subject,
    type: input.type,
    description,
    dueDate,
    createdByTeacherId: input.teacherId,
    createdAt: nowIso,
  };

  return {
    ok: true,
    tasks: [newTask, ...tasks],
    newTask,
  };
}

export function submitStudentWork(
  submissions: Submission[],
  input: {
    task: TaskItem;
    rollNumber: number;
    status: SubmissionStatus;
    photoUrl: string;
    note: string;
    nowIso?: string;
  }
): { ok: true; submissions: Submission[]; submission: Submission } | { ok: false; error: string } {
  if (input.status === 'Completed' && !input.photoUrl.trim()) {
    return { ok: false, error: 'Please upload a homework photo before submitting as Completed.' };
  }

  const nowIso = input.nowIso ?? new Date().toISOString();
  const existingIndex = submissions.findIndex(
    (s) => s.taskId === input.task.id && s.rollNumber === input.rollNumber
  );

  const existing = existingIndex >= 0 ? submissions[existingIndex] : null;
  const submission: Submission = {
    id: existing?.id ?? `sub-${input.task.id}-r${input.rollNumber}`,
    taskId: input.task.id,
    subject: input.task.subject,
    rollNumber: input.rollNumber,
    status: input.status,
    photoUrl: input.photoUrl.trim(),
    note: input.note.trim(),
    submittedAt: nowIso,
    marks: existing?.marks ?? null,
    feedback: existing?.feedback ?? '',
    gradedByTeacherId: existing?.gradedByTeacherId ?? null,
    gradedAt: existing?.gradedAt ?? null,
  };

  const nextSubmissions =
    existingIndex >= 0
      ? submissions.map((s, idx) => (idx === existingIndex ? submission : s))
      : [submission, ...submissions];

  return { ok: true, submissions: nextSubmissions, submission };
}

export function gradeSubmissionRecord(
  submissions: Submission[],
  input: {
    submissionId: string;
    teacher: Teacher;
    marks: number;
    feedback: string;
    nowIso?: string;
  }
): { ok: true; submissions: Submission[] } | { ok: false; error: string } {
  const target = submissions.find((s) => s.id === input.submissionId);
  if (!target) {
    return { ok: false, error: 'Submission not found.' };
  }
  if (target.subject !== input.teacher.subject) {
    return {
      ok: false,
      error: `Only the ${target.subject} teacher can grade this submission.`,
    };
  }
  if (Number.isNaN(input.marks) || input.marks < 0 || input.marks > 100) {
    return { ok: false, error: 'Marks must be between 0 and 100.' };
  }

  const nowIso = input.nowIso ?? new Date().toISOString();
  const updated = submissions.map((s) =>
    s.id === input.submissionId
      ? {
          ...s,
          marks: Math.round(input.marks),
          feedback: input.feedback.trim(),
          gradedByTeacherId: input.teacher.id,
          gradedAt: nowIso,
        }
      : s
  );

  return { ok: true, submissions: updated };
}

export function createStudentMessageRecord(
  messages: StudentMessage[],
  input: {
    rollNumber: number;
    teacher: Teacher;
    text: string;
    nowIso?: string;
  }
): { ok: true; messages: StudentMessage[]; newMessage: StudentMessage } | { ok: false; error: string } {
  const text = input.text.trim();
  if (!text) {
    return { ok: false, error: 'Please enter a message before sending.' };
  }

  const nowIso = input.nowIso ?? new Date().toISOString();
  const newMessage: StudentMessage = {
    id: `msg-${input.rollNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    rollNumber: input.rollNumber,
    subject: input.teacher.subject,
    fromTeacherName: `${input.teacher.name} (${input.teacher.subject})`,
    text,
    sentAt: nowIso,
    read: false,
  };

  return {
    ok: true,
    messages: [newMessage, ...messages],
    newMessage,
  };
}

export function authenticateStudent(
  students: Student[],
  username: string,
  password: string
): { ok: true; student: Student } | { ok: false; error: string } {
  const rawUser = username.trim();
  if (!rawUser) {
    return { ok: false, error: 'Please enter your Roll Number or Name.' };
  }
  if (!password.trim() || password.trim().length < 4) {
    return { ok: false, error: 'Please enter a password (at least 4 characters).' };
  }

  const normalized = rawUser.toLowerCase().replace(/^roll\s+/, '');
  const numericRoll = Number(normalized);
  let found: Student | undefined;

  if (Number.isInteger(numericRoll) && numericRoll >= 1 && /^\d+$/.test(normalized)) {
    found = findStudentByRoll(students, numericRoll);
  } else {
    found = students.find((s) => s.name.toLowerCase() === rawUser.toLowerCase());
  }

  if (!found) {
    return { ok: false, error: 'Student not found. Check your Roll Number or Name.' };
  }

  return { ok: true, student: found };
}

export function authenticateTeacher(
  teachers: Teacher[],
  username: string,
  password: string
): { ok: true; teacher: Teacher } | { ok: false; error: string } {
  const rawUser = username.trim().toLowerCase();
  if (!rawUser) {
    return { ok: false, error: 'Please enter your teacher username.' };
  }
  if (!password.trim() || password.trim().length < 4) {
    return { ok: false, error: 'Please enter a password (at least 4 characters).' };
  }

  const found = teachers.find((t) => {
    const subj = t.subject.toLowerCase();
    const name = t.name.toLowerCase();
    return (
      rawUser === subj ||
      rawUser === `${subj}.teacher` ||
      rawUser === `${subj} teacher` ||
      rawUser === name
    );
  });

  if (!found) {
    return {
      ok: false,
      error: 'Teacher not found. Enter a subject username such as maths, tamil, english, science, or social.',
    };
  }

  return { ok: true, teacher: found };
}

