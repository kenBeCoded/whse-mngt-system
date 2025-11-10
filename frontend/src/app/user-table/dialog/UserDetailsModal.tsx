import { useState, useRef } from "react";
import type { Users } from "../columns";
import { useUserStore } from "@/store/user-store";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const userSchema = z.object({
  username: z.string(),
  user_account_id: z.string(),
  email: z.email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string(),
  last_name: z.string().min(1, "Last name is required"),
  user_profile_image_file: z.instanceof(File).optional(),
  gender: z.enum(["male", "female"]),
  user_profile_image_url: z.string(),
  role: z.string(),
  updated_at: z.string(),
  created_at: z.string(),
  u_sched_in: z.string().optional(),
  u_sched_out: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserDetailsModal = ({
  user,
  onSave,
}: {
  user: Users;
  onSave: (updatedUser: Users) => void;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { deleteUser, isLoading } = useUserStore();

  const [previewImage, setPreviewImage] = useState<string | null>(
    user.user_profile_image_url ?? null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("user_profile_image_file", file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      ...user,
      created_at: user.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : new Date().toLocaleDateString(),
      updated_at: user.updated_at
        ? new Date(user.updated_at).toLocaleDateString()
        : new Date().toLocaleDateString(),
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      // console.log("data:", data);
      await onSave(data);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(user.username);
      setIsOpen(false);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const genderValue = watch("gender");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] sm:max-w-[600px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>USER DETAILS</DialogTitle>
          <DialogDescription>
            View and edit user information. Make changes and click save to
            update the user details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4">
            {/* Profile Image Section */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-2">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-sm text-gray-500">No Image</span>
                )}
              </div>
              <Label htmlFor="user_profile_image_file" className="text-sm mb-1">
                Profile Image
              </Label>
              <Input
                id="user_profile_image_file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isSubmitting || isLoading}
                className="max-w-[200px]"
              />
              {errors.user_profile_image_file && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.user_profile_image_file.message}
                </p>
              )}
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-1 space-y-3">
              {/* Username & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="username" className="text-sm">
                    Username
                  </Label>
                  <Input
                    id="username"
                    {...register("username")}
                    readOnly
                    className="bg-gray-100 mt-1"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="role" className="text-sm">
                    Role
                  </Label>
                  <Input
                    id="role"
                    {...register("role")}
                    readOnly
                    className="bg-gray-100 mt-1"
                  />
                  {errors.role && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>
              </div>

              {/* First & Middle Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="first_name" className="text-sm">
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    {...register("first_name")}
                    disabled={isSubmitting || isLoading}
                    className="mt-1"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="middle_name" className="text-sm">
                    Middle Name
                  </Label>
                  <Input
                    id="middle_name"
                    {...register("middle_name")}
                    disabled={isSubmitting || isLoading}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Last Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="last_name" className="text-sm">
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    {...register("last_name")}
                    disabled={isSubmitting || isLoading}
                    className="mt-1"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={isSubmitting || isLoading}
                    className="mt-1"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Sched In & Out */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="u_sched_in" className="text-sm">
                    Schedule In
                  </Label>
                  <Input
                    id="u_sched_in"
                    type="time"
                    {...register("u_sched_in")}
                    disabled={isSubmitting || isLoading}
                    className="mt-1"
                  />
                  {errors.u_sched_in && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.u_sched_in.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="u_sched_out" className="text-sm">
                    Schedule Out
                  </Label>
                  <Input
                    id="u_sched_out"
                    type="time"
                    {...register("u_sched_out")}
                    disabled={isSubmitting || isLoading}
                    className="mt-1"
                  />
                  {errors.u_sched_out && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.u_sched_out.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gender, Created At, Updated At */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <Label htmlFor="gender" className="text-sm">
                Gender
              </Label>
              <Select
                value={genderValue}
                onValueChange={(value) =>
                  setValue("gender", value as "male" | "female")
                }
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="created_at" className="text-sm">
                Created At
              </Label>
              <Input
                id="created_at"
                {...register("created_at")}
                readOnly
                className="bg-gray-100 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="updated_at" className="text-sm">
                Updated At
              </Label>
              <Input
                id="updated_at"
                {...register("updated_at")}
                readOnly
                className="bg-gray-100 mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t">
            <div>
              {!isDeleteDialogOpen ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  disabled={isSubmitting || isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete this account?
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={handleDeleteUser}
                    disabled={isSubmitting || isLoading}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isSubmitting || isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
