'use client';

import { useState, useEffect } from 'react';
import {
  LabInnovator,
  ProjectItem,
  NewsItem,
  BlogItem,
  BatchMember,
  BatchInfo,
  GalleryItem,
  QuestItem,
  TeamItem,
  TaskItem,
  SubmissionItem,
  INITIAL_INNOVATORS,
  INITIAL_PROJECTS,
  INITIAL_NEWS,
  INITIAL_BLOGS,
  INITIAL_BATCHES,
  INITIAL_BATCH_INFOS,
  INITIAL_GALLERY,
  INITIAL_QUESTS,
  INITIAL_TEAMS,
  INITIAL_TASKS,
  INITIAL_SUBMISSIONS,
} from './data';
import { isFirebaseConfigured } from './firebase';
import { 
  saveStudentToFirestore, 
  deleteStudentFromFirestore,
  subscribeToStudents,
  subscribeToProjects,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  subscribeToBatches,
  saveBatchToFirestore,
  deleteBatchFromFirestore,
  subscribeToFaculty,
  saveFacultyToFirestore,
  deleteFacultyFromFirestore,
  subscribeToNews,
  saveNewsToFirestore,
  deleteNewsFromFirestore,
  subscribeToBlogs,
  saveBlogToFirestore,
  deleteBlogFromFirestore,
  subscribeToQuests,
  saveQuestToFirestore,
  deleteQuestFromFirestore,
  subscribeToTeams,
  saveTeamToFirestore,
  deleteTeamFromFirestore,
  subscribeToTasks,
  saveTaskToFirestore,
  deleteTaskFromFirestore,
  subscribeToSubmissions,
  saveSubmissionToFirestore,
  deleteSubmissionFromFirestore
} from './firebaseService';

export interface UserSession {
  role: 'super_admin' | 'team_lead' | 'student';
  name: string;
  email: string;
  rollNo?: string;
  teamId?: string;
  teamName?: string;
  teamColor?: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan';
  avatar?: string;
}

const STORAGE_KEYS = {
  INNOVATORS: 'smt_innovators_v2',
  PROJECTS: 'smt_projects_v2',
  NEWS: 'smt_news_v2',
  BLOGS: 'smt_blogs_v2',
  BATCHES: 'smt_batches_v2',
  BATCH_INFOS: 'smt_batch_infos_v2',
  GALLERY: 'smt_gallery_v2',
  QUESTS: 'smt_quests_v2',
  TEAMS: 'smt_teams_v2',
  TASKS: 'smt_tasks_v2',
  SUBMISSIONS: 'smt_submissions_v2',
  USER: 'smt_user_v2',
};

const DEFAULT_USER: UserSession = {
  role: 'super_admin',
  name: 'Super Admin',
  email: 'admin@kiet.edu',
};

