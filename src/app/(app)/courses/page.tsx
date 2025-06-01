
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
import { BookOpen, Search, Filter, Tag, School, Info, CalendarDays, BookUser, PlusCircle, MinusCircle, Download, AlertCircle, XCircle, CheckCircle, Eye, Clock, AlertTriangle, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DEPARTMENTS, VALID_LEVELS, ACADEMIC_YEARS, SEMESTERS } from "@/config/data";


const MIN_CREDITS = 18;
const MAX_CREDITS = 24;

// Mock data fetching function - replace with actual Firestore query
async function fetchCourses(): Promise<Course[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Expanded Mock Courses
  const mockCourses: Course[] = [
    // --- Prerequisite Example Course ---
    { id: "CSE301_CESM_Y2324_S1", title: "Introduction to Algorithms", code: "CSE301", description: "Fundamental algorithms and data structures.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 300, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2023/2024" },
    
    // --- Level 200 CESM (Computer Software Engineering) ---
    // First Semester
    { id: "LAW101_CESM_Y2223_S1", title: "Introduction to Law", code: "LAW101", description: "Basic legal principles.", department: DEPARTMENTS.CESM, lecturerId: "lect_law", lecturerName: "Barr. Tabi", credits: 1, type: "General", level: 200, schedule: "Mon 8-9, AMPHI100", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "ENG102_CESM_Y2223_S1", title: "English Language", code: "ENG102", description: "Communication skills in English.", department: DEPARTMENTS.CESM, lecturerId: "lect_eng", lecturerName: "Ms. Anja", credits: 1, type: "General", level: 200, schedule: "Tue 14-15, CR15", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "CVE100_CESM_Y2223_S1", title: "Civics and Moral Education", code: "CVE100", description: "Civic responsibilities and ethics.", department: DEPARTMENTS.CESM, lecturerId: "lect_civ", lecturerName: "Dr. Fomba", credits: 1, type: "General", level: 200, schedule: "Wed 10-11, AMPHI150", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "MGT104_CESM_Y2223_S1", title: "Principle of Management", code: "MGT104", description: "Fundamentals of management.", department: DEPARTMENTS.CESM, lecturerId: "lect_mgt", lecturerName: "Mr. Boma", credits: 1, type: "General", level: 200, schedule: "Thu 8-9, CR20", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "FRE101_CESM_Y2223_S1", title: "French", code: "FRE101", description: "Basic French communication.", department: DEPARTMENTS.CESM, lecturerId: "lect_fr", lecturerName: "Mme. Abena", credits: 1, type: "General", level: 200, schedule: "Fri 11-12, CR12", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "ENT106_CESM_Y2223_S1", title: "Enterprise Creation", code: "ENT106", description: "Fundamentals of entrepreneurship.", department: DEPARTMENTS.CESM, lecturerId: "lect_ent", lecturerName: "Dr. Wanki", credits: 2, type: "General", level: 200, schedule: "Mon 10-12, AMPHI200", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "ECN107_CESM_Y2223_S1", title: "Economics", code: "ECN107", description: "Principles of economics.", department: DEPARTMENTS.CESM, lecturerId: "lect_eco", lecturerName: "Prof. Ndong", credits: 2, type: "General", level: 200, schedule: "Tue 8-10, CR25", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "SWE108_CESM_Y2223_S1", title: "Information System", code: "SWE108", description: "Introduction to information systems.", department: DEPARTMENTS.CESM, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Compulsory", level: 200, schedule: "Wed 14-17, Lab Hall 2", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "SWE109_CESM_Y2223_S1", title: "Multimedia Tech", code: "SWE109", description: "Basics of multimedia technologies.", department: DEPARTMENTS.CESM, lecturerId: "lect_mm", lecturerName: "Mr. Kilo", credits: 3, type: "Compulsory", level: 200, schedule: "Thu 10-13, Media Lab", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "SWE110_CESM_Y2223_S1", title: "Digital Literacy", code: "SWE110", description: "Essential digital skills.", department: DEPARTMENTS.CESM, lecturerId: "lect_dl", lecturerName: "Ms. Sona", credits: 3, type: "Compulsory", level: 200, schedule: "Fri 8-11, Comp Lab 1", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "SWE111_CESM_Y2223_S1", title: "Introduction to Software Eng", code: "SWE111", description: "Foundations of software engineering.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 200, schedule: "Mon 14-17, AMPHI300", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "SWE112_CESM_Y2223_S1", title: "Introduction to Database", code: "SWE112", description: "Database concepts and SQL.", department: DEPARTMENTS.CESM, lecturerId: "lect_db1", lecturerName: "Dr. Ngwa", credits: 3, type: "Compulsory", level: 200, schedule: "Tue 10-13, Lab Hall 3", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "SWE113_CESM_Y2223_S1", title: "Computer Maintenance", code: "SWE113", description: "Hardware and software maintenance.", department: DEPARTMENTS.CESM, lecturerId: "lect_maint", lecturerName: "Mr. Tabi", credits: 3, type: "Compulsory", level: 200, schedule: "Wed 8-11, Workshop 1", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "SWE114_CESM_Y2223_S1", title: "Operating System", code: "SWE114", description: "Introduction to operating systems.", department: DEPARTMENTS.CESM, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Compulsory", level: 200, schedule: "Thu 14-17, CR30", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "SWE115_CESM_Y2223_S1", title: "Digital Electronics", code: "SWE115", description: "Fundamentals of digital circuits.", department: DEPARTMENTS.CESM, lecturerId: "lect_de", lecturerName: "Dr. Asong", credits: 3, type: "Compulsory", level: 200, schedule: "Fri 14-17, Elec Lab", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "SWE116_CESM_Y2223_S1", title: "Discrete Maths", code: "SWE116", description: "Discrete mathematics for computing.", department: DEPARTMENTS.CESM, lecturerId: "lect_dm", lecturerName: "Prof. Lima", credits: 3, type: "Compulsory", level: 200, schedule: "Mon 9-10, Wed 11-13, CR35", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    // Second Semester
    { id: "INT100_CESM_Y2223_S2", title: "Internship report Writing", code: "INT100", description: "Guidance on internship report writing.", department: DEPARTMENTS.CESM, lecturerId: "coord01", lecturerName: "Coordinator", credits: 1, type: "General", level: 200, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2022/2023" },
    { id: "SWE7_CESM_Y2223_S2", title: "Legal Regulations", code: "SWE7", description: "Legal aspects of software engineering.", department: DEPARTMENTS.CESM, lecturerId: "lect_law", lecturerName: "Barr. Tabi", credits: 1, type: "General", level: 200, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2022/2023" },
    { id: "SWE90_CESM_Y2223_S2", title: "Computer Architechture", code: "SWE90", description: "Structure of computer systems.", department: DEPARTMENTS.CESM, lecturerId: "lect_ca", lecturerName: "Dr. Fai", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: ["SWE115"], semester: "Second Semester", academicYear: "2022/2023" },
    { id: "SWE91_CESM_Y2223_S2", title: "Discrete Math I", code: "SWE91", description: "Further discrete mathematics.", department: DEPARTMENTS.CESM, lecturerId: "lect_dm", lecturerName: "Prof. Lima", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: ["SWE116"], semester: "Second Semester", academicYear: "2022/2023" },
    { id: "SWE92_CESM_Y2223_S2", title: "Computer Programming I", code: "SWE92", description: "Introduction to programming (e.g., Python/Java).", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2022/2023" },
    { id: "SWE93_CESM_Y2223_S2", title: "Introduction to web Programming", code: "SWE93", description: "HTML, CSS, JavaScript basics.", department: DEPARTMENTS.CESM, lecturerId: "lect_web1", lecturerName: "Ms. Bibi", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: [], semester: "Second Semester", academicYear: "2022/2023" },
    { id: "SWE94_CESM_Y2223_S2", title: "Data Structures and Algorithms", code: "SWE94", description: "Fundamental data structures and algorithms.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: ["SWE92"], semester: "Second Semester", academicYear: "2022/2023" },
    { id: "SWE95_CESM_Y2223_S2", title: "Information System II", code: "SWE95", description: "Advanced topics in information systems.", department: DEPARTMENTS.CESM, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: ["SWE108"], semester: "Second Semester", academicYear: "2022/2023" },
    { id: "SWE96_CESM_Y2223_S2", title: "Operating System II", code: "SWE96", description: "Advanced operating system concepts.", department: DEPARTMENTS.CESM, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: ["SWE114"], semester: "Second Semester", academicYear: "2022/2023" },

    // --- Level 200 CPT (Crop Production Technology) ---
    // First Semester
    { id: "LAW101_CPT_Y2223_S1", title: "Introduction to Law", code: "LAW101", description: "Basic legal principles for CPT.", department: DEPARTMENTS.CPT, lecturerId: "lect_law", lecturerName: "Barr. Tabi", credits: 1, type: "General", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "ENG102_CPT_Y2223_S1", title: "English", code: "ENG102", description: "English for CPT.", department: DEPARTMENTS.CPT, lecturerId: "lect_eng", lecturerName: "Ms. Anja", credits: 1, type: "General", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "CVE100_CPT_Y2223_S1", title: "Civics and Moral Education", code: "CVE100", description: "Civics for CPT.", department: DEPARTMENTS.CPT, lecturerId: "lect_civ", lecturerName: "Dr. Fomba", credits: 1, type: "General", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "MGT104_CPT_Y2223_S1", title: "Principle of Management", code: "MGT104", description: "Management for CPT.", department: DEPARTMENTS.CPT, lecturerId: "lect_mgt", lecturerName: "Mr. Boma", credits: 1, type: "General", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "FRE101_CPT_Y2223_S1", title: "French", code: "FRE101", description: "French for CPT.", department: DEPARTMENTS.CPT, lecturerId: "lect_fr", lecturerName: "Mme. Abena", credits: 1, type: "General", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "ENT106_CPT_Y2223_S1", title: "Enterprise Creation", code: "ENT106", description: "Entrepreneurship for CPT.", department: DEPARTMENTS.CPT, lecturerId: "lect_ent", lecturerName: "Dr. Wanki", credits: 2, type: "General", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "ECN107_CPT_Y2223_S1", title: "Economics", code: "ECN107", description: "Economics for CPT.", department: DEPARTMENTS.CPT, lecturerId: "lect_eco", lecturerName: "Prof. Ndong", credits: 2, type: "General", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "CPT116_CPT_Y2223_S1", title: "Soil and Fertilization", code: "CPT116", description: "Soil science and fertilization techniques.", department: DEPARTMENTS.CPT, lecturerId: "lect_cpt1", lecturerName: "Dr. Soil", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "CPT114_CPT_Y2223_S1", title: "Crop physiology and Nutrition", code: "CPT114", description: "Understanding plant physiology and nutrition.", department: DEPARTMENTS.CPT, lecturerId: "lect_cpt2", lecturerName: "Prof. Plant", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "CPT234_CPT_Y2223_S1", title: "Cereal production", code: "CPT234", description: "Techniques for cereal crop production.", department: DEPARTMENTS.CPT, lecturerId: "lect_cpt3", lecturerName: "Mr. Grain", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "CPT237_CPT_Y2223_S1", title: "Economics and Business Mgt", code: "CPT237", description: "Agribusiness management.", department: DEPARTMENTS.CPT, lecturerId: "lect_cpt4", lecturerName: "Ms. Biz", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "CPT231_CPT_Y2223_S1", title: "Genetics and Plant Physiology", code: "CPT231", description: "Plant genetics and advanced physiology.", department: DEPARTMENTS.CPT, lecturerId: "lect_cpt5", lecturerName: "Dr. Gene", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },
    { id: "CPT233_CPT_Y2223_S1", title: "Topography and Rural construction", code: "CPT233", description: "Surveying and rural infrastructure.", department: DEPARTMENTS.CPT, lecturerId: "lect_cpt6", lecturerName: "Prof. Land", credits: 3, type: "Compulsory", level: 200, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2022/2023" },

    // --- Level 300 CESM ---
    // First Semester (already added CSE301)
    { id: "CSE303_CESM_Y2324_S1", title: "Web Technologies", code: "CSE303", description: "Advanced web development concepts.", department: DEPARTMENTS.CESM, lecturerId: "lect_web1", lecturerName: "Ms. Bibi", credits: 3, type: "Compulsory", level: 300, schedule: "TBD", prerequisites: ["SWE93"], semester: "First Semester", academicYear: "2023/2024" },
    { id: "MTH301_CESM_Y2324_S1", title: "Probability and Statistics", code: "MTH301", description: "Statistical methods for engineers.", department: DEPARTMENTS.CESM, lecturerId: "lect_stat", lecturerName: "Dr. Stats", credits: 3, type: "Compulsory", level: 300, schedule: "TBD", prerequisites: ["SWE116"], semester: "First Semester", academicYear: "2023/2024" },
    // Second Semester
    { id: "CSE302_CESM_Y2324_S2", title: "Database Systems", code: "CSE302", description: "Design and implementation of database systems.", department: DEPARTMENTS.CESM, lecturerId: "lect_db1", lecturerName: "Dr. Ngwa", credits: 3, type: "Compulsory", level: 300, schedule: "TBD", prerequisites: ["SWE112"], semester: "Second Semester", academicYear: "2023/2024" },
    { id: "CSE308_CESM_Y2324_S2", title: "Operating Systems II", code: "CSE308", description: "Advanced OS concepts.", department: DEPARTMENTS.CESM, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Compulsory", level: 300, schedule: "TBD", prerequisites: ["SWE114", "SWE96"], semester: "Second Semester", academicYear: "2023/2024" },
    { id: "CSE310_CESM_Y2324_S2", title: "Computer Networks", code: "CSE310", description: "Networking fundamentals and protocols.", department: DEPARTMENTS.CESM, lecturerId: "lect_cn", lecturerName: "Prof. Net", credits: 3, type: "Compulsory", level: 300, schedule: "TBD", prerequisites: ["SWE90"], semester: "Second Semester", academicYear: "2023/2024" },


    // --- 400 Level, First Semester, 2024/2025 Academic Year (Existing from previous turn) ---
    // CESM
    { id: "CSE401_CESM_Y2425_S1", title: "Mobile Application Development", code: "CSE401", description: "Detailed course description for Mobile Application Development. Covers native and cross-platform development.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 10-12, Wed 10-11, Lab Hall 1", prerequisites: ["CSE301"], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE409_CESM_Y2425_S1", title: "Software Development and OOP", code: "CSE409", description: "Detailed course description for Software Development and OOP. Focuses on object-oriented principles and design patterns.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Tue 14-16, Fri 8-9", prerequisites: ["SWE92"], semester: "First Semester", academicYear: "2024/2025" },
    { id: "MGT403_CESM_Y2425_S1", title: "Research Methodology", code: "MGT403", description: "Detailed course description for Research Methodology. Introduction to research methods and academic writing.", department: DEPARTMENTS.CESM, lecturerId: "lect003", lecturerName: "Dr. Abang", credits: 3, type: "General", level: 400, schedule: "AMPHI200, Wed 14-17", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    { id: "CSE405_CESM_Y2425_S1", title: "Embedded Systems", code: "CSE405", description: "Detailed course description for Embedded Systems. Design and programming of embedded systems.", department: DEPARTMENTS.CESM, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Compulsory", level: 400, schedule: "AMPHI200, Thu 8-11", prerequisites: ["SWE90"], semester: "First Semester", academicYear: "2024/2025" },
    { id: "NES403_CESM_Y2425_S1", title: "Modeling in Information System", code: "NES403", description: "Detailed course description for Modeling in Information System. Techniques for system modeling.", department: DEPARTMENTS.CESM, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Elective", level: 400, schedule: "Fri 11-13, CR10", prerequisites: ["SWE108", "SWE95"], semester: "First Semester", academicYear: "2024/2025" },
    
    // --- 400 Level, Second Semester, 2024/2025 Academic Year (Existing from previous turn) ---
    // CESM
    { id: "CSE406_CESM_Y2425_S2", title: "Algorithm and Data Structure II", code: "CSE406", description: "In-depth study of algorithms and data structures.", department: DEPARTMENTS.CESM, lecturerId: "lect001", lecturerName: "Dr. Eno", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 8-10, CR1", prerequisites: ["CSE301", "SWE94"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "CSE402_CESM_Y2425_S2", title: "Distributed Programming", code: "CSE402", description: "Concepts and practices in distributed programming.", department: DEPARTMENTS.CESM, lecturerId: "lect002", lecturerName: "Prof. Besong", credits: 3, type: "Compulsory", level: 400, schedule: "Tue 10-12, CR1", prerequisites: ["CSE409"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "CSE408_CESM_Y2425_S2", title: "Emerging Networks", code: "CSE408", description: "Study of new and upcoming network technologies.", department: DEPARTMENTS.CESM, lecturerId: "lect004", lecturerName: "Mr. Tanyi", credits: 3, type: "Elective", level: 400, schedule: "Wed 10-12, CR1", prerequisites: ["CSE310"], semester: "Second Semester", academicYear: "2024/2025" },
    { id: "CSE404_CESM_Y2425_S2", title: "Introduction to Artificial Intelligence", code: "CSE404", description: "Fundamentals of Artificial Intelligence.", department: DEPARTMENTS.CESM, lecturerId: "lect005", lecturerName: "Ms. Fotso", credits: 3, type: "Compulsory", level: 400, schedule: "Thu 14-16, CR1", prerequisites: ["CSE406"], semester: "Second Semester", academicYear: "2024/2025" },
  
    // --- Courses for other departments (simplified list from previous state) ---
    // NES
    { id: "NES405_NES_Y2425_S1", title: "Scripting and Programming", code: "NES405", description: "Detailed course description for Scripting and Programming.", department: DEPARTMENTS.NES, lecturerId: "lect006", lecturerName: "Dr. Oumarou", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 8-10, CR22", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // EPS
    { id: "EPS411_EPS_Y2425_S1", title: "Microcontrollers and Microprocessors", code: "EPS411", description: "Detailed course description for Microcontrollers and Microprocessors.", department: DEPARTMENTS.EPS, lecturerId: "lect009", lecturerName: "Dr. Wato", credits: 3, type: "Compulsory", level: 400, schedule: "Mon 14-16, ELab1", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // LTM
    { id: "LTM403_LTM_Y2425_S1", title: "Humanitarian Logistics", code: "LTM403", description: "Detailed course description for Humanitarian Logistics.", department: DEPARTMENTS.LTM, lecturerId: "lect013", lecturerName: "Dr. Bello", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // PRM
    { id: "HRM407_PRM_Y2425_S1", title: "Performance Management and Motivation", code: "HRM407", description: "Detailed course description for Performance Management and Motivation.", department: DEPARTMENTS.PRM, lecturerId: "lect018", lecturerName: "Prof. Etta", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // ACC
    { id: "ACC403_ACC_Y2425_S1", title: "Computerized Accounting", code: "ACC403", description: "Detailed course description for Computerized Accounting.", department: DEPARTMENTS.ACC, lecturerId: "lect021", lecturerName: "Dr. Obi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // HMC
    { id: "HRM407_HMC_Y2425_S1", title: "Performance Management and Motivation", code: "HRM407", description: "Detailed course description for Performance Management and Motivation.", department: DEPARTMENTS.HMC, lecturerId: "lect018", lecturerName: "Prof. Etta", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // BFP
    { id: "BFP403_BFP_Y2425_S1", title: "Postharvest, Handling, Transformation and Storage", code: "BFP403", description: "Detailed course description for Postharvest, Handling, Transformation and Storage.", department: DEPARTMENTS.BFP, lecturerId: "lect026", lecturerName: "Dr. Yemisi", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // FCT
    { id: "CCT401_FCT_Y2425_S1", title: "Interior and Exterior Decoration", code: "CCT401", description: "Detailed course description for Interior and Exterior Decoration.", department: DEPARTMENTS.FCT, lecturerId: "lect030", lecturerName: "Dr. Aisha", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // NUS
    { id: "NUS405_NUS_Y2425_S1", title: "Traumatology Critical Care & Emergence", code: "NUS405", description: "Detailed course description for Traumatology Critical Care & Emergence.", department: DEPARTMENTS.NUS, lecturerId: "lect034", lecturerName: "Dr. Ibrahim", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
    // MLS
    { id: "MLS405_MLS_Y2425_S1", title: "Histochemistry and histopathology", code: "MLS405", description: "Detailed course description for Histochemistry and histopathology.", department: DEPARTMENTS.MLS, lecturerId: "lect039", lecturerName: "Dr. Coulibaly", credits: 3, type: "Compulsory", level: 400, schedule: "TBD", prerequisites: [], semester: "First Semester", academicYear: "2024/2025" },
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

const getLocalStorageKeyForAllRegistrations = (uid?: string) => {
  if (!uid) return null;
  return `allRegisteredCourses_${uid}`;
};


export default function CoursesPage() {
  const { user, role, profile } = useAuth();
  const isStudent = role === 'student';

  const [hasLoadedInitialRegistrations, setHasLoadedInitialRegistrations] = useState(false);

  const studentAcademicContext = useMemo(() => {
    if (isStudent && profile) { 
      return {
        department: profile.department || DEPARTMENTS.CESM, 
        level: profile.level || VALID_LEVELS[0],       
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
      level: VALID_LEVELS[0].toString(), 
      courseType: "all",
    };
  }, [isStudent, studentAcademicContext]);

  const [filters, setFilters] = useState(initialFilters);
  const [registeredCourseIds, setRegisteredCourseIds] = useState<string[]>([]);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const { toast } = useToast();

  const [isDeadlineApproaching, setIsDeadlineApproaching] = useState(false);
  const [daysToDeadline, setDaysToDeadline] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true); // Page-level loading for courses
      const fetchedCourses = await fetchCourses();
      setAllCourses(fetchedCourses);
  
      if (user?.uid && typeof window !== 'undefined') {
        const storageKey = getLocalStorageKeyForAllRegistrations(user.uid);
        if (storageKey) {
          const storedIds = localStorage.getItem(storageKey);
          if (storedIds) {
            try {
              const parsedIds = JSON.parse(storedIds);
              if (Array.isArray(parsedIds)) {
                setRegisteredCourseIds(parsedIds);
              } else {
                setRegisteredCourseIds([]);
                localStorage.removeItem(storageKey); // Clear corrupted data
              }
            } catch (e) {
              console.error("Failed to parse registered courses from localStorage:", e);
              setRegisteredCourseIds([]);
              localStorage.removeItem(storageKey); // Clear corrupted data
            }
          } else {
            setRegisteredCourseIds([]);
          }
        }
      } else if (!user?.uid && typeof window !== 'undefined') {
        setRegisteredCourseIds([]); // Clear if no user
      }
      setHasLoadedInitialRegistrations(true);
      setIsLoading(false);
    }
    loadData();
  }, [user?.uid]);
  
  // Effect for saving registered courses to localStorage
  useEffect(() => {
    // Only save if initial load is complete and user is identified
    if (hasLoadedInitialRegistrations && user?.uid && typeof window !== 'undefined') {
      const storageKey = getLocalStorageKeyForAllRegistrations(user.uid);
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(registeredCourseIds));
      }
    }
  }, [registeredCourseIds, user?.uid, hasLoadedInitialRegistrations]);
  
   useEffect(() => {
    if (isStudent && studentAcademicContext) {
      setFilters(prevFilters => ({
        ...prevFilters, 
        department: studentAcademicContext.department, 
        level: studentAcademicContext.level.toString(), 
        academicYear: prevFilters.academicYear !== "all" ? prevFilters.academicYear : studentAcademicContext.currentAcademicYear,
        semester: prevFilters.semester !== "all" ? prevFilters.semester : studentAcademicContext.currentSemester,
      }));
    }
  }, [isStudent, studentAcademicContext]);

  const currentRegistrationMeta = useMemo(() => {
    // Example for 2024/2025
    if (filters.academicYear === "2024/2025" && filters.semester === "First Semester") {
      return { isOpen: true, deadline: "2024-09-15", academicYear: "2024/2025", semester: "First Semester" };
    }
    if (filters.academicYear === "2024/2025" && filters.semester === "Second Semester") {
      return { isOpen: true, deadline: "2025-02-15", academicYear: "2024/2025", semester: "Second Semester" }; 
    }
    // Example for 2023/2024 - can be set as closed or with past deadlines
     if (filters.academicYear === "2023/2024" && filters.semester === "First Semester") {
      return { isOpen: false, deadline: "2023-09-15", academicYear: "2023/2024", semester: "First Semester" };
    }
    if (filters.academicYear === "2023/2024" && filters.semester === "Second Semester") {
      return { isOpen: false, deadline: "2024-02-15", academicYear: "2023/2024", semester: "Second Semester" };
    }
     // Example for 2022/2023 - can be set as closed or with past deadlines
     if (filters.academicYear === "2022/2023" && filters.semester === "First Semester") {
      return { isOpen: false, deadline: "2022-09-15", academicYear: "2022/2023", semester: "First Semester" };
    }
    if (filters.academicYear === "2022/2023" && filters.semester === "Second Semester") {
      return { isOpen: false, deadline: "2023-02-15", academicYear: "2022/2023", semester: "Second Semester" };
    }

    return { isOpen: false, deadline: "N/A", academicYear: filters.academicYear, semester: filters.semester };
  }, [filters.academicYear, filters.semester]);

  useEffect(() => {
    if (currentRegistrationMeta.isOpen && currentRegistrationMeta.deadline && currentRegistrationMeta.deadline !== "N/A") {
      const deadlineDate = new Date(currentRegistrationMeta.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysToDeadline(diffDays);

      if (diffDays >= 0 && diffDays <= 7) { 
        setIsDeadlineApproaching(true);
      } else {
        setIsDeadlineApproaching(false);
      }
    } else {
      setIsDeadlineApproaching(false);
      setDaysToDeadline(null);
    }
  }, [currentRegistrationMeta.isOpen, currentRegistrationMeta.deadline]);


  const staticDepartments = useMemo(() => ["all", ...Object.values(DEPARTMENTS)], []);
  const staticLevels = useMemo(() => ["all", ...VALID_LEVELS.map(l => l.toString())], []); 
  const courseTypes = ["all", "Compulsory", "Elective", "General"];
  const academicYearsForFilter = useMemo(() => ["all", ...ACADEMIC_YEARS], []);
  const semestersForFilter = useMemo(() => ["all", ...SEMESTERS], []);


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
      course.academicYear === currentRegistrationMeta.academicYear && 
      course.semester === currentRegistrationMeta.semester
    );
    return relevantCourses.reduce((sum, course) => sum + course.credits, 0);
  }, [registeredCoursesList, currentRegistrationMeta.academicYear, currentRegistrationMeta.semester]);


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
        // Allow registration for General courses regardless of student's department, if they are for the student's level
        if (course.type !== "General") {
            toast({ title: "Registration Not Allowed", description: `You can only register for courses within your department (${studentAcademicContext.department}) or General courses. This course is for ${course.department}.`, variant: "destructive" });
            return;
        }
      }
      if (course.level !== studentAcademicContext.level) {
        toast({ title: "Registration Not Allowed", description: `You can only register for courses at your current level (${studentAcademicContext.level}). This course is Level ${course.level}.`, variant: "destructive" });
        return;
      }
    } else if (isStudent && !studentAcademicContext) {
        toast({ title: "Profile Error", description: "Your academic profile is not fully loaded. Cannot register courses.", variant: "destructive" });
        return;
    }


    if (totalRegisteredCredits + course.credits > MAX_CREDITS) {
      toast({ title: "Credit Limit Exceeded", description: `Cannot register. Exceeds maximum credit load of ${MAX_CREDITS} for ${currentRegistrationMeta.semester}, ${currentRegistrationMeta.academicYear}. Current credits for this period: ${totalRegisteredCredits}. Course credits: ${course.credits}`, variant: "destructive" });
      return;
    }

    if (registeredCourseIds.includes(course.id)) {
      toast({ title: "Already Registered", description: `You are already registered for ${course.code} - ${course.title}.`, variant: "default" });
      return;
    }

    const unmetPrerequisites = course.prerequisites?.filter(prereqCode => {
        const isPrereqMetOnRecord = registeredCourseIds.some(regId => {
            const registeredPrereqCourse = allCourses.find(c => c.id === regId && c.code === prereqCode);
            if (!registeredPrereqCourse) return false;
            
            // Compare academic years and semesters numerically
            const targetYearParts = course.academicYear.split('/');
            const prereqYearParts = registeredPrereqCourse.academicYear.split('/');
            const targetStartYear = parseInt(targetYearParts[0]);
            const prereqStartYear = parseInt(prereqYearParts[0]);

            const semesterOrder = {"First Semester": 1, "Second Semester": 2, "Resit Semester": 3};
            const targetSemesterOrder = semesterOrder[course.semester as keyof typeof semesterOrder] || 0;
            const prereqSemesterOrder = semesterOrder[registeredPrereqCourse.semester as keyof typeof semesterOrder] || 0;

            if (prereqStartYear < targetStartYear) return true; // Prereq in earlier year
            if (prereqStartYear === targetStartYear && prereqSemesterOrder < targetSemesterOrder) return true; // Prereq in earlier semester of same year
            
            return false;
        });
        return !isPrereqMetOnRecord;
      });

    if (unmetPrerequisites && unmetPrerequisites.length > 0) {
      toast({
        title: "Prerequisites Not Met",
        description: `Cannot register ${course.code}. Missing prerequisites: ${unmetPrerequisites.join(', ')}. Prerequisites must be completed in a prior academic session (year or semester).`,
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
    const periodYear = currentRegistrationMeta.isOpen ? currentRegistrationMeta.academicYear : filters.academicYear;
    const periodSemester = currentRegistrationMeta.isOpen ? currentRegistrationMeta.semester : filters.semester;
    
    if (periodYear === "all" || periodSemester === "all") {
         return {
            message: `Showing courses across multiple periods. Select a specific Academic Year and Semester to see credit status for that period. Total registered across all shown: ${registeredCoursesList.reduce((sum, c) => sum + c.credits,0)}`,
            variant: "info" as const,
            credits: registeredCoursesList.reduce((sum, c) => sum + c.credits,0)
        };
    }

    const creditsForPeriod = registeredCoursesList
      .filter(c => c.academicYear === periodYear && c.semester === periodSemester)
      .reduce((sum, c) => sum + c.credits, 0);

     if (!currentRegistrationMeta.isOpen && (filters.academicYear !== "all" && filters.semester !== "all")) {
        return {
            message: `Registration for ${filters.semester}, ${filters.academicYear} is closed. Credit load for this period: ${creditsForPeriod}.`,
            variant: "info" as const,
            credits: creditsForPeriod
        };
    }
    
    if (currentRegistrationMeta.isOpen) {
        if (totalRegisteredCredits < MIN_CREDITS) return {
        message: `You are under the minimum credit load (${MIN_CREDITS} credits) for the current registration period (${currentRegistrationMeta.semester}, ${currentRegistrationMeta.academicYear}). Current: ${totalRegisteredCredits}.`,
        variant: "warning" as const,
        credits: totalRegisteredCredits
        };
        if (totalRegisteredCredits > MAX_CREDITS) return {
        message: `You are over the maximum credit load (${MAX_CREDITS} credits) for the current registration period (${currentRegistrationMeta.semester}, ${currentRegistrationMeta.academicYear}). Current: ${totalRegisteredCredits}.`,
        variant: "destructive" as const,
        credits: totalRegisteredCredits
        };
        return {
        message: `Total credits for the current registration period (${currentRegistrationMeta.semester}, ${currentRegistrationMeta.academicYear}) is within the allowed range (${MIN_CREDITS}-${MAX_CREDITS}). Current: ${totalRegisteredCredits}.`,
        variant: "success" as const,
        credits: totalRegisteredCredits
        };
    }

    return {
        message: `Credit load for ${periodSemester}, ${periodYear}: ${creditsForPeriod}. (Registration not currently open for this period).`,
        variant: "info" as const,
        credits: creditsForPeriod
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
        <h1 className="font-headline text-4xl font-bold flex items-center gap-2"><GraduationCap className="text-primary"/>Course Registration</h1>
        <p className="text-lg text-muted-foreground">
          Explore courses and manage your registration. Your default department and level are pre-selected.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="text-primary"/>Registration Status for {currentRegistrationMeta.semester}, {currentRegistrationMeta.academicYear}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
                The deadline for course registration for {currentRegistrationMeta.semester === "all" ? "the selected period" : `${currentRegistrationMeta.semester}, ${currentRegistrationMeta.academicYear}`} has passed or is not yet open.
              </AlertDescription>
            </Alert>
          )}
          {isDeadlineApproaching && currentRegistrationMeta.isOpen && daysToDeadline !== null && (
            <Alert variant="default" className="bg-amber-50 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              <AlertTitle>Deadline Approaching!</AlertTitle>
              <AlertDescription>
                {daysToDeadline === 0 ? "Today is the last day to register or drop courses." :
                daysToDeadline === 1 ? `The deadline is tomorrow! Only ${daysToDeadline} day remaining.` :
                `Only ${daysToDeadline} days remaining to register or drop courses.`
                }
                {' '}Don't miss the deadline on <strong>{new Date(currentRegistrationMeta.deadline).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
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
              {academicYearsForFilter.map(year => <SelectItem key={year} value={year}>{year === "all" ? "All Years" : year}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.semester} onValueChange={(value) => handleFilterChange("semester", value)}>
            <SelectTrigger><BookOpen className="mr-2 h-4 w-4 text-muted-foreground inline-block" />Semester</SelectTrigger>
            <SelectContent>
              {semestersForFilter.map(sem => <SelectItem key={sem} value={sem}>{sem === "all" ? "All Semesters" : sem}</SelectItem>)}
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
               {isStudent && studentAcademicContext && (filters.department !== studentAcademicContext.department || filters.level !== studentAcademicContext.level.toString()) && (
                <span className="block text-amber-600 dark:text-amber-400 text-xs mt-1">
                  <AlertTriangle className="inline h-3 w-3 mr-1" />
                  Note: You are viewing courses outside your primary academic program. Registration is restricted to courses matching your department and level for the open registration period.
                </span>
              )}
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
                    
                    let canRegisterThisCourse = !isRegistered && currentRegistrationMeta.isOpen;
                    canRegisterThisCourse = canRegisterThisCourse && course.academicYear === currentRegistrationMeta.academicYear && course.semester === currentRegistrationMeta.semester;
                    canRegisterThisCourse = canRegisterThisCourse && (totalRegisteredCredits + course.credits <= MAX_CREDITS);
                    
                    if (isStudent && studentAcademicContext) {
                        // Allow registration if course department matches student OR if course type is General (for student's level)
                        const departmentMatch = course.department === studentAcademicContext.department;
                        const isGeneralCourseForLevel = course.type === "General" && course.level === studentAcademicContext.level;
                        canRegisterThisCourse = canRegisterThisCourse && (departmentMatch || isGeneralCourseForLevel);
                        
                        // Always ensure course level matches student level, unless it's a general course where this might be relaxed (but for now, strict level match)
                        canRegisterThisCourse = canRegisterThisCourse && course.level === studentAcademicContext.level;

                        const unmetPrerequisites = course.prerequisites?.filter(prereqCode => {
                            const isPrereqMetOnRecord = registeredCourseIds.some(regId => {
                                const registeredPrereq = allCourses.find(c => c.id === regId && c.code === prereqCode);
                                if (!registeredPrereq) return false;

                                const targetYearPartsVal = course.academicYear.split('/');
                                const prereqYearPartsVal = registeredPrereq.academicYear.split('/');
                                const targetStartYearVal = parseInt(targetYearPartsVal[0]);
                                const prereqStartYearVal = parseInt(prereqYearPartsVal[0]);

                                const semesterOrderVal = {"First Semester": 1, "Second Semester": 2, "Resit Semester": 3};
                                const targetSemesterOrderVal = semesterOrderVal[course.semester as keyof typeof semesterOrderVal] || 0;
                                const prereqSemesterOrderVal = semesterOrderVal[registeredPrereq.semester as keyof typeof semesterOrderVal] || 0;

                                if (prereqStartYearVal < targetStartYearVal) return true; 
                                if (prereqStartYearVal === targetStartYearVal && prereqSemesterOrderVal < targetSemesterOrderVal) return true;
                                
                                return false;
                            });
                            return !isPrereqMetOnRecord;
                          });
                        if (unmetPrerequisites && unmetPrerequisites.length > 0) {
                            canRegisterThisCourse = false;
                        }
                    }

                    const canDropThisCourse = isRegistered && 
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
                            <Button variant="destructive" size="sm" onClick={() => handleDropCourse(course.id)} disabled={!canDropThisCourse}>
                              <MinusCircle className="mr-1 h-4 w-4"/> Drop
                            </Button>
                          ) : (
                            <Button variant="default" size="sm" onClick={() => handleRegisterCourse(course)} disabled={!canRegisterThisCourse}>
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
                 <p className="text-lg font-semibold">
                    { creditStatus.credits > 0 && (filters.academicYear !== "all" && filters.semester !== "all") 
                        ? `Total Credits for ${filters.semester}, ${filters.academicYear}: `
                        : currentRegistrationMeta.isOpen 
                            ? `Total Credits for Current Registration (${currentRegistrationMeta.semester}, ${currentRegistrationMeta.academicYear}): `
                            : "Total Registered Credits:" 
                    }
                    <span className={
                        creditStatus.variant === "warning" || creditStatus.variant === "destructive" ? "text-destructive" : "text-green-600 dark:text-green-400"
                    }>{creditStatus.credits}</span>
                </p>
                { (currentRegistrationMeta.isOpen || (creditStatus.credits > 0 && filters.academicYear !== "all" && filters.semester !== "all" ) ) && ( 
                   <Alert variant={creditStatus.variant === "success" ? "default" : creditStatus.variant} className="mt-2">
                    {creditStatus.variant === "success" ? <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" /> : 
                     creditStatus.variant === "info" ? <Info className="h-4 w-4" /> : 
                     <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{creditStatus.variant === "warning" ? "Warning" : creditStatus.variant === "destructive" ? "Error" : "Status"}</AlertTitle>
                    <AlertDescription>{creditStatus.message}</AlertDescription>
                  </Alert>
                )}
              </div>
              <Button 
                className="w-full" 
                disabled={filters.academicYear === "all" || filters.semester === "all" || registeredCoursesList.filter(c => c.academicYear === filters.academicYear && c.semester === filters.semester).length === 0}
                onClick={() => {
                  const coursesForFormB = registeredCoursesList.filter(c => c.academicYear === filters.academicYear && c.semester === filters.semester);
                  const totalCreditsForFormB = coursesForFormB.reduce((sum, course) => sum + course.credits, 0);
                  if (coursesForFormB.length > 0) {
                    toast({ 
                      title: "Form B Download", 
                      description: `Generating Form B for ${filters.semester}, ${filters.academicYear}. (This is a simulation - PDF generation is under development.) Courses: ${coursesForFormB.map(c => c.code).join(', ')}. Credits: ${totalCreditsForFormB}.`,
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
                <div>
                  <strong>Prerequisites:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {selectedCourseForDetail.prerequisites.map(prereqCode => {
                      const prereqCourse = allCourses.find(c => c.code === prereqCode);
                      return <li key={prereqCode}>{prereqCourse ? `${prereqCourse.code} - ${prereqCourse.title}` : prereqCode}</li>;
                    })}
                  </ul>
                </div>
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
