import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { UserDetailsModal } from "./dialog/UserDetailsModal";

export type Users = {
  id: string | number;
  username: string;
  user_account_id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: "male" | "female";
  user_profile_image_url?: string | null;
  user_profile_image_file?: File;
  role: string;
  updated_at: string;
  created_at: string;
  u_sched_in?: string | null;
  u_sched_out?: string | null;
};

// Add a lightweight TableMeta type so we can access table.options.meta?.onSave safely
type TableMeta = {
  onSave?: (updatedUser: Users) => void;
};

// User Columns (assuming this is part of the same file or imported)
export const userColumns: ColumnDef<Users>[] = [
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
    accessorKey: "user_account_id",
    header: "User ID",
  },
  {
    header: "Fullname",
    // cell: ({ row }) => {
    //   const user = row.original;
    //   return `${user.first_name} ${
    //     user.middle_name ? user.middle_name + " " : ""
    //   }${user.last_name}`;
    // },
    accessorFn: (row) => {
      const fullName = `${row.first_name} ${row.middle_name || ""} ${
        row.last_name
      }`.trim();
      return fullName.length > 20
        ? fullName.substring(0, 20) + "..."
        : fullName;
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "updated_at",
    header: "Last Updated",
    accessorFn: (row) => new Date(row.updated_at).toLocaleString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const user = row.original;
      const onSave =
        (table.options.meta as TableMeta)?.onSave ??
        ((u: Users) => {
          void u;
        });

      return (
        <div className="flex gap-2">
          <UserDetailsModal user={user} onSave={onSave} />
        </div>
      );
    },
  },
];
