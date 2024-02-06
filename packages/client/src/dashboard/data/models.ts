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