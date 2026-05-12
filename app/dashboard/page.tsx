"use client"

import { useStaff } from '../hooks/useStaff'

export default function Page() {

  const { staff,loading} = useStaff()
  console.log(staff)

  return (
    <div>
      <h1>Employee</h1>

      {staff?.map((item) => (
        <div key={item.created_at}>
          {item.staff_name}
        </div>
      ))}
    </div>
  )
}