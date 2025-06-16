
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, Role } from "@/types";
import { DEPARTMENTS, VALID_LEVELS } from "@/config/data"; 
import { Users, Search, Filter, PlusCircle, MoreHorizontal, Edit, ShieldAlert, Trash2, UserCheck, UserX, GraduationCap, Briefcase } from "lucide-react";

// Mock data generation function
function generateMockUsers(count: number = 50): UserProfile[] {
  const users: UserProfile[] = [];
  const roles: Role[] = ["student", "lecturer", "admin", "finance"];
  const statuses: UserProfile['status'][] = ['active', 'suspended', 'pending_approval'];
  const firstNames = ["Amina", "Bello", "Chinedu", "Fatima", "Garba", "Hassan", "Ibrahim", "Jamilu", "Khadija", "Lamin", "Atem", "Rolland"];
  const lastNames = ["Abubakar", "Bakare", "Chukwu", "Dauda", "Eze", "Folarin", "Gbadamosi", "Haruna", "Idris", "Jibril", "Ndifor", "Enow"];
  const allDepartments = Object.values(DEPARTMENTS);

  for (let i = 0; i < count; i++) {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const displayName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const lastLogin = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString();
    
    let userSpecifics: Partial<UserProfile> = {};
    if (role === 'student') {
      const department = allDepartments[Math.floor(Math.random() * allDepartments.length)];
      const level = VALID_LEVELS[Math.floor(Math.random() * VALID_LEVELS.length)];
      let program = `${department} Program (Mock)`;
      if (department === DEPARTMENTS.CESM) {
          program = "B.Eng. Computer Engineering and System Maintenance";
      } else if (department === DEPARTMENTS.LTM) {
          program = "B.Tech. Logistics and Transport Management";
      } else if (department === DEPARTMENTS.ACC) {
          program = "B.Sc. Accounting";
      }

      userSpecifics = {
        department: department,
        level: level,
        program: program,
        matricule: `CUSMS/S/${new Date().getFullYear().toString().slice(-2)}${level.toString()[0]}${Math.floor(1000 + Math.random() * 9000)}`,
      };
    } else if (role === 'lecturer') {
       userSpecifics = {
        department: allDepartments[Math.floor(Math.random() * allDepartments.length)],
      };
    }

    users.push({
      uid: `user_${i + 1}`,
      email,
      displayName,
      role,
      photoURL: `https://placehold.co/40x40.png?text=${firstName[0]}${lastName[0]}`,
      status,
      lastLogin,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
      ...userSpecifics,
    });
  }
  // Ensure Atem Rolland is in the list for demo purposes
  if (!users.find(u => u.displayName === "Atem Rolland")) {
      users.push({
        uid: `student-atem-rolland`,
        email: 'atem.rolland@example.com',
        displayName: 'Atem Rolland',
        role: 'student',
        photoURL: `https://placehold.co/40x40.png?text=AR`,
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        department: DEPARTMENTS.CESM,
        level: 400,
        program: "B.Eng. Computer Engineering and System Maintenance",
        matricule: `CUSMS/S/2440001`
      });
  }
  return users;
}

