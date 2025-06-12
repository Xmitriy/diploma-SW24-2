import { bucket } from "@/config/firebase";
import { v4 as uuidv4 } from "uuid";

export const uploadProfileImage = async (image: any, user?: any) => {
  if (user && user.image) {
    try {
      const oldImageUrl = new URL(user.image);
      // Extract the path after the bucket name
      const pathSegments = oldImageUrl.pathname.split("/");
      const oldImagePath = pathSegments.slice(2).join("/");
      if (oldImagePath) {
        const oldFile = bucket.file(oldImagePath);
        await oldFile.delete();
      }
    } catch (error: any) {
      console.error("Error deleting old image:", error.message);
    }
  }

  // Generate unique name
  const filename = `users/${user._id}/pfp-${uuidv4()}`;

  // Upload
  const file = bucket.file(filename);
  await file.save(image.buffer, {
    metadata: {
      contentType: image.mimetype,
    },
  });

  await file.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

  return publicUrl;
};

export const uploadBlogImage = async (image: any) => {
  const filename = `blogs/${uuidv4()}`;

  const file = bucket.file(filename);
  await file.save(image.buffer, {
    metadata: {
      contentType: image.mimetype,
    },
  });

  await file.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

  return publicUrl;
};
