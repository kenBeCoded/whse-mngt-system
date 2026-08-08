import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/userService";
import { supabase } from "@/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User2, Camera, KeyRound, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
export function MyProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  // Form states
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  // Password reset states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  // Load user data into state
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setMiddleName(user.middle_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setGender(user.gender || "");
      setProfileImageUrl(user.user_profile_image_url || "");
    }
  }, [user]);
  // Handle image upload to Supabase Storage
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size should be less than 2MB");
      return;
    }
    setIsUploading(true);
    try {
      // 1. Delete previous image from Supabase storage if it exists
      if (user?.user_profile_image_url) {
        try {
          // Parse the path from the public URL.
          // Example URL format: https://.../storage/v1/object/public/App-File-Storage/user-images-uploads/img-uuid-date.png
          const urlParts = user.user_profile_image_url.split("/App-File-Storage/");
          if (urlParts.length > 1) {
            const oldFilePath = decodeURIComponent(urlParts[1]);
            await supabase.storage.from("App-File-Storage").remove([oldFilePath]);
          }
        } catch (delErr) {
          console.error("Error deleting old profile image:", delErr);
        }
      }

      const uuid_v4 = crypto.randomUUID();
      const fileExt = file.name.split(".").pop();
      const fileName = `img-${uuid_v4}-${Date.now()}.${fileExt}`;
      const filePath = `user-images-uploads/${fileName}`;

      // 2. Upload file to Supabase Storage bucket 'App-File-Storage'
      const { error: uploadError } = await supabase.storage
        .from("App-File-Storage")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });
      if (uploadError) {
        throw uploadError;
      }

      // 3. Get public URL
      const { data } = supabase.storage
        .from("App-File-Storage")
        .getPublicUrl(filePath);
      if (!data?.publicUrl) {
        throw new Error("Failed to retrieve public URL from Supabase Storage");
      }
      setProfileImageUrl(data.publicUrl);

      // 4. Auto-save the uploaded image URL directly to the users table
      await authService.updateProfile({
        user_profile_image_url: data.publicUrl
      });
      await refreshProfile();

      toast.success("Image updated and profile saved successfully!");
    } catch (err: any) {
      console.error("Supabase upload/save error:", err);
      toast.error(`Failed to upload image: ${err.response?.data?.error?.message || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleImageUpload(e.dataTransfer.files[0]);
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleImageUpload(e.target.files[0]);
    }
  };
  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    try {
      await authService.updateProfile({
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email,
        gender,
        user_profile_image_url: profileImageUrl,
      });
      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 5) {
      toast.error("Password must be at least 5 characters long");
      return;
    }
    setIsResettingPassword(true);
    try {
      await authService.updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password reset successfully!");
      setIsPasswordResetOpen(false);
      // Reset password form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || "Failed to reset password");
    } finally {
      setIsResettingPassword(false);
    }
  };
  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile details and security settings.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Profile Image & Read Only Info */}
        <Card className="md:col-span-1 shadow-md border-muted/60">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg font-bold">Profile Card</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {/* Drag and Drop Profile Image Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="relative group w-36 h-36 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden bg-muted/40"
            >
              <input
                type="file"
                id="profileImageInput"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="profileImageInput" className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground text-center p-2">
                    <User2 className="w-12 h-12 stroke-[1.5]" />
                    <span className="text-[10px] font-semibold mt-1">Drag or click</span>
                  </div>
                )}
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity rounded-full">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Change photo</span>
                </div>
              </label>
              {isUploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="text-center space-y-1">
              <h2 className="font-extrabold text-lg">{`${firstName} ${lastName}`.trim() || user?.username}</h2>
              <span className="inline-block px-2.5 py-0.5 text-xs font-extrabold uppercase bg-primary/10 text-primary rounded-full">
                {user?.role}
              </span>
            </div>
            <div className="w-full border-t pt-4 space-y-3">
              <div>
                <Label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Username</Label>
                <div className="mt-1 p-2 bg-muted/40 rounded text-sm text-foreground/80 font-medium select-all">
                  {user?.username}
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">User Account ID</Label>
                <div className="mt-1 p-2 bg-muted/40 rounded text-sm text-foreground/80 font-medium select-all">
                  {user?.user_account_id || "--"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Sched In</Label>
                  <div className="mt-1 p-2 bg-muted/40 rounded text-sm text-foreground/80 font-medium">
                    {user?.u_sched_in || "--:--"}
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Sched Out</Label>
                  <div className="mt-1 p-2 bg-muted/40 rounded text-sm text-foreground/80 font-medium">
                    {user?.u_sched_out || "--:--"}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-2 font-bold uppercase tracking-wider text-xs flex gap-2 justify-center items-center py-5 border-dashed"
                onClick={() => setIsPasswordResetOpen(true)}
              >
                <KeyRound className="w-4 h-4 text-primary" />
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Right Card: Editable Profile Details */}
        <Card className="md:col-span-2 shadow-md border-muted/60">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Profile Details</CardTitle>
            <CardDescription>Update your personal information below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">First Name</Label>
                <Input
                  id="firstName"
                  className="mt-1.5"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="middleName" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Middle Name</Label>
                <Input
                  id="middleName"
                  className="mt-1.5"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Last Name</Label>
                <Input
                  id="lastName"
                  className="mt-1.5"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Gender</Label>
                <div className="mt-1.5">
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">MALE</SelectItem>
                      <SelectItem value="female">FEMALE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t flex justify-end">
              <Button
                onClick={handleSaveChanges}
                disabled={isSubmitting}
                aria-disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase tracking-widest px-6 disabled:opacity-75 disabled:cursor-not-allowed disabled:pointer-events-none transition-opacity"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Password Reset Modal Dialog */}
      <Dialog open={isPasswordResetOpen} onOpenChange={setIsPasswordResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Provide your current password to set a new password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordResetSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="currentPass" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Current Password</Label>
                <Input
                  id="currentPass"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPass" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">New Password</Label>
                <Input
                  id="newPass"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPass" className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Confirm New Password</Label>
                <Input
                  id="confirmPass"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordResetOpen(false)}
                className="font-bold uppercase tracking-wider text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isResettingPassword}
                className="bg-primary hover:bg-primary/95 text-white font-extrabold uppercase tracking-widest"
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
