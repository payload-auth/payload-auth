"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Select,
  TextField,
  useConfig,
  toast,
  TabsField,
  CloseMenuIcon,
  XIcon,
  CopyIcon,
  TextInput,
} from "@payloadcms/ui";
import { Copy, Mail, Plus, X } from "lucide-react";
import { useTranslation, Modal, useModal } from "@payloadcms/ui";
import "./index.scss";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "../tabs";
const baseClass = "admin-invite-modal";

const tabs = [
  {
    name: "Send Email",
    value: "send-email",
    content: "Send an email to the admin with a link to sign in.",
  },
  {
    name: "Copy Link",
    value: "copy-link",
    content: "Copy the invite link to your clipboard.",
  },
];

const AdminInviteButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toggleModal } = useModal();

  const i18n = useTranslation();
  const {
    config: {
      serverURL,
      routes: { api: apiRoute },
      admin: { user: userSlug },
    },
  } = useConfig();

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
    } catch (error) {
      toast.error("Failed to generate invite link");
      setIsLoading(false);
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
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to send invite email");
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard");
    }
  };

  const handleToggleModal = () => {
    toggleModal("admin-invite-modal");
  };

  //   const componentRef = useRef<HTMLDivElement | null>(null);

  //   useEffect(() => {
  //     if (componentRef.current) {
  //       const parentNode = componentRef.current.parentNode as HTMLElement;
  //       if (
  //         parentNode &&
  //         parentNode.classList &&
  //         parentNode.classList.contains("collection-list__sub-header")
  //       ) {
  //         // Option 1: Remove the class
  //         parentNode.classList.remove("collection-list__sub-header");

  //         // Option 2: Or copy your content to a new element and replace the parent
  //         // This is more extreme and might cause issues
  //       }
  //     }
  //   }, []);

  return (
    <div className="test-description">
      <Button
        onClick={handleToggleModal}
        type="button"
        size="small"
        buttonStyle="pill"
      >
        Invite User
      </Button>
      <Modal slug="admin-invite-modal" className={`${baseClass}`}>
        <div className={`${baseClass}__wrapper`}>
          <Button
            onClick={handleToggleModal}
            buttonStyle="icon-label"
            size="small"
            className={`${baseClass}__close-button`}
          >
            <XIcon />
          </Button>
          <div className={`${baseClass}__content`}>
            <h1>Invite User</h1>
            <p>
              Invite a user to your application. Select the role of the user and
              either send the invite via email or copy the link and send
              manually.
            </p>
            <Select
              options={[
                { label: "Admin", value: "admin" },
                { label: "Editor", value: "editor" },
                { label: "User", value: "user" },
              ]}
            />
            <Tabs defaultValue={"email"}>
              <TabsList>
                <TabsTrigger value={"email"}>
                  <span>Send Email</span>
                </TabsTrigger>
                <TabsTrigger value={"link"}>
                  <span>Copy Link</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value={"email"}>
                <div className={`${baseClass}__tabs-content-email`}>
                  <TextInput
                    path="email"
                    onChange={(e: any) => setEmail(e.target.value)}
                  />
                  <Button type="button" onClick={handleSendEmail}>
                    Send Email
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value={"link"}>
                <div className={`${baseClass}__tabs-content-link`}>
                  <code className="text-[13px]">
                    Copy the invite link to your clipboard.
                  </code>
                  <Button
                    size="small"
                    buttonStyle="icon-label"
                    className={`${baseClass}__copy-button`}
                    type="button"
                    onClick={handleCopyLink}
                  >
                    <CopyIcon />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminInviteButton;
