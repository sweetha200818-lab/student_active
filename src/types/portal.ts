export type Subject = 'Tamil' | 'English' | 'Maths' | 'Science' | 'Social';

export type AttendanceStatus = 'PRESENT' | 'ABSENT';

export type TaskType = 'Assignment' | 'Event';

export type SubmissionStatus = 'Completed' | 'Incomplete';

export interface Student {
  rollNumber: number;
  name: string;
  attendance: AttendanceStatus;
}

export interface Teacher {
  id: string;
  name: string;
  subject: Subject;
}

export interface TaskItem {
  id: string;
  title: string;
  subject: Subject;
  type: TaskType;
  description: string;
  dueDate: string;
  createdByTeacherId: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  taskId: string;
  subject: Subject;
  rollNumber: number;
  status: SubmissionStatus;
  photoUrl: string;
  note: string;
  submittedAt: string;
  marks: number | null;
  feedback: string;
  gradedByTeacherId: string | null;
  gradedAt: string | null;
}

export interface StudentMessage {
  id: string;
  rollNumber: number;
  subject: Subject;
  fromTeacherName: string;
  text: string;
  sentAt: string;
  read: boolean;
}

export type ActiveSession =
  | { role: 'student'; rollNumber: number }
  | { role: 'teacher'; teacherId: string }
  | null;

export interface PortalData {
  students: Student[];
  teachers: Teacher[];
  tasks: TaskItem[];
  submissions: Submission[];
  messages: StudentMessage[];
}
