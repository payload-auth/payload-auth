//@ts-nocheck
import { Metadata } from "next";
import {
  generateMetadata,
  type GenerateViewMetadata,
} from "../../utils/generate-metadata";

export const generateVerifyViewMetadata: GenerateViewMetadata = async ({
  config,
  i18n: { t },
}): Promise<Metadata> =>
  generateMetadata({
    serverURL: config.serverURL,
    description: t("authentication:verifyUser"),
    keywords: t("authentication:verify"),
    title: t("authentication:verify"),
    ...(config.admin.meta || {}),
  });
