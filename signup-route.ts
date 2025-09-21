// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { firstName, lastName, email, password } = await request.json();
        console.log('Signup request body:', { firstName, lastName, email });

        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json(
                { success: false, message: 'All fields are required.' },
                { status: 400 }
            );
        }

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User already exists.' },
                { status: 409 }
            );
        }

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create new user in PostgreSQL
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                passwordHash,
            },
        });

        console.log('User created successfully:', newUser.email);

        return NextResponse.json(
            {
                success: true,
                message: 'User created successfully.',
                user: {
                    id: newUser.id,
                    name: `${newUser.firstName} ${newUser.lastName}`,
                    email: newUser.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
