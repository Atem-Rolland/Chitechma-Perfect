
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
import { BookOpen, Search, Filter, Tag, School, Info, CalendarDays, BookUser, PlusCircle, MinusCircle, Download, AlertCircle, XCircle, CheckCircle, Eye, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; 

const MIN_CREDITS = 18;
const MAX_CREDITS = 24;

const DEPARTMENTS = {
  CESM: "Department of computer engineering and system maintenance",
  NES: "Department of network engineering and security",
  EPS: "Department of electrical power systems",
  LTM: "Department of logistics and transport management",
  PRM: "Department of project management",
  ACC: "Department of accounting",
  HMC: "Department of hotel management and catering",
  BFP: "Department of baking and food processing",
  FCT: "Department of fashion,clothing and textile",
  NUS: "Department of nursing",
  MLS: "Department of medical laboratory sciences",
};

// Mock data fetching function - replace with actual Firestore query
async function fetchCourses(): Promise<Course[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockCourses: Course[] = [
    // --- 400 Level, First Semester, 2024/2025 Academic Year ---
    // CESM
    { id: "CSE401_CESM_Y2425_S1", title: "Mobile Application Development", code: "CSE401", description: "Detailed course description for Mobile Application Development. Covers native and cross-platform development.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 10-12, Wed 10-11, Lab Hall 1", prerequisites: ["CSE301"], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE409_CESM_Y2425_S1", title: "Software Development and OOP", code: "CSE409", description: "Detailed course description for Software Development and OOP. Focuses on object-oriented principles and design patterns.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Tue 14-16, Fri 8-9", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_CESM_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology. Introduction to research methods and academic writing.", department: DEPARTMENTS.CESM, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE405_CESM_Y2425_S1", title: "Embedded Systems", code: "CSE405", description: "Detailed course description for Embedded Systems. Design and programming of embedded systems.", department: DEPARTMENTS.CESM, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Thu 8-11", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NES403_CESM_Y2425_S1", title: "Modeling in Information System", code: "NES403", description: "Detailed course description for Modeling in Information System. Techniques for system modeling.", department: DEPARTMENTS.CESM, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Elective", level: 400, schedule: "Fri 11-13, CR10", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE301_CESM_PRE", title: "Introduction to Algorithms", code: "CSE301", description: "Fundamental algorithms and data structures. Prerequisite course.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 300, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2023/2024" }, 
    // NES
    { id: "NES405_NES_Y2425_S1", title: "Scripting and Programming", code: "NES405", description: "Detailed course description for Scripting and Programming.", department: DEPARTMENTS.NES, lecturerId: "lect006", lecturerName: "Dr. Oumarou", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 8-10, CR22", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NES409_NES_Y2425_S1", title: "Network Laboratory", code: "NES409", description: "Detailed course description for Network Laboratory.", department: DEPARTMENTS.NES, lecturerId: "lect007", lecturerName: "Prof. Kamga", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Wed 8-10 (Lab), Fri 14-15 (Lecture)", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_NES_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.NES, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NES401_NES_Y2425_S1", title: "Network Security", code: "NES401", description: "Detailed course description for Network Security.", department: DEPARTMENTS.NES, lecturerId: "lect008", lecturerName: "Mr. Bakari", credits: 3, type: "Compulsory", level: 400, schedule: "Tue 10-12, CR22", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NES403_NES_Y2425_S1", title: "Modeling in Information System", code: "NES403", description: "Detailed course description for Modeling in Information System.", department: DEPARTMENTS.NES, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Elective", level: 400, schedule: "Fri 11-13, CR10", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // EPS
    { id: "EPS411_EPS_Y2425_S1", title: "Microcontrollers and Microprocessors", code: "EPS411", description: "Detailed course description for Microcontrollers and Microprocessors.", department: DEPARTMENTS.EPS, lecturerId: "lect009", lecturerName: "Dr. Wato", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 14-16, ELab1", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "EPS401_EPS_Y2425_S1", title: "Electric Power System I", code: "EPS401", description: "Detailed course description for Electric Power System I.", department: DEPARTMENTS.EPS, lecturerId: "lect010", lecturerName: "Prof. Ndam", credits: 3, type: "Compulsory", level: 400, schedule: "Tue 8-10, AMPHI300", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_EPS_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.EPS, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "EPS403_EPS_Y2425_S1", title: "Control Engineering", code: "EPS403", description: "Detailed course description for Control Engineering.", department: DEPARTMENTS.EPS, lecturerId: "lect011", lecturerName: "Mr. Sanda", credits: 3, type: "Compulsory", level: 400, schedule: "Thu 10-12, CR5", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "EPS405_EPS_Y2425_S1", title: "Power Electronics", code: "EPS405", description: "Detailed course description for Power Electronics.", department: DEPARTMENTS.EPS, lecturerId: "lect012", lecturerName: "Ms. Zola", credits: 3, type: "Compulsory", level: 400, schedule: "Fri 14-16, ELab2", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // LTM
    { id: "LTM403_LTM_Y2425_S1", title: "Humanitarian Logistics", code: "LTM403", description: "Detailed course description for Humanitarian Logistics.", department: DEPARTMENTS.LTM, lecturerId: "lect013", lecturerName: "Dr. Bello", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "LTM401_LTM_Y2425_S1", title: "Custom Procedures and Clearance Systems", code: "LTM401", description: "Detailed course description for Custom Procedures and Clearance Systems.", department: DEPARTMENTS.LTM, lecturerId: "lect014", lecturerName: "Prof. Issa", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_LTM_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.LTM, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT411_LTM_Y2425_S1", title: "Management Information Systems", code: "MGT411", description: "Detailed course description for Management Information Systems.", department: DEPARTMENTS.LTM, lecturerId: "lect015", lecturerName: "Mr. Adamu", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT413_LTM_Y2425_S1", title: "Business Ethics and Corporate Governance", code: "MGT413", description: "Detailed course description for Business Ethics and Corporate Governance.", department: DEPARTMENTS.LTM, lecturerId: "lect016", lecturerName: "Ms. Amina", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "LTM405_LTM_Y2425_S1", title: "Fundamentals of Supply Chain Management", code: "LTM405", description: "Detailed course description for Fundamentals of Supply Chain Management.", department: DEPARTMENTS.LTM, lecturerId: "lect017", lecturerName: "Dr. Chinedu", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // PRM
    { id: "HRM407_PRM_Y2425_S1", title: "Performance Management and Motivation", code: "HRM407", description: "Detailed course description for Performance Management and Motivation.", department: DEPARTMENTS.PRM, lecturerId: "lect018", lecturerName: "Prof. Etta", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "PRM405_PRM_Y2425_S1", title: "Procurement and Contract Management", code: "PRM405", description: "Detailed course description for Procurement and Contract Management.", department: DEPARTMENTS.PRM, lecturerId: "lect019", lecturerName: "Mr. Okoro", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_PRM_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.PRM, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "PRM403_PRM_Y2425_S1", title: "Project Development and Grant Writing", code: "PRM403", description: "Detailed course description for Project Development and Grant Writing.", department: DEPARTMENTS.PRM, lecturerId: "lect020", lecturerName: "Ms. Ngozi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT413_PRM_Y2425_S1", title: "Business Ethics and Corporate Governance", code: "MGT413", description: "Detailed course description for Business Ethics and Corporate Governance.", department: DEPARTMENTS.PRM, lecturerId: "lect016", lecturerName: "Ms. Amina", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "LTM405_PRM_Y2425_S1", title: "Fundamentals of Supply Chain Management", code: "LTM405", description: "Detailed course description for Fundamentals of Supply Chain Management.", department: DEPARTMENTS.PRM, lecturerId: "lect017", lecturerName: "Dr. Chinedu", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // ACC
    { id: "ACC403_ACC_Y2425_S1", title: "Computerized Accounting", code: "ACC403", description: "Detailed course description for Computerized Accounting.", department: DEPARTMENTS.ACC, lecturerId: "lect021", lecturerName: "Dr. Obi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "FIN411_ACC_Y2425_S1", title: "Financial Management", code: "FIN411", description: "Detailed course description for Financial Management.", department: DEPARTMENTS.ACC, lecturerId: "lect022", lecturerName: "Prof. Eze", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_ACC_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.ACC, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT411_ACC_Y2425_S1", title: "Management Information Systems", code: "MGT411", description: "Detailed course description for Management Information Systems.", department: DEPARTMENTS.ACC, lecturerId: "lect015", lecturerName: "Mr. Adamu", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT413_ACC_Y2425_S1", title: "Business Ethics and Corporate Governance", code: "MGT413", description: "Detailed course description for Business Ethics and Corporate Governance.", department: DEPARTMENTS.ACC, lecturerId: "lect016", lecturerName: "Ms. Amina", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "ACC401_ACC_Y2425_S1", title: "Financial Accounting", code: "ACC401", description: "Detailed course description for Financial Accounting.", department: DEPARTMENTS.ACC, lecturerId: "lect023", lecturerName: "Ms. Ifeoma", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // HMC
    { id: "HRM407_HMC_Y2425_S1", title: "Performance Management and Motivation", code: "HRM407", description: "Detailed course description for Performance Management and Motivation.", department: DEPARTMENTS.HMC, lecturerId: "lect018", lecturerName: "Prof. Etta", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "HMC403_HMC_Y2425_S1", title: "Hotel Account and Financial Management", code: "HMC403", description: "Detailed course description for Hotel Account and Financial Management.", department: DEPARTMENTS.HMC, lecturerId: "lect024", lecturerName: "Dr. Adeleke", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_HMC_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.HMC, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "HMC401_HMC_Y2425_S1", title: "Hotel Operations/Front Office Management", code: "HMC401", description: "Detailed course description for Hotel Operations/Front Office Management.", department: DEPARTMENTS.HMC, lecturerId: "lect025", lecturerName: "Mr. Jean", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT413_HMC_Y2425_S1", title: "Business Ethics and Corporate Governance", code: "MGT413", description: "Detailed course description for Business Ethics and Corporate Governance.", department: DEPARTMENTS.HMC, lecturerId: "lect016", lecturerName: "Ms. Amina", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // BFP
    { id: "BFP403_BFP_Y2425_S1", title: "Postharvest, Handling, Transformation and Storage", code: "BFP403", description: "Detailed course description for Postharvest, Handling, Transformation and Storage.", department: DEPARTMENTS.BFP, lecturerId: "lect026", lecturerName: "Dr. Yemisi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "BFP405_BFP_Y2425_S1", title: "Food Technology I", code: "BFP405", description: "Detailed course description for Food Technology I.", department: DEPARTMENTS.BFP, lecturerId: "lect027", lecturerName: "Prof. Tunde", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_BFP_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.BFP, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "BFP40A_BFP_Y2425_S1", title: "Functional Foods and Nutraceuticals", code: "BFP40A", description: "Detailed course description for Functional Foods and Nutraceuticals.", department: DEPARTMENTS.BFP, lecturerId: "lect028", lecturerName: "Mr. Femi", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "BFP401_BFP_Y2425_S1", title: "Food Analysis and Biotechnology", code: "BFP401", description: "Detailed course description for Food Analysis and Biotechnology.", department: DEPARTMENTS.BFP, lecturerId: "lect029", lecturerName: "Ms. Chika", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // FCT
    { id: "CCT401_FCT_Y2425_S1", title: "Interior and Exterior Decoration", code: "CCT401", description: "Detailed course description for Interior and Exterior Decoration.", department: DEPARTMENTS.FCT, lecturerId: "lect030", lecturerName: "Dr. Aisha", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CTT409_FCT_Y2425_S1", title: "Industrial Dyeing and Chemical Processing of Textile", code: "CTT409", description: "Detailed course description for Industrial Dyeing and Chemical Processing of Textile.", department: DEPARTMENTS.FCT, lecturerId: "lect031", lecturerName: "Prof. Garba", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "FCT40A_FCT_Y2425_S1", title: "Techniques of Fabric Production, Analysis and Garment Manufacturing", code: "FCT40A", description: "Detailed course description for Techniques of Fabric Production, Analysis and Garment Manufacturing.", department: DEPARTMENTS.FCT, lecturerId: "lect032", lecturerName: "Mr. Kwame", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_FCT_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.FCT, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CTT405_FCT_Y2425_S1", title: "Handicraft and Millinery Accessories", code: "CTT405", description: "Detailed course description for Handicraft and Millinery Accessories.", department: DEPARTMENTS.FCT, lecturerId: "lect033", lecturerName: "Ms. Fatimah", credits: 3, type: "Elective", level: 400, schedule: "AMPHI200, Fri 9-11", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // NUS
    { id: "NUS405_NUS_Y2425_S1", title: "Traumatology Critical Care & Emergence", code: "NUS405", description: "Detailed course description for Traumatology Critical Care & Emergence.", department: DEPARTMENTS.NUS, lecturerId: "lect034", lecturerName: "Dr. Ibrahim", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NUS407_NUS_Y2425_S1", title: "Specific of Maternity Nursing & Reproductive Health", code: "NUS407", description: "Detailed course description for Specific of Maternity Nursing & Reproductive Health.", department: DEPARTMENTS.NUS, lecturerId: "lect035", lecturerName: "Prof. Diallo", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Mon 14-16", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_NUS_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.NUS, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NUS409_NUS_Y2425_S1", title: "Specific of Community/Psychiatric Nursing", code: "NUS409", description: "Detailed course description for Specific of Community/Psychiatric Nursing.", department: DEPARTMENTS.NUS, lecturerId: "lect036", lecturerName: "Mr. Koffi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NUS401_NUS_Y2425_S1", title: "Medico-Surgical Nursing Gerontology", code: "NUS401", description: "Detailed course description for Medico-Surgical Nursing Gerontology.", department: DEPARTMENTS.NUS, lecturerId: "lect037", lecturerName: "Ms. Kante", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NUS403_NUS_Y2425_S1", title: "Pediatric & Adolescent Nursing", code: "NUS403", description: "Detailed course description for Pediatric & Adolescent Nursing.", department: DEPARTMENTS.NUS, lecturerId: "lect038", lecturerName: "Dr. Souleyman", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // MLS
    { id: "MLS405_MLS_Y2425_S1", title: "Histochemistry and histopathology", code: "MLS405", description: "Detailed course description for Histochemistry and histopathology.", department: DEPARTMENTS.MLS, lecturerId: "lect039", lecturerName: "Dr. Coulibaly", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MLS403_MLS_Y2425_S1", title: "Medical Parasitology and Entomology", code: "MLS403", description: "Detailed course description for Medical Parasitology and Entomology.", department: DEPARTMENTS.MLS, lecturerId: "lect040", lecturerName: "Prof. Diop", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_MLS_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology.", department: DEPARTMENTS.MLS, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MLS407_MLS_Y2425_S1", title: "Immunohaematology and Transfusion Science", code: "MLS407", description: "Detailed course description for Immunohaematology and Transfusion Science.", department: DEPARTMENTS.MLS, lecturerId: "lect041", lecturerName: "Mr. Traore", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MLS401_MLS_Y2425_S1", title: "Medical Biochemistry and chemical pathology", code: "MLS401", description: "Detailed course description for Medical Biochemistry and chemical pathology.", department: DEPARTMENTS.MLS, lecturerId: "lect042", lecturerName: "Ms. Keita", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
  
    // --- 400 Level, Second Semester, 2024/2025 Academic Year ---
    // CESM
    { id: "CSE406_CESM_Y2425_S2", title: "Algorithm and Data Structure", code: "CSE406", description: "In-depth study of algorithms and data structures.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 8-10, CR1", prerequisites: ["CSE301", "CSE401"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "CSE402_CESM_Y2425_S2", title: "Distributed Programming", code: "CSE402", description: "Concepts and practices in distributed programming.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 400, schedule: "Tue 10-12, CR1", prerequisites: ["CSE409"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "CSE408_CESM_Y2425_S2", title: "Emerging Networks", code: "CSE408", description: "Study of new and upcoming network technologies.", department: DEPARTMENTS.CESM, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Elective", level: 400, schedule: "Wed 10-12, CR1", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "CSE404_CESM_Y2425_S2", title: "Introduction to Artificial Intelligence", code: "CSE404", description: "Fundamentals of Artificial Intelligence.", department: DEPARTMENTS.CESM, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Compulsory", level: 400, schedule: "Thu 14-16, CR1", prerequisites: ["CSE406"], semester: "Second Semester", academicYear: "2024/2025" },
    // NES
    { id: "NES404_NES_Y2425_S2", title: "Information System Security", code: "NES404", description: "Security principles for information systems.", department: DEPARTMENTS.NES, lecturerId: "lect008", lecturerName: "Mr. Bakari", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 14-16, CR2", prerequisites: ["NES401"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "NES406_NES_Y2425_S2", title: "Network Security Laboratory", code: "NES406", description: "Practical lab work in network security.", department: DEPARTMENTS.NES, lecturerId: "lect007", lecturerName: "Prof. Kamga", credits: 3, type: "Compulsory", level: 400, schedule: "Tue 8-10 (Lab), Thu 8-9 (Lecture), NetLab2", prerequisites: ["NES401"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "CSE408_NES_Y2425_S2", title: "Emerging Networks", code: "CSE408", description: "Study of new and upcoming network technologies (shared).", department: DEPARTMENTS.NES, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Elective", level: 400, schedule: "Wed 10-12, CR1", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" }, 
    { id: "NES402_NES_Y2425_S2", title: "Telecom and Wireless Communication", code: "NES402", description: "Telecommunications and wireless networking.", department: DEPARTMENTS.NES, lecturerId: "lect006", lecturerName: "Dr. Oumarou", credits: 3, type: "Compulsory", level: 400, schedule: "Fri 10-12, CR2", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    // EPS
    { id: "EPS404_EPS_Y2425_S2", title: "Industrial Computing", code: "EPS404", description: "Computing applications in industrial settings.", department: DEPARTMENTS.EPS, lecturerId: "lect009", lecturerName: "Dr. Wato", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["EPS411"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "EPS408_EPS_Y2425_S2", title: "Power System Analysis", code: "EPS408", description: "Analysis of electrical power systems.", department: DEPARTMENTS.EPS, lecturerId: "lect010", lecturerName: "Prof. Ndam", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["EPS401"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "EPS406_EPS_Y2425_S2", title: "Power System Laboratory", code: "EPS406", description: "Practical lab work on power systems.", department: DEPARTMENTS.EPS, lecturerId: "lect011", lecturerName: "Mr. Sanda", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["EPS401"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "EPS402_EPS_Y2425_S2", title: "Electrical Power System II", code: "EPS402", description: "Advanced topics in electrical power systems.", department: DEPARTMENTS.EPS, lecturerId: "lect012", lecturerName: "Ms. Zola", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["EPS401"], semester: "Second Semester", academicYear: "2024/2025" },
    // LTM
    { id: "MGT416_LTM_Y2425_S2", title: "Quantitative Methods", code: "MGT416", description: "Quantitative analysis techniques for management.", department: DEPARTMENTS.LTM, lecturerId: "lect013", lecturerName: "Dr. Bello", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "LTM406_LTM_Y2425_S2", title: "Aviation Management and Operations", code: "LTM406", description: "Management of aviation operations.", department: DEPARTMENTS.LTM, lecturerId: "lect014", lecturerName: "Prof. Issa", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "LTM404_LTM_Y2425_S2", title: "Traffic Management and Control", code: "LTM404", description: "Principles of traffic management and control.", department: DEPARTMENTS.LTM, lecturerId: "lect015", lecturerName: "Mr. Adamu", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "LTM402_LTM_Y2425_S2", title: "Manufacturing Logistics", code: "LTM402", description: "Logistics within manufacturing environments.", department: DEPARTMENTS.LTM, lecturerId: "lect017", lecturerName: "Dr. Chinedu", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["LTM405"], semester: "Second Semester", academicYear: "2024/2025" },
    // PRM
    { id: "MGT416_PRM_Y2425_S2", title: "Quantitative Methods", code: "MGT416", description: "Quantitative analysis techniques for management.", department: DEPARTMENTS.PRM, lecturerId: "lect013", lecturerName: "Dr. Bello", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "PRM406_PRM_Y2425_S2", title: "Project Appraisal and Selection", code: "PRM406", description: "Methods for appraising and selecting projects.", department: DEPARTMENTS.PRM, lecturerId: "lect019", lecturerName: "Mr. Okoro", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["PRM403"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "PRM40A_PRM_Y2425_S2", title: "Project Design, Monitoring and Evaluation", code: "PRM40A", description: "Designing, monitoring, and evaluating projects.", department: DEPARTMENTS.PRM, lecturerId: "lect020", lecturerName: "Ms. Ngozi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["PRM403"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "PRM404_PRM_Y2425_S2", title: "Managing Project Risks and Changes", code: "PRM404", description: "Techniques for managing project risks and changes.", department: DEPARTMENTS.PRM, lecturerId: "lect018", lecturerName: "Prof. Etta", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    // ACC
    { id: "MGT416_ACC_Y2425_S2", title: "Quantitative Methods", code: "MGT416", description: "Quantitative analysis techniques for management.", department: DEPARTMENTS.ACC, lecturerId: "lect013", lecturerName: "Dr. Bello", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "ACC408_ACC_Y2425_S2", title: "Auditing and Assurance", code: "ACC408", description: "Principles of auditing and assurance services.", department: DEPARTMENTS.ACC, lecturerId: "lect022", lecturerName: "Prof. Eze", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["ACC401"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "ACC40A_ACC_Y2425_S2", title: "Cost and Managerial Accounting", code: "ACC40A", description: "Accounting for costs and managerial decision making.", department: DEPARTMENTS.ACC, lecturerId: "lect021", lecturerName: "Dr. Obi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["ACC401"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "FIN402_ACC_Y2425_S2", title: "Taxation Accounting II", code: "FIN402", description: "Advanced topics in taxation accounting.", department: DEPARTMENTS.ACC, lecturerId: "lect023", lecturerName: "Ms. Ifeoma", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    // HMC
    { id: "MGT416_HMC_Y2425_S2", title: "Quantitative Methods", code: "MGT416", description: "Quantitative analysis techniques for management.", department: DEPARTMENTS.HMC, lecturerId: "lect013", lecturerName: "Dr. Bello", credits: 3, type: "General", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "HMC406_HMC_Y2425_S2", title: "Housekeeping and Laundry Operations", code: "HMC406", description: "Management of housekeeping and laundry.", department: DEPARTMENTS.HMC, lecturerId: "lect024", lecturerName: "Dr. Adeleke", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["HMC401"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "BFP408_HMC_Y2425_S2", title: "Event Planning and Management", code: "BFP408", description: "Planning and management of events (shared).", department: DEPARTMENTS.HMC, lecturerId: "lect027", lecturerName: "Prof. Tunde", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" }, 
    { id: "HMC40A_HMC_Y2425_S2", title: "Hospitality Law", code: "HMC40A", description: "Legal aspects of the hospitality industry.", department: DEPARTMENTS.HMC, lecturerId: "lect025", lecturerName: "Mr. Jean", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    // BFP
    { id: "BFP406_BFP_Y2425_S2", title: "Waste Management and Effluent Treatment", code: "BFP406", description: "Managing waste in food processing.", department: DEPARTMENTS.BFP, lecturerId: "lect026", lecturerName: "Dr. Yemisi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "MA405_BFP_Y2425_S2", title: "Product Development and Packaging", code: "MA405", description: "Developing and packaging food products.", department: DEPARTMENTS.BFP, lecturerId: "lect028", lecturerName: "Mr. Femi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "BFP408_BFP_Y2425_S2", title: "Event Planning and Management", code: "BFP408", description: "Planning and management of events (shared).", department: DEPARTMENTS.BFP, lecturerId: "lect027", lecturerName: "Prof. Tunde", credits: 3, type: "Elective", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" }, 
    { id: "BFP402_BFP_Y2425_S2", title: "Food Technology II", code: "BFP402", description: "Advanced topics in food technology.", department: DEPARTMENTS.BFP, lecturerId: "lect029", lecturerName: "Ms. Chika", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: ["BFP405"], semester: "Second Semester", academicYear: "2024/2025" },
    // FCT
    { id: "CTT402_FCT_Y2425_S2", title: "Computer Aided Design and Printing Techniques of Fabrics", code: "CTT402", description: "CAD and printing for fabrics.", department: DEPARTMENTS.FCT, lecturerId: "lect030", lecturerName: "Dr. Aisha", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "CCT404_FCT_Y2425_S2", title: "Apparel Marketing and Merchandising", code: "CCT404", description: "Marketing and merchandising apparel.", department: DEPARTMENTS.FCT, lecturerId: "lect031", lecturerName: "Prof. Garba", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "CTT408_FCT_Y2425_S2", title: "Creative Design and Working Drawing", code: "CTT408", description: "Creative design and technical drawing for fashion.", department: DEPARTMENTS.FCT, lecturerId: "lect032", lecturerName: "Mr. Kwame", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "CTT406_FCT_Y2425_S2", title: "Techniques of Yarn Manufacturing", code: "CTT406", description: "Techniques in yarn manufacturing.", department: DEPARTMENTS.FCT, lecturerId: "lect033", lecturerName: "Ms. Fatimah", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    // NUS
    { id: "NUS402_NUS_Y2425_S2", title: "Teaching and Learning in Nursing", code: "NUS402", description: "Principles of teaching and learning in nursing.", department: DEPARTMENTS.NUS, lecturerId: "lect034", lecturerName: "Dr. Ibrahim", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Tue 14-17", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
    // MLS
    { id: "MLS402_MLS_Y2425_S2", title: "Medical Microbiology, Virology and Molecular Biology", code: "MLS402", description: "Microbiology, virology, and molecular biology for MLS.", department: DEPARTMENTS.MLS, lecturerId: "lect039", lecturerName: "Dr. Coulibaly", credits: 4, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2024/2025" },
  ];
  return mockCourses;
}

// Default registration meta, can be overridden by specific semester/year settings
const defaultRegistrationMeta = {
  isOpen: true,
  deadline: "2024-09-15", 
  academicYear: "2024/2025", 
  semester: "First Semester",   
};

export default function CoursesPage() {
  const { role, profile } = useAuth();
  const isStudent = role === 'student';

  // MOCK student's academic context. In a real app, this would come from profile.
  const studentAcademicContext = useMemo(() => {
    if (isStudent && profile) { 
      return {
        department: profile.department || DEPARTMENTS.CESM, 
        level: profile.level || 400,         
        currentAcademicYear: profile.currentAcademicYear || defaultRegistrationMeta.academicYear,
        currentSemester: profile.currentSemester || defaultRegistrationMeta.semester,
      };
    }
    return null;
  }, [isStudent, profile]);

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const initialFilters = useMemo(() => {
    if (isStudent && studentAcademicContext) {
      return {
        academicYear: studentAcademicContext.currentAcademicYear,
        semester: studentAcademicContext.currentSemester,
        department: studentAcademicContext.department,
        level: studentAcademicContext.level.toString(),
        courseType: "all",
      };
    }
    return {
      academicYear: defaultRegistrationMeta.academicYear,
      semester: defaultRegistrationMeta.semester,
      department: "all",
      level: "400", 
      courseType: "all",
    };
  }, [isStudent, studentAcademicContext]);

  const [filters, setFilters] = useState(initialFilters);
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
  
   useEffect(() => {
    if (isStudent && studentAcademicContext) {
      setFilters(prevFilters => ({
        ...prevFilters,
        academicYear: studentAcademicContext.currentAcademicYear,
        semester: studentAcademicContext.currentSemester,
        // If department and level filters are still the initial "all" or match the *new* context, update them.
        // This allows student to change filters for viewing, but updates if their core context changes.
        department: (prevFilters.department === "all" || prevFilters.department === studentAcademicContext.department) 
                      ? studentAcademicContext.department 
                      : prevFilters.department,
        level: (prevFilters.level === "all" || prevFilters.level === studentAcademicContext.level.toString())
                      ? studentAcademicContext.level.toString()
                      : prevFilters.level,
      }));
    }
  }, [isStudent, studentAcademicContext]);


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
      .filter(course => filters.department === "all" || course.department === filters.department)
      .filter(course => filters.level === "all" || course.level.toString() === filters.level)
      .filter(course => filters.academicYear === "all" || course.academicYear === filters.academicYear)
      .filter(course => filters.semester === "all" || course.semester === filters.semester)
      .filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(course => filters.courseType === "all" || course.type === filters.courseType);
  }, [allCourses, searchTerm, filters]);

  const registeredCoursesList = useMemo(() => {
    return allCourses.filter(course => registeredCourseIds.includes(course.id));
  }, [allCourses, registeredCourseIds]);

  const totalRegisteredCredits = useMemo(() => {
    const relevantCourses = registeredCoursesList.filter(course => 
      course.academicYear === filters.academicYear && course.semester === filters.semester
    );
    return relevantCourses.reduce((sum, course) => sum + course.credits, 0);
  }, [registeredCoursesList, filters.academicYear, filters.semester]);
  
  const currentRegistrationMeta = useMemo(() => {
    if (filters.academicYear === "2024/2025" && filters.semester === "First Semester") {
      return { isOpen: true, deadline: "2024-09-15", academicYear: "2024/2025", semester: "First Semester" };
    }
    if (filters.academicYear === "2024/2025" && filters.semester === "Second Semester") {
      return { isOpen: true, deadline: "2025-02-15", academicYear: "2024/2025", semester: "Second Semester" }; 
    }
    return { isOpen: false, deadline: "N/A", academicYear: filters.academicYear, semester: filters.semester };
  }, [filters.academicYear, filters.semester]);


  const handleRegisterCourse = (course: Course) => {
    if (!currentRegistrationMeta.isOpen) {
      toast({ title: "Registration Closed", description: `Course registration for ${currentRegistrationMeta.semester}, ${currentRegistrationMeta.academicYear} is currently closed.`, variant: "destructive" });
      return;
    }
     if (course.academicYear !== currentRegistrationMeta.academicYear || course.semester !== currentRegistrationMeta.semester) {
        toast({ title: "Registration Mismatch", description: `You can only register for courses in the currently open registration period: ${currentRegistrationMeta.semester}, ${currentRegistrationMeta.academicYear}.`, variant: "destructive" });
        return;
    }
    if (isStudent && studentAcademicContext) {
      if (course.department !== studentAcademicContext.department) {
        toast({ title: "Registration Not Allowed", description: `You can only register for courses within your department (${studentAcademicContext.department}). This course is for ${course.department}.`, variant: "destructive" });
        return;
      }
      if (course.level !== studentAcademicContext.level) {
        toast({ title: "Registration Not Allowed", description: `You can only register for courses at your current level (${studentAcademicContext.level}). This course is Level ${course.level}.`, variant: "destructive" });
        return;
      }
    }
    if (totalRegisteredCredits + course.credits > MAX_CREDITS) {
      toast({ title: "Credit Limit Exceeded", description: `Cannot register. Exceeds maximum credit load of ${MAX_CREDITS}. Current credits: ${totalRegisteredCredits}. Course credits: ${course.credits}`, variant: "destructive" });
      return;
    }
    if (registeredCourseIds.includes(course.id)) {
      toast({ title: "Already Registered", description: `You are already registered for ${course.code} - ${course.title}.`, variant: "default" });
      return;
    }

    const unmetPrerequisites = course.prerequisites?.filter(prereqCode => {
        const isPrereqMetOnRecord = registeredCourseIds.some(regId => {
            const registeredPrereq = allCourses.find(c => c.id === regId && c.code === prereqCode);
            return !!registeredPrereq; 
        });
        return !isPrereqMetOnRecord;
      });

    if (unmetPrerequisites && unmetPrerequisites.length > 0) {
      toast({
        title: "Prerequisites Not Met",
        description: `Cannot register ${course.code}. Missing prerequisites: ${unmetPrerequisites.join(', ')}. Prerequisites must be completed in a prior academic session and reflected in your record.`,
        variant: "destructive",
      });
      return;
    }
    setRegisteredCourseIds(prev => [...prev, course.id]);
    toast({ title: "Course Registered", description: `${course.code} - ${course.title} has been successfully registered for ${course.semester}, ${course.academicYear}.`, variant: "default" });
  };

  const handleDropCourse = (courseId: string) => {
     const courseToDrop = allCourses.find(c => c.id === courseId);
     if (!courseToDrop) return;

     if (!currentRegistrationMeta.isOpen) {
      toast({ title: "Registration Closed", description: `Cannot drop courses for ${currentRegistrationMeta.semester}, ${currentRegistrationMeta.academicYear} as registration is closed.`, variant: "destructive" });
      return;
    }
    if (courseToDrop.academicYear !== currentRegistrationMeta.academicYear || courseToDrop.semester !== currentRegistrationMeta.semester) {
        toast({ title: "Drop Mismatch", description: `You can only drop courses from the currently open registration period: ${currentRegistrationMeta.semester}, ${currentRegistrationMeta.academicYear}.`, variant: "destructive" });
        return;
    }

    setRegisteredCourseIds(prev => prev.filter(id => id !== courseId));
    toast({ title: "Course Dropped", description: `${courseToDrop.code} - ${courseToDrop.title} has been dropped.`, variant: "default" });
  };
  
  const getCreditStatus = () => {
    const currentSemesterCredits = totalRegisteredCredits; 

    if (filters.academicYear === "all" || filters.semester === "all") {
         return {
            message: `Showing courses across multiple periods. Select a specific Academic Year and Semester to see credit status for that period. Total registered across all shown: ${registeredCoursesList.reduce((sum, c) => sum + c.credits,0)}`,
            variant: "info" as const,
            credits: registeredCoursesList.reduce((sum, c) => sum + c.credits,0)
        };
    }
     if (!currentRegistrationMeta.isOpen) {
        return {
            message: `Registration for ${filters.semester}, ${filters.academicYear} is closed. Credit load: ${currentSemesterCredits}.`,
            variant: "info" as const,
            credits: currentSemesterCredits
        };
    }

    if (currentSemesterCredits < MIN_CREDITS) return {
      message: `You are under the minimum credit load (${MIN_CREDITS} credits) for ${filters.semester}, ${filters.academicYear}.`,
      variant: "warning" as const,
      credits: currentSemesterCredits
    };
    if (currentSemesterCredits > MAX_CREDITS) return {
      message: `You are over the maximum credit load (${MAX_CREDITS} credits) for ${filters.semester}, ${filters.academicYear}.`,
      variant: "destructive" as const,
      credits: currentSemesterCredits
    };
    return {
      message: `Total credits for ${filters.semester}, ${filters.academicYear} is within the allowed range (${MIN_CREDITS}-${MAX_CREDITS}).`,
      variant: "success" as const,
      credits: currentSemesterCredits
    };
  };
  
  const creditStatus = getCreditStatus();
  const coursesForSelectedPeriod = registeredCoursesList.filter(c => c.academicYear === filters.academicYear && c.semester === filters.semester);

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
          Register for courses for {filters.semester === "all" ? "selected semester" : filters.semester}, {filters.academicYear === "all" ? "selected year" : filters.academicYear}.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="text-primary"/>Registration Status for {currentRegistrationMeta.semester}, {currentRegistrationMeta.academicYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentRegistrationMeta.isOpen ? (
            <Alert variant="default" className="bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              <AlertTitle>Registration is OPEN</AlertTitle>
              <AlertDescription>
                Deadline to register or drop courses: <strong>{currentRegistrationMeta.deadline === "N/A" ? "N/A" : new Date(currentRegistrationMeta.deadline).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> for {currentRegistrationMeta.semester}, {currentRegistrationMeta.academicYear}.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertTitle>Registration is CLOSED</AlertTitle>
              <AlertDescription>
                The deadline for course registration for {currentRegistrationMeta.semester}, {currentRegistrationMeta.academicYear} has passed or is not yet open.
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
          <Select 
            value={filters.department} 
            onValueChange={(value) => handleFilterChange("department", value)}
          >
            <SelectTrigger><School className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Department</SelectTrigger>
            <SelectContent>
              {staticDepartments.map(dept => <SelectItem key={dept} value={dept}>{dept === "all" ? "All Departments" : dept}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select 
            value={filters.level} 
            onValueChange={(value) => handleFilterChange("level", value)}
          >
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
             <CardDescription>
              {`Showing courses for ${filters.department === "all" ? "all departments" : filters.department}, Level ${filters.level === "all" ? "all levels" : filters.level}, ${filters.semester === "all" ? "selected semester" : filters.semester}, ${filters.academicYear === "all" ? "selected year" : filters.academicYear}.`}
              {isStudent && studentAcademicContext && (filters.department !== studentAcademicContext.department || (filters.level !== "all" && filters.level !== studentAcademicContext.level.toString())) &&
                <span className="block text-xs text-amber-600 dark:text-amber-400 mt-1">
                  You are viewing courses outside your primary academic program (Your program: {studentAcademicContext.department}, Level {studentAcademicContext.level}). Registration is restricted to courses matching your program for the open registration period.
                </span>
              }
            </CardDescription>
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
                    // Registration capability check:
                    let canRegister = !isRegistered && currentRegistrationMeta.isOpen;
                    canRegister = canRegister && course.academicYear === currentRegistrationMeta.academicYear && course.semester === currentRegistrationMeta.semester;
                    canRegister = canRegister && (totalRegisteredCredits + course.credits <= MAX_CREDITS);
                    // If student, further restrict to their actual department and level for registration
                    if (isStudent && studentAcademicContext) {
                        canRegister = canRegister && course.department === studentAcademicContext.department && course.level === studentAcademicContext.level;
                    }

                    const canDrop = isRegistered && 
                                    currentRegistrationMeta.isOpen &&
                                    course.academicYear === currentRegistrationMeta.academicYear &&
                                    course.semester === currentRegistrationMeta.semester;
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
                            <Button variant="default" size="sm" onClick={() => handleRegisterCourse(course)} disabled={!canRegister}>
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
                <p className="text-muted-foreground mt-1">
                  Try adjusting your search or filter criteria for the selected Academic Year and Semester.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Registered Courses</CardTitle>
              <CardDescription>
                Courses registered for {filters.semester === "all" ? "selected semester" : filters.semester}, {filters.academicYear === "all" ? "selected year" : filters.academicYear}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registeredCoursesList.filter(c => (filters.academicYear === "all" || c.academicYear === filters.academicYear) && (filters.semester === "all" || c.semester === filters.semester)).length > 0 ? (
                <ul className="space-y-2">
                  {registeredCoursesList
                    .filter(c => (filters.academicYear === "all" || c.academicYear === filters.academicYear) && (filters.semester === "all" || c.semester === filters.semester))
                    .map(course => (
                    <li key={course.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">{course.code} - {course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.credits} Credits ({course.semester}, {course.academicYear})</p>
                      </div>
                       {currentRegistrationMeta.isOpen && course.academicYear === currentRegistrationMeta.academicYear && course.semester === currentRegistrationMeta.semester && (
                        <Button variant="ghost" size="icon" onClick={() => handleDropCourse(course.id)} className="text-destructive hover:bg-destructive/10">
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Drop {course.code}</span>
                        </Button>
                       )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No courses registered for the selected period.</p>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start space-y-3">
              <div className="w-full">
                <p className="text-lg font-semibold">Total Registered Credits for {filters.semester}, {filters.academicYear}: <span className={
                    creditStatus.variant === "warning" || creditStatus.variant === "destructive" ? "text-destructive" : "text-green-600 dark:text-green-400"
                }>{creditStatus.credits}</span>
                </p>
                { creditStatus.variant !== "info" && (currentRegistrationMeta.isOpen || creditStatus.credits > 0) && ( 
                   <Alert variant={creditStatus.variant === "success" ? "default" : creditStatus.variant} className="mt-2">
                    {creditStatus.variant === "success" ? <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{creditStatus.variant === "warning" ? "Warning" : creditStatus.variant === "destructive" ? "Error" : "Status"}</AlertTitle>
                    <AlertDescription>{creditStatus.message}</AlertDescription>
                  </Alert>
                )}
                 { creditStatus.variant === "info" && (
                    <Alert variant="default" className="mt-2">
                        <Info className="h-4 w-4" />
                        <AlertDescription>{creditStatus.message}</AlertDescription>
                    </Alert>
                 )}
              </div>
              <Button 
                className="w-full" 
                disabled={filters.academicYear === "all" || filters.semester === "all" || creditStatus.credits === 0}
                onClick={() => {
                  if (filters.academicYear !== "all" && filters.semester !== "all" && creditStatus.credits > 0) {
                    toast({ 
                      title: "Form B Download", 
                      description: `Generating Form B for ${filters.semester}, ${filters.academicYear}. (This is a simulation - PDF generation is under development.) Courses: ${coursesForSelectedPeriod.map(c => c.code).join(', ')}. Credits: ${creditStatus.credits}.`,
                      duration: 5000,
                    });
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4"/> Download Form B (PDF)
              </Button>
            </CardFooter>
          </Card>

           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="text-primary"/>My Schedule</CardTitle>
                <CardDescription>
                Schedule for courses registered in {filters.semester === "all" ? "selected semester" : filters.semester}, {filters.academicYear === "all" ? "selected year" : filters.academicYear}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <Skeleton className="h-20 w-full" />
                ) : registeredCoursesList.filter(c => (filters.academicYear === "all" || c.academicYear === filters.academicYear) && (filters.semester === "all" || c.semester === filters.semester)).length > 0 ? (
                <ul className="space-y-3">
                    {registeredCoursesList
                    .filter(c => (filters.academicYear === "all" || c.academicYear === filters.academicYear) && (filters.semester === "all" || c.semester === filters.semester))
                    .map(course => (
                        <li key={`${course.id}-schedule`} className="p-3 bg-muted rounded-md">
                        <p className="font-medium">{course.code} - {course.title}</p>
                        <p className="text-sm text-muted-foreground">Schedule: {course.schedule || "Not specified"}</p>
                        </li>
                    ))}
                </ul>
                ) : (
                <p className="text-sm text-muted-foreground">No courses registered for the selected period to display a schedule.</p>
                )}
                 <p className="text-xs text-muted-foreground mt-4">
                    Note: This is a basic list of course schedules. A full timetable grid requires more detailed day/time information for each course.
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled>
                 <Download className="mr-2 h-4 w-4"/> Download Schedule (PDF)
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
              <p><strong>Semester:</strong> {selectedCourseForDetail.semester}, {selectedCourseForDetail.academicYear}</p>
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