export default function ViewAllUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ role: Role | "all"; status: UserProfile['status'] | "all" }>({
    role: "all",
    status: "all",
  });
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setUsers(generateMockUsers(50));
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value as Role | "all" | UserProfile['status'] }));
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => filters.role === "all" || user.role === filters.role)
      .filter(user => filters.status === "all" || user.status === filters.status)
      .filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.program?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [users, searchTerm, filters]);

  const getStatusBadgeVariant = (status?: UserProfile['status']) => {
    switch (status) {
      case "active": return "default";
      case "suspended": return "destructive";
      case "pending_approval": return "secondary";
      default: return "outline";
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) return names[0][0] + names[names.length - 1][0];
    return name.substring(0, 2).toUpperCase();
  };

  const handleAction = (action: string, userId: string, userName: string | null) => {
    toast({
      title: `Action: ${action}`,
      description: `Simulated '${action}' for user ${userName || userId}. (Functionality to be implemented)`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-semibold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground text-lg">
            View, search, and manage all user accounts in the system.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/users/create">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New User
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Filter and manage user accounts below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search name, email, matricule, program..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filters.role || "all"} onValueChange={(value) => handleFilterChange("role", value)}>
              <SelectTrigger className="w-full sm:w-auto min-w-[160px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="lecturer">Lecturer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-full sm:w-auto min-w-[180px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Image src="https://placehold.co/300x200.png" alt="No users found" width={150} height={100} className="mx-auto mb-4 rounded-lg" data-ai-hint="empty state users" />
              <h3 className="text-xl font-semibold">No Users Found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] px-2 sm:px-4"></TableHead>
                    <TableHead className="px-2 sm:px-4">Name</TableHead>
                    <TableHead className="px-2 sm:px-4">Email</TableHead>
                    <TableHead className="text-center px-2 sm:px-4">Role</TableHead>
                    <TableHead className="px-2 sm:px-4 min-w-[200px]">Details</TableHead>
                    <TableHead className="text-center px-2 sm:px-4">Status</TableHead>
                    <TableHead className="hidden md:table-cell px-2 sm:px-4">Last Login</TableHead>
                    <TableHead className="text-right px-2 sm:px-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="px-2 sm:px-4">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} data-ai-hint="user avatar" />
                          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium px-2 sm:px-4">{user.displayName}</TableCell>
                      <TableCell className="text-muted-foreground text-xs px-2 sm:px-4">{user.email}</TableCell>
                      <TableCell className="text-center px-2 sm:px-4">
                        <Badge variant={user.role === 'admin' ? "destructive" : user.role === 'lecturer' ? "secondary" : "outline" } className="capitalize text-xs">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap px-2 sm:px-4">
                        {user.role === 'student' && (
                          <>
                            <span className="block">Mat: {user.matricule || 'N/A'}</span>
                            <span className="block">Dept: {user.department || 'N/A'}</span>
                            <span className="block">Lvl: {user.level || 'N/A'}</span>
                            <span className="block truncate max-w-[150px] sm:max-w-xs" title={user.program || 'N/A'}>Prog: {user.program || 'N/A'}</span>
                          </>
                        )}
                        {user.role === 'lecturer' && <span className="block">Dept: {user.department || 'N/A'}</span>}
                      </TableCell>
                      <TableCell className="text-center px-2 sm:px-4">
                        <Badge variant={getStatusBadgeVariant(user.status)} className="capitalize text-xs">
                          {user.status?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground px-2 sm:px-4">
                        {user.lastLogin ? format(parseISO(user.lastLogin as string), "MMM dd, yyyy p") : 'Never'}
                      </TableCell>
                      <TableCell className="text-right px-2 sm:px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">User Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction('Edit', user.uid, user.displayName)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit User
                            </DropdownMenuItem>
                            {user.status === 'active' && (
                              <DropdownMenuItem onClick={() => handleAction('Suspend', user.uid, user.displayName)} className="text-orange-600 focus:text-orange-600">
                                <UserX className="mr-2 h-4 w-4" /> Suspend Account
                              </DropdownMenuItem>
                            )}
                            {(user.status === 'suspended' || user.status === 'pending_approval') && (
                              <DropdownMenuItem onClick={() => handleAction('Activate', user.uid, user.displayName)} className="text-green-600 focus:text-green-600">
                                <UserCheck className="mr-2 h-4 w-4" /> Activate Account
                              </DropdownMenuItem>
                            )}
                             <DropdownMenuItem onClick={() => handleAction('Reset Password', user.uid, user.displayName)}>
                              <ShieldAlert className="mr-2 h-4 w-4" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAction('Delete', user.uid, user.displayName)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} total users. Pagination not yet implemented.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
