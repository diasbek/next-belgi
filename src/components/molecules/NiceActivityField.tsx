"use client";

import { useCallback, useMemo, useRef } from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import type { GroupBase, StylesConfig } from "react-select";
import type { Locale } from "@/i18n/config";
import {
  customOptionValue,
  parseCustomOptionValue,
  searchNiceTerms,
  type ActivityOption,
} from "@/lib/nice";

type SelectOption = {
  value: string;
  label: string;
  classNumber?: number;
  kind: "term" | "custom";
};

function toSelectOption(opt: ActivityOption): SelectOption {
  if (opt.kind === "term") {
    return {
      value: opt.value,
      label: opt.label,
      classNumber: opt.classNumber,
      kind: "term",
    };
  }
  return {
    value: opt.value,
    label: opt.label,
    kind: "custom",
  };
}

function fromSelectOption(opt: SelectOption): ActivityOption {
  if (opt.kind === "custom" || parseCustomOptionValue(opt.value)) {
    return {
      kind: "custom",
      value: opt.value.startsWith("__custom__:")
        ? opt.value
        : customOptionValue(opt.label),
      label: opt.label,
    };
  }
  return {
    kind: "term",
    value: opt.value,
    label: opt.label,
    classNumber: opt.classNumber ?? 0,
  };
}

function buildSelectStyles(
  compact: boolean,
): StylesConfig<SelectOption, true, GroupBase<SelectOption>> {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: compact ? "3.5rem" : "var(--tap-min)",
      height: compact ? "3.5rem" : undefined,
      borderRadius: compact ? "var(--radius-pill)" : "var(--radius-md)",
      borderColor: state.isFocused
        ? "color-mix(in srgb, var(--color-ink) 35%, transparent)"
        : "color-mix(in srgb, var(--color-ink) 15%, transparent)",
      boxShadow: state.isFocused
        ? "0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent)"
        : "inset 0 1px 0 rgb(26 28 24 / 0.03)",
      borderWidth: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      flexWrap: "nowrap",
      cursor: "text",
      ":hover": {
        borderColor: state.isFocused
          ? "color-mix(in srgb, var(--color-ink) 35%, transparent)"
          : "color-mix(in srgb, var(--color-ink) 25%, transparent)",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: compact ? "0 1.15rem" : "6px 12px",
      gap: 4,
      flexWrap: compact ? "nowrap" : "wrap",
      alignItems: "center",
      overflow: "hidden",
      ...(compact
        ? {
            height: "100%",
            display: "flex",
          }
        : null),
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#f4fbe6",
      borderRadius: 8,
      border: "1px solid #b8d96a",
      margin: compact ? "0 2px" : base.margin,
      maxWidth: compact ? "9rem" : undefined,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "var(--color-ink, #1a1c18)",
      fontSize: "0.8125rem",
      padding: "2px 6px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "rgb(26 28 24 / 0.55)",
      ":hover": { backgroundColor: "#dfff9e", color: "#1a1c18" },
    }),
    placeholder: (base) => ({
      ...base,
      color: "color-mix(in srgb, var(--color-ink) 40%, transparent)",
      fontSize: compact ? "1rem" : "0.9375rem",
      margin: 0,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
      ...(compact
        ? {
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            left: "1.15rem",
            right: "1.15rem",
            lineHeight: 1.25,
          }
        : null),
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      outline: "none",
      boxShadow: "none",
      ...(compact
        ? {
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
          }
        : null),
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 12,
      overflow: "hidden",
      zIndex: 40,
      border: "1px solid rgb(26 28 24 / 0.08)",
      boxShadow: "0 8px 24px rgb(26 28 24 / 0.08)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f4fbe6" : "#fff",
      color: "#1a1c18",
      fontSize: "0.875rem",
      cursor: "pointer",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    indicatorsContainer: (base) => ({
      ...base,
      padding: compact ? "0 0.35rem" : base.padding,
      alignSelf: "center",
      height: compact ? "100%" : undefined,
    }),
    dropdownIndicator: (base) => ({ ...base, color: "rgb(26 28 24 / 0.55)" }),
    clearIndicator: (base) => ({ ...base, color: "rgb(26 28 24 / 0.55)" }),
  };
}

export function NiceActivityField({
  locale,
  value,
  onChange,
  placeholder,
  createLabel,
  noOptionsMessage,
  loadingMessage,
  inputId,
  instanceId,
  compact = false,
}: {
  locale: Locale;
  value: ActivityOption[];
  onChange: (next: ActivityOption[]) => void;
  placeholder: string;
  createLabel: string;
  noOptionsMessage: string;
  loadingMessage: string;
  inputId?: string;
  instanceId?: string;
  /** Match the compact check-form row (h-14, same radius as text fields). */
  compact?: boolean;
}) {
  const styles = useMemo(() => buildSelectStyles(compact), [compact]);
  const selectValue = useMemo(() => value.map(toSelectOption), [value]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadOptions = useCallback(
    (input: string): Promise<SelectOption[]> => {
      const q = input.trim();
      if (q.length < 2) return Promise.resolve([]);
      return new Promise((resolve) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          void searchNiceTerms(locale, q, 40).then((terms) => {
            resolve(
              terms.map((t) => ({
                value: t.id,
                label: t.label,
                classNumber: t.classNumber,
                kind: "term" as const,
              })),
            );
          });
        }, 150);
      });
    },
    [locale],
  );

  return (
    <AsyncCreatableSelect<SelectOption, true>
      inputId={inputId}
      instanceId={instanceId}
      isMulti
      cacheOptions
      defaultOptions={false}
      loadOptions={loadOptions}
      value={selectValue}
      onChange={(next) => {
        const list = (next ? [...next] : []).map(fromSelectOption);
        onChange(list);
      }}
      placeholder={placeholder}
      styles={styles}
      classNamePrefix="nice-activity"
      formatCreateLabel={(input) =>
        createLabel.replace("{input}", input.trim())
      }
      isValidNewOption={(input) => input.trim().length >= 2}
      getNewOptionData={(input, label) => ({
        value: customOptionValue(input.trim()),
        label: typeof label === "string" ? label : input.trim(),
        kind: "custom",
      })}
      noOptionsMessage={({ inputValue }) =>
        inputValue.trim().length < 2 ? null : noOptionsMessage
      }
      loadingMessage={() => loadingMessage}
      formatOptionLabel={(opt) =>
        opt.kind === "term" && opt.classNumber ? (
          <span className="flex items-baseline justify-between gap-3">
            <span className="min-w-0">{opt.label}</span>
            <span className="shrink-0 text-xs font-medium text-ink-muted">
              {locale === "en"
                ? `Cl. ${opt.classNumber}`
                : locale === "uz"
                  ? `Sinf ${opt.classNumber}`
                  : `Кл. ${opt.classNumber}`}
            </span>
          </span>
        ) : (
          opt.label
        )
      }
      filterOption={() => true}
      components={{
        DropdownIndicator: null,
      }}
    />
  );
}
