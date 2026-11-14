import { FlaskConical } from "lucide-react";

const ROWS: [string, string][] = [
  ["Phone", "000 000 0000"],
  ["SMS code", "000000"],
  ["Date of birth", "01/01/1901"],
  ["SSN (last 4 / full)", "0000 / 000000000"],
  ["Address line 1", "address_full_match"],
  ["Routing number", "110000000"],
  ["Account number", "000123456789"],
];

export function TestDataHelp() {
  return (
    <aside className="rounded-xl border border-dashed border-[#635BFF]/40 bg-[#635BFF]/5 p-4 text-sm">
      <h2 className="flex items-center gap-2 font-semibold text-[#4b44c9]">
        <FlaskConical className="size-4" /> Sandbox test data
      </h2>
      <p className="mt-1 text-muted-foreground">
        This is Stripe test mode. No real money moves. Use these values during onboarding:
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {ROWS.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-mono text-[13px]">{v}</dd>
          </div>
        ))}
      </dl>
      <a
        href="https://docs.stripe.com/connect/testing"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block font-medium text-[#4b44c9] hover:underline"
      >
        More test data in the Stripe docs →
      </a>
    </aside>
  );
}
