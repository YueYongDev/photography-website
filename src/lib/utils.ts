import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { encode } from "blurhash";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function snakeCaseToTitle(str: string) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join(" ");
}

/**
 * 清理图片URL，移除重复的查询参数
 * @param url 图片URL
 * @returns 清理后的URL
 */
export function cleanImageUrl(url: string | null | undefined): string {
  // 如果URL为空，返回默认占位图
  if (!url) return "/placeholder.svg";
  
  try {
    // 解析URL
    const urlObj = new URL(url);
    
    // 获取查询参数
    const params = new URLSearchParams(urlObj.search);
    
    // 如果有imageView2参数，只保留第一个
    const imageView2Params = params.getAll("imageView2");
    if (imageView2Params.length > 1) {
      // 清空所有imageView2参数
      params.delete("imageView2");
      // 只添加第一个参数
      params.append("imageView2", imageView2Params[0]);
    }
    
    // 重新构建URL
    urlObj.search = params.toString();
    return urlObj.toString();
  } catch (error) {
    // 如果URL解析失败，返回原始URL或默认占位图
    console.warn("Failed to parse image URL:", url, error);
    return url || "/placeholder.svg";
  }
}

// 图片EXIF数据类型
export type TExifData = {
  make?: string;
  model?: string;
  lensModel?: string;
  focalLength?: number;
  focalLength35mm?: number;
  fNumber?: number;
  iso?: number;
  exposureTime?: number;
  exposureCompensation?: number;
  latitude?: number[]; // GPS坐标以数组形式存储
  longitude?: number[]; // GPS坐标以数组形式存储
  gpsAltitude?: number;
  dateTimeOriginal?: string;
};

// 图片EXIF表单数据类型（用于表单提交）
export type TExifFormData = {
  make?: string;
  model?: string;
  lensModel?: string;
  focalLength?: number;
  focalLength35mm?: number;
  fNumber?: number;
  iso?: number;
  exposureTime?: number;
  exposureCompensation?: number;
  latitude?: string; // 表单中使用字符串格式
  longitude?: string; // 表单中使用字符串格式
  gpsAltitude?: number;
  dateTimeOriginal?: string;
};

/**
 * 将GPS坐标数组转换为十进制度数格式
 * @param gpsCoordinate GPS坐标数组 [度, 分, 秒]
 * @returns 十进制度数
 */
export function convertGPSCoordinate(gpsCoordinate: number[] | undefined): number | undefined {
  if (!gpsCoordinate || gpsCoordinate.length < 3) {
    return undefined;
  }
  
  const [degrees, minutes, seconds] = gpsCoordinate;
  const sign = degrees < 0 ? -1 : 1; // 确定符号
  return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
}

/**
 * 将GPS坐标数组转换为字符串格式
 * @param gpsCoordinate GPS坐标数组 [度, 分, 秒]
 * @returns 格式化的坐标字符串
 */
export function formatGPSCoordinateToString(gpsCoordinate: number[] | undefined): string | undefined {
  const decimalDegrees = convertGPSCoordinate(gpsCoordinate);
  if (decimalDegrees === undefined) {
    return undefined;
  }
  
  return decimalDegrees.toString();
}

/**
 * 将字符串格式的GPS坐标转换为十进制度数格式
 * @param gpsCoordinateString 字符串格式的GPS坐标
 * @returns 十进制度数
 */
export function convertGPSCoordinateFromString(gpsCoordinateString: string | undefined): number | undefined {
  if (!gpsCoordinateString) {
    return undefined;
  }
  
  const num = parseFloat(gpsCoordinateString);
  return isNaN(num) ? undefined : num;
}

/**
 * 将原始EXIF数据转换为表单数据
 * @param exifData 原始EXIF数据
 * @returns 用于表单的EXIF数据
 */
export function convertExifToFormData(exifData: TExifData): TExifFormData {
  return {
    ...exifData,
    latitude: formatGPSCoordinateToString(exifData.latitude),
    longitude: formatGPSCoordinateToString(exifData.longitude),
  };
}

