import type { PortalData } from '../types/portal';
import { TEACHERS, createInitialStudents } from '../utils/portalLogic';

export const SAMPLE_MATHS_PHOTO = '/src/assets/images/maths_homework_notebook_1795618640331.jpg';
export const SAMPLE_SCIENCE_PHOTO = '/src/assets/images/science_homework_notebook_1795618640832.jpg';

export function createInitialPortalData(): PortalData {
  const students = createInitialStudents();

  const tasks = [
    {
      id: 'task-maths-1',
      title: 'Quadratic Equations Exercise 4.2',
      subject: 'Maths' as const,
      type: 'Assignment' as const,
      description: 'Solve problems 1 to 10 in your ruled notebook and upload a clear photo.',
      dueDate: '2026-11-26',
      createdByTeacherId: 'teacher-maths',
      createdAt: '2026-11-25T08:00:00.000Z',
    },
    {
      id: 'task-maths-2',
      title: 'Geometry Quiz Preparation Event',
      subject: 'Maths' as const,
      type: 'Event' as const,
      description: 'Practice circle theorem proofs and upload your summary sheet.',
      dueDate: '2026-11-28',
      createdByTeacherId: 'teacher-maths',
      createdAt: '2026-11-25T08:15:00.000Z',
    },
    {
      id: 'task-science-1',
      title: 'Plant Cell Diagram & Functions',
      subject: 'Science' as const,
      type: 'Assignment' as const,
      description: 'Draw a neat labeled diagram of a plant cell and list five organelle functions.',
      dueDate: '2026-11-26',
      createdByTeacherId: 'teacher-science',
      createdAt: '2026-11-25T08:20:00.000Z',
    },
    {
      id: 'task-tamil-1',
      title: 'Thirukkural Essay Writing',
      subject: 'Tamil' as const,
      type: 'Assignment' as const,
      description: 'Write a 200-word essay explaining five couplets on education and discipline.',
      dueDate: '2026-11-27',
      createdByTeacherId: 'teacher-tamil',
      createdAt: '2026-11-25T08:30:00.000Z',
    },
    {
      id: 'task-english-1',
      title: 'Grammar & Comprehension Sheet',
      subject: 'English' as const,
      type: 'Assignment' as const,
      description: 'Complete active-to-passive voice exercises and upload your written page.',
      dueDate: '2026-11-27',
      createdByTeacherId: 'teacher-english',
      createdAt: '2026-11-25T08:40:00.000Z',
    },
    {
      id: 'task-social-1',
      title: 'Indian Freedom Movement Timeline Event',
      subject: 'Social' as const,
      type: 'Event' as const,
      description: 'Prepare a chronological timeline chart from 1905 to 1947 in your notebook.',
      dueDate: '2026-11-29',
      createdByTeacherId: 'teacher-social',
      createdAt: '2026-11-25T08:50:00.000Z',
    },
  ];

  const submissions = [
    {
      id: 'sub-task-maths-1-r1',
      taskId: 'task-maths-1',
      subject: 'Maths' as const,
      rollNumber: 1,
      status: 'Completed' as const,
      photoUrl: SAMPLE_MATHS_PHOTO,
      note: 'Solved all equations with full steps.',
      submittedAt: '2026-11-25T09:15:00.000Z',
      marks: 94,
      feedback: 'Clear step-by-step factorization.',
      gradedByTeacherId: 'teacher-maths',
      gradedAt: '2026-11-25T10:00:00.000Z',
    },
    {
      id: 'sub-task-maths-1-r3',
      taskId: 'task-maths-1',
      subject: 'Maths' as const,
      rollNumber: 3,
      status: 'Completed' as const,
      photoUrl: SAMPLE_MATHS_PHOTO,
      note: 'Completed Exercise 4.2.',
      submittedAt: '2026-11-25T09:42:00.000Z',
      marks: null,
      feedback: '',
      gradedByTeacherId: null,
      gradedAt: null,
    },
    {
      id: 'sub-task-maths-1-r5',
      taskId: 'task-maths-1',
      subject: 'Maths' as const,
      rollNumber: 5,
      status: 'Completed' as const,
      photoUrl: SAMPLE_MATHS_PHOTO,
      note: 'Uploaded notebook solutions.',
      submittedAt: '2026-11-25T10:05:00.000Z',
      marks: null,
      feedback: '',
      gradedByTeacherId: null,
      gradedAt: null,
    },
    {
      id: 'sub-task-science-1-r1',
      taskId: 'task-science-1',
      subject: 'Science' as const,
      rollNumber: 1,
      status: 'Completed' as const,
      photoUrl: SAMPLE_SCIENCE_PHOTO,
      note: 'Labeled all parts neatly.',
      submittedAt: '2026-11-25T09:30:00.000Z',
      marks: null,
      feedback: '',
      gradedByTeacherId: null,
      gradedAt: null,
    },
    {
      id: 'sub-task-science-1-r4',
      taskId: 'task-science-1',
      subject: 'Science' as const,
      rollNumber: 4,
      status: 'Completed' as const,
      photoUrl: SAMPLE_SCIENCE_PHOTO,
      note: 'Diagram completed.',
      submittedAt: '2026-11-25T09:55:00.000Z',
      marks: 88,
      feedback: 'Neat diagram and clear definitions.',
      gradedByTeacherId: 'teacher-science',
      gradedAt: '2026-11-25T10:20:00.000Z',
    },
  ];

  const messages = [
    {
      id: 'msg-seed-1',
      rollNumber: 2,
      subject: 'Maths' as const,
      fromTeacherName: 'Mrs. Meenakshi S (Maths)',
      text: 'Please complete Quadratic Equations Exercise 4.2 and upload your notebook photo.',
      sentAt: '2026-11-25T10:15:00.000Z',
      read: false,
    },
  ];

  return {
    students,
    teachers: TEACHERS,
    tasks,
    submissions,
    messages,
  };
}
