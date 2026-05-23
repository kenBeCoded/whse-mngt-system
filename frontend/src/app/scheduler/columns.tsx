import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
<<<<<<< Updated upstream
import { UpdateOTDialog } from "./dialog/UpdateOTDialog";
=======
import { UpdateOtCell } from "./dialog/Updateotcell";
>>>>>>> Stashed changes

export type SchedulerUser = {
  id?: string | number;
  username: string;
  user_account_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  role: string;
  u_sched_in: string | null;
  u_sched_out: string | null;
};

export const schedulerColumns: ColumnDef<SchedulerUser>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "USER ID",
    accessorKey: "user_account_id",
    header: "User ID",
  },
  {
    id: "FULLNAME",
    header: "Fullname",
    accessorFn: (row) =>
      `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(),
  },
  {
    id: "ROLE",
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "SCHEDULE",
    header: "Schedule",
    accessorFn: (row) => {
      if (!row.u_sched_in || !row.u_sched_out) return "Not Set";
      return `${row.u_sched_in} to ${row.u_sched_out}`;
    },
  },
  {
    id: "actions",
    header: "Actions",
<<<<<<< Updated upstream
    cell: ({ row }) => {
      const user = row.original;
      return <UpdateOTDialog user={user} />;
    },
  },
];

=======
    cell: ({ row }) => <UpdateOtCell user={row.original} />,
  },
];
>>>>>>> Stashed changes
