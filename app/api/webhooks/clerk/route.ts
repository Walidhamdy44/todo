import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    // Get the webhook secret from environment
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('CLERK_WEBHOOK_SECRET is not set');
        return new Response('Webhook secret not configured', { status: 500 });
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Missing svix headers', { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the webhook
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error verifying webhook', { status: 400 });
    }

    // Handle the webhook event
    const eventType = evt.type;

    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        const email = email_addresses?.[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(' ') || null;

        if (!email) {
            console.error('No email found for user:', id);
            return new Response('No email found', { status: 400 });
        }

        try {
            await db.user.create({
                data: {
                    clerkUserId: id,
                    email,
                    name,
                    imageUrl: image_url,
                },
            });

            console.log(`User created: ${id}`);
            return new Response('User created', { status: 201 });
        } catch (error) {
            console.error('Error creating user:', error);
            return new Response('Error creating user', { status: 500 });
        }
    }

    if (eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        const email = email_addresses?.[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(' ') || null;

        try {
            await db.user.update({
                where: { clerkUserId: id },
                data: {
                    email: email || undefined,
                    name,
                    imageUrl: image_url,
                },
            });

            console.log(`User updated: ${id}`);
            return new Response('User updated', { status: 200 });
        } catch (error) {
            console.error('Error updating user:', error);
            return new Response('Error updating user', { status: 500 });
        }
    }

    if (eventType === 'user.deleted') {
        const { id } = evt.data;

        if (!id) {
            return new Response('No user id', { status: 400 });
        }

        try {
            await db.user.delete({
                where: { clerkUserId: id },
            });

            console.log(`User deleted: ${id}`);
            return new Response('User deleted', { status: 200 });
        } catch (error) {
            console.error('Error deleting user:', error);
            // User might not exist in DB, which is fine
            return new Response('User deleted', { status: 200 });
        }
    }

    return new Response('Webhook received', { status: 200 });
}
