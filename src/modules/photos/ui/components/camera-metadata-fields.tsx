"use client";

import * as React from "react";
import { NumericFormat } from "react-number-format";

import { FormControl } from "@/components/ui/form";
import { Input, type InputProps } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  cameraValueKey,
  DEFAULT_CAPTURE_TIMEZONE_OFFSET,
  formatLocalDateTimeInput,
  getCaptureTimeZoneOptions,
  includesCameraPreset,
  parseLocalDateTimeInput,
  type CameraPreset,
} from "@/modules/photos/lib/camera-metadata";
import styles from "./camera-metadata-fields.module.css";

const EMPTY_VALUE = "__not_recorded__";

type FocalLengthInputProps = Omit<
  InputProps,
  "defaultValue" | "onChange" | "type" | "value"
> & {
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
};

export const FocalLengthInput = React.forwardRef<
  HTMLInputElement,
  FocalLengthInputProps
>(({ onChange, value, ...props }, ref) => (
  <NumericFormat
    {...props}
    getInputRef={ref}
    customInput={Input}
    className={styles.numericInput}
    value={value ?? ""}
    valueIsNumericString={false}
    allowNegative={false}
    allowLeadingZeros={false}
    allowedDecimalSeparators={[".", ","]}
    decimalScale={3}
    suffix=" mm"
    inputMode="decimal"
    isAllowed={({ floatValue }) =>
      floatValue === undefined || (floatValue > 0 && floatValue <= 100000)
    }
    onValueChange={({ floatValue }) => onChange(floatValue)}
  />
));
FocalLengthInput.displayName = "FocalLengthInput";

export type CameraPresetGroup = {
  label?: string;
  options: CameraPreset[];
};

type CameraPresetSelectProps = {
  value: number | null | undefined;
  originalValue?: number | null;
  onChange: (value: number | undefined) => void;
  groups: CameraPresetGroup[];
  formatValue: (value: number) => string;
  ariaLabel: string;
  notRecordedLabel: string;
  originalValueLabel: string;
};

export function CameraPresetSelect({
  ariaLabel,
  formatValue,
  groups,
  notRecordedLabel,
  onChange,
  originalValue,
  originalValueLabel,
  value,
}: CameraPresetSelectProps) {
  const allPresets = React.useMemo(
    () => groups.flatMap((group) => group.options),
    [groups],
  );
  const preservedOriginalValue = originalValue ?? value;
  const hasCustomOriginalValue =
    preservedOriginalValue !== null &&
    preservedOriginalValue !== undefined &&
    !includesCameraPreset(allPresets, preservedOriginalValue);
  const selectValue =
    value === null || value === undefined
      ? EMPTY_VALUE
      : cameraValueKey(value);

  return (
    <Select
      value={selectValue}
      onValueChange={(nextValue) =>
        onChange(
          nextValue === EMPTY_VALUE ? undefined : Number(nextValue),
        )
      }
    >
      <FormControl>
        <SelectTrigger className={styles.presetTrigger} aria-label={ariaLabel}>
          <SelectValue>
            {value === null || value === undefined
              ? notRecordedLabel
              : formatValue(value)}
          </SelectValue>
        </SelectTrigger>
      </FormControl>
      <SelectContent className={styles.presetContent} position="popper">
        <SelectItem className={styles.presetItem} value={EMPTY_VALUE}>
          {notRecordedLabel}
        </SelectItem>
        {hasCustomOriginalValue &&
          preservedOriginalValue !== null &&
          preservedOriginalValue !== undefined && (
            <>
              <SelectSeparator className={styles.presetSeparator} />
              <SelectGroup>
                <SelectLabel className={styles.presetLabel}>
                  {originalValueLabel}
                </SelectLabel>
                <SelectItem
                  className={styles.presetItem}
                  value={cameraValueKey(preservedOriginalValue)}
                >
                  {formatValue(preservedOriginalValue)}
                </SelectItem>
              </SelectGroup>
            </>
          )}
        {groups.map((group, groupIndex) => (
          <React.Fragment key={`${group.label ?? "presets"}-${groupIndex}`}>
            <SelectSeparator className={styles.presetSeparator} />
            <SelectGroup>
              {group.label && (
                <SelectLabel className={styles.presetLabel}>
                  {group.label}
                </SelectLabel>
              )}
              {group.options.map((option) => (
                <SelectItem
                  className={styles.presetItem}
                  key={cameraValueKey(option.value)}
                  value={cameraValueKey(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  );
}

type CaptureDateTimeInputProps = Omit<
  InputProps,
  "onChange" | "type" | "value"
> & {
  value: Date | string | null | undefined;
  onChange: (value: Date | undefined) => void;
  timezoneOffsetMinutes?: number;
};

export const CaptureDateTimeInput = React.forwardRef<
  HTMLInputElement,
  CaptureDateTimeInputProps
>(({ onChange, timezoneOffsetMinutes = DEFAULT_CAPTURE_TIMEZONE_OFFSET, value, ...props }, ref) => (
  <Input
    {...props}
    ref={ref}
    className={styles.dateTimeInput}
    type="datetime-local"
    step="1"
    value={formatLocalDateTimeInput(value, timezoneOffsetMinutes)}
    onChange={(event) =>
      onChange(
        parseLocalDateTimeInput(event.target.value, timezoneOffsetMinutes),
      )
    }
  />
));
CaptureDateTimeInput.displayName = "CaptureDateTimeInput";

export function CaptureTimeZoneSelect({
  ariaLabel,
  locale,
  onChange,
  value = DEFAULT_CAPTURE_TIMEZONE_OFFSET,
}: {
  ariaLabel: string;
  locale: "en" | "zh-CN";
  onChange: (value: number) => void;
  value?: number | null;
}) {
  const options = React.useMemo(
    () => getCaptureTimeZoneOptions(locale),
    [locale],
  );
  const selectedValue = value ?? DEFAULT_CAPTURE_TIMEZONE_OFFSET;
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? options[0];

  return (
    <Select
      value={String(selectedValue)}
      onValueChange={(nextValue) => onChange(Number(nextValue))}
    >
      <FormControl>
        <SelectTrigger className={styles.timeZoneTrigger} aria-label={ariaLabel}>
          <SelectValue>{selectedOption.label}</SelectValue>
        </SelectTrigger>
      </FormControl>
      <SelectContent className={styles.presetContent} position="popper">
        {options.map((option) => (
          <SelectItem
            className={styles.presetItem}
            key={option.value}
            value={String(option.value)}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