export function usePortalStore() {
  const [mounted, setMounted] = useState(false);
  const [innovators, setInnovators] = useState<LabInnovator[]>(INITIAL_INNOVATORS);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [blogs, setBlogs] = useState<BlogItem[]>(INITIAL_BLOGS);
  const [batches, setBatches] = useState<BatchMember[]>(INITIAL_BATCHES);
  const [batchInfos, setBatchInfos] = useState<BatchInfo[]>(INITIAL_BATCH_INFOS);
  const [gallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [quests, setQuests] = useState<QuestItem[]>(INITIAL_QUESTS);
  const [teams, setTeams] = useState<TeamItem[]>(INITIAL_TEAMS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(INITIAL_SUBMISSIONS);
  const [user, setUser] = useState<UserSession>(DEFAULT_USER);

  useEffect(() => {
    setMounted(true);
    try {
      // Clear legacy v1 mock keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('smt_') && key.endsWith('_v1')) {
          localStorage.removeItem(key);
        }
      });

      const safeParse = (str: string | null) => {
        if (!str || str === 'undefined' || str === 'null') return null;
        try {
          return JSON.parse(str);
        } catch {
          return null;
        }
      };

      const inn = safeParse(localStorage.getItem(STORAGE_KEYS.INNOVATORS));
      if (inn) setInnovators(inn);
      const p = safeParse(localStorage.getItem(STORAGE_KEYS.PROJECTS));
      if (p) setProjects(p);
      const n = safeParse(localStorage.getItem(STORAGE_KEYS.NEWS));
      if (n) setNews(n);
      const b = safeParse(localStorage.getItem(STORAGE_KEYS.BLOGS));
      if (b) setBlogs(b);
      const bt = safeParse(localStorage.getItem(STORAGE_KEYS.BATCHES));
      if (bt) setBatches(bt);
      const bi = safeParse(localStorage.getItem(STORAGE_KEYS.BATCH_INFOS));
      if (bi) setBatchInfos(bi);
      const q = safeParse(localStorage.getItem(STORAGE_KEYS.QUESTS));
      if (q) setQuests(q);
      const t = safeParse(localStorage.getItem(STORAGE_KEYS.TEAMS));
      if (t) setTeams(t);
      const tk = safeParse(localStorage.getItem(STORAGE_KEYS.TASKS));
      if (tk) setTasks(tk);
      const sub = safeParse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS));
      if (sub) setSubmissions(sub);
      const u = safeParse(localStorage.getItem(STORAGE_KEYS.USER));
      if (u) setUser(u);

      // Fetch live real data from Firestore and subscribe in real-time with resilient map merging
      if (isFirebaseConfigured) {
        const unsubStudents = subscribeToStudents((firestoreStudents) => {
          if (firestoreStudents) {
            setBatches((prev) => {
              const map = new Map<string, BatchMember>();
              // First add firestore incoming items
              firestoreStudents.forEach((s) => map.set(s.id, s));
              // Merge local items that are not in firestore yet
              prev.forEach((s) => {
                if (!map.has(s.id)) {
                  map.set(s.id, s);
                  saveStudentToFirestore(s).catch(() => {});
                }
              });
              const merged = Array.from(map.values());
              saveItem(STORAGE_KEYS.BATCHES, merged);
              return merged;
            });
          }
        });

        const unsubProjects = subscribeToProjects((firestoreProjects) => {
          if (firestoreProjects) {
            setProjects((prev) => {
              const map = new Map<string, ProjectItem>();
              firestoreProjects.forEach((p) => map.set(p.id, p));
              prev.forEach((p) => {
                if (!map.has(p.id)) {
                  map.set(p.id, p);
                  saveProjectToFirestore(p).catch(() => {});
                }
              });
              const merged = Array.from(map.values());
              saveItem(STORAGE_KEYS.PROJECTS, merged);
              return merged;
            });
          }
        });

        const unsubBatches = subscribeToBatches((firestoreBatches) => {
          if (firestoreBatches) {
            setBatchInfos((prev) => {
              const map = new Map<string, BatchInfo>();
              firestoreBatches.forEach((b) => map.set(b.id, b));
              prev.forEach((b) => {
                if (!map.has(b.id)) {
                  map.set(b.id, b);
                  saveBatchToFirestore(b).catch(() => {});
                }
              });
              const merged = Array.from(map.values());
              saveItem(STORAGE_KEYS.BATCH_INFOS, merged);
              return merged;
            });
          }
        });

        const unsubFaculty = subscribeToFaculty((firestoreFaculty) => {
          if (firestoreFaculty) {
            setInnovators((prev) => {
              const map = new Map<string, LabInnovator>();
              firestoreFaculty.forEach((f) => map.set(f.id, f));
              prev.forEach((f) => {
                if (!map.has(f.id)) {
                  map.set(f.id, f);
                  saveFacultyToFirestore(f).catch(() => {});
                }
              });
              const merged = Array.from(map.values());
              saveItem(STORAGE_KEYS.INNOVATORS, merged);
              return merged;
            });
          }
        });

        const unsubNews = subscribeToNews((firestoreNews) => {
          if (firestoreNews) {
            setNews((prev) => {
              const map = new Map<string, NewsItem>();
              firestoreNews.forEach((n) => map.set(n.id, n));
              prev.forEach((n) => {
                if (!map.has(n.id)) {
                  map.set(n.id, n);
                  saveNewsToFirestore(n).catch(() => {});
                }
              });
              const merged = Array.from(map.values());
              saveItem(STORAGE_KEYS.NEWS, merged);
              return merged;
            });
          }
        });

        const unsubBlogs = subscribeToBlogs((firestoreBlogs) => {
          if (firestoreBlogs) {
            setBlogs((prev) => {
              const map = new Map<string, BlogItem>();
              firestoreBlogs.forEach((b) => map.set(b.id, b));
              prev.forEach((b) => {
                if (!map.has(b.id)) {
                  map.set(b.id, b);
                  saveBlogToFirestore(b).catch(() => {});
                }
              });
              const merged = Array.from(map.values());
              saveItem(STORAGE_KEYS.BLOGS, merged);
              return merged;
            });
          }
        });

        const unsubQuests = subscribeToQuests((firestoreQuests) => {
          if (firestoreQuests) {
            setQuests((prev) => {
              const map = new Map<string, QuestItem>();
              firestoreQuests.forEach((q) => map.set(q.id, q));
              prev.forEach((q) => {
                if (!map.has(q.id)) {
                  map.set(q.id, q);
                  saveQuestToFirestore(q).catch(() => {});
                }
              });
              const merged = Array.from(map.values());
              saveItem(STORAGE_KEYS.QUESTS, merged);
              return merged;
            });
          }
        });

        const unsubTeams = subscribeToTeams((firestoreTeams) => {
          if (firestoreTeams) {
            setTeams((prev) => {
              const map = new Map<string, TeamItem>();
              firestoreTeams.forEach((t) => map.set(t.id, t));
              prev.forEach((t) => {
                if (!map.has(t.id)) {
                  map.set(t.id, t);
                  saveTeamToFirestore(t).catch(() => {});
                }
              });
              const merged = Array.from(map.values());
              saveItem(STORAGE_KEYS.TEAMS, merged);
              return merged;
            });
          }
        });

        const unsubTasks = subscribeToTasks((firestoreTasks) => {
          if (firestoreTasks) {
            setTasks((prev) => {
              const map = new Map<string, TaskItem>();
              firestoreTasks.forEach((t) => map.set(t.id, t));
              prev.forEach((t) => {
                if (!map.has(t.id)) {
                  map.set(t.id, t);
                  saveTaskToFirestore(t).catch(() => {});
                }
              });
              const merged = Array.from(map.values());
              saveItem(STORAGE_KEYS.TASKS, merged);
              return merged;
            });
          }
        });

        const unsubSubmissions = subscribeToSubmissions((firestoreSubs) => {
          if (firestoreSubs) {
            setSubmissions((prev) => {
              const map = new Map<string, SubmissionItem>();
              firestoreSubs.forEach((s) => map.set(s.id, s));
              prev.forEach((s) => {
                if (!map.has(s.id)) {
                  map.set(s.id, s);
                  saveSubmissionToFirestore(s).catch(() => {});
                }
              });
              const merged = Array.from(map.values());
              saveItem(STORAGE_KEYS.SUBMISSIONS, merged);
              return merged;
            });
          }
        });

        return () => {
          unsubStudents();
          unsubProjects();
          unsubBatches();
          unsubFaculty();
          unsubNews();
          unsubBlogs();
          unsubQuests();
          unsubTeams();
          unsubTasks();
          unsubSubmissions();
        };
      }
    } catch {
      // fallback
    }
  }, []);

  const saveItem = (key: string, data: unknown) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        // quota fallback
      }
    }
  };

  const switchUser = (newUser: UserSession | 'super_admin' | 'team_lead' | 'student') => {
    if (typeof newUser === 'string') {
      let u: UserSession;
      if (newUser === 'super_admin') {
        u = {
          role: 'super_admin',
          name: 'Dr. Vivek Upadhyay',
          email: 'director.smartcity@kiet.edu',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        };
      } else if (newUser === 'team_lead') {
        u = {
          role: 'team_lead',
          name: 'Aarav Sharma',
          email: 'aarav.sharma@kiet.edu',
          rollNo: '2200290100012',
          teamId: 'team-1',
          teamName: 'Team CyberVision',
          teamColor: 'blue',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
        };
      } else {
        u = {
          role: 'student',
          name: 'Priya Patel',
          email: 'priya.patel@kiet.edu',
          rollNo: '2200290100045',
        };
      }
      setUser(u);
      saveItem(STORAGE_KEYS.USER, u);
    } else {
      setUser(newUser);
      saveItem(STORAGE_KEYS.USER, newUser);
    }
  };

  const updateUser = (u: UserSession | ((prev: UserSession) => UserSession)) => {
    setUser((prev) => {
      const nextUser = typeof u === 'function' ? u(prev) : u;
      saveItem(STORAGE_KEYS.USER, nextUser);
      return nextUser;
    });
  };

  // Interns Management Actions for Admin CRM
  const addIntern = (internData: Omit<BatchMember, 'id'>) => {
    const newIntern: BatchMember = {
      ...internData,
      id: `int-${Date.now()}`,
    };
    const updated = [newIntern, ...batches];
    setBatches(updated);
    saveItem(STORAGE_KEYS.BATCHES, updated);
    if (isFirebaseConfigured) {
      saveStudentToFirestore(newIntern).catch((e) => console.warn('Firestore sync note:', e));
    }
    return newIntern;
  };

  const updateIntern = (internId: string, patch: Partial<BatchMember>) => {
    const updated = batches.map((b) => (b.id === internId ? { ...b, ...patch } : b));
    setBatches(updated);
    saveItem(STORAGE_KEYS.BATCHES, updated);
    const target = updated.find((b) => b.id === internId);
    if (target && isFirebaseConfigured) {
      saveStudentToFirestore(target).catch((e) => console.warn('Firestore sync note:', e));
    }
  };

  const deleteIntern = (internId: string) => {
    const updated = batches.filter((b) => b.id !== internId);
    setBatches(updated);
    saveItem(STORAGE_KEYS.BATCHES, updated);
    if (isFirebaseConfigured) {
      deleteStudentFromFirestore(internId).catch((e) => console.warn('Firestore sync note:', e));
    }
  };

  const bulkAddInterns = (newInterns: Omit<BatchMember, 'id'>[]) => {
    const created: BatchMember[] = newInterns.map((n, i) => ({
      ...n,
      id: `int-${Date.now()}-${i}`,
    }));
    const updated = [...created, ...batches];
    setBatches(updated);
    saveItem(STORAGE_KEYS.BATCHES, updated);
    return created.length;
  };

  const approveSubmission = (subId: string) => {
    const sub = submissions.find((s) => s.id === subId);
    if (!sub) return;

    const updatedSub: SubmissionItem = { ...sub, status: 'approved' as const };
    const nextSubs = submissions.map((s) => (s.id === subId ? updatedSub : s));
    setSubmissions(nextSubs);
    saveItem(STORAGE_KEYS.SUBMISSIONS, nextSubs);
    if (isFirebaseConfigured) {
      saveSubmissionToFirestore(updatedSub).catch((e) => console.warn('Firestore sub sync note:', e));
    }

    if (sub.type === 'project') {
      const details = (sub.details || {}) as Record<string, any>;
      const newProj: ProjectItem = {
        id: `proj-${Date.now()}`,
        title: sub.title,
        tagline: (details.tagline as string) || sub.summary,
        description: (details.description as string) || sub.summary,
        category: (details.category as ProjectItem['category']) || 'IoT & Sensors',
        batchYear: (details.batchYear as ProjectItem['batchYear']) || '2026',
        teamName: sub.teamName || (details.teamName as string) || 'Smart City Lab Team',
        teamLead: (details.teamLead as string) || sub.studentName,
        members: Array.isArray(details.members) && details.members.length > 0 ? details.members : [sub.studentName],
        imageUrl: (details.imageUrl as string) || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        videoUrl: (details.videoUrl as string) || undefined,
        demoUrl: (details.demoUrl as string) || undefined,
        repoUrl: (details.repoUrl as string) || undefined,
        status: 'approved',
        views: 1,
        featured: true,
        isVisible: true,
        publishedAt: new Date().toISOString().split('T')[0],
        techStack: Array.isArray(details.techStack) && details.techStack.length > 0 ? details.techStack : ['IoT', 'Embedded Systems'],
      };
      const updatedProjects = [newProj, ...projects];
      setProjects(updatedProjects);
      saveItem(STORAGE_KEYS.PROJECTS, updatedProjects);
      if (isFirebaseConfigured) {
        saveProjectToFirestore(newProj).catch((e) => console.warn('Firestore project save note:', e));
      }
    } else if (sub.type === 'news') {
      const newNews: NewsItem = {
        id: `news-${Date.now()}`,
        title: sub.title,
        summary: sub.summary,
        content: (sub.details?.content as string) || sub.summary,
        category: (sub.details?.category as NewsItem['category']) || 'Lab Update',
        author: sub.studentName,
        teamName: sub.teamName,
        publishedAt: new Date().toISOString().split('T')[0],
        status: 'approved',
        likes: 0,
        trending: true,
      };
      const updatedNews = [newNews, ...news];
      setNews(updatedNews);
      saveItem(STORAGE_KEYS.NEWS, updatedNews);
      if (isFirebaseConfigured) {
        saveNewsToFirestore(newNews).catch((e) => console.warn('Firestore news save note:', e));
      }
    } else if (sub.type === 'blog') {
      const newBlog: BlogItem = {
        id: `blog-${Date.now()}`,
        slug: sub.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: sub.title,
        excerpt: sub.summary,
        content: (sub.details?.content as string) || sub.summary,
        author: {
          name: sub.studentName,
          role: 'Intern',
          rollNo: sub.studentRoll,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        },
        teamName: sub.teamName,
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        readTime: '4 min read',
        tags: ['Engineering', 'KIET Lab'],
        publishedAt: new Date().toISOString().split('T')[0],
        status: 'approved',
        views: 1,
      };
      const updatedBlogs = [newBlog, ...blogs];
      setBlogs(updatedBlogs);
      saveItem(STORAGE_KEYS.BLOGS, updatedBlogs);
      if (isFirebaseConfigured) {
        saveBlogToFirestore(newBlog).catch((e) => console.warn('Firestore blog save note:', e));
      }
    }
  };

  const rejectSubmission = (subId: string, feedback?: string) => {
    const target = submissions.find((s) => s.id === subId);
    const updatedSub = target ? { ...target, status: 'rejected' as const, feedback } : undefined;
    const nextSubs = submissions.map((s) => (s.id === subId ? { ...s, status: 'rejected' as const, feedback } : s));
    setSubmissions(nextSubs);
    saveItem(STORAGE_KEYS.SUBMISSIONS, nextSubs);
    if (updatedSub && isFirebaseConfigured) {
      saveSubmissionToFirestore(updatedSub).catch((e) => console.warn('Firestore sub reject note:', e));
    }
  };

  const deleteSubmission = (subId: string) => {
    const nextSubs = submissions.filter((s) => s.id !== subId);
    setSubmissions(nextSubs);
    saveItem(STORAGE_KEYS.SUBMISSIONS, nextSubs);
    if (isFirebaseConfigured) {
      deleteSubmissionFromFirestore(subId).catch((e) => console.warn('Firestore sub delete note:', e));
    }
  };

  const addQuickSubmission = (submission: Omit<SubmissionItem, 'id' | 'submittedAt' | 'status'>) => {
    const newSub: SubmissionItem = {
      ...submission,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toLocaleString(),
      status: 'pending',
    };
    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    saveItem(STORAGE_KEYS.SUBMISSIONS, updated);
    if (isFirebaseConfigured) {
      saveSubmissionToFirestore(newSub).catch((e) => console.warn('Firestore quick sub note:', e));
    }
    return newSub;
  };

  const postQuest = (questData: Omit<QuestItem, 'id' | 'createdAt' | 'status'>) => {
    const newQuest: QuestItem = {
      ...questData,
      id: `quest-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newQuest, ...quests];
    setQuests(updated);
    saveItem(STORAGE_KEYS.QUESTS, updated);
    if (isFirebaseConfigured) {
      saveQuestToFirestore(newQuest).catch((e) => console.warn('Firestore quest save note:', e));
    }
    return newQuest;
  };

  const updateQuest = (questId: string, patch: Partial<QuestItem>) => {
    const updated = quests.map((q) => (q.id === questId ? { ...q, ...patch } : q));
    setQuests(updated);
    saveItem(STORAGE_KEYS.QUESTS, updated);
    const target = updated.find((q) => q.id === questId);
    if (target && isFirebaseConfigured) {
      saveQuestToFirestore(target).catch((e) => console.warn('Firestore quest update note:', e));
    }
  };

  const deleteQuest = (questId: string) => {
    const updated = quests.filter((q) => q.id !== questId);
    setQuests(updated);
    saveItem(STORAGE_KEYS.QUESTS, updated);
    if (isFirebaseConfigured) {
      deleteQuestFromFirestore(questId).catch((e) => console.warn('Firestore quest delete note:', e));
    }
  };

  const applyForQuest = (questId: string, teamName: string) => {
    const updated = quests.map((q) =>
      q.id === questId ? { ...q, status: 'in-progress' as const, acceptedTeam: teamName } : q
    );
    setQuests(updated);
    saveItem(STORAGE_KEYS.QUESTS, updated);
    const target = updated.find((q) => q.id === questId);
    if (target && isFirebaseConfigured) {
      saveQuestToFirestore(target).catch((e) => console.warn('Firestore quest apply note:', e));
    }
  };

  const assignTask = (taskData: Omit<TaskItem, 'id' | 'status'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      status: 'pending',
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveItem(STORAGE_KEYS.TASKS, updated);
    if (isFirebaseConfigured) {
      saveTaskToFirestore(newTask).catch((e) => console.warn('Firestore task assign note:', e));
    }
    return newTask;
  };

  const updateTask = (taskId: string, patch: Partial<TaskItem>) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
    setTasks(updated);
    saveItem(STORAGE_KEYS.TASKS, updated);
    const target = updated.find((t) => t.id === taskId);
    if (target && isFirebaseConfigured) {
      saveTaskToFirestore(target).catch((e) => console.warn('Firestore task update note:', e));
    }
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveItem(STORAGE_KEYS.TASKS, updated);
    if (isFirebaseConfigured) {
      deleteTaskFromFirestore(taskId).catch((e) => console.warn('Firestore task delete note:', e));
    }
  };

  const submitTaskVideo = (taskId: string, videoUrl: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: 'submitted' as const,
            submissionVideoUrl: videoUrl,
            submittedAt: new Date().toLocaleString(),
          }
        : t
    );
    setTasks(updated);
    saveItem(STORAGE_KEYS.TASKS, updated);
    const target = updated.find((t) => t.id === taskId);
    if (target && isFirebaseConfigured) {
      saveTaskToFirestore(target).catch((e) => console.warn('Firestore task submit note:', e));
    }
  };

  const createTeam = (teamData: Omit<TeamItem, 'id'>) => {
    const newTeam: TeamItem = {
      ...teamData,
      id: `team-${Date.now()}`,
    };
    const updated = [...teams, newTeam];
    setTeams(updated);
    saveItem(STORAGE_KEYS.TEAMS, updated);
    if (isFirebaseConfigured) {
      saveTeamToFirestore(newTeam).catch((e) => console.warn('Firestore team save note:', e));
    }
    return newTeam;
  };

  const updateTeam = (teamId: string, patch: Partial<TeamItem>) => {
    const updated = teams.map((t) => (t.id === teamId ? { ...t, ...patch } : t));
    setTeams(updated);
    saveItem(STORAGE_KEYS.TEAMS, updated);
    const target = updated.find((t) => t.id === teamId);
    if (target && isFirebaseConfigured) {
      saveTeamToFirestore(target).catch((e) => console.warn('Firestore team update note:', e));
    }
  };

  const deleteTeam = (teamId: string) => {
    const updated = teams.filter((t) => t.id !== teamId);
    setTeams(updated);
    saveItem(STORAGE_KEYS.TEAMS, updated);
    if (isFirebaseConfigured) {
      deleteTeamFromFirestore(teamId).catch((e) => console.warn('Firestore team delete note:', e));
    }
  };

  const updateTeamColor = (teamId: string, colorTheme: TeamItem['colorTheme']) => {
    const updated = teams.map((t) => (t.id === teamId ? { ...t, colorTheme } : t));
    setTeams(updated);
    saveItem(STORAGE_KEYS.TEAMS, updated);
    const target = updated.find((t) => t.id === teamId);
    if (target && isFirebaseConfigured) {
      saveTeamToFirestore(target).catch((e) => console.warn('Firestore team color note:', e));
    }

    if (user.teamId === teamId) {
      const updatedUser = { ...user, teamColor: colorTheme };
      setUser(updatedUser);
      saveItem(STORAGE_KEYS.USER, updatedUser);
    }
  };

  const markAttendance = (teamId: string, memberId: string, attendancePercent: number) => {
    const updated = teams.map((t) => {
      if (t.id !== teamId) return t;
      return {
        ...t,
        members: t.members.map((m) =>
          m.id === memberId ? { ...m, attendance: attendancePercent } : m
        ),
      };
    });
    setTeams(updated);
    saveItem(STORAGE_KEYS.TEAMS, updated);
    const target = updated.find((t) => t.id === teamId);
    if (target && isFirebaseConfigured) {
      saveTeamToFirestore(target).catch((e) => console.warn('Firestore attendance note:', e));
    }
  };

  const addProject = (projectData: Omit<ProjectItem, 'id'>) => {
    const newProj: ProjectItem = {
      ...projectData,
      id: `proj-${Date.now()}`,
      isVisible: true,
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    saveItem(STORAGE_KEYS.PROJECTS, updated);
    if (isFirebaseConfigured) {
      saveProjectToFirestore(newProj).catch((e) => console.warn('Firestore project save note:', e));
    }
    return newProj;
  };

  const toggleProjectVisibility = (id: string) => {
    const updated = projects.map((p) => {
      if (p.id !== id) return p;
      const current = p.isVisible !== undefined ? p.isVisible : p.status === 'approved';
      return { ...p, isVisible: !current };
    });
    setProjects(updated);
    saveItem(STORAGE_KEYS.PROJECTS, updated);
    const target = updated.find((p) => p.id === id);
    if (target && isFirebaseConfigured) {
      saveProjectToFirestore(target).catch((e) => console.warn('Firestore project toggle note:', e));
    }
  };

  const updateProject = (id: string, data: Partial<ProjectItem>) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, ...data } : p));
    setProjects(updated);
    saveItem(STORAGE_KEYS.PROJECTS, updated);
    const target = updated.find((p) => p.id === id);
    if (target && isFirebaseConfigured) {
      saveProjectToFirestore(target).catch((e) => console.warn('Firestore project update note:', e));
    }
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveItem(STORAGE_KEYS.PROJECTS, updated);
    if (isFirebaseConfigured) {
      deleteProjectFromFirestore(id).catch((e) => console.warn('Firestore project delete note:', e));
    }
  };

  const toggleNewsVisibility = (id: string) => {
    const updated = news.map((n) => {
      if (n.id !== id) return n;
      const current = n.isVisible !== undefined ? n.isVisible : n.status === 'approved';
      return { ...n, isVisible: !current };
    });
    setNews(updated);
    saveItem(STORAGE_KEYS.NEWS, updated);
    const target = updated.find((n) => n.id === id);
    if (target && isFirebaseConfigured) {
      saveNewsToFirestore(target).catch((e) => console.warn('Firestore news toggle note:', e));
    }
  };

  const toggleBlogVisibility = (id: string) => {
    const updated = blogs.map((b) => {
      if (b.id !== id) return b;
      const current = b.isVisible !== undefined ? b.isVisible : b.status === 'approved';
      return { ...b, isVisible: !current };
    });
    setBlogs(updated);
    saveItem(STORAGE_KEYS.BLOGS, updated);
    const target = updated.find((b) => b.id === id);
    if (target && isFirebaseConfigured) {
      saveBlogToFirestore(target).catch((e) => console.warn('Firestore blog toggle note:', e));
    }
  };

  const addBlog = (blogData: Omit<BlogItem, 'id' | 'slug' | 'views'>) => {
    const newBlog: BlogItem = {
      ...blogData,
      id: `blog-${Date.now()}`,
      slug: blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      views: 0,
      isVisible: true,
    };
    const updated = [newBlog, ...blogs];
    setBlogs(updated);
    saveItem(STORAGE_KEYS.BLOGS, updated);
    if (isFirebaseConfigured) {
      saveBlogToFirestore(newBlog).catch((e) => console.warn('Firestore blog save note:', e));
    }
    return newBlog;
  };

  const updateBlog = (id: string, data: Partial<BlogItem>) => {
    const updated = blogs.map((b) => (b.id === id ? { ...b, ...data } : b));
    setBlogs(updated);
    saveItem(STORAGE_KEYS.BLOGS, updated);
    const target = updated.find((b) => b.id === id);
    if (target && isFirebaseConfigured) {
      saveBlogToFirestore(target).catch((e) => console.warn('Firestore blog update note:', e));
    }
  };

  const deleteBlog = (id: string) => {
    const updated = blogs.filter((b) => b.id !== id);
    setBlogs(updated);
    saveItem(STORAGE_KEYS.BLOGS, updated);
    if (isFirebaseConfigured) {
      deleteBlogFromFirestore(id).catch((e) => console.warn('Firestore blog delete note:', e));
    }
  };

  const incrementBlogViews = (idOrSlug: string) => {
    const updated = blogs.map((b) => {
      if (b.id === idOrSlug || b.slug === idOrSlug) {
        return { ...b, views: (b.views || 0) + 1 };
      }
      return b;
    });
    setBlogs(updated);
    saveItem(STORAGE_KEYS.BLOGS, updated);
    const target = updated.find((b) => b.id === idOrSlug || b.slug === idOrSlug);
    if (target && isFirebaseConfigured) {
      saveBlogToFirestore(target).catch((e) => console.warn('Firestore blog view note:', e));
    }
  };

  const toggleBlogLike = (idOrSlug: string) => {
    let nextLikes = 0;
    const updated = blogs.map((b) => {
      if (b.id === idOrSlug || b.slug === idOrSlug) {
        nextLikes = (b.likes || 0) + 1;
        return { ...b, likes: nextLikes };
      }
      return b;
    });
    setBlogs(updated);
    saveItem(STORAGE_KEYS.BLOGS, updated);
    const target = updated.find((b) => b.id === idOrSlug || b.slug === idOrSlug);
    if (target && isFirebaseConfigured) {
      saveBlogToFirestore(target).catch((e) => console.warn('Firestore blog like note:', e));
    }
    return nextLikes;
  };

  const addNews = (newsData: Omit<NewsItem, 'id' | 'likes'>) => {
    const newItem: NewsItem = {
      ...newsData,
      id: `news-${Date.now()}`,
      likes: 0,
      isVisible: true,
    };
    const updated = [newItem, ...news];
    setNews(updated);
    saveItem(STORAGE_KEYS.NEWS, updated);
    if (isFirebaseConfigured) {
      saveNewsToFirestore(newItem).catch((e) => console.warn('Firestore news save note:', e));
    }
    return newItem;
  };

  const updateNews = (id: string, data: Partial<NewsItem>) => {
    const updated = news.map((n) => (n.id === id ? { ...n, ...data } : n));
    setNews(updated);
    saveItem(STORAGE_KEYS.NEWS, updated);
    const target = updated.find((n) => n.id === id);
    if (target && isFirebaseConfigured) {
      saveNewsToFirestore(target).catch((e) => console.warn('Firestore news update note:', e));
    }
  };

  const deleteNews = (id: string) => {
    const updated = news.filter((n) => n.id !== id);
    setNews(updated);
    saveItem(STORAGE_KEYS.NEWS, updated);
    if (isFirebaseConfigured) {
      deleteNewsFromFirestore(id).catch((e) => console.warn('Firestore news delete note:', e));
    }
  };

  const addStudentToCRM = (student: Partial<BatchMember>) => {
    const isLead = student.role === 'Team Lead' || !!student.isTeamLead;
    const role = student.role || (isLead ? 'Team Lead' : 'Student');
    const teamName = student.teamName?.trim() || 'Unassigned';

    const newMember: BatchMember = {
      id: student.id || `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: student.name || 'New Student',
      rollNo: student.rollNo || `2300290100${Math.floor(100 + Math.random() * 900)}`,
      email: student.email || `${(student.name || 'student').toLowerCase().replace(/\s+/g, '.')}@kiet.edu`,
      domain: student.domain || 'IoT & Embedded Systems',
      year: student.year || '3rd Year',
      branch: student.branch || 'ECE',
      batchYear: (student.batchYear as string) || '2026',
      teamName,
      isTeamLead: isLead,
      role,
      photoUrl: student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=2563EB&color=fff&size=128`,
      skills: student.skills && student.skills.length > 0 ? student.skills : ['IoT', 'Microcontrollers', 'C++'],
      status: 'active',
      tempPassword: student.tempPassword || `SCL@${Math.floor(1000 + Math.random() * 9000)}`,
      passwordResetRequired: true,
    };
    const updated = [newMember, ...batches];
    setBatches(updated);
    saveItem(STORAGE_KEYS.BATCHES, updated);
    if (isFirebaseConfigured) {
      saveStudentToFirestore(newMember).catch((e) => console.warn('Firestore sync note:', e));
    }
    return newMember;
  };

  const addStudentsBulk = (newStudents: Partial<BatchMember>[]) => {
    const createdMembers: BatchMember[] = newStudents.map((s, idx) => {
      const isLead = s.role === 'Team Lead' || !!s.isTeamLead;
      const role = s.role || (isLead ? 'Team Lead' : 'Student');
      const teamName = s.teamName?.trim() || 'Unassigned';
      return {
        id: s.id || `mem-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        name: s.name || `Student ${idx + 1}`,
        rollNo: s.rollNo || `2300290100${Math.floor(100 + Math.random() * 900)}`,
        email: s.email || `${(s.name || 'student').toLowerCase().replace(/\s+/g, '.')}@kiet.edu`,
        domain: s.domain || 'IoT & Embedded Systems',
        year: s.year || '3rd Year',
        branch: s.branch || 'CSE',
        batchYear: (s.batchYear as string) || '2026',
        teamName,
        isTeamLead: isLead,
        role,
        photoUrl: s.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || 'Student')}&background=2563EB&color=fff&size=128`,
        skills: s.skills && s.skills.length > 0 ? s.skills : ['IoT', 'Python', 'Embedded C'],
        status: 'active',
        tempPassword: `SCL@${Math.floor(1000 + Math.random() * 9000)}`,
        passwordResetRequired: true,
      };
    });

    const updated = [...createdMembers, ...batches];
    setBatches(updated);
    saveItem(STORAGE_KEYS.BATCHES, updated);
    if (isFirebaseConfigured) {
      createdMembers.forEach((m) => {
        saveStudentToFirestore(m).catch((e) => console.warn('Firestore sync note:', e));
      });
    }
    return createdMembers;
  };

  const updateStudentRole = (memberId: string, newRole: 'Student' | 'Team Lead' | 'Mentor' | 'Faculty') => {
    const isLead = newRole === 'Team Lead';
    const updatedBatches = batches.map((b) =>
      b.id === memberId
        ? {
            ...b,
            role: newRole,
            isTeamLead: isLead,
          }
        : b
    );
    setBatches(updatedBatches);
    saveItem(STORAGE_KEYS.BATCHES, updatedBatches);

    // Also update teams if member is in a team
    const targetMember = batches.find((b) => b.id === memberId);
    if (targetMember) {
      if (isFirebaseConfigured) {
        const updatedTarget = updatedBatches.find((b) => b.id === memberId);
        if (updatedTarget) saveStudentToFirestore(updatedTarget).catch((e) => console.warn('Firestore role sync note:', e));
      }

      if (targetMember.teamName && targetMember.teamName !== 'Unassigned') {
        const updatedTeams = teams.map((t) => {
          if (t.name === targetMember.teamName) {
            const nextT = isLead
              ? {
                  ...t,
                  teamLead: {
                    id: targetMember.id,
                    name: targetMember.name,
                    email: targetMember.email,
                    rollNo: targetMember.rollNo,
                  },
                  members: t.members.map((m) =>
                    m.id === memberId || m.rollNo === targetMember.rollNo
                      ? { ...m, role: 'Team Lead' }
                      : m
                  ),
                }
              : {
                  ...t,
                  members: t.members.map((m) =>
                    m.id === memberId || m.rollNo === targetMember.rollNo
                      ? { ...m, role: newRole }
                      : m
                  ),
                };
            if (isFirebaseConfigured) saveTeamToFirestore(nextT).catch((e) => console.warn('Firestore team sync note:', e));
            return nextT;
          }
          return t;
        });
        setTeams(updatedTeams);
        saveItem(STORAGE_KEYS.TEAMS, updatedTeams);
      }
    }
  };

  const assignStudentToTeam = (memberId: string, teamName: string, isLead: boolean = false) => {
    const targetStudent = batches.find((b) => b.id === memberId);
    if (!targetStudent) return;

    const newRole: 'Student' | 'Team Lead' = isLead ? 'Team Lead' : 'Student';
    const updatedBatches = batches.map((b) =>
      b.id === memberId
        ? {
            ...b,
            teamName,
            isTeamLead: isLead,
            role: newRole,
          }
        : b
    );
    setBatches(updatedBatches);
    saveItem(STORAGE_KEYS.BATCHES, updatedBatches);

    const updatedTargetStudent = updatedBatches.find((b) => b.id === memberId);
    if (updatedTargetStudent && isFirebaseConfigured) {
      saveStudentToFirestore(updatedTargetStudent).catch((e) => console.warn('Firestore student team sync note:', e));
    }

    // Sync to teams array
    const updatedTeams = teams.map((t) => {
      // Remove from previous team if any
      const cleanedMembers = t.members.filter((m) => m.id !== memberId && m.rollNo !== targetStudent.rollNo);

      if (t.name === teamName) {
        const newRosterMember = {
          id: targetStudent.id,
          name: targetStudent.name,
          rollNo: targetStudent.rollNo,
          email: targetStudent.email,
          role: newRole,
          attendance: 100,
        };
        const newMembers = [...cleanedMembers, newRosterMember];
        const nextTeam = {
          ...t,
          membersCount: newMembers.length,
          members: newMembers,
          teamLead: isLead
            ? {
                id: targetStudent.id,
                name: targetStudent.name,
                email: targetStudent.email,
                rollNo: targetStudent.rollNo,
              }
            : t.teamLead,
        };
        if (isFirebaseConfigured) {
          saveTeamToFirestore(nextTeam).catch((e) => console.warn('Firestore team sync note:', e));
        }
        return nextTeam;
      }

      const nextOther = {
        ...t,
        membersCount: cleanedMembers.length,
        members: cleanedMembers,
      };
      if (cleanedMembers.length !== t.members.length && isFirebaseConfigured) {
        saveTeamToFirestore(nextOther).catch((e) => console.warn('Firestore team sync note:', e));
      }
      return nextOther;
    });

    setTeams(updatedTeams);
    saveItem(STORAGE_KEYS.TEAMS, updatedTeams);
  };

  const removeStudentFromTeam = (memberId: string) => {
    const updatedBatches = batches.map((b) =>
      b.id === memberId
        ? {
            ...b,
            teamName: 'Unassigned',
            isTeamLead: false,
            role: 'Student' as const,
          }
        : b
    );
    setBatches(updatedBatches);
    saveItem(STORAGE_KEYS.BATCHES, updatedBatches);

    const updatedStudent = updatedBatches.find((b) => b.id === memberId);
    if (updatedStudent && isFirebaseConfigured) {
      saveStudentToFirestore(updatedStudent).catch((e) => console.warn('Firestore student unassign note:', e));
    }

    // Remove from team roster
    const updatedTeams = teams.map((t) => {
      const filtered = t.members.filter((m) => m.id !== memberId);
      const nextT = {
        ...t,
        members: filtered,
        membersCount: filtered.length,
      };
      if (filtered.length !== t.members.length && isFirebaseConfigured) {
        saveTeamToFirestore(nextT).catch((e) => console.warn('Firestore team unassign note:', e));
      }
      return nextT;
    });
    setTeams(updatedTeams);
    saveItem(STORAGE_KEYS.TEAMS, updatedTeams);
  };

  const assignStudentsToBatch = (studentIds: string[], targetBatchYear: string) => {
    const updated = batches.map((b) =>
      studentIds.includes(b.id) ? { ...b, batchYear: targetBatchYear } : b
    );
    setBatches(updated);
    saveItem(STORAGE_KEYS.BATCHES, updated);
    if (isFirebaseConfigured) {
      updated
        .filter((b) => studentIds.includes(b.id))
        .forEach((s) => {
          saveStudentToFirestore(s).catch((e) => console.warn('Firestore student sync note:', e));
        });
    }
  };

  const addBatchFile = (
    batchId: string,
    file: { name: string; type: 'excel' | 'pdf'; size?: string; rowCount?: number }
  ) => {
    const updated = batchInfos.map((b) => {
      if (b.id !== batchId) return b;
      const existing = b.uploadedFiles || [];
      return {
        ...b,
        uploadedFiles: [
          ...existing,
          {
            ...file,
            uploadedAt: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          },
        ],
      };
    });
    setBatchInfos(updated);
    saveItem(STORAGE_KEYS.BATCH_INFOS, updated);
    const target = updated.find((b) => b.id === batchId);
    if (target && isFirebaseConfigured) {
      saveBatchToFirestore(target).catch((e) => console.warn('Firestore batch file note:', e));
    }
  };

  const assignBatchMentor = (batchId: string, mentorLead: string) => {
    const updated = batchInfos.map((b) => (b.id === batchId ? { ...b, mentorLead } : b));
    setBatchInfos(updated);
    saveItem(STORAGE_KEYS.BATCH_INFOS, updated);
    const target = updated.find((b) => b.id === batchId);
    if (target && isFirebaseConfigured) {
      saveBatchToFirestore(target).catch((e) => console.warn('Firestore mentor update note:', e));
    }
  };

  const resetStudentPassword = (memberId: string) => {
    const newTemp = `SCL@${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = batches.map((b) =>
      b.id === memberId ? { ...b, tempPassword: newTemp, passwordResetRequired: true } : b
    );
    setBatches(updated);
    saveItem(STORAGE_KEYS.BATCHES, updated);
    return newTemp;
  };

  const addBatch = (batchData: Omit<BatchInfo, 'id'>) => {
    const newBatch: BatchInfo = {
      ...batchData,
      id: `batch-${batchData.year || Date.now()}`,
    };
    const updated = [newBatch, ...batchInfos];
    setBatchInfos(updated);
    saveItem(STORAGE_KEYS.BATCH_INFOS, updated);
    if (isFirebaseConfigured) {
      saveBatchToFirestore(newBatch).catch((e) => console.warn('Firestore batch save note:', e));
    }
    return newBatch;
  };

  const updateBatch = (id: string, patch: Partial<BatchInfo>) => {
    const updated = batchInfos.map((b) => (b.id === id ? { ...b, ...patch } : b));
    setBatchInfos(updated);
    saveItem(STORAGE_KEYS.BATCH_INFOS, updated);
    const target = updated.find((b) => b.id === id);
    if (target && isFirebaseConfigured) {
      saveBatchToFirestore(target).catch((e) => console.warn('Firestore batch update note:', e));
    }
  };

  const deleteBatch = (id: string) => {
    const updated = batchInfos.filter((b) => b.id !== id);
    setBatchInfos(updated);
    saveItem(STORAGE_KEYS.BATCH_INFOS, updated);
    if (isFirebaseConfigured) {
      deleteBatchFromFirestore(id).catch((e) => console.warn('Firestore batch delete note:', e));
    }
  };

  const addFaculty = (facultyData: Omit<LabInnovator, 'id'>) => {
    const newFac: LabInnovator = {
      ...facultyData,
      id: `fac-${Date.now()}`,
    };
    const updated = [...innovators, newFac];
    setInnovators(updated);
    saveItem(STORAGE_KEYS.INNOVATORS, updated);
    if (isFirebaseConfigured) {
      saveFacultyToFirestore(newFac).catch((e) => console.warn('Firestore faculty save note:', e));
    }
    return newFac;
  };

  const updateFaculty = (id: string, patch: Partial<LabInnovator>) => {
    const updated = innovators.map((f) => (f.id === id ? { ...f, ...patch } : f));
    setInnovators(updated);
    saveItem(STORAGE_KEYS.INNOVATORS, updated);
    const target = updated.find((f) => f.id === id);
    if (target && isFirebaseConfigured) {
      saveFacultyToFirestore(target).catch((e) => console.warn('Firestore faculty update note:', e));
    }
  };

  const deleteFaculty = (id: string) => {
    const updated = innovators.filter((f) => f.id !== id);
    setInnovators(updated);
    saveItem(STORAGE_KEYS.INNOVATORS, updated);
    if (isFirebaseConfigured) {
      deleteFacultyFromFirestore(id).catch((e) => console.warn('Firestore faculty delete note:', e));
    }
  };

  return {
    mounted,
    innovators,
    projects,
    news,
    blogs,
    batches,
    batchInfos,
    gallery,
    quests,
    teams,
    tasks,
    submissions,
    user,
    setUser: updateUser,
    switchUser,
    addProject,
    toggleProjectVisibility,
    updateProject,
    deleteProject,
    addBlog,
    updateBlog,
    deleteBlog,
    toggleBlogVisibility,
    incrementBlogViews,
    toggleBlogLike,
    addNews,
    updateNews,
    deleteNews,
    toggleNewsVisibility,
    addStudentToCRM,
    addStudentsBulk,
    updateStudentRole,
    assignStudentToTeam,
    removeStudentFromTeam,
    assignStudentsToBatch,
    addBatchFile,
    assignBatchMentor,
    resetStudentPassword,
    addBatch,
    updateBatch,
    deleteBatch,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    addIntern,
    updateIntern,
    deleteIntern,
    bulkAddInterns,
    approveSubmission,
    rejectSubmission,
    deleteSubmission,
    addQuickSubmission,
    postQuest,
    updateQuest,
    deleteQuest,
    applyForQuest,
    assignTask,
    updateTask,
    deleteTask,
    submitTaskVideo,
    createTeam,
    updateTeam,
    deleteTeam,
    updateTeamColor,
    markAttendance,
  };
}
