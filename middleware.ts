import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

const publicRoutes = [
    '/',
    '/hotel-details/:id',
    '/api/uploadthing',

];

export const config = {
    matcher: [
        // Exclude Next.js internals, static files, și rutele publice definite
        `/(?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)${publicRoutes.join('|')}).*`,
        // Aplică middleware-ul pentru toate rutele API
        '/(api|trpc)(.*)',
    ],
};
