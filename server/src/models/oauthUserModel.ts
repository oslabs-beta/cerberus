import mongoose, { Document, Schema } from 'mongoose';

interface OauthUser extends Document {
  githubId: string;
  email?: string;
  name: string;
  avatarUrl?: string;
}

const oauthUserSchema: Schema<OauthUser> = new Schema(
  {
    githubId: { type: String, required: true, unique: true },
    email: { type: String },
    name: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

const OauthUser = mongoose.model<OauthUser>('OauthUser', oauthUserSchema);

export default OauthUser;
