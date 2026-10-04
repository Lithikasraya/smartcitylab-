import * as XLSX from 'xlsx';

export interface ParsedStudentRow {
  name: string;
  rollNo: string;
  email?: string;
  phone?: string;
  domain?: string;
  year?: string;
  branch?: string;
  teamName?: string;
  isTeamLead?: boolean;
  role?: 'Student' | 'Team Lead' | 'Mentor' | 'Faculty';
  batchYear?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
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
      const cleanKey = key.trim().toLowerCase().replace(/[\s_\-#/.]+/g, '');
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

    const phone =
      normalized['phone'] ||
      normalized['phonenumber'] ||
      normalized['phoneno'] ||
      normalized['mobile'] ||
      normalized['mobilenumber'] ||
      normalized['contact'] ||
      normalized['contactno'] ||
      normalized['contactnumber'] ||
      normalized['whatsapp'] ||
      '';

    const domain =
      normalized['domain'] ||
      normalized['specialization'] ||
      normalized['researchdomain'] ||
      'IoT & Embedded Systems';

    const year =
      normalized['year'] ||
      normalized['academicyear'] ||
      normalized['currentyear'] ||
      '3rd Year';

    const branch =
      normalized['branch'] ||
      normalized['department'] ||
      normalized['dept'] ||
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
      normalized['batchcohort'] ||
      normalized['batchyear'] ||
      normalized['batch'] ||
      normalized['cohort'] ||
      normalized['cohortname'] ||
      normalized['creamlayer'] ||
      normalized['creamlayercohort'] ||
      normalized['layer'] ||
      normalized['passoutyear'] ||
      'Cream Layer I';

    const rawSkills =
      normalized['skills'] ||
      normalized['competencies'] ||
      normalized['techstack'] ||
      'IoT, Python, Embedded C';

    const skills = rawSkills
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const github =
      normalized['github'] ||
      normalized['githubprofile'] ||
      normalized['githuburl'] ||
      '';

    const linkedin =
      normalized['linkedin'] ||
      normalized['linkedinprofile'] ||
      normalized['linkedinurl'] ||
      '';

    return {
      name,
      rollNo,
      email,
      phone: phone || undefined,
      domain,
      year,
      branch,
      teamName,
      isTeamLead,
      role,
      batchYear,
      skills: skills.length > 0 ? skills : ['Embedded C', 'IoT', 'Python'],
      github: github || undefined,
      linkedin: linkedin || undefined,
    };
  });
}

/**
 * Downloads a sample Excel (.xlsx) template for student roster importing,
 * dynamically populated with the lab's actual cohorts/batches.
 */
export function downloadSampleExcelTemplate(
  templateType: 'general' | 'batch' | 'team' = 'general',
  batchList?: { name: string; year: string; academicSession?: string }[],
  targetBatchYear?: string
) {
  const b1 = batchList?.[0]?.year || 'Cream Layer I';
  const b2 = batchList?.[1]?.year || 'Cream Layer II';
  const b3 = batchList?.[2]?.year || 'Cream Layer III';
  
  const chosenBatch1 = targetBatchYear || b1;
  const chosenBatch2 = targetBatchYear || b2;
  const chosenBatch3 = targetBatchYear || b3;

  const sampleData = [
    {
      'Name': 'Aarav Sharma',
      'Roll No': '2200290100012',
      'Email': 'aarav.sharma@kiet.edu',
      'Phone Number': '+91 98765 43210',
      'Batch / Cohort': chosenBatch1,
      'Academic Year': '4th Year',
      'Branch': 'CSE',
      'Domain': 'AI & Computer Vision',
      'Role': 'Team Lead',
      'Team Name': templateType === 'team' ? 'Team CyberVision' : 'Team Alpha',
      'Skills': 'YOLOv8, Python, PyTorch, Jetson Orin',
      'GitHub': 'https://github.com/aarav-sharma',
      'LinkedIn': 'https://linkedin.com/in/aarav-sharma',
    },
    {
      'Name': 'Rohan Verma',
      'Roll No': '2200290100045',
      'Email': 'rohan.verma@kiet.edu',
      'Phone Number': '+91 98123 45678',
      'Batch / Cohort': chosenBatch2,
      'Academic Year': '4th Year',
      'Branch': 'ECE',
      'Domain': 'IoT & Sensors',
      'Role': 'Student',
      'Team Name': templateType === 'team' ? 'Team CyberVision' : 'Team Alpha',
      'Skills': 'ESP32, LoRaWAN, C++, Circuit Design',
      'GitHub': 'https://github.com/rohan-verma',
      'LinkedIn': 'https://linkedin.com/in/rohan-verma',
    },
    {
      'Name': 'Sneha Patel',
      'Roll No': '2300290100088',
      'Email': 'sneha.patel@kiet.edu',
      'Phone Number': '+91 99887 76655',
      'Batch / Cohort': chosenBatch3,
      'Academic Year': '3rd Year',
      'Branch': 'IT',
      'Domain': 'Web & Cloud',
      'Role': 'Student',
      'Team Name': templateType === 'team' ? 'Team CyberVision' : 'Team Beta',
      'Skills': 'Next.js, TypeScript, TailwindCSS, PostgreSQL',
      'GitHub': 'https://github.com/sneha-patel',
      'LinkedIn': 'https://linkedin.com/in/sneha-patel',
    },
    {
      'Name': 'Vikram Aditya',
      'Roll No': '2300290100104',
      'Email': 'vikram.aditya@kiet.edu',
      'Phone Number': '+91 97654 32109',
      'Batch / Cohort': chosenBatch3,
      'Academic Year': '3rd Year',
      'Branch': 'Mechanical',
      'Domain': 'Robotics & 3D Prototyping',
      'Role': 'Student',
      'Team Name': templateType === 'team' ? 'Team CyberVision' : 'Unassigned',
      'Skills': 'SolidWorks, ROS2, 3D Printing, Arduino',
      'GitHub': 'https://github.com/vikram-aditya',
      'LinkedIn': 'https://linkedin.com/in/vikram-aditya',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Roster');

  // Auto-fit column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Name
    { wch: 18 }, // Roll No
    { wch: 28 }, // Email
    { wch: 18 }, // Phone Number
    { wch: 18 }, // Batch / Cohort
    { wch: 15 }, // Academic Year
    { wch: 14 }, // Branch
    { wch: 26 }, // Domain
    { wch: 14 }, // Role
    { wch: 20 }, // Team Name
    { wch: 38 }, // Skills
    { wch: 32 }, // GitHub
    { wch: 32 }, // LinkedIn
  ];

  // Optional: Add a second sheet listing available cohorts
  if (batchList && batchList.length > 0) {
    const cohortsReferenceData = batchList.map((b) => ({
      'Cohort Name': b.name,
      'Value to use in Excel ("Batch / Cohort")': b.year,
      'Academic Session / Subtitle': b.academicSession || 'Active Research Cohort',
    }));
    const refWorksheet = XLSX.utils.json_to_sheet(cohortsReferenceData);
    refWorksheet['!cols'] = [{ wch: 26 }, { wch: 36 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(workbook, refWorksheet, 'Cohorts_Reference');
  }

  const filename = templateType === 'batch' && targetBatchYear
    ? `SCL_Students_Template_${targetBatchYear.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`
    : `SCL_Students_Template_${templateType}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
