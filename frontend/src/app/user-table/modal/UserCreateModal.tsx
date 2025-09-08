import { useEffect, useState } from "react";
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
  email: z.email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female"]),
  // user_profile_image_url: z.string().optional(),
  user_profile_image_url: z
    .instanceof(File, { message: "Profile image must be a file" })
    .optional(),
  role: z.string().min(1, "Role is required"),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserCreateModalProps {
  onCreate: (newUser: Omit<Users, "user_account_id">) => void;
}

export const UserCreateModal = ({ onCreate }: UserCreateModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file && file.size <= 2 * 1024 * 1024) {
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setValue("user_profile_image_url", file);
    } else {
      alert("Please select an image file under 2MB");
      e.target.value = "";
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    reset();
    setIsOpen(false);
  };

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
      user_profile_image_url: undefined,
      role: "",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await onCreate({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const genderValue = watch("gender");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create User</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>CREATE NEW USER</DialogTitle>
          <DialogDescription>
            Enter user information to create a new user account. Click save to
            create the user.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Profile Image Section */}
            {/* TODO PRIO : SUPABASE > apply the supabase upload image here as input file image maximum of 2mb size, make the input field box is clickable */}
            {/* make the image preview box is clickable to open file dialog */}
            <div className="md:col-span-1">
              <div
                className="w-32 h-32 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-2 cursor-pointer overflow-hidden"
                onClick={() =>
                  document.getElementById("picture-input")?.click()
                }
              >
                {watch("user_profile_image_url") ? (
                  <img
                    src={previewUrl || ""}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500">Click to upload</span>
                )}
              </div>
              <Input
                id="picture-input"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
              />
              {errors.user_profile_image_url && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.user_profile_image_url.message}
                </p>
              )}
            </div>

            {/* <div className="md:col-span-1">
              <div className="w-32 h-32 bg-gray-200 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-2">
                {watch("user_profile_image_url") ? (
                  <img
                    src={watch("user_profile_image_url")}
                    alt="Profile Preview"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span>No Image</span>
                )}
              </div>
              <Label htmlFor="user_profile_image_url">Profile Image URL</Label>
              <Input
                id="user_profile_image_url"
                {...register("user_profile_image_url")}
                disabled={isSubmitting}
                placeholder="Enter image URL"
              />
              {errors.user_profile_image_url && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.user_profile_image_url.message}
                </p>
              )}
            </div> */}

            {/* First row of fields */}
            <div className="md:col-span-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    disabled={isSubmitting}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={watch("role")}
                    onValueChange={(value) => setValue("role", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>
                {/* <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    {...register("role")}
                    disabled={isSubmitting}
                    placeholder="Enter role"
                  />
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div> */}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    {...register("first_name")}
                    disabled={isSubmitting}
                    placeholder="Enter first name"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="middle_name">Middle Name</Label>
                  <Input
                    id="middle_name"
                    {...register("middle_name")}
                    disabled={isSubmitting}
                    placeholder="Enter middle name"
                  />
                  {errors.middle_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.middle_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    {...register("last_name")}
                    disabled={isSubmitting}
                    placeholder="Enter last name"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={isSubmitting}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gender field */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={genderValue}
                onValueChange={(value) =>
                  setValue("gender", value as "male" | "female")
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
