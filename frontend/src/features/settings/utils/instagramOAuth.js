const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
  "instagram_business_content_publish",
];

const DEFAULT_SETTINGS_PATH = "/creator/settings/social";

export const getInstagramRedirectUri = (fallbackPath = DEFAULT_SETTINGS_PATH) => {
  const configuredRedirect = import.meta.env.VITE_INSTAGRAM_REDIRECT_URI?.trim();

  if (configuredRedirect) {
    return configuredRedirect;
  }

  const path = fallbackPath || window.location.pathname || DEFAULT_SETTINGS_PATH;
  return `${window.location.origin}${path}`;
};

export const buildInstagramAuthUrl = ({ redirectUri, state } = {}) => {
  const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;

  if (!clientId || clientId === "YOUR_INSTAGRAM_CLIENT_ID") {
    throw new Error(
      "Instagram Client ID is missing. Set VITE_INSTAGRAM_CLIENT_ID and redeploy the frontend."
    );
  }

  if (!redirectUri) {
    throw new Error("Instagram redirect URI is missing.");
  }

  const authUrl = new URL("https://www.instagram.com/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", INSTAGRAM_SCOPES.join(","));
  authUrl.searchParams.set("force_authentication", "1");
  authUrl.searchParams.set("enable_fb_login", "0");

  if (state) {
    authUrl.searchParams.set("state", state);
  }

  return authUrl.toString();
};

export const startInstagramOAuth = (options = {}) => {
  const redirectUri = getInstagramRedirectUri(options.path);
  window.location.href = buildInstagramAuthUrl({
    redirectUri,
    state: options.state,
  });
};
