export const ENV = {
  appId: process.env.VITE_APP_ID || "Xa5WK2zgALVZPriP2m7kh2",
  cookieSecret: process.env.JWT_SECRET || "Qo7wFva5x43VQDKMJAtvnk",
  databaseUrl: process.env.DATABASE_URL || 'mysql://3pXYBN7ALdP3R8i.root:BGnF8OX9e1BrMFV0iO77@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/Xa5WK2zgALVZPriP2m7kh2?ssl={"rejectUnauthorized":true}',
  oAuthServerUrl: process.env.OAUTH_SERVER_URL || "https://api.manus.im",
  ownerOpenId: process.env.OWNER_OPEN_ID || "65XVwZ3rvE37UR5wENnpCq",
  ownerName: process.env.OWNER_NAME || "Ayush Patel",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL || "https://forge.manus.ai",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY || "XCP7z79H8uZCpPfd2AMGha",
};
