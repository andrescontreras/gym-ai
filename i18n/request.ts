import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "es" ? "es" : "en";
  const [common, auth, onboarding, program, session, progress, substitution] =
    await Promise.all([
      import(`../messages/${locale}/common.json`),
      import(`../messages/${locale}/auth.json`),
      import(`../messages/${locale}/onboarding.json`),
      import(`../messages/${locale}/program.json`),
      import(`../messages/${locale}/session.json`),
      import(`../messages/${locale}/progress.json`),
      import(`../messages/${locale}/substitution.json`),
    ]);

  return {
    locale,
    messages: {
      common: common.default,
      auth: auth.default,
      onboarding: onboarding.default,
      program: program.default,
      session: session.default,
      progress: progress.default,
      substitution: substitution.default,
    },
  };
});
