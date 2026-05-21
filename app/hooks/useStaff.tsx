import { Staff } from "@/types";
import { useEffect, useState } from "react";
import * as api from "../lib/api";

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setStaff(await api.getStaff());
    setLoading(false);
  }

  async function add(item:any){
     await api.addStaff(item)
    refresh()
    
  }

  useEffect(() => {
    refresh();
  }, []);

  return { staff, loading, add };
}
