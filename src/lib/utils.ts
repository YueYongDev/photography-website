import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  latitude?: number;
  longitude?: number;
  gpsAltitude?: number;
  dateTimeOriginal?: string;
};

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
export async function getPhotoExif(_file: File): Promise<TExifData> {
 // 这里返回一个空对象或默认值，因为exif-js包未安装
 // 在实际项目中，您可能需要安装exif-js包或使用其他方式获取EXIF信息
 console.warn("EXIF parsing is not available because exif-js package is not installed");
 // 使用_file参数来避免未使用变量的警告
 void _file;
 return {};
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
      
      // 生成blurhash
      // 这里简化处理，实际项目中可能需要使用blurhash库
      const blurhash = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="; // placeholder
      
      URL.revokeObjectURL(objectUrl);
      resolve({
        width,
        height,
        aspectRatio,
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
