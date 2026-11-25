import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { OnboardingPreview } from '@/components/onboarding/onboarding-preview';

export default async function OnboardingPage() {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <NextIntlClientProvider locale={locale} messages={{ onboarding: messages.onboarding }}>
      <main lang={locale}>
        <OnboardingPreview />
      </main>
    </NextIntlClientProvider>
  );
}
