"use client";
import React, { useState } from "react";
import {
  Button,
  Select,
  useConfig,
  toast,
  TextInput,
} from "@payloadcms/ui";
import { Loader2, Copy, XIcon } from "lucide-react";
import { useTranslation, Modal, useModal } from "@payloadcms/ui";
import "./index.scss";
import type { Option } from "@payloadcms/ui/elements/ReactSelect";
import { usePathname } from "next/navigation";
const baseClass = "admin-invite-modal";

const AdminInviteButton: React.FC = () => {
  const [role, setRole] = useState<Option | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopyLoading, setIsCopyLoading] = useState(false);
  const { toggleModal } = useModal();
  const pathname = usePathname();

  const i18n = useTranslation();
  const {
    getEntityConfig,
    config: {
      serverURL,
      routes: { api: apiRoute, admin: adminRoute },
      admin: { user: userSlug },
    },
  } = useConfig();
  if(pathname !== `${adminRoute}/collections/${userSlug}`) return null;
  const userCollection = getEntityConfig({ collectionSlug: "users" });
  const { fields: userFields } = userCollection;
  const roleField = userFields.find((field) => 'name' in field && field.name === "role");
  let roleOptions: { label: string; value: string }[] = [];
  if(roleField && 'options' in roleField) {
    roleOptions = roleField.options.map((option: any) => ({
      label: option.label,
      value: option.value,
    }));
  }

  const handleGenerateInvite = async () => {  
    try {
      setIsLoading(true);
      const response = await fetch(
        `${serverURL}${apiRoute}/${userSlug}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to generate invite");

      const data = await response.json();
      setInviteLink(data.inviteLink);
      setIsLoading(false);
      return data.inviteLink;
    } catch (error) {
      toast.error("Failed to generate invite link");
      setIsLoading(false);
      return null;
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${serverURL}${apiRoute}/${userSlug}/invite/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, role }),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to send invite");

      toast.success("Invite sent successfully");
      setIsLoading(false);
      toggleModal("admin-invite-modal");
    } catch (error) {
      toast.error("Failed to send invite email");
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      setIsCopyLoading(true);
      let linkToCopy = inviteLink;
      
      if (!linkToCopy) {
        linkToCopy = await handleGenerateInvite();
      }
      
      if (linkToCopy) {
        await navigator.clipboard.writeText(linkToCopy);
        toast.success("Invite link copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to copy invite link");
    } finally {
      setIsCopyLoading(false);
    }
  };

  const handleToggleModal = () => {
    toggleModal("admin-invite-modal");
  };

  return (
    <>
      <Button
        onClick={handleToggleModal}
        type="button"
        size="medium"
        buttonStyle="primary"
        className="admin-invite-button">
        Invite User
      </Button>
      <Modal slug="admin-invite-modal" className={`${baseClass}`} closeOnBlur>
        <div className={`${baseClass}__wrapper`}>
          <Button
            onClick={handleToggleModal}
            buttonStyle="icon-label"
            size="small"
            className={`${baseClass}__close-button`}
          >
            <XIcon size={24} />
          </Button>
          <div className={`${baseClass}__content`} style={{ maxWidth: '38rem' }}>
            <h1>Invite User</h1>
            <p>
              Invite a user to your application. Select the role of the user and
              send the invite via email or copy the invite link.
            </p>
            <Select 
              options={roleOptions} 
              value={role} 
              placeholder="Select Role"
              onChange={(option: any) => setRole(option)} 
            />
            
            <div className={`${baseClass}__invite-controls`}>
              <div className={`${baseClass}__email-field`}>
                <TextInput
                  label="Email Address"
                  path="email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              
              <div className={`${baseClass}__buttons`}>
                <Button 
                  type="button" 
                  onClick={handleSendEmail}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 size={24} className="animate-spin mr-2" /> : null}
                  Send Email
                </Button>
                
                <Button
                  size="medium"
                  buttonStyle="transparent"
                  className={`${baseClass}__copy-button`}
                  type="button"
                  onClick={handleCopyLink}
                  disabled={isCopyLoading}
                >
                  {isCopyLoading ? <Loader2 size={20} strokeWidth={1.5} className="animate-spin" /> : <Copy size={20} strokeWidth={1.5} />}
                  Generate Link</Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminInviteButton;
