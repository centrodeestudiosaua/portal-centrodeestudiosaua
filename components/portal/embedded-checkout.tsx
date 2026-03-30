"use client";

import { useMemo } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import type { PurchaseOption } from "@/lib/portal/data";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export function EmbeddedPortalCheckout({
  courseId,
  courseSlug,
  option,
}: {
  courseId: string;
  courseSlug: string;
  option: PurchaseOption;
}) {
  const fetchClientSecret = useMemo(
    () => async () => {
      const response = await fetch("/api/checkout/embedded-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          courseSlug,
          priceId: option.priceId,
          mode: option.mode,
          purchaseOption: option.code,
        }),
      });

      const payload = (await response.json()) as {
        clientSecret?: string;
        error?: string;
      };

      if (!response.ok || !payload.clientSecret) {
        throw new Error(payload.error || "No se pudo iniciar el checkout");
      }

      return payload.clientSecret;
    },
    [courseId, courseSlug, option.code, option.mode, option.priceId],
  );

  if (!stripePromise) {
    return (
      <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Falta configurar `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` para mostrar la
        terminal de pago embebida.
      </div>
    );
  }

  return (
    <EmbeddedCheckoutProvider
      key={`${option.code}-${option.priceId}`}
      stripe={stripePromise}
      options={{ fetchClientSecret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
