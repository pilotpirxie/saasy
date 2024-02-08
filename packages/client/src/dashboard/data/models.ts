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

export type Team = {
  id:          string;
  name:        string;
  deleteAfter: Date | null;
  createdAt:   Date;
  updatedAt:   Date;
  projects:      Project[];
  role:          "owner" | "member";
  plan: {
    name: string;
  }
}

