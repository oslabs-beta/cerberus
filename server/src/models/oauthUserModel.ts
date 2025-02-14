// import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// @Entity()
// export class User {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;

//   @Column({ nullable: true, unique: true })
//   githubId?: string;

//   @Column({ nullable: true, unique: true })
//   googleId?: string;

//   @Column()
//   email!: string;

//   @Column()
//   name!: string;

//   @Column({ nullable: true })
//   avatarUrl?: string;

//   @Column()
//   provider!: 'github' | 'google';
// }