// 图片信息类型
export type TImageInfo = {
  width: number;
  height: number;
  aspectRatio: number;
  blurhash: string;
};

/**
 * 获取照片的EXIF信息
 * @param file 照片文件
 * @returns EXIF数据
 */
export async function getPhotoExif(file: File): Promise<TExifData> {
  try {
    // 动态导入 exifr 库以减少初始包大小
    const exifr = (await import('exifr')).default;
    
    // 将 File 对象转换为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // 解析 EXIF 数据
    const exifData = await exifr.parse(arrayBuffer);
    
    if (!exifData) {
      return {};
    }
    
    // 提取所需的 EXIF 信息
    return {
      make: exifData.Make,
      model: exifData.Model,
      lensModel: exifData.LensModel,
      focalLength: exifData.FocalLength,
      focalLength35mm: exifData.FocalLengthIn35mmFilm,
      fNumber: exifData.FNumber,
      iso: exifData.ISO,
      exposureTime: exifData.ExposureTime,
      exposureCompensation: exifData.ExposureCompensation,
      latitude: exifData.GPSLatitude,
      longitude: exifData.GPSLongitude,
      gpsAltitude: exifData.GPSAltitude,
      dateTimeOriginal: exifData.DateTimeOriginal,
    };
  } catch (error) {
    console.warn("Failed to parse EXIF data:", error);
    // 如果解析失败，返回空对象
    return {};
  }
}

/**
 * 获取图片信息
 * @param file 图片文件
 * @returns 图片信息
 */
export async function getImageInfo(file: File): Promise<TImageInfo> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = function () {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = width / height;
      
      // 创建 canvas 来获取像素数据
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // 为了性能考虑，将图片缩放到较小的尺寸
        const maxSize = 100;
        const scale = Math.min(maxSize / width, maxSize / height);
        canvas.width = Math.max(1, Math.floor(width * scale));
        canvas.height = Math.max(1, Math.floor(height * scale));
        
        // 绘制缩放后的图片
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 获取像素数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // 生成 blurhash
        const blurhash = encode(imageData.data, imageData.width, imageData.height, 4, 4);
        
        URL.revokeObjectURL(objectUrl);
        resolve({
          width,
          height,
          aspectRatio,
          blurhash,
        });
      } else {
        // 如果无法获取 canvas 上下文，使用默认 blurhash
        const blurhash = "LEHV6nWB2yk8pyo0adR*.7kCMdnj"; // 默认 blurhash
        URL.revokeObjectURL(objectUrl);
        resolve({
          width,
          height,
          aspectRatio,
          blurhash,
        });
      }
    };
    
    img.onerror = function () {
      // 如果图片加载失败，使用默认 blurhash
      const blurhash = "LEHV6nWB2yk8pyo0adR*.7kCMdnj"; // 默认 blurhash
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: 0,
        height: 0,
        aspectRatio: 1,
        blurhash,
      });
    };
    
    img.src = objectUrl;
  });
}

/**
 * 格式化曝光时间
 * @param exposureTime 曝光时间（秒）
 * @returns 格式化的曝光时间字符串
 */
export function formatExposureTime(exposureTime: number): string {
  if (exposureTime >= 1) {
    return exposureTime.toFixed(1) + "s";
  } else if (exposureTime >= 1 / 2) {
    return "1/" + Math.round(1 / exposureTime) + "s";
  } else {
    return exposureTime.toFixed(3) + "s";
  }
}

/**
 * 格式化GPS坐标
 * @param lat 纬度
 * @param lng 经度
 * @returns 格式化的坐标字符串
 */
export function formatGPSCoordinates(lat: number, lng: number): string {
  const latDirection = lat >= 0 ? "N" : "S";
  const lngDirection = lng >= 0 ? "E" : "W";
  
  const latDegrees = Math.abs(lat);
  const lngDegrees = Math.abs(lng);
  
  return `${latDegrees.toFixed(6)}°${latDirection}, ${lngDegrees.toFixed(6)}°${lngDirection}`;
}
