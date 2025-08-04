import { type ColumnDef } from "@tanstack/react-table";
// import { ArrowUpDown } from "lucide-react";
// import { MoreHorizontal } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
// import { DataTableColumnHeader } from "./date-table-column-header";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export type Users = {
  username: string;
  user_account_id: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  user_profile_image_url: string;
  role: string;
  updated_at: string;
};

// User Details Modal Component
const UserDetailsModal = ({ user }: { user: Users }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>USER DETAILS</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Profile Image Section */}
          <div className="md:col-span-1">
            <div className="w-32 h-32 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-2">
              {user.user_profile_image_url ? (
                <img 
                  src={user.user_profile_image_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <span className="text-gray-400 text-sm">No Image</span>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-32">
              Choose File
            </Button>
          </div>

          {/* Form Fields */}
          <div className="md:col-span-1 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="user_account_id">User Account ID</Label>
                <Input 
                  id="user_account_id" 
                  value={user.user_account_id} 
                  readOnly 
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={user.username} 
                  readOnly 
                  className="bg-gray-100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input 
                  id="first_name" 
                  value={user.first_name} 
                  readOnly 
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="middle_name">Middle Name</Label>
                <Input 
                  id="middle_name" 
                  value={user.middle_name || ""} 
                  readOnly 
                  className="bg-gray-100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input 
                  id="last_name" 
                  value={user.last_name} 
                  readOnly 
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={user.email} 
                  readOnly 
                  className="bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Second row of fields */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Input 
              id="gender" 
              value={user.gender} 
              readOnly 
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label htmlFor="created_at">Created At</Label>
            <Input 
              id="created_at" 
              value={new Date().toLocaleDateString()} // Placeholder since created_at not in type
              readOnly 
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label htmlFor="updated_at">Updated At</Label>
            <Input 
              id="updated_at" 
              value={new Date(user.updated_at).toLocaleDateString()} 
              readOnly 
              className="bg-gray-100"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <div>
            {!isDeleteDialogOpen ? (
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Delete this account?
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                >
                  Yes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              Save changes
            </Button>
            <Button variant="destructive">
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


// Users
// export const userColumns: ColumnDef<Users>[] = [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={
//           table.getIsAllPageRowsSelected() ||
//           (table.getIsSomePageRowsSelected() && "indeterminate")
//         }
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "user_account_id",
//     header: "User ID",
//   },
//   // full name
//   {
//     header: "Fullname",
//     cell: ({ row }) => {
//       const user = row.original;
//       return `${user.first_name} ${
//         user.middle_name ? user.middle_name + " " : ""
//       }${user.last_name}`;
//     },
//     // Optional: Add an accessorFn if you want to enable sorting and filtering on the full name
//     accessorFn: (row) =>
//       `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(),
//   },
//   {
//     accessorKey: "gender",
//     header: "Gender",
//   },
//   {
//     accessorKey: "role",
//     header: "Role",
//   },
//   {
//     accessorKey: "updated_at",
//     header: "Last Updated",
//   },
//   // <Dialog>
//   //       <DialogTrigger>Details</DialogTrigger>
//   //       <DialogContent>
//   //         <DialogHeader>
//   //           <DialogTitle>Title</DialogTitle>
//   //           <DialogDescription>
//   //             body
//   //           </DialogDescription>
//   //         </DialogHeader>
//   //       </DialogContent>
//   //     </Dialog>
// ];

// Users
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
  // full name
  {
    header: "Fullname",
    cell: ({ row }) => {
      const user = row.original;
      return `${user.first_name} ${
        user.middle_name ? user.middle_name + " " : ""
      }${user.last_name}`;
    },
    // Optional: Add an accessorFn if you want to enable sorting and filtering on the full name
    accessorFn: (row) =>
      `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(),
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
  },
  // Actions column with Details button
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex gap-2">
          <UserDetailsModal user={user} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.user_account_id)}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit user</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

// // Payment
// export const columns: ColumnDef<Payment>[] = [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={
//           table.getIsAllPageRowsSelected() ||
//           (table.getIsSomePageRowsSelected() && "indeterminate")
//         }
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//   },
//   {
//     accessorKey: "email",
//     // header: ({ column }) => {
//     //   return (
//     //     <Button
//     //       variant="ghost"
//     //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//     //     >
//     //       Email
//     //       <ArrowUpDown className="ml-2 h-4 w-4" />
//     //     </Button>
//     //   );
//     // },
//     header: ({ column }) => (
//       <DataTableColumnHeader column={column} title="Email" />
//     ),
//   },
//   {
//     accessorKey: "amount",
//     // header: () => <div className="text-right">Amount</div>,
//     header: ({ column }) => (
//       <DataTableColumnHeader column={column} title="Amount" />
//     ),
//     cell: ({ row }) => {
//       const amount = parseFloat(row.getValue("amount"));
//       const formatted = new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: "USD",
//       }).format(amount);

//       return <div className="text-right font-medium">{formatted}</div>;
//     },
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const payment = row.original;

//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" className="h-8 w-8 p-0">
//               <span className="sr-only">Open menu</span>
//               <MoreHorizontal className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//             <DropdownMenuItem
//               onClick={() => navigator.clipboard.writeText(payment.id)}
//             >
//               Copy payment ID
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem>View customer</DropdownMenuItem>
//             <DropdownMenuItem>View payment details</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       );
//     },
//   },
// ];

// TODO : remove comments
