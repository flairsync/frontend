import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchBusinessEmployeesApiCall } from "../service";
import { BusinessEmployee } from "@/models/business/BusinessEmployee";
import { usePageContext } from "vike-react/usePageContext";

type PaginatedEmployeesType = {
  employees: BusinessEmployee[];
  totalPages: number;
};

// ✅ Extract the page param key
const EMPLOYEE_PAGE_PARAM = "etbl";

export const useBusinessEmployees = (businessId: string) => {
  const { urlParsed } = usePageContext();

  // Read epage from urlParsed.search or default to 1
  const initialPage = Number(urlParsed.search[EMPLOYEE_PAGE_PARAM] ?? 1);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Keep state in sync if user navigates with back/forward
  useEffect(() => {
    if (!urlParsed.search[EMPLOYEE_PAGE_PARAM]) {
      setPage(1);
    }
    const onPopState = () => {
      setCurrentPage(Number(urlParsed.search[EMPLOYEE_PAGE_PARAM] ?? 1));
    };
    window.addEventListener("popstate", onPopState);

    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const { data, isPending, isFetching } = useQuery<PaginatedEmployeesType>({
    queryKey: ["business_emps", businessId, currentPage],
    queryFn: async () => {
      const resp = await fetchBusinessEmployeesApiCall(businessId, currentPage);

      if (!resp.data.success) {
        throw new Error("Failed to fetch employees");
      }

      const emps = BusinessEmployee.parseApiArrayResponse(resp.data.data.data);

      return {
        employees: emps,
        totalPages: resp.data.data.pages,
      };
    },
    staleTime: 5000,
  });

  // Update page in state and URL
  const setPage = (page: number) => {
    setCurrentPage(page);

    // Update URL without reload
    const params = new URLSearchParams(window.location.search);
    params.set(EMPLOYEE_PAGE_PARAM, String(page));
    const newUrl =
      window.location.pathname + "?" + params.toString() + window.location.hash;
    window.history.pushState({}, "", newUrl);
  };

  return {
    currentPage,
    setPage,
    employees: data?.employees ?? [],
    totalPages: data?.totalPages ?? 1,
    isPending,
    isFetching,
  };
};
