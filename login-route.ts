import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb'; // Import dbConnect to initialize the database connection
import User from '../../../../models/User'; // Import the Mongoose User model
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
// Define the handler for POST requests


const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { firstName, lastName, email, password } = await request.json();

        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ success: false, message: 'Email already registered.' }, { status: 409 });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Store user in PostgreSQL
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                passwordHash,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Signup successful.',
            user: {
                id: newUser.id,
                name: `${newUser.firstName} ${newUser.lastName}`,
                email: newUser.email,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}