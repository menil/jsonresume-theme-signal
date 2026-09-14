export interface ResumeProfile {
  network?: string;
  username?: string;
  url?: string;
}

export interface ResumeLocation {
  address?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  region?: string;
}

export interface ResumeBasics {
  name?: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: ResumeLocation;
  profiles?: ResumeProfile[];
  linkedin?: string;
  github?: string;
  pdf_url?: string;
}

export interface ResumeWorkRole {
  position?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  dates?: string;
}

export interface ResumeWork {
  name?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  description?: string;
  roles?: ResumeWorkRole[];
}

export interface EarlyCareerItem {
  dates?: string;
  details?: string;
}

export interface ResumeSkill {
  name?: string;
  level?: string;
  keywords?: string[];
}

export interface ResumeEducation {
  institution?: string;
  url?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
}

export interface ResumeCertificate {
  name?: string;
  date?: string;
  issuer?: string;
  url?: string;
}

export interface ResumePublication {
  name?: string;
  publisher?: string;
  releaseDate?: string;
  url?: string;
  summary?: string;
}

export interface ResumeData {
  basics?: ResumeBasics;
  work?: ResumeWork[];
  early_career?: EarlyCareerItem[];
  skills?: ResumeSkill[];
  education?: ResumeEducation[];
  certificates?: ResumeCertificate[];
  publications?: ResumePublication[];
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PreparedResumeData extends ResumeData {
  is_pdf?: boolean;
}

export interface ThemeOptions {
  asOfYear?: number;
  is_pdf?: boolean;
}
