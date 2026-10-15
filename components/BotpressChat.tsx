import Script from "next/script";

export function BotpressChat() {
  return (
    <>
      <Script
        src="https://cdn.botpress.cloud/webchat/v5.0/inject.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://files.bpcontent.cloud/2026/10/14/22/20261014221830-H22IZ4V9.js"
        strategy="lazyOnload"
      />
    </>
  );
}
