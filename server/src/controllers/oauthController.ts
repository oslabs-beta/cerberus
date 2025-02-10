import { Request, Response } from "express";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import { OauthUser } from "../models/oauthUserModel";

const CLIENT_ID = process.env.VITE_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;


export const getAccessToken = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    

    if (state !== req.session.oauthState) {
      return res.status(403).json({ error: "Invalid state parameter" });
    }

    const params = new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      code: code as string,
    });

    const response = await fetch(
      `https://github.com/login/oauth/access_token?${params}`,
      {
        method: "POST",
        headers: { Accept: "application/json" },
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error_description);
    res.json(data);
  } catch (err) {
    console.error("Access token error:", err);
    res.status(500).json({ error: "Failed to get access token" });
  }
};


export const upsertUser = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    

    const tokenRes = await fetch(
      `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`,
      { method: "POST", headers: { Accept: "application/json" } }
    );
    const tokenData = await tokenRes.json();

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${tokenData.access_token}` },
    });
    const profile = await userRes.json();


    const emailRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `token ${tokenData.access_token}` },
    });
    const emails = await emailRes.json();
    const primaryEmail = emails.find((e: any) => e.primary)?.email;


    const user = await OauthUser.upsert(
      {
        githubId: profile.id.toString(),
        name: profile.name || profile.login,
        email: primaryEmail,
        avatarUrl: profile.avatar_url,
      },
      { conflictPaths: ["githubId"], skipUpdateIfNoValuesChanged: true }
    );

   
    const token = jwt.sign(
      { userId: user.generatedMaps[0].id },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Upsert error:", err);
    if ((err as any).code === "23505") {
      return res.status(409).json({ error: "User already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};