"use client";
import useSWR from "swr";
import type { Student } from "@/constant/request/type";
import { fetchAllStudents } from "@/libs/api/students";


const STUDENTS_KEY = "/students/all";

export function useStudents() {
  const { data: students, error, isLoading, mutate } = useSWR<Student[]>(
    STUDENTS_KEY,
    fetchAllStudents,
  );

  return {
    students: students ?? [],
    loading: isLoading,
    error,
    mutate,
  };
}