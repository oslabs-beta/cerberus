import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity("oauth_users")
export class OauthUser extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  githubId!: string;

  @Column({ type: "varchar", nullable: true })
  email?: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  avatarUrl?: string;
}