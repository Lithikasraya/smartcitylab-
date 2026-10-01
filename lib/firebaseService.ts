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
import { BatchInfo, BatchMember, LabInnovator, ProjectItem } from './data';
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
