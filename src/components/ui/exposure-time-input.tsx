import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface ExposureTimeInputProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}

const commonExposureTimes = [
  { label: "1/8000s", value: 0.000125 },
  { label: "1/4000s", value: 0.00025 },
  { label: "1/2000s", value: 0.0005 },
  { label: "1/1000s", value: 0.001 },
  { label: "1/500s", value: 0.002 },
  { label: "1/250s", value: 0.004 },
  { label: "1/125s", value: 0.008 },
  { label: "1/60s", value: 1 / 60 },
  { label: "1/30s", value: 1 / 30 },
  { label: "1/15s", value: 1 / 15 },
  { label: "1/8s", value: 0.125 },
  { label: "1/4s", value: 0.25 },
  { label: "1/2s", value: 0.5 },
  { label: "1s", value: 1 },
  { label: "2s", value: 2 },
  { label: "4s", value: 4 },
  { label: "8s", value: 8 },
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
];

export function ExposureTimeInput({ value, onChange }: ExposureTimeInputProps) {
  const [inputMode, setInputMode] = useState<"select" | "manual">("select");
  const [manualValue, setManualValue] = useState<string>("");

  // 初始化值
  useEffect(() => {
    if (value !== undefined && value !== null) {
      // 检查是否是常见值
      const isCommonValue = commonExposureTimes.some(et => Math.abs(et.value - value) < 0.000001);
      if (isCommonValue) {
        setInputMode("select");
      } else {
        setInputMode("manual");
        setManualValue(value.toString());
      }
    }
  }, [value]);

  // 找到与当前值匹配的常见曝光时间标签
  const getCurrentValueLabel = () => {
    if (value === undefined || value === null) return "";
    const matched = commonExposureTimes.find(et => Math.abs(et.value - value) < 0.000001);
    return matched ? matched.value.toString() : value.toString();
  };

  // 找到与当前值匹配的常见曝光时间标签文本
  const getCurrentValueLabelText = () => {
    if (value === undefined || value === null) return "";
    const matched = commonExposureTimes.find(et => Math.abs(et.value - value) < 0.000001);
    if (matched) return matched.label;

    if (value > 0 && value < 1) {
      const denominator = Math.round(1 / value);
      if (Math.abs(1 / denominator - value) < 0.0005) {
        return `1/${denominator}s`;
      }
    }

    return `${value}s`;
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "manual") {
      setInputMode("manual");
      setManualValue("");
    } else {
      const numericValue = parseFloat(selectedValue);
      if (!isNaN(numericValue)) {
        onChange(numericValue);
      }
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const normalizedValue = inputValue.trim().toLowerCase().replace(/\s+/g, "").replace(/["”″]/g, "s");
    const cleanValue = normalizedValue.endsWith("s") ? normalizedValue.slice(0, -1) : normalizedValue;
    setManualValue(inputValue);
    
    // 如果是分数形式 (例如: 1/1000)
    if (cleanValue.includes("/")) {
      const [numerator, denominator] = cleanValue.split("/").map(part => part.trim());
      
      if (numerator && denominator && !isNaN(parseFloat(numerator)) && !isNaN(parseFloat(denominator))) {
        const fractionValue = parseFloat(numerator) / parseFloat(denominator);
        onChange(fractionValue);
      } else {
        onChange(null);
      }
    } else if (cleanValue === "") {
      onChange(null);
    } else {
      // 直接的数字输入
      const numericValue = parseFloat(cleanValue);
      if (!isNaN(numericValue)) {
        onChange(numericValue);
      } else {
        onChange(null);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {inputMode === "select" ? (
        <Select
          value={getCurrentValueLabel()}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择曝光时间">
              {getCurrentValueLabelText()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {commonExposureTimes.map((et) => (
              <SelectItem key={et.label} value={et.value.toString()}>
                {et.label}
              </SelectItem>
            ))}
            <SelectItem value="manual">Manual input</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g. 1/200s or 0.005"
            value={manualValue}
            onChange={handleManualChange}
          />
          <button
            type="button"
            className="text-sm text-blue-500 hover:underline"
            onClick={() => {
              setInputMode("select");
              setManualValue("");
            }}
          >
            选择
          </button>
        </div>
      )}
      {inputMode === "manual" && (
        <p className="text-xs text-muted-foreground">
          Supports inputs like 1/200s, 1/2s, 2s, or 0.005
        </p>
      )}
    </div>
  );
}
