import { Navbar } from "./Navbar.tsx";
import { Footer } from "../components/Footer.tsx";
import { ScreenContainer } from "../../shared/containers/ScreenContainer.tsx";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { useEffect, useState } from "react";
import { PasswordInput } from "../../shared/components/FormInputs/PasswordInput.tsx";
import { EmailInput } from "../../shared/components/FormInputs/EmailInput.tsx";
import { NewProjectModal } from "./NewProjectModal.tsx";
import {
  useDeleteAccountMutation,
  useFetchAccountQuery,
  useFetchProfileQuery,
  useUpdateAddressMutation,
  useUpdateConsentsMutation,
  useUpdateDisplayNameMutation,
  useUpdateEmailMutation,
  useUpdatePasswordMutation
} from "../data/usersService.ts";
import { useLogoutMutation } from "../../auth/data/authService.ts";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store.ts";

export const AccountSettings = () => {
  const profile = useFetchProfileQuery();
  const account = useFetchAccountQuery();

  const [displayName, setDisplayName] = useState("");

  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  const [isNewsletterConsentGranted, setIsNewsletterConsentGranted] = useState(false);
  const [isMarketingConsentGranted, setIsMarketingConsentGranted] = useState(false);

  const [isTwoFactorAuthEnabled, setIsTwoFactorAuthEnabled] = useState(false);

  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState(false);

  const navigate = useNavigate();
  const sessionState = useAppSelector((state) => state.session);

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

  const [
    updateProfileAddress,
  ] = useUpdateAddressMutation();

  const [
    updateProfileDisplayName,
  ] = useUpdateDisplayNameMutation();

  const [
    updateProfileEmail,
  ] = useUpdateEmailMutation();

  const [
    updatePassword,
  ] = useUpdatePasswordMutation();

  const [
    updateConsents,
  ] = useUpdateConsentsMutation();

  const [
    deleteAccount,
  ] = useDeleteAccountMutation();

  const [
    logout,
  ] = useLogoutMutation();

  const handleChangeDisplayName = () => {
    if (!displayName) {
      return;
    }

    updateProfileDisplayName({ displayName });
  };

  const handleChangeEmail = () => {
    if (!email) {
      return;
    }

    updateProfileEmail({ email });
  };

  const handleChangePassword = () => {
    if (newPassword !== repeatNewPassword) {
      return;
    }

    if (newPassword.length < 8) {
      return;
    }

    updatePassword({ newPassword });
  };

  const handleChangeAddress = () => {
    updateProfileAddress({ address, country, phone, fullName });
  };

  const handleSaveConsent = () => {
    updateConsents({ newsletterConsent: isNewsletterConsentGranted, marketingConsent: isMarketingConsentGranted });
  };

  const handleEnableTwoFactorAuth = () => {
    // ...
  };

  const handleDisableTwoFactorAuth = () => {
    // ...
  };

  const handleDeleteAccount = () => {
    if (!deleteAccountConfirmation) {
      return;
    }

    deleteAccount();

    if (!sessionState.refreshToken) {
      return;
    }

    logout({
      refreshToken: sessionState.refreshToken
    });

    navigate("/auth/login");
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
            >
              <span className="ri-user-line me-2" />
              Change Display Name
            </a>
            <a
              href="#email"
              className="list-group-item list-group-item-action"
            >
              <span className="ri-mail-line me-2" />
              Change Email
            </a>
            {account.data?.authProviderType === "email" && <a
              href="#password"
              className="list-group-item list-group-item-action"
            >
              <span className="ri-lock-line me-2" />
              Change Password
            </a>}

            <a
              href="#address"
              className="list-group-item list-group-item-action"
            >
              <span className="ri-map-pin-line me-2" />
              Change Address
            </a>
            <a
              href="#newsletter-marketing"
              className="list-group-item list-group-item-action"
            >
              <span className="ri-news-line me-2" />
              Newsletter & Marketing
            </a>
            <a
              href="#2fa"
              className="list-group-item list-group-item-action"
            >
              <span className="ri-shield-check-line me-2" />
              Two Factor Authentication
            </a>
            <a
              href="#delete"
              className="list-group-item list-group-item-action"
            >
              <span className="ri-delete-bin-line me-2" />
              Delete Account
            </a>
          </div>
        </div>
        <div className="col-12 col-md-8">

          <div className="card card-body">
            <h5 id="display-name">
              <span className="ri-user-line me-2" />
              Change Display Name
            </h5>
            <div>
              <TextInput
                label="Display Name"
                value={displayName}
                onChange={setDisplayName}
              />

              <button
                className="btn btn-sm btn-primary mt-2"
                type="button"
                onClick={handleChangeDisplayName}
              >
                Change display name
              </button>
            </div>
          </div>

          <div className="card card-body mt-3">
            <h5 id="email">
              <span className="ri-mail-line me-2" />
              Change Email
            </h5>
            <div>
              <EmailInput
                label="Email"
                value={email}
                onChange={setEmail}
              />

              <button
                className="btn btn-sm btn-primary mt-2"
                type="button"
                onClick={handleChangeEmail}
              >
                Change email
              </button>
            </div>
          </div>

          {account.data?.authProviderType === "email" && <div className="card card-body mt-3">
            <h5 id="password">
              <span className="ri-lock-line me-2" />
              Change Password
            </h5>
            <div>
              <PasswordInput
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
              />
              <PasswordInput
                label="Repeat new password"
                value={repeatNewPassword}
                onChange={setRepeatNewPassword}
              />
              <button
                className="btn btn-sm btn-primary mt-2"
                type="button"
                onClick={handleChangePassword}
              >
                Change password
              </button>
            </div>
          </div>}

          <div className="card card-body mt-3">
            <h5 id="address">
              <span className="ri-map-pin-line me-2" />
              Change Address
            </h5>
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
                onClick={handleChangeAddress}
              >
                Change address
              </button>
            </div>
          </div>

          <div className="card card-body mt-3">
            <h5 id="newsletter-marketing">
              <span className="ri-news-line me-2" />
              Newsletter & Marketing
            </h5>
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
                onClick={handleSaveConsent}
              >
                Save consent
              </button>
            </div>
          </div>

          <div className="card card-body mt-3">
            <h5 id="2fa">
              <span className="ri-shield-check-line me-2" />
              Two Factor Authentication
            </h5>
            <div>
              {isTwoFactorAuthEnabled && <div>
                <div>Two factor authentication is enabled</div>
                <button
                  className="btn btn-sm btn-danger"
                  type="button"
                  onClick={handleDisableTwoFactorAuth}
                >
                  Disable two factor authentication
                </button>
              </div>}

              {!isTwoFactorAuthEnabled && <div>
                <div>Two factor authentication is disabled</div>
                <button
                  className="btn btn-sm btn-primary"
                  type="button"
                  onClick={handleEnableTwoFactorAuth}
                >
                  Enable two factor authentication
                </button>
              </div>}
            </div>
          </div>

          <div className="card card-body mt-3">
            <h5 id="delete">
              <span className="ri-delete-bin-line me-2" />
              Delete Account
            </h5>
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
                onClick={handleDeleteAccount}
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