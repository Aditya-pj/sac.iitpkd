// make a load function get list of clubs and returns an array of club names and ids
import { CREATE_ANNOUNCEMENT_URL, GET_CLUBS_URL } from "$lib/server/urls";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

// load clubs
export const load = async ({ cookies }) => {
    const response = await fetch(GET_CLUBS_URL, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if(response.ok) {
        const clubs = await response.json();
        return {clubs: clubs.map((club: any) => ({
            value: club.id,
            label: club.name
        }))};
    } else {
        throw redirect(302, '/serverdown');
    }
}

export const actions = {
    default: async ({ cookies, request }) => {
        const formData = await request.formData();
        const title = formData.get('title');
        const content = formData.get('content');
        const club = formData.get('club');
        if (!(title && content && club)) {
            return {
                success: false,
                message: "Invalid form data"
            };
        }
        const response = await fetch(CREATE_ANNOUNCEMENT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                content,
                club
            })
        })

        if(response.ok) {
            const {access_token} = await response.json();
            cookies.set('jwt', access_token, {path: '/', maxAge: 60 * 60 * 24 * 7});
            return redirect(302, '/dashboard');
        } else {
            return {
                success: false,
                message: "Invalid email or password"
            }
        }
    }
}