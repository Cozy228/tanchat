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
      className="fixed inset-0 z-50 flex justify-end bg-black/40 p-3 backdrop-blur-sm md:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-xl rounded-3xl border bg-background p-5 shadow-2xl md:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="endpoint-settings-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-semibold text-2xl" id="endpoint-settings-title">
              Endpoint settings
            </h2>
            <p className="text-muted-foreground text-sm">
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
          <div className="grid gap-2">
            <label
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="endpoint-url"
            >
              Endpoint URL
            </label>
            <Input
              id="endpoint-url"
              onChange={(event) => updateField("endpointUrl", event.target.value)}
              placeholder="https://api.openai.com/v1/chat/completions"
              value={draft.endpointUrl}
            />
          </div>

          <div className="grid gap-2">
            <label
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="api-key"
            >
              API Key
            </label>
            <Input
              id="api-key"
              onChange={(event) => updateField("apiKey", event.target.value)}
              placeholder="Optional for local or proxy endpoints"
              type="password"
              value={draft.apiKey}
            />
          </div>

          <div className="grid gap-2">
            <label
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="model-name"
            >
              Model
            </label>
            <Input
              id="model-name"
              onChange={(event) => updateField("model", event.target.value)}
              placeholder="gpt-4.1-mini"
              value={draft.model}
            />
          </div>

          <div className="grid gap-2">
            <label
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="system-prompt"
            >
              System Prompt
            </label>
            <Textarea
              id="system-prompt"
              onChange={(event) => updateField("systemPrompt", event.target.value)}
              placeholder="Optional instructions to send with every request"
              rows={6}
              value={draft.systemPrompt}
            />
          </div>
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
