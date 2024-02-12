export type Profile = {
  displayName: string;
  avatarUrl:   string;
  country:     string;
  address:     string;
  phone:       string;
  fullName:    string;
}

export type Account = {
  email: string;
  emailVerifiedAt: Date;
  authProviderType: "email" | "google" | "github";
}

export type Project = {
  id:          string;
  teamId:     string;
  name:        string;
  deleteAfter: Date | null;
  createdAt:   Date;
  updatedAt:   Date;
}

export type Role = "owner" | "editor" | "viewer";

export type Team = {
  id:          string;
  name:        string;
  deleteAfter: Date | null;
  createdAt:   Date;
  updatedAt:   Date;
  projects:      Project[];
  role:          Role;
  plan: {
    name: string;
  }
}

export type UserTeam = {
  userId:    string;
  teamId:    string;
  role:      Role;
  createdAt: Date;
  updatedAt: Date;
  user:      TeamMember;
}

export type TeamMember = {
  id:          string;
  email:       string;
  displayName: string;
}

export type InvitedUser = {
  id:         string;
  email:      string;
  invitedBy:  string;
  teamId:     string;
  role:       Role;
  acceptedAt: null;
  expiresAt:  Date;
  createdAt:  Date;
  updatedAt:  Date;
}

export type Invitation = {
  id:        string;
  expiresAt: Date;
  role:      string;
  team:      {
    id:   string;
    name: string;
  }
}

