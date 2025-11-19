import { BaseEntity } from './base.entity';

export class User extends BaseEntity {
  email: string;
  name: string;
  googleId: string;
  workspaceDomain: string;
  picture?: string;

  constructor(
    email: string,
    name: string,
    googleId: string,
    workspaceDomain: string,
    picture?: string,
    id?: string,
  ) {
    super(id);
    this.email = email;
    this.name = name;
    this.googleId = googleId;
    this.workspaceDomain = workspaceDomain;
    this.picture = picture;
  }
}

