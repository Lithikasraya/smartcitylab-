import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, db } from './firebase';
import { BatchMember, ProjectItem } from './data';
import { UserSession } from './store';

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
      await setDoc(userDocRef, {
        uid,
        ...profile,
        createdAt: new Date().toISOString(),
      });
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

export async function saveStudentToFirestore(student: BatchMember): Promise<string> {
  try {
    const studentRef = doc(db, 'students', student.id);
    await setDoc(studentRef, student, { merge: true });
    return student.id;
  } catch (error) {
    console.error('Error saving student to Firestore:', error);
    throw error;
  }
}

export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  try {
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

export async function saveProjectToFirestore(project: ProjectItem): Promise<string> {
  try {
    const projRef = doc(db, 'projects', project.id);
    await setDoc(projRef, project, { merge: true });
    return project.id;
  } catch (error) {
    console.error('Error saving project to Firestore:', error);
    throw error;
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    console.error('Error deleting project from Firestore:', error);
    throw error;
  }
}

