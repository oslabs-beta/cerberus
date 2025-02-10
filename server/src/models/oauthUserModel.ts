import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class OauthUser extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  githubId!: string;

  @Column({ nullable: true })
  email?: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  avatarUrl?: string;
}