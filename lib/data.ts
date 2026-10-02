export interface LabInnovator {
  id: string;
  name: string;
  designation: string;
  department?: string;
  photoUrl: string;
  bio?: string;
  isHead?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'IoT & Sensors' | 'AI & Computer Vision' | 'Smart Mobility' | 'Green Energy' | 'Web & Cloud';
  batchYear: string;
  teamName: string;
  teamLead: string;
  members: string[];
  memberPhotos?: string[];
  imageUrl: string;
  images?: string[];
  videoUrl?: string;
  demoUrl?: string;
  repoUrl?: string;
  status: 'approved' | 'pending' | 'rejected';
  isVisible?: boolean;
  views: number;
  featured: boolean;
  publishedAt: string;
  techStack: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Announcement' | 'Lab Update' | 'Hackathon' | 'Achievement';
  author: string;
  teamName?: string;
  publishedAt: string;
  imageUrl?: string;
  status: 'approved' | 'pending';
  isVisible?: boolean;
  likes: number;
  trending?: boolean;
}

export interface BlogItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    rollNo: string;
  };
  teamName: string;
  category?: string;
  coverImage: string;
  readTime: string;
  tags: string[];
  publishedAt: string;
  status: 'approved' | 'pending';
  isVisible?: boolean;
  views: number;
  likes?: number;
  durationDays?: string;
  isFeatured?: boolean;
}

export interface BatchInfo {
  id: string;
  name: string;
  year: string;
  academicSession: string;
  status: 'active' | 'graduated' | 'upcoming';
  mentorLead?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  uploadedFiles?: {
    name: string;
    type: 'excel' | 'pdf';
    size?: string;
    uploadedAt: string;
    rowCount?: number;
  }[];
}

export interface BatchMember {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone?: string;
  domain: string;
  year?: string;
  branch?: string;
  teamName?: string;
  isTeamLead?: boolean;
  role?: 'Student' | 'Team Lead' | 'Mentor' | 'Faculty';
  photoUrl?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
  batchYear?: string;
  status: 'active' | 'graduated';
  tempPassword?: string;
  passwordResetRequired?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Lab Session' | 'Hackathons' | 'Field Testing' | 'Tech Expo' | 'Project Showcase' | string;
  date: string;
  imageUrl: string;
  description: string;
  projectId?: string;
  projectTitle?: string;
}

export interface QuestItem {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  teamSizeLimit: number;
  deadline: string;
  department: string;
  contactEmail: string;
  status: 'open' | 'in-progress' | 'completed';
  acceptedTeam?: string;
  reward: string;
  createdAt: string;
}

export interface TeamItem {
  id: string;
  name: string;
  colorTheme: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan';
  teamLead: {
    id: string;
    name: string;
    email: string;
    rollNo: string;
  };
  membersCount: number;
  members: {
    id: string;
    name: string;
    rollNo: string;
    email: string;
    role: string;
    attendance: number;
  }[];
  activeProject?: string;
  meetingLink?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  teamId: string;
  teamName: string;
  assignedTo: string;
  assignedBy: string;
  deadline: string;
  status: 'pending' | 'submitted' | 'reviewed';
  submissionVideoUrl?: string;
  submittedAt?: string;
}

export interface SubmissionItem {
  id: string;
  type: 'project' | 'blog' | 'news' | 'task_video';
  title: string;
  summary: string;
  studentName: string;
  studentRoll: string;
  teamName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  details: Record<string, unknown>;
  feedback?: string;
}

// ── Clean empty initial states (No mock/fake data) ──
export const INITIAL_INNOVATORS: LabInnovator[] = [
  {
    id: 'innovator-p-viswam',
    name: 'Mr. P. Viswam',
    designation: 'Chairman',
    department: 'Smart City Lab Leadership',
    photoUrl: '',
    bio: 'Visionary leadership and institutional mentorship driving the mission of Smart City Lab.',
    isHead: true,
  },
  {
    id: 'innovator-aishwarya',
    name: 'Ms. Aishwarya',
    designation: 'Director',
    department: 'Smart City Lab Leadership',
    photoUrl: '',
    bio: 'Directing strategy, interdisciplinary partnerships, and innovation roadmaps.',
    isHead: true,
  },
  {
    id: 'innovator-d-revathi',
    name: 'Dr. D Revathi',
    designation: 'Director',
    department: 'Smart City Lab Research',
    photoUrl: '',
    bio: 'Leading research architecture, academic mentoring, and student project governance.',
    isHead: true,
  },
  {
    id: 'innovator-satya-pratap',
    name: 'Dr. Satya Pratap',
    designation: 'Asst. Professor',
    department: 'Smart City Lab Faculty',
    photoUrl: '',
    bio: 'Mentoring embedded computing, edge AI hardware pipelines, and research documentation.',
    isHead: true,
  },
  {
    id: 'innovator-subhash',
    name: 'Mr. Subhash',
    designation: 'Asst. Professor',
    department: 'Smart City Lab Faculty',
    photoUrl: '',
    bio: 'Guiding hardware prototypes, IoT sensor grids, and field trial deployments.',
    isHead: true,
  },
];
// ── Cohorts & Batches ──
export const INITIAL_BATCH_INFOS: BatchInfo[] = [
  {
    id: 'cream-layer-1',
    name: 'CREAM LAYER – I',
    year: 'Cream Layer I',
    academicSession: 'CORE GROUP (10 INTERNS)',
    status: 'active',
    mentorLead: 'Core Research Faculty',
    description: 'Elite Core Group driving core lab architecture, high-level research prototypes, and system integrations.',
  },
  {
    id: 'cream-layer-2',
    name: 'CREAM LAYER – II',
    year: 'Cream Layer II',
    academicSession: '4TH YEARS (06 INTERNS)',
    status: 'active',
    mentorLead: 'Senior Project Mentors',
    description: 'Final year senior research interns leading hardware deployments, testing protocols, and mentorship.',
  },
  {
    id: 'cream-layer-3',
    name: 'CREAM LAYER – III',
    year: 'Cream Layer III',
    academicSession: '3RD YEARS (13 INTERNS)',
    status: 'active',
    mentorLead: 'IoT & Edge AI Mentors',
    description: 'Pre-final year research interns focusing on sensor grids, edge AI pipelines, and embedded software.',
  },
];
export const INITIAL_BATCHES: BatchMember[] = [];
export const INITIAL_PROJECTS: ProjectItem[] = [];
export const INITIAL_NEWS: NewsItem[] = [];
export const INITIAL_BLOGS: BlogItem[] = [];
export const INITIAL_QUESTS: QuestItem[] = [];
export const INITIAL_TEAMS: TeamItem[] = [];
export const INITIAL_TASKS: TaskItem[] = [];
export const INITIAL_SUBMISSIONS: SubmissionItem[] = [];
export const INITIAL_GALLERY: GalleryItem[] = [];
