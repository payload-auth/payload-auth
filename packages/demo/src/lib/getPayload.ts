"use server";

import { getPayload as getPayloadSource } from "payload";
import configPromise from "@payload-config";

const getPayload = () => getPayloadSource({ config: configPromise });

export default getPayload;
