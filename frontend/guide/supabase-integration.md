function

```typescript
const handleFileUpload = async () => {
  if (!selectedFile) return showError("Please select an image");
  if (!user) return showError("Please select a user");
  setUploading(true);

  try {
    //? Delete previous image if it exists
    if (user?.userImage) {
      const previousFileName = user.userImage.split("/").pop();
      const previousFilePath = `user-images-uploads/${previousFileName}`;

      const { error: deleteError } = await supabase.storage
        .from("App-File-Storage")
        .remove([previousFilePath]);

      if (deleteError) return showError(deleteError.message);
    }

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${user.user_id}_${Date.now()}.${fileExt}`;
    const filePath = `user-images-uploads/${fileName}`;

    //? Upload file
    const { error: uploadError } = await supabase.storage
      .from("App-File-Storage")
      .upload(filePath, selectedFile);

    if (uploadError) return showError(uploadError.message);

    //? Get the public URL
    const { data: urlData } = supabase.storage
      .from("App-File-Storage")
      .getPublicUrl(filePath);
    if (!urlData || urlData.error) return showError(urlData.error.message);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/users/save-user-img/${user.user_id}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authHeader}`,
        },
        body: JSON.stringify({
          image: urlData.publicUrl,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) return showError(data.message);

    //? Refetch the user data to update selectedUser
    const updatedUserResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/api/users/user-info/${user.user_id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `${authHeader}`,
        },
      }
    );

    const updatedUserData = await updatedUserResponse.json();
    if (!updatedUserResponse.ok) {
      return showError(updatedUserData.message);
    }

    //? Reset file selection
    setSelectedFile(null);
    setImagePreview(defaultImg);
    fetchUserById(user.user_id);
    showSuccess("Image uploaded successfully");
  } catch (error) {
    showError(error.message);
  } finally {
    setUploading(false);
  }
};
```

---

supabase.js

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANONKEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```
