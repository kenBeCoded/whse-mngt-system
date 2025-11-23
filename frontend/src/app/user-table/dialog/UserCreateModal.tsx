import { useState, useRef } from "react";
import type { Users } from "../columns";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female"]),
  user_profile_image_file: z.instanceof(File).optional(),
  role: z.string().min(1, "Role is required"),
  u_sched_in: z.string().optional(),
  u_sched_out: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserCreateModalProps {
  onCreate: (newUser: Users) => void;
}

export const UserCreateModal = ({ onCreate }: UserCreateModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "male",
      user_profile_image_file: undefined,
      role: "",
      u_sched_in: undefined,
      u_sched_out: undefined,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      const formData = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await onCreate(formData);
      setIsOpen(false);
      setPreviewImage(null);
      reset();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const genderValue = watch("gender");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("user_profile_image_file", file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="ml-2">Create User</Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] sm:max-w-[600px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CREATE NEW USER</DialogTitle>
          <DialogDescription>
            Enter user information to create a new user account. Click save to
            create the user.
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
                    alt="Profile Preview"
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
                disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    placeholder="Enter username"
                    className="mt-1"
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
                  <Select
                    value={watch("role")}
                    onValueChange={(value) => setValue("role", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
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
                    disabled={isSubmitting}
                    placeholder="Enter first name"
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
                    disabled={isSubmitting}
                    placeholder="Enter middle name"
                    className="mt-1"
                  />
                  {errors.middle_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.middle_name.message}
                    </p>
                  )}
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
                    disabled={isSubmitting}
                    placeholder="Enter last name"
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
                    disabled={isSubmitting}
                    placeholder="Enter email"
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                  {errors.u_sched_out && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.u_sched_out.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="gender" className="text-sm">
                    Gender
                  </Label>
                  <Select
                    value={genderValue}
                    onValueChange={(value) =>
                      setValue("gender", value as "male" | "female")
                    }
                    disabled={isSubmitting}
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
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsOpen(false);
                setPreviewImage(null);
                reset();
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
