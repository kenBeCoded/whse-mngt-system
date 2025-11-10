import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "../api/axios";
import { type Users } from "@/app/user-table/columns";
import { supabase } from "../supabase.ts";

const API = axios.create({
  withCredentials: true,
});

interface UserState {
  // State
  users: Users[];
  isLoading: boolean;
  error: string | null;
  selectedUsers: string[]; // Array of user_account_ids

  // Actions
  setUsers: (users: Users[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // User CRUD operations
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<Users, "user_account_id">) => Promise<void>;
  updateUser: (updatedUser: Users) => Promise<void>;
  deleteUser: (username: string) => Promise<void>;
  deleteMultipleUsers: (userIds: string[]) => Promise<void>;

  // Selection management
  selectUser: (userId: string) => void;
  unselectUser: (userId: string) => void;
  selectAllUsers: () => void;
  unselectAllUsers: () => void;
  toggleUserSelection: (userId: string) => void;

  // Utility functions
  getUserById: (userId: string) => Users | undefined;
  clearError: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      // Initial State
      users: [],
      isLoading: false,
      error: null,
      selectedUsers: [],

      // Basic setters
      setUsers: (users) => set({ users }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Fetch all users from API
      fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.get("/api/users/get-all-users");
          if (response.status === 200) {
            set({ users: response.data, isLoading: false });
          } else {
            throw new Error(`Unexpected response status: ${response.status}`);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch users";
          set({ error: errorMessage, isLoading: false });
          console.error("Error fetching users:", error);
        }
      },

      // Add new user
      addUser: async (user) => {
        // return console.log(user);
        set({ isLoading: true, error: null });

        let imageUrl = null;

        // Check if a file is provided before attempting to upload
        if (user.user_profile_image_file) {
          const uuid_v4 = crypto.randomUUID();
          const fileExt = user.user_profile_image_file.name.split(".").pop();
          const fileName = `img-${uuid_v4}-${Date.now()}.${fileExt}`;
          const filePath = `user-images-uploads/${fileName}`;

          // Upload file to Supabase
          const { error: uploadError } = await supabase.storage
            .from("App-File-Storage")
            .upload(filePath, user.user_profile_image_file);

          if (uploadError) {
            set({
              error: `Failed to upload image: ${uploadError.message}`,
              isLoading: false,
            });
            console.error("Upload error:", uploadError);
            return; // Exit the function if upload fails
          }

          // Get the public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from("App-File-Storage")
            .getPublicUrl(filePath);

          imageUrl = publicUrlData.publicUrl;
        }

        try {
          // Create the new user object to send to the API
          const newUser = {
            ...user,
            user_profile_image_url: imageUrl, // Add the image URL here
            user_profile_image_file: undefined, // Remove the file object
          };

          const response = await API.post("/api/users/create-user", newUser);
          if (response.status === 201 || response.status === 200) {
            const addedUser = response.data.data;
            set((state) => ({
              users: [...state.users, addedUser],
              isLoading: false,
            }));
          } else {
            throw new Error(`Failed to create user: ${response.status}`);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to add user";
          set({ error: errorMessage, isLoading: false });
          console.error("Failed to add user:", error);
          throw error;
        }
      },

      // Update existing user
      updateUser: async (updatedUser) => {
        set({ isLoading: true, error: null });

        let imageUrl = updatedUser.user_profile_image_url;
        let oldImagePath: string | null = null;

        // Check if a new file is provided before attempting to upload
        if (updatedUser.user_profile_image_file) {
          const uuid_v4 = crypto.randomUUID();
          const fileExt = updatedUser.user_profile_image_file.name
            .split(".")
            .pop();
          const fileName = `img-${uuid_v4}-${Date.now()}.${fileExt}`;
          const filePath = `user-images-uploads/${fileName}`;

          // Upload file to Supabase
          const { error: uploadError } = await supabase.storage
            .from("App-File-Storage")
            .upload(filePath, updatedUser.user_profile_image_file);

          if (uploadError) {
            set({
              error: `Failed to upload image: ${uploadError.message}`,
              isLoading: false,
            });
            console.error("Upload error:", uploadError);
            return;
          }

          // Get the public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from("App-File-Storage")
            .getPublicUrl(filePath);

          imageUrl = publicUrlData.publicUrl;

          // Store old image path for deletion after successful update
          if (updatedUser.user_profile_image_url) {
            const pathParts = updatedUser.user_profile_image_url.split(
              "/user-images-uploads/"
            );
            if (pathParts.length > 1) {
              oldImagePath = `user-images-uploads/${pathParts[1]}`;
            }
          }
        }

        try {
          const body = {
            ...updatedUser,
            user_profile_image_url: imageUrl,
            user_profile_image_file: undefined,
            updated_at: undefined,
          };

          const response = await API.patch("/api/users/update-user", body);

          if (response.status === 200) {
            // Delete old image only after successful database update
            if (oldImagePath) {
              const { error: deleteError } = await supabase.storage
                .from("App-File-Storage")
                .remove([oldImagePath]);

              if (deleteError) {
                console.error("Failed to delete old image:", deleteError);
                // Don't throw error - the update was successful
              }
            }

            set((state) => ({
              users: state.users.map((user) =>
                user.user_account_id === updatedUser.user_account_id
                  ? {
                      ...updatedUser,
                      user_profile_image_url: imageUrl,
                      updated_at:
                        response.data.updated_at || new Date().toISOString(),
                    }
                  : user
              ),
              isLoading: false,
            }));
          } else {
            throw new Error(`Failed to update user: ${response.status}`);
          }
        } catch (error) {
          // If database update fails, delete the newly uploaded image
          if (
            updatedUser.user_profile_image_file &&
            imageUrl !== updatedUser.user_profile_image_url
          ) {
            const newPath = imageUrl.split("/user-images-uploads/")[1];
            if (newPath) {
              await supabase.storage
                .from("App-File-Storage")
                .remove([`user-images-uploads/${newPath}`]);
            }
          }

          const errorMessage =
            error instanceof Error ? error.message : "Failed to update user";
          set({ error: errorMessage, isLoading: false });
          console.error("Failed to update user:", error);
          throw error;
        }
      },

      // TODO PRIO : SUPABASE > add update img url of user

      // Delete single user
      deleteUser: async (username) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.delete(`/api/users/delete-user`, {
            data: { username },
          });
          if (response.status === 200 || response.status === 204) {
            set((state) => ({
              users: state.users.filter((user) => user.username !== username),
              selectedUsers: state.selectedUsers.filter(
                (id) => id !== username
              ),
              isLoading: false,
            }));
          } else {
            throw new Error(`Failed to delete user: ${response.status}`);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete user";
          set({ error: errorMessage, isLoading: false });
          console.error("Failed to delete user:", error);
          throw error;
        }
      },

      // Delete multiple users
      deleteMultipleUsers: async (userIds) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.delete(
            // TODO PRIO : link the delete multiple users on backend
            "/api/users/delete-multiple-users",
            {
              data: { user_ids: userIds },
            }
          );
          if (response.status === 200 || response.status === 204) {
            set((state) => ({
              users: state.users.filter(
                (user) => !userIds.includes(user.user_account_id)
              ),
              selectedUsers: state.selectedUsers.filter(
                (id) => !userIds.includes(id)
              ),
              isLoading: false,
            }));
          } else {
            throw new Error(`Failed to delete users: ${response.status}`);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete users";
          set({ error: errorMessage, isLoading: false });
          console.error("Failed to delete users:", error);
          throw error;
        }
      },

      // Selection management
      selectUser: (userId) => {
        set((state) => ({
          selectedUsers: state.selectedUsers.includes(userId)
            ? state.selectedUsers
            : [...state.selectedUsers, userId],
        }));
      },

      unselectUser: (userId) => {
        set((state) => ({
          selectedUsers: state.selectedUsers.filter((id) => id !== userId),
        }));
      },

      selectAllUsers: () => {
        set((state) => ({
          selectedUsers: state.users.map((user) => user.user_account_id),
        }));
      },

      unselectAllUsers: () => {
        set({ selectedUsers: [] });
      },

      toggleUserSelection: (userId) => {
        const { selectedUsers } = get();
        if (selectedUsers.includes(userId)) {
          get().unselectUser(userId);
        } else {
          get().selectUser(userId);
        }
      },

      // Utility functions
      getUserById: (userId) => {
        const { users } = get();
        return users.find((user) => user.user_account_id === userId);
      },

      clearError: () => set({ error: null }),

      reset: () =>
        set({
          users: [],
          isLoading: false,
          error: null,
          selectedUsers: [],
        }),
    }),
    {
      name: "user-store", // Name for devtools
    }
  )
);
