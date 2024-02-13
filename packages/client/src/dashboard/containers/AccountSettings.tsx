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
  useDisableTwoFactorAuthenticationMutation,
  useFetchAccountQuery,
  useFetchProfileQuery,
  useUpdateAddressMutation,
  useUpdateConsentsMutation,
  useUpdateDisplayNameMutation,
  useUpdateEmailMutation,
  useUpdatePasswordMutation,
  useVerifyEmailChangeMutation
} from "../data/usersService.ts";
import { useLogoutMutation } from "../../auth/data/authService.ts";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { getErrorRTKQuery } from "../../shared/utils/errorMessages.ts";
import { CheckboxInput } from "../../shared/components/FormInputs/CheckboxInput.tsx";
import { openEnableTwoFactorAuthenticationModal } from "../data/dashboardSlice.ts";
import { EnableTwoFactorAuthenticationModal } from "./EnableTwoFactorAuthenticationModal.tsx";

export const AccountSettings = () => {
  const profile = useFetchProfileQuery();
  const account = useFetchAccountQuery();

  const [displayName, setDisplayName] = useState("");

  const [email, setEmail] = useState("");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [isWaitingForCode, setIsWaitingForCode] = useState(false);

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
  const dispatch = useAppDispatch();

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
    {
      isError: isUpdatingAddressError,
      error: updateAddressError,
      isLoading: isUpdatingAddressLoading
    }
  ] = useUpdateAddressMutation();

  const [
    updateProfileDisplayName,
    {
      isError: isUpdatingDisplayNameError,
      error: updateDisplayNameError,
      isLoading: isUpdatingDisplayNameLoading
    }
  ] = useUpdateDisplayNameMutation();

  const [
    updateProfileEmail,
    {
      isError: isUpdatingEmailError,
      error: updateEmailError,
      isLoading: isUpdatingEmailLoading
    }
  ] = useUpdateEmailMutation();

  const [
    verifyEmailChange,
    {
      isError: isVerifyingEmailError,
      error: verifyEmailError,
      isLoading: isVerifyingEmailLoading
    }
  ] = useVerifyEmailChangeMutation();

  const [
    updatePassword,
    {
      isError: isUpdatingPasswordError,
      error: updatePasswordError,
      isLoading: isUpdatingPasswordLoading
    }
  ] = useUpdatePasswordMutation();

  const [
    updateConsents,
    {
      isError: isUpdatingConsentsError,
      error: updateConsentsError,
      isLoading: isUpdatingConsentsLoading
    }
  ] = useUpdateConsentsMutation();

  const [
    deleteAccount,
    {
      isError: isDeletingAccountError,
      error: deleteAccountError,
      isLoading: isDeletingAccountLoading
    }
  ] = useDeleteAccountMutation();

  const [
    logout,
  ] = useLogoutMutation();

  const [
    disableTwoFactorAuth,
  ] = useDisableTwoFactorAuthenticationMutation();

  const handleChangeDisplayName = () => {
    if (!displayName) {
      return;
    }

    updateProfileDisplayName({ displayName });
  };

  const handleChangeEmail = async () => {
    try {
      if (!email) {
        return;
      }

      await updateProfileEmail({ newEmail: email }).unwrap();
      setIsWaitingForCode(true);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      if (!emailVerificationCode) {
        return;
      }

      await verifyEmailChange({ code: emailVerificationCode }).unwrap();
      setIsWaitingForCode(false);
    } catch (e) {
      console.warn(e);
    }
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
    dispatch(openEnableTwoFactorAuthenticationModal());
  };

  const handleDisableTwoFactorAuth = () => {
    disableTwoFactorAuth();
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
    <EnableTwoFactorAuthenticationModal />

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
              {(isUpdatingDisplayNameError) && <ErrorMessage message={getErrorRTKQuery(updateDisplayNameError)}/>}

              <TextInput
                label="Display Name"
                value={displayName}
                onChange={setDisplayName}
              />

              <button
                className="btn btn-sm btn-primary mt-2"
                type="button"
                onClick={handleChangeDisplayName}
                disabled={isUpdatingDisplayNameLoading}
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
              {(isUpdatingEmailError || isVerifyingEmailError) && <ErrorMessage message={getErrorRTKQuery(updateEmailError || verifyEmailError)}/>}

              {!(isUpdatingEmailError || isVerifyingEmailError) && isWaitingForCode && <div className="alert alert-info">
                We sent a verification code to your new email. Please check your inbox and enter the code below.
              </div>}

              <EmailInput
                label="Email"
                value={email}
                onChange={setEmail}
                disabled={isWaitingForCode}
              />

              {!isWaitingForCode && <button
                className="btn btn-sm btn-primary mt-2"
                type="button"
                onClick={handleChangeEmail}
                disabled={isUpdatingEmailLoading}
              >
                Change email
              </button>}

              {isWaitingForCode && <div>
                <TextInput
                  label="Verification code"
                  value={emailVerificationCode}
                  onChange={setEmailVerificationCode}
                />
                <button
                  className="btn btn-sm btn-primary mt-2"
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={isVerifyingEmailLoading}
                >
                  Verify email
                </button>
              </div>}
            </div>
          </div>

          {account.data?.authProviderType === "email" && <div className="card card-body mt-3">
            <h5 id="password">
              <span className="ri-lock-line me-2" />
              Change Password
            </h5>
            <div>
              {(isUpdatingPasswordError) && <ErrorMessage message={getErrorRTKQuery(updatePasswordError)}/>}

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
                disabled={isUpdatingPasswordLoading}
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
              {(isUpdatingAddressError) && <ErrorMessage message={getErrorRTKQuery(updateAddressError)}/>}

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
                disabled={isUpdatingAddressLoading}
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
              {(isUpdatingConsentsError) && <ErrorMessage message={getErrorRTKQuery(updateConsentsError)}/>}

              <CheckboxInput
                label="I consent to receive newsletters"
                value={isNewsletterConsentGranted}
                onChange={setIsNewsletterConsentGranted}
              />

              <CheckboxInput
                label="I consent to receive marketing emails"
                value={isMarketingConsentGranted}
                onChange={setIsMarketingConsentGranted}
              />

              <button
                className="btn btn-sm btn-primary mt-2"
                type="button"
                onClick={handleSaveConsent}
                disabled={isUpdatingConsentsLoading}
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
              {(isDeletingAccountError) && <ErrorMessage message={getErrorRTKQuery(deleteAccountError)}/>}

              <CheckboxInput
                label="I understand that this action is irreversible even if I change my mind later. You must delete or leave all your teams and projects before you can delete your account."
                value={deleteAccountConfirmation}
                onChange={setDeleteAccountConfirmation}
                required
              />

              <button
                className="btn btn-sm btn-danger mt-2"
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccountLoading}
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