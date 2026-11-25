import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TEACHERS,
  addStudentRecord,
  createInitialStudents,
  createStudentMessageRecord,
  createTaskRecord,
  getNextRollNumber,
  getSubmissionsForTeacherTask,
  getTasksForTeacher,
  gradeSubmissionRecord,
  splitStudentsByTaskCompletion,
  submitStudentWork,
} from './portalLogic';

test('initializes exactly 100 students with Roll 1 Present and Roll 2 Absent', () => {
  const students = createInitialStudents();
  assert.equal(students.length, 100);
  assert.equal(students[0].rollNumber, 1);
  assert.equal(students[0].name, 'Aarav Sharma');
  assert.equal(students[0].attendance, 'PRESENT');
  assert.equal(students[1].rollNumber, 2);
  assert.equal(students[1].name, 'Priya Venkatesh');
  assert.equal(students[1].attendance, 'ABSENT');
  assert.equal(students[99].rollNumber, 100);
});

test('auto-calculates Roll 101 when Add Student is used on 100 students', () => {
  const students = createInitialStudents();
  assert.equal(getNextRollNumber(students), 101);

  const res = addStudentRecord(students, { name: 'Karthik Subramanian', attendance: 'PRESENT' });
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.newStudent.rollNumber, 101);
    assert.equal(res.students.length, 101);
    assert.equal(getNextRollNumber(res.students), 102);
  }
});

test('subject isolation: Maths teacher only sees and grades Maths tasks and submissions', () => {
  const mathsTeacher = TEACHERS.find((t) => t.subject === 'Maths')!;
  const scienceTeacher = TEACHERS.find((t) => t.subject === 'Science')!;

  const t1 = createTaskRecord([], {
    title: 'Algebra Homework',
    subject: 'Maths',
    type: 'Assignment',
    description: 'Solve 5 problems.',
    dueDate: '2026-11-26',
    teacherId: mathsTeacher.id,
  });
  assert.equal(t1.ok, true);
  if (!t1.ok) return;

  const t2 = createTaskRecord(t1.tasks, {
    title: 'Plant Cell Diagram',
    subject: 'Science',
    type: 'Assignment',
    description: 'Draw and label.',
    dueDate: '2026-11-26',
    teacherId: scienceTeacher.id,
  });
  assert.equal(t2.ok, true);
  if (!t2.ok) return;

  const mathsTasks = getTasksForTeacher(t2.tasks, 'Maths');
  assert.equal(mathsTasks.length, 1);
  assert.equal(mathsTasks[0].subject, 'Maths');

  const subRes = submitStudentWork([], {
    task: t1.newTask,
    rollNumber: 1,
    status: 'Completed',
    photoUrl: '/sample.jpg',
    note: 'Done',
  });
  assert.equal(subRes.ok, true);
  if (!subRes.ok) return;

  // Maths teacher sees the Maths submission
  const mathsSubs = getSubmissionsForTeacherTask(
    subRes.submissions,
    t2.tasks,
    t1.newTask.id,
    'Maths'
  );
  assert.equal(mathsSubs.length, 1);

  // Science teacher MUST NOT see or grade the Maths submission
  const scienceViewingMaths = getSubmissionsForTeacherTask(
    subRes.submissions,
    t2.tasks,
    t1.newTask.id,
    'Science'
  );
  assert.equal(scienceViewingMaths.length, 0);

  const blockedGrade = gradeSubmissionRecord(subRes.submissions, {
    submissionId: subRes.submission.id,
    teacher: scienceTeacher,
    marks: 95,
    feedback: 'Unauthorized',
  });
  assert.equal(blockedGrade.ok, false);

  const allowedGrade = gradeSubmissionRecord(subRes.submissions, {
    submissionId: subRes.submission.id,
    teacher: mathsTeacher,
    marks: 95,
    feedback: 'Well solved',
  });
  assert.equal(allowedGrade.ok, true);
});

test('splits all 100 students cleanly into Completed and Incomplete lists', () => {
  const students = createInitialStudents();
  const mathsTeacher = TEACHERS.find((t) => t.subject === 'Maths')!;
  const taskRes = createTaskRecord([], {
    title: 'Geometry Set',
    subject: 'Maths',
    type: 'Assignment',
    description: 'Complete exercises.',
    dueDate: '2026-11-26',
    teacherId: mathsTeacher.id,
  });
  if (!taskRes.ok) return;

  const sub1 = submitStudentWork([], {
    task: taskRes.newTask,
    rollNumber: 1,
    status: 'Completed',
    photoUrl: '/photo.jpg',
    note: 'Finished',
  });
  if (!sub1.ok) return;

  const sub2 = submitStudentWork(sub1.submissions, {
    task: taskRes.newTask,
    rollNumber: 2,
    status: 'Incomplete',
    photoUrl: '',
    note: 'In progress',
  });
  if (!sub2.ok) return;

  const split = splitStudentsByTaskCompletion(students, sub2.submissions, taskRes.newTask.id);
  assert.equal(split.completed.length, 1);
  assert.equal(split.completed[0].student.rollNumber, 1);
  assert.equal(split.incomplete.length, 99);
  assert.equal(split.completed.length + split.incomplete.length, 100);
});

test('creates targeted message for a specific roll number and rejects empty message', () => {
  const mathsTeacher = TEACHERS.find((t) => t.subject === 'Maths')!;
  const bad = createStudentMessageRecord([], {
    rollNumber: 2,
    teacher: mathsTeacher,
    text: '   ',
  });
  assert.equal(bad.ok, false);

  const good = createStudentMessageRecord([], {
    rollNumber: 2,
    teacher: mathsTeacher,
    text: 'Please complete Maths homework today.',
  });
  assert.equal(good.ok, true);
  if (good.ok) {
    assert.equal(good.newMessage.rollNumber, 2);
    assert.equal(good.newMessage.subject, 'Maths');
  }
});

import { authenticateStudent, authenticateTeacher } from './portalLogic';

test('authenticates students by roll number or name and validates password', () => {
  const students = createInitialStudents();
  assert.equal(authenticateStudent(students, '', 'pass123').ok, false);
  assert.equal(authenticateStudent(students, '1', '12').ok, false);
  assert.equal(authenticateStudent(students, '999', 'pass123').ok, false);

  const byRoll = authenticateStudent(students, '2', 'pass123');
  assert.equal(byRoll.ok, true);
  if (byRoll.ok) assert.equal(byRoll.student.name, 'Priya Venkatesh');

  const byName = authenticateStudent(students, 'Aarav Sharma', 'pass123');
  assert.equal(byName.ok, true);
  if (byName.ok) assert.equal(byName.student.rollNumber, 1);
});

test('authenticates teachers by subject username and validates password', () => {
  assert.equal(authenticateTeacher(TEACHERS, '', 'pass123').ok, false);
  assert.equal(authenticateTeacher(TEACHERS, 'maths', '12').ok, false);
  assert.equal(authenticateTeacher(TEACHERS, 'unknown', 'pass123').ok, false);

  const maths = authenticateTeacher(TEACHERS, 'maths.teacher', 'pass123');
  assert.equal(maths.ok, true);
  if (maths.ok) assert.equal(maths.teacher.subject, 'Maths');
});

