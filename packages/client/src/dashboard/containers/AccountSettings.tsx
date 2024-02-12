import { Navbar } from "./Navbar.tsx";
import { Footer } from "../components/Footer.tsx";
import { ScreenContainer } from "../../shared/containers/ScreenContainer.tsx";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { useEffect, useState } from "react";
import { PasswordInput } from "../../shared/components/FormInputs/PasswordInput.tsx";
import { EmailInput } from "../../shared/components/FormInputs/EmailInput.tsx";
import { NewProjectModal } from "./NewProjectModal.tsx";
import { useFetchAccountQuery, useFetchProfileQuery } from "../data/usersService.ts";

export const AccountSettings = () => {
  const profile = useFetchProfileQuery();
  const account = useFetchAccountQuery();

  const [displayName, setDisplayName] = useState("");

  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  const [isNewsletterConsentGranted, setIsNewsletterConsentGranted] = useState(false);
  const [isMarketingConsentGranted, setIsMarketingConsentGranted] = useState(false);

  const [isTwoFactorAuthEnabled, setIsTwoFactorAuthEnabled] = useState(false);

  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState(false);

  useEffect(() => {
    if (profile.data) {
      setDisplayName(profile.data.displayName);
      setFullName(profile.data.fullName || "");
      setAddress(profile.data.address || "");
      setPhone(profile.data.phone || "");
      setCountry(profile.data.country || "");
    }

    if (account.data) {
      setEmail(account.data.email);
      setIsNewsletterConsentGranted(account.data.newsletterConsentGrantedAt !== null);
      setIsMarketingConsentGranted(account.data.marketingConsentGrantedAt !== null);
      setIsTwoFactorAuthEnabled(account.data.totpAddedAt !== null);
    }
  }, [account.data, profile.data]);

  const handleChangeDisplayName = () => {
    // ...
  };

  const handleChangeEmail = () => {
    // ...
  };

  const handleChangePassword = () => {
    // ...
  };

  const handleChangeAddress = () => {
    // ...
  };

  const handleSaveConsent = () => {
    // ...
  };

  const handleEnableTwoFactorAuth = () => {
    // ...
  };

  const handleDisableTwoFactorAuth = () => {
    // ...
  };

  const handleDeleteAccount = () => {
    // ...
  };

  return <ScreenContainer>
    <Navbar />
    <NewProjectModal />

    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="mt-5">
            <h4>Profile & Account Settings</h4>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 d-none d-md-block">
          <div className="list-group">
            <a
              href="#display-name"
              className="list-group-item list-group-item-action"
            >Change Display Name</a>
            <a
              href="#email"
              className="list-group-item list-group-item-action"
            >Change Email</a>
            <a
              href="#password"
              className="list-group-item list-group-item-action"
            >Change Password</a>
            <a
              href="#address"
              className="list-group-item list-group-item-action"
            >Change Address</a>
            <a
              href="#newsletter-marketing"
              className="list-group-item list-group-item-action"
            >Newsletter & Marketing</a>
            <a
              href="#2fa"
              className="list-group-item list-group-item-action"
            >Two Factor Authentication</a>
            <a
              href="#delete"
              className="list-group-item list-group-item-action"
            >Delete Account</a>
          </div>
        </div>
        <div className="col-12 col-md-8">

          <div className="card card-body">
            <h5 id="display-name">Change Display Name</h5>
            <div>
              <TextInput
                label="Display Name"
                value={displayName}
                onChange={setDisplayName}
              />

              <button
                className="btn btn-sm btn-primary mt-2"
                type="button"
              >
                Change display name
              </button>
            </div>
          </div>

          <div className="card card-body mt-3">
            <h5 id="email">Change Email</h5>
            <div>
              <EmailInput
                label="Email"
                value={email}
                onChange={setEmail}
              />

              <button
                className="btn btn-sm btn-primary mt-2"
                type="button"
              >
                Change email
              </button>
            </div>
          </div>

          <div className="card card-body mt-3">
            <h5 id="password">Change Password</h5>
            <div>
              <PasswordInput
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
              />
              <PasswordInput
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
              />
              <button
                className="btn btn-sm btn-primary mt-2"
                type="button"
              >
                Change password
              </button>
            </div>
          </div>

          <div className="card card-body mt-3">
            <h5 id="address">Change Address</h5>
            <div>
              <TextInput
                label="Full Name"
                value={fullName}
                onChange={setFullName}
              />
              <TextInput
                label="Address"
                value={address}
                onChange={setAddress}
              />
              <TextInput
                label="Phone"
                value={phone}
                onChange={setPhone}
              />
              <TextInput
                label="Country"
                value={country}
                onChange={setCountry}
              />
              <button
                className="btn btn-sm btn-primary mt-2"
                type="button"
              >
                Change address
              </button>
            </div>
          </div>

          <div className="card card-body mt-3">
            <h5 id="newsletter-marketing">Newsletter & Marketing</h5>
            <div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="newsletterConsent"
                  checked={isNewsletterConsentGranted}
                  onChange={(e) => setIsNewsletterConsentGranted(e.target.checked)}
                />
                <label
                  className="form-check-label"
                  htmlFor="newsletterConsent"
                >
                  I consent to receive newsletters
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="marketingConsent"
                  checked={isMarketingConsentGranted}
                  onChange={(e) => setIsMarketingConsentGranted(e.target.checked)}
                />
                <label
                  className="form-check-label"
                  htmlFor="marketingConsent"
                >
                  I consent to receive marketing emails
                </label>
              </div>
              <button
                className="btn btn-sm btn-primary mt-2"
                type="button"
              >
                Save consent
              </button>
            </div>
          </div>

          <div className="card card-body mt-3">
            <h5 id="2fa">Two Factor Authentication</h5>
            <div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="twoFactorAuth"
                  checked={isTwoFactorAuthEnabled}
                  onChange={(e) => setIsTwoFactorAuthEnabled(e.target.checked)}
                />
                <label
                  className="form-check-label"
                  htmlFor="twoFactorAuth"
                >
                  Enable two factor authentication
                </label>
              </div>
            </div>
          </div>

          <div className="card card-body mt-3">
            <h5 id="delete">Delete Account</h5>
            <div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="deleteAccountConfirmation"
                  checked={deleteAccountConfirmation}
                  onChange={(e) => setDeleteAccountConfirmation(e.target.checked)}
                />
                <label
                  className="form-check-label"
                  htmlFor="deleteAccountConfirmation"
                >
                  I understand that this action is irreversible even if I change my mind later. You must delete or leave all your teams and projects before you can delete your account.
                </label>
              </div>
              <button
                className="btn btn-sm btn-danger mt-2"
                type="button"
              >
                Delete account
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
    <Footer/>
  </ScreenContainer>;
};