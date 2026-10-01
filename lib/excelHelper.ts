import * as XLSX from 'xlsx';
import { BatchMember } from './data';

export interface ParsedStudentRow {
  name: string;
  rollNo: string;
  email?: string;
  domain?: string;
  year?: string;
  branch?: string;
  teamName?: string;
  isTeamLead?: boolean;
  role?: 'Student' | 'Team Lead' | 'Mentor' | 'Faculty';
  batchYear?: string;
  skills?: string[];
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV File from an <input type="file"> event
 */
export async function parseExcelOrCsv(file: File): Promise<ParsedStudentRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return rawRows.map((row, index) => {
    // Normalize keys to lowercase for flexible matching
    const normalized: Record<string, string> = {};
    Object.keys(row).forEach((key) => {
      const cleanKey = key.trim().toLowerCase().replace(/[\s_\-#]+/g, '');
      normalized[cleanKey] = String(row[key]).trim();
    });

    const name =
      normalized['name'] ||
      normalized['studentname'] ||
      normalized['fullname'] ||
      normalized['internname'] ||
      `Student ${index + 1}`;

    const rollNo =
      normalized['rollno'] ||
      normalized['rollnumber'] ||
      normalized['roll'] ||
      normalized['universityrollno'] ||
      `2300290100${String(index + 100).padStart(3, '0')}`;

    const email =
      normalized['email'] ||
      normalized['emailid'] ||
      normalized['studentemail'] ||
      `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@kiet.edu`;

    const domain =
      normalized['domain'] ||
      normalized['specialization'] ||
      normalized['researchdomain'] ||
      'IoT & Embedded Systems';

    const year =
      normalized['year'] ||
      normalized['academicyear'] ||
      '3rd Year';

    const branch =
      normalized['branch'] ||
      normalized['department'] ||
      'CSE';

    const teamName =
      normalized['team'] ||
      normalized['teamname'] ||
      normalized['assignedteam'] ||
      'Unassigned';

    const rawRole = (
      normalized['role'] ||
      normalized['designation'] ||
      normalized['position'] ||
      'Student'
    ).toLowerCase();

    let role: 'Student' | 'Team Lead' | 'Mentor' | 'Faculty' = 'Student';
    let isTeamLead = false;

    if (rawRole.includes('lead') || normalized['isteamlead'] === 'true' || normalized['lead'] === 'yes') {
      role = 'Team Lead';
      isTeamLead = true;
    } else if (rawRole.includes('mentor')) {
      role = 'Mentor';
    } else if (rawRole.includes('faculty')) {
      role = 'Faculty';
    }

    const batchYear =
      normalized['batch'] ||
      normalized['batchyear'] ||
      normalized['cohort'] ||
      '2026';

    const rawSkills =
      normalized['skills'] ||
      normalized['competencies'] ||
      normalized['techstack'] ||
      'IoT, Python, Embedded C';

    const skills = rawSkills
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      name,
      rollNo,
      email,
      domain,
      year,
      branch,
      teamName,
      isTeamLead,
      role,
      batchYear,
      skills: skills.length > 0 ? skills : ['Embedded C', 'IoT', 'Python'],
    };
  });
}

/**
 * Downloads a sample Excel (.xlsx) template for student roster importing
 */
export function downloadSampleExcelTemplate(templateType: 'general' | 'batch' | 'team' = 'general') {
  const sampleData = [
    {
      'Name': 'Aarav Sharma',
      'Roll No': '2200290100012',
      'Email': 'aarav.sharma@kiet.edu',
      'Batch': '2026',
      'Branch': 'CSE',
      'Year': '3rd Year',
      'Domain': 'AI & Computer Vision',
      'Role': 'Team Lead',
      'Team Name': templateType === 'team' ? 'Team CyberVision' : 'Unassigned',
      'Skills': 'YOLOv8, Python, PyTorch, Jetson Orin',
    },
    {
      'Name': 'Rohan Verma',
      'Roll No': '2200290100045',
      'Email': 'rohan.verma@kiet.edu',
      'Batch': '2026',
      'Branch': 'ECE',
      'Year': '3rd Year',
      'Domain': 'IoT & Sensors',
      'Role': 'Student',
      'Team Name': templateType === 'team' ? 'Team CyberVision' : 'Unassigned',
      'Skills': 'ESP32, LoRaWAN, C++, Circuit Design',
    },
    {
      'Name': 'Sneha Patel',
      'Roll No': '2300290100088',
      'Email': 'sneha.patel@kiet.edu',
      'Batch': '2026',
      'Branch': 'IT',
      'Year': '2nd Year',
      'Domain': 'Web & Cloud',
      'Role': 'Student',
      'Team Name': templateType === 'team' ? 'Team CyberVision' : 'Unassigned',
      'Skills': 'Next.js, TypeScript, TailwindCSS, PostgreSQL',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

  // Auto-fit column widths
  worksheet['!cols'] = [
    { wch: 18 }, // Name
    { wch: 16 }, // Roll No
    { wch: 26 }, // Email
    { wch: 10 }, // Batch
    { wch: 10 }, // Branch
    { wch: 12 }, // Year
    { wch: 22 }, // Domain
    { wch: 14 }, // Role
    { wch: 18 }, // Team Name
    { wch: 35 }, // Skills
  ];

  XLSX.writeFile(workbook, `SCL_Students_Template_${templateType}.xlsx`);
}
