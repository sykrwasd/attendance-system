import { Staff } from "@/types";
import { useEffect, useState } from "react";
import { getStaff } from "../lib/api";

export function useStaff(){
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true)

     useEffect(() => {
    getStaff().then((data) => {
      setStaff(data);
      console.log(data);
      setLoading(false);
    });
  }, []);

  return { staff, loading };

}