"use server";

import configPromise from "@payload-config";
import { getPayloadBetterAuth } from "@payload-better-auth/plugin";
import { MyPlugins } from "@payload-config";

const getPayload = () => getPayloadBetterAuth<MyPlugins>(configPromise);

export default getPayload;
