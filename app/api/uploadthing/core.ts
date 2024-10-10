import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const { userId } = auth();
            if (!userId) {
                console.error("Unauthorized access attempt");
                throw new UploadThingError("Unauthorized");
            }
            console.log("User ID:", userId); // Log user ID for debugging
            return { userId: userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("File URL:", file.url);
            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

import { createRouteHandler } from "uploadthing/next";

export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
});
