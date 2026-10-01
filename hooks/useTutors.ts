"use client";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import { useMemo } from "react";
import type { Tutor } from "@/constant/request/type";
import type { TutorFormValues } from "@/libs/validation/tutorSchema";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const TUTORS_ENDPOINT = `${API_BASE}/tutors`;

const fetcher = (url: string) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data.data);

export function useTutors() {
  const {
    data: tutors,
    error,
    isLoading,
    mutate,
  } = useSWR<Tutor[]>(TUTORS_ENDPOINT, fetcher);

  const list = tutors ?? [];

  const createTutor = async (payload: TutorFormValues) => {
    try {
      const res = await axios.post(`${TUTORS_ENDPOINT}/add`, payload, {
        withCredentials: true,
      });
      const created: Tutor = res.data.data;
      mutate([created, ...list], false);
      toast.success(`Tutor added — ${created.name}`);
      return created;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to add tutor. Please try again.";
      toast.error(message);
      throw error;
    }
  };

  const updateTutor = async (id: string, payload: Partial<TutorFormValues>) => {
    try {
      const res = await axios.patch(`${TUTORS_ENDPOINT}/${id}`, payload, {
        withCredentials: true,
      });
      const updated: Tutor = res.data.data;
      mutate(
        list.map((t) => (t.id === id ? updated : t)),
        false,
      );
      toast.success(`Tutor updated — ${updated.name}`);
      return updated;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to update tutor. Please try again.";
      toast.error(message);
      throw error;
    }
  };

  const deleteTutor = async (id: string) => {
    try {
      await axios.delete(`${TUTORS_ENDPOINT}/${id}`, {
        withCredentials: true,
      });
      mutate(
        list.filter((t) => t.id !== id),
        false,
      );
      toast.success("Tutor removed");
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to remove tutor. Please try again.";
      toast.error(message);
      throw error;
    }
  };

  const totalCount = useMemo(() => list.length, [list]);

  const professionCounts = useMemo(() => {
    return list.reduce<Record<string, number>>((acc, t) => {
      acc[t.profession] = (acc[t.profession] ?? 0) + 1;
      return acc;
    }, {});
  }, [list]);

  const missingBioCount = useMemo(
    () => list.filter((t) => !t.bio?.trim()).length,
    [list],
  );

  return {
    tutors: list,
    loading: isLoading,
    error,
    createTutor,
    updateTutor,
    deleteTutor,
    mutate,
    totalCount,
    professionCounts,
    missingBioCount,
  };
}