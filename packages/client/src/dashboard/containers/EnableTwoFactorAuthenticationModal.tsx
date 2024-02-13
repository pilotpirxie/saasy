import { useEffect, useState } from "react";
import { Modal } from "../components/Modal/Modal.tsx";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { closeEnableTwoFactorAuthenticationModal } from "../data/dashboardSlice.ts";
import { QRCodeSVG } from "qrcode.react";
import { useEnableTwoFactorAuthenticationMutation, useFetchProfileQuery } from "../data/usersService.ts";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { getErrorRTKQuery } from "../../shared/utils/errorMessages.ts";
import base32Encode from "base32-encode";

export const EnableTwoFactorAuthenticationModal = () => {
  const dashboardState = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const profileData = useFetchProfileQuery();

  const [enableTwoFactorAuthentication, {
    isError: isEnablingTwoFactorAuthenticationError,
    error: enablingTwoFactorAuthenticationError,
  }] = useEnableTwoFactorAuthenticationMutation();

  const handleClose = () => {
    dispatch(closeEnableTwoFactorAuthenticationModal());
  };

  useEffect(() => {
    setCode("");
    const tempToken = window.crypto.getRandomValues(new Uint8Array(10));
    setToken(base32Encode(tempToken, "RFC4648"));
  }, [dashboardState.isEnableTwoFactorAuthenticationModalOpen]);

  const handleContinue = async () => {
    try {
      if (!code || !token) {
        return;
      }

      await enableTwoFactorAuthentication({ totpCode: code, totpToken: token }).unwrap();
      handleClose();
    } catch (err) {
      console.warn(err);
    }
  };

  return <Modal
    show={dashboardState.isEnableTwoFactorAuthenticationModalOpen}
    onClose={handleClose}
    title="Enable two-factor authentication"
    footerChildren={<button
      className="btn btn-sm btn-primary"
      onClick={handleContinue}
    >
      Continue
    </button>}
  >
    <div>
      {isEnablingTwoFactorAuthenticationError && <ErrorMessage message={getErrorRTKQuery(enablingTwoFactorAuthenticationError)} />}

      <div className="d-flex align-items-center mb-3 flex-column">
        <QRCodeSVG
          size={200}
          value={`otpauth://totp/MyApp:${profileData.data?.displayName}?secret=${token}&issuer=MyApp`}
        />
        <div>
          {token}
        </div>
      </div>
      <div className="small">Scan the QR code with your authenticator app and enter the code to enable two-factor
        authentication.
      </div>

      <TextInput
        label="Code"
        value={code}
        onChange={setCode}
      />
    </div>


  </Modal>;
};