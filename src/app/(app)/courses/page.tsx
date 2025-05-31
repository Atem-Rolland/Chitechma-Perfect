
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Course } from "@/types";
import { BookOpen, Search, Filter, Tag, School, Info, CalendarDays, BookUser, PlusCircle, MinusCircle, Download, AlertCircle, XCircle, CheckCircle, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

const MIN_CREDITS = 18;
const MAX_CREDITS = 24;

const DEPARTMENTS = {
  CESM: "Computer Engineering and System Maintenance",
  NES: "Network Engineering and Security",
  EPS: "Electrical Power Systems",
  LTM: "Logistics and Transport Management",
  PRM: "Project Management",
  ACC: "Accounting",
  HMC: "Hotel Management and Catering",
  BFP: "Baking and Food Processing",
  FCT: "Fashion, Clothing and Textile",
  NUS: "Nursing",
  MLS: "Medical Laboratory Sciences",
};

// Mock data fetching function - replace with actual Firestore query
async function fetchCourses(): Promise<Course[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  const mockCourses: Course[] = [
    // Computer Engineering and System Maintenance
    { id: "CSE401_CESM", title: "Mobile Application Development", code: "CSE401", description: "Detailed course description for Mobile Application Development.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["CSE301"], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE409_CESM", title: "Software Development and OOP", code: "CSE409", description: "Detailed course description for Software Development and OOP.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_CESM", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.CESM, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE405_CESM", title: "Embedded Systems", code: "CSE405", description: "Detailed course description for Embedded Systems.", department: DEPARTMENTS.CESM, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NES403_CESM", title: "Modeling in Information System", code: "NES403", description: "Detailed course description for Modeling in Information System.", department: DEPARTMENTS.CESM, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE301_CESM", title: "Introduction to Algorithms", code: "CSE301", description: "Fundamental algorithms and data structures.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 300, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2023/2024" },


    // Network Engineering and Security
    { id: "NES405_NES", title: "Scripting and Programming", code: "NES405", description: "Detailed course description for Scripting and Programming.", department: DEPARTMENTS.NES, lecturerId: "lect006", lecturerName: "Dr. Oumarou", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NES409_NES", title: "Network Laboratory", code: "NES409", description: "Detailed course description for Network Laboratory.", department: DEPARTMENTS.NES, lecturerId: "lect007", lecturerName: "Prof. Kamga", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_NES", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.NES, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NES401_NES", title: "Network Security", code: "NES401", description: "Detailed course description for Network Security.", department: DEPARTMENTS.NES, lecturerId: "lect008", lecturerName: "Mr. Bakari", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NES403_NES", title: "Modeling in Information System", code: "NES403", description: "Detailed course description for Modeling in Information System.", department: DEPARTMENTS.NES, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },

    // Electrical Power Systems
    { id: "EPS411_EPS", title: "Microcontrollers and Microprocessors", code: "EPS411", description: "Detailed course description for Microcontrollers and Microprocessors.", department: DEPARTMENTS.EPS, lecturerId: "lect009", lecturerName: "Dr. Wato", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "EPS401_EPS", title: "Electric Power System I", code: "EPS401", description: "Detailed course description for Electric Power System I.", department: DEPARTMENTS.EPS, lecturerId: "lect010", lecturerName: "Prof. Ndam", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_EPS", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.EPS, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "EPS403_EPS", title: "Control Engineering", code: "EPS403", description: "Detailed course description for Control Engineering.", department: DEPARTMENTS.EPS, lecturerId: "lect011", lecturerName: "Mr. Sanda", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "EPS405_EPS", title: "Power Electronics", code: "EPS405", description: "Detailed course description for Power Electronics.", department: DEPARTMENTS.EPS, lecturerId: "lect012", lecturerName: "Ms. Zola", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },

    // Logistics and Transport Management
    { id: "LTM403_LTM", title: "Humanitarian Logistics", code: "LTM403", description: "Detailed course description for Humanitarian Logistics.", department: DEPARTMENTS.LTM, lecturerId: "lect013", lecturerName: "Dr. Bello", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "LTM401_LTM", title: "Custom Procedures and Clearance Systems", code: "LTM401", description: "Detailed course description for Custom Procedures and Clearance Systems.", department: DEPARTMENTS.LTM, lecturerId: "lect014", lecturerName: "Prof. Issa", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_LTM", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.LTM, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT411_LTM", title: "Management Information Systems", code: "MGT411", description: "Detailed course description for Management Information Systems.", department: DEPARTMENTS.LTM, lecturerId: "lect015", lecturerName: "Mr. Adamu", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT413_LTM", title: "Business Ethics and Corporate Governance", code: "MGT413", description: "Detailed course description for Business Ethics and Corporate Governance.", department: DEPARTMENTS.LTM, lecturerId: "lect016", lecturerName: "Ms. Amina", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "LTM405_LTM", title: "Fundamentals of Supply Chain Management", code: "LTM405", description: "Detailed course description for Fundamentals of Supply Chain Management.", department: DEPARTMENTS.LTM, lecturerId: "lect017", lecturerName: "Dr. Chinedu", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },

    // Project Management
    { id: "HRM407_PRM", title: "Performance Management and Motivation", code: "HRM407", description: "Detailed course description for Performance Management and Motivation.", department: DEPARTMENTS.PRM, lecturerId: "lect018", lecturerName: "Prof. Etta", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "PRM405_PRM", title: "Procurement and Contract Management", code: "PRM405", description: "Detailed course description for Procurement and Contract Management.", department: DEPARTMENTS.PRM, lecturerId: "lect019", lecturerName: "Mr. Okoro", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_PRM", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.PRM, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "PRM403_PRM", title: "Project Development and Grant Writing", code: "PRM403", description: "Detailed course description for Project Development and Grant Writing.", department: DEPARTMENTS.PRM, lecturerId: "lect020", lecturerName: "Ms. Ngozi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT413_PRM", title: "Business Ethics and Corporate Governance", code: "MGT413", description: "Detailed course description for Business Ethics and Corporate Governance.", department: DEPARTMENTS.PRM, lecturerId: "lect016", lecturerName: "Ms. Amina", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "LTM405_PRM", title: "Fundamentals of Supply Chain Management", code: "LTM405", description: "Detailed course description for Fundamentals of Supply Chain Management.", department: DEPARTMENTS.PRM, lecturerId: "lect017", lecturerName: "Dr. Chinedu", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    
    // Accounting
    { id: "ACC403_ACC", title: "Computerized Accounting", code: "ACC403", description: "Detailed course description for Computerized Accounting.", department: DEPARTMENTS.ACC, lecturerId: "lect021", lecturerName: "Dr. Obi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "FIN411_ACC", title: "Financial Management", code: "FIN411", description: "Detailed course description for Financial Management.", department: DEPARTMENTS.ACC, lecturerId: "lect022", lecturerName: "Prof. Eze", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_ACC", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.ACC, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT411_ACC", title: "Management Information Systems", code: "MGT411", description: "Detailed course description for Management Information Systems.", department: DEPARTMENTS.ACC, lecturerId: "lect015", lecturerName: "Mr. Adamu", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT413_ACC", title: "Business Ethics and Corporate Governance", code: "MGT413", description: "Detailed course description for Business Ethics and Corporate Governance.", department: DEPARTMENTS.ACC, lecturerId: "lect016", lecturerName: "Ms. Amina", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "ACC401_ACC", title: "Financial Accounting", code: "ACC401", description: "Detailed course description for Financial Accounting.", department: DEPARTMENTS.ACC, lecturerId: "lect023", lecturerName: "Ms. Ifeoma", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },

    // Hotel Management and Catering
    { id: "HRM407_HMC", title: "Performance Management and Motivation", code: "HRM407", description: "Detailed course description for Performance Management and Motivation.", department: DEPARTMENTS.HMC, lecturerId: "lect018", lecturerName: "Prof. Etta", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "HMC403_HMC", title: "Hotel Account and Financial Management", code: "HMC403", description: "Detailed course description for Hotel Account and Financial Management.", department: DEPARTMENTS.HMC, lecturerId: "lect024", lecturerName: "Dr. Adeleke", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_HMC", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.HMC, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "HMC401_HMC", title: "Hotel Operations/Front Office Management", code: "HMC401", description: "Detailed course description for Hotel Operations/Front Office Management.", department: DEPARTMENTS.HMC, lecturerId: "lect025", lecturerName: "Mr. Jean", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT413_HMC", title: "Business Ethics and Corporate Governance", code: "MGT413", description: "Detailed course description for Business Ethics and Corporate Governance.", department: DEPARTMENTS.HMC, lecturerId: "lect016", lecturerName: "Ms. Amina", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },

    // Baking and Food Processing
    { id: "BFP403_BFP", title: "Postharvest, Handling, Transformation and Storage", code: "BFP403", description: "Detailed course description for Postharvest, Handling, Transformation and Storage.", department: DEPARTMENTS.BFP, lecturerId: "lect026", lecturerName: "Dr. Yemisi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "BFP405_BFP", title: "Food Technology I", code: "BFP405", description: "Detailed course description for Food Technology I.", department: DEPARTMENTS.BFP, lecturerId: "lect027", lecturerName: "Prof. Tunde", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_BFP", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.BFP, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "BFP40A_BFP", title: "Functional Foods and Nutraceuticals", code: "BFP40A", description: "Detailed course description for Functional Foods and Nutraceuticals.", department: DEPARTMENTS.BFP, lecturerId: "lect028", lecturerName: "Mr. Femi", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "BFP401_BFP", title: "Food Analysis and Biotechnology", code: "BFP401", description: "Detailed course description for Food Analysis and Biotechnology.", department: DEPARTMENTS.BFP, lecturerId: "lect029", lecturerName: "Ms. Chika", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    
    // Fashion, Clothing and Textile
    { id: "CCT401_FCT", title: "Interior and Exterior Decoration", code: "CCT401", description: "Detailed course description for Interior and Exterior Decoration.", department: DEPARTMENTS.FCT, lecturerId: "lect030", lecturerName: "Dr. Aisha", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CTT409_FCT", title: "Industrial Dyeing and Chemical Processing of Textile", code: "CTT409", description: "Detailed course description for Industrial Dyeing and Chemical Processing of Textile.", department: DEPARTMENTS.FCT, lecturerId: "lect031", lecturerName: "Prof. Garba", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "FCT40A_FCT", title: "Techniques of Fabric Production, Analysis and Garment Manufacturing", code: "FCT40A", description: "Detailed course description for Techniques of Fabric Production, Analysis and Garment Manufacturing.", department: DEPARTMENTS.FCT, lecturerId: "lect032", lecturerName: "Mr. Kwame", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_FCT", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.FCT, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CTT405_FCT", title: "Handicraft and Millinery Accessories", code: "CTT405", description: "Detailed course description for Handicraft and Millinery Accessories.", department: DEPARTMENTS.FCT, lecturerId: "lect033", lecturerName: "Ms. Fatimah", credits: 3, type: "Elective", level: 400, schedule: "AMPHI200", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },

    // Nursing
    { id: "NUS405_NUS", title: "Traumatology Critical Care & Emergence", code: "NUS405", description: "Detailed course description for Traumatology Critical Care & Emergence.", department: DEPARTMENTS.NUS, lecturerId: "lect034", lecturerName: "Dr. Ibrahim", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NUS407_NUS", title: "Specific of Maternity Nursing & Reproductive Health", code: "NUS407", description: "Detailed course description for Specific of Maternity Nursing & Reproductive Health.", department: DEPARTMENTS.NUS, lecturerId: "lect035", lecturerName: "Prof. Diallo", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_NUS", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.NUS, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NUS409_NUS", title: "Specific of Community/Psychiatric Nursing", code: "NUS409", description: "Detailed course description for Specific of Community/Psychiatric Nursing.", department: DEPARTMENTS.NUS, lecturerId: "lect036", lecturerName: "Mr. Koffi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NUS401_NUS", title: "Medico-Surgical Nursing Gerontology", code: "NUS401", description: "Detailed course description for Medico-Surgical Nursing Gerontology.", department: DEPARTMENTS.NUS, lecturerId: "lect037", lecturerName: "Ms. Kante", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NUS403_NUS", title: "Pediatric & Adolescent Nursing", code: "NUS403", description: "Detailed course description for Pediatric & Adolescent Nursing.", department: DEPARTMENTS.NUS, lecturerId: "lect038", lecturerName: "Dr. Souleyman", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },

    // Medical Laboratory Sciences
    { id: "MLS405_MLS", title: "Histochemistry and Histopathology", code: "MLS405", description: "Detailed course description for Histochemistry and Histopathology.", department: DEPARTMENTS.MLS, lecturerId: "lect039", lecturerName: "Dr. Coulibaly", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MLS403_MLS", title: "Medical Parasitology and Entomology", code: "MLS403", description: "Detailed course description for Medical Parasitology and Entomology.", department: DEPARTMENTS.MLS, lecturerId: "lect040", lecturerName: "Prof. Diop", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_MLS", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.MLS, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MLS407_MLS", title: "Immunohaematology and Transfusion Science", code: "MLS407", description: "Detailed course description for Immunohaematology and Transfusion Science.", department: DEPARTMENTS.MLS, lecturerId: "lect041", lecturerName: "Mr. Traore", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MLS401_MLS", title: "Medical Biochemistry and Chemical Pathology", code: "MLS401", description: "Detailed course description for Medical Biochemistry and Chemical Pathology.", department: DEPARTMENTS.MLS, lecturerId: "lect042", lecturerName: "Ms. Keita", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
  ];
  return mockCourses;
}


// Mock registration status
const registrationMeta = {
  isOpen: true,
  deadline: "2024-09-15",
  academicYear: "2024/2025", // Default academic year for registration
  semester: "First Semester",   // Default semester for registration
};

export default function CoursesPage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    academicYear: registrationMeta.academicYear,
    semester: registrationMeta.semester,
    department: "all",
    level: "400", // Default to 400 level as per provided data
    courseType: "all",
  });
  const [registeredCourseIds, setRegisteredCourseIds] = useState<string[]>([]);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadCourses() {
      setIsLoading(true);
      const fetchedCourses = await fetchCourses();
      setAllCourses(fetchedCourses);
      setIsLoading(false);
    }
    loadCourses();
  }, []);

  const staticDepartments = useMemo(() => ["all", ...Object.values(DEPARTMENTS)], []);
  const staticLevels = useMemo(() => ["all", "200", "300", "400", "600", "700", "800"], []);
  const courseTypes = ["all", "Compulsory", "Elective", "General"];
  const academicYears = ["all", "2023/2024", "2024/2025", "2025/2026"]; 
  const semesters = ["all", "First Semester", "Second Semester", "Resit Semester"];

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredCourses = useMemo(() => {
    return allCourses
      .filter(course => 
        filters.academicYear === "all" || course.academicYear === filters.academicYear
      )
      .filter(course =>
        filters.semester === "all" || course.semester === filters.semester
      )
      .filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(course => filters.department === "all" || course.department === filters.department)
      .filter(course => filters.level === "all" || course.level.toString() === filters.level)
      .filter(course => filters.courseType === "all" || course.type === filters.courseType);
  }, [allCourses, searchTerm, filters]);

  const registeredCoursesList = useMemo(() => {
    return allCourses.filter(course => registeredCourseIds.includes(course.id));
  }, [allCourses, registeredCourseIds]);

  const totalRegisteredCredits = useMemo(() => {
    return registeredCoursesList.reduce((sum, course) => sum + course.credits, 0);
  }, [registeredCoursesList]);

  const handleRegisterCourse = (course: Course) => {
    if (!registrationMeta.isOpen) {
      toast({ title: "Registration Closed", description: "Course registration is currently closed.", variant: "destructive" });
      return;
    }
    if (totalRegisteredCredits + course.credits > MAX_CREDITS) {
      toast({ title: "Credit Limit Exceeded", description: `Cannot register. Exceeds maximum credit load of ${MAX_CREDITS}.`, variant: "destructive" });
      return;
    }
    if (registeredCourseIds.includes(course.id)) {
      toast({ title: "Already Registered", description: `You are already registered for ${course.code} - ${course.title}.`, variant: "default" });
      return;
    }

    const unmetPrerequisites = course.prerequisites?.filter(prereqCode => {
        const potentialPrereqCourses = allCourses.filter(c => c.code === prereqCode);
        if (potentialPrereqCourses.length === 0 && course.prerequisites && course.prerequisites.includes(prereqCode) ) { 
            // This implies a prerequisite code is listed but no such course exists in allCourses - data integrity issue or prereq from different non-loaded year/level
            // For now, consider it unmet if not found, though ideally prereqs should be resolvable to an existing course.
            // console.warn(`Prerequisite course code ${prereqCode} for ${course.code} not found in available courses.`);
            // To be strict, if a prereq code doesn't map to any course, it can't be met.
             return true; 
        }
        // Check if any of the potential prerequisite courses (which could be from different departments if codes are reused) are registered.
        const isPrereqMet = potentialPrereqCourses.some(pc => registeredCourseIds.includes(pc.id));
        return !isPrereqMet;
      });

    if (unmetPrerequisites && unmetPrerequisites.length > 0) {
      toast({
        title: "Prerequisites Not Met",
        description: `Cannot register ${course.code}. Missing prerequisites: ${unmetPrerequisites.join(', ')}.`,
        variant: "destructive",
      });
      return;
    }
    setRegisteredCourseIds(prev => [...prev, course.id]);
    toast({ title: "Course Registered", description: `${course.code} - ${course.title} has been successfully registered.`, variant: "default" });
  };

  const handleDropCourse = (courseId: string) => {
     if (!registrationMeta.isOpen) {
      toast({ title: "Registration Closed", description: "Cannot drop courses, registration is closed.", variant: "destructive" });
      return;
    }
    const courseToDrop = allCourses.find(c => c.id === courseId);
    setRegisteredCourseIds(prev => prev.filter(id => id !== courseId));
    if (courseToDrop) {
        toast({ title: "Course Dropped", description: `${courseToDrop.code} - ${courseToDrop.title} has been dropped.`, variant: "default" });
    }
  };

  const getCreditStatus = () => {
    if (totalRegisteredCredits < MIN_CREDITS) return {
      message: `You are under the minimum credit load (${MIN_CREDITS} credits). Please register more courses.`,
      variant: "warning" as const
    };
    if (totalRegisteredCredits > MAX_CREDITS) return {
      message: `You are over the maximum credit load (${MAX_CREDITS} credits). Please drop some courses.`,
      variant: "destructive" as const
    };
    return {
      message: `Total credits within the allowed range (${MIN_CREDITS}-${MAX_CREDITS}).`,
      variant: "success" as const
    };
  };
  
  const creditStatus = getCreditStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <header className="space-y-2">
        <h1 className="font-headline text-4xl font-bold">Course Registration</h1>
        <p className="text-lg text-muted-foreground">
          Register for courses for {filters.semester === "all" ? registrationMeta.semester : filters.semester}, {filters.academicYear === "all" ? registrationMeta.academicYear : filters.academicYear}.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="text-primary"/>Registration Status</CardTitle>
        </CardHeader>
        <CardContent>
          {registrationMeta.isOpen ? (
            <Alert variant="default" className="bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              <AlertTitle>Registration is OPEN</AlertTitle>
              <AlertDescription>
                Deadline to register or drop courses: <strong>{new Date(registrationMeta.deadline).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> for {registrationMeta.semester}, {registrationMeta.academicYear}.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertTitle>Registration is CLOSED</AlertTitle>
              <AlertDescription>
                The deadline for course registration for {registrationMeta.semester}, {registrationMeta.academicYear} has passed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="text-primary"/>Filter Courses</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Select value={filters.academicYear} onValueChange={(value) => handleFilterChange("academicYear", value)}>
            <SelectTrigger><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Academic Year</SelectTrigger>
            <SelectContent>
              {academicYears.map(year => <SelectItem key={year} value={year}>{year === "all" ? "All Years" : year}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.semester} onValueChange={(value) => handleFilterChange("semester", value)}>
            <SelectTrigger><BookOpen className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Semester</SelectTrigger>
            <SelectContent>
              {semesters.map(sem => <SelectItem key={sem} value={sem}>{sem === "all" ? "All Semesters" : sem}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}>
            <SelectTrigger><School className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Department</SelectTrigger>
            <SelectContent>
              {staticDepartments.map(dept => <SelectItem key={dept} value={dept}>{dept === "all" ? "All Departments" : dept}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.level} onValueChange={(value) => handleFilterChange("level", value)}>
            <SelectTrigger><BookUser className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Level</SelectTrigger>
            <SelectContent>
              {staticLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl === "all" ? "All Levels" : `${lvl} Level`}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.courseType} onValueChange={(value) => handleFilterChange("courseType", value)}>
            <SelectTrigger><Tag className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Course Type</SelectTrigger>
            <SelectContent>
              {courseTypes.map(type => <SelectItem key={type} value={type}>{type === "all" ? "All Types" : type}</SelectItem>)}
            </SelectContent>
          </Select>
           <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by title or code..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>Select courses to register for {filters.semester === "all" ? registrationMeta.semester : filters.semester}, {filters.academicYear === "all" ? registrationMeta.academicYear : filters.academicYear}.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : filteredCourses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Lecturer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map(course => {
                    const isRegistered = registeredCourseIds.includes(course.id);
                    const canRegister = !isRegistered && registrationMeta.isOpen && (totalRegisteredCredits + course.credits <= MAX_CREDITS);
                    const canDrop = isRegistered && registrationMeta.isOpen;
                    return (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell className="text-center">{course.credits}</TableCell>
                        <TableCell><Badge variant={course.type === 'Compulsory' ? 'default' : course.type === 'Elective' ? 'secondary' : 'outline'}>{course.type}</Badge></TableCell>
                        <TableCell>{course.level}</TableCell>
                        <TableCell>{course.lecturerName}</TableCell>
                        <TableCell>
                          {isRegistered ? <Badge variant="success" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">Registered</Badge> : <Badge variant="outline">Available</Badge>}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                           <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setSelectedCourseForDetail(course)}>
                                <Eye className="h-4 w-4"/>
                                <span className="sr-only">View Details</span>
                              </Button>
                            </DialogTrigger>
                           </Dialog>
                          {isRegistered ? (
                            <Button variant="destructive" size="sm" onClick={() => handleDropCourse(course.id)} disabled={!canDrop}>
                              <MinusCircle className="mr-1 h-4 w-4"/> Drop
                            </Button>
                          ) : (
                            <Button variant="default" size="sm" onClick={() => handleRegisterCourse(course)} disabled={!canRegister || !registrationMeta.isOpen}>
                              <PlusCircle className="mr-1 h-4 w-4"/> Register
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Image src="https://placehold.co/300x200.png" alt="No courses found" width={200} height={133} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state education" />
                <h3 className="text-xl font-semibold">No Courses Found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria for the selected Academic Year and Semester.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Registered Courses</CardTitle>
              <CardDescription>Courses you are registered for this semester.</CardDescription>
            </CardHeader>
            <CardContent>
              {registeredCoursesList.length > 0 ? (
                <ul className="space-y-2">
                  {registeredCoursesList.map(course => (
                    <li key={course.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">{course.code} - {course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.credits} Credits</p>
                      </div>
                       {registrationMeta.isOpen && (
                        <Button variant="ghost" size="icon" onClick={() => handleDropCourse(course.id)} className="text-destructive hover:bg-destructive/10">
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Drop {course.code}</span>
                        </Button>
                       )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No courses registered yet.</p>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start space-y-3">
              <div className="w-full">
                <p className="text-lg font-semibold">Total Registered Credits: <span className={
                    totalRegisteredCredits < MIN_CREDITS || totalRegisteredCredits > MAX_CREDITS ? "text-destructive" : "text-green-600 dark:text-green-400"
                }>{totalRegisteredCredits}</span>
                </p>
                { (totalRegisteredCredits < MIN_CREDITS || totalRegisteredCredits > MAX_CREDITS) && registrationMeta.isOpen && (
                   <Alert variant={creditStatus.variant === "success" ? "default" : creditStatus.variant} className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{creditStatus.variant === "warning" ? "Warning" : "Error"}</AlertTitle>
                    <AlertDescription>{creditStatus.message}</AlertDescription>
                  </Alert>
                )}
                 { totalRegisteredCredits >= MIN_CREDITS && totalRegisteredCredits <= MAX_CREDITS && (
                   <Alert variant="default" className="mt-2 bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                    <AlertDescription>{creditStatus.message}</AlertDescription>
                  </Alert>
                 )}
              </div>
              <Button className="w-full" disabled={registeredCoursesList.length === 0}>
                <Download className="mr-2 h-4 w-4"/> Download Form B (PDF)
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {selectedCourseForDetail && (
        <Dialog open={!!selectedCourseForDetail} onOpenChange={(isOpen) => !isOpen && setSelectedCourseForDetail(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{selectedCourseForDetail.code} - {selectedCourseForDetail.title}</DialogTitle>
              <DialogDescription>Level {selectedCourseForDetail.level} - {selectedCourseForDetail.credits} Credits - {selectedCourseForDetail.type}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-sm">
              <p><strong>Department:</strong> {selectedCourseForDetail.department}</p>
              <p><strong>Lecturer:</strong> {selectedCourseForDetail.lecturerName || "N/A"}</p>
              <p><strong>Description:</strong> {selectedCourseForDetail.description}</p>
              {selectedCourseForDetail.schedule && <p><strong>Schedule:</strong> {selectedCourseForDetail.schedule}</p>}
              {selectedCourseForDetail.prerequisites && selectedCourseForDetail.prerequisites.length > 0 && (
                <p><strong>Prerequisites:</strong> {selectedCourseForDetail.prerequisites.join(', ')}</p>
              )}
            </div>
             <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
          </DialogContent>
        </Dialog>
      )}

    </motion.div>
  );
}

    

