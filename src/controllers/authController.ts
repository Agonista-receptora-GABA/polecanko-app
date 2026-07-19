import type { Request, Response } from "express";
import { db } from "../db/connection.ts";
import { users, type NewUser } from "../db/schema.ts";
import { generateToken } from "../utils/jwt.ts";
import { comparePasswords, hashPassword } from "../utils/password.ts";
import { eq } from "drizzle-orm";
import { isProd } from "../../env.ts";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd(),
  sameSite: "lax" as const,
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

export async function register(req: Request<{}, {}, NewUser>, res: Response) {
  try {
    const hashedPassword = await hashPassword(req.body.password);

    const [user] = await db
      .insert(users)
      .values({
        ...req.body,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      });

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(201).json({
      message: "User created",
      user,
    });
  } catch (e) {
    console.error("Registration error", e);
    // TODO: Provide more valuable info based on the database result,
    //  e.g. if the user already exists.
    res.status(500).json({ error: "Failed to create user" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const isValidPassword = await comparePasswords(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      message: "Login success",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    console.error("Login error", e);
    res.status(500).json({ error: "Failed to login" });
  }
}
