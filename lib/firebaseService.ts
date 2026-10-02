import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signInAnonymously,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { 
  BatchInfo, 
  BatchMember, 
  LabInnovator, 
  ProjectItem, 
  NewsItem, 
  BlogItem, 
  QuestItem, 
  TeamItem, 
  TaskItem, 
  SubmissionItem,
  ContactSettings 
} from './data';
import { UserSession } from './store';

export async function ensureAuthenticated(): Promise<void> {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (e) {
    // If anonymous sign in is disabled or not required, continue
  }
}

export interface FirestoreUserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'super_admin' | 'team_lead' | 'student';
  rollNo?: string;
  teamId?: string;
  teamName?: string;
  avatar?: string;
  createdAt?: string;
}

/**
 * Strips undefined properties recursively so Firestore setDoc does not throw
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const clean: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = sanitizeForFirestore(val);
      } else if (Array.isArray(val)) {
        clean[key] = val.map((item) => (item !== null && typeof item === 'object' ? sanitizeForFirestore(item) : item));
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

// ── Auth Services ────────────────────────────────────────────────────────────
export async function loginAdmin(email: string, pass: string): Promise<UserSession> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const uid = cred.user.uid;

  let profile: UserSession = {
    role: 'super_admin',
    name: cred.user.displayName || email.split('@')[0] || 'Super Admin',
    email: cred.user.email || email,
    avatar: cred.user.photoURL || undefined,
  };

  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data() as FirestoreUserProfile;
      profile = {
        role: data.role || 'super_admin',
        name: data.name || cred.user.displayName || 'Super Admin',
        email: data.email || cred.user.email || email,
        avatar: data.avatar || cred.user.photoURL || undefined,
        teamId: data.teamId,
        teamName: data.teamName,
        rollNo: data.rollNo,
      };
    } else {
      await setDoc(userDocRef, sanitizeForFirestore({
        uid,
        ...profile,
        createdAt: new Date().toISOString(),
      }));
    }
  } catch (firestoreErr) {
    console.warn('Firestore profile note (check security rules):', firestoreErr);
  }

  return profile;
}

export async function logoutUser() {
  await firebaseSignOut(auth);
}

// ── Students / Batches Firestore Service ────────────────────────────────────
export async function fetchStudentsFromFirestore(): Promise<BatchMember[]> {
  try {
    const q = query(collection(db, 'students'));
    const snap = await getDocs(q);
    const students: BatchMember[] = [];
    snap.forEach((d) => {
      students.push({ id: d.id, ...d.data() } as BatchMember);
    });
    return students;
  } catch (error) {
    console.error('Error fetching students from Firestore:', error);
    return [];
  }
}

export function subscribeToStudents(callback: (students: BatchMember[]) => void): Unsubscribe {
  const q = query(collection(db, 'students'));
  return onSnapshot(q, (snap) => {
    const students: BatchMember[] = [];
    snap.forEach((d) => {
      students.push({ id: d.id, ...d.data() } as BatchMember);
    });
    callback(students);
  }, (err) => {
    console.warn('Students live snapshot note:', err);
  });
}

export async function saveStudentToFirestore(student: BatchMember): Promise<string> {
  try {
    await ensureAuthenticated();
    const studentRef = doc(db, 'students', student.id);
    const cleanData = sanitizeForFirestore(student);
    await setDoc(studentRef, cleanData, { merge: true });
    return student.id;
  } catch (error) {
    console.error('Error saving student to Firestore:', error);
    throw error;
  }
}

export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  try {
    await ensureAuthenticated();
    await deleteDoc(doc(db, 'students', studentId));
  } catch (error) {
    console.error('Error deleting student from Firestore:', error);
    throw error;
  }
}

// ── Projects Firestore Service ──────────────────────────────────────────────
export async function fetchProjectsFromFirestore(): Promise<ProjectItem[]> {
  try {
    const q = query(collection(db, 'projects'));
    const snap = await getDocs(q);
    const projects: ProjectItem[] = [];
    snap.forEach((d) => {
      projects.push({ id: d.id, ...d.data() } as ProjectItem);
    });
    return projects;
  } catch (error) {
    console.error('Error fetching projects from Firestore:', error);
    return [];
  }
}

export function subscribeToProjects(callback: (projects: ProjectItem[]) => void): Unsubscribe {
  const q = query(collection(db, 'projects'));
  return onSnapshot(q, (snap) => {
    const projects: ProjectItem[] = [];
    snap.forEach((d) => {
      projects.push({ id: d.id, ...d.data() } as ProjectItem);
    });
    callback(projects);
  }, (err) => {
    console.warn('Projects live snapshot note:', err);
  });
}

export async function saveProjectToFirestore(project: ProjectItem): Promise<string> {
  try {
    await ensureAuthenticated();
    const projRef = doc(db, 'projects', project.id);
    const cleanData = sanitizeForFirestore(project);
    await setDoc(projRef, cleanData, { merge: true });
    return project.id;
  } catch (error) {
    console.error('Error saving project to Firestore:', error);
    throw error;
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  try {
    await ensureAuthenticated();
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    console.error('Error deleting project from Firestore:', error);
    throw error;
  }
}

// ── Batch Infos Firestore Service ───────────────────────────────────────────
export async function fetchBatchesFromFirestore(): Promise<BatchInfo[]> {
  try {
    const q = query(collection(db, 'batches'));
    const snap = await getDocs(q);
    const batches: BatchInfo[] = [];
    snap.forEach((d) => {
      batches.push({ id: d.id, ...d.data() } as BatchInfo);
    });
    return batches;
  } catch (error) {
    console.error('Error fetching batches from Firestore:', error);
    return [];
  }
}

export function subscribeToBatches(callback: (batches: BatchInfo[]) => void): Unsubscribe {
  const q = query(collection(db, 'batches'));
  return onSnapshot(q, (snap) => {
    const batches: BatchInfo[] = [];
    snap.forEach((d) => {
      batches.push({ id: d.id, ...d.data() } as BatchInfo);
    });
    callback(batches);
  }, (err) => {
    console.warn('Batches live snapshot note:', err);
  });
}

export async function saveBatchToFirestore(batch: BatchInfo): Promise<string> {
  try {
    await ensureAuthenticated();
    const batchRef = doc(db, 'batches', batch.id);
    const cleanData = sanitizeForFirestore(batch);
    await setDoc(batchRef, cleanData, { merge: true });
    return batch.id;
  } catch (error) {
    console.error('Error saving batch to Firestore:', error);
    throw error;
  }
}

export async function deleteBatchFromFirestore(batchId: string): Promise<void> {
  try {
    await ensureAuthenticated();
    await deleteDoc(doc(db, 'batches', batchId));
  } catch (error) {
    console.error('Error deleting batch from Firestore:', error);
    throw error;
  }
}

// ── Faculty / Innovators Firestore Service ──────────────────────────────────
export async function fetchFacultyFromFirestore(): Promise<LabInnovator[]> {
  try {
    const q = query(collection(db, 'faculty'));
    const snap = await getDocs(q);
    const faculty: LabInnovator[] = [];
    snap.forEach((d) => {
      faculty.push({ id: d.id, ...d.data() } as LabInnovator);
    });
    return faculty;
  } catch (error) {
    console.error('Error fetching faculty from Firestore:', error);
    return [];
  }
}

export function subscribeToFaculty(callback: (faculty: LabInnovator[]) => void): Unsubscribe {
  const q = query(collection(db, 'faculty'));
  return onSnapshot(q, (snap) => {
    const faculty: LabInnovator[] = [];
    snap.forEach((d) => {
      faculty.push({ id: d.id, ...d.data() } as LabInnovator);
    });
    callback(faculty);
  }, (err) => {
    console.warn('Faculty live snapshot note:', err);
  });
}

export async function saveFacultyToFirestore(faculty: LabInnovator): Promise<string> {
  try {
    await ensureAuthenticated();
    const facRef = doc(db, 'faculty', faculty.id);
    const cleanData = sanitizeForFirestore(faculty);
    await setDoc(facRef, cleanData, { merge: true });
    return faculty.id;
  } catch (error) {
    console.error('Error saving faculty to Firestore:', error);
    throw error;
  }
}

export async function deleteFacultyFromFirestore(facultyId: string): Promise<void> {
  try {
    await ensureAuthenticated();
    await deleteDoc(doc(db, 'faculty', facultyId));
  } catch (error) {
    console.error('Error deleting faculty from Firestore:', error);
    throw error;
  }
}

// ── News Firestore Service ──────────────────────────────────────────────────
export async function fetchNewsFromFirestore(): Promise<NewsItem[]> {
  try {
    const q = query(collection(db, 'news'));
    const snap = await getDocs(q);
    const news: NewsItem[] = [];
    snap.forEach((d) => {
      news.push({ id: d.id, ...d.data() } as NewsItem);
    });
    return news;
  } catch (error) {
    console.error('Error fetching news from Firestore:', error);
    return [];
  }
}

export function subscribeToNews(callback: (news: NewsItem[]) => void): Unsubscribe {
  const q = query(collection(db, 'news'));
  return onSnapshot(q, (snap) => {
    const news: NewsItem[] = [];
    snap.forEach((d) => {
      news.push({ id: d.id, ...d.data() } as NewsItem);
    });
    callback(news);
  }, (err) => {
    console.warn('News live snapshot note:', err);
  });
}

export async function saveNewsToFirestore(newsItem: NewsItem): Promise<string> {
  try {
    await ensureAuthenticated();
    const newsRef = doc(db, 'news', newsItem.id);
    const cleanData = sanitizeForFirestore(newsItem);
    await setDoc(newsRef, cleanData, { merge: true });
    return newsItem.id;
  } catch (error) {
    console.error('Error saving news to Firestore:', error);
    throw error;
  }
}

export async function deleteNewsFromFirestore(newsId: string): Promise<void> {
  try {
    await ensureAuthenticated();
    await deleteDoc(doc(db, 'news', newsId));
  } catch (error) {
    console.error('Error deleting news from Firestore:', error);
    throw error;
  }
}

// ── Blogs Firestore Service ─────────────────────────────────────────────────
export async function fetchBlogsFromFirestore(): Promise<BlogItem[]> {
  try {
    const q = query(collection(db, 'blogs'));
    const snap = await getDocs(q);
    const blogs: BlogItem[] = [];
    snap.forEach((d) => {
      blogs.push({ id: d.id, ...d.data() } as BlogItem);
    });
    return blogs;
  } catch (error) {
    console.error('Error fetching blogs from Firestore:', error);
    return [];
  }
}

export function subscribeToBlogs(callback: (blogs: BlogItem[]) => void): Unsubscribe {
  const q = query(collection(db, 'blogs'));
  return onSnapshot(q, (snap) => {
    const blogs: BlogItem[] = [];
    snap.forEach((d) => {
      blogs.push({ id: d.id, ...d.data() } as BlogItem);
    });
    callback(blogs);
  }, (err) => {
    console.warn('Blogs live snapshot note:', err);
  });
}

export async function saveBlogToFirestore(blogItem: BlogItem): Promise<string> {
  try {
    await ensureAuthenticated();
    const blogRef = doc(db, 'blogs', blogItem.id);
    const cleanData = sanitizeForFirestore(blogItem);
    await setDoc(blogRef, cleanData, { merge: true });
    return blogItem.id;
  } catch (error) {
    console.error('Error saving blog to Firestore:', error);
    throw error;
  }
}

export async function deleteBlogFromFirestore(blogId: string): Promise<void> {
  try {
    await ensureAuthenticated();
    await deleteDoc(doc(db, 'blogs', blogId));
  } catch (error) {
    console.error('Error deleting blog from Firestore:', error);
    throw error;
  }
}

// ── Quests Firestore Service ────────────────────────────────────────────────
export async function fetchQuestsFromFirestore(): Promise<QuestItem[]> {
  try {
    const q = query(collection(db, 'quests'));
    const snap = await getDocs(q);
    const quests: QuestItem[] = [];
    snap.forEach((d) => {
      quests.push({ id: d.id, ...d.data() } as QuestItem);
    });
    return quests;
  } catch (error) {
    console.error('Error fetching quests from Firestore:', error);
    return [];
  }
}

export function subscribeToQuests(callback: (quests: QuestItem[]) => void): Unsubscribe {
  const q = query(collection(db, 'quests'));
  return onSnapshot(q, (snap) => {
    const quests: QuestItem[] = [];
    snap.forEach((d) => {
      quests.push({ id: d.id, ...d.data() } as QuestItem);
    });
    callback(quests);
  }, (err) => {
    console.warn('Quests live snapshot note:', err);
  });
}

export async function saveQuestToFirestore(questItem: QuestItem): Promise<string> {
  try {
    await ensureAuthenticated();
    const questRef = doc(db, 'quests', questItem.id);
    const cleanData = sanitizeForFirestore(questItem);
    await setDoc(questRef, cleanData, { merge: true });
    return questItem.id;
  } catch (error) {
    console.error('Error saving quest to Firestore:', error);
    throw error;
  }
}

export async function deleteQuestFromFirestore(questId: string): Promise<void> {
  try {
    await ensureAuthenticated();
    await deleteDoc(doc(db, 'quests', questId));
  } catch (error) {
    console.error('Error deleting quest from Firestore:', error);
    throw error;
  }
}

// ── Teams Firestore Service ─────────────────────────────────────────────────
export async function fetchTeamsFromFirestore(): Promise<TeamItem[]> {
  try {
    const q = query(collection(db, 'teams'));
    const snap = await getDocs(q);
    const teams: TeamItem[] = [];
    snap.forEach((d) => {
      teams.push({ id: d.id, ...d.data() } as TeamItem);
    });
    return teams;
  } catch (error) {
    console.error('Error fetching teams from Firestore:', error);
    return [];
  }
}

export function subscribeToTeams(callback: (teams: TeamItem[]) => void): Unsubscribe {
  const q = query(collection(db, 'teams'));
  return onSnapshot(q, (snap) => {
    const teams: TeamItem[] = [];
    snap.forEach((d) => {
      teams.push({ id: d.id, ...d.data() } as TeamItem);
    });
    callback(teams);
  }, (err) => {
    console.warn('Teams live snapshot note:', err);
  });
}

export async function saveTeamToFirestore(teamItem: TeamItem): Promise<string> {
  try {
    await ensureAuthenticated();
    const teamRef = doc(db, 'teams', teamItem.id);
    const cleanData = sanitizeForFirestore(teamItem);
    await setDoc(teamRef, cleanData, { merge: true });
    return teamItem.id;
  } catch (error) {
    console.error('Error saving team to Firestore:', error);
    throw error;
  }
}

export async function deleteTeamFromFirestore(teamId: string): Promise<void> {
  try {
    await ensureAuthenticated();
    await deleteDoc(doc(db, 'teams', teamId));
  } catch (error) {
    console.error('Error deleting team from Firestore:', error);
    throw error;
  }
}

// ── Tasks Firestore Service ─────────────────────────────────────────────────
export async function fetchTasksFromFirestore(): Promise<TaskItem[]> {
  try {
    const q = query(collection(db, 'tasks'));
    const snap = await getDocs(q);
    const tasks: TaskItem[] = [];
    snap.forEach((d) => {
      tasks.push({ id: d.id, ...d.data() } as TaskItem);
    });
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks from Firestore:', error);
    return [];
  }
}

export function subscribeToTasks(callback: (tasks: TaskItem[]) => void): Unsubscribe {
  const q = query(collection(db, 'tasks'));
  return onSnapshot(q, (snap) => {
    const tasks: TaskItem[] = [];
    snap.forEach((d) => {
      tasks.push({ id: d.id, ...d.data() } as TaskItem);
    });
    callback(tasks);
  }, (err) => {
    console.warn('Tasks live snapshot note:', err);
  });
}

export async function saveTaskToFirestore(taskItem: TaskItem): Promise<string> {
  try {
    await ensureAuthenticated();
    const taskRef = doc(db, 'tasks', taskItem.id);
    const cleanData = sanitizeForFirestore(taskItem);
    await setDoc(taskRef, cleanData, { merge: true });
    return taskItem.id;
  } catch (error) {
    console.error('Error saving task to Firestore:', error);
    throw error;
  }
}

export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  try {
    await ensureAuthenticated();
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    console.error('Error deleting task from Firestore:', error);
    throw error;
  }
}

// ── Submissions Firestore Service ───────────────────────────────────────────
export async function fetchSubmissionsFromFirestore(): Promise<SubmissionItem[]> {
  try {
    const q = query(collection(db, 'submissions'));
    const snap = await getDocs(q);
    const submissions: SubmissionItem[] = [];
    snap.forEach((d) => {
      submissions.push({ id: d.id, ...d.data() } as SubmissionItem);
    });
    return submissions;
  } catch (error) {
    console.error('Error fetching submissions from Firestore:', error);
    return [];
  }
}

export function subscribeToSubmissions(callback: (submissions: SubmissionItem[]) => void): Unsubscribe {
  const q = query(collection(db, 'submissions'));
  return onSnapshot(q, (snap) => {
    const submissions: SubmissionItem[] = [];
    snap.forEach((d) => {
      submissions.push({ id: d.id, ...d.data() } as SubmissionItem);
    });
    callback(submissions);
  }, (err) => {
    console.warn('Submissions live snapshot note:', err);
  });
}

export async function saveSubmissionToFirestore(submissionItem: SubmissionItem): Promise<string> {
  try {
    await ensureAuthenticated();
    const subRef = doc(db, 'submissions', submissionItem.id);
    const cleanData = sanitizeForFirestore(submissionItem);
    await setDoc(subRef, cleanData, { merge: true });
    return submissionItem.id;
  } catch (error) {
    console.error('Error saving submission to Firestore:', error);
    throw error;
  }
}

export async function deleteSubmissionFromFirestore(subId: string): Promise<void> {
  try {
    await ensureAuthenticated();
    await deleteDoc(doc(db, 'submissions', subId));
  } catch (error) {
    console.error('Error deleting submission from Firestore:', error);
    throw error;
  }
}

// ── Platform & Contact Settings Firestore Service ───────────────────────────
export async function fetchSettingsFromFirestore(): Promise<ContactSettings | null> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'platform'));
    if (snap.exists()) {
      return snap.data() as ContactSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching settings from Firestore:', error);
    return null;
  }
}

export function subscribeToSettings(callback: (settings: ContactSettings) => void): Unsubscribe {
  return onSnapshot(doc(db, 'settings', 'platform'), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as ContactSettings);
    }
  }, (err) => {
    console.warn('Settings live snapshot note:', err);
  });
}

export async function saveSettingsToFirestore(settings: ContactSettings): Promise<void> {
  try {
    await ensureAuthenticated();
    const clean = sanitizeForFirestore(settings);
    await setDoc(doc(db, 'settings', 'platform'), clean, { merge: true });
  } catch (error) {
    console.error('Error saving settings to Firestore:', error);
    throw error;
  }
}

