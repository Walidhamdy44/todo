import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * Get the current user from the database.
 * Creates the user if they don't exist (for users who signed up before webhook was set up).
 */
export async function getCurrentUser() {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    // Try to find existing user
    let user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    // If user doesn't exist, create them (handles pre-webhook signups)
    if (!user) {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return null;
        }

        const email = clerkUser.emailAddresses?.[0]?.emailAddress;
        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;

        if (!email) {
            console.error('No email found for Clerk user:', userId);
            return null;
        }

        user = await db.user.create({
            data: {
                clerkUserId: userId,
                email,
                name,
                imageUrl: clerkUser.imageUrl,
            },
        });
    }

    return user;
}

/**
 * Require authentication for API routes.
 * Returns the user or throws an error.
 */
export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    return user;
}

/**
 * Get just the user ID without fetching full user data.
 * Useful for simpler queries.
 */
export async function getCurrentUserId() {
    const user = await getCurrentUser();
    return user?.id ?? null;
}
