import { RotateCcwIcon, SaveIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  endpointConfigSchema,
  type EndpointConfig,
  normalizeEndpointConfig,
} from "@/lib/chat-config";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export function ChatConfigSheet({
  config,
  onOpenChange,
  onReset,
  onSave,
  open,
}: {
  config: EndpointConfig;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
  onSave: (config: EndpointConfig) => void;
  open: boolean;
}) {
  const [draft, setDraft] = useState(config);

  useEffect(() => {
    if (open) {
      setDraft(config);
    }
  }, [config, open]);

  const updateField = <Key extends keyof EndpointConfig>(
    field: Key,
    value: EndpointConfig[Key],
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const normalizedConfig = normalizeEndpointConfig(draft);
    const result = endpointConfigSchema.safeParse(normalizedConfig);

    if (!result.success) {
      const issue = result.error.issues[0];
      toast.error(issue?.message ?? "Settings are invalid.");
      return;
    }

    onSave(result.data);
    onOpenChange(false);
    toast.success("Settings saved in this browser.");
  };

  if (!open) {
    return null;
  }

  return (
    <div
      /*
       * Scrim uses a tinted on-surface wash (not pure black) + soft blur,
       * so the workspace palette still bleeds through.
       */
      className="fixed inset-0 z-50 flex justify-end bg-[color-mix(in_oklab,var(--on-surface)_35%,transparent)] p-3 backdrop-blur-sm md:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-xl rounded-[28px] bg-surface-container-lowest p-5 shadow-[var(--shadow-lift)] md:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="endpoint-settings-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.02em]" id="endpoint-settings-title">
              Endpoint settings
            </h2>
            <p className="text-sm leading-6 text-on-surface-variant">
              These settings stay in your browser so you can wire a real backend later without auth
              or database setup.
            </p>
          </div>

          <Button
            aria-label="Close settings"
            onClick={() => onOpenChange(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <XIcon />
          </Button>
        </div>

        <div className="grid gap-5 py-6">
          <Field htmlFor="endpoint-url" label="Endpoint URL">
            <Input
              id="endpoint-url"
              onChange={(event) => updateField("endpointUrl", event.target.value)}
              placeholder="https://api.openai.com/v1/chat/completions"
              value={draft.endpointUrl}
            />
          </Field>

          <Field htmlFor="api-key" label="API Key">
            <Input
              id="api-key"
              onChange={(event) => updateField("apiKey", event.target.value)}
              placeholder="Optional for local or proxy endpoints"
              type="password"
              value={draft.apiKey}
            />
          </Field>

          <Field htmlFor="model-name" label="Model">
            <Input
              id="model-name"
              onChange={(event) => updateField("model", event.target.value)}
              placeholder="gpt-4.1-mini"
              value={draft.model}
            />
          </Field>

          <Field htmlFor="system-prompt" label="System Prompt">
            <Textarea
              id="system-prompt"
              onChange={(event) => updateField("systemPrompt", event.target.value)}
              placeholder="Optional instructions to send with every request"
              rows={6}
              value={draft.systemPrompt}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            onClick={() => {
              onReset();
              setDraft(normalizeEndpointConfig(undefined));
            }}
            type="button"
            variant="ghost"
          >
            <RotateCcwIcon />
            Reset settings
          </Button>

          <Button onClick={handleSave} type="button">
            <SaveIcon />
            Save settings
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium leading-none text-foreground" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
