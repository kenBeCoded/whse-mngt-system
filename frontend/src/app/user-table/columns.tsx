import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { UserDetailsModal } from "./modal/UserDetailsModal";

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
  created_at: string;
};

// User Details Modal Component
// const UserDetailsModal = ({
//   user,
//   onSave,
// }: {
//   user: Users;
//   onSave: (updatedUser: Users) => void;
// }) => {
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);

//   // Get delete function and loading state from Zustand store
//   const { deleteUser, isLoading } = useUserStore();

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors, isSubmitting },
//   } = useForm<UserFormData>({
//     resolver: zodResolver(userSchema),
//     defaultValues: {
//       ...user,
//       created_at: user.created_at || new Date().toISOString(),
//     },
//   });

//   const onSubmit = async (data: UserFormData) => {
//     console.log("data", data);
//     try {
//       await onSave(data);
//       setIsOpen(false);
//     } catch (error) {
//       console.error("Failed to save user:", error);
//     }
//   };

//   const handleDeleteUser = async () => {
//     try {
//       await deleteUser(user.username);
//       setIsOpen(false);
//       setIsDeleteDialogOpen(false);
//     } catch (error) {
//       console.error("Failed to delete user:", error);
//     }
//   };

//   const genderValue = watch("gender");

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button variant="ghost" size="sm">
//           Details
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>USER DETAILS</DialogTitle>
//           <DialogDescription>
//             View and edit user information. Make changes and click save to
//             update the user details.
//           </DialogDescription>
//         </DialogHeader>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
//             {/* Profile Image Section */}
//             <div className="md:col-span-1">
//               <div className="w-32 h-32 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-2">
//                 {user.user_profile_image_url ? (
//                   <img
//                     src={user.user_profile_image_url}
//                     alt="Profile"
//                     className="w-full h-full object-cover rounded"
//                   />
//                 ) : (
//                   <span>No Image</span>
//                 )}
//               </div>
//               {/* <Label htmlFor="user_profile_image_url">Profile Image URL</Label>
//               <Input
//                 id="user_profile_image_url"
//                 {...register("user_profile_image_url")}
//                 disabled={isSubmitting || isLoading}
//               />
//               {errors.user_profile_image_url && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.user_profile_image_url.message}
//                 </p>
//               )} */}
//             </div>

//             {/* First row of fields */}
//             <div className="md:col-span-1">
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <Label htmlFor="username">Username</Label>
//                   <Input
//                     id="username"
//                     {...register("username")}
//                     readOnly
//                     className="bg-gray-100"
//                   />
//                   {errors.username && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.username.message}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <Label htmlFor="role">Role</Label>
//                   <Input
//                     id="role"
//                     {...register("role")}
//                     readOnly
//                     className="bg-gray-100"
//                   />
//                   {errors.role && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.role.message}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <div>
//                   <Label htmlFor="first_name">First Name</Label>
//                   <Input
//                     id="first_name"
//                     {...register("first_name")}
//                     disabled={isSubmitting || isLoading}
//                   />
//                   {errors.first_name && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.first_name.message}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <Label htmlFor="middle_name">Middle Name</Label>
//                   <Input
//                     id="middle_name"
//                     {...register("middle_name")}
//                     disabled={isSubmitting || isLoading}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <div>
//                   <Label htmlFor="last_name">Last Name</Label>
//                   <Input
//                     id="last_name"
//                     {...register("last_name")}
//                     disabled={isSubmitting || isLoading}
//                   />
//                   {errors.last_name && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.last_name.message}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     {...register("email")}
//                     disabled={isSubmitting || isLoading}
//                   />
//                   {errors.email && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.email.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Second row of fields */}
//           <div className="grid grid-cols-3 gap-4 mb-4">
//             <div>
//               <Label htmlFor="gender">Gender</Label>
//               <Select
//                 value={genderValue}
//                 onValueChange={(value) =>
//                   setValue("gender", value as "male" | "female")
//                 }
//                 disabled={isSubmitting || isLoading}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select gender" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="male">Male</SelectItem>
//                   <SelectItem value="female">Female</SelectItem>
//                 </SelectContent>
//               </Select>
//               {errors.gender && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.gender.message}
//                 </p>
//               )}
//             </div>
//             <div>
//               <Label htmlFor="created_at">Created At</Label>
//               <Input
//                 id="created_at"
//                 {...register("created_at")}
//                 readOnly
//                 className="bg-gray-100"
//                 value={new Date(
//                   user.created_at || Date.now()
//                 ).toLocaleDateString()}
//               />
//             </div>
//             <div>
//               <Label htmlFor="updated_at">Updated At</Label>
//               <Input
//                 id="updated_at"
//                 {...register("updated_at")}
//                 readOnly
//                 className="bg-gray-100"
//                 value={new Date(user.updated_at).toLocaleDateString()}
//               />
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-between items-center pt-4">
//             <div>
//               {!isDeleteDialogOpen ? (
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setIsDeleteDialogOpen(true)}
//                   className="text-red-600 border-red-600 hover:bg-red-50"
//                   disabled={isSubmitting || isLoading}
//                 >
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Delete this account?
//                 </Button>
//               ) : (
//                 <div className="flex gap-2">
//                   <Button
//                     variant="destructive"
//                     size="sm"
//                     type="button"
//                     onClick={handleDeleteUser}
//                     disabled={isSubmitting || isLoading}
//                   >
//                     Yes
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     type="button"
//                     onClick={() => setIsDeleteDialogOpen(false)}
//                     disabled={isSubmitting || isLoading}
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               )}
//             </div>

//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 type="submit"
//                 disabled={isSubmitting || isLoading}
//               >
//                 {isSubmitting ? "Saving..." : "Save changes"}
//               </Button>
//               <Button
//                 variant="destructive"
//                 type="button"
//                 disabled={isSubmitting || isLoading}
//               >
//                 Delete
//               </Button>
//             </div>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

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
    cell: ({ row }) => {
      const user = row.original;
      return `${user.first_name} ${
        user.middle_name ? user.middle_name + " " : ""
      }${user.last_name}`;
    },
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const user = row.original;
      const onSave = (table.options.meta as any)?.onSave;

      return (
        <div className="flex gap-2">
          <UserDetailsModal user={user} onSave={onSave} />
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
                onClick={() =>
                  navigator.clipboard.writeText(user.user_account_id)
                }
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

// TODO : to delete comment