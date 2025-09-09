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
  { label: "1/8000", value: 0.000125 },
  { label: "1/4000", value: 0.00025 },
  { label: "1/2000", value: 0.0005 },
  { label: "1/1000", value: 0.001 },
  { label: "1/500", value: 0.002 },
  { label: "1/250", value: 0.004 },
  { label: "1/125", value: 0.008 },
  { label: "1/60", value: 1/60 },
  { label: "1/30", value: 1/30 },
  { label: "1/15", value: 1/15 },
  { label: "1/8", value: 0.125 },
  { label: "1/4", value: 0.25 },
  { label: "1/2", value: 0.5 },
  { label: "1\"", value: 1 },
  { label: "2\"", value: 2 },
  { label: "4\"", value: 4 },
  { label: "8\"", value: 8 },
  { label: "15\"", value: 15 },
  { label: "30\"", value: 30 },
];

export function ExposureTimeInput({ value, onChange }: ExposureTimeInputProps) {
  const [inputMode, setInputMode] = useState<"select" | "manual">("select");
  const [manualValue, setManualValue] = useState<string>("");
  const [fractionValue, setFractionValue] = useState<{numerator: string, denominator: string}>({numerator: "", denominator: ""});

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
    return matched ? matched.label : value.toString();
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "manual") {
      setInputMode("manual");
      setManualValue("");
      setFractionValue({numerator: "", denominator: ""});
    } else {
      const numericValue = parseFloat(selectedValue);
      if (!isNaN(numericValue)) {
        onChange(numericValue);
      }
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setManualValue(inputValue);
    
    // 如果是分数形式 (例如: 1/1000)
    if (inputValue.includes("/")) {
      const [numerator, denominator] = inputValue.split("/").map(part => part.trim());
      setFractionValue({numerator, denominator});
      
      if (numerator && denominator && !isNaN(parseFloat(numerator)) && !isNaN(parseFloat(denominator))) {
        const fractionValue = parseFloat(numerator) / parseFloat(denominator);
        onChange(fractionValue);
      } else {
        onChange(null);
      }
    } else if (inputValue === "") {
      onChange(null);
    } else {
      // 直接的数字输入
      const numericValue = parseFloat(inputValue);
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
            <SelectItem value="manual">手动输入</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="输入曝光时间 (如: 1/500 或 0.002)"
            value={manualValue}
            onChange={handleManualChange}
          />
          <button 
            type="button" 
            className="text-sm text-blue-500 hover:underline"
            onClick={() => {
              setInputMode("select");
              setManualValue("");
              setFractionValue({numerator: "", denominator: ""});
            }}
          >
            选择
          </button>
        </div>
      )}
      {inputMode === "manual" && (
        <p className="text-xs text-muted-foreground">
          支持分数形式输入，例如: 1/500, 1/4 等
        </p>
      )}
    </div>
  );
}